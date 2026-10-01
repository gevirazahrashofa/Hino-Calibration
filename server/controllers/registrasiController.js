const pool = require('../config/db');

exports.getAlatUkur = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM alat_ukur ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addAlatUkur = async (req, res) => {
  try {
    const { nama_alat, merk, model, serial_number, no_inventaris, lokasi } = req.body;
    await pool.query(
      'INSERT INTO alat_ukur (nama_alat, merk, model, serial_number, no_inventaris, lokasi) VALUES (?, ?, ?, ?, ?, ?)',
      [nama_alat, merk, model, serial_number, no_inventaris, lokasi]
    );
    res.json({ message: 'Alat ukur berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAlatUkur = async (req, res) => {
  try {
    const { nama_alat, merk, model, serial_number, no_inventaris, lokasi, status } = req.body;
    await pool.query(
      'UPDATE alat_ukur SET nama_alat=?, merk=?, model=?, serial_number=?, no_inventaris=?, lokasi=?, status=? WHERE id=?',
      [nama_alat, merk, model, serial_number, no_inventaris, lokasi, status, req.params.id]
    );
    res.json({ message: 'Alat ukur berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAlatUkur = async (req, res) => {
  try {
    await pool.query('DELETE FROM alat_ukur WHERE id=?', [req.params.id]);
    res.json({ message: 'Alat ukur berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
