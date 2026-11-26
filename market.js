/* ================================================================
   market.js — シミュレーター：値段は、どう決まる？（需要と供給）
   ・「欲しい人の多さ」と「作る量」を動かすと、需要の線と供給の線が動き、交わったところで値段と売れる数が決まる
   ・需要：P = D − Q（D が大きいほど右上へ）／供給：P = Q × 0.8 − S + 40（S が大きいほど右下へ）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-market]');
  if (!box) return;
  const dIn = box.querySelector('#mkD'), sIn = box.querySelector('#mkS');
  const svg = box.querySelector('svg'), priceEl = box.querySelector('[data-price]'), qtyEl = box.querySelector('[data-qty]'), noteEl = box.querySelector('[data-note]');
  const W = 320, H = 240, PAD = 30, QMAX = 100, PMAX = 100;
  const x = q => PAD + q / QMAX * (W - PAD - 10), y = p => H - PAD - p / PMAX * (H - PAD - 10);
  let base = null;
  const draw = () => {
    const D = +dIn.value, S = +sIn.value;
    // 交点：D − Q = 0.8Q − S + 40 → Q = (D + S − 40) / 1.8
    const q = Math.max(0, Math.min(QMAX, (D + S - 40) / 1.8)), p = Math.max(0, D - q);
    if (!base) base = { q, p };
    const dLine = `M${x(0)},${y(D)} L${x(Math.min(QMAX, D))},${y(Math.max(0, D - QMAX))}`;
    const sQ0 = Math.max(0, (S - 40) / 0.8);
    const sLine = `M${x(sQ0)},${y(Math.max(0, 40 - S + 0.8 * sQ0))} L${x(QMAX)},${y(Math.min(PMAX, QMAX * 0.8 - S + 40))}`;
    svg.innerHTML = `
      <line x1="${PAD}" y1="${H - PAD}" x2="${W - 6}" y2="${H - PAD}" class="mk-axis"/><line x1="${PAD}" y1="${H - PAD}" x2="${PAD}" y2="6" class="mk-axis"/>
      <text x="${W - 8}" y="${H - 10}" class="mk-lab" text-anchor="end">売れる数 →</text><text x="${PAD + 4}" y="16" class="mk-lab">↑ 値段</text>
      <path d="${dLine}" class="mk-d"/><path d="${sLine}" class="mk-s"/>
      <text x="${x(Math.min(QMAX, D)) - 4}" y="${y(Math.max(0, D - QMAX)) - 6}" class="mk-name mk-dn" text-anchor="end">需要</text>
      <text x="${x(QMAX) - 4}" y="${y(Math.min(PMAX, QMAX * 0.8 - S + 40)) + 16}" class="mk-name mk-sn" text-anchor="end">供給</text>
      <line x1="${x(q)}" y1="${y(p)}" x2="${x(q)}" y2="${H - PAD}" class="mk-guide"/><line x1="${PAD}" y1="${y(p)}" x2="${x(q)}" y2="${y(p)}" class="mk-guide"/>
      <circle cx="${x(q)}" cy="${y(p)}" r="9" class="mk-dot"/><text x="${x(q)}" y="${y(p) + 4}" class="mk-dot-t" text-anchor="middle">円</text>`;
    priceEl.textContent = Math.round(p);
    qtyEl.textContent = Math.round(q);
    const dp = p - base.p;
    noteEl.textContent = Math.abs(dp) < 1 ? '欲しい人の多さと、作る量がつり合ったところで、値段が決まります。'
      : dp > 0 ? `はじめより ${Math.round(dp)} 上がりました。欲しい人が多いのに、モノが少ないと、値段は上がります。`
      : `はじめより ${Math.round(-dp)} 下がりました。モノがたくさんあるのに、欲しい人が少ないと、値段は下がります。`;
  };
  [dIn, sIn].forEach(i => i.addEventListener('input', draw));
  box.querySelector('.mk-reset').addEventListener('click', () => { dIn.value = 80; sIn.value = 40; draw(); });
  draw();
})();

/* ================================================================
   v351：「需要と供給ニュースデスク」— ニュースを読んで、どの線がどう動く？
   ・8 本のニュース。需要がふえる／需要がへる／供給がふえる／供給がへる、の 4 つから選ぶ
   ・答えると、グラフの線が動いて、新しく交わったところで値段と売れる数がどう変わったかが見える
   ・一回で正解 100 点、2 回目 40 点。続けて一回で正解すると倍率アップ
   ・グラフは上と同じたとえの式（需要 P = D − Q、供給 P = 0.8Q − S + 40）。自己ベストは azakei_market_best
   ================================================================ */
