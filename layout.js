/* ================================================================
   layout.js — 全ページ共通のナビゲーションとフッター
   ================================================================ */
// 動きを少なめにする（メモリの少ない端末・データ節約モードでは自動で。フッターの「動き」で切りかえも）
(function() {
  const h = document.documentElement, c = navigator.connection || {};
  let m = null; try { m = localStorage.getItem("azakei-motion"); } catch (e) {}
  const auto = (navigator.deviceMemory && navigator.deviceMemory <= 4) || c.saveData || /2g/.test(c.effectiveType || "");
  if (m === "lite" || (m !== "full" && auto)) h.classList.add("is-lite");
})();
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
      { ico: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5', href: 'dayori.html', ja: '麻経だより（月刊）', en: 'Newsletter', desc: 'その月に新しくなったことを、新聞のかたちで。印刷して掲示もできる。', img: 'photos/room-paper.jpg' },
      { ico: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5M9 9h3', href: 'report.html',     ja: '2026 年の活動報告', en: 'Report', desc: '1 年を 1 ページに。数字・写真・月ごとの歩み。', img: 'photos/room-diagnosis.jpg' },
      { ico: 'M5 21V4M5 4h12l-2.5 4 2.5 4H5', href: 'azakei.html',     ja: 'AZAKEI として',    en: 'Identity', desc: '合言葉・大切にしていること・活動の地図・数字。', img: 'photos/board-special.jpg' },
      { ico: 'M4 8h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM10 8v10', href: 'festival.html',   ja: '文化祭「麻布経済展」', en: 'Festival', desc: '経済とエンタメが交差する、体験型展示。',       img: 'photos/room-diagnosis.jpg' },
      { ico: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', href: 'activities.html', ja: '活動風景・日常',    en: 'Activity', desc: 'ミーティングから放課後の雑談まで。',           img: 'photos/setup.jpg' },
      { ico: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11M9 8h6', href: 'glossary.html',   ja: '経済用語ミニ辞典', en: 'Glossary', desc: '300 語。GDP から NISA、世界の経済まで、やさしく。', img: 'photos/rules-posters.jpg', badge: 'NEW' },
    ]},
    { group: '挑む', en: 'Challenge', pages: [
      { ico: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4', href: 'contests.html',   ja: '各種コンテスト',    en: 'Contests', desc: 'ビジネスコンテスト・日経ストックリーグ ほか。', img: 'tokyo-s.jpg' },
      { ico: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5', href: 'events.html',     ja: '日程・イベント',    en: 'Schedule', desc: 'これからの予定と、これまでの歩み。',           img: 'photos/board-millionaire.jpg' }
    ]},
    { group: '参加する', en: 'Join', pages: [
      { ico: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.6M12 16.8v.2', href: 'diagnosis.html',  ja: 'エコノミスト診断',  en: 'Type Test', desc: 'YES か NO で、あなたの投資家タイプがわかる。', img: 'photos/room-diagnosis.jpg', badge: 'NEW' },
      { ico: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9h6M9 12h6M12 6v12', href: 'quiz.html',       ja: '経済のあそび場',    en: 'Play',      desc: '億万長者クイズなど、遊んで学ぶ。', img: 'photos/board-special.jpg', badge: 'NEW' },
      { ico: 'M4 19h16M7 16v-5M12 16V7M17 16v-8', href: 'sim.html',        ja: '経済ラボ', en: 'Lab', desc: 'シミュレーターとゲームで、経済を手で動かす。', img: 'photos/board-special.jpg', badge: 'NEW' },
      { ico: 'M4 7h16M4 12h16M4 17h16M8 5v4M15 10v4M11 15v4', href: 'rosen.html',      ja: '経済の路線図', en: 'Map', desc: '体験を 5 つの路線の駅に。ためした駅には「済」。', img: 'photos/board-special.jpg', badge: 'NEW' },
      { ico: 'M5 11h14v9H5zM9 15l2 2 4-4M8 11V6h8v5', href: 'vote.html',       ja: '文化祭投票',        en: 'Vote',     desc: '次はどんな展示が見たい？ あなたの 1 票を参考に。',   img: 'photos/hallway-game.jpg', badge: '受付中' },
      { ico: 'M3 12l4-4 3 2 4-3 7 6M7 13l3 3 2-1 2 2 3-3', href: 'sponsor.html',    ja: '協賛のご案内',      en: 'Partner',  desc: '企業・団体の皆さまへ。募集項目と流れ。',       img: 'photos/star-bills.jpg' },
      { ico: 'M4 6h16v12H4zM4 7l8 6 8-6', href: 'contact.html',    ja: 'お問い合わせ',      en: 'Contact',  desc: 'フォーム、または Instagram の DM から。',      img: 'photos/star-door.jpg' }
    ]}
  ];
  // ページごとのアイコン（カードにも使う）
  window.AZAKEI_ICONS = Object.fromEntries(INDEX.flatMap(g => g.pages).map(p => [p.href, p.ico]));
  window.AZAKEI_PAGES = INDEX.flatMap(g => g.pages.map(p => ({ href: p.href, ja: p.ja, en: p.en, desc: p.desc, ico: p.ico, group: g.group })));
  let n = 0;
  const indexGroups = INDEX.map(g => `
    <div class="si-group si-g-${g.en.toLowerCase()}">
      <p class="si-group-head">${g.group}</p>
      <ul>${g.pages.map(p => { n++; const cur = p.href === here; return `
        <li><a href="${p.href}" class="mobile-link si-link${cur ? ' is-current' : ''}"${cur ? ' aria-current="page"' : ''}
               data-en="${p.en}" data-ja="${p.ja}" data-desc="${p.desc}" data-img="${p.img}" style="--d:${n}">
          <span class="si-num">${String(n).padStart(2, '0')}</span>
          <span class="si-name"><svg class="si-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${p.ico || ''}"/></svg>${p.ja}${p.badge ? `<em class="si-badge">${p.badge}</em>` : ''}${cur ? '<em class="si-here">現在のページ</em>' : ''}</span>
          <span class="si-en">${p.en}</span>
        </a></li>`; }).join('')}
      </ul>
    </div>`).join('');

  // v44：大きな会社のサイトのように、日本語の 5 つの入口＋開くと説明つきのページ一覧（メガメニュー）
  const P = Object.fromEntries(INDEX.flatMap(g => g.pages).map(p => [p.href, p]));
  const MENU = [
    { ja: 'AZAKEIについて', en: 'About', lead: '私たちが何者で、何を大切にしているか。', pages: ['about.html', 'report.html', 'azakei.html', 'activities.html', 'glossary.html'] },
    { ja: '文化祭', en: 'Festival', lead: '体験型展示「麻布経済展」と、その日程。', pages: ['festival.html', 'events.html', 'vote.html'] },
    { ja: 'コンテスト', en: 'Contests', href: 'contests.html' },
    { ja: '体験する', en: 'Play', lead: '登録なし・スマホで、すぐに遊べます。', pages: ['quiz.html', 'sim.html', 'rosen.html', 'diagnosis.html'] },
    { ja: '協賛・取材', en: 'Partners', href: 'sponsor.html' }
  ];
  const navLinks = MENU.map((m, i) => {
    if (!m.pages) return `<li><a href="${m.href}" class="nav-top${m.href === here ? ' active' : ''}"${m.href === here ? ' aria-current="page"' : ''}>${m.ja}</a></li>`;
    const on = m.pages.includes(here);
    return `<li class="nav-dd${on ? ' is-active' : ''}">
      <button type="button" class="nav-top nav-dd-btn" aria-expanded="false" aria-controls="navp${i}">${m.ja}<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></button>
      <div class="nav-panel" id="navp${i}">
        <div class="nav-panel-head"><p>${m.ja}</p><small>${m.lead}</small></div>
        <ul>${m.pages.map(h => { const p = P[h] || { ja: h, desc: '' }; const cur = h === here; return `
          <li><a href="${h}"${cur ? ' aria-current="page" class="active"' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${p.ico || ''}"/></svg>
            <b>${p.ja}${h === 'vote.html' ? '<em>受付中</em>' : ''}</b><small>${p.desc}</small>
          </a></li>`; }).join('')}</ul>
      </div>
    </li>`;
  }).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <nav id="navbar">
      <a href="index.html" class="nav-logo wordmark" aria-label="麻経 AZAKEI ホーム"><span class="nav-mark" data-logomark aria-hidden="true"></span>AZA<span>KEI</span><small class="nav-kanji" aria-hidden="true">麻経</small></a>
      <ul class="nav-links">${navLinks}</ul>
      <div class="nav-right">
        <a href="contact.html" class="nav-cta">お問い合わせ</a>
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
          <p class="si-title">サイトの目次</p>
          <label class="si-search"><span class="sr-only">サイトの中をさがす</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" id="siSearch" placeholder="さがす（例：来場ガイド、配当、FAQ）" autocomplete="off" enterkeyhint="search"></label>
          <ul class="si-results" id="siResults" hidden></ul>
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
    pv.en.textContent = a.dataset.ja;
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
  const tick = '<span>仕組みを、<em>つくろう。</em></span>';
  // フッターのリンクは「知る」「遊ぶ・学ぶ」「つながる」の 3 つに分ける
  const FOOT_GROUPS = [
    { en: 'Explore', ja: '知る', links: [['about.html', '麻経とは'], ['report.html', '2026 年の活動報告'], ['azakei.html', 'AZAKEI として'], ['contests.html', '各種コンテスト'], ['festival.html', '文化祭'], ['activities.html', '活動風景・日常'], ['events.html', '日程・イベント']] },
    { en: 'Play', ja: '遊ぶ・学ぶ', links: [['quiz.html', '経済のあそび場'], ['diagnosis.html', 'エコノミスト診断'], ['sim.html', '経済ラボ'], ['rosen.html', '経済の路線図'], ['glossary.html', '経済用語ミニ辞典'], ['vote.html', '文化祭投票']] },
    { en: 'Connect', ja: 'つながる', links: [['contact.html', 'お問い合わせ'], ['sponsor.html', '協賛のご案内'], ...sns.map(s => [s.url, s.name, s.handle])] }
  ];
  footer.innerHTML = `
    <a class="footer-ticker" href="contact.html" aria-label="お問い合わせへ">
      <span class="footer-ticker-track">${tick.repeat(8)}</span>
    </a>
    <div class="explore" data-explore${['quiz.html', 'sim.html', 'glossary.html', 'diagnosis.html', 'mypage.html'].includes(here) ? '' : ' data-quiet'}></div>
    <div class="footer-grid">
      <div>
        <div class="footer-brand"><div class="footer-emblem" data-emblem></div><a href="index.html" class="wordmark footer-wordmark">AZA<span>KEI</span><small class="footer-kanji">麻経</small></a></div>
        <p class="footer-note">麻経（Azabu Economics）<br>麻布中学校・高等学校の経済系同好会</p>
        <p class="footer-mission">世の中の仕組みを理解し、<br>自分たちで仕組みを創り出す。</p>
        <div class="fs-switch" role="group" aria-label="文字の大きさ"><span>文字の大きさ</span><button type="button" data-fs="">標準</button><button type="button" data-fs="l">大</button><button type="button" data-fs="xl">特大</button></div>
        <div class="fs-switch motion-switch" role="group" aria-label="動き"><span>動き</span><button type="button" data-motion="full">ふつう</button><button type="button" data-motion="lite">少なめ</button></div>
        <a class="footer-members" href="admin.html">部員用 更新ページ</a>
      </div>
      ${FOOT_GROUPS.map(g => `<div class="footer-col">
        <p class="footer-head">${g.ja}</p>
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
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} AZAKEI. All rights reserved.${(window.AZAKEI && AZAKEI.siteUpdated) ? `<a class="footer-updated" href="about.html#updates">最終更新 <time datetime="${AZAKEI.siteUpdated}">${AZAKEI.siteUpdated.replace(/-/g, ".")}</time></a>` : ""}</span><span class="footer-legal"><a href="mypage.html">わたしの記録</a><a href="about.html#profile">団体概要</a><a href="about.html#faq">よくある質問</a><a href="sitemap.html">サイトマップ</a><a href="policy.html">サイトポリシー</a><a href="privacy.html">プライバシーポリシー</a></span></div>`;
})();

/* ---- 目次の中の「さがす」：ページと、ページの中のコーナーを絞りこむ ---- */
(function() {
  const input = document.getElementById('siSearch'), list = document.getElementById('siResults');
  if (!input || !list) return;
  const norm = s => s.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/\s+/g, '');
  // ページの中のコーナー（見出し・よく探されそうな言葉）
  const SPOTS = [
    ['festival.html#guide', '来場ガイド', '文化祭', 'はじめて 行き方 あそびかた チップ 当日'],
    ['festival.html#access', '開催日程とアクセス', '文化祭', '場所 日程 行き方 麻布'],
    ['festival.html#room', '会場の 3D 模型', '文化祭', '教室 中3-5 レイアウト 順路 3d 模型'],
    ['festival.html#aim', '麻布経済展が目指したこと', '文化祭', '目的 ねらい リスクマネジメント 中高生'],
    ['festival.html#deco', '飾りつけに込めた意味', '文化祭', '装飾 飾り 入門 修了 お金のなる木 内装 外装'],
    ['azakei.html#osatsu', 'マスコット「お札マン」', 'AZAKEI として', 'キャラクター マスコット お札マン 会長'],
    ['azakei.html#kokoroe', '展示員の心得 拾参ヶ条', 'AZAKEI として', '心得 ルール 約束 マニュアル 裏側'],
    ['festival.html#story', '3 日間の物語', '文化祭', '来場者 2364 人数'],
    ['festival.html#exhibition', '展示の仕組み', '文化祭', 'チップ 倍率 賭ける'],
    ['report.html', '2026 年の活動報告', '活動報告', '年報 実績 来場者 数字 1 年 まとめ 報告'],
    ['dayori.html', '麻経だより（月刊）', '麻経だより', '新聞 だより 月刊 お知らせ 掲示 印刷 今月 更新'],
    ['about.html#faq', 'よくある質問（FAQ）', '麻経とは', 'faq 質問 入部 部員'],
    ['about.html#profile', '団体概要', '麻経とは', '設立 学校 連絡先'],
    ['about.html#vision', '今後の展望', '麻経とは', 'これから 目標 ロードマップ'],
    ['contests.html#business', 'ビジネスコンテスト', 'コンテスト', '事業計画 高校生'],
    ['contests.html#stockleague', '日経ストックリーグ', 'コンテスト', '株 ポートフォリオ 投資 レポート'],
    ['events.html#yearplan', '1 年の流れ（コンテストと文化祭の予定）', '日程', '予定 スケジュール 1 年 ストックリーグ ビジネスプラン・グランプリ 文化祭 査定 本番'],
    ['festival.html#next', '次の麻布経済展ができるまで', '文化祭', '次の文化祭 準備 査定 組み立て 本番 2027'],
    ['contests.html#plan-seed', 'ビジネスプランのたね', 'コンテスト', '起業 事業計画 アイデア ワークシート ピッチ'],
    ['azakei.html#kisekae', 'お札マンの着せかえ', 'AZAKEI', '着せかえ マスコット お札マン 帽子 画像 シール 壁紙'],
    ['contests.html#rousoku', 'ローソク足をつくろう', 'コンテスト', 'ローソク足 チャート 株価 始値 高値 安値 終値 陽線 陰線 ひげ 堂島 米'],
    ['contests.html#hirogari', 'アプリが広がるとき', 'コンテスト', 'ネットワーク効果 ティッピング・ポイント 口コミ プラットフォーム 独占 SNS アプリ 広がる マーケティング'],
    ['contests.html#hama', '浜辺のアイス屋さん', 'コンテスト', '独占 競争 寡占 カルテル 独占禁止法 公正取引委員会 値段 アイス 需要'],
    ['contests.html#shimagdp', '島の GDP', 'コンテスト', 'GDP 国内総生産 三面等価 付加価値 生産 所得 支出 二重計上 輸出 消費'],
    ['contests.html#kessan', 'パン屋さんの決算発表', 'コンテスト', '決算 決算書 損益計算書 売上 利益 粗利 営業利益 純利益 原価 減価償却 黒字 赤字 増収 増益'],
    ['contests.html#cfund', 'クラウドファンディングに挑戦', 'コンテスト', 'クラウドファンディング 資金調達 支援 リターン 目標 オール・オア・ナッシング 手数料 起業'],
    ['contests.html#bunsan', 'ポートフォリオの 10 年', 'コンテスト', 'ポートフォリオ 分散投資 株 ストックリーグ リスク リターン 投資 アイス かさ 猛暑'],
    ['contests.html#pitch', 'ピッチの舞台', 'コンテスト', 'ピッチ 発表 練習 審査員 質問 プレゼン ビジネスコンテスト'],
    ['events.html#follow', '予定を見逃さないために', '日程', 'カレンダー sns フォロー'],
    ['activities.html#making', '展示ができるまで', '活動風景', '写真 準備 フィナーレ'],
    ['azakei.html#unpack', '合言葉を、ほどくと。', 'AZAKEI として', '合言葉 理解 創造'],
    ['vote.html#after-vote', 'あなたの 1 票の、ゆくえ', '投票', '投票 結果'],
    ['glossary.html', '今日のことば', '用語辞典', '日めくり 用語'],
    ['glossary.html#nenpyo', '経済の歴史の年表', '用語辞典', '年表 歴史 バブル 恐慌 ショック'],
    ['glossary.html', 'お札マンの 3 コマ解説', '用語辞典', '解説 1 分 インフレ 円安 株 金利 複利 マンガ'],
    ['sim.html#updown', 'チャート予想ゲーム', '経済ラボ', 'ゲーム 株価 チャート 上がる 下がる 予想'],
    ['sim.html#market', '値段はどう決まる？', '経済ラボ', '需要 供給 値段 価格'],
    ['sim.html#fx', '円高・円安の両替所', '経済ラボ', '為替 円安 円高 ドル レート'],
    ['quiz.html#make', 'クイズの問題をつくる', 'クイズ', '問題 作る 投稿 提案 自作 クイズ工房 友だち リンク 共有'],
    ['quiz.html#coins', '世界のお金図鑑', 'クイズ', '通貨 ドル ユーロ ポンド ウォン 外国 コイン 図鑑 両替 為替 円高 円安 旅行'],
    ['sim.html#infl', 'インフレのタイムマシン', '経済ラボ', 'インフレ 物価 値上がり おにぎり 値打ち'],
    ['sim.html#budget', '国の予算を 100 円にたとえると', '経済ラボ', '予算 税金 社会保障 国債 使いみち 一般会計'],
    ['sim.html#oku', '1 億円って、どれくらい？', '経済ラボ', '億 兆 一万円札 高さ 重さ 予算 お金の大きさ'],
    ['sim.html#shop', '文化祭でお店をひらこう', '経済ラボ', '損益分岐点 黒字 赤字 利益 固定費 原価 お店'],
    ['glossary.html#sheet', '授業で使えることばプリント', '用語辞典', 'プリント 印刷 授業 小テスト 先生 学校 ワークシート 問題 PDF'],
    ['glossary.html#gacha', '経済ことばガチャ', '用語辞典', 'ガチャ ランダム 言葉 出会う'],
    ['glossary.html#headline', 'ニュースの見出しを読みとく', '用語辞典', 'ニュース 新聞 見出し 日銀 物価 株価'],
    ['sim.html#okozukai', 'おこづかい 12 か月チャレンジ', '経済ラボ', 'おこづかい 貯金 家計簿 ゲーム 自転車'],
    ['sim.html#double', 'お金が 2 倍になるまで', '経済ラボ', '72 の法則 複利 2 倍'],
    ['sim.html#bungyo', '分業のふしぎ', '経済ラボ', '比較優位 分業 機会費用 パズル 貿易'],
    ['sim.html#receipt', 'レシートの中の税金', '経済ラボ', '消費税 軽減税率 8% 10% レシート コンビニ イートイン'],
    ['sim.html#kuji', 'くじ引きの期待値', '経済ラボ', '期待値 確率 くじ 宝くじ 大数の法則'],
    ['sim.html#kabu', '株式会社をつくろう', '経済ラボ', '株式会社 株 株主 配当 出資 過半数 多数決'],
    ['sim.html#ginko', '銀行のふしぎ（信用創造）', '経済ラボ', '銀行 信用創造 預金 貸し出し 準備率 ローン'],
    ['sim.html#nesage', 'となりのお店と値下げ競争（ゲーム理論）', '経済ラボ', 'ゲーム理論 囚人のジレンマ 値下げ 競争 しっぺ返し 作戦'],
    ['glossary.html#rush', 'ことば○×ラッシュ', '用語辞典', 'ゲーム 30 秒 マルバツ スピード'],
    ['glossary.html#narabe', 'ことばならべかえ', '用語辞典', 'ならべかえ ひらがな パズル 読み方 ゲーム ことば'],
    ['glossary.html', '用語辞典の読み上げ', '用語辞典', '読み上げ 音声 声 聞く スピーカー'],
    ['mypage.html#machi', '麻経の町', 'わたしの記録', '町 明かり 記録 進み具合 済 旗 マイページ'],
    ['mypage.html', '経済力レーダー（わたしの記録）', 'わたしの記録', 'レーダー 経済力 得意 のびしろ 記録 五角形'],
    ['glossary.html#wordmap', 'ことばの地図', '用語辞典', 'つながり 関連 地図 マップ'],
    ['index.html#omikuji', '経済おみくじ', 'ホーム', 'おみくじ 運勢 占い 今日'],
    ['mypage.html#shuryo', '麻経の修了証', 'わたしの記録', '修了証 判 はんこ 印刷 記録 親しむ 知る つくる 賞状'],
    ['quiz.html#taikai', 'みんなでクイズ大会', 'クイズ', 'クイズ 大会 班対抗 教室 授業 プロジェクター 文化祭 早押し チーム'],
    ['quiz.html#ehon', '絵本「お札マンと千円札の旅」', 'クイズ', '絵本 お話 千円札 お金のめぐり 給料 買い物 銀行 税金 小学生 読み聞かせ 地元 ネット通販 えらぶ'],
    ['quiz.html#koukan', '交換の島', 'クイズ', '物々交換 お金 交換の手段 役割 貝 島 ゲーム 価値の尺度 価値の保存 ものさし'],
    ['quiz.html#shinka', 'お金の進化', 'クイズ', 'お金 歴史 物々交換 貝 和同開珎 紙幣 交子 円 日本銀行券 電子マネー キャッシュレス 年表 進化'],
    ['quiz.html#atobarai', '10 万円のゲーム機、どう払う？', 'あそび場', 'クレジットカード リボ払い 分割払い 後払い 手数料 金利 BNPL 18 歳 成年 ローン'],
    ['quiz.html#nenkin', '胴上げから肩車へ', 'あそび場', '年金 少子高齢化 社会保障 胴上げ 騎馬戦 肩車 国民年金 20 歳 学生納付特例 生産性 人口ピラミッド 子育て支援 村長'],
    ['quiz.html#lemon', 'フリマのなぞ', 'あそび場', '情報の非対称性 レモン市場 フリマ 中古 保証 レビュー 評価 アカロフ ノーベル賞'],
    ['quiz.html#zeidan', '税の階段', 'あそび場', '所得税 累進課税 税率 課税所得 控除 住民税 復興特別所得税 再分配 手取り 昇給 ゲーム'],
    ['quiz.html#imaato', 'いま？ それとも あとで？', 'あそび場', '時間の価値 割引現在価値 金利 利回り 行動経済学 マシュマロ 我慢 貯金'],
    ['quiz.html#kawa', '川上の工場', 'あそび場', '外部性 環境税 ピグー税 炭素税 公害 よごれ 漁師 SDGs レジ袋'],
    ['quiz.html#koen', 'みんなの公園', 'あそび場', '公共財 ただ乗り フリーライダー 税金 公共事業 公園 出し合う 協力'],
    ['quiz.html#himitsu', '新しいお札のひみつ', 'あそび場', 'お札 新紙幣 偽造防止 ホログラム すかし 潜像模様 パールインキ マイクロ文字 識別マーク 渋沢栄一 日本銀行券'],
    ['quiz.html#subsc', 'サブスクと買い切り', 'あそび場', 'サブスク サブスクリプション 定額 買い切り 解約 損益分岐点 固定費 漫画 読み放題 初月無料 値上げ やりくり ゲーム'],
    ['sim.html#robot', 'ロボットがやってきた工場', '経済ラボ', 'ロボット AI 機械化 自動化 仕事 生産性 学び直し リスキリング 工場 パン'],
    ['sim.html#chiiki', 'めぐる町のお金', '経済ラボ', '地域通貨 商店街 地元 乗数効果 お金のめぐり 町 プレミアム付き商品券 地域経済'],
    ['sim.html#gurafu', 'グラフのうそを見破れ', '経済ラボ', 'グラフ 統計 縦軸 期間 平均 中央値 割合 ニュース メディアリテラシー データ'],
    ['rosen.html', '経済の路線図', 'ページ', '路線図 地図 一覧 体験 駅 路線 ためした 進み具合 おすすめ'],
    ['quiz.html#bakery', '麻経ベーカリー 12 か月', 'あそび場', '経営 ゲーム パン屋 損益計算書 粗利 固定費 変動費 借り入れ 利息 評判 価格 資金ショート 倒産 シミュレーション'],
    ['quiz.html#kyuyo', 'はじめての給料明細', 'あそび場', '給料 給料明細 額面 手取り 住民税 所得税 社会保険料 健康保険 年金 源泉徴収 働く'],
    ['sim.html#uchiwake', 'おにぎり 1 個の値段の中身', '経済ラボ', '値段 内訳 原価 付加価値 コンビニ おにぎり 流通 消費税 軽減税率 もうけ'],
    ['quiz.html#cashless', '店長のレジ', 'あそび場', 'キャッシュレス 現金 クレジットカード QR コード 手数料 入金 キャッシュフロー お店 レジ ポイント'],
    ['quiz.html#nefuda', '値札のマジック', 'あそび場', '値札 行動経済学 アンカリング おとり効果 送料無料 まとめ買い 端数価格 残りわずか ポイント還元 セール 買い物'],
    ['quiz.html#jika', 'チケットの値段は時価', 'あそび場', 'ダイナミックプライシング 変動価格 値段 チケット 遊園地 テーマパーク 需要 供給 満員 空席 機会費用'],
    ['quiz.html#kanzei', '関税のシーソー', 'あそび場', '関税 貿易 輸入 輸出 自由貿易 保護貿易 貿易摩擦 仕返し トマト 農家 需要と供給'],
    ['vote.html#namevote', 'お札マンの名前を決めよう', '投票', 'お札マン キャラクター 名前 投票 おさつくん あさふだ ふだまる 案 候補 名前を考える'],
    ['sponsor.html#return', 'ご協賛へのお返し', '協賛', '協賛 スポンサー お返し 広報 返却 報告 将来'],
    ['index.html#deck', '開演の案内から見るスライド', 'トップ', 'スライド 発表 開演 案内 声 アナウンス カウントダウン プレゼン ナレーション 字幕 BGM'],
    ['quiz.html#otsuri', 'おつりの達人', 'クイズ', 'おつり お金 計算 小学生 レジ お店 ゲーム 硬貨 レジ締め 列 両替 小銭'],
    ['glossary.html#jugyou', '授業で使う 3 つの 50 分', '用語辞典', '授業 先生 学校 教材 指導案 50分 流れ 公民 社会'],
    ['sim.html#ike', 'みんなの池', '経済ラボ', '共有地の悲劇 資源 魚 漁業 とりすぎ 漁獲枠 TAC SDGs 外部性 ルール'],
    ['sim.html#kinri', '景気の舵とり', '経済ラボ', '金利 政策金利 日本銀行 日銀 金融政策 物価 インフレ 2% 景気 失業率 原油'],
    ['sim.html#seri', 'せりの会場', '経済ラボ', 'せり オークション 入札 封印入札 落札 マグロ 市場 価格 価値 仲買人'],
    ['sim.html#hoken', 'みんなで備える箱', '経済ラボ', '保険 掛け金 リスク 大数の法則 確率 健康保険 社会保障 台風 再保険 助け合い'],
    ['sim.html#asagohan', '朝ごはんの世界旅行', '経済ラボ', '貿易 輸入 朝ごはん 地図 比較優位 食料自給率 フードマイレージ バナナ コーヒー 小麦 大豆'],
    ['sim.html#pazuru', 'お金のめぐりパズル', '経済ラボ', 'パズル お金のめぐり 家計 企業 銀行 政府 給料 代金 預金 貸し出し 税金 公共サービス'],
    ['sim.html#tsuuka', 'お祭りの券のルールを決める工房', '経済ラボ', '券 ルール インフレ 物価 信用 にせもの対策 仕組み お祭り'],
    ['sim.html#koubou', '仕組みをつくる工房（村の税金）', '経済ラボ', '税金 税率 累進課税 再分配 格差 公共 仕組み つくる 村'],
    ['glossary.html#karuta', '経済ことばかるた', '用語辞典', 'かるた 札 言葉 説明 読み上げ ゲーム 用語'],
    ['glossary.html#seiza', 'ことばの星座', '用語辞典', '星座 つながり 関係 ことば 用語 地図 ネットワーク 星'],
    ['glossary.html#shiritori', '経済しりとり', '用語辞典', 'しりとり ゲーム ことば 言葉 あそび コンピューター 対戦'],
    ['sim.html#meguri', 'お金のめぐり（図）', '経済ラボ', '経済循環 お金の流れ 家計 企業 銀行 政府 税金 給料 預金 融資 社会保障 公共事業 図'],
    ['festival.html#bill', '麻経券をデザインする', '文化祭', '紙幣 お札 券 チップ つくる デザイン 画像 オリジナル'],
    ['index.html#deck', '1 分でわかる麻経（スライド）', 'トップ', 'スライド 紹介 プレゼン 説明 協賛 社内 授業 1分'],
    ['glossary.html#newsfind', 'ニュースの言葉さがし', '用語辞典', 'ニュース 記事 新聞 貼りつけ 言葉 さがす 読む 意味 わからない 辞典'],
    ['events.html#koyomi', '経済の暦', '日程とイベント', '暦 カレンダー 今日は何の日 記念日 歴史 できごと 円 ユーロ リーマン 消費税 新紙幣'],
    ['festival.html#athome', '家で回る麻布経済展', '文化祭', 'スタンプラリー スタンプ 修了証 入門 修了 家 Web 展示 回る'],
    ['quiz.html#cardgame', '経済カード勝負', 'クイズ', 'カード カードゲーム 勝負 対戦 預金 債券 株 外貨 起業 リスク 文化祭 コーナー 確率 期待値 取材'],
    ['quiz.html#crossword', '経済クロスワード', 'クイズ', 'クロスワード パズル カギ 用語 文化祭 コーナー 今日の問題 日替わり'],
    ['quiz.html#sugoroku', '経済すごろく', 'クイズ', 'すごろく サイコロ ゲーム 税金 保険 投資 給料 貯金 利息 株価 景気 詐欺 分散 借金'],
    ['mypage.html', '今日のミッション', 'その他', 'ミッション お題 スタンプ 連続'],
    ['index.html#weekly', '今週の 1 問', 'ホーム', 'クイズ 毎週'],
    ['diagnosis.html#types', '投資家タイプ一覧', '診断', 'タイプ 結果'],
    ['sponsor.html', '協賛・取材のご相談', '協賛', 'スポンサー 企業 取材 メディア'],
    ['about.html#updates', 'ホームページの更新履歴', '麻経とは', 'あたらしい 新機能 お知らせ 更新'],
    ['mypage.html', 'わたしの記録', 'その他', 'マイページ 自己ベスト 進み具合 記録'],
    ['policy.html', 'サイトポリシー', 'その他', '著作権 リンク 免責 推奨環境 写真 アクセシビリティ 安心'],
    ['sitemap.html', 'サイトマップ（経済の町の地図）', 'その他', 'ページ一覧 全体 地図 町 探検 建物 マップ'],
    ['privacy.html', 'プライバシーポリシー', 'その他', '個人情報 cookie']
  ].map(([href, ja, group, kw]) => ({ href, ja, group, kw }));
  window.AZAKEI_SPOTS = SPOTS;
  const pages = (window.AZAKEI_PAGES || []).map(p => ({ href: p.href, ja: p.ja, group: p.group, kw: (p.en || '') + ' ' + (p.desc || '') }));
  const all = pages.concat(SPOTS).map(it => ({ ...it, key: norm(it.ja + ' ' + it.kw + ' ' + it.group) }));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const run = () => {
    const q = norm(input.value);
    if (!q) { list.hidden = true; list.innerHTML = ''; return; }
    const hits = all.filter(it => it.key.includes(q)).sort((a, b) => (norm(b.ja).includes(q)) - (norm(a.ja).includes(q))).slice(0, 8);
    list.innerHTML = hits.map(it => `<li><a href="${it.href}"><b>${esc(it.ja)}</b><small>${esc(it.group)}</small></a></li>`).join('')
      + `<li class="si-r-gl"><a href="glossary.html?q=${encodeURIComponent(input.value.trim())}"><b>「${esc(input.value.trim())}」を用語辞典でさがす</b><small>用語辞典</small></a></li>`;
    list.hidden = false;
  };
  input.addEventListener('input', run);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { const a = list.querySelector('a'); if (a) { e.preventDefault(); location.href = a.href; } } });
  // 同じページの中へ飛ぶときは、目次を閉じる
  list.addEventListener('click', e => { const m = document.getElementById('mobileMenu'), h = document.getElementById('hamburger'); if (e.target.closest('a') && m && h && m.classList.contains('open')) h.click(); });
})();
