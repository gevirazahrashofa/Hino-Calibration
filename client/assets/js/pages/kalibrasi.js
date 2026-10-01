async function loadKalibrasi(container) {
  const data = await apiRequest('/kalibrasi');
  let rows = '';
  (data || []).forEach(k => {
    const badge = k.status === 'selesai' ? 'badge-success' : k.status === 'dalam_proses' ? 'badge-warning' : k.status === 'dibatalkan' ? 'badge-danger' : 'badge-info';
    rows += `<tr>
      <td>${k.id}</td>
      <td>${k.nama_alat}</td>
      <td>${k.tanggal_kalibrasi}</td>
      <td>${k.hasil || '-'}</td>
      <td><span class="badge ${badge}">${k.status}</span></td>
      <td>${k.keterangan || '-'}</td>
      <td class="actions-cell">
        <button class="btn btn-warning btn-sm" onclick="editKalibrasi(${k.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteKalibrasi(${k.id})">Hapus</button>
      </td>
    </tr>`;
  });

  container.innerHTML = `
    <div class="page-header">
      <h2>Data Kalibrasi</h2>
    </div>
    <div class="page-section">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nama Alat</th><th>Tanggal</th><th>Hasil</th><th>Status</th><th>Keterangan</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7">Belum ada data</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

async function deleteKalibrasi(id) {
  if (confirm('Yakin ingin menghapus?')) {
    await apiRequest(`/kalibrasi/${id}`, 'DELETE');
    loadKalibrasi(document.getElementById('content-area'));
  }
}

async function editKalibrasi(id) {
  alert('Edit functionality for kalibrasi ID: ' + id);
}
