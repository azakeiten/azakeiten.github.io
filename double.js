/* ================================================================
   double.js — シミュレーター：お金が 2 倍になるまで（72 の法則）
   ・年利を動かすと、72 の法則と、きちんと計算した年数を出す
   ・チップ 5 枚が、年ごとに複利で増えて 10 枚になるまでを、3D の山で見せる
   ================================================================ */
(function() {
  const box = document.querySelector('[data-double]');
  if (!box) return;
  const range = box.querySelector('#dblRange'), out = box.querySelector('#dblRate');
  const stack = box.querySelector('[data-stack]'), yearsEl = box.querySelector('[data-years]'), chipsEl = box.querySelector('[data-chips]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PER = 1;   // チップ 1 枚を、山の 1 段に（5 枚 → 10 枚）
  let timer = 0;
  const chip = (i, gold) => `<span class="vt-chip" style="--z:${i * 9}px;--d:0s;--c:${gold ? '#b08a4a' : '#b5432f'};--s:#fffaf0"><i></i><i></i><i></i><b></b></span>`;
  const draw = (amount) => {
    const n = Math.floor(amount / PER + 1e-9);
    let h = ''; for (let i = 0; i < n; i++) h += chip(i, i >= 5);
    stack.innerHTML = h;
  };
  const run = () => {
    const r = +range.value, g = 1 + r / 100;
    const exact = Math.log(2) / Math.log(g), rule = 72 / r;
    out.textContent = r;
    box.querySelector('[data-r]').textContent = r;
    box.querySelector('[data-rule]').textContent = Number.isInteger(rule) ? rule : rule.toFixed(1);
    box.querySelector('[data-exact]').textContent = exact.toFixed(1);
    const age = Math.round(15 + exact);
    box.querySelector('[data-note]').textContent = `年 ${r}％ なら、15 歳で始めたお金は、${age} 歳ごろに 2 倍。`;
    // 年ごとに積み上げる
    clearTimeout(timer);
    const end = Math.ceil(exact);
    let y = 0;
    const step = () => {
      const amt = 5 * Math.pow(g, y);
      draw(Math.min(amt, 10)); yearsEl.textContent = y; chipsEl.textContent = (Math.round(amt * 10) / 10).toFixed(1);
      if (y < end) { y++; timer = setTimeout(step, reduce ? 0 : Math.max(60, 900 / end)); }
    };
    if (reduce) { y = end; step(); } else step();
  };
  range.addEventListener('input', run);
  // 画面に入ったら 1 回目を動かす
  new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { run(); io.disconnect(); } }), { threshold: 0.3 }).observe(box);
  draw(5);
})();
