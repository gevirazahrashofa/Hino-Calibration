/* Halaman admin: Pengajuan Registration. Butuh registrasi.js dimuat lebih dulu. */
const REVIEW_FIELDS = [
  { k: 'dept', label: 'Dept. Kalibrasi', options: [['QC Machining', 'QC Machining Dept.'], ['QC Vehicle', 'QC Vehicle Dept.']] },
  { k: 'control_no', label: 'Control No' },
  { k: 'tipe', label: 'Tipe', options: [['torque', 'Torque'], ['non-torque', 'Non Torque']] },
  { k: 'grp', label: 'Group (Master List)' },
  { k: 'line_name', label: 'Line' },
  { k: 'kode_line', label: 'Kode Line' },
  { k: 'kalibrator', label: 'Calibrator' },
  { k: 'tanggal_kalibrasi', label: 'Calibrator Date', type: 'date' },
  { k: 'judgement', label: 'Judgement *', options: [['OK', 'OK'], ['NG', 'NG'], ['Cancel', 'Cancel']] },
  { k: 'alasan_ng', label: 'Reason NG / Cancel (Alasan)' },
  { k: 'flow_process', label: 'Flow Process' },
  { k: 'catatan', label: 'Notes', type: 'textarea' }
];
const HANDOVER_FIELDS = [
  { k: 'catatan_serah', label: 'Note', type: 'textarea' }
];
const KELENGKAPAN = ['Certificate', 'Manual book', 'Others'];

const dateOnly = (v) => (v ? String(v).slice(0, 10) : '');

