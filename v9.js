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
