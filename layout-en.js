/* ================================================================
   layout-en.js — English pages: shared navigation and footer
   <body data-ja="index.html"> tells the 日本語 button where to go.
   ================================================================ */
(function() {
  const here = location.pathname.split('/').pop() || 'en.html';
  const ja = document.body.dataset.ja || 'index.html';
  const LINKS = [
    { href: 'en.html#about',    label: 'About' },
    { href: 'en.html#values',   label: 'Values' },
    { href: 'en.html#festival', label: 'Festival' },
    { href: 'en.html#contests', label: 'Contests' },
    { href: 'en-diagnosis.html', label: 'Type Test', cls: 'nav-vote' },
    { href: 'en.html#partner',  label: 'Partner' },
    { href: 'en.html#contact',  label: 'Contact' }
  ];
  const link = l => {
    const onPage = here === 'en.html' && l.href.startsWith('en.html#') ? l.href.slice(7) : l.href;
    return `<li><a href="${onPage}" class="${l.cls || ''}${l.href === here ? ' active' : ''}">${l.label}</a></li>`;
  };

  document.body.insertAdjacentHTML('afterbegin', `
    <a class="skip-link" href="#main">Skip to content</a>
    <nav id="navbar" class="nav-en" aria-label="Main">
      <a href="en.html" class="nav-logo wordmark" aria-label="AZAKEI home"><span class="nav-mark" data-logomark aria-hidden="true"></span>AZA<span>KEI</span><small class="nav-kanji" aria-hidden="true">麻経</small></a>
      <ul class="nav-links">${LINKS.map(link).join('')}</ul>
      <div class="nav-right">
        <a href="${ja}" class="lang-switch" hreflang="ja" lang="ja" aria-label="日本語版">日本語</a>
        <button type="button" class="theme-toggle" id="themeToggle" aria-label="Switch light / dark">
          <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>
          <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        </button>
      </div>
    </nav>`);

  const main = document.querySelector('.page-hero, main');
  if (main && !main.id) main.id = 'main';
  if (main) main.setAttribute('tabindex', '-1');

  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('azakei-theme', next); } catch (e) {}
  });

  const footer = document.getElementById('site-footer');
  if (!footer) return;
  footer.className = 'site-footer';
  const tick = '<span>Economics, <em>in our hands.</em></span><span>仕組みを、<em>つくろう。</em> —</span>';
  footer.innerHTML = `
    <a class="footer-ticker" href="en.html#contact" aria-label="Contact us">
      <span class="footer-ticker-track">${tick.repeat(4)}</span>
    </a>
    <div class="footer-grid">
      <div>
        <div class="footer-brand"><div class="footer-emblem" data-emblem></div><a href="en.html" class="wordmark footer-wordmark">AZA<span>KEI</span><small class="footer-kanji" lang="ja">麻経</small></a></div>
        <p class="footer-note">Azabu Economics · Est. 2025<br>Azabu Junior and Senior High School, Tokyo</p>
      </div>
      <div>
        <p class="footer-head">Explore</p>
        <ul class="footer-list">
          <li><a href="en.html#about">About</a></li>
          <li><a href="en.html#festival">The festival exhibition</a></li>
          <li><a href="en.html#contests">Contests</a></li>
          <li><a href="en-diagnosis.html">Economist Type Test</a></li>
          <li><a href="en.html#partner">Partner with us</a></li>
        </ul>
      </div>
      <div>
        <p class="footer-head">Social</p>
        <ul class="footer-list">
          <li><a href="https://www.instagram.com/azakei_vlog/" target="_blank" rel="noopener">Instagram <span>@azakei_vlog</span></a></li>
          <li><a href="https://x.com/azakeiten" target="_blank" rel="noopener">X <span>@azakeiten</span></a></li>
        </ul>
      </div>
      <div>
        <p class="footer-head">Language</p>
        <ul class="footer-list"><li><a href="${ja}" hreflang="ja" lang="ja">日本語</a></li><li><a href="en.html">English</a></li></ul>
      </div>
    </div>
    <div class="footer-giant" aria-hidden="true">AZAKEI</div>
    <div class="footer-bottom">© ${new Date().getFullYear()} AZAKEI. All rights reserved.</div>`;
})();
