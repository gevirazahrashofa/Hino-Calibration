const prisma = require('../config/prisma');

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

function normalizeBody(b = {}) {
  const map = {
    nama_alat: 'namaAlat', control_number: 'controlNumber', serial_number: 'serialNumber',
    setting_nm: 'settingNm', range_alat: 'rangeAlat', line_name: 'lineName',
    kode_line: 'kodeLine', no_seri: 'noSeri',
  };
  const out = {};
  for (const [k, v] of Object.entries(b)) {
    out[map[k] || k] = v === '' ? null : v;
  }
  if (out.tipe) {
    const s = String(out.tipe).toLowerCase();
    out.tipe = s === 'non-torque' || s === 'non_torque' ? 'non_torque' : 'torque';
  }
  return out;
}

exports.getAlatUkur = async (req, res) => {
  try {
    const rows = await prisma.alatUkur.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(rows.map(toSnake));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addAlatUkur = async (req, res) => {
  try {
    await prisma.alatUkur.create({ data: normalizeBody(req.body) });
    res.json({ message: 'Alat ukur berhasil ditambahkan' });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Control number sudah terdaftar.' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateAlatUkur = async (req, res) => {
  try {
    await prisma.alatUkur.update({
      where: { id: Number(req.params.id) },
      data: normalizeBody(req.body),
    });
    res.json({ message: 'Alat ukur berhasil diupdate' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Data tidak ditemukan.' });
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Control number sudah terdaftar.' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAlatUkur = async (req, res) => {
  try {
    await prisma.alatUkur.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Alat ukur berhasil dihapus' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Data tidak ditemukan.' });
    res.status(500).json({ message: err.message });
  }
};
