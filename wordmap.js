/* ================================================================
   wordmap.js — 用語辞典：ことばの地図（「地図をひらく」を押したときだけ読みこむ）
   ・つながりは、辞典の「関連」リンク（glossary.js が説明文から作るもの）をそのまま使う
   ・まん中の言葉のまわりに、つながる言葉が輪になって並ぶ。押すと、その言葉がまん中へ
   ================================================================ */
(function() {
  const box = document.querySelector('[data-wordmap]');
  const items = [...document.querySelectorAll('.gl-item')];
  if (!box || !items.length) return;
  // つながり（向きなし）
  const adj = new Map(items.map(it => [it.id, new Set()]));
  items.forEach(it => it.querySelectorAll('.gl-rel a').forEach(a => {
    const to = a.getAttribute('href').slice(1);
    if (adj.has(to) && to !== it.id) { adj.get(it.id).add(to); adj.get(to).add(it.id); }
  }));
  const byId = id => document.getElementById(id);
  const label = id => byId(id).querySelector('dt').textContent.replace(/（.*?）/g, '').trim();
  const def = id => { const d = byId(id).querySelector('dd').cloneNode(true); d.querySelectorAll('.gl-rel').forEach(x => x.remove()); return d.textContent.trim(); };
  const rich = [...adj].filter(([, s]) => s.size >= 3).map(([id]) => id);
  box.innerHTML = `
    <div class="wm-stage"><svg class="wm-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg></div>
    <div class="wm-info" aria-live="polite"></div>
    <div class="wm-bar"><p class="wm-path" data-path></p><button type="button" class="wm-rand">べつの言葉から</button></div>`;
  const stage = box.querySelector('.wm-stage'), lines = box.querySelector('.wm-lines'), info = box.querySelector('.wm-info'), path = box.querySelector('[data-path]');
  const nodes = new Map(); let trail = [];
  const node = id => {
    if (nodes.has(id)) return nodes.get(id);
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'wm-node is-new'; b.dataset.id = id; b.textContent = label(id);
    b.style.left = '50%'; b.style.top = '50%';
    stage.appendChild(b); nodes.set(id, b);
    return b;
  };
  const go = id => {
    trail = trail.filter(x => x !== id).concat(id).slice(-5);
    const ring = [...adj.get(id)].slice(0, 8);
    const keep = new Set([id, ...ring]);
    nodes.forEach((b, k) => { if (!keep.has(k)) { b.classList.add('is-out'); nodes.delete(k); setTimeout(() => b.remove(), 450); } });
    const pos = { [id]: [50, 50] };
    ring.forEach((r, i) => { const a = -Math.PI / 2 + i / ring.length * Math.PI * 2; pos[r] = [50 + Math.cos(a) * 36, 50 + Math.sin(a) * 36]; });
    Object.entries(pos).forEach(([k, [x, y]]) => {
      const b = node(k);
      b.classList.toggle('is-center', k === id);
      requestAnimationFrame(() => { b.classList.remove('is-new'); b.style.left = x + '%'; b.style.top = y + '%'; });
    });
    lines.innerHTML = ring.map(r => `<line x1="50" y1="50" x2="${pos[r][0]}" y2="${pos[r][1]}"/>`).join('');
    lines.classList.remove('is-draw'); void lines.getBoundingClientRect(); lines.classList.add('is-draw');
    info.innerHTML = `<p class="wm-word">${label(id)}<small>${ring.length ? `つながる言葉 ${ring.length}` : 'ここから先は、まだつながりがありません'}</small></p><p class="wm-def">${def(id)}</p><a href="#${id}" class="wm-read">辞典で読む →</a>`;
    path.innerHTML = trail.length > 1 ? `たどった道：${trail.map((t, i) => i === trail.length - 1 ? `<b>${label(t)}</b>` : `<button type="button" data-id="${t}">${label(t)}</button>`).join(' → ')}` : '言葉を押すと、その言葉がまん中に来ます。';
  };
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-id]');
    if (b && !b.classList.contains('is-center')) { go(b.dataset.id); return; }
    if (e.target.closest('.wm-rand')) { trail = []; go(rich[Math.random() * rich.length | 0]); }
  });
  go(adj.get('gdp') && adj.get('gdp').size >= 3 ? 'gdp' : rich[0] || items[0].id);
})();
