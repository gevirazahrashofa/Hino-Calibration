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

  /* ---------- Isi halaman Dashboard: beda untuk admin & user ---------- */
  // Data di bawah masih contoh. Ganti dengan data dari API Anda.
  const statCard = (label, value, tone = '') =>
    `<div class="card stat-card ${tone}"><div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div></div>`;
  const row = (date, name, status, tone = '', action = '') =>
    `<div class="row-item"><span class="date">${date}</span><span class="name">${name}</span><span class="badge ${tone}">${status}</span>${action}</div>`;
  const bar = (name, n, total, tone = '') =>
    `<div class="bar-row"><span class="bar-name">${name}</span><div class="bar-track"><div class="bar-fill ${tone}" style="width:${(n / total) * 100}%"></div></div><span class="bar-num">${n}</span></div>`;
  const tr = (...cells) => `<tr>${cells.map((x) => `<td>${x}</td>`).join('')}</tr>`;
  const table = (heads, rows) =>
    `<div class="table-wrap"><table class="data-table"><thead><tr>${heads.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;

  function dashboardAdmin() {
    return `
      <section class="stat-grid">
        ${statCard('Pengajuan Menunggu ACC', 7, 'warn')}
        ${statCard('Total Alat Ukur', 248)}
        ${statCard('Jadwal Bulan Ini', 36, 'ok')}
        ${statCard('Melewati Jatuh Tempo', 4, 'bad')}
      </section>
      <section class="panel-grid">
        <div class="card"><h3>Pengajuan Menunggu ACC</h3><div class="row-list">
          ${row('01 Okt 2026', 'Torque Wrench - Budi', 'Pending', 'warn', '<button class="btn btn-sm" data-go="pengajuan-masuk">Review</button>')}
          ${row('30 Sep 2026', 'Micrometer - Sari', 'Pending', 'warn', '<button class="btn btn-sm" data-go="pengajuan-masuk">Review</button>')}
          ${row('29 Sep 2026', 'Dial Gauge - Andi', 'Pending', 'warn', '<button class="btn btn-sm" data-go="pengajuan-masuk">Review</button>')}
        </div></div>
        <div class="card"><h3>Status Alat Ukur</h3>
          ${bar('Valid', 196, 248, 'ok')}${bar('Mendekati', 12, 248, 'warn')}${bar('Kadaluarsa', 4, 248, 'bad')}${bar('Dalam proses', 36, 248)}
        </div>
      </section>
      <section class="card"><h3>Aktivitas Terbaru</h3>
        ${table(['Tanggal', 'Alat Ukur', 'Aktivitas', 'Oleh', 'Status'], [
          tr('30 Sep 2026', 'Micrometer 0-25 mm', 'Checksheet kalibrasi diisi', 'Admin', '<span class="badge">Selesai</span>'),
          tr('29 Sep 2026', 'Dial Gauge 10 mm', 'Registrasi disetujui', 'Admin', '<span class="badge blue">Disetujui</span>'),
          tr('28 Sep 2026', 'Torque Wrench 200 Nm', 'Jadwal diperbarui', 'Admin', '<span class="badge warn">Terjadwal</span>')
        ].join(''))}
      </section>`;
  }

  function dashboardUser() {
    return `
      <section class="stat-grid">
        ${statCard('Pengajuan Saya', 5)}
        ${statCard('Menunggu Persetujuan', 2, 'warn')}
        ${statCard('Disetujui', 2, 'ok')}
        ${statCard('Ditolak', 1, 'bad')}
      </section>
      <section class="panel-grid">
        <div class="card"><h3>Aksi Cepat</h3>
          <div class="row-list">
            <button class="btn btn-primary" data-go="form-registrasi">Isi Form Registration</button>
            <button class="btn" data-go="daftar-alat">Cari Alat Ukur</button>
            <button class="btn" data-go="schedule">Lihat Schedule Kalibrasi</button>
          </div></div>
        <div class="card"><h3>Jadwal Kalibrasi Terdekat</h3><div class="row-list">
          ${row('03 Okt 2026', 'Micrometer 0-25 mm', 'Terjadwal')}
          ${row('05 Okt 2026', 'Caliper Digital 150 mm', 'Terjadwal')}
          ${row('08 Okt 2026', 'Torque Wrench 200 Nm', 'Segera', 'warn')}
        </div></div>
      </section>
      <section class="card"><h3>Pengajuan Saya Terbaru</h3>
        ${table(['Tanggal', 'Kategori', 'Nama Alat', 'Status'], [
          tr('01 Okt 2026', 'Registration', 'Torque Wrench', '<span class="badge warn">Pending</span>'),
          tr('27 Sep 2026', 'Registration', 'Dial Gauge', '<span class="badge">Approved</span>'),
          tr('20 Sep 2026', 'Cancellation', 'Caliper', '<span class="badge bad">Rejected</span>')
        ].join(''))}
      </section>`;
  }

  /* ---------- Router halaman ---------- */
  function loadPage(name) {
    const page = PAGES[name];

    if (name === 'dashboard') {
      pageTitle.innerHTML = `Halo, <span id="greeting-name">${username}</span>`;
      pageSubtitle.textContent = isAdmin
        ? 'Selamat datang di Dashboard Admin Sistem Kalibrasi'
        : 'Selamat datang di Dashboard Sistem Kalibrasi';
      contentArea.innerHTML = isAdmin ? dashboardAdmin() : dashboardUser();
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