/* ================================================================
   site.js — 全ページ共通の演出（もとは fx.js・v9.js・v12.js の 3 ファイル）
   読みこむ順番はそのまま。1 つの部分でエラーが出ても、ほかの部分は止まらないように
   それぞれを try で包んでいます。
   ================================================================ */

/* ######## ▼ fx.js ######## */
try {
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

} catch (e) { console.error('[site.js / fx]', e); }

/* ######## ▼ v9.js ######## */
try {
/* ================================================================
   v9.js — ロゴの「光」をサイト全体に
   1. トップの写真の上で、ロゴの角と同じ形の光がまたたく
   2. 下層ページの見出しの右に、ゆっくり回るロゴの星（線画）
   3. カードにアイコン（サイトの目次と同じアイコン）
   ================================================================ */
(function() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. トップの写真にまたたく光 ---- */
  const hero = document.querySelector('.hero');
  if (hero && !reduce) {
    const cv = document.createElement('canvas');
    cv.className = 'hero-sparkles';
    cv.setAttribute('aria-hidden', 'true');
    hero.appendChild(cv);
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, stars = [];
    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      const n = Math.round(Math.min(46, W * H / 26000));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H * 0.72,
        r: 2 + Math.random() * 4.5, p: Math.random() * Math.PI * 2,
        s: 0.6 + Math.random() * 1.4, gold: Math.random() < 0.55
      }));
    }
    function spark(x, y, r, a, gold) {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = a;
      ctx.shadowBlur = r * 3;
      ctx.shadowColor = gold ? 'rgba(255, 214, 120, 0.9)' : 'rgba(150, 255, 160, 0.85)';
      ctx.fillStyle = gold ? '#fff3cf' : '#eaffea';
      ctx.beginPath();
      ctx.moveTo(0, -r * 2);
      ctx.quadraticCurveTo(0, 0, r * 2, 0);
      ctx.quadraticCurveTo(0, 0, 0, r * 2);
      ctx.quadraticCurveTo(0, 0, -r * 2, 0);
      ctx.quadraticCurveTo(0, 0, 0, -r * 2);
      ctx.fill();
      ctx.restore();
    }
    let visible = true;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(hero);
    function frame(t) {
      if (visible && !document.hidden) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        for (const s of stars) {
          const v = Math.sin(t / 1000 * s.s + s.p);
          if (v > 0.15) spark(s.x, s.y, s.r * (0.55 + v * 0.45), Math.pow(v, 1.6) * 0.9, s.gold);
        }
      }
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(frame);
  }

  /* ---- 2. 下層ページの見出しに、ゆっくり回るロゴの星 ---- */
  const ph = document.querySelector('.page-hero');
  if (ph && !ph.querySelector('.tate, .en-emblem')) {
    const pt = (deg, r) => { const a = deg * Math.PI / 180; return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]; };
    const R = 88, RIN = R / Math.sqrt(3);
    const up = [0, 120, 240].map(d => pt(-90 + d, R)).map(p => p.join(',')).join(' ');
    const dn = [0, 120, 240].map(d => pt(90 + d, R)).map(p => p.join(',')).join(' ');
    const hex = [0, 1, 2, 3, 4, 5].map(k => pt(-60 + 60 * k, RIN).join(',')).join(' ');
    const sparks = [0, 1, 2, 3, 4, 5].map(k => { const [x, y] = pt(-90 + 60 * k, R); return `<path style="--i:${k}" d="M${x},${y - 7}Q${x},${y} ${x + 7},${y}Q${x},${y} ${x},${y + 7}Q${x},${y} ${x - 7},${y}Q${x},${y} ${x},${y - 7}Z"/>`; }).join('');
    ph.insertAdjacentHTML('beforeend', `
      <svg class="ph-star" viewBox="0 0 200 200" aria-hidden="true">
        <g class="ph-star-spin"><polygon points="${up}"/><polygon points="${dn}"/><polygon class="ph-hex" points="${hex}"/></g>
        <g class="ph-star-sparks">${sparks}</g>
      </svg>`);
  }

  /* ---- 3. カードにアイコン ---- */
  const ICONS = window.AZAKEI_ICONS || {};
  const svg = d => `<svg class="card-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  document.querySelectorAll('a.link-card[href]').forEach(a => {
    const key = a.getAttribute('href').split('#')[0];
    const num = a.querySelector('.num');
    if (ICONS[key] && num && !num.querySelector('.card-ico')) num.insertAdjacentHTML('afterbegin', svg(ICONS[key]));
  });
  const CONTEST = {
    business: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z',
    stockleague: 'M4 19h16M6 16l4-5 3 3 5-7M18 7h-3M18 7v3',
    audition: 'M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v4',
    paper: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 15h5M10 18h3'
  };
  document.querySelectorAll('.contest[id]').forEach(c => {
    const num = c.querySelector('.contest-num');
    if (CONTEST[c.id] && num && !num.querySelector('.card-ico')) num.insertAdjacentHTML('beforeend', svg(CONTEST[c.id]));
  });
})();

/* 写真：読みこめたら、ふわっと表示する */
(function() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete && img.naturalWidth) return;
    img.classList.add('img-wait');
    const done = () => img.classList.add('img-in');
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });
})();

} catch (e) { console.error('[site.js / v9]', e); }

/* ######## ▼ v12.js ######## */
try {
/* ================================================================
   v12.js — 黒板の地図・見出しの写真・大波・印の幕・来場者グラフ・手ざわり
   ================================================================ */
(function() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const page = location.pathname.split('/').pop() || 'index.html';

  /* ---- ① 黒板のマインドマップ：チョークの線をつなぐ ---- */
  const board = document.querySelector('[data-mindmap]');
  if (board) {
    const svg = board.querySelector('.mm-lines');
    svg.innerHTML = '<defs><filter id="mm-chalk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter></defs><g></g>';
    const g = svg.querySelector('g');
    const core = board.querySelector('[data-mm="core"]');
    // 2 点のあいだを、手描きっぽく少しふくらんだ曲線で
    const curve = (a, b, bend) => {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
      const cx = mx - dy / len * bend, cy = my + dx / len * bend;
      return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    };
    // 箱のふちの、相手に近い点
    const edge = (r, toward, pad) => {
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = toward.x - cx, dy = toward.y - cy;
      const sx = (r.width / 2 + pad) / Math.abs(dx || 1e-6), sy = (r.height / 2 + pad) / Math.abs(dy || 1e-6);
      const s = Math.min(sx, sy);
      return { x: cx + dx * s, y: cy + dy * s };
    };
    const center = r => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    function draw() {
      const B = board.getBoundingClientRect();
      const rel = r => ({ left: r.left - B.left, top: r.top - B.top, width: r.width, height: r.height });
      const C = rel(core.getBoundingClientRect());
      const narrow = innerWidth <= 860;
      let html = '', i = 0;
      board.querySelectorAll('.mm-node').forEach((node, bi) => {
        const N = rel(node.getBoundingClientRect());
        let a, b;
        if (narrow) {   // スマホ：中心から左の幹を下ろし、各枝へ
          const tx = 22, cy = C.top + C.height / 2;
          b = { x: N.left - 2, y: N.top + N.height / 2 };
          html += `<path class="mm-main" d="M${C.left} ${cy} C${tx} ${cy} ${tx} ${cy} ${tx} ${cy + 30} L${tx} ${b.y - 18} Q${tx} ${b.y} ${b.x} ${b.y}" style="--d:${0.1 + bi * 0.15}s"/>`;
        } else {
          a = edge(C, center(N), 0); b = edge(N, center(C), 4);
          html += `<path class="mm-main" d="${curve(a, b, (bi % 2 ? 1 : -1) * 18)}" style="--d:${0.1 + bi * 0.15}s"/>`;
        }
        const key = node.dataset.mm;
        const leaves = [...board.querySelectorAll(`[data-mm-parent="${key}"]`)];
        leaves.forEach((leaf, li) => {
          return;   // 枝から札への線はなし（札が近いので幹だけで十分）
          const L = rel(leaf.getBoundingClientRect());
          const p = narrow ? { x: N.left + 12, y: N.top + N.height } : edge(N, center(L), 0);
          const q = narrow ? { x: L.left + 10, y: L.top } : edge(L, center(N), 2);
          if (narrow && li > 0) return;   // スマホは枝ごとに 1 本だけ
          html += `<path d="${curve(p, q, (li % 2 ? 1 : -1) * 8)}" style="--d:${0.7 + bi * 0.15 + li * 0.08}s"/>`;
          i++;
        });
      });
      g.innerHTML = html;
      g.querySelectorAll('path').forEach(p => { const L = Math.ceil(p.getTotalLength()) + 2; p.style.setProperty('--len', L); p.style.strokeDasharray = L; });
    }
    draw();
    new ResizeObserver(draw).observe(board);
    if (document.fonts) document.fonts.ready.then(draw);
    if (reduce || !('IntersectionObserver' in window)) board.classList.add('is-drawn');
    else new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { board.classList.add('is-drawn'); io.disconnect(); } }), { threshold: 0.25 }).observe(board);
  }

  /* ---- ④ 下層ページの見出しに写真 ---- */
  const PHOTO = {
    'about.html': 'members.jpg', 'activities.html': 'photos/setup.jpg', 'contests.html': 'photos/star-bills.jpg',
    'events.html': 'photos/balloons.jpg', 'festival.html': 'photos/hallway-wave.jpg', 'vote.html': 'photos/hallway-game.jpg',
    'sponsor.html': 'photos/room-paper.jpg', 'contact.html': 'photos/star-door.jpg', 'diagnosis.html': 'photos/room-diagnosis.jpg',
    'en-diagnosis.html': 'photos/room-diagnosis.jpg', 'quiz.html': 'photos/board-millionaire.jpg', 'sim.html': 'photos/board-special.jpg', 'glossary.html': 'photos/rules-posters.jpg', '404.html': 'photos/entrance.jpg'
  };
  const hero = document.querySelector('.page-hero');
  if (hero && PHOTO[page] && !hero.classList.contains('en-hero')) {
    const ph = document.createElement('div');
    ph.className = 'ph-photo'; ph.setAttribute('aria-hidden', 'true');
    ph.innerHTML = `<img src="${PHOTO[page]}" alt="" decoding="async" fetchpriority="low">`;
    hero.prepend(ph);
    hero.classList.add('has-photo');
  }

  /* ---- ② 大波の帯：見出しの下と、フッターの上 ---- */
  if (hero) hero.insertAdjacentHTML('beforeend', '<div class="wave-band" aria-hidden="true"></div>');
  const footer = document.getElementById('site-footer') || document.querySelector('footer');
  if (footer) footer.insertAdjacentHTML('beforebegin', '<div class="wave-band is-footer" aria-hidden="true"></div>');

  /* ---- ③ ページ移動の幕に「麻経」の印 ---- */
  const curtain = document.querySelector('.curtain');
  if (curtain && !curtain.querySelector('.curtain-seal')) curtain.innerHTML = '<span class="curtain-inner">AZAKEI<span class="curtain-seal">麻経</span></span>';

  /* ---- ⑥ 来場者のグラフ ---- */
  const vz = document.querySelector('[data-visitors]');
  const V = window.AZAKEI && window.AZAKEI.visitors;
  if (vz && V) {
    const fmt = n => n.toLocaleString('ja-JP');
    const known = V.days.every(d => typeof d === 'number');
    let rows;
    if (known) {
      const max = Math.max(...V.days);
      rows = V.days.map((d, i) => ({ label: `${i + 1} 日目`, n: d, w: d / max * 100, peak: d === max }));
    } else {
      // 1 日目・3 日目の内訳がまだないときは、2 日目とそれ以外で見せる
      const peak = V.days[1], rest = V.total - peak, max = Math.max(peak, rest);
      rows = [{ label: '2 日目', n: peak, w: peak / max * 100, peak: true }, { label: '1・3 日目', n: rest, w: rest / max * 100 }];
    }
    vz.innerHTML = `
      <p class="section-label">Visitors</p>
      <h3>3 日間の来場者</h3>
      <p class="vz-total"><span data-count>${fmt(V.total)}</span><small>人</small></p>
      <div class="vz-bars">${rows.map(r => `<div class="vz-row${r.peak ? ' is-peak' : ''}"><span>${r.label}</span><span class="vz-track"><span class="vz-fill" style="--w:${r.w.toFixed(1)}%"></span></span><span>${fmt(r.n)} 人</span></div>`).join('')}</div>
      <p class="vz-note">${known ? 'いちばん多かった日を緑で示しています。' : `2 日目だけで、全体の約 ${Math.round(V.days[1] / V.total * 100)}％ の方が来てくださいました。`}</p>`;
    if (reduce || !('IntersectionObserver' in window)) vz.classList.add('is-in');
    else new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { vz.classList.add('is-in'); io.disconnect(); } }), { threshold: 0.4 }).observe(vz);
  }

  /* ---- ⑦ 手ざわり：カードのふちが光る・写真が少し傾く（マウスのときだけ） ---- */
  if (!fine || reduce) return;
  const SPOT = '.service-card, .dg-promo, .contest, .diary-item, .fx-rule, .number, .value, .en-contests article, .event-item';
  document.querySelectorAll(SPOT).forEach(el => {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.classList.add('has-spot');
    el.insertAdjacentHTML('afterbegin', '<span class="spot" aria-hidden="true"></span>');
  });
  document.addEventListener('pointermove', e => {
    const el = e.target.closest && e.target.closest('.has-spot');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
  document.querySelectorAll('.gallery-item, .fx-photos figure, .fx-record-photo, .about-image').forEach(el => {
    el.classList.add('tilt');
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();

/* ---- トップ：右はしの「いまどこ？」の点 ---- */
(function() {
  if (!document.querySelector('.hero')) return;
  const secs = [...document.querySelectorAll('main section, body > section, .hero-sticky-wrap ~ section')]
    .filter((s, i, a) => a.indexOf(s) === i && s.querySelector(':scope .section-label') && !s.closest('.hero'));
  if (secs.length < 3) return;
  const nav = document.createElement('ul');
  nav.className = 'chapters is-hidden'; nav.setAttribute('aria-label', 'このページの目次');
  secs.forEach((s, i) => {
    if (!s.id) s.id = 'sec-' + (i + 1);
    const label = s.querySelector('.section-label').textContent.trim();
    nav.insertAdjacentHTML('beforeend', `<li><a href="#${s.id}"><span>${label}</span><i></i></a></li>`);
  });
  document.body.appendChild(nav);
  const links = [...nav.querySelectorAll('a')];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const i = secs.indexOf(e.target);
    links.forEach((a, j) => a.classList.toggle('is-on', i === j));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => io.observe(s));
  // ヒーローの間とフッター付近では隠す
  const onScroll = () => {
    const first = secs[0].getBoundingClientRect().top, last = secs[secs.length - 1].getBoundingClientRect().bottom;
    nav.classList.toggle('is-hidden', first > innerHeight * 0.6 || last < innerHeight * 0.3);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  // 点を押したら、幕を出さずにその場所へ
  nav.addEventListener('click', e => { e.stopPropagation(); }, true);
})();

/* ================================================================
   v13 — カウントダウン・伸びる年表・雑誌のような写真・次のページへ
   ================================================================ */
(function() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page = location.pathname.split('/').pop() || 'index.html';

  /* ---- 文化祭までのカウントダウン ---- */
  const cd = document.querySelector('[data-countdown]');
  if (cd) {
    const target = new Date(cd.dataset.countdown).getTime();
    const en = document.documentElement.lang === 'en';
    const L = en
      ? { u: ['days', 'hours', 'min', 'sec'], foot: 'Until opening day, May 1, 2027 (dates are provisional)', more: 'About the exhibition →' }
      : { u: ['日', '時間', '分', '秒'], foot: '2027 年 5 月 1 日の開幕日まで（日程は予定です）', more: '展示の内容を見る →' };
    cd.innerHTML = `
      <div class="cd-head"><p>Next Festival</p><h2>${cd.dataset.title}</h2></div>
      <div class="cd-digits" role="timer" aria-live="off">
        <div class="cd-unit"><b data-u="d">0</b><small>${L.u[0]}</small></div>
        <div class="cd-unit"><b data-u="h">00</b><small>${L.u[1]}</small></div>
        <div class="cd-unit"><b data-u="m">00</b><small>${L.u[2]}</small></div>
        <div class="cd-unit"><b data-u="s">00</b><small>${L.u[3]}</small></div>
      </div>
      <div class="cd-foot"><span>${L.foot}</span><a href="${cd.dataset.href}">${L.more}</a></div>`;
    const els = Object.fromEntries([...cd.querySelectorAll('[data-u]')].map(b => [b.dataset.u, b]));
    const pad = n => String(n).padStart(2, '0');
    let timer;
    const tick = () => {
      const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const v = { d: String(Math.floor(s / 86400)), h: pad(Math.floor(s % 86400 / 3600)), m: pad(Math.floor(s % 3600 / 60)), s: pad(s % 60) };
      for (const k in v) if (els[k].textContent !== v[k]) {
        els[k].textContent = v[k];
        if (!reduce) { els[k].classList.remove('tick'); void els[k].offsetWidth; els[k].classList.add('tick'); }
      }
      if (s === 0) { cd.querySelector('.cd-head p').textContent = 'Now'; clearInterval(timer); }
    };
    tick();
    timer = setInterval(tick, 1000);
    // 同じ予定の「あと○日」は、カウントダウンと重なるので消す
    const day = cd.dataset.countdown.slice(0, 10).replace(/-/g, '.');
    document.querySelectorAll('.event-row:not(.is-past)').forEach(row => {
      if (row.querySelector('.event-when') && row.querySelector('.event-when').textContent.includes(day)) row.querySelectorAll('.event-countdown:not(.is-now)').forEach(b => b.remove());
    });
    cd.setAttribute('aria-label', en ? `${els.d.textContent} days until ${cd.dataset.title}` : `${cd.dataset.title}まで、あと ${els.d.textContent} 日`);
  }

  /* ---- 年表：スクロールに合わせて金の線が伸びる ---- */
  const tl = document.querySelector('.timeline-wrap');
  if (tl) {
    const fill = document.createElement('span');
    fill.className = 'tl-fill'; fill.setAttribute('aria-hidden', 'true');
    tl.appendChild(fill);
    const update = () => {
      const r = tl.getBoundingClientRect();
      const line = reduce ? r.height : Math.max(0, Math.min(r.height, innerHeight * 0.6 - r.top));
      fill.style.setProperty('--tl', line + 'px');
      tl.querySelectorAll('.event-row').forEach(row => row.classList.toggle('is-lit', row.getBoundingClientRect().top - r.top + 40 <= line));
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  }

  /* ---- 活動風景：雑誌のような並び ---- */
  if (page === 'activities.html') document.querySelectorAll('.gallery').forEach(g => g.classList.add('is-mag'));

  /* ---- 各ページの最後：写真つきで次のページへ ---- */
  const ORDER = [
    ['about.html', '麻経とは', 'AZAKEI の成り立ちと、これから。', 'members.jpg'],
    ['festival.html', '文化祭「麻布経済展」', '経済とエンタメが交差する、体験型展示。', 'photos/hallway-wave.jpg'],
    ['contests.html', '各種コンテスト', '学校の外で、自分たちの力を試す。', 'photos/star-bills.jpg'],
    ['activities.html', '活動風景・日常', 'ミーティングから放課後まで。', 'photos/setup.jpg'],
    ['events.html', '日程・イベント', 'これからの予定と、これまでの歩み。', 'photos/balloons.jpg'],
    ['quiz.html', '億万長者クイズ', 'チップを賭けて、億万長者を目指せ。', 'photos/board-millionaire.jpg'],
    ['sim.html', 'チップ配分シミュレーター', '株・債券・預金に分けて、10 年後へ早送り。', 'photos/board-special.jpg'],
    ['diagnosis.html', 'エコノミスト診断', 'YES / NO で、あなたの投資家タイプがわかる。', 'photos/room-diagnosis.jpg'],
    ['glossary.html', '経済用語ミニ辞典', '経済の言葉を、やさしく。', 'photos/rules-posters.jpg'],
    ['vote.html', '文化祭投票', '来年どんな展示が見たい？', 'photos/hallway-game.jpg'],
    ['sponsor.html', '協賛のご案内', '企業・団体の皆さまへ。', 'photos/room-paper.jpg'],
    ['contact.html', 'お問い合わせ', 'フォーム、または Instagram の DM から。', 'photos/star-door.jpg']
  ];
  const i = ORDER.findIndex(o => o[0] === page);
  const foot = document.querySelector('.wave-band.is-footer') || document.getElementById('site-footer');
  if (i >= 0 && foot) {
    const [href, ja, desc, img] = ORDER[(i + 1) % ORDER.length];
    foot.insertAdjacentHTML('beforebegin', `
      <a class="next-page" href="${href}">
        <img src="${img}" alt="" loading="lazy" decoding="async">
        <div class="container">
          <small>Next page</small>
          <b>${ja}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M3 12h17M14 5l7 7-7 7"/></svg></b>
          <span class="np-desc">${desc}</span>
        </div>
      </a>`);
  }
})();

/* ---- v14：縦書きの合言葉を、一文字ずつ ---- */
(function() {
  const box = document.querySelector('[data-motto]');
  if (!box) return;
  const sec = box.closest('.motto');
  const text = box.querySelector('.motto-text');
  text.setAttribute('aria-label', text.textContent);
  let i = 0;
  text.querySelectorAll(':scope > span').forEach(line => {
    line.setAttribute('aria-hidden', 'true');
    line.innerHTML = [...line.textContent].map(c => `<span class="mc" style="--i:${i++}">${c}</span>`).join('');
  });
  if (!('IntersectionObserver' in window)) { sec.classList.add('is-in'); return; }
  new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { sec.classList.add('is-in'); io.disconnect(); } }), { threshold: 0.35 }).observe(sec);
})();

/* ---- オフライン対応（ホーム画面に追加したとき用） ---- */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}

/* ---- v16：文化祭「3 日間の物語」 ---- */
(function() {
  const grid = document.querySelector('[data-story]');
  if (!grid) return;
  const imgs = [...grid.querySelectorAll('.story-media img')];
  const steps = [...grid.querySelectorAll('.story-steps li')];
  const count = grid.querySelector('.story-count b');
  // 次の写真を先に読みこんでおく
  imgs.forEach(i => { i.loading = 'eager'; });
  let cur = 0;
  const set = n => {
    if (n === cur || n < 0) return;
    cur = n;
    imgs.forEach((im, i) => im.classList.toggle('is-on', i === n));
    steps.forEach((s, i) => s.classList.toggle('is-on', i === n));
    if (count) count.textContent = String(n + 1).padStart(2, '0');
  };
  if (!('IntersectionObserver' in window)) { steps.forEach(s => s.classList.add('is-on')); return; }
  // スマホは写真が上に留まるので、画面の下のほうに来た場面を「いま」にする
  const narrow = matchMedia('(max-width: 860px)').matches;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(steps.indexOf(e.target)); }), { rootMargin: narrow ? '-72% 0px -22% 0px' : '-45% 0px -45% 0px' });
  steps.forEach(s => io.observe(s));
})();

/* ---- v17：投票「いまの結果」カード（円グラフと 1 位） ---- */
(function() {
  const box = document.querySelector('[data-vote-summary]');
  if (!box) return;
  const COLORS = ['#c8a96e', '#3c8a37', '#7d6131', '#6fae5f', '#e3c98f', '#2c5a37', '#a8875a'];
  document.addEventListener('azakei:votes', e => {
    const { total, mine, items } = e.detail;
    if (!total) { box.hidden = true; return; }
    const sorted = items.slice().sort((a, b) => b.n - a.n);
    const top = sorted[0];
    const ties = sorted.filter(x => x.n === top.n);
    const R = 52, C = 2 * Math.PI * R;
    let off = 0;
    const arcs = items.map((it, i) => {
      if (!it.n) return '';
      const len = it.n / total * C;
      const s = `<circle r="${R}" cx="60" cy="60" fill="none" stroke="${COLORS[i % COLORS.length]}" stroke-width="16" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 60 60)"><title>${it.label} ${it.n} 票</title></circle>`;
      off += len;
      return s;
    }).join('');
    const pct = n => Math.round(n / total * 100);
    box.innerHTML = `
      <svg class="vs-ring" viewBox="0 0 120 120" role="img" aria-label="投票の割合">${arcs}<text x="60" y="58" text-anchor="middle" class="vs-ring-n">${total}</text><text x="60" y="76" text-anchor="middle" class="vs-ring-u">票</text></svg>
      <div class="vs-main">
        <p class="vs-kicker"><span class="vs-live"></span>いまの 1 位</p>
        <p class="vs-top">${ties.length > 1 ? ties.map(t => t.label).join(' と ') + '<small>が同票</small>' : top.label}<b>${pct(top.n)}<small>%</small></b></p>
        <ul class="vs-legend">${items.map((it, i) => `<li${it.key === mine ? ' class="is-mine"' : ''}><i style="background:${COLORS[i % COLORS.length]}"></i>${it.label}<span>${pct(it.n)}%</span></li>`).join('')}</ul>
      </div>`;
    box.hidden = false;
  });
})();

