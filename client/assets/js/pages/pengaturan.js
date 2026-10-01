async function loadPengaturan(container) {
  const data = await apiRequest('/sistem/pengaturan');
  container.innerHTML = `
    <div class="page-header">
      <h2>Pengaturan</h2>
    </div>
    <div class="page-section">
      <form id="form-pengaturan">
        <div class="form-group">
          <label>Nama Aplikasi</label>
          <input type="text" id="set-nama" value="${data.nama_aplikasi || 'Hino Calibration'}">
        </div>
        <div class="form-group">
          <label>Versi</label>
          <input type="text" id="set-versi" value="${data.versi || '1.0.0'}">
        </div>
        <button type="submit" class="btn btn-primary">Simpan Pengaturan</button>
      </form>
      <div id="set-message" class="message"></div>
    </div>
  `;

  document.getElementById('form-pengaturan').addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = await apiRequest('/sistem/pengaturan', 'PUT', {
      nama_aplikasi: document.getElementById('set-nama').value,
      versi: document.getElementById('set-versi').value
    });
    const msg = document.getElementById('set-message');
    msg.textContent = result.message;
    msg.className = result.message.includes('berhasil') ? 'message success' : 'message error';
  });
}
