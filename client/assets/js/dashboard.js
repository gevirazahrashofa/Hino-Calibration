document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Auth & role ---------- */
  const getAuth = (k) => localStorage.getItem(k) || sessionStorage.getItem(k);
  if (!getAuth('token')) { window.location.href = '/'; return; }

  const role = String(getAuth('role') || '').toLowerCase() === 'admin' ? 'admin' : 'user';
  const isAdmin = role === 'admin';
  window.APP_ROLE = role; // bisa dipakai file halaman lain (daftar-alat.js, dll)

  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  const contentArea = document.getElementById('content-area');
  const menuList = document.getElementById('menu-list');
  const btnToggle = document.getElementById('btn-toggle-sidebar');
  const btnLogout = document.getElementById('btn-logout');
  const backdrop = document.getElementById('sidebar-backdrop');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  const userName = document.getElementById('user-name');
  const userRole = document.getElementById('user-role');
  const isMobile = () => window.innerWidth <= 768;

  const username = getAuth('username') || 'Pengguna';
  userName.textContent = username;
  userRole.textContent = isAdmin ? 'Admin' : 'User';

  /* ---------- Konfigurasi menu (satu sumber untuk admin & user) ----------
     roles : siapa yang boleh melihat. Kosong = admin dan user.
     fn    : nama fungsi halaman di assets/js/pages/*.js                  */
  const MENU = [
    { label: 'Dashboard', icon: 'grid', page: 'dashboard' },
    { label: 'Registration', icon: 'doc', children: [
      { label: 'Pengajuan Registration', page: 'pengajuan-masuk', fn: 'loadPengajuanMasuk', roles: ['admin'] },
      { label: 'Form Registration', page: 'form-registrasi', fn: 'loadFormRegistrasi', roles: ['user'] },
      { label: 'List Registrasi Alat Ukur', page: 'daftar-alat', fn: 'loadDaftarAlat' }
    ]},
    { label: 'Calibration', icon: 'gauge', children: [
      { label: 'Master List', children: [
        { label: 'Checksheet Kalibrasi', page: 'checksheet-kalibrasi', fn: 'loadChecksheetKalibrasi' },
        { label: 'Schedule', page: 'schedule', fn: 'loadSchedule' }
      ]}
    ]},
    { label: 'Traceability', icon: 'trace', children: [
      { label: 'Master Data Spare', page: 'data-master-spare', fn: 'loadDataMasterSpare' },
      { label: 'Input Traceability', page: 'schedule-traceability', fn: 'loadScheduleTraceability' }
    ]},
    { label: 'History', icon: 'history', children: [
      { label: 'History Pembatalan', page: 'riwayat-traceability', fn: 'loadRiwayatTraceability' }
    ]},
    { label: 'System', icon: 'gear', roles: ['admin'], children: [
      { label: 'Manajemen Akun', page: 'manajemen-akun', fn: 'loadManajemenAkun' },
      { label: 'Setting', page: 'pengaturan', fn: 'loadPengaturan' }
    ]}
  ];

  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
    gauge: '<circle cx="12" cy="12" r="9"/><path d="m12 12 4-4M8 15h.01M12 7h.01M7 11h.01"/>',
    trace: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 4-6 3-12 6"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>'
  };
  const CHEV = '<svg class="chevron" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';

  const canSee = (it) => !it.roles || it.roles.includes(role);

  // Daftar halaman yang BOLEH dibuka role ini (dipakai juga sebagai penjaga akses)
  const PAGES = { dashboard: { title: null, fn: null } };
  (function collect(items, inherited) {
    items.forEach((it) => {
      const roles = it.roles || inherited;
      if (it.children) return collect(it.children, roles);
      if (it.page && (!roles || roles.includes(role))) PAGES[it.page] = { title: it.label, fn: it.fn };
    });
  })(MENU, null);

  /* ---------- Render sidebar sesuai role ---------- */
  const leaf = (it, cls) => `<li class="${cls}" data-page="${it.page}">${it.label}</li>`;
  menuList.innerHTML = MENU.filter(canSee).map((m) => {
    const icon = `<svg class="icon" viewBox="0 0 24 24">${ICONS[m.icon]}</svg>`;
    if (!m.children) {
      return `<li class="menu-item ${m.page === 'dashboard' ? 'active' : ''}" data-page="${m.page}"><div class="menu-label">${icon}<span>${m.label}</span></div></li>`;
    }
    const subs = m.children.filter(canSee).map((c) => c.children
      ? `<li class="submenu-item has-submenu-inner"><div class="submenu-label"><span>${c.label}</span>${CHEV}</div>
           <ul class="submenu-inner">${c.children.filter(canSee).map((g) => leaf(g, 'submenu-inner-item')).join('')}</ul></li>`
      : leaf(c, 'submenu-item')).join('');
    return `<li class="menu-item has-submenu"><div class="menu-label">${icon}<span>${m.label}</span>${CHEV}</div><ul class="submenu">${subs}</ul></li>`;
  }).join('');

  /* =====================================================================
     ISI HALAMAN DASHBOARD  (SEMUA DATA DI BAWAH INI ADALAH CONTOH / DUMMY)
     Tidak terhubung ke menu lain maupun database.
     Cari tulisan "DATA CONTOH" untuk mengganti isinya.
     ===================================================================== */

  /* ---------- DATA CONTOH 1: angka ringkasan ---------- */
  const TOTAL_TORSI = 96;
  const TOTAL_NON_TORSI = 152;
  const TOTAL_ALAT = TOTAL_TORSI + TOTAL_NON_TORSI;

  /* ---------- DATA CONTOH 2: group & jadwal kalibrasi alat torsi ---------- */
  const GROUPS = ['Machining A', 'Machining B', 'Assembly', 'Vehicle QC'];
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const TORQUE_MODELS = ['Torque Wrench 50 Nm', 'Torque Wrench 100 Nm', 'Torque Wrench 200 Nm', 'Torque Wrench 350 Nm', 'Torque Driver 10 Nm', 'Torque Driver 25 Nm'];

  // angka acak yang selalu sama untuk masukan yang sama (supaya data contoh stabil)
  const rnd = (...a) => {
    let h = 2166136261;
    for (const c of a.join('|')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };

  // Jadwal alat torsi pada satu tanggal (Sabtu & Minggu libur). m = 0..11
  function jadwalHari(y, m, d) {
    const dow = new Date(y, m, d).getDay();
    if (dow === 0 || dow === 6) return [];
    const out = [];
    GROUPS.forEach((g, gi) => {
      const r = rnd(y, m, d, g) % 5;
      const n = r === 0 ? 0 : (r % 3) + 1; // 0..3 alat per group
      for (let i = 0; i < n; i++) {
        out.push({
          id: `${y}-${m}-${d}-${gi}-${i}`,
          group: g,
          nama: TORQUE_MODELS[rnd(y, m, d, g, i) % TORQUE_MODELS.length],
          no: `TQ-${100 + (rnd(g, d, i, m) % 900)}`
        });
      }
    });
    return out;
  }

  const NOW = new Date();
  const TODAY = { y: NOW.getFullYear(), m: NOW.getMonth(), d: NOW.getDate() };
  const todayList = jadwalHari(TODAY.y, TODAY.m, TODAY.d);

  /* ---------- DATA CONTOH 3: alat baru perlu review (admin) & pengajuan user ---------- */
  const ALAT_BARU = [
    { tgl: '07 Okt 2026', nama: 'Torque Wrench 200 Nm', pengaju: 'Budi', tipe: 'Torsi' },
    { tgl: '06 Okt 2026', nama: 'Micrometer 0-25 mm', pengaju: 'Sari', tipe: 'Non-torsi' },
    { tgl: '06 Okt 2026', nama: 'Torque Driver 10 Nm', pengaju: 'Andi', tipe: 'Torsi' },
    { tgl: '05 Okt 2026', nama: 'Dial Gauge 10 mm', pengaju: 'Rina', tipe: 'Non-torsi' },
    { tgl: '03 Okt 2026', nama: 'Caliper Digital 150 mm', pengaju: 'Budi', tipe: 'Non-torsi' }
  ];
  const PENGAJUAN_USER = [
    { tgl: '07 Okt 2026', nama: 'Torque Wrench 200 Nm', tipe: 'Torsi', status: 'Pending' },
    { tgl: '03 Okt 2026', nama: 'Caliper Digital 150 mm', tipe: 'Non-torsi', status: 'Pending' },
    { tgl: '27 Sep 2026', nama: 'Dial Gauge 10 mm', tipe: 'Non-torsi', status: 'Approved' },
    { tgl: '20 Sep 2026', nama: 'Torque Driver 25 Nm', tipe: 'Torsi', status: 'Approved' },
    { tgl: '12 Sep 2026', nama: 'Height Gauge 300 mm', tipe: 'Non-torsi', status: 'Rejected' }
  ];

  /* ---------- DATA CONTOH 4: hasil kalibrasi OK / NG untuk grafik ---------- */
  const isFuture = (y, m) => y > TODAY.y || (y === TODAY.y && m > TODAY.m);
  function hasilBulan(g, y, m) {
    if (isFuture(y, m)) return { ok: 0, ng: 0 };
    const gs = g === 'all' ? GROUPS : [g];
    let ok = 0, ng = 0;
    gs.forEach((x) => {
      const total = 18 + (rnd(x, y, m) % 12);
      const n = rnd(x, y, m, 'ng') % 6;
      ng += n; ok += total - n;
    });
    return { ok, ng };
  }
  function hasilMinggu(g, y, m, w) {
    if (isFuture(y, m)) return { ok: 0, ng: 0 };
    const gs = g === 'all' ? GROUPS : [g];
    let ok = 0, ng = 0;
    gs.forEach((x) => {
      const total = 4 + (rnd(x, y, m, w) % 5);
      const n = rnd(x, y, m, w, 'ng') % 3;
      ng += n; ok += total - n;
    });
    return { ok, ng };
  }

  /* ---------- State dashboard (bertahan selama halaman tidak di-refresh) ---------- */
  const dash = {
    cal: { y: TODAY.y, m: TODAY.m },
    sel: { ...TODAY },
    done: new Set(todayList.slice(0, Math.floor(todayList.length * 0.4)).map((t) => t.id)),
    chart: { group: 'all', year: TODAY.y, month: 'all', table: false }
  };

  /* ---------- Potongan HTML kecil ---------- */
  const statCard = (label, value, tone = '') =>
    `<div class="card stat-card ${tone}"><div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div></div>`;
  const tr = (...cells) => `<tr>${cells.map((x) => `<td>${x}</td>`).join('')}</tr>`;
  const table = (heads, rows) =>
    `<div class="table-wrap"><table class="data-table"><thead><tr>${heads.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
  const statusBadge = (s) => `<span class="badge ${s === 'Pending' ? 'warn' : s === 'Rejected' ? 'bad' : ''}">${s}</span>`;
  const tipeBadge = (t) => `<span class="badge ${t === 'Torsi' ? 'blue' : ''}">${t}</span>`;
  const fmtTgl = (d) => `${d.d} ${BULAN[d.m]} ${d.y}`;
  const isToday = (y, m, d) => y === TODAY.y && m === TODAY.m && d === TODAY.d;

  /* ---------- Kerangka halaman ---------- */
  function dashboardHtml() {
    const belum = todayList.filter((t) => !dash.done.has(t.id)).length;
    const bawah = isAdmin
      ? `<section class="card"><div class="db-head"><h3>Alat Ukur Baru Perlu Review</h3><span class="badge warn">${ALAT_BARU.length} menunggu</span></div>
          ${table(['Tanggal', 'Nama Alat', 'Diajukan Oleh', 'Tipe', 'Status'],
            ALAT_BARU.map((a) => tr(a.tgl, a.nama, a.pengaju, tipeBadge(a.tipe), '<span class="badge warn">Menunggu review</span>')).join(''))}
        </section>`
      : `<section class="card"><div class="db-head"><h3>Alat Ukur yang Saya Ajukan</h3><span class="badge blue">${PENGAJUAN_USER.length} pengajuan</span></div>
          ${table(['Tanggal', 'Nama Alat', 'Tipe', 'Status'],
            PENGAJUAN_USER.map((a) => tr(a.tgl, a.nama, tipeBadge(a.tipe), statusBadge(a.status))).join(''))}
        </section>`;

    return `
      <div class="db-note">Data di dashboard ini masih contoh (dummy) dan belum terhubung ke menu lain.</div>
      <section class="stat-grid">
        ${statCard('Total Semua Alat Ukur', TOTAL_ALAT)}
        ${statCard('Total Alat Torsi', TOTAL_TORSI, 'ok')}
        ${statCard('Total Alat Non-Torsi', TOTAL_NON_TORSI)}
        ${statCard('Torsi Belum Dikalibrasi Hari Ini', `<span id="db-belum-stat">${belum}</span>`, 'warn')}
      </section>

      <section class="panel-grid">
        <div class="card" id="db-cal"></div>
        <div class="card" id="db-plan"></div>
      </section>

      ${bawah}

      <section class="card" id="db-chart"></section>`;
  }

  /* ---------- Kalender umum ---------- */
  function renderCalendar(root) {
    const { y, m } = dash.cal;
    const first = (new Date(y, m, 1).getDay() + 6) % 7; // Senin = 0
    const days = new Date(y, m + 1, 0).getDate();
    let cells = HARI.map((h) => `<div class="db-dow">${h}</div>`).join('');
    for (let i = 0; i < first; i++) cells += '<div class="db-day empty"></div>';
    for (let d = 1; d <= days; d++) {
      const n = jadwalHari(y, m, d).length;
      const cls = ['db-day', isToday(y, m, d) ? 'today' : '', dash.sel.y === y && dash.sel.m === m && dash.sel.d === d ? 'sel' : ''].join(' ');
      cells += `<button type="button" class="${cls}" data-day="${d}" aria-label="${d} ${BULAN[m]}: ${n} alat torsi"><span class="db-dn">${d}</span>${n ? `<span class="db-chip">${n} alat</span>` : ''}</button>`;
    }

    const s = dash.sel;
    const list = jadwalHari(s.y, s.m, s.d);
    const per = GROUPS.map((g) => [g, list.filter((t) => t.group === g).length]).filter((x) => x[1] > 0);
    const detail = per.length
      ? per.map(([g, n]) => `<div class="db-grow"><span class="db-gname">${g}</span><span class="db-gnum">${n} alat torsi</span></div>`).join('')
      : '<div class="db-empty">Tidak ada jadwal kalibrasi torsi.</div>';

    root.querySelector('#db-cal').innerHTML = `
      <div class="db-head">
        <h3>Kalender Kalibrasi Torsi</h3>
        <div class="db-nav">
          <button type="button" class="btn btn-sm" data-cal="-1" aria-label="Bulan sebelumnya">‹</button>
          <span class="db-month">${BULAN[m]} ${y}</span>
          <button type="button" class="btn btn-sm" data-cal="1" aria-label="Bulan berikutnya">›</button>
        </div>
      </div>
      <div class="db-cal-grid">${cells}</div>
      <div class="db-detail">
        <div class="db-detail-title">Jadwal ${fmtTgl(s)}${isToday(s.y, s.m, s.d) ? ' <span class="badge blue">Hari ini</span>' : ''}</div>
        ${detail}
      </div>`;
  }

  /* ---------- Plan vs Actual + daftar belum dikalibrasi ---------- */
  function renderPlan(root) {
    const plan = todayList.length;
    const actual = todayList.filter((t) => dash.done.has(t.id)).length;
    const sisa = plan - actual;
    const pct = plan ? Math.round((actual / plan) * 100) : 0;
    const belum = todayList.filter((t) => !dash.done.has(t.id));

    const perGroup = GROUPS.map((g) => {
      const p = todayList.filter((t) => t.group === g);
      const a = p.filter((t) => dash.done.has(t.id)).length;
      return p.length
        ? `<div class="bar-row"><span class="bar-name">${g}</span><div class="bar-track"><div class="bar-fill" style="width:${(a / p.length) * 100}%"></div></div><span class="bar-num">${a}/${p.length}</span></div>`
        : '';
    }).join('');

    const rows = belum.length
      ? belum.map((t) => `<div class="row-item"><span class="date">${t.no}</span><span class="name">${t.nama}<small class="db-sub">${t.group}</small></span>${
          isAdmin ? `<button type="button" class="btn btn-sm" data-done="${t.id}">Simulasi isi</button>` : '<span class="badge warn">Belum</span>'
        }</div>`).join('')
      : `<div class="db-empty">${plan ? 'Semua alat torsi hari ini sudah dikalibrasi.' : 'Tidak ada jadwal torsi hari ini.'}</div>`;

    root.querySelector('#db-plan').innerHTML = `
      <div class="db-head"><h3>Plan vs Actual Hari Ini</h3><span class="badge blue">${pct}%</span></div>
      <div class="db-pa">
        <div><div class="db-pa-num">${plan}</div><div class="db-pa-lbl">Plan</div></div>
        <div><div class="db-pa-num">${actual}</div><div class="db-pa-lbl">Actual</div></div>
        <div><div class="db-pa-num warn">${sisa}</div><div class="db-pa-lbl">Sisa</div></div>
      </div>
      <div class="bar-track db-pa-bar"><div class="bar-fill" style="width:${pct}%"></div></div>
      ${perGroup ? `<div class="db-pergroup">${perGroup}</div>` : ''}
      <div class="db-subhead">Torsi belum dikalibrasi hari ini</div>
      <div class="row-list">${rows}</div>
      ${isAdmin ? '<div class="db-hint">Nanti angka Actual bertambah otomatis saat admin menyimpan checksheet. Tombol di atas hanya simulasi.</div>' : ''}`;

    const el = root.querySelector('#db-belum-stat');
    if (el) el.textContent = sisa;
  }

  /* ---------- Grafik OK vs NG (SVG, tanpa library) ---------- */
  const C_OK = '#6683ea', C_NG = '#f0566a';
  function chartData() {
    const { group, year, month } = dash.chart;
    if (month === 'all') {
      return BULAN.map((b, i) => ({ label: b.slice(0, 3), ...hasilBulan(group, year, i) }));
    }
    return [1, 2, 3, 4].map((w) => ({ label: `Minggu ${w}`, ...hasilMinggu(group, year, Number(month), w) }));
  }
  const niceMax = (v) => { const s = [4, 8, 12, 20, 28, 40, 60, 80, 100, 200]; return s.find((x) => x >= v) || Math.ceil(v / 50) * 50; };
  function barPath(x, y, w, h, r) {
    r = Math.min(r, w / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }

  function renderChart(root) {
    const st = dash.chart;
    const data = chartData();
    const totOk = data.reduce((a, d) => a + d.ok, 0);
    const totNg = data.reduce((a, d) => a + d.ng, 0);
    const pctNg = totOk + totNg ? ((totNg / (totOk + totNg)) * 100).toFixed(1) : '0.0';

    const W = 760, H = 300, L = 40, R = 10, T = 14, B = 34;
    const iw = W - L - R, ih = H - T - B;
    const max = niceMax(Math.max(1, ...data.map((d) => Math.max(d.ok, d.ng))));
    const yy = (v) => T + ih - (v / max) * ih;
    const band = iw / data.length;
    const bw = Math.min(22, band / 2 - 4);

    let svg = '';
    for (let i = 0; i <= 4; i++) {
      const v = (max / 4) * i, y = yy(v);
      svg += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" class="db-grid"/><text x="${L - 8}" y="${y + 4}" text-anchor="end" class="db-axis">${Math.round(v)}</text>`;
    }
    data.forEach((d, i) => {
      const cx = L + band * i + band / 2;
      const hOk = (d.ok / max) * ih, hNg = (d.ng / max) * ih;
      if (d.ok) svg += `<path d="${barPath(cx - bw - 1, yy(d.ok), bw, hOk, 4)}" fill="${C_OK}"/>`;
      if (d.ng) svg += `<path d="${barPath(cx + 1, yy(d.ng), bw, hNg, 4)}" fill="${C_NG}"/>`;
      svg += `<text x="${cx}" y="${H - 12}" text-anchor="middle" class="db-axis">${d.label}</text>`;
      svg += `<rect class="db-hit" data-i="${i}" x="${L + band * i}" y="${T}" width="${band}" height="${ih + B}" fill="transparent"/>`;
    });

    const opt = (arr, cur) => arr.map(([v, t]) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${t}</option>`).join('');
    const years = [TODAY.y - 2, TODAY.y - 1, TODAY.y].map((y) => [y, y]);
    const body = st.table
      ? table([st.month === 'all' ? 'Bulan' : 'Minggu', 'OK', 'NG'], data.map((d) => tr(d.label, d.ok, d.ng)).join(''))
      : `<div class="db-chart-wrap">
           <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik jumlah alat ukur OK dan NG">${svg}</svg>
           <div class="db-tip" id="db-tip" hidden></div>
         </div>`;

    root.querySelector('#db-chart').innerHTML = `
      <div class="db-head"><h3>Grafik Alat Ukur OK vs NG</h3>
        <button type="button" class="btn btn-sm" data-chart-table>${st.table ? 'Tampilkan grafik' : 'Tampilkan tabel'}</button></div>
      <div class="db-filters">
        <label>Group<select data-f="group">${opt([['all', 'Semua group'], ...GROUPS.map((g) => [g, g])], st.group)}</select></label>
        <label>Bulan<select data-f="month">${opt([['all', 'Semua bulan'], ...BULAN.map((b, i) => [i, b])], st.month)}</select></label>
        <label>Tahun<select data-f="year">${opt(years, st.year)}</select></label>
      </div>
      <div class="db-kpis">
        <span class="db-kpi"><i class="db-dot" style="background:${C_OK}"></i>OK <b>${totOk}</b></span>
        <span class="db-kpi"><i class="db-dot" style="background:${C_NG}"></i>NG <b>${totNg}</b></span>
        <span class="db-kpi muted">Persentase NG <b>${pctNg}%</b></span>
      </div>
      ${body}`;
  }

  /* ---------- Pasang semua widget + event ---------- */
  function initDashboard(root) {
    renderCalendar(root); renderPlan(root); renderChart(root);
    if (root.dataset.dbBound) return; // event cukup dipasang sekali
    root.dataset.dbBound = '1';

    root.addEventListener('click', (e) => {
      const nav = e.target.closest('[data-cal]');
      if (nav) {
        const t = new Date(dash.cal.y, dash.cal.m + Number(nav.dataset.cal), 1);
        dash.cal = { y: t.getFullYear(), m: t.getMonth() };
        renderCalendar(root); return;
      }
      const day = e.target.closest('[data-day]');
      if (day) { dash.sel = { y: dash.cal.y, m: dash.cal.m, d: Number(day.dataset.day) }; renderCalendar(root); return; }
      const done = e.target.closest('[data-done]');
      if (done) { dash.done.add(done.dataset.done); renderPlan(root); return; }
      if (e.target.closest('[data-chart-table]')) { dash.chart.table = !dash.chart.table; renderChart(root); }
    });

    root.addEventListener('change', (e) => {
      const f = e.target.closest('[data-f]');
      if (!f) return;
      dash.chart[f.dataset.f] = f.dataset.f === 'group' || f.value === 'all' ? f.value : Number(f.value);
      renderChart(root);
    });

    // Tooltip grafik
    root.addEventListener('mousemove', (e) => {
      const tip = root.querySelector('#db-tip');
      const hit = e.target.closest && e.target.closest('.db-hit');
      if (!tip) return;
      if (!hit) { tip.hidden = true; return; }
      const d = chartData()[Number(hit.dataset.i)];
      const wrap = tip.parentElement.getBoundingClientRect();
      tip.innerHTML = `<b>${d.label}</b><br><i class="db-dot" style="background:${C_OK}"></i>OK: ${d.ok}<br><i class="db-dot" style="background:${C_NG}"></i>NG: ${d.ng}`;
      tip.hidden = false;
      tip.style.left = Math.min(e.clientX - wrap.left + 14, wrap.width - 120) + 'px';
      tip.style.top = Math.max(e.clientY - wrap.top - 10, 0) + 'px';
    });
    root.addEventListener('mouseleave', () => { const t = root.querySelector('#db-tip'); if (t) t.hidden = true; });
  }


  /* ---------- Router halaman ---------- */
  function loadPage(name) {
    const page = PAGES[name];

    if (name === 'dashboard') {
      pageTitle.innerHTML = `Halo, <span id="greeting-name">${username}</span>`;
      pageSubtitle.textContent = isAdmin
        ? 'Selamat datang di Dashboard Admin Sistem Kalibrasi'
        : 'Selamat datang di Dashboard Sistem Kalibrasi';
      contentArea.innerHTML = dashboardHtml();
      initDashboard(contentArea);
      return;
    }

    // Penjaga akses: halaman di luar menu role ini tidak bisa dibuka
    if (!page) {
      pageTitle.textContent = 'Akses ditolak';
      pageSubtitle.textContent = 'Sistem Kalibrasi Hino';
      contentArea.innerHTML = '<div class="card"><h3>Anda tidak punya akses ke halaman ini</h3></div>';
      return;
    }

    pageTitle.textContent = page.title;
    pageSubtitle.textContent = 'Sistem Kalibrasi Hino';
    const render = page.fn && typeof window[page.fn] === 'function' ? window[page.fn] : null;
    if (render) render(contentArea);
    else contentArea.innerHTML = `<div class="card"><h3>${page.title}</h3><p>Halaman ini belum dibuat.</p></div>`;
  }

  // Tombol di dalam konten (data-go="nama-halaman") membuka halaman + menyorot menu
  contentArea.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    const target = b && menuList.querySelector(`[data-page="${b.dataset.go}"]`);
    if (target) target.click();
  });

  /* ---------- Sidebar ---------- */
  function setSidebar(open) {
    if (isMobile()) {
      sidebar.classList.toggle('open', open);
      backdrop.classList.toggle('show', open);
    } else {
      sidebar.classList.toggle('collapsed', !open);
      mainContent.classList.toggle('expanded', !open);
    }
  }
  btnToggle.addEventListener('click', () => {
    setSidebar(isMobile() ? !sidebar.classList.contains('open') : sidebar.classList.contains('collapsed'));
  });
  backdrop.addEventListener('click', () => setSidebar(false));

  const clearActive = () => sidebar.querySelectorAll('.active').forEach((el) => el.classList.remove('active'));

  // Menu level 1
  menuList.querySelectorAll('.menu-item > .menu-label').forEach((label) => {
    label.addEventListener('click', () => {
      const item = label.parentElement;
      if (item.classList.contains('has-submenu')) {
        const wasOpen = item.classList.contains('open');
        menuList.querySelectorAll('.menu-item.open').forEach((m) => m.classList.remove('open'));
        item.classList.toggle('open', !wasOpen);
      } else {
        clearActive();
        item.classList.add('active');
        loadPage(item.dataset.page);
        if (isMobile()) setSidebar(false);
      }
    });
  });

  // Master List (punya anak)
  menuList.querySelectorAll('.has-submenu-inner > .submenu-label').forEach((label) => {
    label.addEventListener('click', (e) => { e.stopPropagation(); label.parentElement.classList.toggle('open'); });
  });

  // Submenu biasa & anak Master List
  menuList.querySelectorAll('.submenu-item:not(.has-submenu-inner), .submenu-inner-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      clearActive();
      item.classList.add('active');
      item.closest('.menu-item').classList.add('active', 'open');
      const inner = item.closest('.has-submenu-inner');
      if (inner) inner.classList.add('open');
      loadPage(item.dataset.page);
      if (isMobile()) setSidebar(false);
    });
  });

  /* ---------- Logout ---------- */
  btnLogout.addEventListener('click', async () => {
    try {
      if (typeof apiRequest === 'function') await apiRequest('/auth/logout', 'POST');
    } catch (e) {
      // abaikan, tetap logout di sisi browser
    } finally {
      ['token', 'username', 'role'].forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
      window.location.href = '/';
    }
  });

  loadPage('dashboard');
});