async function loadManajemenAkun(container) {
  const data = await apiRequest('/sistem/akun');
  let rows = '';
  (data || []).forEach(u => {
    rows += `<tr>
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.nama_lengkap}</td>
      <td>${u.email || '-'}</td>
      <td><span class="badge ${u.role === 'admin' ? 'badge-danger' : 'badge-info'}">${u.role}</span></td>
      <td class="actions-cell">
        <button class="btn btn-warning btn-sm" onclick="editAkun(${u.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAkun(${u.id})">Hapus</button>
      </td>
    </tr>`;
  });

  container.innerHTML = `
    <div class="page-header">
      <h2>Manajemen Akun</h2>
    </div>
    <div class="page-section">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Username</th><th>Nama Lengkap</th><th>Email</th><th>Role</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6">Belum ada data</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

async function deleteAkun(id) {
  if (confirm('Yakin ingin menghapus akun ini?')) {
    await apiRequest(`/sistem/akun/${id}`, 'DELETE');
    loadManajemenAkun(document.getElementById('content-area'));
  }
}

async function editAkun(id) {
  alert('Edit functionality for akun ID: ' + id);
}
