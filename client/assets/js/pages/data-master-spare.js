async function loadDataMasterSpare(container) {
  const data = await apiRequest('/traceability/spare');
  let rows = '';
  (data || []).forEach(s => {
    rows += `<tr>
      <td>${s.id}</td>
      <td>${s.nama_spare}</td>
      <td>${s.deskripsi || '-'}</td>
      <td>${s.stok}</td>
      <td>${s.satuan || '-'}</td>
      <td class="actions-cell">
        <button class="btn btn-warning btn-sm" onclick="editSpare(${s.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteSpare(${s.id})">Hapus</button>
      </td>
    </tr>`;
  });

  container.innerHTML = `
    <div class="page-header">
      <h2>Data Master Spare</h2>
    </div>
    <div class="page-section">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nama Spare</th><th>Deskripsi</th><th>Stok</th><th>Satuan</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6">Belum ada data</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

async function deleteSpare(id) {
  if (confirm('Yakin ingin menghapus?')) {
    await apiRequest(`/traceability/spare/${id}`, 'DELETE');
    loadDataMasterSpare(document.getElementById('content-area'));
  }
}

async function editSpare(id) {
  alert('Edit functionality for spare ID: ' + id);
}
