/* ================================================================
   pazuru.js — 経済ラボ：お金のめぐりパズル（近づいてから読みこむ）
   ・家計・企業・銀行・政府のあいだの 6 本の矢印に、「給料・代金・預金・貸し出し・税金・公共サービス」の札をはめる
   ・札を押してから矢印の空らんを押す（指でもマウスでも）。ドラッグでも置ける
   ・「答え合わせ」で、合っている札は緑に固定、ちがう札は戻る。ぜんぶ合うと、矢印の上をお金が流れはじめる
   ・図は説明のために単純にした「たとえ」（実際には、企業も税金をおさめ、銀行は家計にも貸す）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-pazuru]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = { h: [90, 190, '家計'], c: [510, 190, '企業'], b: [300, 60, '銀行'], g: [300, 330, '政府'] };
  // [から, へ, 曲がり, 正しい札, ひとこと]
  const E = [
    ['c', 'h', -46, '給料', '企業で働いて、給料を受けとる'],
    ['h', 'c', -46, '代金', '企業の商品やサービスを買って、代金をはらう'],
    ['h', 'b', 0, '預金', '使わないお金を銀行にあずける'],
    ['b', 'c', 0, '貸し出し', 'あずかったお金を、企業に貸す'],
    ['h', 'g', 62, '税金', '所得税や消費税をおさめる'],
    ['g', 'h', 62, '公共サービス', '学校・道路・医療などで返ってくる']
  ];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const geo = ([a, b, bend]) => {
    const [x1, y1] = N[a], [x2, y2] = N[b], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const sx = x1 + ux * 58, sy = y1 + uy * 34, ex = x2 - ux * 58, ey = y2 - uy * 34;   // 箱にかぶらないよう、両はしを少し短く
    const mx = (sx + ex) / 2 - uy * bend, my = (sy + ey) / 2 + ux * bend;
    return { d: `M${sx} ${sy} Q${mx} ${my} ${ex} ${ey}`, lx: (sx + 2 * mx + ex) / 4, ly: (sy + 2 * my + ey) / 4 };
  };
  let slots, sel = null, moves, solved;
  const build = () => {
    slots = E.map(() => null); moves = 0; solved = false; sel = null;
    box.classList.remove('is-solved', 'is-picking');
    const cards = shuffle(E.map(e => e[3]));
    box.innerHTML = `<div class="pz-board">
      <svg class="pz-map" viewBox="0 0 600 400" role="group" aria-label="お金のめぐりの図。6 本の矢印に札をはめます">
        <defs><marker id="pzA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#6b4a22"/></marker></defs>
        ${E.map((e, j) => { const g = geo(e); return `<path id="pzp${j}" d="${g.d}" class="pz-arrow" marker-end="url(#pzA)"/>`; }).join('')}
        ${E.map((e, j) => [0, 1, 2].map(k => `<circle r="6" class="pz-coin"><animateMotion dur="${2.4 + j * .2}s" begin="-${k * .8}s" repeatCount="indefinite" calcMode="linear"><mpath href="#pzp${j}"/></animateMotion></circle>`).join('')).join('')}
        ${Object.values(N).map(([x, y, t]) => `<g class="pz-node" transform="translate(${x},${y})"><rect x="-54" y="-28" width="108" height="56" rx="12"/><text y="8">${t}</text></g>`).join('')}
        ${E.map((e, j) => { const g = geo(e); return `<g class="pz-slot" data-s="${j}" tabindex="0" role="button" aria-label="${N[e[0]][2]}から${N[e[1]][2]}への矢印" transform="translate(${g.lx},${g.ly})"><rect x="-56" y="-17" width="112" height="34" rx="9"/><text y="6">？</text></g>`; }).join('')}
      </svg>
      <div class="pz-side">
        <p class="pz-h">札をえらんで、矢印の空らんへ</p>
        <div class="pz-cards">${cards.map(c => `<button type="button" class="pz-card" data-c="${c}">${c}</button>`).join('')}</div>
        <p class="pz-msg" aria-live="polite">家計から企業へ、企業から家計へ。矢印の向きをよく見てね。</p>
        <div class="pz-btns"><button type="button" class="pz-check">答え合わせ</button><button type="button" class="pz-reset">はじめから</button></div>
      </div>
    </div>
    <p class="pz-note">図は、しくみをつかむために単純にした「たとえ」です。実際には、企業も税金をおさめ、銀行は家計にもお金を貸します。</p>`;
  };
  const card = c => box.querySelector(`.pz-card[data-c="${c}"]`);
  const paintSlot = j => {
    const s = box.querySelector(`.pz-slot[data-s="${j}"]`);
    s.querySelector('text').textContent = slots[j] || '？';
    s.classList.toggle('is-filled', !!slots[j]);
  };
  const place = (c, j) => {
    const s = box.querySelector(`.pz-slot[data-s="${j}"]`);
    if (s.classList.contains('is-ok')) return;
    // 同じ札がほかの空らんにあれば外す。空らんにあった札は手元に戻す
    const was = slots.indexOf(c); if (was >= 0) { slots[was] = null; paintSlot(was); }
    if (slots[j]) card(slots[j]).classList.remove('is-used');
    slots[j] = c; card(c).classList.add('is-used'); moves++;
    paintSlot(j); s.classList.remove('is-pop'); void s.getBoundingClientRect(); s.classList.add('is-pop');
    select(null);
  };
  const select = c => {
    sel = c;
    box.querySelectorAll('.pz-card').forEach(b => b.classList.toggle('is-sel', b.dataset.c === c));
    box.classList.toggle('is-picking', !!c);
  };
  const check = () => {
    let good = 0;
    E.forEach((e, j) => {
      const s = box.querySelector(`.pz-slot[data-s="${j}"]`);
      if (!slots[j]) return;
      if (slots[j] === e[3]) { s.classList.add('is-ok'); card(slots[j]).classList.add('is-ok'); good++; }
      else { s.classList.remove('is-ng'); void s.getBoundingClientRect(); s.classList.add('is-ng'); card(slots[j]).classList.remove('is-used'); slots[j] = null; setTimeout(() => paintSlot(j), 450); }
    });
    const okAll = box.querySelectorAll('.pz-slot.is-ok').length;
    const msg = box.querySelector('.pz-msg');
    if (okAll === E.length) win();
    else msg.textContent = `${okAll} / 6 本が合っています。ちがっていた札は、手元に戻しました。`;
  };
  const win = () => {
    solved = true;
    box.classList.add('is-solved');
    box.querySelectorAll(".pz-coin").forEach(c => c.classList.add("is-on"));
    box.querySelector('.pz-msg').innerHTML = `ぜんぶ正解。<b>${moves}</b> 手でした。お金が、矢印の上をめぐりはじめました。<br>${E.map(e => `<span>${e[3]}：${e[4]}</span>`).join('')}`;
    try { localStorage.setItem('azakei_pazuru', String(moves)); } catch (e) {}
  };
  // 押して選ぶ → 空らんを押して置く
  box.addEventListener('click', e => {
    const b = e.target.closest('.pz-card');
    if (b) { if (b.classList.contains('is-ok') || solved) return; select(sel === b.dataset.c ? null : b.dataset.c); return; }
    const s = e.target.closest('.pz-slot');
    if (s && sel) { place(sel, +s.dataset.s); return; }
    if (s && slots[+s.dataset.s] && !s.classList.contains('is-ok')) { const j = +s.dataset.s; card(slots[j]).classList.remove('is-used'); slots[j] = null; paintSlot(j); return; }
    if (e.target.closest('.pz-check')) { check(); return; }
    if (e.target.closest('.pz-reset')) { build(); }
  });
  box.addEventListener('keydown', e => { const s = e.target.closest('.pz-slot'); if (s && (e.key === 'Enter' || e.key === ' ') && sel) { e.preventDefault(); place(sel, +s.dataset.s); } });
  // ドラッグでも置ける
  let drag = null;
  box.addEventListener('pointerdown', e => {
    const b = e.target.closest('.pz-card'); if (!b || b.classList.contains('is-ok') || solved || e.button > 0) return;
    drag = { c: b.dataset.c, x: e.clientX, y: e.clientY, ghost: null };
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.ghost && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) { drag.ghost = document.createElement('div'); drag.ghost.className = 'pz-ghost'; drag.ghost.textContent = drag.c; document.body.appendChild(drag.ghost); select(drag.c); }
    if (drag.ghost) { drag.ghost.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; const s = document.elementFromPoint(e.clientX, e.clientY); box.querySelectorAll('.pz-slot').forEach(x => x.classList.toggle('is-over', !!(s && s.closest('.pz-slot') === x))); }
  }, { passive: true });
  addEventListener('pointerup', e => {
    if (!drag) return;
    if (drag.ghost) {
      drag.ghost.remove();
      const s = document.elementFromPoint(e.clientX, e.clientY), slot = s && s.closest('.pz-slot');
      box.querySelectorAll('.pz-slot').forEach(x => x.classList.remove('is-over'));
      if (slot && box.contains(slot)) place(drag.c, +slot.dataset.s); else select(null);
      // ドラッグのあとに来る click で、選び直しにならないように
      const stop = ev => { ev.stopPropagation(); ev.preventDefault(); }; box.addEventListener('click', stop, { capture: true, once: true }); setTimeout(() => box.removeEventListener('click', stop, { capture: true }), 50);
    }
    drag = null;
  });
  build();
})();
