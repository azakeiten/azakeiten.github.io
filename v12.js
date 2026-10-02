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
    'en-diagnosis.html': 'photos/room-diagnosis.jpg', 'quiz.html': 'photos/board-millionaire.jpg', '404.html': 'photos/entrance.jpg'
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
