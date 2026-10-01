/* ================================================================
   fx.js — 演出（読了バー・ナビ自動格納・数字カウントアップ・
            トップへ戻る・ページ遷移フェード）
   ================================================================ */
(function() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 読了プログレスバー ---- */
  const bar = document.createElement('div');
  bar.className = 'read-progress';
  document.body.appendChild(bar);

  /* ---- トップへ戻る ---- */
  const top = document.createElement('button');
  top.className = 'to-top';
  top.type = 'button';
  top.setAttribute('aria-label', 'ページの先頭へ');
  top.innerHTML = '<svg width="14" height="18" aria-hidden="true"><path d="M7 17V1M1 7l6-6 6 6" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>';
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  document.body.appendChild(top);

  /* ---- スクロール連動（バー・ナビ格納・トップボタン） ---- */
  const nav  = document.getElementById('navbar');
  const menu = document.getElementById('mobileMenu');
  let lastY  = window.scrollY;
  function onScroll() {
    const y   = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    top.classList.toggle('show', y > window.innerHeight * 1.2);
    if (nav && !(menu && menu.classList.contains('open'))) {
      nav.classList.toggle('nav-hidden', y > 240 && y > lastY + 4);
      if (y < lastY - 4 || y <= 240) nav.classList.remove('nav-hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- 数字のカウントアップ（.stat-num / [data-count]） ---- */
  const nums = document.querySelectorAll('.stat-num, [data-count]');
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const m = e.target.textContent.match(/^([\d,]+)(.*)$/);
      if (!m || reduce) return;
      const to = parseInt(m[1].replace(/,/g, ''), 10), suffix = m[2], comma = m[1].includes(',');
      const start = performance.now(), dur = 1400;
      (function step(t) {
        const p = Math.min(1, (t - start) / dur);
        const v = Math.round(to * (1 - Math.pow(1 - p, 4)));
        e.target.textContent = (comma ? v.toLocaleString() : v) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  }, { threshold: 0.6 });
  // 合計値などの計算スクリプトが走ってから監視する
  window.addEventListener('load', () => nums.forEach(n => countIO.observe(n)));

  /* ---- ページ遷移フェード ---- */
  if (reduce) return;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    document.body.classList.add('page-leave');
    setTimeout(() => { location.href = a.href; }, 260);
  });
  window.addEventListener('pageshow', () => document.body.classList.remove('page-leave'));
})();
