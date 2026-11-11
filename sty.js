/* ================================================================
   sty.js — トップ「4 つの場面で、麻経を。」
   ・下へ進むと、いま読んでいる場面に合わせて、写真・番号・進み具合が入れかわる
   ・写真は近づいてから読みこむ（loading="lazy"）。動きを減らす設定では切りかえだけ
   ================================================================ */
(function() {
  const box = document.querySelector('[data-sty]');
  if (!box) return;
  const steps = [...box.querySelectorAll('.sty-step')];
  const phs = [...box.querySelectorAll('.sty-ph')];
  const rail = [...box.querySelectorAll('.sty-rail li')];
  const capNo = box.querySelector('.sty-cap-no'), capT = box.querySelector('.sty-cap-t');
  const NUM = ['一', '二', '三', '四'];
  let cur = 0;
  const show = i => {
    if (i === cur) return;
    cur = i;
    steps.forEach((s, j) => s.classList.toggle('is-on', j === i));
    phs.forEach((p, j) => p.classList.toggle('is-on', j === i));
    rail.forEach((r, j) => { r.classList.toggle('is-on', j === i); r.classList.toggle('is-past', j < i); });
    capNo.textContent = NUM[i] || '';
    capT.textContent = steps[i].dataset.cap || '';
    // 次の写真も先に読みこんでおく（切りかえたときに白くならないように）
    const nx = phs[i + 1] && phs[i + 1].querySelector('img'); if (nx) nx.loading = 'eager';
  };
  // 4 枚とも、場面に近づいたら先に読みこむ
  const warm = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { phs.forEach(p => { const im = p.querySelector('img'); if (im) im.loading = 'eager'; }); warm.disconnect(); } }, { rootMargin: '600px 0px' });
  warm.observe(box);
  // 画面のまん中（スマホでは写真の下の、読む場所のまん中）にいちばん近い場面を「いま」にする
  let near = false;
  const pick = () => {
    const r = box.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    phs.forEach(p => { const im = p.querySelector('img'); if (im && im.loading !== 'eager') im.loading = 'eager'; });
    const media = box.querySelector('.sty-media').getBoundingClientRect();
    const narrow = innerWidth <= 860;
    const mid = narrow ? (Math.max(media.bottom, 0) + innerHeight) / 2 : innerHeight / 2;
    let best = 0, d = Infinity;
    steps.forEach((s, j) => { const b = s.getBoundingClientRect(); const c = Math.abs((b.top + Math.min(b.height, 320) / 2) - mid); if (c < d) { d = c; best = j; } });
    show(best);
  };
  addEventListener('scroll', () => { if (near) return; near = true; setTimeout(() => { near = false; pick(); }, 60); }, { passive: true });
  addEventListener('resize', pick);
  pick();
  box.classList.add('is-ready');
})();
