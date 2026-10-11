// Dipasang di server.js: app.use('/api/alat-ukur', require('./routes/alat-ukur.routes'));
const router = require('express').Router();
const prisma = require('../config/prisma');
const { verifyToken, adminOnly } = require('../middleware/auth');

const STRING_COLS = ['namaAlat', 'controlNumber', 'model', 'serialNumber', 'settingNm', 'rangeAlat',
  'akurasi', 'process', 'grp', 'lineName', 'kodeLine', 'lokasi', 'maker', 'master', 'noSeri'];
const REQUIRED = ['namaAlat', 'controlNumber', 'model', 'serialNumber', 'process', 'grp', 'lineName', 'lokasi', 'tipe'];

// Body dari frontend memakai snake_case (nama_alat, control_number, ...).
// Normalisasi ke camelCase Prisma agar kompatibel ke depan dan ke belakang.
function normalizeBody(b = {}) {
  const map = {
    nama_alat: 'namaAlat', control_number: 'controlNumber', serial_number: 'serialNumber',
    setting_nm: 'settingNm', range_alat: 'rangeAlat', line_name: 'lineName',
    kode_line: 'kodeLine', no_seri: 'noSeri',
  };
  const out = { ...b };
  for (const [snake, camel] of Object.entries(map)) {
    if (out[snake] !== undefined && out[camel] === undefined) out[camel] = out[snake];
  }
  return out;
}

function normalizeTipe(v) {
  const s = String(v || '').toLowerCase();
  if (s === 'non-torque' || s === 'non_torque') return 'non_torque';
  if (s === 'torque') return 'torque';
  return v;
}

const wrap = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ message: 'Control number sudah terdaftar.' });
    console.error(e);
    res.status(500).json({ message: 'Kesalahan server.' });
  }
};

const pick = (b) => {
  const n = normalizeBody(b);
  const data = {};
  for (const c of STRING_COLS) {
    const v = n[c];
    data[c] = (v === '' || v === undefined ? null : v);
  }
  if (n.tipe !== undefined) data.tipe = normalizeTipe(n.tipe);
  return data;
};

const missing = (b) => {
  const n = normalizeBody(b);
  const mapped = {
    nama_alat: 'namaAlat', control_number: 'controlNumber', model: 'model',
    serial_number: 'serialNumber', process: 'process', grp: 'grp',
    line_name: 'lineName', lokasi: 'lokasi', tipe: 'tipe',
  };
  return REQUIRED.filter((k) => {
    const snake = Object.keys(mapped).find((s) => mapped[s] === k);
    const v = n[k] !== undefined ? n[k] : n[snake];
    return !v || !String(v).trim();
  }).map((k) => {
    const snake = Object.keys(mapped).find((s) => mapped[s] === k);
    return snake || k;
  });
};

function toSnake(row) {
  if (!row) return row;
  const tipeOut = row.tipe === 'non_torque' ? 'non-torque' : row.tipe;
  return {
    ...row,
    tipe: tipeOut,
    nama_alat: row.namaAlat,
    control_number: row.controlNumber,
    serial_number: row.serialNumber,
    setting_nm: row.settingNm,
    range_alat: row.rangeAlat,
    line_name: row.lineName,
    kode_line: row.kodeLine,
    no_seri: row.noSeri,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

router.use(verifyToken);

// Daftar (admin & user): ?q=&status=&tipe=
router.get('/', wrap(async (req, res) => {
  const { q = '', status = '', tipe = '' } = req.query;
  const where = {};
  if (q) {
    where.OR = [
      { namaAlat: { contains: q } },
      { controlNumber: { contains: q } },
      { serialNumber: { contains: q } },
      { model: { contains: q } },
    ];
  }
  if (status) where.status = status;
  if (tipe) where.tipe = normalizeTipe(tipe);
  const rows = await prisma.alatUkur.findMany({ where, orderBy: { id: 'desc' } });
  res.json(rows.map(toSnake));
}));

// Registrasi alat baru
router.post('/', wrap(async (req, res) => {
  const m = missing(req.body);
  if (m.length) return res.status(400).json({ message: 'Data belum lengkap: ' + m.join(', ') });
  await prisma.alatUkur.create({ data: pick(req.body) });
  res.status(201).json({ message: 'Alat ukur berhasil diregistrasi.' });
}));

// Edit master data (admin) -> otomatis terbaca semua menu lain
router.put('/:id', adminOnly, wrap(async (req, res) => {
  const m = missing(req.body);
  if (m.length) return res.status(400).json({ message: 'Data belum lengkap: ' + m.join(', ') });
  await prisma.alatUkur.update({ where: { id: Number(req.params.id) }, data: pick(req.body) });
  res.json({ message: 'Data berhasil diperbarui.' });
}));

// Cancellation: status jadi cancelled + simpan ke history pembatalan
router.post('/:id/cancel', wrap(async (req, res) => {
  const id = Number(req.params.id);
  const updated = await prisma.alatUkur.updateMany({
    where: { id, status: 'active' },
    data: { status: 'cancelled' },
  });
  if (!updated.count) return res.status(404).json({ message: 'Alat tidak ditemukan atau sudah cancelled.' });
  await prisma.riwayatPembatalan.create({
    data: {
      alatId: id,
      alasan: req.body.alasan || null,
      dibatalkanOleh: (req.user && req.user.username) || null,
    },
  });
  res.json({ message: 'Alat ukur berhasil di-cancel.' });
}));

module.exports = router;
