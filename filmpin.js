/* ================================================================
   filmpin.js — 活動風景「展示ができるまで」
   ・パソコンでは、下へ進むとフィルムが横に流れる（場面は画面に止まったまま）
   ・スマホと「動きを減らす」設定では、これまでどおり横にめくるだけ
   ================================================================ */
(function() {
  const sec = document.getElementById('making');
  const film = sec && sec.querySelector('.film');
  if (!film) return;
  const box = sec.querySelector('.container');
  const items = [...film.children];
  const NUM = ['一', '二', '三', '四', '五', '六', '七', '八'];
  const ui = document.createElement('div');
  ui.className = 'fp-ui'; ui.setAttribute('aria-hidden', 'true');
  ui.innerHTML = `<p class="fp-count"><b>${NUM[0]}</b><span>／ ${NUM[items.length - 1] || items.length}</span></p><div class="fp-bar"><i></i></div>`;
  film.after(ui);
  const num = ui.querySelector('.fp-count b'), bar = ui.querySelector('.fp-bar i');
  const mq = matchMedia('(min-width: 861px) and (prefers-reduced-motion: no-preference)');
  let dist = 0, on = false, last = -1, wait = false;

  const measure = () => {
    on = mq.matches;
    sec.classList.toggle('fp-on', on);
    film.style.transform = '';
    if (!on) { sec.style.height = ''; return; }
    dist = Math.max(0, film.scrollWidth - box.clientWidth + 48);
    sec.style.height = (innerHeight + dist) + 'px';
    tick();
  };
  const tick = () => {
    const r = sec.getBoundingClientRect();
    const p = on ? Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))) : Math.min(1, film.scrollLeft / Math.max(1, film.scrollWidth - film.clientWidth));
    if (on) film.style.transform = `translate3d(${-p * dist}px,0,0)`;
    bar.style.transform = `scaleX(${Math.max(p, .02)})`;
    const i = Math.min(items.length - 1, Math.round(p * (items.length - 1)));
    if (i !== last) { last = i; num.textContent = NUM[i] || i + 1; items.forEach((li, j) => li.classList.toggle('is-on', j === i)); }
  };
  const onScroll = () => { if (wait) return; wait = true; requestAnimationFrame(() => { wait = false; tick(); }); };
  addEventListener('scroll', onScroll, { passive: true });
  film.addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', measure);
  mq.addEventListener ? mq.addEventListener('change', measure) : mq.addListener(measure);
  // 写真の大きさが決まってから測る
  items.forEach(li => { const im = li.querySelector('img'); if (im) { im.addEventListener('load', measure, { once: true }); } });
  measure();
})();
