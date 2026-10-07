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

  /* ---- サイト全体の目次（☰ で開く）---- */
  const INDEX = [
    { group: '知る', en: 'Know', pages: [
      { ico: 'M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10', href: 'index.html',      ja: 'ホーム',           en: 'Home',     desc: 'AZAKEI の全体像と最新情報。',                 img: 'hero.jpg' },
      { ico: 'M12 3l2.6 4.5H20l-2.7 4.5L20 16.5h-5.4L12 21l-2.6-4.5H4l2.7-4.5L4 7.5h5.4z', href: 'about.html',      ja: '麻経とは',         en: 'About',    desc: '成り立ち・活動の全体説明・今後の展望。',       img: 'members.jpg' },
      { ico: 'M5 21V4M5 4h12l-2.5 4 2.5 4H5', href: 'azakei.html',     ja: 'AZAKEI として',    en: 'Identity', desc: '合言葉・大切にしていること・活動の地図・数字。', img: 'photos/board-special.jpg' },
      { ico: 'M4 8h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM10 8v10', href: 'festival.html',   ja: '文化祭「麻布経済展」', en: 'Festival', desc: '経済とエンタメが交差する、体験型展示。',       img: 'photos/room-diagnosis.jpg' },
      { ico: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', href: 'activities.html', ja: '活動風景・日常',    en: 'Activity', desc: 'ミーティングから放課後の雑談まで。',           img: 'photos/setup.jpg' },
      { ico: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11M9 8h6', href: 'glossary.html',   ja: '経済用語ミニ辞典', en: 'Glossary', desc: 'GDP・円高・配当……経済の言葉をやさしく。', img: 'photos/rules-posters.jpg', badge: 'NEW' },
    ]},
    { group: '挑む', en: 'Challenge', pages: [
      { ico: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4', href: 'contests.html',   ja: '各種コンテスト',    en: 'Contests', desc: 'ビジネスコンテスト・日経ストックリーグ ほか。', img: 'tokyo-s.jpg' },
      { ico: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5', href: 'events.html',     ja: '日程・イベント',    en: 'Schedule', desc: 'これからの予定と、これまでの歩み。',           img: 'photos/board-millionaire.jpg' }
    ]},
    { group: '参加する', en: 'Join', pages: [
      { ico: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.6M12 16.8v.2', href: 'diagnosis.html',  ja: 'エコノミスト診断',  en: 'Type Test', desc: 'YES か NO で、あなたの投資家タイプがわかる。', img: 'photos/room-diagnosis.jpg', badge: 'NEW' },
      { ico: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9h6M9 12h6M12 6v12', href: 'quiz.html',       ja: '億万長者クイズ',    en: 'Quiz',      desc: 'チップを賭けて 2 問に挑戦。目指せ 6 倍。', img: 'photos/board-special.jpg', badge: 'NEW' },
      { ico: 'M4 19h16M7 16v-5M12 16V7M17 16v-8', href: 'sim.html',        ja: 'チップ配分シミュレーター', en: 'Simulator', desc: 'チップを株・債券・預金に分けて、10 年後へ早送り。', img: 'photos/board-special.jpg', badge: 'NEW' },
      { ico: 'M5 11h14v9H5zM9 15l2 2 4-4M8 11V6h8v5', href: 'vote.html',       ja: '文化祭投票',        en: 'Vote',     desc: '来年どんな展示が見たい？ 1 票で決めよう。',   img: 'photos/hallway-game.jpg', badge: '受付中' },
      { ico: 'M3 12l4-4 3 2 4-3 7 6M7 13l3 3 2-1 2 2 3-3', href: 'sponsor.html',    ja: '協賛のご案内',      en: 'Partner',  desc: '企業・団体の皆さまへ。募集項目と流れ。',       img: 'photos/star-bills.jpg' },
      { ico: 'M4 6h16v12H4zM4 7l8 6 8-6', href: 'contact.html',    ja: 'お問い合わせ',      en: 'Contact',  desc: 'フォーム、または Instagram の DM から。',      img: 'photos/star-door.jpg' }
    ]}
  ];
  // ページごとのアイコン（カードにも使う）
  window.AZAKEI_ICONS = Object.fromEntries(INDEX.flatMap(g => g.pages).map(p => [p.href, p.ico]));
  let n = 0;
  const indexGroups = INDEX.map(g => `
    <div class="si-group">
      <p class="si-group-head"><span>${g.en}</span>${g.group}</p>
      <ul>${g.pages.map(p => { n++; const cur = p.href === here; return `
        <li><a href="${p.href}" class="mobile-link si-link${cur ? ' is-current' : ''}"${cur ? ' aria-current="page"' : ''}
               data-en="${p.en}" data-desc="${p.desc}" data-img="${p.img}" style="--d:${n}">
          <span class="si-num">${String(n).padStart(2, '0')}</span>
          <span class="si-name"><svg class="si-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${p.ico || ''}"/></svg>${p.ja}${p.badge ? `<em class="si-badge">${p.badge}</em>` : ''}${cur ? '<em class="si-here">現在のページ</em>' : ''}</span>
          <span class="si-en">${p.en}</span>
        </a></li>`; }).join('')}
      </ul>
    </div>`).join('');

  const navLinks = LINKS.map(l =>
    `<li><a href="${l.href}" class="${l.cls || ''}${l.href === here ? ' active' : ''}">${l.label}</a></li>`).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <nav id="navbar">
      <a href="index.html" class="nav-logo wordmark" aria-label="麻経 AZAKEI ホーム"><span class="nav-mark" data-logomark aria-hidden="true"></span>AZA<span>KEI</span><small class="nav-kanji" aria-hidden="true">麻経</small></a>
      <ul class="nav-links">${navLinks}</ul>
      <div class="nav-right">
        <a href="${ig.url}" target="_blank" rel="noopener" class="nav-cta">Instagram</a>
        <a href="${here === 'diagnosis.html' ? 'en-diagnosis.html' : 'en.html'}" class="lang-switch" hreflang="en" lang="en" aria-label="English version">EN</a>
        <button type="button" class="theme-toggle" id="themeToggle" aria-label="ライト／ダーク表示を切り替え">
          <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>
          <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        </button>
        <button type="button" class="hamburger" id="hamburger" aria-label="サイトの目次を開く" aria-expanded="false" aria-controls="mobileMenu"><span></span><span></span><span></span></button>
      </div>
    </nav>
    <div class="site-index" id="mobileMenu" role="dialog" aria-modal="true" aria-label="サイトの目次" aria-hidden="true">
      <div class="si-inner">
        <div class="si-list">
          <p class="si-title">Index <span>サイトの目次</span></p>
          ${indexGroups}
        </div>
        <aside class="si-preview" aria-hidden="true">
          <div class="si-preview-img"></div>
          <p class="si-preview-en"></p>
          <p class="si-preview-desc"></p>
        </aside>
      </div>
      <div class="si-foot">
        ${sns.map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}<span>${s.handle}</span></a>`).join('')}
        <span class="si-copy">© AZAKEI</span>
      </div>
    </div>`);

  /* ---- 本文へスキップ（キーボード操作用） ---- */
  const main = document.querySelector('.page-hero, .hero-sticky-wrap, main, .notfound');
  if (main) {
    if (!main.id) main.id = 'main';
    main.setAttribute('tabindex', '-1');
    document.body.insertAdjacentHTML('afterbegin', `<a class="skip-link" href="#${main.id}">本文へスキップ</a>`);
  }

  /* ---- 目次の開閉に合わせた処理（開閉そのものは nav.js） ---- */
  const menu = document.getElementById('mobileMenu');
  const burger = document.getElementById('hamburger');
  const pv = {
    img:  menu.querySelector('.si-preview-img'),
    en:   menu.querySelector('.si-preview-en'),
    desc: menu.querySelector('.si-preview-desc')
  };
  function preview(a) {
    if (!a) return;
    pv.img.style.backgroundImage = `url("${a.dataset.img}")`;
    pv.en.textContent = a.dataset.en;
    pv.desc.textContent = a.dataset.desc;
    menu.querySelectorAll('.si-link').forEach(l => l.classList.toggle('is-hover', l === a));
  }
  menu.querySelectorAll('.si-link').forEach(a => {
    a.addEventListener('mouseenter', () => preview(a));
    a.addEventListener('focus', () => preview(a));
  });
  new MutationObserver(() => {
    const open = menu.classList.contains('open');
    document.documentElement.classList.toggle('index-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'サイトの目次を閉じる' : 'サイトの目次を開く');
    menu.setAttribute('aria-hidden', !open);
    if (open) {
      preview(menu.querySelector('.si-link.is-current') || menu.querySelector('.si-link'));
      setTimeout(() => (menu.querySelector('.si-link.is-current') || menu.querySelector('.si-link')).focus({ preventScroll: true }), 350);
    }
  }).observe(menu, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) { burger.click(); burger.focus(); }
  });

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
  // フッターのリンクは「知る」「遊ぶ・学ぶ」「つながる」の 3 つに分ける
  const FOOT_GROUPS = [
    { en: 'Explore', ja: '知る', links: [['about.html', '麻経とは'], ['azakei.html', 'AZAKEI として'], ['contests.html', '各種コンテスト'], ['festival.html', '文化祭'], ['activities.html', '活動風景・日常'], ['events.html', '日程・イベント']] },
    { en: 'Play', ja: '遊ぶ・学ぶ', links: [['quiz.html', '億万長者クイズ'], ['diagnosis.html', 'エコノミスト診断'], ['sim.html', 'チップ配分<wbr>シミュレーター'], ['glossary.html', '経済用語ミニ辞典'], ['vote.html', '文化祭投票']] },
    { en: 'Connect', ja: 'つながる', links: [['contact.html', 'お問い合わせ'], ['sponsor.html', '協賛のご案内'], ...sns.map(s => [s.url, s.name, s.handle])] }
  ];
  footer.innerHTML = `
    <a class="footer-ticker" href="contact.html" aria-label="お問い合わせへ">
      <span class="footer-ticker-track">${tick.repeat(4)}</span>
    </a>
    <div class="footer-grid">
      <div>
        <div class="footer-brand"><div class="footer-emblem" data-emblem></div><a href="index.html" class="wordmark footer-wordmark">AZA<span>KEI</span><small class="footer-kanji">麻経</small></a></div>
        <p class="footer-note">麻経 · Azabu Economics<br>Est. 2025 · 麻布中学校・高等学校</p>
        <p class="footer-mission">世の中の仕組みを理解し、<br>自分たちで仕組みを創り出す。</p>
        <div class="fs-switch" role="group" aria-label="文字の大きさ"><span>文字の大きさ</span><button type="button" data-fs="">標準</button><button type="button" data-fs="l">大</button><button type="button" data-fs="xl">特大</button></div>
        <a class="footer-members" href="admin.html">部員用 更新ページ</a>
      </div>
      ${FOOT_GROUPS.map(g => `<div class="footer-col">
        <p class="footer-head">${g.en}<span>${g.ja}</span></p>
        <ul class="footer-list">
          ${g.links.map(([href, label, sub]) => {
            const ext = /^https:/.test(href);
            const cur = !ext && href === here ? ' aria-current="page"' : '';
            return `<li><a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}${cur}>${label}${sub ? ` <span>${sub}</span>` : ''}</a></li>`;
          }).join('')}
        </ul>
      </div>`).join('')}
    </div>
    <div class="footer-giant" aria-hidden="true">AZAKEI<span class="footer-giant-seal">麻経</span></div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} AZAKEI. All rights reserved.</span><span class="footer-legal"><a href="about.html#profile">団体概要</a><a href="about.html#faq">よくある質問</a><a href="privacy.html">プライバシーポリシー</a></span></div>`;
})();
