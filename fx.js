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

  /* ---- ナビの高さ（スマホ目次バーの貼り付き位置に使う） ---- */
  function setNavH() { if (nav) document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px'); }
  setNavH();
  if (nav && window.ResizeObserver) new ResizeObserver(setNavH).observe(nav, { box: 'border-box' });

  /* ---- 目次：見出しから自動生成し、読み進めた分だけバーを伸ばす ----
     <nav class="toc" data-toc=".contest"> … PC 用（左に固定）
     <nav class="toc-mobile" data-toc-mobile> … スマホ用（上に貼り付く横バー） */
  const toc = document.querySelector('.toc[data-toc]');
  if (toc) {
    const secs = [...document.querySelectorAll(toc.dataset.toc)].filter(s => s.id);
    const pad  = n => String(n).padStart(2, '0');
    const items = secs.map((s, i) => ({
      id: s.id, num: pad(i + 1),
      ja: (s.querySelector('h2') || s).textContent.trim(),
      en: ((s.querySelector('.en') || {}).textContent || '').trim()
    }));

    toc.innerHTML = `
      <div class="toc-head"><span>Index</span><span class="toc-count"><b>01</b> / ${pad(items.length)}</span></div>
      <ol class="toc-list">${items.map(it => `
        <li><a href="#${it.id}">
          <span class="toc-track"><span class="toc-fill"></span></span>
          <span class="toc-num">${it.num}</span>
          <span class="toc-text"><b>${it.ja}</b><small>${it.en}</small></span>
          <svg class="toc-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a></li>`).join('')}
      </ol>`;

    const mob = document.querySelector('[data-toc-mobile]');
    if (mob) mob.innerHTML = `
      <div class="toc-mobile-scroller">${items.map(it =>
        `<a href="#${it.id}"><span>${it.num}</span>${it.ja}</a>`).join('')}</div>
      <div class="toc-mobile-progress"><span></span></div>`;

    const links   = [...toc.querySelectorAll('a')];
    const fills   = [...toc.querySelectorAll('.toc-fill')];
    const chips   = mob ? [...mob.querySelectorAll('a')] : [];
    const scroller = mob && mob.querySelector('.toc-mobile-scroller');
    const bar      = mob && mob.querySelector('.toc-mobile-progress span');
    const countEl  = toc.querySelector('.toc-count b');
    let current = -1, ticking = false;

    function updateToc() {
      ticking = false;
      const line = window.innerHeight * 0.4;
      let active = 0;
      secs.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (line - r.top) / r.height));
        fills[i].style.transform = `scaleY(${p})`;
        if (r.top <= line) active = i;
        links[i].classList.toggle('is-done', p >= 1);
      });
      const first = secs[0].getBoundingClientRect(), last = secs[secs.length - 1].getBoundingClientRect();
      const total = Math.max(0, Math.min(1, (line - first.top) / (last.bottom - first.top)));
      if (bar) bar.style.transform = `scaleX(${total})`;
      if (active !== current) {
        current = active;
        links.forEach((l, i) => l.classList.toggle('is-active', i === active));
        chips.forEach((c, i) => c.classList.toggle('is-active', i === active));
        if (countEl) countEl.textContent = items[active].num;
        const chip = chips[active];
        if (scroller && chip) {
          const left = scroller.scrollLeft + chip.getBoundingClientRect().left - scroller.getBoundingClientRect().left
                     - (scroller.clientWidth - chip.offsetWidth) / 2;
          scroller.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' });
        }
      }
    }
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateToc); } }, { passive: true });
    window.addEventListener('resize', updateToc);
    updateToc();
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

  /* ---- 写真の拡大表示（ギャラリーの写真を押すと大きく） ---- */
  const shots = [...document.querySelectorAll('.gallery-item:not(.is-empty)')];
  if (shots.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', '写真の拡大表示');
    const arrow = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="${d}"/></svg>`;
    lb.innerHTML = `
      <figure><img alt=""><figcaption></figcaption></figure>
      <button type="button" class="lb-close" aria-label="閉じる">${arrow('M6 6l12 12M18 6L6 18')}</button>
      <button type="button" class="lb-prev" aria-label="前の写真">${arrow('M15 5l-7 7 7 7')}</button>
      <button type="button" class="lb-next" aria-label="次の写真">${arrow('M9 5l7 7-7 7')}</button>`;
    document.body.appendChild(lb);
    const img = lb.querySelector('img'), cap = lb.querySelector('figcaption');
    const multi = shots.length > 1;
    lb.querySelector('.lb-prev').hidden = lb.querySelector('.lb-next').hidden = !multi;
    let idx = 0, opener = null;

    function show(i) {
      idx = (i + shots.length) % shots.length;
      const s = shots[idx], src = s.querySelector('img');
      img.src = src.currentSrc || src.src;
      img.alt = src.alt;
      const c = s.querySelector('figcaption');
      cap.innerHTML = (c ? c.innerHTML : '') + (multi ? `<span>${idx + 1} / ${shots.length}</span>` : '');
    }
    function open(i) { opener = document.activeElement; show(i); lb.classList.add('open'); document.documentElement.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); }
    function close() { lb.classList.remove('open'); document.documentElement.style.overflow = ''; if (opener) opener.focus(); }

    shots.forEach((s, i) => {
      s.tabIndex = 0;
      s.setAttribute('role', 'button');
      s.setAttribute('aria-label', '写真を拡大：' + (s.querySelector('img').alt || ''));
      s.addEventListener('click', () => open(i));
      s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
    lb.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft' && multi) show(idx - 1);
      if (e.key === 'ArrowRight' && multi) show(idx + 1);
    });
    // スマホ：左右にスワイプで切り替え
    let sx = null;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (sx === null || !multi) return;
      const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    });
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