/* ---- v17：トップへ戻るボタンに、読んだ量の金の輪 ---- */
(function() {
  const btn = document.querySelector('.to-top');
  if (!btn || btn.querySelector('.tt-ring')) return;
  btn.insertAdjacentHTML('afterbegin', '<svg class="tt-ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" pathLength="100"/></svg>');
  const ring = btn.querySelector('.tt-ring circle');
  const upd = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    ring.style.strokeDashoffset = String(100 - (h > 0 ? Math.min(100, scrollY / h * 100) : 0));
  };
  addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
})();

/* ---- v18：コンテスト「取り組み」を流れ図に、「身につく力」をタグに ---- */
(function() {
  document.querySelectorAll('.contest').forEach(c => { const n = c.querySelector('.contest-num'); if (n) c.dataset.num = n.textContent.trim().slice(0, 2); });
  document.querySelectorAll('.contest dl').forEach(dl => {
    [...dl.querySelectorAll('dt')].forEach(dt => {
      const dd = dt.nextElementSibling;
      if (!dd || dd.tagName !== 'DD' || dd.dataset.done) return;
      const label = dt.textContent.trim();
      const text = dd.textContent.trim();
      if (label === '取り組み' && text.includes('→')) {
        const steps = text.split('→').map(s => s.trim()).filter(Boolean);
        dd.setAttribute('aria-label', text);
        dd.innerHTML = `<ol class="ct-flow">${steps.map((s, i) => `<li style="--i:${i}"><span>${String(i + 1).padStart(2, '0')}</span>${s}</li>`).join('')}</ol>`;
      } else if (label === '身につく力' && text.includes('、')) {
        dd.innerHTML = `<ul class="ct-skills">${text.split('、').map(s => `<li>${s.trim()}</li>`).join('')}</ul>`;
      }
      dd.dataset.done = '1';
    });
  });
})();

