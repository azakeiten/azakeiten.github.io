/* ================================================================
   chapters.js — トップの「章」の目次（パソコンの右はし）
   ・序（はじめに）・知る・遊ぶ・予定 の 4 つ。いま読んでいる章に印
   ・最初の画面にいる間は出さない。スマホでは下のメニューがあるので出さない（CSS）
   ================================================================ */
(function() {
  const chs = [...document.querySelectorAll('[data-chp]')];
  if (!chs.length) return;
  const list = [{ id: 'top', seal: '序', t: 'はじめに' }].concat(chs.map(c => ({ id: c.id, seal: c.dataset.chp, t: c.querySelector('.chp-title').textContent })));
  const nav = document.createElement('div');
  nav.className = 'chp-rail'; nav.setAttribute('role', 'navigation'); nav.setAttribute('aria-label', 'このページの章');
  nav.innerHTML = `<ol>${list.map((c, i) => `<li><a href="${c.id === 'top' ? '#' : '#' + c.id}" data-k="${i}"><span class="cr-seal" aria-hidden="true">${c.seal}</span><span class="cr-t">${c.t}</span></a></li>`).join('')}</ol>`;
  document.body.appendChild(nav);
  const links = [...nav.querySelectorAll('a')];
  nav.querySelector('[data-k="0"]').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
  let cur = -1, wait = false;
  const tick = () => {
    wait = false;
    const mid = innerHeight * 0.4;
    let k = 0;
    chs.forEach((c, i) => { if (c.getBoundingClientRect().top < mid) k = i + 1; });
    // 最後の章のあと（しめくくり・フッター）も、最後の章のまま
    nav.classList.toggle('is-shown', scrollY > innerHeight * 0.8);
    if (k !== cur) { cur = k; links.forEach((a, i) => { a.classList.toggle('is-on', i === k); if (i === k) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }
  };
  addEventListener('scroll', () => { if (!wait) { wait = true; setTimeout(tick, 80); } }, { passive: true });
  addEventListener('resize', tick);
  tick();
})();

/* しめくくり（フィナーレ）の写真：画面に入ったら、ゆっくり寄りを戻す */
(function() {
  const ph = document.querySelector('.fin .fin-ph');
  if (!ph) return;
  if (!('IntersectionObserver' in window)) { ph.classList.add('is-in'); return; }
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { ph.classList.add('is-in'); io.disconnect(); } }, { rootMargin: '0px 0px -15% 0px' });
  io.observe(ph);
})();
