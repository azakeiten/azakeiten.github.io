/* ================================================================
   layout.js — 全ページ共通のナビゲーションとフッター
   ================================================================ */
(function() {
  const LINKS = [
    { href: 'about.html',      label: 'About',    ja: '麻経とは' },
    { href: 'contests.html',   label: 'Contests', ja: 'コンテスト' },
    { href: 'festival.html',   label: 'Festival', ja: '文化祭' },
    { href: 'activities.html', label: 'Activity', ja: '活動風景' },
    { href: 'events.html',     label: 'Events',   ja: '日程' },
    { href: 'vote.html',       label: 'Vote',     ja: '文化祭投票', cls: 'nav-vote' },
    { href: 'contact.html',    label: 'Contact',  ja: 'お問い合わせ' }
  ];
  const here = location.pathname.split('/').pop() || 'index.html';
  const sns  = (window.AZAKEI && window.AZAKEI.sns) || [];
  const ig   = (window.AZAKEI && window.AZAKEI.contact && window.AZAKEI.contact.instagram) || { url: '#' };

  const navLinks = LINKS.map(l =>
    `<li><a href="${l.href}" class="${l.cls || ''}${l.href === here ? ' active' : ''}">${l.label}</a></li>`).join('');
  const mobileLinks = LINKS.map(l =>
    `<a href="${l.href}" class="mobile-link">${l.label}<small>${l.ja}</small></a>`).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <nav id="navbar">
      <a href="index.html" class="nav-logo wordmark" aria-label="AZAKEI ホーム">AZA<span>KEI</span></a>
      <ul class="nav-links">${navLinks}</ul>
      <div class="nav-right">
        <a href="${ig.url}" target="_blank" rel="noopener" class="nav-cta">Instagram</a>
        <button type="button" class="theme-toggle" id="themeToggle" aria-label="ライト／ダーク表示を切り替え">
          <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>
          <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        </button>
        <div class="hamburger" id="hamburger" aria-label="メニュー"><span></span><span></span><span></span></div>
      </div>
    </nav>
    <div class="mobile-menu" id="mobileMenu">
      <a href="index.html" class="mobile-link">Home<small>ホーム</small></a>
      ${mobileLinks}
    </div>`);

  /* ---- ライト／ダーク切り替え ---- */
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('azakei-theme', next); } catch (e) {}
  });

  const footer = document.getElementById('site-footer');
  if (!footer) return;
  footer.className = 'site-footer';
  const tick = '<span>仕組みを、<em>つくろう。</em></span><span>Let\'s build <em>the system</em> —</span>';
  footer.innerHTML = `
    <a class="footer-ticker" href="contact.html" aria-label="お問い合わせへ">
      <span class="footer-ticker-track">${tick.repeat(4)}</span>
    </a>
    <div class="footer-grid">
      <div>
        <a href="index.html" class="wordmark footer-wordmark">AZA<span>KEI</span></a>
        <p class="footer-note">麻経 · Azabu Economics<br>Est. 2025 · 麻布中学校・高等学校</p>
      </div>
      <div>
        <p class="footer-head">Pages</p>
        <ul class="footer-list">
          <li><a href="about.html">麻経とは</a></li>
          <li><a href="contests.html">各種コンテスト</a></li>
          <li><a href="festival.html">文化祭</a></li>
          <li><a href="activities.html">活動風景・日常</a></li>
          <li><a href="events.html">日程・イベント</a></li>
          <li><a href="sponsor.html">協賛のご案内</a></li>
          <li><a href="vote.html">文化祭投票</a></li>
          <li><a href="contact.html">お問い合わせ</a></li>
        </ul>
      </div>
      <div>
        <p class="footer-head">Social</p>
        <ul class="footer-list">
          ${sns.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.name} <span>${s.handle}</span></a></li>`).join('')}
        </ul>
      </div>
      <div>
        <p class="footer-head">Mission</p>
        <p class="footer-note">世の中の仕組みを理解し、自分たちで仕組みを創り出す。コンテストへの挑戦と文化祭の展示を通じて、経済を社会に開いていく麻布中学校・高等学校の同好会です。</p>
      </div>
    </div>
    <div class="footer-giant" aria-hidden="true">AZAKEI</div>
    <div class="footer-bottom">© ${new Date().getFullYear()} AZAKEI. All rights reserved.</div>`;
})();