/* ---- v19：スマホ用クイックドック（画面の下。下へスクロール中は隠れ、上へ戻すと出る） ---- */
(function() {
  if (document.documentElement.lang === 'en' || !document.getElementById('site-footer')) return;
  const here = location.pathname.split('/').pop() || 'index.html';
  const I = window.AZAKEI_ICONS || {};
  const items = [
    ['index.html', 'ホーム', I['index.html']],
    ['quiz.html', 'クイズ', I['quiz.html']],
    ['diagnosis.html', '診断', I['diagnosis.html']],
    ['vote.html', '投票', I['vote.html']]
  ];
  const ico = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d || ''}"/></svg>`;
  const dock = document.createElement('div');   // nav 要素だとサイト全体の nav の見た目が付いてしまうので div に
  dock.className = 'dock'; dock.setAttribute('role', 'navigation'); dock.setAttribute('aria-label', 'よく使うページ');
  dock.innerHTML = items.map(([href, label, d]) => `<a href="${href}"${href === here ? ' aria-current="page" class="is-here"' : ''}>${ico(d)}<span>${label}</span></a>`).join('') +
    `<button type="button" class="dock-menu" aria-label="サイトの目次を開く">${ico('M4 7h16M4 12h16M4 17h10')}<span>目次</span></button>`;
  document.body.appendChild(dock);
  document.body.classList.add('has-dock');
  dock.querySelector('.dock-menu').addEventListener('click', () => { const h = document.getElementById('hamburger') || document.querySelector('.hamburger'); if (h) h.click(); });
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY, down = y > lastY + 6, up = y < lastY - 6;
    if (down && y > 160) dock.classList.add('is-hidden');
    else if (up || y < 40) dock.classList.remove('is-hidden');
    if (Math.abs(y - lastY) > 6) lastY = y;
    // ページの最後まで来たら出す（フッターのリンクと重ならないよう、少し透明に）
    if (innerHeight + y >= document.documentElement.scrollHeight - 4) dock.classList.remove('is-hidden');
  }, { passive: true });
})();

} catch (e) { console.error('[site.js / v12]', e); }

/* ######## ▼ 文字の大きさの切りかえ（フッター） ######## */
try {
(function() {
  const html = document.documentElement;
  const sync = () => document.querySelectorAll(".fs-switch button").forEach(b => b.setAttribute("aria-pressed", String((html.dataset.fs || "") === b.dataset.fs)));
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest(".fs-switch button");
    if (!b) return;
    if (b.dataset.fs) html.dataset.fs = b.dataset.fs; else delete html.dataset.fs;
    try { if (b.dataset.fs) localStorage.setItem("azakei-fs", b.dataset.fs); else localStorage.removeItem("azakei-fs"); } catch (err) {}
    sync();
    dispatchEvent(new Event("resize"));
  });
  sync();
})();
} catch (e) { console.error("[site.js / fs]", e); }
