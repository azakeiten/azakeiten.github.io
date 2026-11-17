/* ================================================================
   zeidan.js — あそび場：税の階段（所得税の累進課税・近づいてから読みこむ）
   ・所得税の税率は、課税所得（収入から控除を引いた額）が多いほど上がる 7 段（5%〜45%、国税庁の税率表）
   ・高い税率がかかるのは「その段をこえた部分だけ」。階段にコインがたまり、税の部分が赤くなる
   ・平均の税率といちばん上の税率をくらべる。「全部に高い税率」というまちがった考えも、グラフで見せる
   ・復興特別所得税（2.1%）や住民税はふくめない（説明だけ）。見た目は zeidan.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-zeidan]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="zeidan.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'zeidan.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 段のさかい（万円）と税率。いちばん上の段は、図では 6,000 万円までを見せる
  const B = [0, 195, 330, 695, 900, 1800, 4000, 6000], R = [5, 10, 20, 23, 33, 40, 45];
  const man = v => (Math.round(v * 10) / 10).toLocaleString() + ' 万円';
  const inc = v => { const i = Math.min(6, Math.floor(v)), f = v - i; return B[i] + f * (B[i + 1] - B[i]); };   // スライダー（0〜7）→ 課税所得
  const pos = x => { for (let i = 0; i < 7; i++) if (x <= B[i + 1]) return i + (x - B[i]) / (B[i + 1] - B[i]); return 7; };
  const tax = x => R.reduce((s, r, i) => s + Math.max(0, Math.min(x, B[i + 1] === 6000 ? Infinity : B[i + 1]) - B[i]) * r / 100, 0);
  const top = x => { for (let i = 0; i < 6; i++) if (x <= B[i + 1]) return R[i]; return R[6]; };
  const wrong = x => x * top(x) / 100;

  const W = 700, H = 314, X0 = 40, SW = 90, BASE = 270;
  box.innerHTML = `
    <div class="zd-stage">
      <svg class="zd-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="所得税の 7 段の階段。課税所得が、低い段から順にたまっていく">
        <defs><pattern id="zd-coin" width="12" height="8" patternUnits="userSpaceOnUse"><rect width="12" height="8" fill="#e3b341"/><path d="M0 7.5 H12" stroke="#a77b16" stroke-width="1"/></pattern></defs>
        ${R.map((r, i) => { const x = X0 + i * SW, h = 40 + r * 4.6; return `<g class="zd-step" data-i="${i}"><rect class="zd-wall" x="${x}" y="${BASE - h}" width="${SW - 6}" height="${h}" rx="4"/><rect class="zd-keep" x="${x + 3}" y="${BASE}" width="${SW - 12}" height="0" data-h="${h - 6}"/><rect class="zd-tax" x="${x + 3}" y="${BASE}" width="${SW - 12}" height="0"/><text class="zd-rate" x="${x + (SW - 6) / 2}" y="${BASE - h - 10}">${r}%</text><text class="zd-range" x="${x + (SW - 6) / 2}" y="${BASE + 18}">${i < 6 ? `${B[i]}〜${B[i + 1]}` : '4000〜'}</text></g>`; }).join('')}
        <text class="zd-unit" x="${X0}" y="${BASE + 34}">課税所得（万円）の段</text>
        <g class="zd-flag"><line y1="0" y2="-26"/><path d="M0 -26 h34 l-6 7 l6 7 h-34 Z"/><text x="16" y="-15">ここまで</text></g>
      </svg>
      <div class="zd-ctrl">
        <label class="zd-slider"><span>課税所得</span><output data-k="x">500 万円</output><input type="range" min="0" max="7" step="any" value="${pos(500)}" aria-label="課税所得"></label>
        <div class="zd-pre">${[200, 500, 1000, 3000, 5000].map(v => `<button type="button" data-v="${v}">${v.toLocaleString()} 万円</button>`).join('')}</div>
      </div>
    </div>
    <div class="zd-side">
      <ul class="zd-read">
        <li><small>所得税</small><b data-k="tax">—</b></li>
        <li class="is-avg"><small>平均の税率（所得税 ÷ 課税所得）</small><b data-k="avg">—</b></li>
        <li class="is-top"><small>いちばん上の段の税率</small><b data-k="top">—</b></li>
      </ul>
      <p class="zd-msg" data-k="msg" aria-live="polite"></p>
      <svg class="zd-chart" viewBox="0 0 320 170" role="img" aria-label="課税所得と所得税のグラフ"></svg>
      <label class="zd-sw"><input type="checkbox" data-wrong><span></span>まちがった考え「全部に、いちばん上の税率」も重ねる</label>
    </div>
    <div class="zd-learn">
      <p><b>累進課税</b>所得が多い人ほど、高い税率がかかるしくみ。でも高い税率がかかるのは、その段をこえた部分だけです。だから、所得が少しふえて税率の段が上がっても、手元に残るお金が減ることはありません（<a href="glossary.html#progressive-tax">累進課税</a>）。</p>
      <p><b>課税所得とは</b>収入（給料など）から、いろいろな「控除」を引いた残りの額。税率をかけるのは、この課税所得です。給料の額そのものではありません。</p>
      <p><b>ほかの税</b>このほかに、所得税の 2.1% にあたる復興特別所得税（2037 年まで）と、住む市町村などに払う住民税（多くは約 10%）があります。ここでは所得税だけを計算しています（<a href="glossary.html#tax">税金</a>）。</p>
      <p><b>なぜ段々にするの？</b>余裕のある人に多めに負担してもらい、そのお金を社会保障などに回して、くらしの差を小さくするためです（<a href="glossary.html#redistribution">所得の再分配</a>）。</p>
    </div>
    <p class="zd-note">税率は、国税庁の所得税の税率表（課税所得 1,000 円から）にもとづいています。計算は万円単位のおおまかなもので、実際の申告とは端数などがちがいます。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const range = box.querySelector('.zd-slider input'), chart = box.querySelector('.zd-chart'), flag = box.querySelector('.zd-flag');
  const steps = [...box.querySelectorAll('.zd-step')];
  let showWrong = false;

  const drawChart = x => {
    const Xc = v => 24 + v / 7 * 286, maxT = tax(6000), Yc = t => 150 - t / maxT * 136;
    let s = `<line class="zd-c-ax" x1="24" x2="312" y1="150" y2="150"/><line class="zd-c-ax" x1="24" x2="24" y1="10" y2="150"/>`;
    for (let i = 1; i < 7; i++) s += `<line class="zd-c-g" x1="${Xc(i)}" x2="${Xc(i)}" y1="10" y2="150"/>`;
    const pts = [], wpts = [];
    for (let v = 0; v <= 7.0001; v += .05) { const x2 = inc(Math.min(7, v)); pts.push(`${Xc(v).toFixed(1)},${Yc(tax(x2)).toFixed(1)}`); }
    if (showWrong) for (let i = 0; i < 7; i++) { const a = i + .001, b = i + .999; wpts.push(`${Xc(a).toFixed(1)},${Yc(wrong(inc(a))).toFixed(1)} ${Xc(b).toFixed(1)},${Yc(Math.min(maxT * 1.05, wrong(inc(b)))).toFixed(1)}`); }
    if (showWrong) s += wpts.map(p => `<polyline class="zd-c-w" points="${p}"/>`).join('');
    s += `<polyline class="zd-c-r" points="${pts.join(' ')}"/>`;
    const v = pos(x); s += `<circle class="zd-c-pt" cx="${Xc(v).toFixed(1)}" cy="${Yc(tax(x)).toFixed(1)}" r="5"/>`;
    s += `<text class="zd-c-t" x="28" y="20">所得税</text><text class="zd-c-t is-x" x="312" y="166">課税所得 →</text>`;
    chart.innerHTML = s;
  };
  const update = () => {
    const v = +range.value, x = inc(v), t = tax(x), r = top(x), avg = x ? t / x * 100 : 0;
    K('x').textContent = man(x); K('tax').textContent = man(t); K('avg').textContent = avg.toFixed(1) + '%'; K('top').textContent = (x ? r : 0) + '%';
    steps.forEach((g, i) => {
      const keep = g.querySelector('.zd-keep'), tx = g.querySelector('.zd-tax'), full = +keep.dataset.h;
      const part = Math.max(0, Math.min(1, (x - B[i]) / (B[i + 1] - B[i])));
      const h = full * part, th = h * R[i] / 100;
      keep.setAttribute('y', (BASE - 3 - h).toFixed(1)); keep.setAttribute('height', Math.max(0, h - th).toFixed(1));
      tx.setAttribute('y', (BASE - 3 - h).toFixed(1)); tx.setAttribute('height', th.toFixed(1));
      g.classList.toggle('is-on', part > 0); g.classList.toggle('is-top', i === Math.min(6, Math.floor(v)) && x > 0);
    });
    const cur = Math.min(6, Math.floor(v));
    flag.setAttribute('transform', `translate(${(X0 + cur * SW + Math.min(1, v - cur) * (SW - 6)).toFixed(1)} ${(BASE - 40 - R[cur] * 4.6 - 30).toFixed(1)})`);
    let m = `課税所得 ${man(x)} のとき、所得税は ${man(t)}。`;
    if (x > 195) m += ` いちばん上の段は ${r}% ですが、それがかかるのは ${man(B[cur])} をこえた ${man(x - B[cur])} だけ。全体の平均では ${avg.toFixed(1)}% です。`;
    else m += ' いちばん下の段なので、全部に 5% です。';
    K('msg').textContent = m;
    drawChart(x);
  };
  range.addEventListener('input', update);
  box.addEventListener('click', e => {
    const p = e.target.closest('[data-v]'); if (!p) return;
    const to = pos(+p.dataset.v), from = +range.value;
    if (reduce) { range.value = to; update(); return; }
    const t0 = performance.now();
    const f = now => { const k = Math.min(1, (now - t0) / 700), e2 = 1 - Math.pow(1 - k, 3); range.value = from + (to - from) * e2; update(); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
    try { localStorage.setItem('azakei_zeidan', '1'); } catch (err) {}
  });
  box.querySelector('[data-wrong]').addEventListener('change', e => { showWrong = e.target.checked; update(); try { localStorage.setItem('azakei_zeidan', '1'); } catch (err) {} });
  range.addEventListener('change', () => { try { localStorage.setItem('azakei_zeidan', '1'); } catch (err) {} });
  update();
})();
