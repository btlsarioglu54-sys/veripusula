/* VeriPusula – Ortak JS: navbar, tema, footer, animasyon */
(function () {
  'use strict';
  const SAYFALAR = [
    ['index.html', 'Ana Sayfa'],
    ['hakkimizda.html', 'Hakkımızda'],
    ['urunler.html', 'Ürünler'],
    ['b2b.html', 'B2B Pazar'],
    ['departmanlar.html', 'Departmanlar'],
    ['yonetim.html', 'Yönetim Raporu'],
    ['iletisim.html', 'İletişim']
  ];
  const aktif = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  function tema(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('tema', t); } catch (e) {}
    const b = document.getElementById('temaBtn');
    if (b) b.setAttribute('aria-label', t === 'dark' ? 'Gündüz moduna geç' : 'Gece moduna geç');
    const l = document.getElementById('temaLbl');
    if (l) l.textContent = t === 'dark' ? 'Gündüz' : 'Gece';
  }

  function navbarYaz() {
    const linkler = SAYFALAR.map(([h, a]) =>
      `<a href="${h}" class="${h === aktif ? 'active' : ''}">${a}</a>`).join('');
    const nav = document.createElement('header');
    nav.className = 'navbar';
    nav.innerHTML = `
      <div class="container nav-inner">
        <div class="nav-left" id="navLeft">
          <button class="icon-btn" id="menuBtn" aria-haspopup="true" aria-expanded="false" aria-controls="menuDrop">
            <span class="burger"><i></i><i></i><i></i></span><span class="lbl">Menü</span>
          </button>
          <nav class="dropdown" id="menuDrop">${linkler}</nav>
        </div>
        <a class="brand" href="index.html" aria-label="VeriPusula Analitik A.Ş. ana sayfa">
          <span class="logo-chip"><img src="logo.jpg" alt="VeriPusula logosu"></span>
          <span><b>VeriPusula</b><small>ANALİTİK A.Ş.</small></span>
        </a>
        <div class="nav-right">
          <button class="icon-btn theme-btn" id="temaBtn">
            <span class="ic-moon">🌙</span><span class="ic-sun">☀️</span><span class="lbl" id="temaLbl">Gece</span>
          </button>
        </div>
      </div>`;
    document.body.prepend(nav);

    const sol = document.getElementById('navLeft');
    const btn = document.getElementById('menuBtn');
    const ac = (v) => { sol.classList.toggle('open', v); btn.setAttribute('aria-expanded', v); };
    btn.addEventListener('click', (e) => { e.stopPropagation(); ac(!sol.classList.contains('open')); });
    document.addEventListener('click', (e) => { if (!sol.contains(e.target)) ac(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') ac(false); });

    document.getElementById('temaBtn').addEventListener('click', () => {
      tema(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
    tema(document.documentElement.getAttribute('data-theme') || 'light');
  }

  function footerYaz() {
    const f = document.createElement('footer');
    f.innerHTML = `
      <div class="container">
        <div class="foot-grid">
          <div><h4>VeriPusula Analitik A.Ş.</h4>
            <p>Müşteri Analitiği Lisansı üreten ve SmartBox monte eden Dijital Şirketler Ligi şirketi (G07).</p></div>
          <div><h4>Sayfalar</h4>${SAYFALAR.map(([h, a]) => `<a href="${h}">${a}</a>`).join('')}</div>
          <div><h4>İletişim</h4><a href="mailto:info@veripusula.example">info@veripusula.example</a><a href="iletisim.html">İletişim formu</a></div>
        </div>
        <p class="copy">© ${new Date().getFullYear()} VeriPusula Analitik A.Ş. – Dijital Şirketler Ligi simülasyon şirketi (G07). Gerçek bir ticari işletme değildir.</p>
      </div>`;
    document.body.append(f);
  }

  function animasyon() {
    const el = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { el.forEach(e => e.classList.add('show')); return; }
    const io = new IntersectionObserver((k) => k.forEach(x => {
      if (x.isIntersecting) { x.target.classList.add('show'); io.unobserve(x.target); }
    }), { threshold: .12 });
    el.forEach(e => io.observe(e));
  }

  document.addEventListener('DOMContentLoaded', () => { navbarYaz(); footerYaz(); animasyon(); });
})();
