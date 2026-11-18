/* ================================================================
   shimagdp.js — コンテスト：島の GDP（三面等価・近づいてから読みこむ）
   ・小さな島に、麦の農家・パン屋さん・働く家族。麦がパンになり、お金がめぐる
   ・「1 年をすすめる」で、モノとお金が動き、3 つのメーター（生産・所得・支出）がたまる。3 つはいつも同じ
   ・パンの値段・つくる数・観光客（輸出）を変えられる
   ・「売上を全部たすと？」で、二重に数えてしまうまちがい（中間の麦）をたしかめる
   ・数字はたとえ。見た目は shimagdp.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-shimagdp]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="shimagdp.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'shimagdp.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const WHEAT = 40, WF = 30, WB = 35;   // 麦 1 つ 40 円／農家の給料 30 円・パン屋の給料 35 円（パン 1 つあたり）
  const yen = n => Math.round(n).toLocaleString() + ' 円';
  const P = { farm: [130, 120], bake: [330, 90], home: [520, 170], ship: [330, 270] };

  box.innerHTML = `
    <div class="gp-stage">
      <svg class="gp-svg" viewBox="0 0 640 330" role="img" aria-label="小さな島。麦の農家、パン屋さん、家族の家">
        <rect width="640" height="330" class="gp-sea"/>
        ${[0, 1, 2, 3].map(i => `<path class="gp-wave" d="M${20 + i * 160} ${300 - (i % 2) * 260} q15 -6 30 0 t30 0" style="animation-delay:-${i * .7}s"/>`).join('')}
        <path class="gp-isl" d="M60 170 C 60 60, 260 40, 360 50 S 610 70, 600 180 S 470 300, 330 290 S 60 270, 60 170 Z"/>
        <path class="gp-road" d="M${P.farm[0]} ${P.farm[1] + 20} Q 230 150 ${P.bake[0]} ${P.bake[1] + 30} Q 430 150 ${P.home[0]} ${P.home[1] + 10} Q 430 230 ${P.ship[0]} ${P.ship[1] - 20}"/>
        <g class="gp-b" transform="translate(${P.farm.join(' ')})">${Array.from({ length: 9 }, (_, i) => `<path class="gp-wheat" d="M${-36 + (i % 3) * 14 - 10} ${-4 + Math.floor(i / 3) * 12} q4 -14 0 -22" style="animation-delay:-${(i * .3).toFixed(1)}s"/>`).join('')}<rect x="10" y="-26" width="38" height="30" class="gp-wall"/><path d="M6 -26 L29 -44 L52 -26 Z" class="gp-roof is-farm"/><text class="gp-name" x="0" y="46">麦の農家</text></g>
        <g class="gp-b" transform="translate(${P.bake.join(' ')})"><rect x="-34" y="-20" width="68" height="46" class="gp-wall"/><path d="M-40 -20 h80 l-8 -16 h-64 Z" class="gp-roof is-bake"/><ellipse cx="0" cy="8" rx="14" ry="8" class="gp-bread"/><path class="gp-steam" d="M20 -40 q-6 -10 0 -20"/><text class="gp-name" x="0" y="50">パン屋さん</text></g>
        <g class="gp-b" transform="translate(${P.home.join(' ')})"><rect x="-26" y="-14" width="52" height="38" class="gp-wall"/><path d="M-32 -14 L0 -40 L32 -14 Z" class="gp-roof is-home"/><circle cx="-10" cy="6" r="6" class="gp-ppl"/><circle cx="8" cy="6" r="6" class="gp-ppl"/><text class="gp-name" x="0" y="46">働く家族</text></g>
        <g class="gp-ship" transform="translate(${P.ship.join(' ')})"><path d="M-34 0 H34 L24 16 H-24 Z"/><rect x="-2" y="-32" width="3" height="32"/><path d="M1 -32 L26 -6 H1 Z" class="gp-sail"/><text class="gp-name" x="0" y="34">観光客の船</text></g>
        <g class="gp-fx"></g>
      </svg>
      <p class="gp-msg" data-k="msg" aria-live="polite">「1 年をすすめる」を押すと、麦がパンになり、お金が島をめぐります。</p>
    </div>
    <div class="gp-side">
      <label class="gp-sl"><span>パン 1 つの値段</span><output data-k="pv">100 円</output><input type="range" data-s="p" min="80" max="160" step="10" value="100"></label>
      <label class="gp-sl"><span>1 年につくるパン</span><output data-k="nv">6 個</output><input type="range" data-s="n" min="2" max="10" step="1" value="6"></label>
      <label class="gp-chk"><input type="checkbox" data-tour><span></span>観光客の船が、パンを 2 個買う（輸出）</label>
      <button type="button" class="gp-go" data-a="go">1 年をすすめる</button>
      <div class="gp-meters">
        ${[['make', '生産', 'つくり出した価値'], ['earn', '所得', '給料ともうけ'], ['buy', '支出', '最後に買ったもの']].map(([k, t, s]) => `<div class="gp-m" data-m="${k}"><div class="gp-tube"><i></i></div><b data-k="${k}">0</b><p>${t}<small>${s}</small></p><ul data-k="${k}L"></ul></div>`).join('<span class="gp-eq" aria-hidden="true">＝</span>')}
      </div>
      <button type="button" class="gp-trap" data-a="trap">ためしに、島の売上を全部たすと？</button>
      <p class="gp-trapout" data-k="trap" hidden></p>
    </div>
    <div class="gp-learn">
      <p><b>GDP（国内総生産）</b>国の中で 1 年に新しく生み出された価値（付加価値）の合計。国の経済の大きさをはかる物さしです（<a href="glossary.html#gdp">GDP</a>）。</p>
      <p><b>三面等価</b>「生産」「所得（給料ともうけ）」「支出（買ったもの）」の 3 つの面から数えても、同じ大きさになります。つくった価値は、だれかの所得になり、だれかが買うからです。</p>
      <p><b>付加価値で数える</b>パン屋さんの売上には、麦の値段もふくまれています。売上を全部たすと、麦を 2 回数えてしまう。だから「新しくふえた分」だけを数えます（<a href="glossary.html#fukakachi">付加価値</a>）。</p>
      <p><b>外国が買うと</b>観光客が買ったパンは「輸出」として支出に入ります。実際の GDP の支出の内わけは、消費・投資・政府の支出・輸出から輸入を引いたもの、です（<a href="glossary.html#consumption">消費</a>）。</p>
    </div>
    <p class="gp-note">島の値段や給料は、しくみを知るための「たとえ」です。この島では、パン 1 つに麦 1 つを使い、ほかには何も使わないものとしています。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const fx = box.querySelector('.gp-fx'), tour = box.querySelector('[data-tour]');
  let p = 100, n = 6, busy = false, shown = false;

  const calc = () => {
    const tx = tour.checked ? Math.min(2, n) : 0, wheat = WHEAT * n, sales = p * n;
    return {
      make: [['麦の農家（麦の売上）', wheat], ['パン屋さん（パンの売上 − 麦）', sales - wheat]],
      earn: [['給料', (WF + WB) * n], ['農家のもうけ', (WHEAT - WF) * n], ['パン屋さんのもうけ', (p - WHEAT - WB) * n]],
      buy: [['家族が買ったパン（消費）', p * (n - tx)], ...(tx ? [['観光客が買ったパン（輸出）', p * tx]] : [])],
      total: sales, tx, wheat
    };
  };
  const NS = 'http://www.w3.org/2000/svg';
  const fly = (a, b, cls, label, delay) => new Promise(res => {
    if (reduce) return res();
    setTimeout(() => {
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'gp-tok ' + cls);
      g.innerHTML = `<circle r="11"/><text y="4">${label}</text>`; fx.appendChild(g);
      const t0 = performance.now(), d = 900;
      const f = now => { const k = Math.min(1, (now - t0) / d), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2, mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 50, u = 1 - e;
        g.setAttribute('transform', `translate(${(u * u * a[0] + 2 * u * e * mx + e * e * b[0]).toFixed(1)} ${(u * u * a[1] + 2 * u * e * my + e * e * b[1]).toFixed(1)})`);
        if (k < 1) requestAnimationFrame(f); else { g.remove(); res(); } };
      requestAnimationFrame(f);
    }, delay);
  });
  const fill = (key, list, max) => {
    const sum = list.reduce((s, [, v]) => s + v, 0);
    const m = box.querySelector(`[data-m="${key}"]`);
    m.querySelector('.gp-tube i').style.height = (sum / max * 100).toFixed(1) + '%';
    K(key).textContent = yen(sum);
    K(key + 'L').innerHTML = list.map(([t, v]) => `<li><span>${t}</span><b>${yen(v)}</b></li>`).join('');
    m.classList.remove('is-pop'); void m.offsetWidth; m.classList.add('is-pop');
  };
  const run = async () => {
    if (busy) return; busy = true; box.classList.add('is-busy');
    const c = calc(), max = 160 * 10;
    box.querySelectorAll('.gp-tube i').forEach(i => i.style.height = '0%'); ['make', 'earn', 'buy'].forEach(k => { K(k).textContent = '0'; K(k + 'L').innerHTML = ''; });
    box.querySelector('.gp-meters').classList.remove('is-eq'); K('trap').hidden = true;
    K('msg').textContent = `農家が麦を ${n} つ育てて、パン屋さんに ${yen(c.wheat)} で売ります。`;
    await Promise.all([fly(P.farm, P.bake, 'is-wheat', '麦', 0), fly(P.bake, P.farm, 'is-coin', '円', 300)]);
    fill('make', c.make.slice(0, 1), max); await sleep(500);
    K('msg').textContent = `パン屋さんがパンを ${n} 個焼いて、1 つ ${yen(p)} で売ります。${c.tx ? `そのうち ${c.tx} 個は観光客の船へ。` : ''}`;
    await Promise.all([fly(P.bake, P.home, 'is-bread', 'パ', 0), fly(P.home, P.bake, 'is-coin', '円', 300), ...(c.tx ? [fly(P.bake, P.ship, 'is-bread', 'パ', 150), fly(P.ship, P.bake, 'is-coin', '円', 450)] : [])]);
    fill('make', c.make, max); fill('buy', c.buy, max); await sleep(500);
    K('msg').textContent = '農家とパン屋さんは、売上から家族に給料をはらい、のこりが自分のもうけになります。';
    await Promise.all([fly(P.farm, P.home, 'is-coin', '給', 0), fly(P.bake, P.home, 'is-coin', '給', 250)]);
    fill('earn', c.earn, max); await sleep(500);
    box.querySelector('.gp-meters').classList.add('is-eq');
    K('msg').textContent = `生産も所得も支出も、どれも ${yen(c.total)}。これが島の GDP です。3 つの面から数えても、同じになります（三面等価）。`;
    busy = false; box.classList.remove('is-busy'); shown = true;
    try { localStorage.setItem('azakei_shimagdp', '1'); } catch (e) {}
  };
  const trap = () => {
    const c = calc(), all = c.wheat + c.total, out = K('trap');
    out.innerHTML = `麦の売上 ${yen(c.wheat)} ＋ パンの売上 ${yen(c.total)} ＝ <b>${yen(all)}</b>。GDP（${yen(c.total)}）より ${yen(c.wheat)} 多くなりました。パンの値段の中には、もう麦の ${yen(c.wheat)} が入っているので、麦を 2 回数えてしまったのです。これを「二重計上」といいます。`;
    out.hidden = false;
  };
  box.addEventListener('input', e => {
    const s = e.target.closest('[data-s]'); if (!s) return;
    if (s.dataset.s === 'p') { p = +s.value; K('pv').textContent = yen(p); } else { n = +s.value; K('nv').textContent = n + ' 個'; }
  });
  box.addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (!a) return; if (a.dataset.a === 'go') run(); else trap(); });
  tour.addEventListener('change', () => box.classList.toggle('has-tour', tour.checked));
})();