/* ---------- Cetak form (dibuka di tab baru, lalu dialog print muncul) ---------- */
function printPengajuan(r) {
  const has = (src, v) => String(src || '').toLowerCase().includes(String(v).toLowerCase());
  const box = (on) => (on ? '&#9745;' : '&#9744;');
  const opts = (src, list) => list.map(([val, label]) => `<span class="opt">${box(has(src, val))} ${label}</span>`).join('');
  const v = (x) => esc(x) || '&nbsp;';
  const sig = (x) => (x && String(x).startsWith('data:image') ? `<img src="${x}" alt="">` : esc(x || ''));
  const row = (label, value) => `<tr><th>${label}</th><td>${value}</td></tr>`;

  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8">
<title>Form Registrasi Alat Ukur #${r.id}</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font: 10px/1.3 Arial, Helvetica, sans-serif; color: #000; margin: 0; }
  h1 { font-size: 14px; text-align: center; margin: 0 0 2px; }
  .sub { text-align: center; margin: 0 0 6px; color: #333; }
  h2 { font-size: 11px; margin: 8px 0 3px; background: #e9eeff; padding: 3px 6px; border: 1px solid #000; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #000; padding: 2px 6px; vertical-align: top; text-align: left; }
  th { width: 32%; font-weight: bold; background: #f7f7f7; }
  .opt { display: inline-block; margin-right: 12px; white-space: nowrap; }
  .sigcell { height: 52px; }
  .sigcell img { max-height: 44px; max-width: 200px; display: block; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .note { margin-top: 6px; font-size: 9px; color: #444; }
  tr { page-break-inside: avoid; }
</style></head><body>
<h1>FORM REGISTRASI / CANCELLATION ALAT UKUR</h1>
<p class="sub">Sistem Kalibrasi Hino</p>
<div class="meta"><span>No. pengajuan: <b>#${r.id}</b></span><span>Status: <b>${esc(r.status)}</b></span></div>

<h2>1. Diisi oleh pemohon (Fill by the applicant)</h2>
<table>
  ${row('Form category', opts(r.kategori, [['registration', 'Registration'], ['cancellation', 'Cancellation']]))}
  ${row('Date of application (tanggal digunakan)', v(dateOnly(r.tanggal_pengajuan)))}
  ${row('Maker (pembuat)', v(r.maker))}
  ${row('Tool name (nama alat ukur)', v(r.nama_alat))}
  ${row('Serial number (nomor seri)', v(r.serial_number))}
  ${row('Type / model (jenis/model)', v(r.model))}
  ${row('Accuracy (keakuratan)', v(r.akurasi))}
  ${row('Measurement range (rentang alat ukur)', v(r.range_alat))}
  ${row('Setting (pengaturan khusus)', v(r.setting))}
  ${row('Tools usage (penggunaan alat ukur)', v(r.penggunaan))}
  ${row('Tools placement (pos 5 frame)', v(r.penempatan))}
  ${row('Category of tools', opts(r.kategori_alat, [['special', 'Special'], ['vehicle tools', 'Vehicle tools'], ['general', 'General']]))}
  ${row('Classification', opts(r.klasifikasi, [['new process', 'New process'], ['change model', 'Change model'], ['update', 'Update'], ['change process', 'Change process'], ['dispose', 'Dispose']]))}
  ${row('Reason change (alasan perubahan)', v(r.alasan_perubahan))}
  ${row('Penyerahan sertifikat, buku panduan dll', opts(r.dokumen, [['Sertifikat', 'Sertifikat'], ['Buku panduan', 'Buku panduan'], ['Lainnya', 'Lainnya']]))}
  <tr><th>TTD applicant / pemohon</th><td class="sigcell">${sig(r.ttd_pemohon)}<div>${esc(r.pemohon)}</div></td></tr>
</table>

<h2>2. Diisi oleh kalibrasi (Fill by calibration)</h2>
<table>
  ${row('Dept.', opts(r.dept, [['Machining', 'QC Machining Dept.'], ['Vehicle', 'QC Vehicle Dept.']]))}
  ${row('Completeness checklist', opts(r.kelengkapan, [['Certificate', 'Certificate'], ['Manual book', 'Manual book'], ['Others', 'Others']]))}
  ${row('Control no', v(r.control_no))}
  ${row('Notes', v(r.catatan))}
  <tr><th>TTD received / penerima</th><td class="sigcell">${sig(r.ttd_penerima)}</td></tr>
  ${row('Calibrator', v(r.kalibrator))}
  ${row('Calibrator date', v(dateOnly(r.tanggal_kalibrasi)))}
  ${row('Judgement', opts(r.judgement, [['OK', 'OK'], ['NG', 'NG'], ['Cancel', 'Cancel']]))}
  ${row('Reason NG / Cancel (alasan gagal/pembatalan)', v(r.alasan_ng))}
  ${row('Flow process', v(r.flow_process))}
</table>

<h2>3. Handover tools to applicant</h2>
<table>
  <tr><th>TTD diterima oleh</th><td class="sigcell">${sig(r.ttd_diterima_oleh)}</td></tr>
  ${row('Note', v(r.catatan_serah))}
  <tr><th>TTD diserahkan oleh</th><td class="sigcell">${sig(r.ttd_diserahkan_oleh)}</td></tr>
</table>
<p class="note">Dicetak dari Sistem Kalibrasi pada ${new Date().toLocaleString('id-ID')}.</p>
<script>window.onload = function () { setTimeout(function () { window.print(); }, 200); };<\/script>
</body></html>`;

  const w = window.open('', '_blank');
  if (!w) { alert('Pop-up diblokir browser. Izinkan pop-up untuk situs ini, lalu klik Cetak lagi.'); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/* ---------- Halaman daftar pengajuan ---------- */
function loadPengajuanMasuk(c) {
  c.innerHTML = `
    <div class="card">
      <div class="toolbar">
        <select id="p-status">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">Semua</option>
        </select>
        <span class="count" id="p-count"></span>
      </div>
      <p class="msg" id="p-msg"></p>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Tanggal</th><th>Pemohon</th><th>Kategori</th><th>Nama Alat</th><th>Serial Number</th><th>Klasifikasi</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody id="p-body"></tbody></table></div>
    </div>`;
  const st = c.querySelector('#p-status');
  const body = c.querySelector('#p-body');
  const msg = c.querySelector('#p-msg');
  let rows = [];

  async function load() {
    try {
      rows = await alatApi('/pengajuan' + (st.value ? '?status=' + st.value : ''));
      msg.textContent = '';
      c.querySelector('#p-count').textContent = rows.length + ' pengajuan';
      body.innerHTML = rows.length ? rows.map((r, i) => `<tr>
        <td>${esc(dateOnly(r.tanggal_pengajuan))}</td><td>${esc(r.pemohon)}</td><td>${esc(r.kategori)}</td>
        <td>${esc(r.nama_alat)}</td><td>${esc(r.serial_number)}</td><td>${esc(r.klasifikasi)}</td>
        <td><span class="badge ${r.status === 'approved' ? '' : r.status === 'rejected' ? 'bad' : 'warn'}">${esc(r.status)}</span></td>
        <td><div class="btn-row">
          <button class="btn btn-sm" data-act="open" data-i="${i}">${r.status === 'pending' ? 'Review' : 'Lihat'}</button>
          <button class="btn btn-sm" data-act="print" data-i="${i}">Cetak</button>
        </div></td></tr>`).join('')
        : '<tr><td colspan="8">Tidak ada pengajuan.</td></tr>';
    } catch (err) { msg.className = 'msg err'; msg.textContent = err.message; }
  }
  st.addEventListener('change', load);
  body.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const r = rows[b.dataset.i];
    if (b.dataset.act === 'print') printPengajuan(r);
    else openReview(r);
  });

  function openReview(r) {
    const locked = r.status !== 'pending';
    const detail = [['Form Category', r.kategori], ...PENG_FIELDS.map((f) => [f.label, f.k === 'tanggal_pengajuan' ? dateOnly(r[f.k]) : r[f.k]])]
      .map(([label, val]) => `<div><small>${label}</small><b>${esc(val) || '-'}</b></div>`).join('')
      + `<div><small>Dokumen diserahkan</small><b>${esc(r.dokumen) || '-'}</b></div>`
      + `<div><small>Pemohon (login)</small><b>${esc(r.pemohon)}</b></div>`
      + `<div class="wide"><small>TTD Applicant / Pemohon</small>${sigImg(r.ttd_pemohon)}</div>`;

    const sigArea = (key, label) => (locked
      ? `<div class="sig-field"><span class="sig-label">${label}</span>${sigImg(r[key])}</div>`
      : sigPadHtml(key, label, false));

    const ov = document.createElement('div');
    ov.className = 'modal-overlay';
    ov.innerHTML = `<div class="modal"><h3>Pengajuan #${r.id} - ${esc(r.kategori)}</h3>
      <form novalidate>
        <h4 class="form-section">1. Data pemohon</h4><div class="detail-grid">${detail}</div>
        <h4 class="form-section">2. Diisi oleh kalibrasi</h4>
        <div class="fld"><span>Completeness Checklist</span>${checksHtml('kelengkapan', KELENGKAPAN, r.kelengkapan)}</div>
        <div class="form-grid">${renderFields(REVIEW_FIELDS, r)}</div>
        <div class="sig-row">${sigArea('ttd_penerima', 'TTD Received / Penerima')}</div>
        <h4 class="form-section">3. Handover tools to applicant</h4>
        <div class="form-grid">${renderFields(HANDOVER_FIELDS, r)}</div>
        <div class="sig-row">${sigArea('ttd_diterima_oleh', 'TTD Diterima Oleh')}${sigArea('ttd_diserahkan_oleh', 'TTD Diserahkan Oleh')}</div>
        <p class="msg"></p>
        <div class="modal-actions"><button type="button" class="btn" data-close>Tutup</button>
          <button type="button" class="btn" data-print>Cetak</button>
          ${locked ? '' : '<button type="submit" class="btn btn-primary">Simpan & Proses</button>'}</div>
      </form></div>`;
    document.body.appendChild(ov);
    const form = ov.querySelector('form');
    const m = ov.querySelector('.msg');
    const close = () => ov.remove();
    ov.querySelector('[data-close]').onclick = close;
    ov.querySelector('[data-print]').onclick = () => {
      if (!locked) { m.className = 'msg err'; m.textContent = 'Simpan & Proses dulu supaya data terakhir ikut tercetak.'; return; }
      printPengajuan(r);
    };
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    if (locked) { form.querySelectorAll('input,select,textarea').forEach((x) => { x.disabled = true; }); return; }
    initSigPads(form);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      m.className = 'msg';
      const d = {
        ...readFields(REVIEW_FIELDS, form), ...readFields(HANDOVER_FIELDS, form),
        kelengkapan: checksVal(form, 'kelengkapan'),
        ttd_penerima: sigValue(form, 'ttd_penerima'),
        ttd_diterima_oleh: sigValue(form, 'ttd_diterima_oleh'),
        ttd_diserahkan_oleh: sigValue(form, 'ttd_diserahkan_oleh')
      };
      if (!d.judgement) { m.classList.add('err'); m.textContent = 'Judgement wajib dipilih.'; return; }
      if (!confirm(d.judgement === 'OK' ? 'Setujui pengajuan ini?' : 'Tolak pengajuan ini?')) return;
      try {
        const res = await alatApi(`/pengajuan/${r.id}/review`, 'PUT', d);
        close();
        msg.className = 'msg ok'; msg.textContent = res.message;
        load();
      } catch (err) { m.classList.add('err'); m.textContent = err.message; }
    });
  }
  load();
}