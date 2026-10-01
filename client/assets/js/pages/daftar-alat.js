async function loadFormRegistrasi(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2>Form Registrasi Alat Ukur</h2>
    </div>
    <div class="page-section">
      <form id="form-registrasi-alat">
        <div class="form-group">
          <label>Nama Alat</label>
          <input type="text" id="reg-nama-alat" placeholder="Masukkan nama alat" required>
        </div>
        <div class="form-group">
          <label>Merk</label>
          <input type="text" id="reg-merk" placeholder="Masukkan merk">
        </div>
        <div class="form-group">
          <label>Model</label>
          <input type="text" id="reg-model" placeholder="Masukkan model">
        </div>
        <div class="form-group">
          <label>Serial Number</label>
          <input type="text" id="reg-sn" placeholder="Masukkan serial number">
        </div>
        <div class="form-group">
          <label>No Inventaris</label>
          <input type="text" id="reg-inv" placeholder="Masukkan no inventaris">
        </div>
        <div class="form-group">
          <label>Lokasi</label>
          <input type="text" id="reg-lokasi" placeholder="Masukkan lokasi">
        </div>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </form>
      <div id="reg-message" class="message"></div>
    </div>
  `;

  document.getElementById('form-registrasi-alat').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      nama_alat: document.getElementById('reg-nama-alat').value,
      merk: document.getElementById('reg-merk').value,
      model: document.getElementById('reg-model').value,
      serial_number: document.getElementById('reg-sn').value,
      no_inventaris: document.getElementById('reg-inv').value,
      lokasi: document.getElementById('reg-lokasi').value
    };
    const result = await apiRequest('/registrasi', 'POST', data);
    const msg = document.getElementById('reg-message');
    if (result.message.includes('berhasil')) {
      msg.className = 'message success';
      e.target.reset();
    } else {
      msg.className = 'message error';
    }
    msg.textContent = result.message;
  });
}

async function loadDaftarAlat(container) {
  const data = await apiRequest('/registrasi');
  let rows = '';
  (data || []).forEach(a => {
    const badge = a.status === 'aktif' ? 'badge-success' : a.status === 'dalam_kalibrasi' ? 'badge-warning' : 'badge-danger';
    rows += `<tr>
      <td>${a.id}</td>
      <td>${a.nama_alat}</td>
      <td>${a.merk || '-'}</td>
      <td>${a.model || '-'}</td>
      <td>${a.serial_number || '-'}</td>
      <td>${a.no_inventaris || '-'}</td>
      <td>${a.lokasi || '-'}</td>
      <td><span class="badge ${badge}">${a.status}</span></td>
      <td class="actions-cell">
        <button class="btn btn-warning btn-sm" onclick="editAlat(${a.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAlat(${a.id})">Hapus</button>
      </td>
    </tr>`;
  });

  container.innerHTML = `
    <div class="page-header">
      <h2>Daftar Alat Ukur</h2>
    </div>
    <div class="page-section">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nama Alat</th><th>Merk</th><th>Model</th>
            <th>Serial Number</th><th>No Inventaris</th><th>Lokasi</th><th>Status</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="9">Belum ada data</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

async function deleteAlat(id) {
  if (confirm('Yakin ingin menghapus?')) {
    await apiRequest(`/registrasi/${id}`, 'DELETE');
    loadDaftarAlat(document.getElementById('content-area'));
  }
}

async function editAlat(id) {
  alert('Edit functionality for alat ukur ID: ' + id);
}
