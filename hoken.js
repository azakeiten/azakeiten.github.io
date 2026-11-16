/* ================================================================
   hoken.js — 経済ラボ：みんなで備える箱（保険のしくみ・近づいてから読みこむ）
   ・まちの家が、毎年すこしずつ掛け金を「そなえ箱」へ。こまったことが起きた家へ、箱からお金が届く
   ・まちのルールは「たとえ」：どの家も 1 年に 5%（20 回に 1 回くらい）こまったことが起き、10 万円かかる
   ・20 けん／100 けんで、毎年のばらつきのちがい（大数の法則）を見くらべる
   ・「大きな台風」：みんなに一度に起きる年。箱に余裕を残す大切さ
   ================================================================ */
(function () {
  const box = document.querySelector('[data-hoken]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const P = 0.05, COST = 100000, YEARS = 10, STORM_P = 0.25;
  const CX = 320, CY = 205, SLOT = [CX, CY - 60];
  const TROUBLE = ['雨もり', '自転車の事故', '骨折', '水道管がこわれた', '窓ガラスが割れた', '入院', '屋根がこわれた', '冷蔵庫がこわれた'];
  const ROOF = ['#b5432f', '#8a5a2b', '#5f7f4e', '#3b5a78', '#a0662f'];
  const yen = n => (n < 0 ? '−' : '') + '¥' + Math.abs(Math.round(n)).toLocaleString();

  box.innerHTML = `
    <div class="hk-stage">
      <svg class="hk-town" viewBox="0 0 640 400" role="img" aria-label="まちの家と、まん中のそなえ箱">
        <defs><clipPath id="hk-clip"><rect x="-50" y="-30" width="100" height="46" rx="6"/></clipPath>
          <linearGradient id="hk-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#c9921f"/></linearGradient></defs>
        <ellipse class="hk-ground" cx="${CX}" cy="${CY + 10}" rx="300" ry="182"/>
        <ellipse class="hk-road" cx="${CX}" cy="${CY + 6}" rx="118" ry="78"/>
        <g class="hk-houses"></g>
        <g class="hk-chest" transform="translate(${CX} ${CY})">
          <ellipse class="hk-shade" cx="0" cy="54" rx="72" ry="10"/>
          <rect class="hk-body" x="-64" y="-44" width="128" height="96" rx="10"/>
          <rect class="hk-band" x="-64" y="18" width="128" height="6"/>
          <path class="hk-lid" d="M-68 -42 Q0 -74 68 -42 Z"/>
          <rect class="hk-slot" x="-18" y="-63" width="36" height="5" rx="2.5"/>
          <rect class="hk-glass" x="-50" y="-30" width="100" height="46" rx="6"/>
          <g clip-path="url(#hk-clip)"><rect class="hk-fill" x="-50" y="-30" width="100" height="46"/><path class="hk-shine" d="M-40 -30 L-22 -30 L-46 16 L-50 16 L-50 -18 Z"/></g>
          <text class="hk-bal" y="42">¥0</text>
          <text class="hk-name" y="-80">そなえ箱</text>
        </g>
        <g class="hk-fx"></g>
        <g class="hk-pops"></g>
        <g class="hk-rain" aria-hidden="true">${Array.from({ length: 46 }, () => `<line x1="${(Math.random() * 660 - 10).toFixed(0)}" y1="${(Math.random() * 400 - 30).toFixed(0)}" style="animation-delay:-${(Math.random()).toFixed(2)}s"/>`).join('')}</g>
      </svg>
      <p class="hk-year" aria-live="polite"><b>0</b><span>年目</span></p>
      <p class="hk-msg" aria-live="polite">掛け金を決めて、「10 年すすめる」を押してみよう。</p>
    </div>
    <div class="hk-side">
      <p class="hk-rule"><b>まちのルール（たとえ）</b>どの家にも、1 年に 20 回に 1 回くらい（5%）、こまったことが起きます。直すのに 10 万円。だれに起きるかは、だれにもわかりません。</p>
      <label class="hk-prem"><span>1 けんが 1 年に出す掛け金</span><output>¥2,000</output><input type="range" min="1000" max="10000" step="500" value="2000"></label>
      <div class="hk-opts">
        <div class="hk-seg" role="group" aria-label="まちの家の数"><button type="button" data-n="20" aria-pressed="true">20 けん</button><button type="button" data-n="100" aria-pressed="false">100 けん</button></div>
        <label class="hk-chk"><input type="checkbox" data-storm> 大きな台風の年がある</label>
        <label class="hk-chk"><input type="checkbox" data-fast> はやおくり</label>
      </div>
      <div class="hk-btns"><button type="button" class="hk-go" data-a="play">10 年すすめる</button><button type="button" data-a="step">1 年すすめる</button><button type="button" data-a="reset">はじめから</button></div>
      <dl class="hk-led"><div><dt>箱の中</dt><dd data-k="bal">¥0</dd></div><div><dt>今年 集めた</dt><dd data-k="in">—</dd></div><div><dt>今年 払った</dt><dd data-k="out">—</dd></div></dl>
      <svg class="hk-chart" viewBox="0 0 300 118" role="img" aria-label="年ごとの、集めたお金と払ったお金"></svg>
      <p class="hk-legend"><i class="is-in"></i>集めた掛け金 <i class="is-out"></i>払ったお金 <i class="is-ex"></i>追加の集金</p>
      <p class="hk-you"><b>あなたの家</b>（金色の家）<span data-k="you">まだ何も起きていません。</span></p>
    </div>
    <div class="hk-result" hidden></div>
    <div class="hk-learn">
      <p><b>保険のしくみ</b>起きると大変だけれど、だれに起きるかわからないこと。みんなで少しずつ出し合って、こまった人に回すのが<a href="glossary.html#insurance">保険</a>です。</p>
      <p><b>大数の法則</b>1 けんだけなら、起きるかどうかは運しだい。でも人数が多いほど、全体で何けんくらい起きるかが、だいたい読めるようになります。だから掛け金を決められるのです。</p>
      <p><b>掛け金のめやす</b>「起きる確率 × かかるお金」。このまちなら 5% × 10 万円 ＝ 5,000 円。実際の保険では、ここに事務などの費用も加わります。</p>
      <p><b>身近な保険</b>病院の窓口で払うのは、多くの人で、かかったお金の 3 割。のこりは、みんなで出し合っている健康保険から払われます（年齢などで割合は変わります）。くわしくは<a href="glossary.html#social-security">社会保障</a>へ。</p>
    </div>
    <p class="hk-note">このまちのルール（5%・10 万円）は、しくみを知るための「たとえ」です。実際の保険の確率や金額ではありません。こまったことは、毎回ランダムに起きます。</p>`;

  const svg = box.querySelector('.hk-town'), stage = box.querySelector('.hk-stage');
  const gH = svg.querySelector('.hk-houses'), fx = svg.querySelector('.hk-fx'), pops = svg.querySelector('.hk-pops');
  const chest = svg.querySelector('.hk-chest'), fill = svg.querySelector('.hk-fill'), balT = svg.querySelector('.hk-bal');
  const yearEl = box.querySelector('.hk-year b'), msgEl = box.querySelector('.hk-msg');
  const range = box.querySelector('.hk-prem input'), out = box.querySelector('.hk-prem output');
  const chart = box.querySelector('.hk-chart'), result = box.querySelector('.hk-result');
  const K = k => box.querySelector(`[data-k="${k}"]`);
  // 雨のすじ（ななめの短い線）
  svg.querySelectorAll('.hk-rain line').forEach(l => { const x = +l.getAttribute('x1'), y = +l.getAttribute('y1'); l.setAttribute('x2', x - 6); l.setAttribute('y2', y + 22); });

  let N = 20, prem = 2000, storm = false, spd = 1, st, pts = [], hs = [], token = 0, running = false, busy = false;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms * spd));

  // ---- まちの家の並び（20 けんは 1 周、100 けんは 3 周）----
  const layout = n => {
    const rings = n === 20 ? [[268, 150, 20]] : [[288, 168, 40], [230, 128, 34], [176, 96, 26]];
    const p = [];
    rings.forEach(([rx, ry, k], r) => { for (let i = 0; i < k; i++) { const a = -Math.PI / 2 + (i + (r % 2) * .5) / k * 2 * Math.PI; p.push([CX + rx * Math.cos(a), CY + 8 + ry * Math.sin(a)]); } });
    return p;
  };
  const build = () => {
    pts = layout(N);
    const s = N === 20 ? 1.7 : .82;
    gH.innerHTML = pts.map(([x, y], i) => `<g class="hk-h${i ? '' : ' is-you'}" style="--roof:${ROOF[(i * 7) % ROOF.length]}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})"><g class="hk-hb"><path class="hk-roof" d="M-11 -2 L0 -12 L11 -2 Z"/><rect class="hk-wall" x="-8.5" y="-3" width="17" height="12" rx="1"/><rect class="hk-win" x="-6" y="0" width="5" height="4" rx=".6"/><rect class="hk-door" x="1.5" y="1" width="4.5" height="8" rx=".6"/></g>${i ? '' : '<g class="hk-tag"' + (N === 20 ? '' : ' transform="scale(1.8)"') + '><rect x="-15" y="-27" width="30" height="12" rx="6"/><text y="-18.2">あなた</text></g>'}</g>`).join('');
    hs = [...gH.children];
    svg.classList.toggle("is-many", N !== 20);
  };

  // ---- コインのとぶ動き ----
  let parts = [], raf = 0;
  const coin = (a, b, delay, cls) => {
    if (reduce) return;
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', N === 20 ? 4.2 : 3); c.setAttribute('class', 'hk-coin' + (cls ? ' ' + cls : '')); c.style.opacity = 0;
    fx.appendChild(c);
    parts.push({ c, a, b, t0: performance.now() + delay * spd, d: 640 * Math.max(spd, .55) });
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const tick = now => {
    parts = parts.filter(p => {
      const k = (now - p.t0) / p.d;
      if (k < 0) return true;
      if (k >= 1) { p.c.remove(); return false; }
      const e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2, f = 1 - e;
      const mx = (p.a[0] + p.b[0]) / 2, my = Math.min(p.a[1], p.b[1]) - 46;
      p.c.setAttribute('cx', (f * f * p.a[0] + 2 * f * e * mx + e * e * p.b[0]).toFixed(1));
      p.c.setAttribute('cy', (f * f * p.a[1] + 2 * f * e * my + e * e * p.b[1]).toFixed(1));
      p.c.style.opacity = 1;
      return true;
    });
    raf = parts.length ? requestAnimationFrame(tick) : 0;
  };
  const top = i => [pts[i][0], pts[i][1] - (N === 20 ? 16 : 8)];
  const pop = (i, t, sub) => {
    if (reduce) return;
    const g = document.createElementNS(NS, 'g');
    const [x, y] = pts[i];
    g.setAttribute('class', 'hk-pop'); g.setAttribute('transform', `translate(${x.toFixed(1)} ${(y - (N === 20 ? 28 : 16)).toFixed(1)})`);
    g.innerHTML = `<text>${t}</text>${sub ? `<text class="hk-pop-s" y="13">${sub}</text>` : ''}`;
    pops.appendChild(g); setTimeout(() => g.remove(), 1900 * Math.max(spd, .6));
  };
  const gulp = () => { chest.classList.remove('is-gulp'); void chest.getBBox(); chest.classList.add('is-gulp'); };

  // ---- 表示 ----
  const full = () => N * 10000;   // 箱が「いっぱい」に見える量（めやすの掛け金 2 年分）
  const show = (inY, outY) => {
    const lv = Math.max(0, Math.min(1, st.bal / full()));
    fill.style.transform = `scaleY(${lv.toFixed(3)})`;
    balT.textContent = yen(st.bal);
    K('bal').textContent = yen(st.bal);
    if (inY != null) K('in').textContent = yen(inY);
    if (outY != null) K('out').textContent = yen(outY);
    const y = st.you;
    K('you').textContent = st.y ? `払った ${yen(y.paid)} ／ 受け取った ${yen(y.got)}${y.hit ? `（こまったこと ${y.hit} 回）` : ''}` : 'まだ何も起きていません。';
  };
  const drawChart = () => {
    const h = st.hist, mx = Math.max(N * prem, ...h.map(r => r.out), ...h.map(r => r.ex), 1) * 1.12;
    const Yv = v => 98 - v / mx * 88;
    let s = `<line class="hk-ax" x1="14" y1="98" x2="296" y2="98"/>`;
    for (let i = 0; i < YEARS; i++) {
      const x = 18 + i * 28, r = h[i];
      s += `<text class="hk-yr" x="${x + 10}" y="113">${i + 1}</text>`;
      if (!r) { s += `<rect class="hk-slotbar" x="${x}" y="10" width="20" height="88" rx="3"/>`; continue; }
      if (r.out) s += `<rect class="hk-bout${r.storm ? ' is-storm' : ''}" x="${x + 3}" y="${Yv(r.out).toFixed(1)}" width="14" height="${(98 - Yv(r.out)).toFixed(1)}" rx="2"/>`;
      if (r.ex) s += `<rect class="hk-bex" x="${x + 13}" y="${Yv(r.ex).toFixed(1)}" width="6" height="${(98 - Yv(r.ex)).toFixed(1)}" rx="1.5"/>`;
      s += `<line class="hk-bin" x1="${x - 1}" x2="${x + 21}" y1="${Yv(r.in).toFixed(1)}" y2="${Yv(r.in).toFixed(1)}"/>`;
    }
    chart.innerHTML = s;
  };
  const say = t => { msgEl.textContent = t; msgEl.classList.remove('is-new'); void msgEl.offsetWidth; msgEl.classList.add('is-new'); };
  const btns = () => {
    const end = st.y >= YEARS;
    const go = box.querySelector('[data-a="play"]');
    go.textContent = running ? 'とめる' : end ? 'もう一度（新しい 10 年）' : st.y ? 'のこりをすすめる' : '10 年すすめる';
    box.querySelector('[data-a="step"]').disabled = running || busy || end;
  };

  const reset = () => {
    token++; running = false; busy = false;
    parts.forEach(p => p.c.remove()); parts = []; pops.innerHTML = '';
    stage.classList.remove('is-storm', 'is-end'); chest.classList.remove('is-short');
    st = { y: 0, bal: 0, hist: [], short: 0, extra: 0, stormYear: storm ? 3 + Math.floor(Math.random() * 6) : 0, you: { paid: 0, got: 0, hit: 0 } };
    build(); yearEl.textContent = '0';
    K('in').textContent = '—'; K('out').textContent = '—';
    show(); drawChart(); result.hidden = true; result.innerHTML = '';
    say('掛け金を決めて、「10 年すすめる」を押してみよう。');
    btns();
  };

  // ---- 1 年分 ----
  const step = async t => {
    if (busy || st.y >= YEARS) return;
    busy = true; btns();
    st.y++; yearEl.textContent = st.y; yearEl.parentNode.classList.remove('is-tick'); void yearEl.offsetWidth; yearEl.parentNode.classList.add('is-tick');
    // 1. 掛け金を集める
    say(`${st.y} 年目。みんなが 1 年分の掛け金を、そなえ箱へ。`);
    hs.forEach((h, i) => { h.classList.add('is-pay'); coin(top(i), SLOT, i * (520 / N)); });
    await sleep(820); if (t !== token) return;
    hs.forEach(h => h.classList.remove('is-pay'));
    const inY = N * prem; st.bal += inY; st.you.paid += prem; gulp(); show(inY, 0);
    await sleep(420); if (t !== token) return;
    // 2. こまったことが起きる
    const isStorm = st.y === st.stormYear;
    if (isStorm) { stage.classList.add('is-storm'); say('大きな台風！ たくさんの家で、一度にこまったことが。'); await sleep(1100); if (t !== token) return; }
    const p = isStorm ? STORM_P : P, hits = [];
    for (let i = 0; i < N; i++) if (Math.random() < p) hits.push(i);
    if (!hits.length) say(`${st.y} 年目は、こまったことが起きませんでした。箱にお金がたまります。`);
    else if (!isStorm) say(`こまったことが ${hits.length} けんで。箱から 1 けんに 10 万円ずつ届けます。`);
    else say(`台風で ${hits.length} けんがこまりました。箱から 1 けんに 10 万円ずつ。`);
    const per = N === 20 ? 5 : 3, label = hits.length <= 6;
    hits.forEach((i, k) => {
      hs[i].classList.add('is-hit');
      if (label || i === 0) pop(i, isStorm ? '台風' : TROUBLE[Math.floor(Math.random() * TROUBLE.length)], '＋10 万円');
      for (let c = 0; c < per; c++) coin(SLOT, top(i), Math.min(k, 14) * 90 + c * 70, 'is-pay');
    });
    if (hits.length) await sleep(900 + Math.min(hits.length, 14) * 70);
    if (t !== token) return;
    const outY = hits.length * COST; st.bal -= outY;
    if (hits.includes(0)) { st.you.got += COST; st.you.hit++; }
    show(inY, outY);
    await sleep(500); if (t !== token) return;
    // 3. 足りなければ、追加で集める
    let ex = 0;
    if (st.bal < 0) {
      const each = Math.ceil(-st.bal / N / 100) * 100; ex = each * N;
      chest.classList.add('is-short');
      say(`箱が足りない！ 1 けん ${yen(each)} ずつ、追加で集めます。`);
      await sleep(700); if (t !== token) return;
      hs.forEach((h, i) => coin(top(i), SLOT, i * (420 / N), 'is-ex'));
      await sleep(900); if (t !== token) return;
      st.bal += ex; st.extra += ex; st.short++; st.you.paid += each; chest.classList.remove('is-short'); gulp(); show();
      await sleep(400); if (t !== token) return;
    }
    hs.forEach(h => h.classList.remove('is-hit')); stage.classList.remove('is-storm');
    st.hist.push({ in: inY, out: outY, ex, storm: isStorm, n: hits.length });
    drawChart();
    busy = false;
    if (st.y >= YEARS) finish();
    btns();
  };

  const play = async () => {
    if (st.y >= YEARS) reset();
    running = true; btns();
    const t = token;
    while (running && t === token && st.y < YEARS) { await step(t); if (t !== token) return; await sleep(300); }
    running = false; btns();
  };

  // ---- 10 年のまとめ ----
  const finish = () => {
    stage.classList.add('is-end');
    const h = st.hist, inT = N * prem * YEARS, outT = h.reduce((a, r) => a + r.out, 0), hitT = h.reduce((a, r) => a + r.n, 0);
    const perY = h.filter(r => !r.storm).map(r => r.out / N), lo = Math.min(...perY), hi = Math.max(...perY);
    let head, body;
    if (st.short) { head = '箱が足りなくなった年がありました'; body = `掛け金が少なかったようです。足りなかった ${st.short} 回は、みんなで追加のお金（10 年で 1 けん ${yen(st.extra / N)}）を出しました。`; }
    else if (st.bal > inT * .4) { head = '箱に、たくさん余りました'; body = `10 年で ${yen(st.bal)} が残りました。掛け金が多めだったかも。余ったお金は、次の年の備えにも、掛け金を下げることにも使えます。`; }
    else { head = 'ちょうどよい掛け金でした'; body = `10 年間、箱は足りなくなりませんでした。残りは ${yen(st.bal)}。これが次の 10 年の備えになります。`; }
    const y = st.you;
    const you = y.hit ? `あなたの家は、こまったことが ${y.hit} 回。ひとりで備えていたら、そのたびに 10 万円を一度に払うところでした。10 年で払った掛け金は ${yen(y.paid)}、受け取ったのは ${yen(y.got)}。`
      : `あなたの家には、10 年で一度もこまったことが起きませんでした。払った ${yen(y.paid)} は「損」ではなく、何かあっても大丈夫という安心の代わりです。`;
    const lln = `1 けんあたりにすると、${st.stormYear ? '台風の年をのぞいて、' : ''}1 年に払ったお金は ${yen(lo)} 〜 ${yen(hi)} のあいだでした。` + (N === 20 ? '100 けんにして、もう一度ためしてみよう。ばらつきは小さくなるかな？' : '20 けんのときより、ばらつきは小さくなりましたか？ 人数が多いほど、毎年の数字は平均（5,000 円）に近づきます。');
    result.innerHTML = `<span class="hk-r-seal" aria-hidden="true">備</span><div><p class="hk-r-h">${head}</p><p>${body}</p>
      <ul class="hk-r-nums"><li><small>10 年で集めた</small><b>${yen(inT + st.extra)}</b></li><li><small>こまったこと</small><b>${hitT} 回</b></li><li><small>箱から払った</small><b>${yen(outT)}</b></li></ul>
      <p>${you}</p><p>${lln}</p>${st.stormYear ? '<p>台風の年は、ふだんの何倍ものお金が必要でした。みんなに一度に起きることには、ふだんから箱に余裕を残しておくことが大切です。保険会社どうしで備える「再保険」というしくみもあります。</p>' : ''}
      <p class="hk-r-hint">計算のめやすは 1 年 ${yen(COST * P)}（5% × 10 万円）。掛け金を変えて、もう一度。</p></div>`;
    result.hidden = false;
    say(`10 年がたちました。${head}。`);
    try { localStorage.setItem('azakei_hoken', String((+localStorage.getItem('azakei_hoken') || 0) + 1)); } catch (e) {}
  };

  // ---- 操作 ----
  range.addEventListener('input', () => { prem = +range.value; out.textContent = yen(prem); if (st.y) reset(); else drawChart(); });
  box.addEventListener('click', e => {
    const n = e.target.closest('[data-n]');
    if (n) { N = +n.dataset.n; box.querySelectorAll('[data-n]').forEach(b => b.setAttribute('aria-pressed', b === n)); reset(); return; }
    const a = e.target.closest('[data-a]');
    if (!a) return;
    if (a.dataset.a === 'reset') reset();
    else if (a.dataset.a === 'step') { if (st.y >= YEARS) reset(); step(token); }
    else if (running) { running = false; btns(); }
    else play();
  });
  box.querySelector('[data-storm]').addEventListener('change', e => { storm = e.target.checked; reset(); });
  box.querySelector('[data-fast]').addEventListener('change', e => { spd = e.target.checked ? .4 : 1; });
  reset();
})();
