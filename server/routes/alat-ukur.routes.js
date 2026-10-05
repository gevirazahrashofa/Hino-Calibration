// Pasang di server: app.use('/api/alat-ukur', require('./routes/alat-ukur.routes'));
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // ASUMSI: pool mysql2/promise milik Anda

const COLS = ['nama_alat','control_number','model','serial_number','setting_nm','range_alat',
  'akurasi','process','grp','line_name','kode_line','lokasi','maker','master','no_seri','tipe'];
const REQUIRED = ['nama_alat','control_number','model','serial_number','process','grp','line_name','lokasi','tipe'];

// ASUMSI: token JWT dibuat dengan process.env.JWT_SECRET dan berisi { role }.
// Kalau Anda sudah punya middleware auth, ganti dua fungsi ini dengan milik Anda.
function auth(req, res, next) {
  try {
    req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Sesi habis, silakan login ulang.' });
  }
}
const adminOnly = (req, res, next) =>
  String(req.user.role).toLowerCase() === 'admin' ? next() : res.status(403).json({ message: 'Hanya admin yang boleh mengubah data.' });

const wrap = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Control number sudah terdaftar.' });
    console.error(e);
    res.status(500).json({ message: 'Kesalahan server.' });
  }
};

const pick = (b) => COLS.map((c) => (b[c] === '' || b[c] === undefined ? null : b[c]));
const missing = (b) => REQUIRED.filter((k) => !b[k] || !String(b[k]).trim());

router.use(auth);

// Daftar (admin & user): ?q=&status=&tipe=
router.get('/', wrap(async (req, res) => {
  const { q = '', status = '', tipe = '' } = req.query;
  let sql = 'SELECT * FROM alat_ukur WHERE 1=1';
  const p = [];
  if (q) { sql += ' AND (nama_alat LIKE ? OR control_number LIKE ? OR serial_number LIKE ? OR model LIKE ?)'; p.push(...Array(4).fill(`%${q}%`)); }
  if (status) { sql += ' AND status = ?'; p.push(status); }
  if (tipe) { sql += ' AND tipe = ?'; p.push(tipe); }
  const [rows] = await db.query(sql + ' ORDER BY id DESC', p);
  res.json(rows);
}));

// Registrasi alat baru
router.post('/', wrap(async (req, res) => {
  const m = missing(req.body);
  if (m.length) return res.status(400).json({ message: 'Data belum lengkap: ' + m.join(', ') });
  await db.query(`INSERT INTO alat_ukur (${COLS.join(',')}) VALUES (${COLS.map(() => '?').join(',')})`, pick(req.body));
  res.status(201).json({ message: 'Alat ukur berhasil diregistrasi.' });
}));

// Edit master data (admin) -> otomatis terbaca semua menu lain
router.put('/:id', adminOnly, wrap(async (req, res) => {
  const m = missing(req.body);
  if (m.length) return res.status(400).json({ message: 'Data belum lengkap: ' + m.join(', ') });
  await db.query(`UPDATE alat_ukur SET ${COLS.map((c) => c + '=?').join(',')} WHERE id=?`, [...pick(req.body), req.params.id]);
  res.json({ message: 'Data berhasil diperbarui.' });
}));

// Cancellation: status jadi cancelled + simpan ke history pembatalan
router.post('/:id/cancel', wrap(async (req, res) => {
  const [r] = await db.query("UPDATE alat_ukur SET status='cancelled' WHERE id=? AND status='active'", [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Alat tidak ditemukan atau sudah cancelled.' });
  await db.query('INSERT INTO riwayat_pembatalan (alat_id, alasan, dibatalkan_oleh) VALUES (?,?,?)',
    [req.params.id, req.body.alasan || null, req.user.username || null]);
  res.json({ message: 'Alat ukur berhasil di-cancel.' });
}));

module.exports = router;