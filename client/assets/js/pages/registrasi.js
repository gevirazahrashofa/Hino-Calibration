async function loadDashboard(container) {
  const alatUkur = await apiRequest('/registrasi');
  const kalibrasi = await apiRequest('/kalibrasi');
  const spare = await apiRequest('/traceability/spare');

  container.innerHTML = `
    <h1>Selamat Datang di Dashboard</h1>
    <p>Sistem Kalibrasi Hino</p>
    <div class="stat-cards">
      <div class="stat-card">
        <h3>${alatUkur.length || 0}</h3>
        <p>Total Alat Ukur</p>
      </div>
      <div class="stat-card">
        <h3>${kalibrasi.length || 0}</h3>
        <p>Total Kalibrasi</p>
      </div>
      <div class="stat-card">
        <h3>${spare.length || 0}</h3>
        <p>Total Spare Data</p>
      </div>
    </div>
  `;
}
