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
    { href: 'contact.html',    label: 'Contact',  ja: 'お問い合わせ' }
  ];
  const here = location.pathname.split('/').pop() || 'index.html';
  const sns  = (window.AZAKEI && window.AZAKEI.sns) || [];

  const navLinks = LINKS.map(l =>
    `<li><a href="${l.href}"${l.href === here ? ' class="active"' : ''}>${l.label}</a></li>`).join('');
  const mobileLinks = LINKS.map(l =>
    `<a href="${l.href}" class="mobile-link">${l.label}<small>${l.ja}</small></a>`).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <nav id="navbar">
      <a href="index.html" class="nav-logo wordmark" aria-label="AZAKEI ホーム">AZA<span>KEI</span></a>
      <ul class="nav-links">${navLinks}</ul>
      <a href="${sns[0] ? sns[0].url : '#'}" target="_blank" rel="noopener" class="nav-cta">Instagram</a>
      <div class="hamburger" id="hamburger" aria-label="メニュー"><span></span><span></span><span></span></div>
    </nav>
    <div class="mobile-menu" id="mobileMenu">
      <a href="index.html" class="mobile-link">Home<small>ホーム</small></a>
      ${mobileLinks}
    </div>`);

  const footer = document.getElementById('site-footer');
  if (!footer) return;
  footer.className = 'site-footer';
  footer.innerHTML = `
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
    <div class="footer-bottom">© ${new Date().getFullYear()} AZAKEI. All rights reserved.</div>`;
})();
