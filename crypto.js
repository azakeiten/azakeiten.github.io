/* ================================================================
   crypto.js — 経済ラボ：暗号資産とブロックチェーン（ビットコインのしくみを、手で確かめる）
   ・一：台帳をのぞく … 4 つのブロック。それぞれに「取引」「前のブロックの指紋」「この指紋」
   ・二：書きかえてみる … 昔の取引を書きかえると、指紋が変わって、そこから後ろが全部こわれる。
         「掘り直す」で指紋が 00 で始まる数（ナンス）をさがす（計算の手間＝マイニングのたとえ）
   ・三：みんなで持つ … 同じ台帳を 5 台のコンピューターが持つ。1 台だけ書きかえても、多数決でみとめられない
   ・四：仕分け … お札・電子マネー・暗号資産のちがいを 9 枚のカードで
   ・指紋は FNV-1a（学ぶための簡単なもの）。本物のビットコインは SHA-256 という、ずっと強い方法を使う
   ・投資をすすめるものではない（ページにも書く）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-crypto]');
  if (!box) return;
  if (!document.querySelector('link[href^="crypto.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'crypto.css?v=20261124b'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_crypto';
  /* 指紋（ハッシュ）：文字列 → 16 進 8 けた */
  const hash = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d) >>> 0; h ^= h >>> 12; return (h >>> 0).toString(16).padStart(8, '0'); };
  const OK = h => h.startsWith('00');
  const NAMES = ['アオイ', 'ケン', 'ハル', 'ミナ', 'ソラ', 'リク'];
  const START = [
    [['アオイ', 'ケン', 3], ['ハル', 'ミナ', 1]],
    [['ケン', 'ソラ', 2], ['ミナ', 'アオイ', 1]],
    [['ソラ', 'リク', 1], ['アオイ', 'ハル', 2]],
    [['リク', 'ケン', 1], ['ハル', 'ソラ', 1]]
  ];
  const body = b => b.tx.map(t => t.join('>')).join('|') + '#' + b.prev + '#' + b.nonce;
  const mineNow = b => { b.nonce = 0; while (!OK(hash(body(b)))) b.nonce++; b.h = hash(body(b)); };
  /* みんなの台帳（もとの正しいもの）と、あなたの台帳 */
  const build = () => { const c = []; let prev = '00000000'; START.forEach(tx => { const b = { tx: tx.map(t => t.slice()), prev, nonce: 0, h: '' }; mineNow(b); c.push(b); prev = b.h; }); return c; };
  const TRUE = build();
  let focusI = 1, mine = build(), busy = false, edited = false, sortDone = 0;
  const relink = () => { let prev = '00000000'; mine.forEach(b => { b.prev = prev; b.h = hash(body(b)); prev = b.h; }); };
  const valid = i => { const b = mine[i]; return OK(b.h) && b.prev === (i ? mine[i - 1].h : '00000000') && (i === 0 || valid(i - 1)); };
  const save = () => { try { localStorage.setItem(KEY, '1'); } catch (e) {} };

  box.innerHTML = `
    <ol class="cx-steps" role="tablist">
      <li><button type="button" role="tab" data-tab="0" aria-selected="true"><b>一</b>台帳を書きかえる</button></li>
      <li><button type="button" role="tab" data-tab="1" aria-selected="false"><b>二</b>みんなで持つ</button></li>
      <li><button type="button" role="tab" data-tab="2" aria-selected="false"><b>三</b>ちがいを仕分け</button></li>
    </ol>
    <div class="cx-pane" data-pane="0"></div>
    <div class="cx-pane" data-pane="1" hidden></div>
    <div class="cx-pane" data-pane="2" hidden></div>
    <div class="cx-facts">
      <p class="cx-k"><span aria-hidden="true">基</span>ビットコインの基本</p>
      <ul>
        <li><b>2008 年</b>「サトシ・ナカモト」と名のる人（だれなのかは今もわかっていない）が、しくみを論文で発表。2009 年に動きはじめた</li>
        <li><b>国や中央銀行が発行しない</b>　取引の記録を、世界中のたくさんのコンピューターが持ちあう</li>
        <li><b>上限 2,100 万枚</b>　新しく生まれる量は、約 4 年ごとに半分になる（半減期）</li>
        <li><b>約 10 分ごと</b>に、取引をまとめた「ブロック」が 1 つ、くさりのように足されていく</li>
      </ul>
    </div>
    <p class="cx-foot">※ 指紋（ハッシュ）は、しくみを見るための簡単な計算です。本物のビットコインは SHA-256 という、ずっと強い方法を使い、「掘る」計算もけたちがいに大変です。このページは、暗号資産を買うことをすすめるものではありません。</p>`;
  const pane = n => box.querySelector(`[data-pane="${n}"]`);

  /* ---- 一：台帳を書きかえる ---- */
  const drawChain = (msg) => {
    pane(0).innerHTML = `
      <p class="cx-lead">ブロックには「取引」と「1 つ前のブロックの指紋」が入っていて、それ全部から「このブロックの指紋」がつくられます。指紋が <b>00</b> で始まるときだけ、正しいブロックとみとめられます。<b>ブロック 2 の取引の枚数を、書きかえてみよう。</b></p>
      <div class="cx-chain">${mine.map((b, i) => { const v = valid(i); return `<div class="cx-blk ${v ? 'is-ok' : 'is-ng'}" style="--i:${i}">
        <p class="cx-bh"><b>ブロック ${i + 1}</b><span>${v ? 'つながっている' : 'こわれている'}</span></p>
        <ul class="cx-tx">${b.tx.map((t, j) => `<li><span>${t[0]}</span><i aria-hidden="true">→</i><span>${t[1]}</span>${i === 1 ? `<span class="cx-amt"><button type="button" data-amt="${j}" data-d="-1" aria-label="枚数を減らす"${t[2] <= 1 ? ' disabled' : ''}>−</button><b>${t[2]}</b>枚<button type="button" data-amt="${j}" data-d="1" aria-label="枚数を増やす"${t[2] >= 99 ? ' disabled' : ''}>＋</button></span>` : `<b>${t[2]}</b>枚`}</li>`).join('')}</ul>
        <p class="cx-f"><small>前の指紋</small><code class="${i && b.prev !== mine[i - 1].h ? 'is-bad' : ''}">${b.prev}</code></p>
        <p class="cx-f"><small>ナンス</small><code data-nonce="${i}">${b.nonce}</code></p>
        <p class="cx-f is-me"><small>この指紋</small><code class="${OK(b.h) ? '' : 'is-bad'}" data-h="${i}">${b.h}</code></p>
        ${v ? '' : `<button type="button" class="cx-mine" data-mine="${i}"${busy ? ' disabled' : ''}>掘り直す</button>`}
      </div>`; }).join('<i class="cx-link" aria-hidden="true"></i>')}</div>
      <p class="cx-msg" aria-live="polite">${msg || (edited ? '' : '台帳は、4 つともつながっています。')}</p>
      ${edited ? '<button type="button" class="cx-reset" data-reset="1">もとの台帳にもどす</button>' : ''}`;
    const ch = pane(0).querySelector('.cx-chain'), fb = ch.querySelectorAll('.cx-blk')[focusI];
    if (fb && ch.scrollWidth > ch.clientWidth) ch.scrollLeft = Math.max(0, fb.offsetLeft - ch.firstElementChild.offsetLeft - 8);
  };
  /* 掘る：ナンスを 0 から順にためして、指紋が 00 で始まる数をさがす（見えるように少しずつ） */
  const mineAnim = i => {
    if (busy) return; busy = true; focusI = i;
    const b = mine[i]; b.prev = i ? mine[i - 1].h : '00000000'; b.nonce = 0;
    drawChain('掘っています…… ナンスを 0 から 1 つずつためして、指紋が 00 で始まる数をさがしています。');
    const nEl = () => pane(0).querySelector(`[data-nonce="${i}"]`), hEl = () => pane(0).querySelector(`[data-h="${i}"]`);
    let tries = 0;
    const step = () => {
      for (let k = 0; k < (reduce ? 1e6 : 7); k++) { b.h = hash(body(b)); tries++; if (OK(b.h)) break; b.nonce++; }
      if (nEl()) { nEl().textContent = b.nonce; hEl().textContent = b.h; hEl().classList.toggle('is-bad', !OK(b.h)); }
      if (!OK(b.h)) { setTimeout(step, 16); return; }
      busy = false; relink(); save();
      const broken = mine.findIndex((x, j) => !valid(j)); if (broken >= 0) focusI = broken;
      drawChain(`見つかった！ ${tries.toLocaleString()} 回ためして、ナンス ${b.nonce} で指紋が 00 で始まりました。${broken >= 0 ? `でも、ブロック ${broken + 1} から後ろは、まだこわれています。前の指紋が変わったので、全部掘り直しです。` : 'これで、書きかえた台帳がつながりました。でも……「二 みんなで持つ」を見てみよう。'}`);
    };
    setTimeout(step, 30);
  };

  /* ---- 二：みんなで持つ ---- */
  const drawNet = () => {
    const tip = mine[mine.length - 1].h, same = tip === TRUE[TRUE.length - 1].h, allOk = mine.every((x, i) => valid(i));
    const PCS = ['あなた', 'Aさん', 'Bさん', 'Cさん', 'Dさん'];
    pane(1).innerHTML = `
      <p class="cx-lead">本物のビットコインでは、同じ台帳を、世界中のたくさんのコンピューターが持っています。新しいブロックは、ほかのコンピューターが確かめて「正しい」とみとめたものだけが、みんなの台帳に足されます。</p>
      <div class="cx-net">${PCS.map((p, i) => { const me = i === 0, t = me ? tip : TRUE[TRUE.length - 1].h, bad = me && !same; return `<div class="cx-pc ${bad ? 'is-ng' : 'is-ok'}" style="--a:${i * 72 - 90}deg"><span class="cx-scr" aria-hidden="true">${me ? '自' : p.slice(0, 1)}</span><b>${p}</b><code>${t.slice(0, 6)}…</code><small>${bad ? (allOk ? '書きかえた台帳' : 'こわれた台帳') : '正しい台帳'}</small></div>`; }).join('')}<i class="cx-hub" aria-hidden="true">${same ? '一致' : '1 対 4'}</i></div>
      <p class="cx-msg">${same ? (edited ? 'もとの台帳にもどったので、みんなと一致しています。' : 'いまは、5 台とも同じ台帳です。「一 台帳を書きかえる」で、ブロック 2 を書きかえてから来てみよう。')
        : allOk ? '<b>あなたは、全部を掘り直して、つじつまを合わせました。</b>それでも、ほかの 4 台の台帳とは指紋がちがうので、多数決でみとめられません。みとめさせるには、世界の半分以上の計算力を一人で持ち、ほかの全員より速く掘り続ける必要があります。だから、ブロックチェーンは書きかえにくいのです。'
        : '<b>あなたの台帳は、とちゅうからこわれています。</b>ほかの 4 台がすぐに気づくので、この台帳はみとめられません。'}</p>
      <ul class="cx-pts"><li><b>だれか 1 人が管理していない</b>　銀行のような中心がなくても、みんなで記録を確かめあう</li><li><b>マイニング（掘る）</b>　ブロックをつくる計算をした人に、新しいビットコインが生まれて支払われる。電気をたくさん使うことも問題になっている</li><li><b>秘密の鍵</b>　自分のビットコインを動かすための長い暗号。なくしたり盗まれたりすると、取り戻せないことがある</li></ul>`;
  };

  /* ---- 三：仕分け ---- */
  const KIND = ['お札（日本銀行券）', '電子マネー', '暗号資産'];
  const CARDS = [
    ['日本銀行が発行している', 0, '日本の紙幣（日本銀行券）は、日本銀行が発行しています。'],
    ['チャージした日本円の分だけ使える（交通系のカードなど）', 1, '電子マネーの中身は日本円。円をデジタルにして持ち歩いているだけです。'],
    ['国や中央銀行が発行していない。値段が毎日大きく上下する', 2, '暗号資産は、ほしい人と売りたい人で値段が決まるので、1 日で大きく動くこともあります。'],
    ['発行される量の上限が、プログラムで決まっている', 2, 'ビットコインは、全部で 2,100 万枚までと決まっています。'],
    ['法律で、支払いに使えば受け取ってもらえると決まっている', 0, '日本銀行券は法律で決められたお金（法定通貨）で、支払いに使えます。'],
    ['会社がお金をあずかって、カードやスマホのタッチで払える', 1, '電子マネーは、発行する会社がお金をあずかって管理しています。'],
    ['世界中のたくさんのコンピューターが、同じ台帳で取引を記録している', 2, 'これがブロックチェーン。中心になる管理者がいません。'],
    ['秘密の鍵をなくすと、だれにも取り戻せないことがある', 2, '暗号資産は、鍵を持っている人だけが動かせます。なくすと、銀行のように助けてくれる人はいません。'],
    ['すかしやホログラムで、にせものを防いでいる', 0, '2024 年からの新しいお札には、3D ホログラムもついています。']
  ];
  let order = [], at = 0, good = 0;
  const drawSort = () => {
    if (at >= order.length) {
      pane(2).innerHTML = `<div class="cx-end"><p class="cx-big"><b>${good}</b> / ${order.length} 問正解</p>
        <div class="cx-cmp"><div><b>お札</b><p>国（日本銀行）が発行。日本円そのもの。</p></div><div><b>電子マネー</b><p>中身は日本円。会社があずかって管理。</p></div><div><b>暗号資産</b><p>国が発行しない。値段が大きく上下。みんなで台帳を持つ。</p></div></div>
        <div class="cx-warn"><p class="cx-k"><span aria-hidden="true">注</span>知っておきたいこと</p><ul>
          <li>日本の法律では、ビットコインなどを「暗号資産」とよびます（前は「仮想通貨」とよばれていました）。</li>
          <li>暗号資産を売り買いする会社（交換業者）は、金融庁・財務局への登録が必要です。</li>
          <li>「必ずもうかる」「すぐ 2 倍に」というさそいは、詐欺をうたがいましょう。値段は大きく下がることもあります。</li>
          <li>国の中央銀行がデジタルのお金をつくる「中央銀行デジタル通貨」の研究も進んでいます。こちらは国のお金そのもので、暗号資産とはちがいます。</li></ul></div>
        <p class="cx-more"><a href="glossary.html#crypto">用語辞典「暗号資産」</a><a href="glossary.html#blockchain">「ブロックチェーン」</a><a href="glossary.html#cbdc">「中央銀行デジタル通貨」</a></p>
        <button type="button" class="cx-reset" data-sort="again">もう一度仕分ける</button></div>`;
      save(); return;
    }
    const c = CARDS[order[at]];
    pane(2).innerHTML = `<p class="cx-lead">カードの説明は、どれのこと？ ${at + 1} / ${order.length} 枚目</p>
      <div class="cx-card"><p>${c[0]}</p></div>
      <div class="cx-kinds">${KIND.map((k, i) => `<button type="button" data-kind="${i}"><span aria-hidden="true">${['札', '電', '暗'][i]}</span>${k}</button>`).join('')}</div>
      <div class="cx-ans" aria-live="polite"></div>`;
  };
  const answer = k => {
    const c = CARDS[order[at]], ok = k === c[1];
    if (ok) good++;
    pane(2).querySelectorAll('[data-kind]').forEach((b, i) => { b.disabled = true; if (i === c[1]) b.classList.add('is-ok'); else if (i === k) b.classList.add('is-ng'); });
    pane(2).querySelector('.cx-ans').innerHTML = `<p class="${ok ? 'is-ok' : 'is-ng'}"><b>${ok ? '正解' : `答えは「${KIND[c[1]]}」`}</b>${c[2]}</p><button type="button" class="cx-next" data-sort="next">${at + 1 < order.length ? '次のカード' : '結果を見る'}</button>`;
  };
  const startSort = () => { order = CARDS.map((_, i) => i).sort(() => Math.random() - 0.5); at = 0; good = 0; drawSort(); };

  box.addEventListener('click', e => {
    const tab = e.target.closest('[data-tab]');
    if (tab) { const n = +tab.dataset.tab; box.querySelectorAll('[data-tab]').forEach(t => t.setAttribute('aria-selected', t === tab)); box.querySelectorAll('[data-pane]').forEach(p => { p.hidden = +p.dataset.pane !== n; }); if (n === 1) drawNet(); if (n === 2 && !order.length) startSort(); return; }
    const amt = e.target.closest('[data-amt]');
    if (amt && !busy) { const t = mine[1].tx[+amt.dataset.amt]; t[2] = Math.max(1, Math.min(99, t[2] + +amt.dataset.d)); edited = true; relink(); save(); drawChain('書きかえた！ ブロック 2 の指紋が変わって、00 で始まらなくなりました。ブロック 3 と 4 も、「前の指紋」が合わなくなって、こわれています。「掘り直す」を押してみよう。'); return; }
    const m = e.target.closest('[data-mine]'); if (m && !m.disabled) { mineAnim(+m.dataset.mine); return; }
    if (e.target.closest('[data-reset]')) { mine = build(); edited = false; drawChain(); return; }
    const k = e.target.closest('[data-kind]'); if (k && !k.disabled) { answer(+k.dataset.kind); return; }
    const s = e.target.closest('[data-sort]'); if (s) { if (s.dataset.sort === 'next') { at++; drawSort(); } else startSort(); }
  });
  drawChain();
  // 区画がかくれているあいだに描いたときは、見えたときに描きなおして、ブロック 2 が見える位置へ
  if ('IntersectionObserver' in window) new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { if (!edited) drawChain(); io.disconnect(); } }).observe(box);
})();
