/* ================================================================
   kessan.js — コンテスト：パン屋さんの決算発表（損益計算書の体験・近づいてから読みこむ）
   ・たとえのパン屋さんの店長になり、値段・新商品・広告・人や機械を決めて 1 年営業する
   ・1 年のあいだに出来事が 1 つ起きる。12 か月がめくれ、売上がふえていく
   ・決算発表：売上から原価・人件費・家賃…を引いていく「滝グラフ」で、粗利・営業利益・純利益が見える
   ・前の年とくらべて、増収・減収／増益・減益。何年でも続けられる
   ・金額はすべて「たとえ」（万円）。見た目は kessan.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-kessan]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="kessan.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'kessan.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const man = v => (v < 0 ? '−' : '') + Math.abs(Math.round(v)).toLocaleString() + ' 万円';

  // 決めること：[印, 題, [[名前, ひとこと, 効果]...]]
  const CH = [
    ['値', '1 個の値段', [['230 円', '安くして、たくさん売る', { price: 230, q: 1.12 }], ['250 円', 'いままでどおり', { price: 250, q: 1 }], ['280 円', '高くして、1 個のもうけをふやす', { price: 280, q: .85 }]]],
    ['新', '新しい商品', [['出さない', 'いまの品ぞろえで', {}], ['季節のパン', 'お客さんが少しふえる。材料は少し高め', { q: 1.1, cr: .02 }], ['高級食パン', '高い商品がまざって、1 人あたりの売上が上がる', { q: 1.05, mix: 1.08, cr: .03 }]]],
    ['広', '広告', [['しない', '広告のお金 10 万円（看板だけ）', { ad: 10 }], ['チラシ', '100 万円。近所の人に確実にとどく', { ad: 100, q: 1.06 }], ['SNS の動画', '60 万円。当たればたくさん、はずれれば少し', { ad: 60, sns: 1 }]]],
    ['人', '人と機械', [['いまのまま', '店員さん 3 人', { labor: 750 }], ['1 人ふやす', '人件費が上がるけれど、たくさん焼けて、接客もていねいに', { labor: 1000, q: 1.07, cap: 1.15 }], ['機械を入れる', '機械は 400 万円。5 年に分けて費用にする（減価償却）。人件費は少し下がる', { labor: 630, dep: 80, q: 1.02, cap: 1.08 }]]]
  ];
  const EV = [
    ['麦', '小麦の値段が上がった', '材料が高くなり、原価がふくらみました。', { cr: .04 }],
    ['駅', '近くに駅ビルができた', '前を通る人がふえました。', { q: 1.08 }],
    ['雨', '雨の多い 1 年', '出かける人が少なく、お客さんが少し減りました。', { q: .95 }],
    ['映', 'テレビで紹介された', '行列ができる日もありました。', { q: 1.15 }],
    ['穏', 'おだやかな 1 年', '大きな出来事はありませんでした。', {}],
    ['電', '電気代が上がった', 'オーブンの電気代がかさみました。', { other: 40 }]
  ];
  const BASE_Q = 80000, CAP = 100000, RENT = 240, OTHER = 150, CR = .35;

  box.innerHTML = `
    <div class="ks-shop">
      <svg class="ks-front" viewBox="0 0 640 220" role="img" aria-label="パン屋さんの店先">
        <rect width="640" height="220" class="ks-sky"/>
        <rect x="0" y="196" width="640" height="24" class="ks-walk"/>
        <g transform="translate(150 26)">
          <rect width="340" height="170" class="ks-wall"/>
          <path d="M-14 34 H354 L340 64 H0 Z" class="ks-awn"/>
          ${Array.from({ length: 9 }, (_, i) => `<path d="M${-14 + i * 41} 34 h20.5 l-1.6 30 h-20.5 Z" class="ks-awn-s"/>`).join('')}
          <rect x="90" y="-2" width="160" height="32" rx="6" class="ks-sign"/><text x="170" y="21" class="ks-sign-t">パン屋さん</text>
          <rect x="18" y="80" width="170" height="80" rx="4" class="ks-win"/>
          ${[[40, 128], [78, 122], [118, 128], [156, 124], [58, 148], [98, 146], [138, 148]].map(([x, y], i) => `<ellipse class="ks-loaf" cx="${x}" cy="${y}" rx="${14 + (i % 3) * 2}" ry="9" style="--i:${i}"/>`).join('')}
          <rect x="220" y="78" width="96" height="92" rx="4" class="ks-door"/><circle cx="300" cy="126" r="4" class="ks-knob"/>
          <g class="ks-steam">${[0, 1, 2].map(i => `<path d="M${270 + i * 16} -6 q-6 -10 0 -20 q6 -10 0 -20" style="animation-delay:${-i * .7}s"/>`).join('')}</g>
        </g>
        <g class="ks-people"></g>
      </svg>
      <div class="ks-hud"><p class="ks-month"><b data-k="mon">—</b><span>月</span></p><p class="ks-sales"><span>売上</span><b data-k="sales">0</b><small>万円</small></p><p class="ks-year"><b data-k="year">1</b> 年目</p></div>
      <div class="ks-ev" hidden><span class="ks-ev-s" data-k="evs"></span><div><p class="ks-ev-h" data-k="evh"></p><p class="ks-ev-t" data-k="evt"></p></div></div>
    </div>
    <div class="ks-plan">
      ${CH.map(([s, t, ops], r) => `<div class="ks-row"><p class="ks-row-h"><span class="ks-seal">${s}</span>${t}</p><div class="ks-ops" role="radiogroup" aria-label="${t}">${ops.map(([n, d], i) => `<button type="button" class="ks-op" role="radio" data-r="${r}" data-i="${i}" aria-checked="false"><b>${n}</b><small>${d}</small></button>`).join('')}</div></div>`).join('')}
      <div class="ks-go-w"><button type="button" class="ks-go" data-a="run">1 年、お店をひらく</button><p class="ks-go-n">決めたら、1 年営業して決算を発表します。</p></div>
    </div>
    <div class="ks-report" hidden>
      <div class="ks-rep-h"><span class="ks-rep-seal">算</span><div><p class="ks-rep-k" data-k="rk"></p><p class="ks-rep-t">損益計算書（1 年の成績表）</p></div><span class="ks-stamp" data-k="stamp"></span></div>
      <svg class="ks-fall" viewBox="0 0 680 300" role="img" aria-label="売上から利益までの滝グラフ"></svg>
      <ul class="ks-badges" data-k="badges"></ul>
      <p class="ks-comment" data-k="comment"></p>
      <div class="ks-hist"><p class="ks-hist-h">これまでの純利益</p><div class="ks-hist-b" data-k="hist"></div></div>
      <div class="ks-next"><button type="button" class="ks-go" data-a="next">次の年へ（決め直す）</button><button type="button" data-a="reset">1 年目からやり直す</button></div>
    </div>
    <div class="ks-learn">
      <p><b>売上と利益はちがう</b>たくさん売れても、材料や人件費にお金がかかれば、手もとに残るお金（利益）は少なくなります（<a href="glossary.html#sales-profit">売上高と利益</a>）。</p>
      <p><b>3 つの利益</b>売上から原価を引いたのが<a href="glossary.html#gross-profit">粗利</a>。そこから人件費や家賃を引くと営業利益（本業のもうけ）。税金を引くと純利益です。</p>
      <p><b>減価償却</b>何年も使う機械は、買った年に全部を費用にせず、使う年数に分けて少しずつ費用にします（<a href="glossary.html#depreciation">減価償却</a>）。</p>
      <p><b>決算書を読む</b>会社は 1 年ごとに<a href="glossary.html#kessan">決算</a>を発表します。ストックリーグでも、こうした<a href="glossary.html#pl">損益計算書</a>を読んで、会社を調べます。</p>
    </div>
    <p class="ks-note">パン屋さんも、金額や売れ方も、しくみを知るための「たとえ」です。税金は利益の 30% として、かんたんに計算しています。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const shop = box.querySelector('.ks-shop'), report = box.querySelector('.ks-report'), fall = box.querySelector('.ks-fall'), evBox = box.querySelector('.ks-ev');
  const people = box.querySelector('.ks-people');
  let pick = [1, 0, 0, 0], year = 1, hist = [], prev = null, busy = false;

  const drawPick = () => box.querySelectorAll('.ks-op').forEach(b => { const on = pick[+b.dataset.r] === +b.dataset.i; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on); });
  const crowd = n => { people.innerHTML = Array.from({ length: n }, (_, i) => `<g class="ks-p" style="--d:${(5 + (i * 7) % 5).toFixed(1)}s;--del:-${(i * 1.3 % 6).toFixed(1)}s"><circle cy="-22" r="6"/><path d="M-7 0 Q-7 -15 0 -16 Q7 -15 7 0 Z" style="fill:hsl(${(i * 61) % 360} 40% 45%)"/></g>`).join(''); };

  // ---- 1 年の計算 ----
  const calc = (ev, snsRoll) => {
    const e = {}; pick.forEach((i, r) => Object.entries(CH[r][2][i][2]).forEach(([k, v]) => { e[k] = k === 'q' || k === 'mix' || k === 'cap' ? (e[k] || 1) * v : (e[k] || 0) + v; }));
    Object.entries(ev[3]).forEach(([k, v]) => { e[k] = k === 'q' ? (e.q || 1) * v : (e[k] || 0) + v; });
    let q = BASE_Q * (e.q || 1) * (e.sns ? snsRoll : 1);
    const cap = CAP * (e.cap || 1), sold = Math.min(q, cap);
    const sales = sold * e.price * (e.mix || 1) / 10000;
    const cost = sales * (CR + (e.cr || 0));
    const rows = [
      ['売上', sales, 'in'], ['原価（材料）', -cost, 'out'], ['粗利', sales - cost, 'sub'],
      ['人件費', -e.labor, 'out'], ['家賃', -RENT, 'out'], ['広告', -e.ad, 'out'], ['その他', -(OTHER + (e.other || 0)), 'out']
    ];
    if (e.dep) rows.push(['減価償却', -e.dep, 'out']);
    const op = sales - cost - e.labor - RENT - e.ad - OTHER - (e.other || 0) - (e.dep || 0);
    const tax = op > 0 ? op * .3 : 0;
    rows.push(['営業利益', op, 'sub'], ['税金', -tax, 'out'], ['純利益', op - tax, 'sub']);
    return { rows, sales, gross: sales - cost, op, net: op - tax, sold, q, cap, short: q > cap, sns: e.sns ? snsRoll : 0 };
  };

  // ---- 1 年の営業（12 か月） ----
  const run = async () => {
    if (busy) return;
    busy = true; box.classList.add('is-running'); report.hidden = true; evBox.hidden = true;
    const ev = EV[Math.floor(Math.random() * EV.length)], snsRoll = 1.02 + Math.random() * .12;
    const r = calc(ev, snsRoll);
    crowd(Math.max(3, Math.min(14, Math.round(r.sold / 8000))));
    let shown = 0;
    for (let m = 1; m <= 12; m++) {
      const mo = (m + 2) % 12 + 1; // 4 月はじまり
      K('mon').textContent = mo; const hm = K('mon').parentNode; hm.classList.remove('is-flip'); void hm.offsetWidth; hm.classList.add('is-flip');
      shown = r.sales * m / 12; K('sales').textContent = Math.round(shown).toLocaleString();
      if (m === 6) {
        K('evs').textContent = ev[0]; K('evh').textContent = ev[1]; K('evt').textContent = ev[2];
        evBox.hidden = false; evBox.classList.remove('is-in'); void evBox.offsetWidth; evBox.classList.add('is-in');
        await sleep(1500);
      }
      await sleep(240);
    }
    await sleep(400);
    report.hidden = false;
    if (!reduce) report.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    await present(r, ev);
    busy = false; box.classList.remove('is-running');
  };

  // ---- 決算発表：滝グラフ ----
  const present = async (r, ev) => {
    K('rk').textContent = `${year} 年目の決算発表`;
    const st = K('stamp'); st.className = 'ks-stamp'; st.textContent = '';
    K('badges').innerHTML = ''; K('comment').textContent = '';
    const rows = r.rows, n = rows.length;
    const Wd = 680, Hd = 300, L = 54, R = 10, T = 24, B = 54;
    let run = 0; const bars = rows.map(([name, v, kind]) => { let a, b; if (kind === 'in') { a = 0; b = v; run = v; } else if (kind === 'out') { a = run; b = run + v; run = b; } else { a = 0; b = v; run = v; } return { name, v, kind, a, b }; });
    const hi = Math.max(...bars.map(x => Math.max(x.a, x.b))), lo = Math.min(0, ...bars.map(x => Math.min(x.a, x.b)));
    const Y = v => T + (hi - v) / (hi - lo) * (Hd - T - B), bw = (Wd - L - R) / n;
    let s = `<line class="ks-zero" x1="${L}" x2="${Wd - R}" y1="${Y(0)}" y2="${Y(0)}"/>`;
    const step = Math.pow(10, Math.floor(Math.log10(hi))) / (hi / Math.pow(10, Math.floor(Math.log10(hi))) < 3 ? 2 : 1);
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) s += `<text class="ks-ax" x="${L - 6}" y="${Y(v) + 3}">${v.toLocaleString()}</text><line class="ks-grid" x1="${L}" x2="${Wd - R}" y1="${Y(v)}" y2="${Y(v)}"/>`;
    bars.forEach((x, i) => {
      const cx = L + bw * i + bw / 2, top = Y(Math.max(x.a, x.b)), h = Math.max(1.5, Math.abs(Y(x.a) - Y(x.b)));
      const cls = x.kind === 'in' ? 'is-in' : x.kind === 'out' ? 'is-out' : x.v >= 0 ? 'is-sub' : 'is-neg';
      s += `<g class="ks-bar ${cls}" style="--i:${i}">`
        + (i ? `<line class="ks-link" x1="${cx - bw}" x2="${cx}" y1="${Y(bars[i - 1].b)}" y2="${Y(bars[i - 1].b)}"/>` : '')
        + `<rect x="${(cx - bw * .34).toFixed(1)}" y="${top.toFixed(1)}" width="${(bw * .68).toFixed(1)}" height="${h.toFixed(1)}" rx="3" style="transform-origin:center ${x.kind === 'out' ? top : top + h}px"/>`
        + `<text class="ks-val" x="${cx}" y="${(x.kind === 'out' || x.v < 0 ? top + h + 13 : top - 6).toFixed(1)}">${x.kind === 'out' || x.v < 0 ? '−' : ''}${Math.abs(Math.round(x.v)).toLocaleString()}</text>`
        + `<text class="ks-name${x.kind === 'sub' ? ' is-sub' : ''}" x="${cx}" y="${Hd - B + 20}">${x.name.replace('（材料）', '')}</text></g>`;
    });
    s += `<text class="ks-unit" x="${L - 6}" y="12">万円</text>`;
    fall.innerHTML = s;
    fall.classList.remove('is-play'); void fall.getBBox(); fall.classList.add('is-play');
    await sleep(n * 230 + 500);
    // はんこ
    const black = r.net >= 0;
    st.textContent = black ? '黒字' : '赤字'; st.classList.add(black ? 'is-black' : 'is-red', 'is-in');
    // 前の年とくらべる
    const b = [];
    if (prev) {
      b.push(r.sales >= prev.sales ? ['増収', 'is-up', `売上 ${man(r.sales - prev.sales)}`] : ['減収', 'is-dn', `売上 ${man(r.sales - prev.sales)}`]);
      b.push(r.net >= prev.net ? ['増益', 'is-up', `純利益 ${man(r.net - prev.net)}`] : ['減益', 'is-dn', `純利益 ${man(r.net - prev.net)}`]);
    }
    b.push(['粗利率', 'is-mid', `${Math.round(r.gross / r.sales * 100)}%`], ['営業利益率', r.op >= 0 ? 'is-mid' : 'is-dn', `${Math.round(r.op / r.sales * 100)}%`]);
    K('badges').innerHTML = b.map(([t, c, v]) => `<li class="${c}"><b>${t}</b><span>${v}</span></li>`).join('');
    let cm = `出来事は「${ev[1]}」。${Math.round(r.sold).toLocaleString()} 個を売って、売上は ${man(r.sales)}、純利益は ${man(r.net)} でした。`;
    if (r.short) cm += ` 作れる数の上限（${Math.round(r.cap).toLocaleString()} 個）に届いて、売り切れの日が続きました。人や機械をふやすと、もっと売れたかもしれません。`;
    if (r.sns) cm += r.sns > 1.1 ? ' SNS の動画が当たって、お客さんがふえました。' : ' SNS の動画は、あまり広がりませんでした。';
    if (prev && r.sales > prev.sales && r.net < prev.net) cm += ' 売上はふえたのに利益は減る「増収減益」。費用のふえ方に注目です。';
    if (prev && r.sales < prev.sales && r.net > prev.net) cm += ' 売上は減ったのに利益はふえる「減収増益」。むだな費用をおさえられたのかも。';
    K('comment').textContent = cm;
    hist.push(r.net); prev = r;
    const hm = Math.max(1, ...hist.map(Math.abs));
    K('hist').innerHTML = hist.map((v, i) => `<span class="${v < 0 ? 'is-neg' : ''}"><i style="height:${(Math.abs(v) / hm * 100).toFixed(0)}%"></i><small>${i + 1} 年目</small><b>${Math.round(v).toLocaleString()}</b></span>`).join('');
    try { localStorage.setItem('azakei_kessan', String(year)); } catch (e) {}
  };

  box.addEventListener('click', e => {
    const o = e.target.closest('.ks-op');
    if (o && !busy) { pick[+o.dataset.r] = +o.dataset.i; drawPick(); return; }
    const a = e.target.closest('[data-a]');
    if (!a || busy) return;
    if (a.dataset.a === 'run') run();
    else if (a.dataset.a === 'next') { year++; K('year').textContent = year; report.hidden = true; evBox.hidden = true; K('mon').textContent = '—'; K('sales').textContent = '0'; box.querySelector('.ks-plan').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); }
    else if (a.dataset.a === 'reset') { year = 1; hist = []; prev = null; pick = [1, 0, 0, 0]; drawPick(); K('year').textContent = 1; report.hidden = true; evBox.hidden = true; K('mon').textContent = '—'; K('sales').textContent = '0'; }
  });
  drawPick(); crowd(6);
})();
