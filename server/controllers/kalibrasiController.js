const pool = require('../config/db');

// Kalibrasi
exports.getKalibrasi = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT k.*, a.nama_alat FROM kalibrasi k JOIN alat_ukur a ON k.alat_ukur_id = a.id ORDER BY k.created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addKalibrasi = async (req, res) => {
  try {
    const { alat_ukur_id, tanggal_kalibrasi, hasil, keterangan } = req.body;
    await pool.query(
      'INSERT INTO kalibrasi (alat_ukur_id, tanggal_kalibrasi, hasil, keterangan) VALUES (?, ?, ?, ?)',
      [alat_ukur_id, tanggal_kalibrasi, hasil, keterangan]
    );
    res.json({ message: 'Kalibrasi berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateKalibrasi = async (req, res) => {
  try {
    const { alat_ukur_id, tanggal_kalibrasi, hasil, keterangan, status } = req.body;
    await pool.query(
      'UPDATE kalibrasi SET alat_ukur_id=?, tanggal_kalibrasi=?, hasil=?, keterangan=?, status=? WHERE id=?',
      [alat_ukur_id, tanggal_kalibrasi, hasil, keterangan, status, req.params.id]
    );
    res.json({ message: 'Kalibrasi berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteKalibrasi = async (req, res) => {
  try {
    await pool.query('DELETE FROM kalibrasi WHERE id=?', [req.params.id]);
    res.json({ message: 'Kalibrasi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Checksheet
exports.getChecksheet = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT c.*, k.tanggal_kalibrasi, a.nama_alat FROM checksheet_kalibrasi c JOIN kalibrasi k ON c.kalibrasi_id = k.id JOIN alat_ukur a ON k.alat_ukur_id = a.id ORDER BY c.created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addChecksheet = async (req, res) => {
  try {
    const { kalibrasi_id, parameter, standar, hasil_uji, keterangan } = req.body;
    await pool.query(
      'INSERT INTO checksheet_kalibrasi (kalibrasi_id, parameter, standar, hasil_uji, keterangan) VALUES (?, ?, ?, ?, ?)',
      [kalibrasi_id, parameter, standar, hasil_uji, keterangan]
    );
    res.json({ message: 'Checksheet berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateChecksheet = async (req, res) => {
  try {
    const { kalibrasi_id, parameter, standar, hasil_uji, keterangan } = req.body;
    await pool.query(
      'UPDATE checksheet_kalibrasi SET kalibrasi_id=?, parameter=?, standar=?, hasil_uji=?, keterangan=? WHERE id=?',
      [kalibrasi_id, parameter, standar, hasil_uji, keterangan, req.params.id]
    );
    res.json({ message: 'Checksheet berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteChecksheet = async (req, res) => {
  try {
    await pool.query('DELETE FROM checksheet_kalibrasi WHERE id=?', [req.params.id]);
    res.json({ message: 'Checksheet berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Schedule Kalibrasi
exports.getSchedule = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT s.*, a.nama_alat FROM schedule s JOIN alat_ukur a ON s.alat_ukur_id = a.id ORDER BY s.tanggal_mulai DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addSchedule = async (req, res) => {
  try {
    const { alat_ukur_id, tanggal_mulai, tanggal_akhir, keterangan } = req.body;
    await pool.query(
      'INSERT INTO schedule (alat_ukur_id, tanggal_mulai, tanggal_akhir, keterangan) VALUES (?, ?, ?, ?)',
      [alat_ukur_id, tanggal_mulai, tanggal_akhir, keterangan]
    );
    res.json({ message: 'Schedule berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { alat_ukur_id, tanggal_mulai, tanggal_akhir, status, keterangan } = req.body;
    await pool.query(
      'UPDATE schedule SET alat_ukur_id=?, tanggal_mulai=?, tanggal_akhir=?, status=?, keterangan=? WHERE id=?',
      [alat_ukur_id, tanggal_mulai, tanggal_akhir, status, keterangan, req.params.id]
    );
    res.json({ message: 'Schedule berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await pool.query('DELETE FROM schedule WHERE id=?', [req.params.id]);
    res.json({ message: 'Schedule berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
