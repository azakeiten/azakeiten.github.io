/* ================================================================
   asagohan.js — 経済ラボ：朝ごはんの世界旅行（近づいてから読みこむ）
   ・お盆に朝ごはんをのせると、その材料のおもな輸入先から日本へ、地図の上を船が進む
   ・東京までの直線のきょり（目安）を、地球の丸さで計算して足していく
   ・輸入先は「おもな例」。年や商品によって変わる。国産のものは、日本が光る
   ・地図は、大陸の形をおおまかにした点の地図（日本が真ん中）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-asagohan]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 720, H = 300, L0 = -18;   // 西経 18 度を左はしにする（ヨーロッパ・アフリカが左、日本がまん中、アメリカ大陸が右）
  const X = lon => ((lon - L0) % 360 + 360) % 360 / 360 * W;
  const Y = lat => (80 - lat) / 140 * H;
  // 大陸のおおまかな形（経度, 緯度）
  const LAND = [
    [-168,66,-140,70,-95,72,-80,63,-60,55,-53,47,-70,43,-76,35,-81,25,-97,26,-97,19,-88,15,-80,8,-84,10,-105,20,-117,32,-124,40,-124,48,-135,58,-150,60,-165,55],
    [-50,60,-20,70,-25,82,-60,80,-72,77],
    [-80,8,-72,12,-60,10,-50,0,-35,-6,-40,-22,-48,-28,-58,-38,-65,-55,-72,-50,-71,-30,-80,-6],
    [-10,36,-9,43,-2,44,-5,48,2,51,8,54,5,58,10,63,20,70,30,71,40,67,45,60,40,48,30,45,28,41,24,38,15,38,12,44,3,42,-5,36],
    [-5,50,2,52,-2,56,-5,58,-6,54],
    [-17,15,-17,21,-10,30,-6,36,10,37,20,32,32,31,35,28,43,12,51,12,42,-2,40,-15,35,-25,20,-35,17,-29,12,-17,9,-1,3,6,-8,4,-14,10],
    [44,-25,50,-15,49,-12,43,-20],
    [28,41,40,48,45,60,60,70,80,73,110,76,140,72,170,70,180,66,175,62,160,60,155,52,140,54,135,44,128,40,126,35,120,30,122,23,110,20,108,12,104,10,100,13,98,8,100,2,104,1,98,16,92,22,88,22,80,15,78,8,72,20,66,25,57,25,58,23,55,17,44,13,39,21,34,28,35,36],
    [130,31,132,34,135,34,140,35,141,38,142,40,141,42,145,44,141,45.5,140,42,139,38,136,37,133,35.5,130,34],
    [117,8,122,6,126,7,124,13,122,18,120,16],
    [109,1,117,7,119,1,116,-4,110,-3], [95,5,106,-6,104,-6,100,0], [131,-1,141,-2,150,-10,141,-9],
    [114,-22,122,-18,130,-12,137,-12,142,-11,146,-19,153,-27,150,-37,141,-38,135,-35,129,-32,116,-35,114,-26],
    [172,-34,178,-38,174,-41,171,-46,167,-46], [80,9,82,7,81,6,80,7]
  ].map(a => { const p = []; for (let i = 0; i < a.length; i += 2) p.push([X(a[i]), Y(a[i + 1])]); return p; });
  const inside = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  let dots = '';
  for (let y = 4; y < H; y += 7) for (let x = 4 + ((y / 7 | 0) % 2) * 3.5; x < W; x += 7) if (LAND.some(p => inside(x, y, p))) dots += `M${x.toFixed(1)} ${y}h.01`;
  // 国（経度, 緯度）
  const C = {
    jp: ['日本', 139.7, 35.7], ph: ['フィリピン', 121, 14.6], br: ['ブラジル', -47, -15.8], vn: ['ベトナム', 106, 16], co: ['コロンビア', -74, 4.6],
    us: ['アメリカ', -98, 39], ca: ['カナダ', -106, 52], au: ['オーストラリア', 145, -30], cl: ['チリ', -71, -35], no: ['ノルウェー', 9, 61],
    th: ['タイ', 101, 14], lk: ['スリランカ', 80.8, 7.5], in: ['インド', 78, 22], ke: ['ケニア', 37.5, 0]
  };
  // [印, 名前, 材料, 輸入先, ひとこと, えさの輸入先]
  const F = [
    ['米', 'ご飯', 'お米', [], 'お米は、ほとんどが国産。'],
    ['豆', '納豆', '大豆', ['us', 'ca'], '納豆の大豆は、アメリカやカナダから来るものが多い（国産大豆の納豆もある）。'],
    ['味', 'みそ汁', 'みその大豆', ['us', 'ca'], 'みそ・しょうゆの大豆も、多くが輸入。'],
    ['鮭', '焼き鮭', 'さけ', ['cl', 'no'], '養殖のさけは、チリやノルウェーから。秋にとれる国産のさけもある。'],
    ['卵', '卵', '卵', [], '卵はほとんど国産。でも、にわとりのえさのとうもろこしは、アメリカやブラジルから。', ['us', 'br']],
    ['乳', '牛乳', '牛乳', [], '牛乳は国産。牛のえさには、輸入されたものも多い。', ['us']],
    ['麦', 'トースト', '小麦', ['us', 'ca', 'au'], 'パンの小麦は、アメリカ・カナダ・オーストラリアから来るものが多い。'],
    ['珈', 'コーヒー', 'コーヒー豆', ['br', 'vn', 'co'], 'コーヒー豆は、ブラジル・ベトナム・コロンビアなど、赤道に近い国から。'],
    ['果', 'バナナ', 'バナナ', ['ph'], '日本のバナナは、多くがフィリピンから。'],
    ['柑', 'オレンジジュース', 'オレンジの果汁', ['br', 'us'], '果汁は、ブラジルやアメリカから。'],
    ['茶', '紅茶', '茶葉', ['lk', 'in', 'ke'], '紅茶の茶葉は、スリランカ・インド・ケニアなどから。'],
    ['糖', '砂糖', '砂糖の原料', ['th', 'au'], '原料の一部はタイやオーストラリアから。北海道のてんさい、沖縄・鹿児島のさとうきびからもつくる。']
  ];
  const LB = { vn: [-6, -5, "end"], ph: [7, 5, "start"], lk: [0, 15, "middle"], in: [-5, -6, "end"], ca: [0, -9, "middle"], us: [8, 4, "start"] };   // 名前が重ならないように、少しずらす
  const PRESET = { wa: [0, 1, 2, 3, 4], yo: [6, 7, 8, 9, 5], kokusan: [0, 4, 5] };
  const km = (a, b) => { const r = Math.PI / 180, [, lo1, la1] = C[a], [, lo2, la2] = C[b]; const d = Math.sin((la2 - la1) * r / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin((lo2 - lo1) * r / 2) ** 2; return 2 * 6371 * Math.asin(Math.sqrt(d)); };
  const P = k => [X(C[k][1]), Y(C[k][2])];
  const route = (k, bend = 1) => { const [x1, y1] = P(k), [x2, y2] = P('jp'), mx = (x1 + x2) / 2, my = Math.min(y1, y2) - Math.abs(x2 - x1) * .16 * bend - 14; return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`; };
  const fmt = n => Math.round(n / 100) * 100;
  const on = new Set();
  const [jx, jy] = P('jp');
  box.innerHTML = `<div class="as-map-wrap">
      <svg class="as-map" viewBox="0 0 ${W} ${H}" role="img" aria-label="世界の点の地図。選んだ朝ごはんの材料が、輸入先から日本へ運ばれる">
        <defs><radialGradient id="asGlow"><stop offset="0" stop-color="#e3b341" stop-opacity=".8"/><stop offset="1" stop-color="#e3b341" stop-opacity="0"/></radialGradient></defs>
        <path d="${dots}" class="as-dots"/>
        <g class="as-routes"></g>
        ${Object.entries(C).filter(([k]) => k !== 'jp').map(([k, [n]]) => { const [x, y] = P(k); return `<g class="as-c" data-c="${k}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><circle r="9" class="as-c-ring"/><circle r="3.4" class="as-c-dot"/><text x="${(LB[k] || [0])[0]}" y="${(LB[k] || [0, -9])[1]}" style="text-anchor:${(LB[k] || [0, 0, "middle"])[2]}">${n}</text></g>`; }).join('')}
        <g class="as-jp" transform="translate(${jx.toFixed(1)},${jy.toFixed(1)})"><circle r="26" fill="url(#asGlow)" class="as-jp-glow"/><circle r="5" class="as-jp-dot"/><text y="19">日本</text></g>
      </svg>
      <div class="as-total"><span>材料が旅したきょり（合計の目安）</span><b data-total>0</b><small>km</small></div>
    </div>
    <div class="as-side">
      <p class="as-h">お盆にのせる朝ごはんを、えらんでね</p>
      <div class="as-foods">${F.map(([s, n], i) => `<button type="button" class="as-food" data-f="${i}" aria-pressed="false"><span class="as-seal">${s}</span>${n}</button>`).join('')}</div>
      <div class="as-presets"><button type="button" data-p="wa">和の朝ごはん</button><button type="button" data-p="yo">洋の朝ごはん</button><button type="button" data-p="kokusan">国産だけで</button><button type="button" data-p="clear">お盆を空に</button></div>
      <div class="as-tray" aria-live="polite"></div>
    </div>
    <div class="as-learn">
      <p><b>なぜ、遠くから運ぶの？</b>気候や土地に合ったものを、得意な国がたくさんつくり、ほかの国と交換したほうが、おたがいに得をしやすいから。これを<a href="glossary.html#comparative-advantage">比較優位</a>という考え方で説明します。国と国の売り買いには、<a href="glossary.html#tariff">関税</a>や<a href="glossary.html#free-trade">自由貿易</a>のルールも関わります。</p>
      <p><b>日本の食べもの</b>日本の食料自給率は、カロリーで見ると約 4 割。国産の卵や牛乳も、えさの多くは海外から来ています。遠くから運ぶほど、燃料もたくさん使います。</p>
    </div>
    <p class="as-note">輸入先は、おもな例です。年や商品によって変わります（財務省の貿易統計や、農林水産省の資料で調べられます）。きょりは、それぞれの国のまん中あたりから東京までの直線のきょりで、実際に船が通る道のりはもっと長くなります。</p>`;
  const routes = box.querySelector('.as-routes'), tray = box.querySelector('.as-tray'), totalEl = box.querySelector('[data-total]');
  let shown = 0, raf = 0;
  const countTo = to => {
    cancelAnimationFrame(raf);
    const from = shown, t0 = performance.now(), dur = reduce ? 0 : 700;
    const step = t => { const k = dur ? Math.min(1, (t - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3); shown = Math.round(from + (to - from) * e); totalEl.textContent = shown.toLocaleString(); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  };
  const draw = () => {
    const sel = [...on].sort((a, b) => a - b);
    const used = new Map();   // 国 → 何本目か（同じ国から複数あると、少しずつ曲がりを変える）
    let html = '', total = 0, local = false;
    sel.forEach(i => {
      const [, , , from, , feed] = F[i];
      if (!from.length) local = true;
      [...from.map(k => [k, 0]), ...(feed || []).map(k => [k, 1])].forEach(([k, isFeed]) => {
        const n = used.get(k) || 0; used.set(k, n + 1);
        const d = route(k, 1 + n * .35), dist = km(k, 'jp'), dur = (2.2 + dist / 4000).toFixed(2);
        if (!isFeed) total += dist;
        html += `<g class="as-r${isFeed ? ' is-feed' : ''}" data-f="${i}"><path d="${d}" class="as-line" pathLength="1"/><g class="as-ship"><rect x="-5" y="-3" width="10" height="6" rx="2"/><animateMotion dur="${dur}s" repeatCount="indefinite" rotate="auto" path="${d}" begin="-${(n * .7).toFixed(1)}s"/></g></g>`;
      });
    });
    routes.innerHTML = html;
    box.querySelectorAll('.as-c').forEach(g => g.classList.toggle('is-on', used.has(g.dataset.c)));
    box.querySelector('.as-jp').classList.toggle('is-local', local);
    box.querySelectorAll('.as-food').forEach(b => { const v = on.has(+b.dataset.f); b.classList.toggle('is-on', v); b.setAttribute('aria-pressed', v); });
    countTo(Math.round(total));
    tray.innerHTML = sel.length ? `<ul>${sel.map(i => { const [s, n, m, from, note, feed] = F[i]; const far = from.length ? Math.max(...from.map(k => km(k, 'jp'))) : 0;
      return `<li class="as-dish"><span class="as-seal">${s}</span><div><p class="as-dish-h"><b>${n}</b>${from.length ? `${m}：${from.map(k => C[k][0]).join('・')}から` : `${m}：国産${feed ? '（えさは ' + feed.map(k => C[k][0]).join('・') + ' から）' : ''}`}${far ? `<small>いちばん遠くて約 ${fmt(far).toLocaleString()} km</small>` : ''}</p><p class="as-dish-t">${note}</p></div></li>`; }).join('')}</ul>`
      : '<p class="as-empty">お盆は空っぽ。上の朝ごはんを押すと、材料が世界から船でやってきます。</p>';
    try { if (sel.length) localStorage.setItem('azakei_asagohan', JSON.stringify(sel)); } catch (e) {}
  };
  box.addEventListener('click', e => {
    const b = e.target.closest('.as-food');
    if (b) { const i = +b.dataset.f; on.has(i) ? on.delete(i) : on.add(i); draw(); return; }
    const p = e.target.closest('[data-p]');
    if (p) { on.clear(); (PRESET[p.dataset.p] || []).forEach(i => on.add(i)); draw(); }
  });
  /* ================================================================
     v363：「朝ごはん港の荷受け」— 材料はどの国から？ 地図の国を押して当てるゲーム
     ・朝ごはんが 1 品ずつ出る。材料のおもな輸入先（国産なら日本）を、地図の光る 4 か国から選ぶ
     ・1 品 12 秒。早いほど高い点。当たると、その国から日本へ船が走る
     ・終わったら、材料の旅の合計きょりと、まちがえた品の答え合わせ
     ・自己ベストは azakei_asagohan_best
     ================================================================ */
  (function () {
    if (!document.querySelector('link[href^="asgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'asgame.css?v=20261126i'; document.head.appendChild(l); }
    const KEY = 'azakei_asagohan_best', N = 8, SEC = 12;
    const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
    const g = document.createElement('div');
    g.className = 'ag';
    box.before(g);
    box.insertAdjacentHTML('beforebegin', '<p class="ag-sub"><span aria-hidden="true">験</span>じっくりためす：お盆にのせて、材料の旅を地図で見る</p>');
    const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const KS = Object.keys(C);
    const TITLE = [[700, '世界の港の名人'], [500, 'たよれる荷受け係'], [250, '港の見習い'], [0, 'これから世界を知ろう']];
    let st = null, tick = 0;
    const map = () => `<svg class="ag-map" viewBox="0 0 ${W} ${H}" role="img" aria-label="世界の点の地図。光っている国が、答えの候補">
        <path d="${dots}" class="as-dots"/>
        <g class="ag-routes"></g>
        ${KS.map(k => { const [x, y] = P(k); return `<g class="ag-c${k === 'jp' ? ' is-jp' : ''}" data-c="${k}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><circle r="26" class="ag-hit"/><circle r="11" class="ag-ring"/><circle r="3.6" class="ag-dot"/><text y="${y > H - 40 ? -16 : 22}">${C[k][0]}</text></g>`; }).join('')}
      </svg>`;
    const intro = () => {
      const b = getB();
      g.innerHTML = `<div class="ag-intro">
        <div class="ag-crate" aria-hidden="true"><i>麦</i><i>珈</i><i>果</i></div>
        <div><p class="ag-kicker">地図でこたえる</p><h3 class="ag-h">朝ごはん港の荷受け</h3>
        <p class="ag-p">港に朝ごはんの材料がとどきます。どの国から来た？ 地図で光る 4 つの国から、<b>おもな輸入先</b>を押してください（国産なら<b>日本</b>）。1 品 12 秒、全部で ${N} 品。早く当てるほど高い点で、当たると船が日本へ走ります。</p>
        <p class="ag-best">${b ? `自己ベスト <b>${b}</b> 点` : 'はじめての荷受け'}</p>
        <button type="button" class="ag-go" data-ag="start">港をあける</button></div></div>`;
    };
    const start = () => {
      st = { q: shuffle(F.map((_, i) => i)).slice(0, N), at: 0, score: 0, ok: 0, miss: [], km: 0, lock: false };
      g.innerHTML = `<div class="ag-play">
        <div class="ag-top"><span class="ag-n"><b data-ag="n">1</b> / ${N} 品</span><span class="ag-sc">得点 <b data-ag="sc">0</b></span></div>
        <div class="ag-time" aria-hidden="true"><i data-ag="bar"></i></div>
        <div class="ag-card" data-ag="card" aria-live="polite"></div>
        <div class="ag-mapw">${map()}</div>
        <div class="ag-keys" data-ag="keys"></div>
        <p class="ag-fb" data-ag="fb" aria-live="polite"></p></div>`;
      show();
    };
    const show = () => {
      const i = st.q[st.at], [s, n, m, from] = F[i];
      const right = from.length ? from : ['jp'];
      const ans = right[Math.random() * right.length | 0];
      const both = /国産|北海道/.test(F[i][4]);   // 国産もある品では、日本をはずれの選択肢にしない
      const wrong = shuffle(KS.filter(k => !right.includes(k) && !(both && k === 'jp'))).slice(0, 3);
      st.ch = shuffle([ans, ...wrong]); st.right = right; st.t0 = performance.now();
      g.querySelector('[data-ag="n"]').textContent = st.at + 1;
      const card = g.querySelector('[data-ag="card"]');
      card.innerHTML = `<span class="ag-seal" aria-hidden="true">${s}</span><p><b>${n}</b><small>${n === m ? 'どの国から来た？' : m + 'は、どの国から？'}</small></p>`;
      card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
      g.querySelector('.ag-routes').innerHTML = '';
      g.querySelectorAll('.ag-c').forEach(c => { c.classList.toggle('is-ch', st.ch.includes(c.dataset.c)); c.classList.remove('is-ok', 'is-ng'); });
      g.querySelector('[data-ag="keys"]').innerHTML = st.ch.map(k => `<button type="button" data-k="${k}">${C[k][0]}</button>`).join('');
      g.querySelector('[data-ag="fb"]').textContent = '';
      st.lock = false;
      clearInterval(tick);
      tick = setInterval(() => {
        if (!st || st.lock) return;
        const left = Math.max(0, SEC - (performance.now() - st.t0) / 1000);
        const bar = g.querySelector('[data-ag="bar"]');
        bar.style.transform = `scaleX(${(left / SEC).toFixed(3)})`; bar.classList.toggle('is-low', left < 4);
        if (left <= 0) answer(null);
      }, 100);
    };
    const answer = k => {
      if (!st || st.lock) return;
      st.lock = true; clearInterval(tick);
      const i = st.q[st.at], f = F[i], ok = k && st.right.includes(k);
      const left = Math.max(0, SEC - (performance.now() - st.t0) / 1000);
      const fb = g.querySelector('[data-ag="fb"]');
      const names = st.right.map(x => C[x][0]).join('・');
      if (ok) { const pts = 50 + Math.round(left * 5); st.score += pts; st.ok++; fb.className = 'ag-fb is-ok'; fb.innerHTML = `<b>正解 ＋${pts}</b>${f[4]}`; }
      else { st.miss.push(i); fb.className = 'ag-fb is-ng'; fb.innerHTML = `<b>${k ? 'ざんねん' : '時間切れ'}</b>${f[3].length ? names + 'から。' : '国産です。'}${f[4]}`; }
      g.querySelector('[data-ag="sc"]').textContent = st.score;
      g.querySelectorAll('.ag-c').forEach(c => { const x = c.dataset.c; c.classList.toggle('is-ok', st.right.includes(x)); c.classList.toggle('is-ng', x === k && !ok); });
      g.querySelectorAll('[data-ag="keys"] button').forEach(b => { b.disabled = true; b.classList.toggle('is-ok', st.right.includes(b.dataset.k)); b.classList.toggle('is-ng', b.dataset.k === k && !ok); });
      // 船を走らせる（えさの輸入先は、うすい線で）
      let html = '';
      [...f[3].map(x => [x, 0]), ...(f[5] || []).map(x => [x, 1])].forEach(([x, feed], n) => {
        const d = route(x, 1 + n * .3), dist = km(x, 'jp');
        if (!feed) st.km += dist;
        html += `<g class="as-r${feed ? ' is-feed' : ''}"><path d="${d}" class="as-line" pathLength="1"/><g class="as-ship"><rect x="-5" y="-3" width="10" height="6" rx="2"/><animateMotion dur="${(1.6 + dist / 6000).toFixed(2)}s" repeatCount="indefinite" rotate="auto" path="${d}"/></g></g>`;
      });
      g.querySelector('.ag-routes').innerHTML = html;
      const next = document.createElement('button');
      next.type = 'button'; next.className = 'ag-next'; next.dataset.ag = 'next';
      next.textContent = st.at + 1 < N ? '次の荷物へ' : '結果を見る';
      fb.append(next);
      next.focus({ preventScroll: true });
    };
    const finish = () => {
      const s = st; st = null;
      const prev = getB(), best = s.score > prev;
      try { if (best) localStorage.setItem(KEY, String(s.score)); if (!localStorage.getItem('azakei_asagohan')) localStorage.setItem('azakei_asagohan', '[]'); } catch (e) {}
      const ti = TITLE.findIndex(x => s.score >= x[0]);
      const miss = s.miss;
      g.innerHTML = `<div class="ag-end">
        <p class="ag-kicker">本日の荷受け</p>
        <p class="ag-big"><b>${s.score}</b> 点<small>${N} 品中 ${s.ok} 品正解</small></p>
        <p class="ag-title"><span aria-hidden="true">称</span>${TITLE[ti][1]}${best ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${prev} 点</small>` : ''}</p>
        <div class="ag-km"><span>きょうの材料が旅したきょり（目安）</span><b>${fmt(s.km).toLocaleString()}</b><small>km</small><p>地球 1 周は約 4 万 km。船で何週間もかけて運ばれてくるものもあります。</p></div>
        ${miss.length ? `<p class="ag-l">答え合わせ</p><ul class="ag-miss">${miss.map(i => { const [sl, n, m, from, note] = F[i]; return `<li><span class="ag-seal" aria-hidden="true">${sl}</span><p><b>${n}</b><small>${m}：${from.length ? from.map(k => C[k][0]).join('・') + 'から' : '国産'}</small>${note}</p></li>`; }).join('')}</ul>` : '<p class="ag-perfect">全問正解！ 世界の港の地図が、頭に入っています。</p>'}
        <p class="ag-note">輸入先は、おもな例です。年や商品によって変わります。</p>
        <button type="button" class="ag-go" data-ag="start">もう一度、港に立つ</button></div>`;
      window.AZAKEI_TALK && window.AZAKEI_TALK(g, 'asagohan', ti, TITLE.length);
    };
    g.addEventListener('click', e => {
      if (e.target.closest('[data-ag="start"]')) { start(); return; }
      if (e.target.closest('[data-ag="next"]')) { st.at++; st.at < N ? show() : finish(); return; }
      const b = e.target.closest('[data-k]'); if (b) { answer(b.dataset.k); return; }
      const c = e.target.closest('.ag-c.is-ch'); if (c) answer(c.dataset.c);
    });
    intro();
  })();
  draw();
})();
