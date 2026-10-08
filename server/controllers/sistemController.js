const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

function toUserSnake(u) {
  if (!u) return u;
  const { password, ...rest } = u;
  return {
    ...rest,
    nama_lengkap: rest.namaLengkap,
    created_at: rest.createdAt,
  };
}

exports.getUsers = async (req, res) => {
  try {
    const rows = await prisma.user.findMany({
      select: {
        id: true, username: true, namaLengkap: true, email: true, role: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rows.map(toUserSnake));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { username, password, nama_lengkap, namaLengkap, email, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        namaLengkap: namaLengkap ?? nama_lengkap ?? null,
        email: email || null,
        role: role === 'admin' ? 'admin' : 'user',
      },
    });
    res.json({ message: 'Akun berhasil ditambahkan' });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Username atau email sudah digunakan.' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, nama_lengkap, namaLengkap, email, role, password } = req.body;
    const data = {
      username,
      namaLengkap: namaLengkap ?? nama_lengkap ?? undefined,
      email: email ?? undefined,
      role: role === 'admin' ? 'admin' : 'user',
    };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    await prisma.user.update({ where: { id: Number(req.params.id) }, data });
    res.json({ message: 'Akun berhasil diupdate' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Akun tidak ditemukan.' });
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Username atau email sudah digunakan.' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Akun berhasil dihapus' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Akun tidak ditemukan.' });
    res.status(500).json({ message: err.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    let row = await prisma.pengaturan.findFirst({ orderBy: { id: 'asc' } });
    if (!row) {
      row = await prisma.pengaturan.create({
        data: { namaAplikasi: 'Hino Calibration', versi: '1.0.0' },
      });
    }
    res.json({
      ...row,
      nama_aplikasi: row.namaAplikasi,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const namaAplikasi = req.body.nama_aplikasi ?? req.body.namaAplikasi;
    const { versi } = req.body;
    let row = await prisma.pengaturan.findFirst({ orderBy: { id: 'asc' } });
    if (!row) {
      row = await prisma.pengaturan.create({
        data: { namaAplikasi: namaAplikasi || 'Hino Calibration', versi: versi || '1.0.0' },
      });
    } else {
      row = await prisma.pengaturan.update({
        where: { id: row.id },
        data: {
          namaAplikasi: namaAplikasi || row.namaAplikasi,
          versi: versi || row.versi,
        },
      });
    }
    res.json({ message: 'Pengaturan berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
