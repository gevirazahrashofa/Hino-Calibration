// server/routes/pengajuan.routes.js
// Pasang di server.js: app.use('/api/pengajuan', require('./routes/pengajuan.routes'));
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // pool mysql2/promise

// Sama seperti alat-ukur.routes.js; ganti dengan middleware/auth.js Anda bila sudah ada.
function auth(req, res, next) {
  try {
    req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ message: 'Sesi habis, silakan login ulang.' }); }
}
const isAdmin = (u) => String(u.role).toLowerCase() === 'admin';
const adminOnly = (req, res, next) => isAdmin(req.user) ? next() : res.status(403).json({ message: 'Hanya admin.' });
const nz = (v) => (v === '' || v === undefined ? null : v);

const APPLICANT = ['kategori', 'alat_id', 'tanggal_pengajuan', 'maker', 'nama_alat', 'serial_number', 'model',
  'akurasi', 'range_alat', 'setting', 'penggunaan', 'penempatan', 'kategori_alat', 'klasifikasi',
  'alasan_perubahan', 'dokumen', 'ttd_pemohon'];
const APP_REQUIRED = ['kategori', 'tanggal_pengajuan', 'nama_alat', 'serial_number', 'model',
  'penggunaan', 'penempatan', 'kategori_alat', 'klasifikasi', 'ttd_pemohon'];
const REVIEW = ['dept', 'kelengkapan', 'control_no', 'tipe', 'grp', 'line_name', 'kode_line', 'catatan',
  'ttd_penerima', 'kalibrator', 'tanggal_kalibrasi', 'judgement', 'alasan_ng', 'flow_process',
  'ttd_diterima_oleh', 'catatan_serah', 'ttd_diserahkan_oleh'];

const wrap = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (e) { console.error(e); res.status(500).json({ message: 'Kesalahan server.' }); }
};

router.use(auth);

// Admin: semua pengajuan (?status=pending). User: hanya pengajuan miliknya.
router.get('/', wrap(async (req, res) => {
  let sql = 'SELECT * FROM pengajuan WHERE 1=1';
  const p = [];
  if (!isAdmin(req.user)) { sql += ' AND pemohon = ?'; p.push(req.user.username); }
  if (req.query.status) { sql += ' AND status = ?'; p.push(req.query.status); }
  const [rows] = await db.query(sql + ' ORDER BY id DESC', p);
  res.json(rows);
}));

// User: kirim pengajuan -> status pending
router.post('/', wrap(async (req, res) => {
  const b = req.body;
  const miss = APP_REQUIRED.filter((k) => !b[k] || !String(b[k]).trim());
  if (b.kategori === 'cancellation' && !b.alat_id) miss.push('alat_id');
  if (miss.length) return res.status(400).json({ message: 'Data belum lengkap: ' + miss.join(', ') });

  const cols = [...APPLICANT, 'pemohon'];
  await db.query(`INSERT INTO pengajuan (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
    [...APPLICANT.map((k) => nz(b[k])), req.user.username]);
  res.status(201).json({ message: 'Pengajuan terkirim dan menunggu persetujuan admin.' });
}));

// Admin: isi bagian kalibrasi + serah terima, lalu ACC / tolak
router.put('/:id/review', adminOnly, wrap(async (req, res) => {
  const b = req.body;
  const [[p]] = await db.query('SELECT * FROM pengajuan WHERE id=? AND status="pending"', [req.params.id]);
  if (!p) return res.status(404).json({ message: 'Pengajuan tidak ditemukan atau sudah diproses.' });
  if (!b.judgement) return res.status(400).json({ message: 'Judgement wajib diisi.' });

  const ok = b.judgement === 'OK';
  if (!ok && !b.alasan_ng) return res.status(400).json({ message: 'Alasan NG / Cancel wajib diisi.' });
  if (ok && p.kategori === 'registration') {
    const miss = ['control_no', 'tipe', 'grp', 'line_name'].filter((k) => !b[k]);
    if (miss.length) return res.status(400).json({ message: 'Lengkapi dulu: ' + miss.join(', ') });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE pengajuan SET ${REVIEW.map((k) => k + '=?').join(',')}, status=?, reviewed_by=?, reviewed_at=NOW() WHERE id=?`,
      [...REVIEW.map((k) => nz(b[k])), ok ? 'approved' : 'rejected', req.user.username, p.id]);

    if (ok && p.kategori === 'registration') {
      // Masuk ke master data. Kalau control number sudah ada -> data lama diperbarui.
      await conn.query(
        `INSERT INTO alat_ukur (nama_alat, control_number, model, serial_number, setting_nm, range_alat, akurasi,
           process, grp, line_name, kode_line, lokasi, maker, tipe, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active')
         ON DUPLICATE KEY UPDATE nama_alat=VALUES(nama_alat), model=VALUES(model), serial_number=VALUES(serial_number),
           setting_nm=VALUES(setting_nm), range_alat=VALUES(range_alat), akurasi=VALUES(akurasi), process=VALUES(process),
           grp=VALUES(grp), line_name=VALUES(line_name), kode_line=VALUES(kode_line), lokasi=VALUES(lokasi),
           maker=VALUES(maker), tipe=VALUES(tipe), status='active'`,
        [p.nama_alat, b.control_no, p.model, p.serial_number, nz(p.setting), nz(p.range_alat), nz(p.akurasi),
         p.penggunaan || '-', b.grp, b.line_name, nz(b.kode_line), p.penempatan || '-', nz(p.maker), b.tipe]);
    }

    if (ok && p.kategori === 'cancellation') {
      await conn.query("UPDATE alat_ukur SET status='cancelled' WHERE id=?", [p.alat_id]);
      await conn.query('INSERT INTO riwayat_pembatalan (alat_id, alasan, dibatalkan_oleh) VALUES (?,?,?)',
        [p.alat_id, p.alasan_perubahan, req.user.username]);
    }

    await conn.commit();
    res.json({ message: ok ? 'Pengajuan disetujui dan data masuk ke master.' : 'Pengajuan ditolak.' });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally { conn.release(); }
}));

module.exports = router;