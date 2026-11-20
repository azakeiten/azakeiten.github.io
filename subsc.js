/* ================================================================
   subsc.js — あそび場：サブスクで 1 年、やりくりゲーム（近づいてから読みこむ）
   ・おこづかいは毎月 2,000 円。4 月から 3 月まで、毎月「できごとカード」が 1 枚めくれる
   ・毎月、漫画の読み放題に入るか・やめるかと、何冊買うかを自分で決める
   ・買った本は読めなかったら次の月に持ちこせる（積読）。読み放題の本は持ちこせない
   ・点数＝読んだ冊数 × 600 ＋ 残ったお金 ＋ 手元に残った本 × 250。
     「ずっと読み放題」「ずっと 1 冊ずつ」「名人の目安（計算で出した、いちばんよい決め方）」とくらべる
   ・値段はたとえ。見た目は subsc.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-subsc]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="subsc.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'subsc.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const yen = n => Math.round(n).toLocaleString() + ' 円';
  const PAY = 2000, BOOK = 500, FEE = 980, FEE2 = 1180, FUN = 600, KEEP = 250;
  const MO = [
    { m: '4 月', ev: '新生活', tx: '新しいクラス。読む時間はたっぷりある。', t: 6, w: 3 },
    { m: '5 月', ev: '初月無料キャンペーン', tx: '読み放題に「はじめて」入ると、この月は 0 円。ただし、やめないと次の月から自動で続く。', t: 6, w: 4, free: 1 },
    { m: '6 月', ev: 'テスト期間', tx: '勉強があるので、読めても 2 冊。', t: 2, w: 3 },
    { m: '7 月', ev: '新刊ラッシュ', tx: '読みたい新刊が 6 冊も出た。', t: 6, w: 6 },
    { m: '8 月', ev: '夏休み', tx: '1 年でいちばん時間がある月。', t: 8, w: 5 },
    { m: '9 月', ev: '部活の合宿', tx: '1 か月ずっと練習と合宿。本を読む時間は 0。', t: 0, w: 2 },
    { m: '10 月', ev: '友だちが 2 冊貸してくれる', tx: '読みたい 3 冊のうち 2 冊を、友だちが貸してくれる。0 円で読める。', t: 5, w: 3, friend: 2 },
    { m: '11 月', ev: '値上げのお知らせ', tx: '読み放題が、この月から月 1,180 円になる。', t: 4, w: 4, raise: 1 },
    { m: '12 月', ev: '冬休み', tx: 'まとめて読むチャンス。', t: 7, w: 5 },
    { m: '1 月', ev: '読み放題に、読みたい本が少ない', tx: '読みたい 4 冊のうち、読み放題にあるのは 2 冊だけ。', t: 6, w: 4, cov: .5 },
    { m: '2 月', ev: 'テスト期間', tx: '読めても 2 冊。', t: 2, w: 2 },
    { m: '3 月', ev: '春休み', tx: '1 年の最後の月。', t: 6, w: 4 }
  ];

  /* 1 か月の計算（ゲームでも、くらべる相手の計算でも使う） */
  const subAvailOf = (i, sub) => { const M = MO[i]; return sub ? Math.min(Math.floor(M.w * (M.cov || 1)), Math.max(0, M.w - (M.friend || 0))) : 0; };
  const buyMaxOf = (i, sub) => { const M = MO[i]; return Math.max(0, M.w - (M.friend || 0) - subAvailOf(i, sub)); };
  const feeOf = (i, sub, ever) => sub ? (MO[i].free && !ever ? 0 : (i >= 7 ? FEE2 : FEE)) : 0;
  const step = (st, i, sub, buy) => {
    const M = MO[i], fr = Math.min(M.t, M.friend || 0), subR = Math.min(M.t - fr, subAvailOf(i, sub));
    const own = st.tsu + buy, ownR = Math.min(M.t - fr - subR, own), fee = feeOf(i, sub, st.ever);
    return { fr, subR, ownR, reads: fr + subR + ownR, fee, cost: fee + buy * BOOK, tsu: own - ownR, ever: st.ever || !!sub, waste: !!sub && fee > 0 && subR === 0 };
  };
  const scoreOf = s => s.read * FUN + s.money + s.tsu * KEEP;
  const runPolicy = pol => {
    let s = { money: 0, read: 0, tsu: 0, ever: false };
    for (let i = 0; i < 12; i++) { s.money += PAY; const [sub, buy] = pol(i, s); const r = step(s, i, sub, buy); s = { money: s.money - r.cost, read: s.read + r.reads, tsu: r.tsu, ever: r.ever }; }
    return scoreOf(s);
  };
  const allSub = runPolicy(() => [1, 0]);
  const allBuy = runPolicy((i, s) => { const M = MO[i]; return [0, Math.min(buyMaxOf(i, 0), Math.max(0, M.t - Math.min(M.t, M.friend || 0) - s.tsu))]; });
  /* 名人の目安：12 か月の決め方をぜんぶ調べて、いちばん点が高くなる道を計算する */
  const master = (() => {
    const memo = new Map();
    const best = (i, tsu, ever) => {
      if (i === 12) return tsu * KEEP;
      const key = i * 1000 + tsu * 2 + (ever ? 1 : 0); if (memo.has(key)) return memo.get(key);
      let b = -1e9;
      for (const sub of [0, 1]) for (let buy = 0; buy <= buyMaxOf(i, sub); buy++) {
        const r = step({ tsu, ever }, i, sub, buy); const v = r.reads * FUN - r.cost + best(i + 1, r.tsu, r.ever); if (v > b) b = v;
      }
      memo.set(key, b); return b;
    };
    return PAY * 12 + best(0, 0, false);
  })();

  let st, sub, buy, busy = false, sfx = true, actx = null;
  const beep = (f, d, type) => {
    if (!sfx || reduce) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.type = type || 'triangle'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.5, t + d);
      g.gain.setValueAtTime(.13, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + .02);
    } catch (e) {}
  };

  box.innerHTML = `
    <div class="sb-hud">
      <p class="sb-hm"><small>いまの月</small><b data-k="mon">4 月</b></p>
      <p class="sb-wal"><small>お財布</small><b data-k="money">0 円</b><span class="sb-coins" aria-hidden="true"></span></p>
      <p><small>読んだ本</small><b data-k="read">0 冊</b></p>
      <p><small>点数</small><b data-k="score">0</b></p>
      <button type="button" class="sb-snd" data-a="snd" aria-pressed="true">効果音</button>
    </div>
    <div class="sb-main">
      <div class="sb-card" aria-live="polite">
        <p class="sb-ev-m" data-k="evm">4 月のできごと</p>
        <h3 class="sb-ev" data-k="ev">新生活</h3>
        <p class="sb-tx" data-k="tx"></p>
        <div class="sb-chips" data-k="chips"></div>
        <div class="sb-stamp" aria-hidden="true">ムダ払い</div>
      </div>
      <div class="sb-dec">
        <p class="sb-dh">読み放題<small data-k="fee">月 980 円</small></p>
        <div class="sb-seg" role="group" aria-label="読み放題">
          <button type="button" data-sub="1" aria-pressed="false">入る</button>
          <button type="button" data-sub="0" aria-pressed="true">入らない</button>
        </div>
        <p class="sb-dh">本屋で買う<small>1 冊 500 円・読めなければ次の月へ</small></p>
        <div class="sb-step">
          <button type="button" data-a="minus" aria-label="1 冊へらす">−</button>
          <output data-k="buy">0 冊</output>
          <button type="button" data-a="plus" aria-label="1 冊ふやす">＋</button>
        </div>
        <p class="sb-prev" data-k="prev"></p>
        <button type="button" class="sb-go" data-a="go">この月をすすめる</button>
      </div>
    </div>
    <div class="sb-shelf">
      <p class="sb-sh-h">本棚<span><i class="is-sub"></i>読み放題 <i class="is-buy"></i>買った本 <i class="is-fr"></i>借りた本</span></p>
      <div class="sb-books" data-k="books"></div>
      <p class="sb-tsu">積読（買って、まだ読んでいない本）<b data-k="tsu">0 冊</b><span class="sb-pile" data-k="pile"></span></p>
    </div>
    <ol class="sb-cal">${MO.map((M, i) => `<li data-m="${i}"><b>${M.m}</b><span></span></li>`).join('')}</ol>
    <div class="sb-res" hidden></div>
    <div class="sb-learn">
      <p><b>どちらが得かは、使い方しだい</b>月ぎめの料金を 1 冊の値段でわると、「何冊より多く読めば読み放題が得か」がわかります。980 ÷ 500 で約 2 冊。この境目が損益分岐点です（<a href="glossary.html#break-even">損益分岐点</a>）。</p>
      <p><b>サブスクは「固定費」</b>読んでも読まなくても、毎月同じ金額がかかります。1 冊ずつ買うのは、読んだぶんだけかかる「変動費」です（<a href="glossary.html#fixed-variable">固定費と変動費</a>）。</p>
      <p><b>解約忘れに気をつけよう</b>初月無料のあと、やめなければ自動で払いつづけます。会社にとっては、使われなくても入ってくるお金。ときどき、入っているサブスクを見直そう（<a href="glossary.html#subscription">サブスク</a>）。</p>
      <p><b>買い切りには「残る」よさも</b>買った本は手元に残り、あとで読めます。読み放題は、やめると読めなくなることが多い。値段だけでなく、ちがいも考えてえらぼう。</p>
    </div>
    <p class="sb-note">値段・できごと・点のつけ方は、しくみを知るための「たとえ」です。実際の料金はサービスによってちがいます。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const card = box.querySelector('.sb-card'), cal = [...box.querySelectorAll('.sb-cal li')], res = box.querySelector('.sb-res'), coins = box.querySelector('.sb-coins');
  const hud = () => {
    K('money').textContent = yen(st.money); K('read').textContent = st.read + ' 冊'; K('score').textContent = scoreOf(st).toLocaleString();
    K('tsu').textContent = st.tsu + ' 冊'; K('pile').innerHTML = '<i></i>'.repeat(Math.min(st.tsu, 12));
  };
  const showMonth = () => {
    const i = st.i, M = MO[i];
    K('mon').textContent = M.m; K('evm').textContent = `${M.m}のできごと`; K('ev').textContent = M.ev; K('tx').textContent = M.tx;
    const sa = Math.floor(M.w * (M.cov || 1));
    K('chips').innerHTML = `<span>読める時間<b>${M.t} 冊ぶん</b></span><span>読みたい新刊<b>${M.w} 冊</b></span><span>読み放題にある<b>${sa} 冊</b></span>${M.friend ? `<span class="is-fr">借りられる<b>${M.friend} 冊</b></span>` : ''}`;
    card.classList.remove('is-waste'); card.classList.remove('is-flip'); void card.offsetWidth; card.classList.add('is-flip');
    cal.forEach((c, j) => c.classList.toggle('is-now', j === i));
    buy = 0; render();
  };
  const render = () => {
    const i = st.i, fee = feeOf(i, sub, st.ever), mx = buyMaxOf(i, sub); if (buy > mx) buy = mx;
    box.querySelectorAll('[data-sub]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.sub === sub)));
    box.querySelector('[data-sub="1"]').textContent = st.on ? '続ける' : '入る';
    box.querySelector('[data-sub="0"]').textContent = st.on ? 'やめる' : '入らない';
    K('fee').textContent = MO[i].free && !st.ever ? 'この月は 0 円（初月無料）' : `月 ${yen(i >= 7 ? FEE2 : FEE)}${st.on ? '・何もしないと自動で続く' : ''}`;
    K('buy').textContent = buy + ' 冊';
    box.querySelector('[data-a="plus"]').disabled = buy >= mx; box.querySelector('[data-a="minus"]').disabled = buy <= 0;
    const r = step(st, i, sub, buy), parts = [];
    if (r.fr) parts.push(`借りた本 ${r.fr}`); if (r.subR) parts.push(`読み放題 ${r.subR}`); if (r.ownR) parts.push(`買った本 ${r.ownR}`);
    const over = r.cost > st.money;
    K('prev').innerHTML = `この月：読める見こみ <b>${r.reads} 冊</b>${parts.length ? `（${parts.join('・')}）` : ''}／払う <b>${yen(r.cost)}</b>`
      + (r.waste ? '<em>このままだと、読み放題で読む本が 0 冊。ムダ払いになります。</em>' : '')
      + (sub && mx === 0 && MO[i].t > 0 ? '<small>読みたい本は、ぜんぶ読み放題か借りた本で読めます。</small>' : '')
      + (r.tsu > 0 ? `<small>読みきれない ${r.tsu} 冊は、積読として次の月へ。</small>` : '')
      + (over ? '<em>お財布のお金が足りません。</em>' : '');
    box.querySelector('[data-a="go"]').disabled = over || busy;
    hud();
  };
  const flyCoins = n => {
    if (reduce) return;
    for (let k = 0; k < n; k++) { const c = document.createElement('i'); c.style.setProperty('--dx', (Math.random() * 120 - 60).toFixed(0) + 'px'); c.style.animationDelay = (k * 70) + 'ms'; coins.appendChild(c); setTimeout(() => c.remove(), 1100 + k * 70); }
  };
  const addBook = (cls, i) => { const b = document.createElement('i'); b.className = 'sb-bk ' + cls; b.style.height = (30 + ((i * 7 + st.read * 13) % 14)) + 'px'; K('books').appendChild(b); };
  const advance = async () => {
    if (busy) return;
    const i = st.i, r = step(st, i, sub, buy); if (r.cost > st.money) return;
    busy = true; box.classList.add('is-busy'); render();
    if (r.cost) { flyCoins(Math.min(8, Math.ceil(r.cost / 300))); beep(880, .12); }
    st.money -= r.cost; st.tsu += buy; hud(); await sleep(450);
    const seq = [...Array(r.fr).fill('is-fr'), ...Array(r.subR).fill('is-sub'), ...Array(r.ownR).fill('is-buy')];
    for (let k = 0; k < seq.length; k++) {
      addBook(seq[k], k); st.read++; if (seq[k] === 'is-buy') st.tsu--; hud(); beep(420 + k * 60, .09, 'sine'); await sleep(160);
    }
    if (r.waste) { card.classList.add('is-waste'); beep(160, .35, 'sawtooth'); }
    st.ever = r.ever; st.on = !!sub; st.tsu = r.tsu;
    const c = cal[i]; c.classList.remove('is-now'); c.classList.add('is-done'); c.classList.toggle('is-waste', r.waste); c.classList.toggle('is-sub', !!sub);
    c.querySelector('span').innerHTML = `読 ${r.reads}<br>${r.cost ? '払 ' + r.cost.toLocaleString() : '0 円'}`;
    st.log.push({ sub: !!sub, fee: r.fee, buy, reads: r.reads, waste: r.waste });
    hud(); await sleep(r.waste ? 1100 : 500);
    st.i++;
    if (st.i >= 12) { busy = false; box.classList.remove('is-busy'); return finish(); }
    st.money += PAY; flyIn();
    busy = false; box.classList.remove('is-busy'); showMonth();
  };
  const flyIn = () => { const w = box.querySelector('.sb-wal'); w.classList.remove('is-in'); void w.offsetWidth; w.classList.add('is-in'); };
  const finish = () => {
    const sc = scoreOf(st), top = Math.max(allSub, allBuy);
    const rank = sc >= master - 300 ? ['やりくり名人', '名人の目安とほぼ同じ。月ごとに読み放題と買う本を使い分けられました。'] : sc > top ? ['やりくり上手', '「ずっと同じ」より上手でした。名人の目安まで、あと ' + (master - sc).toLocaleString() + ' 点。'] : sc >= Math.min(allSub, allBuy) ? ['まずまず', sc === top ? '「ずっと同じ決め方」と同じ点でした。月によって決め方を変えると、もっと上がります。' : '「ずっと同じ」の片方には勝ちました。月によって決め方を変えてみよう。'] : ['お財布ピンチ', 'ずっと同じ決め方よりも点が低くなりました。下のヒントを見て、もう 1 年。'];
    const L = st.log, waste = L.filter(x => x.waste).length, tips = [];
    if (waste) tips.push(`読み放題を払ったのに 0 冊だった月が <b>${waste} か月</b>（${yen(L.filter(x => x.waste).reduce((a, x) => a + x.fee, 0))}）。時間がない月は、やめておく手があります。`);
    if (L[0].sub && L[1].sub) tips.push('4 月から読み放題に入ると、5 月の「初月無料」が使えません。はじめて入る月を 5 月にすると、1 か月ぶん 0 円になります。');
    else if (!L[1].sub) tips.push('5 月の「初月無料」は、まだ入ったことがない人だけの 0 円。入ってすぐやめれば、0 円で読めます。');
    else if (L[1].fee === 0 && L[2].sub) tips.push('初月無料のあと、6 月もそのまま続いていました。テスト期間は 2 冊しか読めないので、やめどきだったかも。');
    if (L[8] && !L[8].sub && !L[3].sub) tips.push('新刊ラッシュや冬休みのように、たくさん読める月は読み放題のほうが安くなりやすい（3 冊なら 1,500 円 と 980 円）。');
    if (L[9] && L[9].sub && L[9].buy === 0) tips.push('1 月は読み放題に読みたい本が 2 冊しかありません。足りない本は買うか、読み放題をやめて買うほうが安いことも。');
    if (!tips.length) tips.push('980 円 ÷ 500 円 ＝ 約 2 冊。3 冊以上読める月は読み放題、1〜2 冊の月は買う、が目安です（損益分岐点）。');
    const mx = Math.max(sc, master, allSub, allBuy), bar = (n, v, cls) => `<li class="${cls}"><span>${n}</span><i style="--w:${(v / mx * 100).toFixed(1)}%"></i><b>${v.toLocaleString()}</b></li>`;
    res.innerHTML = `<p class="sb-r-k">1 年の結果</p><p class="sb-r-h">${rank[0]}</p><p>${rank[1]}</p>
      <p class="sb-r-n">読んだ本 <b>${st.read} 冊</b> × 600 ＋ 残ったお金 <b>${yen(st.money)}</b> ＋ 手元に残った本 <b>${st.tsu} 冊</b> × 250 ＝ <b>${sc.toLocaleString()} 点</b></p>
      <ul class="sb-bars">${bar('あなた', sc, 'is-me')}${bar('ずっと読み放題', allSub, 'is-sub')}${bar('ずっと 1 冊ずつ', allBuy, 'is-buy')}${bar('名人の目安', master, 'is-top')}</ul>
      <div class="sb-tips"><p><b>ふり返り</b></p>${tips.map(t => `<p>${t}</p>`).join('')}</div>
      <button type="button" class="sb-go" data-a="again">もう 1 年やってみる</button>`;
    res.hidden = false; box.classList.add('is-end'); beep(660, .3); setTimeout(() => beep(990, .4), 180);
    try { const b = +localStorage.getItem('azakei_subsc') || 0; if (sc > b) localStorage.setItem('azakei_subsc', String(sc)); } catch (e) {}
    res.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  };
  const start = () => {
    st = { i: 0, money: PAY, read: 0, tsu: 0, ever: false, on: false, log: [] }; sub = 0; buy = 0;
    K('books').innerHTML = ''; res.hidden = true; box.classList.remove('is-end');
    cal.forEach(c => { c.className = ''; c.querySelector('span').textContent = ''; });
    showMonth();
  };
  box.addEventListener('click', e => {
    const a = e.target.closest('[data-a],[data-sub]'); if (!a || a.disabled) return;
    if (a.dataset.sub != null) { if (busy) return; sub = +a.dataset.sub; beep(sub ? 700 : 500, .07); render(); return; }
    const k = a.dataset.a;
    if (k === 'snd') { sfx = !sfx; a.setAttribute('aria-pressed', String(sfx)); return; }
    if (busy) return;
    if (k === 'plus') { buy++; beep(600, .06); render(); }
    else if (k === 'minus') { buy--; beep(450, .06); render(); }
    else if (k === 'go') advance();
    else if (k === 'again') { start(); box.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  });
  start();
})();