(function () {
  const box = document.querySelector('[data-market]');
  if (!box) return;
  if (!document.querySelector('link[href^="mkgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'mkgame.css?v=20261127a'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_market_best';
  const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  /* [一字, 品物, ニュース, 答え（D+ D- S+ S-）, 理由] */
  const NEWS = [
    ['菜', 'キャベツ', '台風で、キャベツ畑に大きな被害が出た。', 'S-', '畑がこわれて、作れる量（供給）がへった。'],
    ['麺', '駅前のパン屋さんのパン', '人気のアイドルが、テレビでこの店のパンを紹介した。', 'D+', '食べてみたい人（需要）がふえた。'],
    ['布', 'マスク', '新しい工場ができて、マスクを今までの 2&nbsp;倍作れるようになった。', 'S+', '作れる量（供給）がふえた。'],
    ['氷', 'かき氷', '夏が終わって、すずしくなってきた。', 'D-', '食べたい人（需要）がへった。'],
    ['橘', 'みかん', '天気にめぐまれて、みかんが大豊作になった。', 'S+', 'とれる量（供給）がふえた。'],
    ['機', '古い型のゲーム機', '新しい型のゲーム機が発売された。', 'D-', '古い型をほしい人（需要）がへった。'],
    ['卵', '卵', '鳥インフルエンザで、にわとりの数がへってしまった。', 'S-', '産まれる卵の数（供給）がへった。'],
    ['菓', 'チョコレート', 'バレンタインデーが近づいてきた。', 'D+', '買いたい人（需要）がふえた。'],
    ['油', 'ガソリン', '原油の値段が上がって、ガソリンをつくるのにかかるお金がふえた。', 'S-', '同じ値段では、売る側が前ほどたくさん売れなくなった（供給がへった）。'],
    ['豆', '豆乳', '健康ブームで、豆乳を飲む人がふえた。', 'D+', '飲みたい人（需要）がふえた。'],
    ['陽', '太陽光パネル', '新しい技術で、太陽光パネルを安く作れるようになった。', 'S+', '安く作れるので、売る側がたくさん出せるようになった（供給がふえた）。'],
    ['園', '遊園地の入場券', '雨の日が、何週間も続いている。', 'D-', '行きたい人（需要）がへった。'],
    ['牛', '輸入の牛肉', '円安で、外国から牛肉を仕入れる値段が上がった。', 'S-', '仕入れが高くなり、前と同じ値段では出せる量がへった（供給がへった）。'],
    ['映', 'アニメのグッズ', '大人気のアニメが映画になって、大ヒットした。', 'D+', 'グッズをほしい人（需要）がふえた。']
  ];
  const LABEL = { 'D+': '需要がふえる', 'D-': '需要がへる', 'S+': '供給がふえる', 'S-': '供給がへる' };
  const W = 320, H = 230, PAD = 30, QMAX = 100, PMAX = 100;
  const X = q => PAD + q / QMAX * (W - PAD - 10), Y = p => H - PAD - p / PMAX * (H - PAD - 10);
  const eq = (D, S) => { const q = (D + S - 40) / 1.8; return { q, p: D - q }; };   // D − Q = 0.8Q − S + 40
  const g = document.createElement('div');
  g.className = 'mkg';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="mkg-sub"><span aria-hidden="true">験</span>じっくりためす：欲しい人の多さと作る量を、つまみで動かす</p>');
  let st = null;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="mkg-intro">
      <div class="mkg-art" aria-hidden="true"><svg viewBox="0 0 100 100"><line x1="10" y1="10" x2="90" y2="90" class="is-d"/><line x1="10" y1="90" x2="90" y2="20" class="is-s"/><circle cx="51" cy="53" r="6"/></svg></div>
      <div><p class="mkg-kicker">ニュースを読む</p><h3 class="mkg-h">需要と供給ニュースデスク</h3>
      <p class="mkg-p">台風、テレビの紹介、新しい工場……。ニュースが入るたびに、「ほしい人の多さ（需要）」か「売る側が出せる量（供給）」のどちらかが動きます。8 本のニュースを読んで、どの線がどっちへ動くかを当てよう。答えると、グラフの線が動いて、値段と売れる数がどう変わるかが見えます。</p>
      <p class="mkg-best">${b ? `自己ベスト <b>${b}</b> 点` : 'はじめての出勤'}</p>
      <button type="button" class="mkg-go" data-mkg="start">ニュースデスクにつく</button></div></div>`;
  };
  const graph = (D, S, D0, S0) => {
    const e = eq(D, S), e0 = eq(D0, S0);
    const dl = `<line class="mkg-d" x1="${X(0)}" y1="${Y(D)}" x2="${X(Math.min(QMAX, D))}" y2="${Y(Math.max(0, D - QMAX))}"/>`;
    const sq0 = Math.max(0, (S - 40) / 0.8), sl = `<line class="mkg-s" x1="${X(sq0)}" y1="${Y(Math.max(0, -S + 40))}" x2="${X(QMAX)}" y2="${Y(0.8 * QMAX - S + 40)}"/>`;
    const ghost = (D !== D0 || S !== S0) ? `<line class="mkg-ghost" x1="${X(0)}" y1="${Y(D0)}" x2="${X(Math.min(QMAX, D0))}" y2="${Y(Math.max(0, D0 - QMAX))}"/><line class="mkg-ghost" x1="${X(Math.max(0, (S0 - 40) / 0.8))}" y1="${Y(Math.max(0, -S0 + 40))}" x2="${X(QMAX)}" y2="${Y(0.8 * QMAX - S0 + 40)}"/><circle class="mkg-ghostdot" cx="${X(e0.q)}" cy="${Y(e0.p)}" r="5"/>` : '';
    return `<svg class="mkg-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="需要と供給のグラフ">
      <line class="mkg-ax" x1="${PAD}" y1="${H - PAD}" x2="${W - 6}" y2="${H - PAD}"/><line class="mkg-ax" x1="${PAD}" y1="${H - PAD}" x2="${PAD}" y2="6"/>
      <text x="${W - 8}" y="${H - 12}" text-anchor="end" class="mkg-t">売れる数 →</text><text x="${PAD + 4}" y="14" class="mkg-t">値段 ↑</text>
      ${ghost}${dl}${sl}
      <line class="mkg-guide" x1="${PAD}" y1="${Y(e.p)}" x2="${X(e.q)}" y2="${Y(e.p)}"/><line class="mkg-guide" x1="${X(e.q)}" y1="${Y(e.p)}" x2="${X(e.q)}" y2="${H - PAD}"/>
      <circle class="mkg-dot" cx="${X(e.q)}" cy="${Y(e.p)}" r="7"/>
      <text x="${X(QMAX) - 2}" y="${Y(Math.max(0, D - QMAX)) - 6}" text-anchor="end" class="mkg-lab is-d">需要</text>
      <text x="${X(QMAX) - 2}" y="${Y(0.8 * QMAX - S + 40) + 16}" text-anchor="end" class="mkg-lab is-s">供給</text>
    </svg>`;
  };
  const start = () => { st = { q: shuffle(NEWS.map((_, i) => i)).slice(0, 8), at: 0, score: 0, streak: 0, ok: 0, log: [] }; ask(); };
  const ask = () => {
    const n = NEWS[st.q[st.at]];
    st.tries = 0;
    g.innerHTML = `<div class="mkg-play">
      <div class="mkg-top"><span class="mkg-n">${st.at + 1} / ${st.q.length}</span>${st.streak >= 2 ? `<span class="mkg-st">${st.streak} 連続</span>` : ''}<span class="mkg-sc">得点 <b>${st.score}</b></span></div>
      <div class="mkg-grid">
        <div class="mkg-news"><p class="mkg-flash">ニュース速報</p><p class="mkg-item"><span aria-hidden="true">${n[0]}</span>${n[1]}</p><p class="mkg-text">${n[2]}</p></div>
        <div class="mkg-gwrap" data-mkg="graph">${graph(100, 40, 100, 40)}</div>
      </div>
      <p class="mkg-ask">${n[1]}について、動くのはどれ？</p>
      <div class="mkg-opts">${['D+', 'D-', 'S+', 'S-'].map(k => `<button type="button" data-ans="${k}" class="is-${k[0] === 'D' ? 'd' : 's'}"><i aria-hidden="true">${k[1] === '+' ? '↗' : '↙'}</i>${LABEL[k]}</button>`).join('')}</div>
      <div class="mkg-res" aria-live="polite"></div></div>`;
  };
  const animate = (k, done) => {
    const D1 = k === 'D+' ? 120 : k === 'D-' ? 80 : 100, S1 = k === 'S+' ? 60 : k === 'S-' ? 20 : 40;
    const gw = g.querySelector('[data-mkg="graph"]'), steps = reduce ? 1 : 24;
    let i = 0;
    const tick = () => {
      i++; const t = i / steps, e = 1 - Math.pow(1 - t, 3);
      gw.innerHTML = graph(100 + (D1 - 100) * e, 40 + (S1 - 40) * e, 100, 40);
      if (i < steps) setTimeout(tick, 25); else done(eq(D1, S1));
    };
    tick();
  };
  const answer = k => {
    const n = NEWS[st.q[st.at]], right = n[3], ok = k === right;
    st.tries++;
    const b = g.querySelector(`[data-ans="${k}"]`);
    if (!ok) { b.disabled = true; b.classList.add('is-ng'); g.querySelector('.mkg-res').innerHTML = `<p class="mkg-ng">ちがうみたい。${st.tries === 1 ? 'もう一度考えてみよう。ほしい人の話？ それとも、作る側・売る側の話？' : ''}</p>`; if (st.tries < 2) return; }
    g.querySelectorAll('[data-ans]').forEach(x => { x.disabled = true; if (x.dataset.ans === right) x.classList.add('is-ok'); });
    let pts = 0;
    if (ok) { pts = st.tries === 1 ? Math.round(100 * (1 + Math.min(st.streak, 4) * 0.25)) : 40; if (st.tries === 1) st.streak++; else st.streak = 0; st.ok++; } else st.streak = 0;
    st.score += pts;
    st.log.push({ n, ok: ok && st.tries === 1 });
    const e0 = eq(100, 40);
    animate(right, e1 => {
      const up = e1.p > e0.p, more = e1.q > e0.q;
      g.querySelector('.mkg-res').innerHTML = `<p class="${ok ? 'mkg-ok' : 'mkg-ng'}"><b>${ok ? `正解！ ＋${pts}` : `答えは「${LABEL[right]}」`}</b>${n[4]}</p>
        <div class="mkg-move"><span class="${up ? 'is-up' : 'is-dn'}">値段 ${up ? '上がる ↑' : '下がる ↓'}</span><span class="${more ? 'is-up' : 'is-dn'}">売れる数 ${more ? 'ふえる ↑' : 'へる ↓'}</span></div>
        <button type="button" class="mkg-go" data-mkg="next">${st.at + 1 < st.q.length ? '次のニュース' : '結果を見る'}</button>`;
      g.querySelector('.mkg-top .mkg-sc b').textContent = st.score;
    });
  };
  const TITLE = [[1000, 'ニュースデスクの編集長'], [700, '市場が読める記者'], [400, '見習い記者'], [0, 'これから読みとこう']];
  const finish = () => {
    const prev = getB(), best = st.score > prev;
    if (best) { try { localStorage.setItem(KEY, String(st.score)); } catch (e) {} }
    g.innerHTML = `<div class="mkg-end">
      <p class="mkg-kicker">今日の紙面</p>
      <p class="mkg-big"><b>${st.score}</b> 点<small>一回で正解 ${st.log.filter(x => x.ok).length} / ${st.q.length}</small></p>
      <p class="mkg-title"><span aria-hidden="true">称</span>${TITLE.find(t => st.score >= t[0])[1]}${best ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${prev} 点</small>` : ''}</p>
      <ul class="mkg-log">${st.log.map(x => `<li class="${x.ok ? 'is-ok' : ''}"><span aria-hidden="true">${x.n[0]}</span><p><b>${x.n[1]}</b>${x.n[2]}</p><em>${LABEL[x.n[3]]}</em></li>`).join('')}</ul>
      <div class="mkg-rule"><p class="mkg-l">4 つの動き</p>
        <table><thead><tr><th>何が動く</th><th>値段</th><th>売れる数</th></tr></thead><tbody>
        <tr><th>需要がふえる</th><td class="is-up">上がる</td><td class="is-up">ふえる</td></tr>
        <tr><th>需要がへる</th><td class="is-dn">下がる</td><td class="is-dn">へる</td></tr>
        <tr><th>供給がふえる</th><td class="is-dn">下がる</td><td class="is-up">ふえる</td></tr>
        <tr><th>供給がへる</th><td class="is-up">上がる</td><td class="is-dn">へる</td></tr></tbody></table>
        <p>ニュースを見たら、「ほしい人の話？ それとも作る側・売る側の話？」と考えるのがコツ。同じ「値段が上がった」でも、ほしい人がふえたのか、作れる量がへったのかで、売れる数は反対に動きます。</p></div>
      <button type="button" class="mkg-go" data-mkg="start">もう一度デスクにつく</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(g, 'market', TITLE.findIndex(t => st.score >= t[0]), TITLE.length);
  };
  g.addEventListener('click', e => {
    const a = e.target.closest('[data-ans]'); if (a && !a.disabled) { answer(a.dataset.ans); return; }
    const b = e.target.closest('[data-mkg]'); if (!b || b.dataset.mkg === 'graph') return;
    if (b.dataset.mkg === 'start') start();
    else if (b.dataset.mkg === 'next') { if (++st.at < st.q.length) ask(); else finish(); }
  });
  intro();
})();
