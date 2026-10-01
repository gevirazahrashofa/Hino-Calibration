document.addEventListener('DOMContentLoaded', () => {
const getAuth = (key) => localStorage.getItem(key) || sessionStorage.getItem(key);

if (!getAuth('token')) {
  window.location.href = '/';
  return;
}
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  const contentArea = document.getElementById('content-area');
  const btnToggle = document.getElementById('btn-toggle-sidebar');
  const btnLogout = document.getElementById('btn-logout');
  const backdrop = document.getElementById('sidebar-backdrop');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  const greetingName = document.getElementById('greeting-name');
  const userName = document.getElementById('user-name');
  const userRole = document.getElementById('user-role');

  const isMobile = () => window.innerWidth <= 768;

  function renderDashboardHome(container) {
    container.innerHTML = `
      <section class="stat-grid">
        ${statCard('Total Alat Ukur', 248, '')}
        ${statCard('Jadwal Bulan Ini', 36, 'ok')}
        ${statCard('Mendekati Jatuh Tempo', 12, 'warn')}
        ${statCard('Melewati Jatuh Tempo', 4, 'bad')}
      </section>

      <section class="panel-grid">
        <div class="card">
          <h3>Jadwal Kalibrasi Terdekat</h3>
          <div class="row-list">
            ${scheduleRow('03 Okt 2026', 'Micrometer 0-25 mm', 'Terjadwal', '')}
            ${scheduleRow('05 Okt 2026', 'Caliper Digital 150 mm', 'Terjadwal', '')}
            ${scheduleRow('08 Okt 2026', 'Torque Wrench 200 Nm', 'Segera', 'warn')}
            ${scheduleRow('12 Okt 2026', 'Pressure Gauge 10 bar', 'Terjadwal', '')}
          </div>
        </div>

        <div class="card">
          <h3>Status Alat Ukur</h3>
          ${barRow('Valid', 196, 248, 'ok')}
          ${barRow('Mendekati', 12, 248, 'warn')}
          ${barRow('Kadaluarsa', 4, 248, 'bad')}
          ${barRow('Dalam proses', 36, 248, '')}
        </div>
      </section>

      <section class="card">
        <h3>Aktivitas Terbaru</h3>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>Tanggal</th><th>Alat Ukur</th><th>Aktivitas</th><th>Oleh</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${activityRow('30 Sep 2026', 'Micrometer 0-25 mm', 'Checksheet kalibrasi diisi', 'Admin', 'Selesai', '')}
              ${activityRow('29 Sep 2026', 'Dial Gauge 10 mm', 'Registrasi alat baru', 'Budi', 'Disetujui', 'blue')}
              ${activityRow('28 Sep 2026', 'Torque Wrench 200 Nm', 'Jadwal diperbarui', 'Admin', 'Terjadwal', 'warn')}
            </tbody>
          </table>
        </div>
      </section>`;
  }

  function statCard(label, value, tone) {
    return `<div class="card stat-card ${tone}">
      <div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>
    </div>`;
  }
  function scheduleRow(date, name, status, tone) {
    return `<div class="row-item"><span class="date">${date}</span><span class="name">${name}</span><span class="badge ${tone}">${status}</span></div>`;
  }
  function barRow(name, n, total, tone) {
    return `<div class="bar-row"><span class="bar-name">${name}</span>
      <div class="bar-track"><div class="bar-fill ${tone}" style="width:${(n / total) * 100}%"></div></div>
      <span class="bar-num">${n}</span></div>`;
  }
  function activityRow(date, tool, act, by, status, tone) {
    return `<tr><td>${date}</td><td>${tool}</td><td>${act}</td><td>${by}</td><td><span class="badge ${tone}">${status}</span></td></tr>`;
  }

  /* ---------- Router halaman ---------- */
  const fn = (name) => (typeof window[name] === 'function' ? window[name] : null);

  const pages = {
    'dashboard':             { title: null, render: renderDashboardHome },
    'form-registrasi':       { title: 'Form Registrasi', render: fn('loadFormRegistrasi') },
    'daftar-alat':           { title: 'List Registrasi Alat Ukur', render: fn('loadDaftarAlat') },
    'checksheet-kalibrasi':  { title: 'Checksheet Kalibrasi', render: fn('loadChecksheetKalibrasi') },
    'schedule':              { title: 'Schedule', render: fn('loadSchedule') },
    'data-master-spare':     { title: 'Master Data Spare', render: fn('loadDataMasterSpare') },
    'schedule-traceability': { title: 'Input Traceability', render: fn('loadScheduleTraceability') },
    'riwayat-traceability':  { title: 'History Pembatalan', render: fn('loadRiwayatTraceability') },
    'manajemen-akun':        { title: 'Manajemen Akun', render: fn('loadManajemenAkun') },
    'pengaturan':            { title: 'Setting', render: fn('loadPengaturan') }
  };

  function loadPage(name) {
    const page = pages[name];

    if (name === 'dashboard') {
      pageTitle.innerHTML = `Halo, <span id="greeting-name">${userName.textContent}</span>`;
      pageSubtitle.textContent = 'Selamat datang di Dashboard Sistem Kalibrasi';
    } else {
      pageTitle.textContent = page ? page.title : 'Halaman tidak ditemukan';
      pageSubtitle.textContent = 'Sistem Kalibrasi Hino';
    }

    if (page && typeof page.render === 'function') {
      page.render(contentArea);
    } else {
      contentArea.innerHTML = '<div class="card"><h3>Halaman tidak ditemukan</h3></div>';
    }
  }

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
    const open = isMobile()
      ? !sidebar.classList.contains('open')
      : sidebar.classList.contains('collapsed');
    setSidebar(open);
  });
  backdrop.addEventListener('click', () => setSidebar(false));

  function clearActive() {
    sidebar.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
  }

  // Menu level 1
  sidebar.querySelectorAll('.menu-item > .menu-label').forEach(label => {
    label.addEventListener('click', () => {
      const item = label.parentElement;
      if (item.classList.contains('has-submenu')) {
        const wasOpen = item.classList.contains('open');
        sidebar.querySelectorAll('.menu-item.open').forEach(m => m.classList.remove('open'));
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
  sidebar.querySelectorAll('.has-submenu-inner > .submenu-label').forEach(label => {
    label.addEventListener('click', (e) => {
      e.stopPropagation();
      label.parentElement.classList.toggle('open');
    });
  });

  // Submenu biasa & anak Master List
  sidebar.querySelectorAll('.submenu-item:not(.has-submenu-inner), .submenu-inner-item').forEach(item => {
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
      ['token', 'username', 'role'].forEach((k) => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
      window.location.href = '/';
    }
  });

  /* ---------- Info pengguna ---------- */
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  userName.textContent = getAuth('username') || 'Pengguna';
  userRole.textContent = capitalize(getAuth('role') || 'user');

  loadPage('dashboard');
});