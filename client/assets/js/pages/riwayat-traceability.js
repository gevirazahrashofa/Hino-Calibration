async function loadRiwayatTraceability(container) {
  const data = await apiRequest('/riwayat');
  let rows = '';
  (data || []).forEach(r => {
    rows += `<tr>
      <td>${r.id}</td>
      <td>${r.nama_spare}</td>
      <td>${r.trace_keterangan || '-'}</td>
      <td>${r.alasan}</td>
      <td>${r.tanggal_pembatalan}</td>
      <td class="actions-cell">
        <button class="btn btn-danger btn-sm" onclick="deleteRiwayat(${r.id})">Hapus</button>
      </td>
    </tr>`;
  });

  container.innerHTML = `
    <div class="page-header">
      <h2>Riwayat Traceability</h2>
    </div>
    <div class="page-section">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nama Spare</th><th>Keterangan</th><th>Alasan</th><th>Tanggal Pembatalan</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6">Belum ada data</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

async function deleteRiwayat(id) {
  if (confirm('Yakin ingin menghapus?')) {
    await apiRequest(`/riwayat/${id}`, 'DELETE');
    loadRiwayatTraceability(document.getElementById('content-area'));
  }
}
