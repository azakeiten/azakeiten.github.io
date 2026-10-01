/* ================================================================
   fx.js — 演出（読了バー・ナビ自動格納・数字カウントアップ・
            トップへ戻る・ページ遷移フェード）
   ================================================================ */
(function() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 幕：前のページから幕で移動してきたら、幕を上げて見せる ---- */
  const curtain = document.createElement('div');
  curtain.className = 'curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.textContent = 'AZAKEI';
  document.body.appendChild(curtain);
  let arrived = false;
  try { arrived = !!sessionStorage.getItem('azakei-curtain'); sessionStorage.removeItem('azakei-curtain'); } catch (e) {}
  if (arrived && !document.getElementById('loader') && !reduce) {
    document.body.classList.add('has-curtain');
    curtain.classList.add('is-out');
  }
  document.documentElement.classList.remove('curtain-pending');

  /* ---- ヒーローのワードマークを1文字ずつに分割 ---- */
  const wm = document.querySelector('.hero-wordmark');
  if (wm) {
    const letters = [...wm.textContent];
    const goldFrom = wm.firstChild.textContent.length; // <span> 部分（KEI）は金色
    wm.innerHTML = letters.map((c, i) =>
      `<span class="ch${i >= goldFrom ? ' gold' : ''}" style="--i:${i}">${c}</span>`).join('');
    wm.setAttribute('aria-label', letters.join(''));
  }
  const cue = document.getElementById('scrollCue');

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
    if (cue) cue.classList.toggle('hide', y > 60);
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

  /* ---- 目次：今読んでいる項目を光らせる ---- */
  const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
  if (tocLinks.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        tocLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    tocLinks.forEach(l => { const t = document.querySelector(l.getAttribute('href')); if (t) spy.observe(t); });
  }

  /* ---- ハブ：中心から各カードへ線を引く（黒板のマインドマップ風・PCのみ） ---- */
  const hub = document.querySelector('.hub');
  if (hub) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.classList.add('hub-lines');
    svg.setAttribute('aria-hidden', 'true');
    hub.prepend(svg);
    const core  = hub.querySelector('.hub-core');
    const cards = [...hub.querySelectorAll('.hub-branches .link-card')];
    function drawHub() {
      if (window.innerWidth <= 1024) { svg.innerHTML = ''; return; }
      const h = hub.getBoundingClientRect(), c = core.getBoundingClientRect();
      const cx = c.left + c.width / 2 - h.left, cy = c.top + c.height / 2 - h.top, r = c.width / 2 + 14;
      svg.setAttribute('viewBox', `0 0 ${h.width} ${h.height}`);
      svg.innerHTML = cards.map((card, i) => {
        const b  = card.getBoundingClientRect();
        const ex = b.left - h.left, ey = b.top + b.height / 2 - h.top;
        const a  = Math.atan2(ey - cy, ex - cx);
        const sx = cx + Math.cos(a) * r, sy = cy + Math.sin(a) * r;
        const k  = (ex - sx) * 0.5;
        return `<path style="--i:${i}" d="M${sx},${sy} C${sx + k},${sy} ${ex - k},${ey} ${ex},${ey}"/>` +
               `<circle style="--i:${i}" cx="${ex}" cy="${ey}" r="3.5"/>`;
      }).join('');
      svg.querySelectorAll('path').forEach(p => p.style.setProperty('--len', Math.ceil(p.getTotalLength())));
    }
    drawHub();
    new ResizeObserver(drawHub).observe(hub);
    if (document.fonts) document.fonts.ready.then(drawHub);
  }

  /* ---- カーソル追従の光 ---- */
  document.addEventListener('pointermove', e => {
    const el = e.target.closest && e.target.closest('.link-card, .vote-option, .sns-card, .dm-card');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  if (reduce) return;

  /* ---- ボタンがカーソルに少し吸い寄せられる（マウス操作時のみ） ---- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---- ページ移動：金の線とロゴの入った幕が下から閉じる ---- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    curtain.classList.remove('is-out');
    void curtain.offsetWidth;
    curtain.classList.add('is-in');
    try { sessionStorage.setItem('azakei-curtain', '1'); } catch (err) {}
    setTimeout(() => { location.href = a.href; }, 480);
  });
  // 「戻る」で戻ってきたとき（ページが保存されていた場合）は幕を開ける
  window.addEventListener('pageshow', ev => {
    if (ev.persisted) { curtain.classList.remove('is-in'); curtain.classList.add('is-out'); }
  });
})();
