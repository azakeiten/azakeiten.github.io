/* ================================================================
   updown.js — シミュレーター：上がる？下がる？ チャート予想
   ・30 日分の株価チャートを見て、次の 5 日で「上がる／下がる」にチップを賭ける。7 回戦
   ・チャートは、毎回サイコロで作る「ランダムウォーク」。最後に種明かし（短い先の予想はむずかしい）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-updown]');
  if (!box) return;
  const ROUNDS = 7, START = 5, W = 340, H = 200;
  const svg = box.querySelector('svg'), info = box.querySelector('[data-info]'), chipsEl = box.querySelector('[data-chips]'), roundEl = box.querySelector('[data-round]');
  const betEl = box.querySelector('[data-bet]'), btnUp = box.querySelector('.ud-up'), btnDown = box.querySelector('.ud-down'), btnNext = box.querySelector('.ud-next');
  let chips, round, prices, bet, hist;
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const walk = (start, n) => { const a = [start]; for (let i = 1; i < n; i++) a.push(Math.max(20, a[i - 1] * (1 + gauss() * 0.025))); return a; };
  const draw = (shown, total) => {
    const lo = Math.min(...prices) * 0.97, hi = Math.max(...prices) * 1.03;
    const x = i => 10 + i / (total - 1) * (W - 20), y = p => H - 14 - (p - lo) / (hi - lo) * (H - 28);
    const pts = (a, b) => prices.slice(a, b).map((p, i) => `${x(a + i)},${y(p)}`).join(' ');
    const up = prices[shown - 1] >= prices[29];
    svg.innerHTML = `<rect x="${x(29)}" y="0" width="${W - x(29)}" height="${H}" class="ud-future"/>
      <line x1="${x(29)}" y1="0" x2="${x(29)}" y2="${H}" class="ud-today"/><text x="${x(29) + 4}" y="14" class="ud-lab">きょう</text>
      <polyline points="${pts(0, 30)}" class="ud-past"/>
      ${shown > 30 ? `<polyline points="${pts(29, shown)}" class="ud-next-line ${up ? 'is-up' : 'is-down'}"/>` : ''}
      <circle cx="${x(shown - 1)}" cy="${y(prices[shown - 1])}" r="4" class="ud-dot"/>`;
  };
  const status = () => { chipsEl.textContent = chips; roundEl.textContent = Math.min(round, ROUNDS); betEl.max = Math.max(1, chips); if (+betEl.value > chips) betEl.value = Math.max(1, chips); box.querySelector('[data-betv]').textContent = betEl.value; };
  const newRound = () => {
    prices = walk(100, 35); bet = null; draw(30, 35);
    info.innerHTML = `<b>${round} 回戦</b>次の 5 日、上がる？ 下がる？ 賭けるチップを決めて、えらんでください。`;
    btnUp.disabled = btnDown.disabled = false; btnNext.hidden = true; status();
  };
  const reveal = dir => {
    bet = +betEl.value; btnUp.disabled = btnDown.disabled = true;
    let d = 30;
    const step = () => {
      d++; draw(d, 35);
      if (d < 35) return setTimeout(step, 260);
      const up = prices[34] >= prices[29], win = (dir === 'up') === up;
      chips += win ? bet : -bet; hist.push(win);
      const pct = ((prices[34] / prices[29] - 1) * 100).toFixed(1);
      info.innerHTML = `<b class="${win ? 'is-win' : 'is-lose'}">${win ? '当たり！' : 'はずれ……'}</b>5 日で ${pct > 0 ? '+' : ''}${pct}％。チップ ${win ? '+' : '−'}${bet} 枚。`;
      status(); round++;
      if (chips <= 0 || round > ROUNDS) return finish();
      btnNext.hidden = false; btnNext.focus();
    };
    step();
  };
  const finish = () => {
    const wins = hist.filter(Boolean).length;
    if (wins >= 5) { try { localStorage.setItem('azakei_chart_reader', '1'); } catch (e) {} }
    info.innerHTML = `<b>結果：チップ ${chips} 枚</b>${hist.length} 回中 ${wins} 回当たり。<br><span class="ud-reveal">種明かし：このチャートは、毎回サイコロのように<strong>でたらめに</strong>作っていました（ランダムウォーク）。本物の株価も、短い先の動きはとても予想しにくいもの。だからこそ、1 つに賭けずに「分散」したり、長い目で見たりすることが大切です。</span>`;
    btnUp.disabled = btnDown.disabled = true; btnNext.hidden = false; btnNext.textContent = 'もう一度あそぶ';
    btnNext.onclick = () => { btnNext.textContent = '次の回戦へ'; btnNext.onclick = null; start(); };
  };
  const start = () => { chips = START; round = 1; hist = []; newRound(); };
  btnUp.addEventListener('click', () => reveal('up'));
  btnDown.addEventListener('click', () => reveal('down'));
  btnNext.addEventListener('click', () => { if (!btnNext.onclick && round <= ROUNDS && chips > 0) newRound(); });
  betEl.addEventListener('input', () => { box.querySelector('[data-betv]').textContent = betEl.value; });
  start();
})();
