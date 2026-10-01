const bcrypt = require('bcrypt');
const pool = require('../config/db');

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, nama_lengkap, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { username, password, nama_lengkap, email, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password, nama_lengkap, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, nama_lengkap, email, role || 'user']
    );
    res.json({ message: 'Akun berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, nama_lengkap, email, role, password } = req.body;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET username=?, nama_lengkap=?, email=?, role=?, password=? WHERE id=?',
        [username, nama_lengkap, email, role, hashedPassword, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE users SET username=?, nama_lengkap=?, email=?, role=? WHERE id=?',
        [username, nama_lengkap, email, role, req.params.id]
      );
    }
    res.json({ message: 'Akun berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ message: 'Akun berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pengaturan WHERE id = 1');
    res.json(rows[0] || { nama_aplikasi: 'Hino Calibration', versi: '1.0.0' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { nama_aplikasi, versi } = req.body;
    await pool.query(
      'UPDATE pengaturan SET nama_aplikasi=?, versi=? WHERE id=1',
      [nama_aplikasi, versi]
    );
    res.json({ message: 'Pengaturan berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
