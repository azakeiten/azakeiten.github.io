/* ================================================================
   ring3d.js — 活動風景：写真の 3D 回転木馬（CSS 3D・ライブラリなし）
   ・content.js の写真を輪に並べて、ゆっくり回す。ドラッグや矢印でも回せる
   ・写真を押すと、下のギャラリーと同じ拡大表示が開く
   ・人の顔がはっきり写る集合写真は、輪には入れない
   ================================================================ */
(function() {
  const host = document.querySelector('[data-ring3d]');
  const G = window.AZAKEI && window.AZAKEI.gallery;
  if (!host || !G) return;
  const shots = G.filter(g => g.src && !/members\.jpg$/.test(g.src));
  const n = shots.length; if (n < 4) return;
  const step = 360 / n;
  host.innerHTML = `
    <div class="rg-view"><div class="rg-ring">${shots.map((s, i) => `<button type="button" class="rg-card" style="--i:${i}" data-src="${s.src}" aria-label="${s.caption}（拡大）"><img data-src="${s.src}" alt="" decoding="async"><span>${s.caption}</span></button>`).join('')}</div><div class="rg-floor" aria-hidden="true"></div></div>
    <div class="rg-ctrl"><button type="button" class="rg-prev" aria-label="前の写真へ">←</button><p class="rg-cap" aria-live="polite"></p><button type="button" class="rg-next" aria-label="次の写真へ">→</button></div>`;
  const view = host.querySelector('.rg-view'), ring = host.querySelector('.rg-ring'), cap = host.querySelector('.rg-cap');
  const cards = [...host.querySelectorAll('.rg-card')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let angle = 0, target = 0, drag = null, idle = 0, raf = 0;
  // 写真どうしが重ならない半径（カードの幅 × 枚数 ÷ 2π）
  const radius = () => Math.round((cards[0].offsetWidth + 18) * n / (2 * Math.PI));
  const layout = () => { host.style.setProperty('--n', n); host.style.setProperty('--r', radius() + 'px'); };
  const front = () => ((Math.round(-angle / step) % n) + n) % n;
  const paint = () => {
    ring.style.transform = `translateZ(calc(-1 * var(--r))) rotateY(${angle}deg)`;
    const f = front();
    cards.forEach((c, i) => c.classList.toggle('is-front', i === f));
    cap.textContent = `${shots[f].caption}　${shots[f].date || ''}`;
  };
  const tick = () => {
    if (!drag) { if (!reduce && !document.documentElement.classList.contains('is-lite') && Date.now() - idle > 2500) target -= 0.06; angle += (target - angle) * 0.08; }
    paint(); raf = requestAnimationFrame(tick);
  };
  const go = d => { idle = Date.now(); target = Math.round(target / step) * step - d * step; };
  host.querySelector('.rg-prev').addEventListener('click', () => go(-1));
  host.querySelector('.rg-next').addEventListener('click', () => go(1));
  view.addEventListener('pointerdown', e => { drag = { x: e.clientX, a: angle, moved: false }; });
  addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) drag.moved = true; angle = target = drag.a + dx * 0.25; });
  addEventListener('pointerup', () => { if (!drag) return; idle = Date.now(); target = Math.round(angle / step) * step; setTimeout(() => { drag = null; }, 0); });
  // 押すと拡大（下のギャラリーの同じ写真を開く）
  cards.forEach((c, i) => c.addEventListener('click', e => {
    if (drag && drag.moved) { e.preventDefault(); return; }
    if (i !== front()) { idle = Date.now(); target = -i * step + Math.round((angle + i * step) / 360) * 360; return; }
    const g = [...document.querySelectorAll('.gallery-item')].find(el => (el.querySelector('img') || {}).getAttribute && el.querySelector('img').getAttribute('src') === c.dataset.src);
    if (g) (g.querySelector('button, a') || g).click();
  }));
  // 画面に見えているときだけ動かす
  layout(); addEventListener('resize', layout);
  new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { host.querySelectorAll('img[data-src]').forEach(im => { im.src = im.dataset.src; im.removeAttribute('data-src'); }); if (!raf) raf = requestAnimationFrame(tick); } else { cancelAnimationFrame(raf); raf = 0; } })).observe(host);
  paint();
})();
