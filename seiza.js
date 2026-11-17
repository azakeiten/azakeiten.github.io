/* ================================================================
   seiza.js — 用語辞典：ことばの星座（近づいてから読みこむ）
   ・辞典の 300 語を、夜空の星にする。ある言葉の説明の中に、別の言葉が出てきたら、2 つの星を線で結ぶ
     （線は、このページの説明文から自動でつくる。新しい事実はつくらない）
   ・星の色は 11 の分類ごと。はじめは分類ごとに集まり、だんだん「つながり」で位置が決まっていく
   ・星を押すと、つながる星が星座のように光り、説明が出る。つながりの星へ、次々にとんでいける
   ・見た目は seiza.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-seiza]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="seiza.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'seiza.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 1000, H = 640;
  const HUE = [12, 42, 140, 200, 265, 330, 95, 25, 180, 300, 60];

  // ---- 辞典から、星（ことば）と線（つながり）をつくる ----
  const groups = [...document.querySelectorAll('.gl-group')];
  const N = [];
  groups.forEach((g, gi) => g.querySelectorAll('.gl-item').forEach(it => {
    const dt = it.querySelector('dt'), dd = it.querySelector('dd');
    if (!dt || !dd || !it.id) return;
    const full = dt.textContent.trim();
    const names = [full.split('（')[0]].concat((full.match(/（([^）]+)）/) || [, ''])[1].split(/[・、]/)).map(s => s.trim()).filter(s => s.length >= 2 && !/^[ぁ-ん]+$/.test(s));
    N.push({ id: it.id, name: full.split('（')[0].trim(), full, names, text: dd.textContent.trim(), show: dd.textContent.trim().replace(/\s*関連[^。]*$/, ''), g: gi, gname: (((g.querySelector('.gl-head') || {}).textContent || '').replace(/^\s*\d+/, '').replace(/\s*\d+\s*語.*$/, '')).trim(), deg: 0, x: 0, y: 0, vx: 0, vy: 0 });
  }));
  const E = [], seen = new Set();
  N.forEach((a, i) => N.forEach((b, j) => {
    if (i === j) return;
    if (b.names.some(nm => a.text.includes(nm))) { const k = i < j ? i + '-' + j : j + '-' + i; if (!seen.has(k)) { seen.add(k); E.push([i, j]); a.deg++; b.deg++; } }
  }));
  const nb = N.map(() => []); E.forEach(([i, j]) => { nb[i].push(j); nb[j].push(i); });
  const G = groups.length;
  // はじめの位置：分類ごとに、円の上へ
  N.forEach(n => { const a = n.g / G * Math.PI * 2, r = 230; n.x = W / 2 + Math.cos(a) * r + (Math.random() - .5) * 120; n.y = H / 2 + Math.sin(a) * r * .72 + (Math.random() - .5) * 90; });
  const center = gi => { const a = gi / G * Math.PI * 2; return [W / 2 + Math.cos(a) * 200, H / 2 + Math.sin(a) * 140]; };

  const rad = n => 2.2 + Math.min(7, Math.sqrt(n.deg) * 1.4);
  const top = N.map((n, i) => i).sort((a, b) => N[b].deg - N[a].deg);
  const TOPSET = new Set(top.slice(0, 22));

  box.innerHTML = `
    <div class="sz-sky">
      <svg class="sz-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="ことばの星座。300 の言葉が星になり、説明の中で出てくる言葉どうしが線で結ばれている">
        <defs><radialGradient id="sz-glow"><stop offset="0" stop-color="#fff6d0" stop-opacity=".9"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient></defs>
        <g class="sz-dust">${Array.from({ length: 120 }, (_, i) => `<circle cx="${(i * 389) % W}" cy="${(i * 211) % H}" r="${i % 7 ? .7 : 1.3}" style="animation-delay:-${(i * .29 % 4).toFixed(2)}s"/>`).join('')}</g>
        <g class="sz-view"><g class="sz-edges"></g><g class="sz-nodes"></g><g class="sz-labels"></g></g>
      </svg>
      <div class="sz-tools">
        <label class="sz-find"><span aria-hidden="true">探</span><input type="search" placeholder="ことばで星をさがす（例：金利）" aria-label="ことばで星をさがす" list="sz-list"><datalist id="sz-list">${N.map(n => `<option value="${n.name}">`).join('')}</datalist></label>
        <div class="sz-zoom"><button type="button" data-z="1" aria-label="近づく">＋</button><button type="button" data-z="-1" aria-label="はなれる">－</button><button type="button" data-a="all">全体</button><button type="button" data-a="rand">どこかの星へ</button></div>
      </div>
      <p class="sz-stat"><b>${N.length}</b> の星と <b>${E.length}</b> 本の線</p>
    </div>
    <div class="sz-card" aria-live="polite"></div>`;

  const svg = box.querySelector('.sz-svg'), view = box.querySelector('.sz-view'), gE = box.querySelector('.sz-edges'), gN = box.querySelector('.sz-nodes'), gL = box.querySelector('.sz-labels');
  const card = box.querySelector('.sz-card'), input = box.querySelector('.sz-find input');
  gE.innerHTML = E.map(() => '<line/>').join('');
  gN.innerHTML = N.map((n, i) => `<g class="sz-n" data-i="${i}" style="--h:${HUE[n.g % HUE.length]}" tabindex="0" role="button" aria-label="${n.name}"><g class="sz-ni"><circle class="sz-halo" r="${(rad(n) * 2.2).toFixed(1)}"/><circle class="sz-core" r="${rad(n).toFixed(1)}"/></g></g>`).join('');
  gL.innerHTML = N.map((n, i) => `<text class="sz-l${TOPSET.has(i) ? ' is-top' : ''}" data-i="${i}">${n.name}</text>`).join('');
  const lines = [...gE.children], nodes = [...gN.children], labels = [...gL.children];

  const draw = () => {
    E.forEach(([i, j], k) => { const l = lines[k]; l.setAttribute('x1', N[i].x.toFixed(1)); l.setAttribute('y1', N[i].y.toFixed(1)); l.setAttribute('x2', N[j].x.toFixed(1)); l.setAttribute('y2', N[j].y.toFixed(1)); });
    N.forEach((n, i) => { nodes[i].setAttribute('transform', `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`); labels[i].setAttribute('x', n.x.toFixed(1)); labels[i].setAttribute('y', (n.y - rad(n) - 5).toFixed(1)); });
  };
  // ---- 星が、つながりで位置を決めていく（ばねの計算） ----
  const step = () => {
    for (let i = 0; i < N.length; i++) {
      const a = N[i];
      for (let j = i + 1; j < N.length; j++) {
        const b = N[j]; let dx = a.x - b.x, dy = a.y - b.y; let d2 = dx * dx + dy * dy;
        if (d2 > 4900) continue; if (d2 < 1) { dx = Math.random(); dy = Math.random(); d2 = 1; }
        const f = 70 / d2; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
      }
      const [cx, cy] = center(a.g); const gk = a.deg ? .01 : .03; a.vx += (cx - a.x) * gk + (W / 2 - a.x) * .003; a.vy += (cy - a.y) * gk + (H / 2 - a.y) * .004;
    }
    E.forEach(([i, j]) => { const a = N[i], b = N[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, f = (d - 60) * .012; a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f; });
    N.forEach(n => { n.vx *= .82; n.vy *= .82; n.x = Math.max(30, Math.min(W - 30, n.x + Math.max(-8, Math.min(8, n.vx)))); n.y = Math.max(40, Math.min(H - 30, n.y + Math.max(-8, Math.min(8, n.vy)))); });
  };
  let iter = 0;
  const settle = () => { for (let k = 0; k < (reduce ? 260 : 6); k++) { step(); iter++; } draw(); if (iter < 260) requestAnimationFrame(settle); else box.classList.add('is-settled'); };
  draw(); requestAnimationFrame(settle);

  // ---- 見る範囲（近づく・はなれる・ドラッグで動かす） ----
  let vb = { x: 0, y: 0, w: W, h: H };
  const setVB = (smooth) => { svg.classList.toggle('is-smooth', !!smooth && !reduce); svg.setAttribute('viewBox', `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`); box.style.setProperty('--zs', (W / vb.w).toFixed(2)); };
  const focus = (n, z) => { const w = W / z, h = H / z; vb = { x: n.x - w / 2, y: n.y - h / 2, w, h }; animVB(); };
  let animT = 0;
  const animVB = () => {
    const from = svg.getAttribute('viewBox').split(' ').map(Number), to = [vb.x, vb.y, vb.w, vb.h];
    if (reduce) { setVB(); return; }
    const t0 = performance.now(); cancelAnimationFrame(animT);
    const f = now => { const k = Math.min(1, (now - t0) / 600), e = 1 - Math.pow(1 - k, 3); const v = from.map((a, i) => a + (to[i] - a) * e); svg.setAttribute('viewBox', v.map(x => x.toFixed(1)).join(' ')); box.style.setProperty('--zs', (W / v[2]).toFixed(2)); if (k < 1) animT = requestAnimationFrame(f); };
    animT = requestAnimationFrame(f);
  };
  let drag = null;
  svg.addEventListener('pointerdown', e => { if (e.target.closest('.sz-n')) return; const r = svg.getBoundingClientRect(); drag = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y, k: vb.w / r.width }; svg.setPointerCapture(e.pointerId); svg.classList.add('is-drag'); });
  svg.addEventListener('pointermove', e => { if (!drag) return; vb.x = drag.vx - (e.clientX - drag.x) * drag.k; vb.y = drag.vy - (e.clientY - drag.y) * drag.k; setVB(); });
  const end = () => { drag = null; svg.classList.remove('is-drag'); };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);

  // ---- 星をえらぶ ----
  let cur = -1;
  const pick = (i, zoom) => {
    cur = i; const n = N[i], ns = new Set(nb[i]);
    box.classList.add('has-pick');
    nodes.forEach((el, k) => { el.classList.toggle('is-pick', k === i); el.classList.toggle('is-nb', ns.has(k)); });
    labels.forEach((el, k) => { el.classList.toggle('is-show', k === i || ns.has(k)); el.classList.toggle('is-pick', k === i); });
    E.forEach(([a, b], k) => lines[k].classList.toggle('is-on', a === i || b === i));
    const list = nb[i].map(k => N[k]).sort((a, b) => b.deg - a.deg);
    card.innerHTML = `<div class="sz-c-h"><span class="sz-c-s" style="--h:${HUE[n.g % HUE.length]}">${String(n.g + 1).padStart(2, '0')}</span><div><p class="sz-c-g">${n.gname}</p><p class="sz-c-n">${n.full}</p></div><a class="sz-c-go" href="#${n.id}">辞典で読む<i aria-hidden="true">→</i></a></div>
      <p class="sz-c-t">${n.show.length > 150 ? n.show.slice(0, 150) + '…' : n.show}</p>
      <p class="sz-c-k">つながる星 <b>${list.length}</b>${list.length ? '' : '（まだ、ほかの言葉とつながっていない星です）'}</p>
      <div class="sz-c-nb">${list.slice(0, 18).map(m => `<button type="button" data-go="${N.indexOf(m)}" style="--h:${HUE[m.g % HUE.length]}">${m.name}</button>`).join('')}${list.length > 18 ? `<span>ほか ${list.length - 18}</span>` : ''}</div>`;
    card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
    if (zoom !== false) focus(n, 2.4);
    try { const s = JSON.parse(localStorage.getItem('azakei_seiza') || '[]'); if (!s.includes(n.id)) { s.push(n.id); localStorage.setItem('azakei_seiza', JSON.stringify(s.slice(-300))); } } catch (e) {}
  };
  const intro = () => {
    box.classList.remove('has-pick'); cur = -1;
    nodes.forEach(el => el.classList.remove('is-pick', 'is-nb')); labels.forEach(el => el.classList.remove('is-show', 'is-pick')); lines.forEach(l => l.classList.remove('is-on'));
    card.innerHTML = `<p class="sz-c-n">つながりの多いことば</p><p class="sz-c-t">説明の中で、ほかの言葉といちばん多く結ばれている星です。押すと、その星座が光ります。</p><div class="sz-c-nb">${top.slice(0, 10).map(i => `<button type="button" data-go="${i}" style="--h:${HUE[N[i].g % HUE.length]}">${N[i].name}<small>${N[i].deg}</small></button>`).join('')}</div>`;
    card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
  };
  box.addEventListener('click', e => {
    const n = e.target.closest('.sz-n'); if (n) { pick(+n.dataset.i); return; }
    const go = e.target.closest('[data-go]'); if (go) { pick(+go.dataset.go); return; }
    const z = e.target.closest('[data-z]');
    if (z) { const k = +z.dataset.z > 0 ? .7 : 1 / .7; const cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2; vb.w = Math.max(W / 6, Math.min(W, vb.w * k)); vb.h = vb.w * H / W; vb.x = cx - vb.w / 2; vb.y = cy - vb.h / 2; animVB(); return; }
    const a = e.target.closest('[data-a]');
    if (a && a.dataset.a === 'all') { vb = { x: 0, y: 0, w: W, h: H }; animVB(); intro(); }
    if (a && a.dataset.a === 'rand') pick(Math.floor(Math.random() * N.length));
  });
  box.addEventListener('keydown', e => { const n = e.target.closest('.sz-n'); if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(+n.dataset.i); } });
  box.addEventListener('pointerover', e => { const n = e.target.closest('.sz-n'); if (n) labels[+n.dataset.i].classList.add('is-hover'); });
  box.addEventListener('pointerout', e => { const n = e.target.closest('.sz-n'); if (n) labels[+n.dataset.i].classList.remove('is-hover'); });
  input.addEventListener('change', () => { const q = input.value.trim(); if (!q) return; const i = N.findIndex(n => n.names.includes(q) || n.name === q); const j = i >= 0 ? i : N.findIndex(n => n.full.includes(q)); if (j >= 0) pick(j); });
  intro();
})();
