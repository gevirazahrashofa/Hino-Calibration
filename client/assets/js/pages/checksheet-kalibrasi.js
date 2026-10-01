async function loadChecksheetKalibrasi(container) {
  const data = await apiRequest('/kalibrasi/checksheet');
  let rows = '';
  (data || []).forEach(c => {
    rows += `<tr>
      <td>${c.id}</td>
      <td>${c.nama_alat}</td>
      <td>${c.tanggal_kalibrasi}</td>
      <td>${c.parameter}</td>
      <td>${c.standar || '-'}</td>
      <td>${c.hasil_uji || '-'}</td>
      <td>${c.keterangan || '-'}</td>
      <td class="actions-cell">
        <button class="btn btn-warning btn-sm" onclick="editChecksheet(${c.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteChecksheet(${c.id})">Hapus</button>
      </td>
    </tr>`;
  });

  container.innerHTML = `
    <div class="page-header">
      <h2>Checksheet Kalibrasi</h2>
    </div>
    <div class="page-section">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nama Alat</th><th>Tanggal</th><th>Parameter</th>
            <th>Standar</th><th>Hasil Uji</th><th>Keterangan</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="8">Belum ada data</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

async function deleteChecksheet(id) {
  if (confirm('Yakin ingin menghapus?')) {
    await apiRequest(`/kalibrasi/checksheet/${id}`, 'DELETE');
    loadChecksheetKalibrasi(document.getElementById('content-area'));
  }
}

async function editChecksheet(id) {
  alert('Edit functionality for checksheet ID: ' + id);
}
