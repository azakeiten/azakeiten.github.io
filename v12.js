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
    ['diagnosis.html', 'エコノミスト診断', 'YES / NO で、あなたの投資家タイプがわかる。', 'photos/room-diagnosis.jpg'],
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
