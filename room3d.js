/* ================================================================
   room3d.js — 文化祭ページ：会場（中3-5 教室）の 3D 模型（CSS 3D・ライブラリなし）
   ・文化祭の前に出した計画書のレイアウト（1 マス 25cm）をもとにした模型
   ・カメラは 3 つ：見わたす（ゆっくり回る・ドラッグで回す・近づく）／真上から（間取り図と寸法）／いっしょに歩く（人形の後ろからついていく）
   ・「順路を歩く」：人形が順路をなめらかに歩き、歩いたところの線が金色になる。場所ごとに説明と写真
   ・「にぎわいを見る」：顔のない人形が何人も、順路にそって会場を回る（人数はたとえ）
   ・「通常時間」「特別時間」の 2 つの並べ方を切りかえられる
   ・単位は cm。教室はおよそ 900 × 730cm（上が廊下側、下が中庭側、左が黒板側、右がロッカー側）
   ・写真は、サイトのほかの場所でも使っている会場の写真だけ（来場者の顔は写っていないもの）
   ================================================================ */
(function () {
  const host = document.querySelector('[data-room3d]');
  if (!host) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 900, D = 730;
  const desk = (x, y, w = 60, d = 40) => ({ x, y, w, d, h: 70, c: 'desk' });
  const chair = (x, y) => ({ x, y, w: 40, d: 40, h: 44, c: 'chair' });
  const panel = (x, y, w = 90, d = 8, label) => ({ x, y, w, d, h: 160, c: 'panel', label });
  const cardTable = (x, y) => [desk(x, y, 120, 80), chair(x + 10, y - 42), chair(x + 70, y - 42), chair(x + 10, y + 82), chair(x + 70, y + 82)];
  const FIXED = [
    { x: 0, y: 250, w: 18, d: 260, h: 120, c: 'board' },                 // 黒板
    { x: 4, y: 263, w: 78, d: 128, h: 20, c: 'stage' },                  // 教壇
    { x: 850, y: 120, w: 50, d: 590, h: 90, c: 'locker' },               // ロッカー
    { x: 290, y: 0, w: 55, d: 25, h: 120, c: 'pillar' }, { x: 560, y: 0, w: 55, d: 25, h: 120, c: 'pillar' },
    { x: 300, y: 705, w: 35, d: 25, h: 120, c: 'pillar' }, { x: 545, y: 705, w: 35, d: 25, h: 120, c: 'pillar' }
  ];
  const PH = {
    door: ['photos/s/star-door.jpg', '教室の入口。「入門」の札と、経の字の六芒星'],
    diag: ['photos/s/room-diagnosis.jpg', '展示会場。壁いっぱいのエコノミスト診断のポスター'],
    board: ['photos/s/board-millionaire.jpg', '黒板の「本日の億万長者」。1 位 120 枚']
  };
  const LAYOUTS = {
    normal: {
      items: [
        desk(170, 25), chair(232, 25),
        { x: 85, y: 300, w: 45, d: 68, h: 90, c: 'desk' },
        desk(50, 640, 180, 40), chair(60, 684), chair(120, 684), chair(180, 684),
        ...cardTable(400, 150), ...cardTable(270, 385), ...cardTable(500, 385),
        panel(290, 600, 90, 8, '紙展①'), panel(382, 600, 90, 8), panel(474, 600, 90, 8, '紙展②'),
        chair(300, 630), chair(345, 630), chair(390, 630), chair(435, 630), chair(480, 630),
        desk(645, 630, 120, 40),
        panel(625, 690, 90, 8, '紙展③'), panel(720, 690, 90, 8, '紙展④'),
        { x: 842, y: 260, w: 6, d: 300, h: 110, c: 'poster', label: '紙展⑤' },
        desk(710, 40, 40, 120), chair(668, 50), chair(668, 110)
      ],
      route: [[100, -30], [100, 60], [130, 580], [330, 340], [460, 280], [600, 520], [700, 590], [800, 420], [760, 230], [800, 90], [800, -30]],
      steps: [
        { n: 1, x: 200, y: 45, name: '受付', text: 'ゲームの説明と、クロスワードの問題、チップ 5 枚を受け取る。入口には「入門」の札と、経の字の六芒星。', at: 1, ph: 'door' },
        { n: 2, x: 140, y: 650, name: 'クイズコーナー', text: '難しさを選んで 2 問。正解数と難しさで、賭けたチップが増える。', at: 2 },
        { n: 3, x: 460, y: 330, name: 'カードゲーム', text: '空いている台で 4 人ずつ。人数がそろわないときは展示員と遊ぶ。', at: 4 },
        { n: 4, x: 705, y: 650, name: 'クロスワード', text: '経済のことばのクロスワード。答えのヒントは、壁の紙展に。', at: 6 },
        { n: 5, x: 845, y: 410, name: 'エコノミスト診断', text: 'ロッカーに貼った大きな診断を、YES・NO でたどりながら進む。', at: 7, ph: 'diag' },
        { n: 6, x: 730, y: 100, name: '景品交換所', text: 'かせいだチップの枚数に応じて、景品を受け取る。', at: 8 },
        { n: 7, x: 800, y: 20, name: '出口', text: '「修了」の札をくぐって、おつかれさまでした。', at: 10 }
      ],
      spots: [{ id: '黒', x: 30, y: 470, name: '黒板', text: 'その日のチップのランキング「本日の億万長者」を書いた黒板。3 日間を通しての最高記録は 120 枚（スタートの 24 倍）でした。', ph: 'board' }]
    },
    special: {
      items: [
        desk(170, 25),
        { x: 85, y: 300, w: 45, d: 68, h: 90, c: 'desk' },
        { x: 6, y: 300, w: 6, d: 110, h: 100, c: 'screen' },
        desk(345, 0, 180, 80),
        desk(0, 650, 180, 80), desk(180, 690, 60, 40),
        desk(640, 650, 200, 40),
        ...Array.from({ length: 28 }, (_, i) => chair(250 + (i % 4) * 75, 170 + Math.floor(i / 4) * 52)),
        panel(290, 600, 90, 8, '紙展①'), panel(382, 600, 90, 8), panel(474, 600, 90, 8, '紙展②'),
        panel(640, 700, 90, 8, '紙展③'), panel(735, 700, 90, 8, '紙展④'),
        { x: 842, y: 260, w: 6, d: 300, h: 110, c: 'poster', label: '紙展⑤' },
        desk(710, 40, 40, 120)
      ],
      route: [[100, -30], [100, 60], [200, 220], [230, 320], [560, 520], [780, 420], [800, 90], [800, -30]],
      steps: [
        { n: 1, x: 200, y: 45, name: '受付', text: '特別時間（13:00–14:00）は、討論・対談の時間。', at: 1, ph: 'door' },
        { n: 2, x: 360, y: 330, name: '客席 28 席', text: '黒板側のスクリーンに向かって座る。', at: 3 },
        { n: 3, x: 40, y: 360, name: 'スクリーン', text: '映像や、討論の様子を映す。', at: 3 },
        { n: 4, x: 800, y: 20, name: '出口', text: 'ロッカー側を通って退場。', at: 7 }
      ],
      spots: []
    }
  };

  // ---- 箱（机・いす・壁など）。影も床に落とす ----
  const box = (b, k) => {
    const x = b.x * k, y = b.y * k, w = b.w * k, d = b.d * k, h = b.h * k;
    const face = (cls, st) => `<i class="r3-f ${cls}" style="${st}"></i>`;
    return `<div class="r3-box r3-${b.c}" style="left:${x}px;top:${y}px;width:${w}px;height:${d}px">`
      + (b.c === 'wall' ? '' : `<i class="r3-shadow" style="width:${w}px;height:${d}px;--sh:${Math.min(14, h * .12)}px"></i>`)
      + face('r3-top', `width:${w}px;height:${d}px;transform:translateZ(${h}px)`)
      + face('r3-n', `width:${w}px;height:${h}px;transform-origin:0 0;transform:rotateX(90deg)`)
      + face('r3-s', `width:${w}px;height:${h}px;top:${d}px;transform-origin:0 0;transform:rotateX(90deg)`)
      + face('r3-w', `width:${h}px;height:${d}px;transform-origin:0 0;transform:rotateY(-90deg)`)
      + face('r3-e', `width:${h}px;height:${d}px;left:${w}px;transform-origin:0 0;transform:rotateY(-90deg)`)
      + (b.label ? `<span class="r3-tag" style="transform:translateZ(${h + 6}px)">${b.label}</span>` : '')
      + `</div>`;
  };
  const STAR = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 L90 73 L10 73 Z M50 96 L10 27 L90 27 Z" fill="#2f6b3a" stroke="#fffaf0" stroke-width="4" stroke-linejoin="round" paint-order="stroke"/><circle cx="50" cy="50" r="21" fill="#f6efdc"/><text x="50" y="59" text-anchor="middle" font-family="serif" font-weight="800" font-size="26" fill="#2f6b3a">経</text></svg>`;
  const PAWN = c => `<svg viewBox="0 0 30 60" aria-hidden="true"><ellipse cx="15" cy="57" rx="11" ry="3" fill="rgba(0,0,0,.25)"/><path d="M5 56 Q5 30 15 28 Q25 30 25 56 Z" fill="${c}"/><circle cx="15" cy="17" r="10" fill="${c}"/><circle cx="15" cy="17" r="10" fill="url(#r3-sh)"/></svg>`;

  host.innerHTML = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><radialGradient id="r3-sh" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></radialGradient></defs></svg>
    <div class="r3-bar">
      <div class="r3-mode" role="group" aria-label="並べ方"><button type="button" data-mode="normal" aria-pressed="true">通常時間</button><button type="button" data-mode="special" aria-pressed="false">特別時間</button></div>
      <div class="r3-cams" role="group" aria-label="カメラ"><button type="button" data-cam="over" aria-pressed="true">見わたす</button><button type="button" data-cam="top" aria-pressed="false">真上から</button><button type="button" data-cam="walk" aria-pressed="false">いっしょに歩く</button></div>
    </div>
    <div class="r3-view">
      <div class="r3-world"><div class="r3-floor"></div></div>
      <div class="r3-hud" aria-hidden="true"><span class="r3-hud-n">—</span><span class="r3-hud-t">会場の模型</span><span class="r3-prog"></span></div>
      <div class="r3-zoom"><button type="button" data-z="1" aria-label="近づく">＋</button><button type="button" data-z="-1" aria-label="はなれる">－</button><button type="button" data-rot="-1" aria-label="左に回す">左へ</button><button type="button" data-rot="1" aria-label="右に回す">右へ</button></div>
      <p class="r3-scale">1 マス 25cm ／ 教室はおよそ 9m × 7.3m</p>
      <p class="r3-hint">ドラッグで回せます</p>
    </div>
    <div class="r3-under">
      <div class="r3-ctrl"><button type="button" class="r3-play">順路を歩く</button><button type="button" class="r3-crowd" aria-pressed="false">にぎわいを見る</button></div>
      <ol class="r3-steps"></ol>
    </div>
    <div class="r3-card" aria-live="polite"><span class="r3-card-n">模</span><div class="r3-card-b"><p class="r3-card-h">会場の模型</p><p class="r3-card-t">番号を押すと、その場所へ歩いていきます。「いっしょに歩く」にすると、人形の後ろからついていけます。</p></div><figure class="r3-card-ph" hidden><img alt="" loading="lazy" decoding="async"><figcaption></figcaption></figure></div>`;

  const view = host.querySelector('.r3-view'), world = host.querySelector('.r3-world'), floor = host.querySelector('.r3-floor');
  const stepsEl = host.querySelector('.r3-steps'), playBtn = host.querySelector('.r3-play'), crowdBtn = host.querySelector('.r3-crowd');
  const card = host.querySelector('.r3-card'), hudN = host.querySelector('.r3-hud-n'), hudT = host.querySelector('.r3-hud-t'), prog = host.querySelector('.r3-prog');
  let mode = 'normal', cam = 'over', k = .6;
  const C = { rz: -28, rx: 56, z: 0, fx: 0, fy: 0 };          // いまのカメラ
  const T = { rz: -28, rx: 56, z: 0, fx: 0, fy: 0 };          // めざすカメラ
  let zoom = 0, idle = 0, vel = 0;

  // ---- 順路の長さと位置 ----
  let segs = [], total = 0, walker = { s: 0, el: null }, crowd = [], walkedLine = null;
  const prep = route => { segs = []; total = 0; for (let i = 1; i < route.length; i++) { const [x0, y0] = route[i - 1], [x1, y1] = route[i], l = Math.hypot(x1 - x0, y1 - y0); segs.push({ x0, y0, x1, y1, l, s0: total }); total += l; } };
  const at = s => { s = Math.max(0, Math.min(total, s)); const g = segs.find(q => s <= q.s0 + q.l) || segs[segs.length - 1]; const u = g.l ? (s - g.s0) / g.l : 0; return { x: g.x0 + (g.x1 - g.x0) * u, y: g.y0 + (g.y1 - g.y0) * u, a: Math.atan2(g.y1 - g.y0, g.x1 - g.x0) }; };
  const sOf = idx => { const L = LAYOUTS[mode]; let s = 0; for (let i = 1; i <= idx; i++) s += Math.hypot(L.route[i][0] - L.route[i - 1][0], L.route[i][1] - L.route[i - 1][1]); return s; };
  const place = (el, p) => { el.style.left = p.x * k + 'px'; el.style.top = p.y * k + 'px'; };

  function build() {
    const L = LAYOUTS[mode];
    k = Math.min(.66, Math.max(.3, view.clientWidth / 1150));
    host.style.setProperty('--k', k);
    floor.style.width = W * k + 'px'; floor.style.height = D * k + 'px';
    prep(L.route);
    const walls = [{ x: -12, y: -12, w: 62, d: 12, h: 34 }, { x: 150, y: -12, w: 600, d: 12, h: 34 }, { x: 850, y: -12, w: 62, d: 12, h: 34 },
      { x: -12, y: D, w: W + 24, d: 12, h: 34 }, { x: -12, y: 0, w: 12, d: D, h: 34 }, { x: W, y: 0, w: 12, d: D, h: 34 }]
      .map(b => box({ ...b, c: 'wall' }, k)).join('');
    const pts = L.route.map(([x, y]) => `${x * k},${(y + 40) * k}`).join(' ');
    const sign = (x, label, cls) => `<span class="r3-sign ${cls}" style="left:${x * k}px;top:${-38 * k}px"><b>${cls === 'is-in' ? STAR : ''}<em>${label}</em></b></span>`;
    floor.innerHTML = `<i class="r3-light"></i>${[150, 380, 610].map(x => `<i class="r3-sun" style="left:${x * k}px;width:${150 * k}px"></i>`).join('')}`
      + `<span class="r3-dim r3-dim-x">約 9 m</span><span class="r3-dim r3-dim-y">約 7.3 m</span>`
      + `<svg class="r3-route" width="${W * k}" height="${(D + 40) * k}" style="top:${-40 * k}px"><polyline class="r3-rt" points="${pts}"/><polyline class="r3-walked" points="${pts}" pathLength="1000"/></svg>`
      + `<span class="r3-door" style="left:${50 * k}px;width:${100 * k}px">入門</span><span class="r3-door is-exit" style="left:${750 * k}px;width:${100 * k}px">修了</span>`
      + `<span class="r3-side r3-side-n">廊下側</span><span class="r3-side r3-side-s">中庭側（窓）</span><span class="r3-side r3-side-w">黒板側</span>`
      + walls + FIXED.concat(L.items).map(b => box(b, k)).join('')
      + sign(100, '入門', 'is-in') + sign(800, '修了', 'is-out')
      + L.steps.map(s => `<span class="r3-pin" data-n="${s.n}" style="left:${s.x * k}px;top:${s.y * k}px"><b>${s.n}</b></span>`).join('')
      + L.spots.map(s => `<span class="r3-pin is-spot" data-spot="${s.id}" style="left:${s.x * k}px;top:${s.y * k}px"><b>${s.id}</b></span>`).join('')
      + `<span class="r3-crowdg"></span><span class="r3-walker"><i class="r3-ring"></i><b class="r3-pawn">${PAWN('#b5432f')}</b></span>`;
    walkedLine = floor.querySelector('.r3-walked');
    walker.el = floor.querySelector('.r3-walker');
    walker.s = 0; setWalked(0); place(walker.el, at(0));
    stepsEl.innerHTML = L.steps.map(s => `<li><button type="button" data-n="${s.n}"><b>${s.n}</b>${s.name}</button></li>`).join('')
      + L.spots.map(s => `<li><button type="button" class="is-spot" data-spot="${s.id}"><b>${s.id}</b>${s.name}</button></li>`).join('');
    host.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); go(+b.dataset.n); }));
    host.querySelectorAll('[data-spot]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); spot(b.dataset.spot); }));
    if (crowdOn) makeCrowd();
    setCam(cam, true);
  }
  const setWalked = s => { if (walkedLine) walkedLine.style.strokeDashoffset = (1000 - s / total * 1000).toFixed(1); };

  // ---- カメラ ----
  function setCam(c, now) {
    const from = cam;
    cam = c; host.dataset.cam = c;
    host.querySelectorAll('[data-cam]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cam === c));
    if (c === 'top') Object.assign(T, { rz: Math.round(C.rz / 360) * 360, rx: 0, z: 0, fx: 0, fy: 0 });
    else if (c === 'over') Object.assign(T, { rz: from === 'top' ? C.rz - 28 : C.rz, rx: 56, z: zoom * 120, fx: 0, fy: 0 });
    else follow(true);
    if (now || reduce) Object.assign(C, T);
    idle = 0;
  }
  function follow(snap) {
    const p = at(walker.s), heading = p.a * 180 / Math.PI;
    let want = -90 - heading;
    while (want - C.rz > 180) want -= 360; while (want - C.rz < -180) want += 360;
    if (snap || Math.abs(want - T.rz) > 2) T.rz = want;
    T.rx = 64; T.z = 260 * (k / .6) + zoom * 80;
    T.fx = p.x * k - W * k / 2; T.fy = p.y * k - D * k / 2;
  }
  function render() {
    world.style.transform = `translateZ(${C.z.toFixed(1)}px) rotateX(${C.rx.toFixed(2)}deg) rotateZ(${C.rz.toFixed(2)}deg) translate(${(-C.fx).toFixed(1)}px, ${(-C.fy).toFixed(1)}px)`;
    host.style.setProperty('--rz', C.rz.toFixed(2) + 'deg'); host.style.setProperty('--rx', C.rx.toFixed(2) + 'deg');
  }

  // ---- 毎フレーム：カメラをなめらかに、人形を歩かせる ----
  let drag = null, last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last); last = now;
    idle += dt;
    if (cam === 'over' && !drag) {
      if (Math.abs(vel) > .01) { T.rz += vel; vel *= .94; }
      else if (idle > 3500 && !reduce && !playing) T.rz += dt * .004;
    }
    if (crowdOn) moveCrowd(dt);
    if (playing) stepWalk(dt);
    if (cam === 'walk') follow(false);
    const e = reduce ? 1 : 1 - Math.pow(.0025, dt / 1000 * (cam === 'walk' ? 1.1 : 1.6));
    for (const key in C) C[key] += (T[key] - C[key]) * e;
    render();
    requestAnimationFrame(frame);
  }

  // ---- 順路を歩く ----
  let playing = false, queue = [], pause = 0, target = 0, onArrive = null;
  const SPEED = 230; // cm / 秒
  function walkTo(s, cb) { target = s; onArrive = cb; playing = true; pause = 0; }
  function stepWalk(dt) {
    if (pause > 0) { pause -= dt; if (pause <= 0) next(); return; }
    const dir = Math.sign(target - walker.s), mv = reduce ? Infinity : SPEED * dt / 1000;
    if (Math.abs(target - walker.s) <= mv) { walker.s = target; arrive(); }
    else walker.s += dir * mv;
    const p = at(walker.s); place(walker.el, p);
    walker.el.classList.toggle('is-moving', walker.s !== target);
    const mx = Math.max(walker.s, +walkedLine.dataset.max || 0);
    walkedLine.dataset.max = mx; setWalked(mx);
  }
  function arrive() { const cb = onArrive; onArrive = null; walker.el.classList.remove('is-moving'); if (cb) cb(); else playing = false; }
  function next() { const n = queue.shift(); if (n == null) { playing = false; playBtn.textContent = 'もう一度歩く'; try { localStorage.setItem('azakei_room_tour', '1'); } catch (e) {} return; } go(n, true); }
  function go(n, inTour) {
    const L = LAYOUTS[mode], s = L.steps.find(t => t.n === n); if (!s) return;
    if (!inTour) { queue = []; playBtn.textContent = '順路を歩く'; }
    mark(n); hudN.textContent = n; hudT.textContent = s.name + 'へ';
    walkTo(sOf(s.at), () => { showCard(s.n, s.name, s.text, s.ph); hudT.textContent = s.name; if (inTour || queue.length) { pause = reduce ? 600 : 2300; } else playing = false; });
    if (cam === 'over') idle = 0;
  }
  function spot(id) {
    const s = LAYOUTS[mode].spots.find(t => t.id === id); if (!s) return;
    mark(null, id); showCard(s.id, s.name, s.text, s.ph);
    if (cam === 'over') { T.fx = s.x * k - W * k / 2; T.fy = s.y * k - D * k / 2; T.z = 180; idle = -4000; setTimeout(() => { if (cam === 'over') { T.fx = 0; T.fy = 0; T.z = zoom * 120; } }, 4200); }
  }
  function mark(n, id) {
    host.querySelectorAll('[data-n]').forEach(e => e.classList.toggle('is-on', +e.dataset.n === n));
    host.querySelectorAll('[data-spot]').forEach(e => e.classList.toggle('is-on', e.dataset.spot === id));
    const L = LAYOUTS[mode];
    prog.innerHTML = L.steps.map(s => `<i class="${n && s.n <= n ? 'is-done' : ''}"></i>`).join('');
  }
  function showCard(n, name, text, ph) {
    card.querySelector('.r3-card-n').textContent = n;
    card.querySelector('.r3-card-h').textContent = name;
    card.querySelector('.r3-card-t').textContent = text;
    const fig = card.querySelector('.r3-card-ph');
    if (ph && PH[ph]) { const img = fig.querySelector('img'); img.src = PH[ph][0]; img.alt = PH[ph][1]; fig.querySelector('figcaption').textContent = PH[ph][1]; fig.hidden = false; }
    else fig.hidden = true;
    card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
  }
  function tour() {
    if (playing && queue.length) { queue = []; playing = false; playBtn.textContent = '順路を歩く'; return; }
    const L = LAYOUTS[mode];
    walker.s = 0; walkedLine.dataset.max = 0; setWalked(0); place(walker.el, at(0));
    queue = L.steps.map(s => s.n); playBtn.textContent = '止める';
    showCard('入', '入口から出発', mode === 'normal' ? 'チップ 5 枚を受け取りに、受付へ。' : '特別時間の会場へ。', null);
    if (cam === 'over') setCam('walk');
    next();
  }

  // ---- にぎわい（顔のない人形が順路を回る） ----
  let crowdOn = false;
  const COLORS = ['#3b5a78', '#5f7f4e', '#8a5a2b', '#7a4a8a', '#c9921f', '#4f8a8b', '#a0525f', '#6b6f7a'];
  function makeCrowd() {
    const g = floor.querySelector('.r3-crowdg');
    crowd = COLORS.map((c, i) => ({ s: total * i / COLORS.length, v: 70 + (i * 13) % 40, el: null, c }));
    g.innerHTML = crowd.map(p => `<span class="r3-walker is-crowd"><b class="r3-pawn">${PAWN(p.c)}</b></span>`).join('');
    [...g.children].forEach((el, i) => { crowd[i].el = el; place(el, at(crowd[i].s)); });
  }
  function moveCrowd(dt) {
    crowd.forEach(p => { if (!reduce) p.s = (p.s + p.v * dt / 1000) % total; place(p.el, at(p.s)); });
  }

  // ---- 操作 ----
  playBtn.addEventListener('click', tour);
  crowdBtn.addEventListener('click', () => {
    crowdOn = !crowdOn; crowdBtn.setAttribute('aria-pressed', crowdOn);
    if (crowdOn) makeCrowd(); else { floor.querySelector('.r3-crowdg').innerHTML = ''; crowd = []; }
  });
  host.querySelectorAll('[data-cam]').forEach(b => b.addEventListener('click', () => setCam(b.dataset.cam)));
  host.querySelectorAll('[data-z]').forEach(b => b.addEventListener('click', () => { zoom = Math.max(-1, Math.min(3, zoom + +b.dataset.z)); if (cam === 'over') T.z = zoom * 120; idle = 0; }));
  host.querySelectorAll('[data-rot]').forEach(b => b.addEventListener('click', () => { if (cam === 'top') setCam('over'); if (cam === 'over') T.rz += 45 * b.dataset.rot; idle = 0; }));
  host.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
    queue = []; playing = false; playBtn.textContent = '順路を歩く'; mode = b.dataset.mode;
    host.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    mark(null); build();
  }));
  view.addEventListener('pointerdown', e => {
    if (e.target.closest('.r3-pin, button')) return;
    if (cam !== 'over') setCam('over');
    drag = { x: e.clientX, y: e.clientY, rz: T.rz, rx: T.rx, lx: e.clientX }; vel = 0; idle = 0;
    view.setPointerCapture(e.pointerId); view.classList.add('is-drag');
  });
  view.addEventListener('pointermove', e => {
    if (!drag) return;
    T.rz = drag.rz + (e.clientX - drag.x) * .4; T.rx = Math.max(20, Math.min(76, drag.rx - (e.clientY - drag.y) * .25));
    C.rz = T.rz; C.rx = T.rx; vel = (e.clientX - drag.lx) * .4; drag.lx = e.clientX; idle = 0;
  });
  const end = () => { drag = null; view.classList.remove('is-drag'); host.classList.add('is-touched'); };
  view.addEventListener('pointerup', end); view.addEventListener('pointercancel', end);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
  build(); mark(null);
  requestAnimationFrame(frame);
})();
