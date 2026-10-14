/* ================================================================
   room3d.js — 文化祭ページ：会場（中3-5 教室）の 3D 模型（CSS 3D・ライブラリなし）
   ・文化祭の前に出した計画書のレイアウト（1 マス 25cm）をもとにした模型
   ・ドラッグ／ボタンで回せる。順路の番号を押すと、その場所が光る。「順路を再生」でチップが歩く
   ・「通常時間」「特別時間」の 2 つの並べ方を切りかえられる
   ・単位は cm。教室はおよそ 900 × 730cm（上が廊下側、下が中庭側、左が黒板側、右がロッカー側）
   ================================================================ */
(function() {
  const host = document.querySelector('[data-room3d]');
  if (!host) return;
  const W = 900, D = 730;
  const desk = (x, y, w = 60, d = 40) => ({ x, y, w, d, h: 70, c: 'desk' });
  const chair = (x, y) => ({ x, y, w: 40, d: 40, h: 44, c: 'chair' });
  const panel = (x, y, w = 90, d = 8, label) => ({ x, y, w, d, h: 160, c: 'panel', label });
  // 4 つの机＋4 つのいす（カードゲームの台）
  const cardTable = (x, y) => [desk(x, y, 120, 80), chair(x + 10, y - 42), chair(x + 70, y - 42), chair(x + 10, y + 82), chair(x + 70, y + 82)];
  // 動かない物（壁ぎわ）
  const FIXED = [
    { x: 0, y: 250, w: 18, d: 260, h: 120, c: 'board' },                 // 黒板
    { x: 4, y: 263, w: 78, d: 128, h: 20, c: 'stage' },                  // 教壇
    { x: 850, y: 120, w: 50, d: 590, h: 90, c: 'locker' },               // ロッカー
    { x: 290, y: 0, w: 55, d: 25, h: 120, c: 'pillar' }, { x: 560, y: 0, w: 55, d: 25, h: 120, c: 'pillar' },
    { x: 300, y: 705, w: 35, d: 25, h: 120, c: 'pillar' }, { x: 545, y: 705, w: 35, d: 25, h: 120, c: 'pillar' }
  ];
  const LAYOUTS = {
    normal: {
      items: [
        desk(170, 25), chair(232, 25),                                     // 受付
        { x: 85, y: 300, w: 45, d: 68, h: 90, c: 'desk' },                 // 教卓
        desk(50, 640, 180, 40), chair(60, 684), chair(120, 684), chair(180, 684),   // クイズ
        ...cardTable(400, 150), ...cardTable(270, 385), ...cardTable(500, 385),     // カードゲーム
        panel(290, 600, 90, 8, '紙展①'), panel(382, 600, 90, 8), panel(474, 600, 90, 8, '紙展②'), // 仕切り板 ×3
        chair(300, 630), chair(345, 630), chair(390, 630), chair(435, 630), chair(480, 630),       // 楽屋
        desk(645, 630, 120, 40),                                           // クロスワード
        panel(625, 690, 90, 8, '紙展③'), panel(720, 690, 90, 8, '紙展④'),
        { x: 842, y: 260, w: 6, d: 300, h: 110, c: 'poster', label: '紙展⑤' },
        desk(710, 40, 40, 120), chair(668, 50), chair(668, 110)            // 景品を渡す場所
      ],
      // 順路（cm）と、その番号の場所
      route: [[100, -30], [100, 60], [130, 580], [330, 340], [460, 280], [600, 520], [700, 590], [800, 420], [760, 230], [800, 90], [800, -30]],
      steps: [
        { n: 1, x: 200, y: 45, name: '受付', text: 'ゲームの説明と、クロスワードの問題、チップ 5 枚を受け取る。', at: 1 },
        { n: 2, x: 140, y: 650, name: 'クイズコーナー', text: '難しさを選んで 2 問。正解数と難しさで、賭けたチップが増える。', at: 2 },
        { n: 3, x: 460, y: 330, name: 'カードゲーム', text: '空いている台で 4 人ずつ。人数がそろわないときは展示員と遊ぶ。', at: 4 },
        { n: 4, x: 705, y: 650, name: 'クロスワード', text: '経済のことばのクロスワード。答えのヒントは、壁の紙展に。', at: 6 },
        { n: 5, x: 845, y: 410, name: 'エコノミスト診断', text: 'ロッカーに貼った大きな診断を、YES・NO でたどりながら進む。', at: 7 },
        { n: 6, x: 730, y: 100, name: '景品交換所', text: 'かせいだチップの枚数に応じて、景品を受け取る。', at: 8 },
        { n: 7, x: 800, y: 20, name: '出口', text: 'おつかれさまでした。', at: 10 }
      ]
    },
    special: {
      items: [
        desk(170, 25),                                                     // 受付
        { x: 85, y: 300, w: 45, d: 68, h: 90, c: 'desk' },                 // 教卓
        { x: 6, y: 300, w: 6, d: 110, h: 100, c: 'screen' },               // スクリーン
        desk(345, 0, 180, 80),                                             // 寄せた机（廊下側）
        desk(0, 650, 180, 80), desk(180, 690, 60, 40),                     // 寄せた机（中庭側 左）
        desk(640, 650, 200, 40),                                           // 寄せた机（中庭側 右）
        ...Array.from({ length: 28 }, (_, i) => chair(250 + (i % 4) * 75, 170 + Math.floor(i / 4) * 52)), // 客席 28
        panel(290, 600, 90, 8, '紙展①'), panel(382, 600, 90, 8), panel(474, 600, 90, 8, '紙展②'),
        panel(640, 700, 90, 8, '紙展③'), panel(735, 700, 90, 8, '紙展④'),
        { x: 842, y: 260, w: 6, d: 300, h: 110, c: 'poster', label: '紙展⑤' },
        desk(710, 40, 40, 120)
      ],
      route: [[100, -30], [100, 60], [200, 220], [230, 320], [560, 520], [780, 420], [800, 90], [800, -30]],
      steps: [
        { n: 1, x: 200, y: 45, name: '受付', text: '特別時間（13:00–14:00）は、討論・対談の時間。', at: 1 },
        { n: 2, x: 360, y: 330, name: '客席 28 席', text: '黒板側のスクリーンに向かって座る。', at: 3 },
        { n: 3, x: 40, y: 360, name: 'スクリーン', text: '映像や、討論の様子を映す。', at: 3 },
        { n: 4, x: 800, y: 20, name: '出口', text: 'ロッカー側を通って退場。', at: 7 }
      ]
    }
  };

  const box = (b, k) => {
    const x = b.x * k, y = b.y * k, w = b.w * k, d = b.d * k, h = b.h * k;
    const face = (cls, st) => `<i class="r3-f ${cls}" style="${st}"></i>`;
    return `<div class="r3-box r3-${b.c}" style="left:${x}px;top:${y}px;width:${w}px;height:${d}px">`
      + face('r3-top', `width:${w}px;height:${d}px;transform:translateZ(${h}px)`)
      + face('r3-n', `width:${w}px;height:${h}px;transform-origin:0 0;transform:rotateX(90deg)`)
      + face('r3-s', `width:${w}px;height:${h}px;top:${d}px;transform-origin:0 0;transform:rotateX(90deg)`)
      + face('r3-w', `width:${h}px;height:${d}px;transform-origin:0 0;transform:rotateY(-90deg)`)
      + face('r3-e', `width:${h}px;height:${d}px;left:${w}px;transform-origin:0 0;transform:rotateY(-90deg)`)
      + (b.label ? `<span class="r3-tag" style="transform:translateZ(${h + 6}px)">${b.label}</span>` : '')
      + `</div>`;
  };

  host.innerHTML = `
    <div class="r3-bar">
      <div class="r3-mode" role="group" aria-label="並べ方"><button type="button" data-mode="normal" aria-pressed="true">通常時間</button><button type="button" data-mode="special" aria-pressed="false">特別時間</button></div>
      <div class="r3-ctrl"><button type="button" data-rot="-1" aria-label="左に回す">⟲</button><button type="button" data-rot="1" aria-label="右に回す">⟳</button><button type="button" class="r3-play">順路を再生</button></div>
    </div>
    <div class="r3-view"><div class="r3-world"><div class="r3-floor"></div></div></div>
    <ol class="r3-steps"></ol>
    <p class="r3-info" aria-live="polite"></p>`;
  const view = host.querySelector('.r3-view'), world = host.querySelector('.r3-world'), floor = host.querySelector('.r3-floor');
  const stepsEl = host.querySelector('.r3-steps'), info = host.querySelector('.r3-info'), playBtn = host.querySelector('.r3-play');
  let mode = 'normal', k = 0.6, rz = -28, rx = 56, timer = 0;

  function build() {
    const L = LAYOUTS[mode];
    k = Math.min(0.66, Math.max(0.3, view.clientWidth / 1150));
    host.style.setProperty('--k', k);
    floor.style.width = W * k + 'px'; floor.style.height = D * k + 'px';
    const doors = `<span class="r3-door" style="left:${50 * k}px;width:${100 * k}px">入門</span><span class="r3-door is-exit" style="left:${750 * k}px;width:${100 * k}px">修了</span>`
      + `<span class="r3-side r3-side-n">廊下側</span><span class="r3-side r3-side-s">中庭側</span><span class="r3-side r3-side-w">黒板側</span>`;
    const walls = [{ x: -12, y: -12, w: 62, d: 12, h: 34 }, { x: 150, y: -12, w: 600, d: 12, h: 34 }, { x: 850, y: -12, w: 62, d: 12, h: 34 },
      { x: -12, y: D, w: W + 24, d: 12, h: 34 }, { x: -12, y: 0, w: 12, d: D, h: 34 }, { x: W, y: 0, w: 12, d: D, h: 34 }]
      .map(b => box({ ...b, c: 'wall' }, k)).join('');
    const pts = L.route.map(([x, y]) => `${x * k},${(y + 40) * k}`).join(' ');
    floor.innerHTML = `<svg class="r3-route" width="${W * k}" height="${(D + 40) * k}" style="top:${-40 * k}px"><polyline points="${pts}" /></svg>`
      + doors + walls + FIXED.concat(L.items).map(b => box(b, k)).join('')
      + L.steps.map(s => `<span class="r3-pin" data-n="${s.n}" style="left:${s.x * k}px;top:${s.y * k}px"><b>${s.n}</b></span>`).join('')
      + `<span class="r3-token" style="left:${L.route[0][0] * k}px;top:${L.route[0][1] * k}px"><i></i></span>`;
    stepsEl.innerHTML = L.steps.map(s => `<li><button type="button" data-n="${s.n}"><b>${s.n}</b>${s.name}</button></li>`).join('');
    host.querySelectorAll('.r3-steps button, .r3-pin').forEach(b => b.addEventListener('click', () => { stop(); show(+b.dataset.n); }));
    info.textContent = '番号を押すと、その場所の説明が出ます。ドラッグで回せます。';
    turn();
  }
  function turn() { world.style.transform = `rotateX(${rx}deg) rotateZ(${rz}deg)`; host.style.setProperty('--rz', rz + 'deg'); host.style.setProperty('--rx', rx + 'deg'); }
  function show(n) {
    const L = LAYOUTS[mode], s = L.steps.find(t => t.n === n); if (!s) return;
    host.querySelectorAll('[data-n]').forEach(e => e.classList.toggle('is-on', +e.dataset.n === n));
    info.innerHTML = `<b>${s.n}. ${s.name}</b>${s.text}`;
    const t = floor.querySelector('.r3-token'), p = L.route[s.at];
    t.style.left = p[0] * k + 'px'; t.style.top = p[1] * k + 'px';
  }
  function stop() { clearTimeout(timer); timer = 0; playBtn.textContent = '順路を再生'; }
  function play() {
    if (timer) return stop();
    const L = LAYOUTS[mode]; let i = 0;
    playBtn.textContent = '止める';
    const next = () => { show(L.steps[i].n); i++; timer = i < L.steps.length ? setTimeout(next, 1700) : 0; if (!timer) playBtn.textContent = 'もう一度再生'; };
    next();
  }
  playBtn.addEventListener('click', play);
  host.querySelectorAll('[data-rot]').forEach(b => b.addEventListener('click', () => { rz += 45 * b.dataset.rot; turn(); }));
  host.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
    stop(); mode = b.dataset.mode;
    host.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    build();
  }));
  // ドラッグで回す（横 → 回転、縦 → 見下ろす角度）
  let drag = null;
  view.addEventListener('pointerdown', e => { if (e.target.closest('.r3-pin')) return; drag = { x: e.clientX, y: e.clientY, rz, rx }; view.setPointerCapture(e.pointerId); view.classList.add('is-drag'); });
  view.addEventListener('pointermove', e => { if (!drag) return; rz = drag.rz + (e.clientX - drag.x) * 0.4; rx = Math.max(20, Math.min(72, drag.rx - (e.clientY - drag.y) * 0.25)); turn(); });
  const end = () => { drag = null; view.classList.remove('is-drag'); };
  view.addEventListener('pointerup', end); view.addEventListener('pointercancel', end);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
  build();
})();
