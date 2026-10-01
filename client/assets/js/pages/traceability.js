async function loadTraceability(container) {
  const data = await apiRequest('/traceability');
  let rows = '';
  (data || []).forEach(t => {
    const badge = t.status === 'tersedia' ? 'badge-success' : t.status === 'digunakan' ? 'badge-warning' : 'badge-danger';
    rows += `<tr>
      <td>${t.id}</td>
      <td>${t.nama_spare}</td>
      <td>${t.tanggal}</td>
      <td><span class="badge ${badge}">${t.status}</span></td>
      <td>${t.keterangan || '-'}</td>
      <td class="actions-cell">
        <button class="btn btn-warning btn-sm" onclick="editTraceability(${t.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTraceability(${t.id})">Hapus</button>
      </td>
    </tr>`;
  });

  container.innerHTML = `
    <div class="page-header">
      <h2>Data Traceability</h2>
    </div>
    <div class="page-section">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nama Spare</th><th>Tanggal</th><th>Status</th><th>Keterangan</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6">Belum ada data</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

async function deleteTraceability(id) {
  if (confirm('Yakin ingin menghapus?')) {
    await apiRequest(`/traceability/${id}`, 'DELETE');
    loadTraceability(document.getElementById('content-area'));
  }
}

async function editTraceability(id) {
  alert('Edit functionality for traceability ID: ' + id);
}
