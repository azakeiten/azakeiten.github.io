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
