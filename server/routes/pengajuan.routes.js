// server/routes/pengajuan.routes.js
// Dipasang di server.js: app.use('/api/pengajuan', require('./routes/pengajuan.routes'));
const router = require('express').Router();
const prisma = require('../config/prisma');
const { verifyToken, adminOnly, isAdmin } = require('../middleware/auth');

const nz = (v) => (v === '' || v === undefined ? null : v);
const toDateOrNull = (v) => {
  if (v === '' || v === undefined || v === null) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const APP_REQUIRED = ['kategori', 'tanggal_pengajuan', 'nama_alat', 'serial_number', 'model',
  'penggunaan', 'penempatan', 'kategori_alat', 'klasifikasi', 'ttd_pemohon'];

// Serialize Prisma row (camelCase) -> snake_case agar frontend lama tetap jalan.
function toSnake(p) {
  if (!p) return p;
  return {
    ...p,
    alat_id: p.alatId,
    tanggal_pengajuan: p.tanggalPengajuan,
    nama_alat: p.namaAlat,
    serial_number: p.serialNumber,
    range_alat: p.rangeAlat,
    kategori_alat: p.kategoriAlat,
    alasan_perubahan: p.alasanPerubahan,
    ttd_pemohon: p.ttdPemohon,
    control_no: p.controlNo,
    line_name: p.lineName,
    kode_line: p.kodeLine,
    ttd_penerima: p.ttdPenerima,
    tanggal_kalibrasi: p.tanggalKalibrasi,
    alasan_ng: p.alasanNg,
    flow_process: p.flowProcess,
    ttd_diterima_oleh: p.ttdDiterimaOleh,
    catatan_serah: p.catatanSerah,
    ttd_diserahkan_oleh: p.ttdDiserahkanOleh,
    reviewed_by: p.reviewedBy,
    reviewed_at: p.reviewedAt,
    created_at: p.createdAt,
  };
}

const wrap = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (e) { console.error(e); res.status(500).json({ message: 'Kesalahan server.' }); }
};

router.use(verifyToken);

// Admin: semua pengajuan (?status=pending). User: hanya pengajuan miliknya.
router.get('/', wrap(async (req, res) => {
  const where = {};
  if (!isAdmin(req.user)) where.pemohon = req.user.username;
  if (req.query.status) where.status = req.query.status;
  const rows = await prisma.pengajuan.findMany({ where, orderBy: { id: 'desc' } });
  res.json(rows.map(toSnake));
}));

// User: kirim pengajuan -> status pending
router.post('/', wrap(async (req, res) => {
  const b = req.body;
  const miss = APP_REQUIRED.filter((k) => !b[k] || !String(b[k]).trim());
  if (b.kategori === 'cancellation' && !b.alat_id) miss.push('alat_id');
  if (miss.length) return res.status(400).json({ message: 'Data belum lengkap: ' + miss.join(', ') });

  const created = await prisma.pengajuan.create({
    data: {
      kategori: b.kategori,
      alatId: b.alat_id ? Number(b.alat_id) : null,
      tanggalPengajuan: toDateOrNull(b.tanggal_pengajuan),
      maker: nz(b.maker),
      namaAlat: b.nama_alat,
      serialNumber: b.serial_number,
      model: b.model,
      akurasi: nz(b.akurasi),
      rangeAlat: nz(b.range_alat),
      setting: nz(b.setting),
      penggunaan: nz(b.penggunaan),
      penempatan: nz(b.penempatan),
      kategoriAlat: nz(b.kategori_alat),
      klasifikasi: nz(b.klasifikasi),
      alasanPerubahan: nz(b.alasan_perubahan),
      dokumen: nz(b.dokumen),
      ttdPemohon: nz(b.ttd_pemohon),
      pemohon: req.user.username,
    },
  });
  res.status(201).json({ message: 'Pengajuan terkirim dan menunggu persetujuan admin.', id: created.id });
}));

