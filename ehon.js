/* ================================================================
   ehon.js — あそび場：絵本「お札マンと千円札の旅」（近づいてから読みこむ）
   ・1 枚の千円札が町をめぐる絵本。とちゅうの「えらぶページ」で、千円札の使い方を 3 つからえらぶと、お話が分かれる
       町のパン屋さんで使う（町の中でめぐる）／遠くのネットのお店で使う（町の外へ出る）／銀行にあずける（お店に貸し出される）
   ・千円札が通ったところが、上のスタンプ帳にたまる。おしまいのページで、通った数とえらんだ道のわけ、3 問の確かめクイズ
   ・「お札マンが読む」：VOICEVOX でつくったお札マンの声（voice.js の man）。読んでいる文が光る。「自動でめくる」も
   ・お話は、お金のめぐりを説明するための「たとえ」。千円札の絵は、本物に似せない（数字だけ）
   ・見た目は site.css の .eh と、ehon.css（このファイルが読みこむ）。読んだ道は azakei_ehon_routes
   ================================================================ */
(function() {
  const box = document.querySelector('[data-ehon]');
  const EV = (document.currentScript && document.currentScript.src.split('v=')[1]) || '1';
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
  const OLD = [
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
  // ── ページ（id ごと）。x は、お札マンが読む文（VOICEVOX でつくった声。tools/voicevox の vv-extract.pl が x: を集める）
  //    st：千円札が通ったところ（スタンプ）。next：次のページ。pick：えらぶページ
  const PICK_ART = `${GROUND('#f3ead6')}${HOUSE(300, 194, '#b5432f', 'きみの家')}${BLD(95, 250, 120, 90, '#b08a4a', 'パン屋さん', 'パン')}${BLD(505, 250, 120, 110, '#1c2b23', '銀行', '銀行')}<g transform="translate(300,72)"><rect x="-58" y="-26" width="116" height="40" rx="8" fill="#fffaf0" stroke="#2f5a8a" stroke-width="2.5"/>${T(0, 0, 15, 'ネットのお店', '#2f5a8a')}<path d="M-20 14 L0 30 L20 14" fill="none" stroke="#2f5a8a" stroke-width="2"/></g>`;
  const NET_ART = `${GROUND('#e9edf3')}${HOUSE(110, 194, '#b5432f', 'きみの家')}<path d="M330 120 H600" stroke="#9aa7b8" stroke-width="3" stroke-dasharray="10 8"/>${T(470, 108, 15, 'ここから先は町の外', '#6b7a8e', 700)}${BLD(520, 250, 130, 120, '#2f5a8a', '遠くの会社', '会社')}<g class="eh-truck" transform="translate(300,222)"><rect x="-40" y="-26" width="56" height="30" rx="4" fill="#fffaf0" stroke="#2f5a8a" stroke-width="2"/><rect x="16" y="-18" width="24" height="22" rx="3" fill="#cfe0f0" stroke="#2f5a8a" stroke-width="2"/><circle cx="-24" cy="8" r="7" fill="#2a2015"/><circle cx="26" cy="8" r="7" fill="#2a2015"/></g>`;
  const OVEN_ART = `${GROUND('#f6ead8')}${BLD(220, 250, 220, 140, '#b08a4a', 'パン屋さん（大きくなった）', 'パン')}<g class="eh-oven" transform="translate(470,250)"><rect x="-56" y="-96" width="112" height="96" rx="8" fill="#6b4a22"/><rect x="-42" y="-78" width="84" height="46" rx="6" fill="#ffb45a" class="eh-fire"/>${T(0, -14, 14, '新しいオーブン', '#fffaf0')}</g>`;
  const END_ART = OLD[7][3];
  const PG = {
    cover: { t: 'お札マンと千円札の旅', x: '1 枚の千円札が、町をどうめぐるのか。きみがえらぶと、旅の行き先が変わるよ。', o: 0, next: 'pay' },
    pay: { t: '給料をもらう', x: 'お父さんは、会社で働いて給料をもらいます。そのうちの 1 枚の千円札が、きみのおこづかいになりました。', o: 1, st: [['会', '会社'], ['家', 'きみの家']], next: 'pick' },
    pick: { t: '千円札を、どう使う？', x: 'きみのおさいふに、千円札が 1 枚。どう使うかで、千円札の旅が変わるよ。', art: PICK_ART, bg: '#f3ead6', path: [300, 170, 300, 120], man: [300, 228, 1], pick: [['local', 'パ', '町のパン屋さんで、パンとノートを買う'], ['net', '遠', '遠くのネットのお店で、本を注文する'], ['bank', '銀', '使わずに、銀行にあずける']] },
    local1: { t: '町のパン屋さんで買う', x: 'きみは町のパン屋さんで、パンとノートを買いました。パン屋さんは、そのお金で小麦屋さんから小麦を仕入れ、店員さんに給料をはらいます。', o: 2, st: [['パ', 'パン屋さん']], next: 'local2' },
    local2: { t: '町の中をめぐる', x: '小麦屋さんも店員さんも、もらったお金を町で使います。同じ千円札が、町の中を何度もめぐるんだ。', o: 3, st: [['麦', '小麦屋さん'], ['働', '店員さん'], ['店', '町の八百屋さん']], next: 'tax' },
    net1: { t: '遠くのネットのお店で買う', x: 'ネットのお店は、安くて便利。でも、はらったお金は、町の外の会社へ行きます。', art: NET_ART, bg: '#e9edf3', path: [120, 170, 520, 140], man: [230, 226, 1], st: [['遠', '遠くの会社']], next: 'net2' },
    net2: { t: '町の外へ出たお金', x: '遠くの会社も、働く人に給料をはらいます。でも、その人たちが住んでいるのは別の町。この町の中をめぐるお金は、少なくなりました。', art: NET_ART, bg: '#e9edf3', path: [520, 140, 600, 120], man: [230, 226, 1], next: 'tax' },
    bank1: { t: '銀行にあずける', x: 'きみは千円札を、銀行にあずけました。銀行は、みんなからあずかったお金をまとめて、お店を広げたいパン屋さんに貸します。', o: 4, st: [['銀', '銀行']], next: 'bank2' },
    bank2: { t: 'パン屋さんの新しいオーブン', x: 'パン屋さんは、借りたお金で新しいオーブンを買いました。パンをたくさん焼けるようになり、働く人もふえました。借りたお金は、利息をつけて少しずつ返します。', art: OVEN_ART, bg: '#f6ead8', path: [220, 150, 470, 190], man: [340, 228, 1], st: [['パ', 'パン屋さん'], ['窯', 'オーブンの会社'], ['働', '新しい店員さん']], next: 'tax' },
    tax: { t: '税金をおさめる', x: '買い物のときにはらった消費税や、お店や会社のもうけの一部は、税金として国や市に集まります。', o: 5, st: [['税', '国や市']], next: 'back' },
    back: { t: 'みんなに返ってくる', x: '集まった税金は、学校や道路、公園になって、町のみんなに返ってきます。', o: 6, st: [['学', '学校や道路']], next: 'end' },
    end: { t: 'お金はめぐっている', x: '千円札は、町をめぐって、また誰かのおさいふへ。きみが使ったお金も、どこかで誰かの役に立っているよ。', art: END_ART, bg: '#f3e6c8', man: [300, 262, 1], end: 1 }
  };
  const ROUTE = {
    local: ['町のパン屋さんで使った', '地元のお店で使うと、お金が町の中に残りやすく、何人ものおさいふをめぐります。'],
    net: ['遠くのネットのお店で使った', '安くて便利な買い物も大切。でも、お金が町の外へ出ると、この町の中をめぐるお金は少なくなります。'],
    bank: ['銀行にあずけた', '使わないお金も、銀行を通して、町のお店が大きくなるのに使われています。']
  };
  const QZ = [
    ['町のパン屋さんで使った千円札は、そのあとどうなる？', ['小麦屋さんや店員さんへ、またわたっていく', 'パン屋さんのレジで止まって、それきり', '使ったら、なくなってしまう']],
    ['銀行は、あずかったお金をどうする？', ['お金が必要な会社やお店に貸す', '金庫にしまって、ずっと動かさない', 'あずけた人に、毎日少しずつ返す']],
    ['集まった税金は、何に使われる？', ['学校や道路、公園など、みんなのため', '税金を集めた人のおこづかい', 'ぜんぶ外国へ送る']]
  ];
  const shuffle = a => { a = a.slice(); for (let k = a.length - 1; k > 0; k--) { const j = Math.random() * (k + 1) | 0; [a[k], a[j]] = [a[j], a[k]]; } return a; };
  const splitS = t => String(t).replace(/\s+/g, ' ').split(/(?<=[。！？])/).map(s => s.trim()).filter(Boolean);
  let routes = []; try { routes = JSON.parse(localStorage.getItem('azakei_ehon_routes') || '[]'); } catch (e) {}
  let id = 'cover', route = null, stamps = [], hist = [], auto = false, voice = false, timer = null, typeT = null, rtok = 0, qz = null;

  box.innerHTML = `<div class="eh-book">
      <div class="eh-stamp" aria-label="千円札が通ったところ"><span class="eh-sk">千円札が通ったところ</span><ol></ol></div>
      <div class="eh-page" aria-live="polite"></div>
      <div class="eh-ctl">
        <button type="button" class="eh-prev" aria-label="前のページ">←</button>
        <ol class="eh-dots" aria-hidden="true"></ol>
        <button type="button" class="eh-next" aria-label="次のページ">→</button>
      </div>
      <div class="eh-opts"><button type="button" class="eh-voice" aria-pressed="false">お札マンが読む</button><button type="button" class="eh-auto" aria-pressed="false">自動でめくる</button></div>
    </div>
    <p class="eh-note">お話は、お金のめぐりを説明するための「たとえ」です。千円札の絵は、本物のお金に似せていません。</p>`;
  const page = box.querySelector('.eh-page');
  const V = () => window.AZAKEI_VOICE ? Promise.resolve(window.AZAKEI_VOICE) : new Promise(r => { const sc = document.createElement('script'); sc.src = 'voice.js?v=' + EV; sc.onload = () => r(window.AZAKEI_VOICE || null); sc.onerror = () => r(null); document.head.appendChild(sc); });
  const hush = () => { rtok++; clearTimeout(timer); clearTimeout(typeT); if (window.AZAKEI_VOICE) AZAKEI_VOICE.ttsStop(); };
  const drawStamps = fresh => {
    box.querySelector('.eh-stamp ol').innerHTML = stamps.map(([s, n], k) => `<li class="${k >= stamps.length - fresh ? 'is-new' : ''}" title="${n}" style="--r:${(k % 3 - 1) * 7}deg"><b>${s}</b><small>${n}</small></li>`).join('') || '<li class="is-empty">まだ</li>';
  };
  const plan = () => { const path = ['cover', 'pay', 'pick']; if (route) { path.push(route + '1', route + '2', 'tax', 'back', 'end'); } return path; };
  const render = dir => {
    hush();
    const P = PG[id], o = P.o != null ? OLD[P.o] : null;
    const art = P.art || o[3], bg = P.bg || o[2], path = P.path || (o && o[4]), man = P.man || o[5], gl = o ? o[6] : [];
    page.style.setProperty('--bg', bg);
    const sents = splitS(P.x);
    page.innerHTML = `<div class="eh-leaf${dir ? ' is-' + dir : ''}">
      <svg class="eh-art" viewBox="0 0 600 320" role="img" aria-label="${P.t}">${art}
        ${path ? `<g class="eh-run" style="--x1:${path[0]}px;--y1:${path[1]}px;--x2:${path[2]}px;--y2:${path[3]}px">${NOTE}</g>` : ''}
        ${MAN(man[0], man[1], man[2])}</svg>
      <div class="eh-text"><p class="eh-no">${id === 'cover' ? '表紙' : P.pick ? 'えらぶページ' : P.end ? 'おしまい' : `${plan().indexOf(id)} / ${plan().length - 1}`}</p><h3>${P.t}</h3>
        <p class="eh-x">${sents.map((s, k) => `<span data-s="${k}">${s}</span>`).join('')}</p>
        ${P.pick ? `<div class="eh-pick">${P.pick.map(([r, s, l]) => `<button type="button" data-route="${r}"><span>${s}</span>${l}${routes.includes(r) ? '<em>読んだ</em>' : ''}</button>`).join('')}</div>` : ''}
        ${P.end ? endHTML() : ''}
        ${gl && gl.length ? `<p class="eh-gl">${gl.map(([g, n]) => `<a href="glossary.html#${g}">${n}</a>`).join('')}</p>` : ''}</div></div>`;
    if (P.st && dir !== 'back') { const add = P.st.filter(([s, n]) => !stamps.some(x => x[1] === n)); stamps = stamps.concat(add); drawStamps(add.length); } else drawStamps(0);
    // 文字が 1 つずつ出る。声ありなら、読んでいる文が光る
    const spans = [...page.querySelectorAll('.eh-x span')];
    spans.forEach(s => { s.dataset.full = s.textContent; s.textContent = ''; });
    let si = 0, k = 0;
    const typeStep = () => { const sp = spans[si]; if (!sp) return afterType(); const full = sp.dataset.full; k = reduce ? full.length : k + 1; sp.textContent = full.slice(0, k); if (k >= full.length) { si++; k = 0; } typeT = setTimeout(typeStep, reduce ? 0 : /[、。！？]/.test(full[k - 1] || '') ? 160 : 34); };
    const tok = rtok;
    let typed = false, spoken = !voice;
    const afterType = () => { typed = true; maybeNext(); };
    const maybeNext = () => { if (tok !== rtok || !typed || !spoken) return; if (auto && P.next) timer = setTimeout(() => goId(P.next, 'fwd'), voice ? 900 : 3200); };
    typeStep();
    if (voice) V().then(v => { if (!v || tok !== rtok) return; v.man(P.x, { onPart: (s, n) => { spans.forEach((sp, j) => sp.classList.toggle('is-now', j === n)); } }).then(() => { if (tok !== rtok) return; spans.forEach(sp => sp.classList.remove('is-now')); spoken = true; maybeNext(); }); });
    const pl = plan(), pos = pl.indexOf(id);
    box.querySelector('.eh-dots').innerHTML = pl.map((p, j) => `<li class="${j === pos ? 'is-on' : ''}${p === 'pick' ? ' is-pick' : ''}"></li>`).join('') + (route ? '' : '<li class="is-q"></li><li class="is-q"></li><li class="is-q"></li>');
    box.querySelector('.eh-prev').disabled = !hist.length;
    box.querySelector('.eh-next').disabled = !P.next;
  };
  const endHTML = () => {
    const r = ROUTE[route] || ROUTE.local;
    return `<div class="eh-end"><p class="eh-sum">きみは千円札を<b>${r[0]}</b>。千円札は <b>${stamps.length}</b> か所を通りました。</p><p class="eh-why">${r[1]}</p>
      <p class="eh-rt">読んだ道 ${['local', 'net', 'bank'].map(x => `<span class="${routes.includes(x) ? 'is-on' : ''}">${{ local: 'パン屋さん', net: 'ネット', bank: '銀行' }[x]}</span>`).join('')}</p>
      <div class="eh-endb"><button type="button" class="eh-quiz">確かめクイズ（3 問）</button><button type="button" class="eh-again">ほかの使い方で読む</button></div><div class="eh-qz" aria-live="polite"></div></div>`;
  };
  const goId = (n, dir = 'fwd', push = true) => { if (!PG[n] || n === id) return; if (push) hist.push([id, stamps.slice()]); id = n; render(dir); };
  const choose = r => {
    route = r; if (!routes.includes(r)) { routes.push(r); try { localStorage.setItem('azakei_ehon_routes', JSON.stringify(routes)); } catch (e) {} }
    goId(r + '1');
  };
  const back = () => { const h = hist.pop(); if (!h) return; id = h[0]; stamps = h[1]; if (id === 'pick' || id === 'pay' || id === 'cover') route = null; render('back'); };
  const quiz = () => {
    hush();
    qz = { k: 0, ok: 0, order: shuffle([0, 1, 2]) };
    ask();
  };
  const ask = () => {
    const el = page.querySelector('.eh-qz'); if (!el) return;
    if (qz.k >= QZ.length) {
      try { localStorage.setItem('azakei_ehon', '1'); } catch (e) {}
      el.innerHTML = `<div class="eh-qres"><span class="eh-seal" aria-hidden="true">${qz.ok === 3 ? '満' : qz.ok >= 2 ? '良' : '旅'}</span><p><b>${qz.ok} / 3 問</b>${qz.ok === 3 ? '　お金のめぐり、ばっちり！' : '　もう一度、絵本を読んでみよう。'}</p></div>`;
      return;
    }
    const [q, opts] = QZ[qz.order[qz.k]], ord = shuffle(opts.map((t, j) => [t, j === 0]));
    el.innerHTML = `<p class="eh-qq"><span>Q${qz.k + 1}</span>${q}</p><div class="eh-qo">${ord.map(([t, ok]) => `<button type="button" data-ok="${ok ? 1 : 0}">${t}</button>`).join('')}</div>`;
  };
  box.addEventListener('click', e => {
    const r = e.target.closest('[data-route]'); if (r) { choose(r.dataset.route); return; }
    if (e.target.closest('.eh-again')) { hist = []; stamps = stamps.filter(s => s[1] === '会社' || s[1] === 'きみの家'); route = null; id = 'pick'; render('fwd'); return; }
    if (e.target.closest('.eh-quiz')) { quiz(); return; }
    const a = e.target.closest('.eh-qo button');
    if (a && qz) {
      const bs = page.querySelectorAll('.eh-qo button'); if (bs[0].disabled) return;
      bs.forEach(b => { b.disabled = true; if (b.dataset.ok === '1') b.classList.add('is-ok'); });
      if (a.dataset.ok === '1') qz.ok++; else a.classList.add('is-ng');
      setTimeout(() => { qz.k++; ask(); }, reduce ? 300 : 1100);
    }
  });
  box.querySelector('.eh-prev').onclick = back;
  box.querySelector('.eh-next').onclick = () => { const n = PG[id].next; if (n) goId(n); };
  const ab = box.querySelector('.eh-auto');
  ab.onclick = () => { auto = !auto; ab.setAttribute('aria-pressed', auto); ab.textContent = auto ? '自動でめくる：入' : '自動でめくる'; render(); };
  const vb = box.querySelector('.eh-voice');
  vb.onclick = () => { voice = !voice; vb.setAttribute('aria-pressed', voice); vb.textContent = voice ? 'お札マンが読む：入' : 'お札マンが読む'; render(); };
  let sx = null;
  page.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  page.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) { if (dx < 0 && PG[id].next) goId(PG[id].next); else if (dx > 0) back(); } }, { passive: true });
  box.addEventListener('keydown', e => { if (e.key === 'ArrowRight' && PG[id].next) goId(PG[id].next); if (e.key === 'ArrowLeft') back(); });
  // 画面から外れたら、自動めくりと読み上げを止める
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { if (!es[0].isIntersecting) hush(); }).observe(box);
  if (!document.querySelector('link[href^="ehon.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'ehon.css?v=' + EV; document.head.appendChild(l); }
  render();
})();
