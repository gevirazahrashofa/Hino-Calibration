const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'ganti_dengan_secret_yang_kuat';

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter.' });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: 'Username sudah digunakan.' });
    }

    // Skema hanya mengenal 'admin' | 'user'. Nilai lain (termasuk 'staff' lama) dinormalkan ke 'user'.
    const finalRole = role === 'admin' ? 'admin' : 'user';
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { username, password: hashedPassword, role: finalRole },
    });

    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Username sudah digunakan.' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password, ingatSaya } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ message: 'Username tidak ditemukan' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Password salah' });

    // Kalau "Ingat saya" dicentang, token bertahan 7 hari.
    // Kalau tidak, token cuma bertahan 2 jam.
    const expiresIn = ingatSaya ? '7d' : '2h';

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = (req, res) => {
  // Dengan JWT tidak ada session di server yang perlu dihapus.
  // Logout cukup hapus token dari localStorage/sessionStorage di sisi frontend.
  res.json({ message: 'Logout berhasil' });
};