// Admin: isi bagian kalibrasi + serah terima, lalu ACC / tolak
router.put('/:id/review', adminOnly, wrap(async (req, res) => {
  const b = req.body;
  const id = Number(req.params.id);
  const p = await prisma.pengajuan.findFirst({ where: { id, status: 'pending' } });
  if (!p) return res.status(404).json({ message: 'Pengajuan tidak ditemukan atau sudah diproses.' });
  if (!b.judgement) return res.status(400).json({ message: 'Judgement wajib diisi.' });

  const ok = b.judgement === 'OK';
  if (!ok && !b.alasan_ng) return res.status(400).json({ message: 'Alasan NG / Cancel wajib diisi.' });
  if (ok && p.kategori === 'registration') {
    const miss = ['control_no', 'tipe', 'grp', 'line_name'].filter((k) => !b[k]);
    if (miss.length) return res.status(400).json({ message: 'Lengkapi dulu: ' + miss.join(', ') });
  }

  const normalizeTipe = (v) => {
    const s = String(v || '').toLowerCase();
    if (s === 'non-torque' || s === 'non_torque') return 'non_torque';
    return s || null;
  };

  await prisma.$transaction(async (tx) => {
    await tx.pengajuan.update({
      where: { id: p.id },
      data: {
        dept: nz(b.dept),
        kelengkapan: nz(b.kelengkapan),
        controlNo: nz(b.control_no),
        tipe: nz(b.tipe),
        grp: nz(b.grp),
        lineName: nz(b.line_name),
        kodeLine: nz(b.kode_line),
        catatan: nz(b.catatan),
        ttdPenerima: nz(b.ttd_penerima),
        kalibrator: nz(b.kalibrator),
        tanggalKalibrasi: toDateOrNull(b.tanggal_kalibrasi),
        judgement: nz(b.judgement),
        alasanNg: nz(b.alasan_ng),
        flowProcess: nz(b.flow_process),
        ttdDiterimaOleh: nz(b.ttd_diterima_oleh),
        catatanSerah: nz(b.catatan_serah),
        ttdDiserahkanOleh: nz(b.ttd_diserahkan_oleh),
        status: ok ? 'approved' : 'rejected',
        reviewedBy: req.user.username,
        reviewedAt: new Date(),
      },
    });

    if (ok && p.kategori === 'registration') {
      // Masuk ke master data. Kalau control number sudah ada -> data lama diperbarui.
      await tx.alatUkur.upsert({
        where: { controlNumber: b.control_no },
        create: {
          namaAlat: p.namaAlat,
          controlNumber: b.control_no,
          model: p.model,
          serialNumber: p.serialNumber,
          settingNm: p.setting,
          rangeAlat: p.rangeAlat,
          akurasi: p.akurasi,
          process: p.penggunaan || '-',
          grp: b.grp,
          lineName: b.line_name,
          kodeLine: nz(b.kode_line),
          lokasi: p.penempatan || '-',
          maker: p.maker,
          tipe: normalizeTipe(b.tipe) || 'torque',
          status: 'active',
        },
        update: {
          namaAlat: p.namaAlat,
          model: p.model,
          serialNumber: p.serialNumber,
          settingNm: p.setting,
          rangeAlat: p.rangeAlat,
          akurasi: p.akurasi,
          process: p.penggunaan || '-',
          grp: b.grp,
          lineName: b.line_name,
          kodeLine: nz(b.kode_line),
          lokasi: p.penempatan || '-',
          maker: p.maker,
          tipe: normalizeTipe(b.tipe) || 'torque',
          status: 'active',
        },
      });
    }

    if (ok && p.kategori === 'cancellation' && p.alatId) {
      await tx.alatUkur.update({ where: { id: p.alatId }, data: { status: 'cancelled' } });
      await tx.riwayatPembatalan.create({
        data: {
          alatId: p.alatId,
          alasan: p.alasanPerubahan,
          dibatalkanOleh: req.user.username,
        },
      });
    }
  });

  res.json({ message: ok ? 'Pengajuan disetujui dan data masuk ke master.' : 'Pengajuan ditolak.' });
}));

module.exports = router;
