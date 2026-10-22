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
