/* ================================================================
   shop.js — 経済ラボ：文化祭でお店をひらこう（損益分岐点）
   ・値段・材料費・準備のお金・売れる数を動かすと、売上と費用の線が動き、黒字か赤字かがわかる
   ・数字はすべて、しくみを見るための「たとえ」
   ================================================================ */
(function() {
  const box = document.querySelector('[data-shop]');
  if (!box) return;
  const MAXQ = 200;
  const F = [
    ['price', '1 個の値段', '円', 50, 500, 10, 200],
    ['cost', '1 個の材料費', '円', 10, 300, 10, 80],
    ['fixed', '準備のお金（飾り・道具）', '円', 0, 20000, 1000, 6000],
    ['qty', '売れる数（予想）', '個', 0, MAXQ, 5, 60]
  ];
  const yen = n => Math.round(n).toLocaleString('ja-JP');
  box.innerHTML = `
    <div class="sh-ctrl">
      ${F.map(([k, label, unit, min, max, step, v]) => `<label class="sh-in"><span>${label}<b><i data-v="${k}">${yen(v)}</i>${unit}</b></span><input type="range" min="${min}" max="${max}" step="${step}" value="${v}" data-k="${k}"></label>`).join('')}
      <div class="sh-out">
        <p><span>損益分岐点</span><b data-o="bep">—</b></p>
        <p><span>もうけ（利益）</span><b data-o="profit">—</b></p>
      </div>
      <p class="sh-stamp" data-o="stamp" aria-live="polite"></p>
    </div>
    <div class="sh-chart-wrap">
      <svg class="sh-chart" viewBox="0 0 340 240" role="img" aria-label="売上と費用のグラフ"></svg>
      <p class="sh-legend"><span class="is-sales">売上</span><span class="is-cost">費用</span><span class="is-bep">損益分岐点</span></p>
    </div>
    <p class="sh-note" data-o="note"></p>
    <div class="sh-mis"><p class="sh-mis-h">店長ミッション<small data-o="mis-n"></small></p><ol data-o="mis"></ol></div>`;
  // ミッション：条件をみたすと、ハンコが押される（3 つそろうとバッジ「店長」）
  const MKEY = 'azakei_shop';
  const MIS = [
    ['few', '売れる数が 40 個以下でも、黒字にしよう', (p, c, f, q, bep, pr) => q <= 40 && pr >= 0],
    ['cheap', '値段 150 円以下のまま、損益分岐点を 40 個以下に', (p, c, f, q, bep) => p <= 150 && bep <= 40],
    ['big', '準備のお金を 1 万円以上かけて、もうけ 5,000 円以上', (p, c, f, q, bep, pr) => f >= 10000 && pr >= 5000]
  ];
  let done = []; try { done = JSON.parse(localStorage.getItem(MKEY) || '[]'); } catch (e) {}
  const misBox = box.querySelector('[data-o="mis"]');
  const drawMis = fresh => {
    misBox.innerHTML = MIS.map(([id, t]) => `<li class="${done.includes(id) ? 'is-done' : ''}${fresh === id ? ' is-new' : ''}"><span class="sh-mis-seal" aria-hidden="true">${done.includes(id) ? '済' : ''}</span>${t}</li>`).join('');
    box.querySelector('[data-o="mis-n"]').textContent = `${done.length} / ${MIS.length}`;
  };
  drawMis();
  const svg = box.querySelector('.sh-chart');
  const val = k => +box.querySelector(`[data-k="${k}"]`).value;
  const L = 40, R = 330, T = 14, B = 210;
  let lastSign = 0;
  const draw = () => {
    const p = val('price'), c = val('cost'), f = val('fixed'), q = val('qty');
    F.forEach(([k]) => { box.querySelector(`[data-v="${k}"]`).textContent = yen(val(k)); });
    const margin = p - c;
    const bep = margin > 0 ? Math.ceil(f / margin) : Infinity;
    const profit = margin * q - f;
    const ymax = Math.max(p * MAXQ, f + c * MAXQ) * 1.05;
    const X = n => L + (R - L) * n / MAXQ, Y = v => B - (B - T) * v / ymax;
    const grid = [0, .25, .5, .75, 1].map(t => `<line x1="${L}" x2="${R}" y1="${Y(ymax * t)}" y2="${Y(ymax * t)}" class="sh-grid"/><text x="${L - 4}" y="${Y(ymax * t) + 3}" class="sh-ax" text-anchor="end">${t ? (+(ymax * t / 10000).toFixed(1)) + '万' : '0'}</text>`).join('');
    const xt = [0, 50, 100, 150, 200].map(n => `<text x="${X(n)}" y="${B + 14}" class="sh-ax" text-anchor="middle">${n}</text>`).join('');
    // 黒字・赤字のすき間を塗る（いまの売れる数のところ）
    const gap = `<path class="sh-gap ${profit >= 0 ? 'is-plus' : 'is-minus'}" d="M${X(q)} ${Y(p * q)} L${X(q)} ${Y(f + c * q)}"/>`;
    const bepMark = bep <= MAXQ ? `<line x1="${X(bep)}" x2="${X(bep)}" y1="${T}" y2="${B}" class="sh-bep"/><circle cx="${X(bep)}" cy="${Y(p * bep)}" r="5" class="sh-bep-dot"/><text x="${X(bep) + 6}" y="${T + 10}" class="sh-bep-t">${bep} 個</text>` : '';
    svg.innerHTML = `${grid}${xt}<text x="${R}" y="${B + 26}" class="sh-ax" text-anchor="end">売れた数（個）</text>
      <line x1="${X(0)}" y1="${Y(f)}" x2="${X(MAXQ)}" y2="${Y(f + c * MAXQ)}" class="sh-cost"/>
      <line x1="${X(0)}" y1="${Y(0)}" x2="${X(MAXQ)}" y2="${Y(p * MAXQ)}" class="sh-sales"/>
      ${bepMark}
      <line x1="${X(q)}" x2="${X(q)}" y1="${T}" y2="${B}" class="sh-now"/>${gap}`;
    box.querySelector('[data-o="bep"]').innerHTML = margin <= 0 ? '<small>売るほど赤字</small>' : `${yen(bep)}<small> 個</small>`;
    const pe = box.querySelector('[data-o="profit"]');
    pe.innerHTML = `${profit >= 0 ? '+' : '−'}${yen(Math.abs(profit))}<small> 円</small>`;
    pe.className = profit >= 0 ? 'is-plus' : 'is-minus';
    const st = box.querySelector('[data-o="stamp"]');
    const sign = profit >= 0 ? 1 : -1;
    st.textContent = sign > 0 ? '黒字' : '赤字';
    st.className = 'sh-stamp ' + (sign > 0 ? 'is-plus' : 'is-minus') + (sign !== lastSign && lastSign ? ' is-pop' : '');
    lastSign = sign;
    box.querySelector('[data-o="note"]').innerHTML = margin <= 0
      ? '値段が材料費より安いので、売れば売るほど損をします。値段を上げるか、材料費を下げてみよう。'
      : bep > MAXQ
        ? `準備のお金を取りもどすには、${yen(bep)} 個も売る必要があります。準備のお金を減らすか、1 個のもうけ（${yen(margin)} 円）を大きくしてみよう。`
        : `1 個売るごとに <b>${yen(margin)} 円</b>（値段 − 材料費）が残ります。準備のお金 ${yen(f)} 円を取りもどせるのは、<b>${yen(bep)} 個</b>売れたとき。それより多く売れたぶんが、もうけになります。`;
    const hit = MIS.find(([id, , ok]) => !done.includes(id) && ok(p, c, f, q, bep, profit));
    if (hit) {
      done.push(hit[0]);
      try { localStorage.setItem(MKEY, JSON.stringify(done)); } catch (e) {}
      drawMis(hit[0]);
      if (window.AZAKEI_CHECK_BADGES) setTimeout(AZAKEI_CHECK_BADGES, 400);
    }
  };
  box.addEventListener('input', e => { if (e.target.matches('input[type=range]')) draw(); });
  draw();
})();

