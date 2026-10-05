/* Butuh registrasi.js dimuat lebih dulu (ALAT_FIELDS, alatApi, esc, dll). */
function loadDaftarAlat(c) {
  const isAdmin = String(authGet('role') || '').toLowerCase() === 'admin';
  const cols = [
    ...ALAT_FIELDS.slice(0, 4), ...ALAT_FIELDS.slice(5, 9),
    { k: 'status', label: 'Status' }, ...ALAT_FIELDS.slice(9)
  ];
  let rows = [];

  c.innerHTML = `
    <div class="card">
      <div class="toolbar">
        <input id="f-q" type="search" placeholder="Cari nama, control no, serial no, model...">
        <select id="f-status">
          <option value="">Semua status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select id="f-tipe">
          <option value="">Torque & Non Torque</option>
          <option value="torque">Torque</option>
          <option value="non-torque">Non Torque</option>
        </select>
        <span class="count" id="f-count"></span>
      </div>
      <p class="msg" id="list-msg"></p>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>${cols.map((f) => `<th>${f.label}</th>`).join('')}${isAdmin ? '<th>Aksi</th>' : ''}</tr></thead>
          <tbody id="list-body"></tbody>
        </table>
      </div>
    </div>`;

  const q = c.querySelector('#f-q');
  const st = c.querySelector('#f-status');
  const tp = c.querySelector('#f-tipe');
  const msg = c.querySelector('#list-msg');
  const tbody = c.querySelector('#list-body');

  async function load() {
    const qs = new URLSearchParams({ q: q.value.trim(), status: st.value, tipe: tp.value });
    try {
      rows = await alatApi('/alat-ukur?' + qs);
      msg.textContent = '';
      render();
    } catch (err) {
      msg.className = 'msg err'; msg.textContent = err.message;
    }
  }

  function render() {
    c.querySelector('#f-count').textContent = rows.length + ' alat';
    tbody.innerHTML = rows.length
      ? rows.map((r, i) => `<tr>
          ${cols.map((f) => {
            if (f.k === 'status') return `<td><span class="badge ${r.status === 'active' ? '' : 'bad'}">${esc(r.status)}</span></td>`;
            if (f.k === 'tipe') return `<td>${r.tipe === 'torque' ? 'Torque' : 'Non Torque'}</td>`;
            return `<td>${esc(r[f.k])}</td>`;
          }).join('')}
          ${isAdmin ? `<td><button class="btn btn-sm" data-i="${i}">Edit</button></td>` : ''}
        </tr>`).join('')
      : `<tr><td colspan="${cols.length + 1}">Data tidak ditemukan.</td></tr>`;
  }

  let t;
  q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(load, 300); });
  st.addEventListener('change', load);
  tp.addEventListener('change', load);

  // Admin: edit data master
  if (isAdmin) {
    tbody.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (b) openEdit(rows[b.dataset.i]);
    });
  }

  function openEdit(r) {
    const ov = document.createElement('div');
    ov.className = 'modal-overlay';
    ov.innerHTML = `
      <div class="modal">
        <h3>Edit Alat Ukur</h3>
        <form novalidate>
          <div class="form-grid">${alatFieldsHtml(r)}</div>
          <p class="msg"></p>
          <div class="modal-actions">
            <button type="button" class="btn" data-close>Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(ov);
    const form = ov.querySelector('form');
    const m = ov.querySelector('.msg');
    const close = () => ov.remove();
    ov.querySelector('[data-close]').onclick = close;
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      m.className = 'msg';
      const d = alatFormData(form);
      const miss = alatMissing(d);
      if (miss.length) { m.classList.add('err'); m.textContent = 'Data belum lengkap: ' + miss.join(', '); return; }
      try {
        await alatApi('/alat-ukur/' + r.id, 'PUT', d);
        close();
        load();
      } catch (err) { m.classList.add('err'); m.textContent = err.message; }
    });
  }

  load();
}