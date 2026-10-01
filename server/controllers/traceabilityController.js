const pool = require('../config/db');

// Spare Data
exports.getSpare = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM spare_data ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addSpare = async (req, res) => {
  try {
    const { nama_spare, deskripsi, stok, satuan } = req.body;
    await pool.query(
      'INSERT INTO spare_data (nama_spare, deskripsi, stok, satuan) VALUES (?, ?, ?, ?)',
      [nama_spare, deskripsi, stok, satuan]
    );
    res.json({ message: 'Spare data berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSpare = async (req, res) => {
  try {
    const { nama_spare, deskripsi, stok, satuan } = req.body;
    await pool.query(
      'UPDATE spare_data SET nama_spare=?, deskripsi=?, stok=?, satuan=? WHERE id=?',
      [nama_spare, deskripsi, stok, satuan, req.params.id]
    );
    res.json({ message: 'Spare data berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSpare = async (req, res) => {
  try {
    await pool.query('DELETE FROM spare_data WHERE id=?', [req.params.id]);
    res.json({ message: 'Spare data berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Traceability
exports.getTraceability = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT t.*, s.nama_spare FROM traceability t JOIN spare_data s ON t.spare_id = s.id ORDER BY t.created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addTraceability = async (req, res) => {
  try {
    const { spare_id, tanggal, keterangan } = req.body;
    await pool.query(
      'INSERT INTO traceability (spare_id, tanggal, keterangan) VALUES (?, ?, ?)',
      [spare_id, tanggal, keterangan]
    );
    res.json({ message: 'Traceability berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTraceability = async (req, res) => {
  try {
    const { spare_id, tanggal, keterangan, status } = req.body;
    await pool.query(
      'UPDATE traceability SET spare_id=?, tanggal=?, keterangan=?, status=? WHERE id=?',
      [spare_id, tanggal, keterangan, status, req.params.id]
    );
    res.json({ message: 'Traceability berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTraceability = async (req, res) => {
  try {
    await pool.query('DELETE FROM traceability WHERE id=?', [req.params.id]);
    res.json({ message: 'Traceability berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Schedule Traceability
exports.getScheduleTraceability = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT st.*, s.nama_spare FROM schedule_traceability st JOIN spare_data s ON st.spare_id = s.id ORDER BY st.tanggal_mulai DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addScheduleTraceability = async (req, res) => {
  try {
    const { spare_id, tanggal_mulai, tanggal_akhir, keterangan } = req.body;
    await pool.query(
      'INSERT INTO schedule_traceability (spare_id, tanggal_mulai, tanggal_akhir, keterangan) VALUES (?, ?, ?, ?)',
      [spare_id, tanggal_mulai, tanggal_akhir, keterangan]
    );
    res.json({ message: 'Schedule traceability berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateScheduleTraceability = async (req, res) => {
  try {
    const { spare_id, tanggal_mulai, tanggal_akhir, status, keterangan } = req.body;
    await pool.query(
      'UPDATE schedule_traceability SET spare_id=?, tanggal_mulai=?, tanggal_akhir=?, status=?, keterangan=? WHERE id=?',
      [spare_id, tanggal_mulai, tanggal_akhir, status, keterangan, req.params.id]
    );
    res.json({ message: 'Schedule traceability berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteScheduleTraceability = async (req, res) => {
  try {
    await pool.query('DELETE FROM schedule_traceability WHERE id=?', [req.params.id]);
    res.json({ message: 'Schedule traceability berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
