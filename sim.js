/* ================================================================
   sim.js — チップ配分シミュレーター
   ・チップ 100 枚を「預金・債券・株」に 10 枚単位で配分 → 10 年分を 1 年ずつ早送り
   ・「1000 通りの未来」で、まん中の結果・よくある範囲・100 枚を下回る確率を見る
   ・値動きは学習用の仮の数字（毎年の増え方の平均と、ブレの大きさ）
   ================================================================ */
(function() {
  const root = document.getElementById('sim');
  if (!root) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 仮の性質：平均（1 年あたり）とブレ（標準偏差）
  const A = [
    { key: 'cash',  name: '預金', sub: 'ほぼ増えないが、減らない',     mu: 0.002, sd: 0,    color: '#9aa0a6' },
    { key: 'bond',  name: '債券', sub: '少しずつ増える。ブレは小さめ', mu: 0.015, sd: 0.04, color: '#3c8a37' },
    { key: 'stock', name: '株',   sub: '大きく増えやすいが、ブレも大きい', mu: 0.06,  sd: 0.18, color: '#c8a96e' }
  ];
  const YEARS = 10, TOTAL = 100, STEP = 10;
  const PRESETS = { 慎重: [70, 30, 0], バランス: [20, 40, 40], 攻め: [0, 0, 100] };
  let alloc = [30, 40, 30];

  // ふつう分布の乱数（Box–Muller）
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  // 1 回分の未来：年ごとの合計と、資産ごとの推移
  function simulate(al) {
    const vals = al.slice();
    const path = [vals.reduce((s, x) => s + x, 0)];
    for (let y = 0; y < YEARS; y++) {
      A.forEach((a, i) => { const r = Math.max(-0.6, a.mu + a.sd * gauss()); vals[i] = vals[i] * (1 + r); });
      path.push(vals.reduce((s, x) => s + x, 0));
    }
    return path;
  }
  const fmt = n => (Math.round(n * 10) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 });

  function render() {
    const left = TOTAL - alloc.reduce((s, x) => s + x, 0);
    root.innerHTML = `
      <div class="dg-card sim-card">
        <p class="dg-kicker">Step 1 · チップを分ける</p>
        <h2>100 枚を、どこに置く？</h2>
        <div class="sim-presets" role="group" aria-label="おすすめの分け方">${Object.keys(PRESETS).map(k => `<button type="button" data-p="${k}">${k}</button>`).join('')}</div>
        <div class="sim-rows">
          ${A.map((a, i) => `
            <div class="sim-row" style="--c:${a.color}">
              <div class="sim-name"><b>${a.name}</b><small>${a.sub}</small></div>
              <div class="sim-ctrl">
                <button type="button" class="sim-minus" data-i="${i}" aria-label="${a.name}を 10 枚減らす"${alloc[i] <= 0 ? ' disabled' : ''}>−</button>
                <output aria-live="polite">${alloc[i]}</output>
                <button type="button" class="sim-plus" data-i="${i}" aria-label="${a.name}を 10 枚増やす"${left <= 0 ? ' disabled' : ''}>＋</button>
              </div>
              <div class="sim-bar"><i style="width:${alloc[i]}%"></i></div>
            </div>`).join('')}
        </div>
        <p class="sim-left ${left ? 'is-warn' : ''}">${left ? `あと <b>${left}</b> 枚、どこかに置いてください` : 'ぜんぶ置けました'}</p>
        <div class="sim-actions">
          <button type="button" class="btn-primary sim-go"${left ? ' disabled' : ''}>10 年後へ早送り</button>
          <button type="button" class="btn-ghost sim-many"${left ? ' disabled' : ''}>1000 通りの未来を見る →</button>
        </div>
        <div class="sim-out" aria-live="polite"></div>
      </div>`;
    root.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => { alloc = PRESETS[b.dataset.p].slice(); render(); }));
    root.querySelectorAll('.sim-minus').forEach(b => b.addEventListener('click', () => { alloc[+b.dataset.i] = Math.max(0, alloc[+b.dataset.i] - STEP); render(); }));
    root.querySelectorAll('.sim-plus').forEach(b => b.addEventListener('click', () => { if (TOTAL - alloc.reduce((s, x) => s + x, 0) >= STEP) { alloc[+b.dataset.i] += STEP; render(); } }));
    root.querySelector('.sim-go').addEventListener('click', runOnce);
    root.querySelector('.sim-many').addEventListener('click', runMany);
  }

  // 折れ線グラフ（自分の配分＝太線、比べる相手＝点線）
  function chart(lines, maxY) {
    const w = 640, h = 280, l = 44, r = 14, t = 16, b = 34;
    const x = i => l + i * (w - l - r) / YEARS, y = v => t + (1 - v / maxY) * (h - t - b);
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(k => Math.round(maxY * k / 10) * 10);
    return `<svg class="sim-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="10 年間のチップの推移">
      ${ticks.map(v => `<line x1="${l}" x2="${w - r}" y1="${y(v)}" y2="${y(v)}" class="sim-grid${v === 100 ? ' is-start' : ''}"/><text x="${l - 8}" y="${y(v) + 4}" class="sim-ytick">${v}</text>`).join('')}
      <line x1="${l}" x2="${w - r}" y1="${y(100)}" y2="${y(100)}" class="sim-grid is-start"/>
      ${Array.from({ length: YEARS + 1 }, (_, i) => i % 2 === 0 ? `<text x="${x(i)}" y="${h - 10}" class="sim-xtick">${i}年</text>` : '').join('')}
      ${lines.map(L => `<polyline points="${L.path.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}" class="sim-line${L.me ? ' is-me' : ''}" style="--c:${L.color}"/>`).join('')}
    </svg>`;
  }

  function runOnce() {
    const me = simulate(alloc);
    const cash = simulate([100, 0, 0]), stock = simulate([0, 0, 100]);
    const out = root.querySelector('.sim-out');
    const maxY = Math.max(140, ...me, ...stock, ...cash) * 1.08;
    // 1 年ずつ伸ばして見せる
    let yr = reduce ? YEARS : 0;
    const draw = () => {
      const cut = p => p.slice(0, yr + 1);
      const now = me[yr];
      let worst = 0; for (let i = 1; i <= yr; i++) worst = Math.min(worst, (me[i] - me[i - 1]) / me[i - 1]);
      out.innerHTML = `
        <div class="sim-result">
          <div class="sim-now"><small>${yr} 年後のあなたのチップ</small><b>${fmt(now)}<span>枚</span></b><em class="${now >= 100 ? 'up' : 'down'}">${now >= 100 ? '+' : ''}${fmt(now - 100)} 枚</em></div>
          ${chart([{ path: cut(cash), color: '#9aa0a6' }, { path: cut(stock), color: '#c8a96e' }, { path: cut(me), color: '#17191e', me: true }], maxY)}
          <ul class="sim-legend"><li class="is-me">あなたの配分</li><li style="--c:#c8a96e">ぜんぶ株</li><li style="--c:#9aa0a6">ぜんぶ預金</li></ul>
          ${yr === YEARS ? `<p class="sim-note">いちばん下がった年は <b>${fmt(worst * 100)}%</b>。同じ配分でも、もう一度押すと別の未来になります。運のよしあしを除いて「ふつうはどうなるか」を知るには、<button type="button" class="sim-link">1000 通りの未来を見る</button>。</p>` : ''}
        </div>`;
      const link = out.querySelector('.sim-link'); if (link) link.addEventListener('click', runMany);
      if (yr < YEARS) { yr++; setTimeout(draw, 260); }
    };
    draw();
  }

  function runMany() {
    const N = 1000;
    const finals = Array.from({ length: N }, () => simulate(alloc)[YEARS]).sort((a, b) => a - b);
    const q = p => finals[Math.min(N - 1, Math.floor(p * N))];
    const loss = finals.filter(v => v < 100).length / N;
    const mn = finals[0], mx = finals[N - 1];
    const pos = v => ((v - mn) / (mx - mn || 1)) * 100;
    // ヒストグラム（20 本）
    const bins = Array(20).fill(0); finals.forEach(v => { bins[Math.min(19, Math.floor(pos(v) / 5))]++; });
    const top = Math.max(...bins);
    root.querySelector('.sim-out').innerHTML = `
      <div class="sim-result">
        <p class="dg-kicker">1000 通りの未来（10 年後）</p>
        <div class="sim-stats">
          <div><small>まん中の結果</small><b>${fmt(q(0.5))}<span>枚</span></b></div>
          <div><small>よくある範囲（10〜90%）</small><b>${fmt(q(0.1))}〜${fmt(q(0.9))}<span>枚</span></b></div>
          <div><small>100 枚を下回る確率</small><b>${Math.round(loss * 100)}<span>%</span></b></div>
        </div>
        <div class="sim-hist" aria-hidden="true">${bins.map((n, i) => `<i style="height:${(n / top * 100).toFixed(1)}%" class="${mn + (i + 0.5) * (mx - mn) / 20 < 100 ? 'is-loss' : ''}"></i>`).join('')}</div>
        <div class="sim-hist-axis"><span>${fmt(mn)} 枚</span><span>${fmt(mx)} 枚</span></div>
        <p class="sim-note">${loss > 0.2 ? '大きく増える未来もあるけれど、減ってしまう未来も少なくありません。これが「リスク」です。' : loss > 0.02 ? '大きく減る未来は少なめ。そのかわり、増え方もおだやかです。' : 'ほとんど減らないけれど、増え方もゆっくり。安全さと引きかえに、リターンは小さくなります。'}
        配分を変えて、まん中の結果と「下回る確率」がどう変わるか見くらべてみよう。<a href="glossary.html#diversify">分散投資とは？</a></p>
      </div>`;
  }

  render();
})();