/* ================================================================
   v350：「模擬店の当日 3 時間」— 準備して、売って、損益分岐点をこえろ
   ・準備：メニュー（材料費がちがう）・作る数・飾り（準備のお金）・値段を決める。天気予報も見る
   ・当日：10 時・お昼・14 時の 3 回。お客さんが来て、作った数まで売れる。時間のあいだに値段を変えられる
   ・「損益分岐点まで あと ◯ 個」が、売れるたびにへっていく。こえると黒字
   ・売れ残りは材料のむだ。最後に、売上と費用のグラフと、もうけ
   ・お客さんの数のきまりは、しくみを見るための「たとえ」。自己ベストは azakei_shop_best（円）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-shop]');
  if (!box) return;
  if (!document.querySelector('link[href^="shgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'shgame.css?v=20261129a'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_shop_best';
  const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const yen = n => `${Math.round(n).toLocaleString('ja-JP')} 円`;
  const MENU = [['焼', '焼きそば', 80, 1.0], ['餅', 'ワッフル', 60, 0.85], ['珠', 'タピオカドリンク', 120, 1.2]];
  const DECO = [[0, 'なし', 1], [3000, 'のぼり旗', 1.15], [6000, '看板と飾りつけ', 1.3]];
  const HOURS = [['10 時', 40], ['お昼', 70], ['14 時', 40]];
  const WEATHER = [['晴れ', 1, '晴れの予報。人出は多そう'], ['くもり', 0.85, 'くもりの予報。ふつうくらい'], ['小雨', 0.65, '小雨の予報。外を歩く人は少なめ']];
  const g = document.createElement('div');
  g.className = 'sg';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="sg-sub"><span aria-hidden="true">験</span>じっくりためす：4 つのつまみで、損益分岐点を見る</p>');
  let S = null;
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="sg-intro">
      <div class="sg-tent" aria-hidden="true"><i></i><b>店</b></div>
      <div><p class="sg-kicker">経営ゲーム</p><h3 class="sg-h">模擬店の当日 3 時間</h3>
      <p class="sg-p">文化祭の模擬店をまかされました。メニュー、作る数、飾り、値段を決めて、10 時・お昼・14 時の 3 回、お客さんをむかえます。売れるたびに「損益分岐点まで あと ◯ 個」がへっていき、こえたら黒字。作りすぎると材料がむだになり、少なすぎると売り切れでお客さんを逃します。</p>
      <p class="sg-best">${b ? `自己ベスト <b>${yen(b)}</b>` : 'はじめての出店'}</p>
      <button type="button" class="sg-go" data-sg="start">準備をはじめる</button></div></div>`;
  };
  const start = () => {
    S = { menu: 0, qty: 100, deco: 0, price: 200, w: Math.floor(Math.random() * 3), h: 0, sold: 0, rev: 0, lost: 0, hist: [] };
    S.real = Math.random() < 0.7 ? S.w : Math.min(2, Math.max(0, S.w + (Math.random() < 0.5 ? -1 : 1)));   // 予報は、だいたい当たる
    prep();
  };
  const seg = (k, list, cur, fmt) => `<div class="sg-seg" role="group">${list.map((v, i) => `<button type="button" data-set="${k}" data-v="${i}" aria-pressed="${i === cur}">${fmt(v, i)}</button>`).join('')}</div>`;
  const step = (k, v, unit, d) => `<div class="sg-step"><button type="button" data-st="${k}" data-d="${-d}" aria-label="へらす">−</button><b>${v.toLocaleString('ja-JP')}</b><small>${unit}</small><button type="button" data-st="${k}" data-d="${d}" aria-label="ふやす">＋</button></div>`;
  const costs = () => ({ fixed: DECO[S.deco][0], mat: S.qty * MENU[S.menu][2] });
  const bep = () => { const c = costs(); return Math.ceil((c.fixed + c.mat) / S.price); };
  const prep = () => {
    const c = costs(), b = bep(), m = MENU[S.menu];
    g.innerHTML = `<div class="sg-prep">
      <p class="sg-step-h">前の日の準備</p>
      <p class="sg-fc"><span aria-hidden="true">${['晴', '曇', '雨'][S.w]}</span>天気予報：${WEATHER[S.w][2]}</p>
      <div class="sg-grid">
        <div class="sg-ctl">
          <p class="sg-l">メニュー（1 個の材料費）</p>${seg('menu', MENU, S.menu, v => `<span>${v[0]}</span>${v[1]}<small>${v[2]} 円</small>`)}
          <p class="sg-l">作る数（材料は前の日に買う）</p>${step('qty', S.qty, '個', 10)}
          <p class="sg-l">飾り（準備のお金・お客さんを呼ぶ）</p>${seg('deco', DECO, S.deco, v => `${v[1]}<small>${v[0] ? v[0].toLocaleString() + ' 円' : '0 円'}</small>`)}
          <p class="sg-l">1 個の値段（当日も変えられる）</p>${step('price', S.price, '円', 50)}
        </div>
        <div class="sg-calc">
          <p class="sg-l">お金の計算</p>
          <p class="sg-row"><span>準備のお金</span><b>${yen(c.fixed)}</b></p>
          <p class="sg-row"><span>材料費 ${m[2]} 円 × ${S.qty} 個</span><b>${yen(c.mat)}</b></p>
          <p class="sg-row is-sum"><span>費用の合計</span><b>${yen(c.fixed + c.mat)}</b></p>
          <p class="sg-bep">損益分岐点<b>${b} 個</b><small>${yen(c.fixed + c.mat)} ÷ ${S.price} 円</small></p>
          ${b > S.qty ? '<p class="sg-warn">作る数が損益分岐点より少ないので、全部売れても赤字です。</p>' : `<p class="sg-ok">${S.qty} 個のうち ${b} 個売れたら黒字。全部売れたら、もうけは ${yen(S.qty * S.price - c.fixed - c.mat)}。</p>`}
          <button type="button" class="sg-go" data-sg="open">お店を開ける</button>
        </div>
      </div></div>`;
  };
  /* 1 つの時間帯のお客さん */
  const visitors = () => {
    const base = HOURS[S.h][1], m = MENU[S.menu];
    const v = base * Math.pow(250 / S.price, 1.7) * m[3] * DECO[S.deco][2] * WEATHER[S.real][1] * (0.85 + Math.random() * 0.3);
    return Math.max(0, Math.round(v));
  };
  const day = (msg) => {
    const b = bep(), left = Math.max(0, b - S.sold), stock = S.qty - S.sold;
    g.innerHTML = `<div class="sg-day">
      <div class="sg-top"><span class="sg-n">${S.h < 3 ? HOURS[S.h][0] : '閉店'}</span><span class="sg-wx">${['晴', '曇', '雨'][S.real]} ${WEATHER[S.real][0]}</span><span class="sg-price">いまの値段 <b>${yen(S.price)}</b></span></div>
      <div class="sg-bepbar ${left ? '' : 'is-over'}"><p>${left ? `損益分岐点まで あと <b>${left}</b> 個` : '<b>黒字！</b> 損益分岐点をこえました'}</p><div aria-hidden="true"><i style="width:${Math.min(100, S.sold / Math.max(1, b) * 100).toFixed(1)}%"></i></div><small>売れた数 ${S.sold} 個 ／ 損益分岐点 ${b} 個（値段を変えると、分岐点も動く）</small></div>
      <div class="sg-stock" aria-hidden="true">${Array.from({ length: Math.min(60, Math.ceil(S.qty / 5)) }, (_, i) => `<i class="${i * 5 < S.sold ? 'is-sold' : ''}"></i>`).join('')}</div>
      <p class="sg-left">のこり <b>${stock}</b> 個・売上 <b>${yen(S.rev)}</b></p>
      ${msg ? `<p class="sg-msg">${msg}</p>` : ''}
      ${S.h < 3 ? `<p class="sg-l">${HOURS[S.h][0]}のお客さんをむかえる前に、値段を変える？</p>${step('price', S.price, '円', 50)}<button type="button" class="sg-go" data-sg="sell">${HOURS[S.h][0]}の営業</button>` : '<button type="button" class="sg-go" data-sg="end">閉店して、計算する</button>'}
    </div>`;
  };
  const sell = () => {
    const want = visitors(), stock = S.qty - S.sold, n = Math.min(want, stock), lost = want - n;
    const before = S.sold < bep();
    S.sold += n; S.rev += n * S.price; S.lost += lost;
    S.hist.push({ h: HOURS[S.h][0], price: S.price, want, n });
    const crossed = before && S.sold >= bep();
    S.h++;
    day(`${HOURS[S.h - 1][0]}：お客さん ${want} 人、${n} 個売れた。${lost ? `売り切れで ${lost} 人が帰ってしまった。` : ''}${crossed ? '<b>損益分岐点をこえた！</b>' : ''}`);
    if (crossed && !reduce) { const bb = g.querySelector('.sg-bepbar'); bb.classList.add('is-pop'); }
  };
  const TITLE = [[18000, '模擬店の名店長'], [12000, '行列のできる店長'], [5000, '黒字の店長'], [0, 'とんとんの店長'], [-1e9, '次は黒字に']];
  const finish = () => {
    const c = costs(), profit = S.rev - c.fixed - c.mat, waste = (S.qty - S.sold) * MENU[S.menu][2];
    const prev = getB(), best = profit > prev;
    if (best && profit > 0) { try { localStorage.setItem(KEY, String(profit)); const a = JSON.parse(localStorage.getItem('azakei_shop') || '[]'); if (!a.includes('game')) { a.push('game'); localStorage.setItem('azakei_shop', JSON.stringify(a)); } } catch (e) {} }
    const W = 320, H = 170, maxQ = S.qty, maxY = Math.max(S.qty * S.price, c.fixed + c.mat) * 1.05;
    const x = q => 30 + q / maxQ * (W - 40), y = v => H - 20 - v / maxY * (H - 30);
    g.innerHTML = `<div class="sg-end">
      <p class="sg-kicker">閉店・計算</p>
      <p class="sg-big"><small>もうけ</small><b class="${profit < 0 ? 'is-ng' : ''}">${profit < 0 ? '−' : ''}${yen(Math.abs(profit))}</b></p>
      <p class="sg-title"><span aria-hidden="true">称</span>${TITLE.find(t => profit >= t[0])[1]}${best && profit > 0 && prev ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${yen(prev)}</small>` : ''}</p>
      <svg class="sg-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="売上と費用のグラフ">
        <line x1="30" y1="${H - 20}" x2="${W - 10}" y2="${H - 20}" stroke="currentColor" stroke-opacity=".3"/>
        <line x1="${x(0)}" y1="${y(c.fixed + c.mat)}" x2="${x(maxQ)}" y2="${y(c.fixed + c.mat)}" stroke="#b5432f" stroke-width="3"/>
        <line x1="${x(0)}" y1="${y(0)}" x2="${x(maxQ)}" y2="${y(maxQ * S.price)}" stroke="#2f7a52" stroke-width="3" stroke-dasharray="5 4"/>
        <line x1="${x(S.sold)}" y1="${y(0)}" x2="${x(S.sold)}" y2="${y(S.rev)}" stroke="#d49a2a" stroke-width="2"/>
        <circle cx="${x(S.sold)}" cy="${y(S.rev)}" r="6" fill="#d49a2a"/>
        <text x="${x(maxQ) - 4}" y="${y(c.fixed + c.mat) - 6}" text-anchor="end" font-size="11" fill="#b5432f">費用 ${yen(c.fixed + c.mat)}</text>
        <text x="${x(S.sold) + 8}" y="${y(S.rev) + 4}" font-size="11" fill="#d49a2a">売れた ${S.sold} 個</text>
        <text x="${W - 10}" y="${H - 6}" text-anchor="end" font-size="10" fill="currentColor" fill-opacity=".6">売れた数 →</text>
      </svg>
      <ul class="sg-sum"><li><span>売上</span><b>${yen(S.rev)}</b></li><li><span>準備のお金</span><b>− ${yen(c.fixed)}</b></li><li><span>材料費（${S.qty} 個分）</span><b>− ${yen(c.mat)}</b></li><li><span>売れ残り</span><b>${S.qty - S.sold} 個（材料 ${yen(waste)} 分）</b></li><li><span>売り切れで帰った人</span><b>${S.lost} 人</b></li></ul>
      <table class="sg-tab"><thead><tr><th>時間</th><th>値段</th><th>来た人</th><th>売れた</th></tr></thead><tbody>${S.hist.map(h => `<tr><th>${h.h}</th><td>${yen(h.price)}</td><td>${h.want} 人</td><td>${h.n} 個</td></tr>`).join('')}</tbody></table>
      <div class="sg-learn"><p><b>損益分岐点 ＝ 費用の合計 ÷ 1 個の値段。</b>値段を上げると分岐点は下がるけれど、来る人もへります。値段を下げると人は来るけれど、分岐点は上がります。作る数は、多すぎると売れ残り、少なすぎると売り切れ。どちらも、もうけをへらします。</p></div>
      <button type="button" class="sg-go" data-sg="start">もう一度出店する</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(g, 'shop', TITLE.findIndex(t => profit >= t[0]), TITLE.length);
  };
  g.addEventListener('click', e => {
    const s = e.target.closest('[data-set]'); if (s) { S[s.dataset.set] = +s.dataset.v; prep(); return; }
    const st = e.target.closest('[data-st]');
    if (st) {
      const k = st.dataset.st, d = +st.dataset.d;
      if (k === 'qty') S.qty = Math.max(20, Math.min(300, S.qty + d));
      if (k === 'price') S.price = Math.max(100, Math.min(500, S.price + d));
      if (g.querySelector('.sg-prep')) prep(); else day();
      g.querySelector(`[data-st="${k}"][data-d="${d}"]`)?.focus({ preventScroll: true });
      return;
    }
    const a = e.target.closest('[data-sg]'); if (!a) return;
    const k = a.dataset.sg;
    if (k === 'start') start(); else if (k === 'open') day('お店を開けました。最初のお客さんが来ます。'); else if (k === 'sell') sell(); else if (k === 'end') finish();
  });
  intro();
})();
