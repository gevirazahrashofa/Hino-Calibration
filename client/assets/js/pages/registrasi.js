/* ---------- Helper bersama (dipakai daftar-alat.js & pengajuan.js) ---------- */
const ALAT_API = 'http://localhost:3000/api';
const authGet = (k) => localStorage.getItem(k) || sessionStorage.getItem(k);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function alatApi(path, method = 'GET', body) {
  const r = await fetch(ALAT_API + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + authGet('token') },
    body: body ? JSON.stringify(body) : undefined
  });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) { localStorage.clear(); sessionStorage.clear(); window.location.href = '/'; }
  if (!r.ok) throw new Error(d.message || `Terjadi kesalahan (kode ${r.status}) pada ${method} ${path}`);
  return d;
}

// Renderer field umum: {k, label, req, type:'date'|'textarea', options:[[val,label]]}
function renderFields(list, v = {}) {
  return list.map((f) => {
    const val = v[f.k] ?? '';
    let input;
    if (f.options) input = `<select name="${f.k}"><option value="">-- Pilih --</option>${f.options.map(([o, t]) => `<option value="${o}" ${val === o ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
    else if (f.type === 'textarea') input = `<textarea name="${f.k}" rows="2">${esc(val)}</textarea>`;
    else input = `<input name="${f.k}" type="${f.type || 'text'}" value="${esc(f.type === 'date' ? String(val).slice(0, 10) : val)}" autocomplete="off">`;
    return `<label class="fld ${f.type === 'textarea' ? 'wide' : ''}"><span>${f.label}${f.req ? ' <b class="req">*</b>' : ''}</span>${input}</label>`;
  }).join('');
}
const readFields = (list, form) => Object.fromEntries(list.map((f) => [f.k, form.elements[f.k].value.trim()]));
const missingOf = (list, d) => list.filter((f) => f.req && !d[f.k]).map((f) => f.label);

// Checkbox group -> string "a, b"
const checksHtml = (name, items, val = '') =>
  `<div class="check-row">${items.map((i) => `<label><input type="checkbox" name="${name}" value="${i}" ${String(val).includes(i) ? 'checked' : ''}> ${i}</label>`).join('')}</div>`;
const checksVal = (form, name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value).join(', ');

// Field master alat (dipakai daftar-alat.js, jangan dihapus)
const ALAT_FIELDS = [
  { k: 'nama_alat', label: 'Nama Alat', req: 1 },
  { k: 'control_number', label: 'Control Number', req: 1 },
  { k: 'model', label: 'Model', req: 1 },
  { k: 'serial_number', label: 'Serial Number', req: 1 },
  { k: 'tipe', label: 'Tipe', req: 1, options: [['torque', 'Torque'], ['non-torque', 'Non Torque']] },
  { k: 'setting_nm', label: 'Setting (Nm)' },
  { k: 'range_alat', label: 'Range' },
  { k: 'akurasi', label: 'Akurasi' },
  { k: 'process', label: 'Process', req: 1 },
  { k: 'grp', label: 'Group (Master List)', req: 1 },
  { k: 'line_name', label: 'Line', req: 1 },
  { k: 'kode_line', label: 'Kode Line' },
  { k: 'lokasi', label: 'Lokasi / Area', req: 1 },
  { k: 'maker', label: 'Pembuat / Maker' },
  { k: 'master', label: 'Master' },
  { k: 'no_seri', label: 'No Seri' }
];
const alatFieldsHtml = (v) => renderFields(ALAT_FIELDS, v);
const alatFormData = (form) => readFields(ALAT_FIELDS, form);
const alatMissing = (d) => missingOf(ALAT_FIELDS, d);

/* ---------- 1. Form pengajuan (diisi pemohon) ---------- */
const PENG_FIELDS = [
  { k: 'tanggal_pengajuan', label: 'Date of Application (Tanggal Digunakan)', type: 'date', req: 1 },
  { k: 'maker', label: 'Maker (Pembuat)' },
  { k: 'nama_alat', label: 'Tool Name (Nama Alat Ukur)', req: 1 },
  { k: 'serial_number', label: 'Serial Number (Nomor Seri)', req: 1 },
  { k: 'model', label: 'Type / Model (Jenis/Model)', req: 1 },
  { k: 'akurasi', label: 'Accuracy (Keakuratan)' },
  { k: 'range_alat', label: 'Measurement Range (Rentang)' },
  { k: 'setting', label: 'Setting (Pengaturan Khusus)' },
  { k: 'penggunaan', label: 'Tools Usage (Penggunaan Alat Ukur)', req: 1 },
  { k: 'penempatan', label: 'Tools Placement (Pos 5 Frame)', req: 1 },
  { k: 'kategori_alat', label: 'Category of Tools', req: 1, options: [['special', 'Special'], ['vehicle tools', 'Vehicle Tools'], ['general', 'General']] },
  { k: 'klasifikasi', label: 'Classification', req: 1, options: [['new process', 'New Process'], ['change model', 'Change Model'], ['update', 'Update'], ['change process', 'Change Process'], ['dispose', 'Dispose']] },
  { k: 'alasan_perubahan', label: 'Reason Change (Alasan Perubahan)', type: 'textarea' },
  { k: 'ttd_pemohon', label: 'TTD Applicant / Pemohon (nama)', req: 1 }
];
const DOK_ITEMS = ['Sertifikat', 'Buku panduan', 'Lainnya'];

function loadFormRegistrasi(c) {
  c.innerHTML = `
    <div class="card">
      <form id="peng-form" novalidate>
        <div class="seg" id="kat-seg">
          <button type="button" class="seg-btn active" data-k="registration">Registration</button>
          <button type="button" class="seg-btn" data-k="cancellation">Cancellation</button>
        </div>
        <h4 class="form-section">1. Diisi oleh pemohon</h4>
        <div id="cancel-pick" class="form-grid one" hidden>
          <label class="fld"><span>Alat yang akan di-cancel <b class="req">*</b></span><select name="alat_id"></select></label>
        </div>
        <div class="form-grid">${renderFields(PENG_FIELDS, { tanggal_pengajuan: new Date().toISOString().slice(0, 10) })}</div>
        <div class="fld"><span>Penyerahan sertifikat, buku panduan, dll</span>${checksHtml('dok', DOK_ITEMS)}</div>
        <p class="msg" id="peng-msg"></p>
        <button class="btn btn-primary" type="submit">Kirim Pengajuan</button>
      </form>
    </div>
    <div class="card" style="margin-top:20px">
      <h3>Pengajuan Saya</h3>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Tanggal</th><th>Kategori</th><th>Nama Alat</th><th>Serial Number</th><th>Status</th></tr></thead>
        <tbody id="my-body"></tbody></table></div>
    </div>`;

  const form = c.querySelector('#peng-form');
  const msg = c.querySelector('#peng-msg');
  const pick = c.querySelector('#cancel-pick');
  const sel = form.elements.alat_id;
  let kategori = 'registration';
  let tools = [];

  const fillFromTool = (t) => {
    const map = { nama_alat: t.nama_alat, serial_number: t.serial_number, model: t.model, maker: t.maker, akurasi: t.akurasi, range_alat: t.range_alat, setting: t.setting_nm, penggunaan: t.process, penempatan: t.lokasi };
    Object.entries(map).forEach(([k, v]) => { form.elements[k].value = v ?? ''; });
    form.elements.klasifikasi.value = 'dispose';
  };

  c.querySelectorAll('#kat-seg .seg-btn').forEach((b) => b.addEventListener('click', async () => {
    kategori = b.dataset.k;
    c.querySelectorAll('#kat-seg .seg-btn').forEach((x) => x.classList.toggle('active', x === b));
    pick.hidden = kategori !== 'cancellation';
    if (kategori === 'cancellation' && !tools.length) {
      try {
        tools = await alatApi('/alat-ukur?status=active');
        sel.innerHTML = '<option value="">-- Pilih alat --</option>' + tools.map((t) => `<option value="${t.id}">${esc(t.control_number)} - ${esc(t.nama_alat)}</option>`).join('');
      } catch (err) { msg.className = 'msg err'; msg.textContent = err.message; }
    }
  }));
  sel.addEventListener('change', () => { const t = tools.find((x) => String(x.id) === sel.value); if (t) fillFromTool(t); });

  async function loadMine() {
    try {
      const rows = await alatApi('/pengajuan');
      c.querySelector('#my-body').innerHTML = rows.length
        ? rows.map((r) => `<tr><td>${esc(String(r.tanggal_pengajuan).slice(0, 10))}</td><td>${esc(r.kategori)}</td><td>${esc(r.nama_alat)}</td><td>${esc(r.serial_number)}</td>
            <td><span class="badge ${r.status === 'approved' ? '' : r.status === 'rejected' ? 'bad' : 'warn'}">${esc(r.status)}</span></td></tr>`).join('')
        : '<tr><td colspan="5">Belum ada pengajuan.</td></tr>';
    } catch (e) { /* abaikan */ }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.className = 'msg';
    const d = readFields(PENG_FIELDS, form);
    const miss = missingOf(PENG_FIELDS, d);
    if (kategori === 'cancellation' && !sel.value) miss.unshift('Alat yang akan di-cancel');
    if (miss.length) { msg.classList.add('err'); msg.textContent = 'Data belum lengkap: ' + miss.join(', '); return; }
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const r = await alatApi('/pengajuan', 'POST', { ...d, kategori, alat_id: kategori === 'cancellation' ? sel.value : null, dokumen: checksVal(form, 'dok') });
      msg.classList.add('ok'); msg.textContent = r.message;
      form.reset();
      loadMine();
    } catch (err) { msg.classList.add('err'); msg.textContent = err.message; }
    finally { btn.disabled = false; }
  });

  loadMine();
}