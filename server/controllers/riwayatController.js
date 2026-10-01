const pool = require('../config/db');

exports.getRiwayat = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT rt.*, t.keterangan AS trace_keterangan, s.nama_spare FROM riwayat_traceability rt JOIN traceability t ON rt.traceability_id = t.id JOIN spare_data s ON t.spare_id = s.id ORDER BY rt.tanggal_pembatalan DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addRiwayat = async (req, res) => {
  try {
    const { traceability_id, alasan } = req.body;
    await pool.query(
      'INSERT INTO riwayat_traceability (traceability_id, alasan) VALUES (?, ?)',
      [traceability_id, alasan]
    );
    await pool.query('UPDATE traceability SET status = ? WHERE id = ?', ['digunakan', traceability_id]);
    res.json({ message: 'Riwayat traceability berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRiwayat = async (req, res) => {
  try {
    await pool.query('DELETE FROM riwayat_traceability WHERE id=?', [req.params.id]);
    res.json({ message: 'Riwayat traceability berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
