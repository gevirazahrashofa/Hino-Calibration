async function loadScheduleTraceability(container) {
  const data = await apiRequest('/traceability/schedule');
  let rows = '';
  (data || []).forEach(s => {
    const badge = s.status === 'selesai' ? 'badge-success' : s.status === 'dibatalkan' ? 'badge-danger' : 'badge-info';
    rows += `<tr>
      <td>${s.id}</td>
      <td>${s.nama_spare}</td>
      <td>${s.tanggal_mulai}</td>
      <td>${s.tanggal_akhir}</td>
      <td><span class="badge ${badge}">${s.status}</span></td>
      <td>${s.keterangan || '-'}</td>
      <td class="actions-cell">
        <button class="btn btn-warning btn-sm" onclick="editScheduleTrace(${s.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteScheduleTrace(${s.id})">Hapus</button>
      </td>
    </tr>`;
  });

  container.innerHTML = `
    <div class="page-header">
      <h2>Schedule Traceability</h2>
    </div>
    <div class="page-section">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nama Spare</th><th>Tanggal Mulai</th><th>Tanggal Akhir</th>
            <th>Status</th><th>Keterangan</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7">Belum ada data</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

async function deleteScheduleTrace(id) {
  if (confirm('Yakin ingin menghapus?')) {
    await apiRequest(`/traceability/schedule/${id}`, 'DELETE');
    loadScheduleTraceability(document.getElementById('content-area'));
  }
}

async function editScheduleTrace(id) {
  alert('Edit functionality for schedule traceability ID: ' + id);
}
