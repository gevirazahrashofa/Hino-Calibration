const express = require('express');
const cors = require('cors');
const path = require('path');
// Env tunggal di root proyek; dukung juga server/.env bila ada (legacy).
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../client')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/alat-ukur', require('./routes/alat-ukur.routes'));
app.use('/api/pengajuan', require('./routes/pengajuan.routes'));
app.use('/api/registrasi', require('./routes/registrasiRoutes'));
app.use('/api/sistem', require('./routes/sistem.routes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dashboard.html'));
});

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${PORT} sudah dipakai — hentikan proses lain yang memakai port tersebut, lalu jalankan ulang.`
      );
      process.exit(1);
    }
    throw err;
  });
}

module.exports = app;
