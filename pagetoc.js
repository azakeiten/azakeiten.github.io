/* ================================================================
   pagetoc.js — 長いページの「このページの中身」
   ・id のついたセクションの見出し（h2）を集めて、ページの見出しのすぐ下に並べる
   ・4 つ以上あるページだけに出す。トップページには出さない
   ================================================================ */
(function() {
  const hero = document.querySelector('.page-hero');
  if (!hero || document.querySelector('[data-lab-board]')) return;
  const secs = [...document.querySelectorAll('section[id]')].filter(s => (s.dataset.toc || s.querySelector('h2')) && !s.closest('.page-hero'));
  if (secs.length < 4) return;
  const label = s => (s.dataset.toc || s.querySelector('h2').textContent).replace(/\s+/g, ' ').replace(/[。、]$/, '').trim();
  const nav = document.createElement('nav');
  nav.className = 'ptoc';
  nav.setAttribute('aria-label', 'このページの中身');
  nav.innerHTML = `<div class="container"><p class="ptoc-head"><span aria-hidden="true">目</span>このページの中身<small>${secs.length} つ</small></p><ol>${secs.map((s, i) => `<li><a href="#${s.id}"><b>${String(i + 1).padStart(2, '0')}</b>${label(s)}</a></li>`).join('')}</ol></div>`;
  hero.after(nav);
  // いま読んでいるところに印
  if (!('IntersectionObserver' in window)) return;
  const links = new Map(secs.map(s => [s, nav.querySelector(`a[href="#${s.id}"]`)]));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.remove('is-here')); links.get(e.target).classList.add('is-here'); } }), { rootMargin: '-40% 0px -55% 0px' });
  secs.forEach(s => io.observe(s));
})();
