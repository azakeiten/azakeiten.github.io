/* ================================================================
   ehon.js — クイズ：絵本「お札マンと千円札の旅」（近づいてから読みこむ）
   ・1 枚の千円札が、給料 → 買い物 → お店 → 銀行 → 税金 → 学校や道路 と町をめぐる、8 ページの絵本
   ・ページをめくる動き、絵の中を千円札が動く、お札マンがはねる。「声で読む」「自動でめくる」も
   ・お話は、お金のめぐりを説明するための「たとえ」。千円札の絵は、本物に似せない（数字と「たとえ」だけ）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-ehon]');
  // 読むのはお札マン（voice.js の manTone：男の人の声で、少し低く）
  const EV = (document.currentScript && document.currentScript.src.split('v=')[1]) || '1';
  const speakIt = s => {
    const go = () => { const V = window.AZAKEI_VOICE, u = new SpeechSynthesisUtterance(V ? V.fix(s) : s); u.lang = 'ja-JP'; if (V) { const mt = V.manTone(); if (mt.voice) u.voice = mt.voice; u.pitch = mt.pitch; u.rate = mt.rate; } speechSynthesis.speak(u); };
    if (window.AZAKEI_VOICE) setTimeout(go, 80); else { const sc = document.createElement('script'); sc.src = 'voice.js?v=' + EV; sc.onload = go; sc.onerror = go; document.head.appendChild(sc); }
  };
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // お札マン（小さい絵）
  const MAN = (x, y, s = 1) => `<g class="eh-man" transform="translate(${x},${y}) scale(${s})"><g class="eh-man-in">
    <path d="M-8 22 L-10 34 M8 22 L10 34" stroke="#6b4a22" stroke-width="3" stroke-linecap="round"/>
    <path d="M-24 4 L-34 10 M24 2 L33 -8" stroke="#6b4a22" stroke-width="3" stroke-linecap="round"/>
    <rect x="-26" y="-14" width="52" height="36" rx="5" fill="#e6d5b3" stroke="#6b4a22" stroke-width="2.5"/>
    <polygon points="-17,-9 -13,-2 -21,-2" fill="#2f6b3a"/><polygon points="-17,0 -21,-7 -13,-7" fill="#2f6b3a"/>
    <circle cx="-2" cy="2" r="2.6" fill="#2a2015"/><circle cx="10" cy="2" r="2.6" fill="#2a2015"/>
    <path d="M0 9 Q4 13 8 9" fill="none" stroke="#2a2015" stroke-width="2" stroke-linecap="round"/></g></g>`;
  // 千円札（本物に似せない。たとえの絵）
  const NOTE = `<g class="eh-note"><rect x="-22" y="-12" width="44" height="24" rx="3" fill="#cfe3c6" stroke="#2f6b3a" stroke-width="2"/><text y="5" text-anchor="middle" font-size="12" font-weight="800" fill="#2f6b3a">1000</text></g>`;
  const T = (x, y, s, t, c = '#2a2015', w = 800) => `<text x="${x}" y="${y}" font-size="${s}" font-weight="${w}" fill="${c}" text-anchor="middle" font-family="Shippori Mincho, serif">${t}</text>`;
  const HOUSE = (x, y, c, label) => `<g transform="translate(${x},${y})"><polygon points="-46,0 0,-36 46,0" fill="${c}"/><rect x="-38" y="0" width="76" height="56" fill="#fffaf0" stroke="#6b4a22" stroke-width="2"/><rect x="-10" y="22" width="20" height="34" fill="#c9a77a"/>${label ? T(0, 80, 15, label) : ''}</g>`;
  const BLD = (x, y, w, h, c, label, sign) => `<g transform="translate(${x},${y})"><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="#fffaf0" stroke="#6b4a22" stroke-width="2"/><rect x="${-w / 2 - 6}" y="${-h - 14}" width="${w + 12}" height="16" rx="3" fill="${c}"/>${sign ? T(0, -h - 2, 12, sign, '#fff') : ''}${Array.from({ length: 3 }, (_, i) => `<rect x="${-w / 2 + 10 + i * (w - 20) / 3}" y="${-h + 16}" width="${(w - 40) / 3}" height="16" fill="#cfe3e8"/>`).join('')}<rect x="-10" y="-30" width="20" height="30" fill="#c9a77a"/>${label ? T(0, 24, 15, label) : ''}</g>`;
  const GROUND = c => `<rect x="0" y="0" width="600" height="320" fill="${c}"/><rect x="0" y="250" width="600" height="70" fill="#d9cfa8"/><path d="M0 250 H600" stroke="#b9ad84" stroke-width="2"/>`;
  // [見出し, 文, 背景色, 絵, 千円札の道（x1,y1 → x2,y2）, お札マンの位置, 辞典の言葉]
  const P = [
    ['お札マンと千円札の旅', '1 枚の千円札が、町をどうめぐるのか。お札マンといっしょに、追いかけてみよう。', '#f3e6c8',
      `${T(300, 92, 34, 'お札マンと千円札の旅')}${T(300, 126, 15, '（お金のめぐりを説明するための、たとえのお話）', '#6b4a22', 600)}`, [200, 210, 380, 200], [300, 225, 1.6], []],
    ['給料をもらう', 'お父さんは、会社で働いて給料をもらいます。そのうちの 1 枚の千円札が、きみのおこづかいになりました。', '#e8eef0',
      `${GROUND('#e8eef0')}${BLD(170, 250, 150, 130, '#2f5a8a', '会社', '会社')}${HOUSE(450, 194, '#b5432f', 'きみの家')}`, [200, 160, 430, 170], [330, 220, 1], [['wage', '給料']]],
    ['買い物をする', 'きみは千円札で、パンとノートを買いました。千円札は、お店のものになります。おつりももらったね。', '#f6ead8',
      `${GROUND('#f6ead8')}${HOUSE(130, 194, '#b5432f', 'きみの家')}${BLD(440, 250, 170, 110, '#b08a4a', 'パン屋さん', 'パン')}`, [150, 170, 430, 175], [290, 222, 1], [['consumption', '消費']]],
    ['お店のお金のゆくえ', 'パン屋さんは、売れたお金で小麦を仕入れたり、働く人に給料をはらったりします。お金は、また別の人へ。', '#f6ead8',
      `${GROUND('#f6ead8')}${BLD(160, 250, 170, 110, '#b08a4a', 'パン屋さん', 'パン')}${BLD(450, 250, 130, 80, '#2f6b3a', '小麦のお店', '小麦')}`, [170, 175, 450, 190], [310, 222, 1], [['sales-profit', '売上高と利益']]],
    ['銀行にあずける', '使わないお金は、銀行にあずけられます。銀行は、そのお金を、お店を広げたい会社に貸します。', '#e6eee6',
      `${GROUND('#e6eee6')}${BLD(140, 250, 140, 120, '#2f6b3a', 'あずける人', '家')}${BLD(320, 250, 150, 150, '#1c2b23', '銀行', '銀行')}${BLD(500, 250, 120, 100, '#2f5a8a', '会社', '会社')}`, [140, 170, 500, 180], [320, 222, 1], [['deposit', '預金'], ['loan-lending', '貸し出し']]],
    ['税金をおさめる', '買い物のときにはらった消費税や、もうけの一部は、税金として国や市に集まります。', '#efe8f2',
      `${GROUND('#efe8f2')}${BLD(150, 250, 150, 100, '#b08a4a', 'お店や会社', 'お店')}${BLD(440, 250, 170, 150, '#7a4a8a', '国や市', '役所')}`, [160, 180, 440, 170], [300, 222, 1], [['tax', '税金']]],
    ['みんなに返ってくる', '集まった税金は、学校や道路、公園になって、町のみんなに返ってきます。', '#e8f0e4',
      `${GROUND('#e8f0e4')}${BLD(140, 250, 170, 120, '#b5432f', '学校', '学校')}<g transform="translate(330,250)"><rect x="-60" y="0" width="120" height="60" fill="#8a8a8a"/><path d="M-60 30 H60" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>${T(0, 84, 15, '道路')}</g><g transform="translate(500,250)"><circle cy="-50" r="34" fill="#6fa86a"/><rect x="-5" y="-20" width="10" height="20" fill="#8a6a3a"/>${T(0, 24, 15, '公園')}</g>`, [450, 120, 160, 150], [330, 222, 1], [['public-goods', '公共財']]],
    ['お金はめぐっている', '千円札は、町をぐるりとめぐって、また誰かのおさいふへ。きみが使ったお金も、どこかで誰かの役に立っているよ。', '#f3e6c8',
      `${T(300, 70, 28, 'お金はめぐっている')}<g transform="translate(300,170)"><circle r="70" fill="none" stroke="#b5432f" stroke-width="3" stroke-dasharray="8 8" class="eh-loop"/>${[['家計', -90], ['お店', -18], ['銀行', 54], ['国', 126], ['学校', 198]].map(([t, a]) => { const r = a * Math.PI / 180; return `<g transform="translate(${Math.cos(r) * 70},${Math.sin(r) * 70})"><rect x="-26" y="-14" width="52" height="28" rx="6" fill="#1c2b23"/>${T(0, 5, 13, t, '#fff')}</g>`; }).join('')}</g>`, null, [470, 225, 1.2], [['money-roles', 'お金の 3 つの役割']]]
  ];
  let i = 0, auto = false, voice = false, timer = null, typeT = null;
  box.innerHTML = `<div class="eh-book">
      <div class="eh-page" aria-live="polite"></div>
      <div class="eh-ctl">
        <button type="button" class="eh-prev" aria-label="前のページ">←</button>
        <ol class="eh-dots" aria-hidden="true">${P.map(() => '<li></li>').join('')}</ol>
        <button type="button" class="eh-next" aria-label="次のページ">→</button>
      </div>
      <div class="eh-opts"><button type="button" class="eh-auto" aria-pressed="false">自動でめくる</button>${'speechSynthesis' in window ? '<button type="button" class="eh-voice" aria-pressed="false">声で読む</button>' : ''}</div>
    </div>
    <p class="eh-note">お話は、お金のめぐりを説明するための「たとえ」です。千円札の絵は、本物のお金に似せていません。</p>`;
  const page = box.querySelector('.eh-page');
  const render = dir => {
    clearTimeout(timer); clearTimeout(typeT);
    if (window.speechSynthesis) speechSynthesis.cancel();
    const [t, x, bg, art, path, man, gl] = P[i];
    page.style.setProperty('--bg', bg);
    page.innerHTML = `<div class="eh-leaf${dir ? ' is-' + dir : ''}">
      <svg class="eh-art" viewBox="0 0 600 320" role="img" aria-label="${t}">${art}
        ${path ? `<g class="eh-run" style="--x1:${path[0]}px;--y1:${path[1]}px;--x2:${path[2]}px;--y2:${path[3]}px">${NOTE}</g>` : ''}
        ${MAN(man[0], man[1], man[2])}</svg>
      <div class="eh-text"><p class="eh-no">${i === 0 ? '表紙' : `${i} / ${P.length - 1}`}</p><h3>${t}</h3><p class="eh-x"></p>
      ${gl.length ? `<p class="eh-gl">${gl.map(([id, n]) => `<a href="glossary.html#${id}">${n}</a>`).join('')}${i === P.length - 1 ? '<a href="sim.html#meguri">お金のめぐりの図</a>' : ''}</p>` : ''}</div></div>`;
    const el = page.querySelector('.eh-x');
    let k = 0;
    const step = () => { k = reduce ? x.length : k + 1; el.textContent = x.slice(0, k); if (k < x.length) typeT = setTimeout(step, /[、。]/.test(x[k - 1]) ? 180 : 38); else if (auto) timer = setTimeout(() => go(i + 1 < P.length ? i + 1 : 0), voice ? 2500 : 3500); };
    step();
    if (voice && window.speechSynthesis) { speakIt(t + '。' + x); }
    box.querySelectorAll('.eh-dots li').forEach((d, j) => d.classList.toggle('is-on', j === i));
    box.querySelector('.eh-prev').disabled = i === 0;
    box.querySelector('.eh-next').disabled = i === P.length - 1 && !auto;
    if (i === P.length - 1) { try { localStorage.setItem('azakei_ehon', '1'); } catch (e) {} }
  };
  const go = n => { if (n < 0 || n >= P.length || n === i) return; const dir = n > i ? 'fwd' : 'back'; i = n; render(dir); };
  box.querySelector('.eh-prev').onclick = () => go(i - 1);
  box.querySelector('.eh-next').onclick = () => go(i + 1);
  const ab = box.querySelector('.eh-auto');
  ab.onclick = () => { auto = !auto; ab.setAttribute('aria-pressed', auto); ab.textContent = auto ? '自動でめくる：入' : '自動でめくる'; render(); };
  const vb = box.querySelector('.eh-voice');
  if (vb) vb.onclick = () => { voice = !voice; vb.setAttribute('aria-pressed', voice); vb.textContent = voice ? '声：あり' : '声で読む'; render(); };
  let sx = null;
  page.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  page.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); }, { passive: true });
  box.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); });
  // 画面から外れたら、自動めくりと読み上げを止める
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { if (!es[0].isIntersecting) { clearTimeout(timer); if (window.speechSynthesis && voice) speechSynthesis.cancel(); } }).observe(box);
  render();
})();
