/* ================================================================
   kawa.js — あそび場：川上の工場（外部性と環境税・近づいてから読みこむ）
   ・川上の工場は、つくるほどもうかる。でも 1 つつくるごとに、川がよごれて川下の漁師さんが損をする
   ・工場は自分のもうけだけを見て、つくる数を決める。あなたは「1 つあたりの環境税」を決める
   ・税を上げると工場はつくる数を減らす。煙・川の色・魚の数が変わり、社会全体の得がグラフに出る
   ・社会全体がいちばんよくなるのは、税が「1 つあたりの被害」と同じとき（ピグー税）
   ・数字はたとえ（万円／年）。見た目は kawa.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-kawa]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="kawa.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'kawa.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 工場のもうけ（税の前）B(q) = 100q − 5q²（1 つ目がいちばんもうかり、だんだん少なく）／被害 D(q) = 40q
  const DMG = 40, MAXQ = 10;
  const qOf = t => Math.max(0, Math.min(MAXQ, (100 - t) / 10));
  const B = q => 100 * q - 5 * q * q;
  const man = v => (v < 0 ? '−' : '') + Math.abs(Math.round(v)).toLocaleString() + ' 万円';
  const FISH = 12;

  box.innerHTML = `
    <div class="kw-stage">
      <svg class="kw-svg" viewBox="0 0 640 330" role="img" aria-label="川上の工場と、川下の漁師さん">
        <defs><linearGradient id="kw-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe0f2"/><stop offset="1" stop-color="#eef6ee"/></linearGradient></defs>
        <rect width="640" height="330" class="kw-sky"/>
        <g class="kw-haze"><rect width="640" height="200"/></g>
        <path class="kw-mt" d="M0 150 L90 70 L170 140 L250 90 L340 150 Z"/>
        <path class="kw-land" d="M0 140 Q200 120 640 170 V330 H0 Z"/>
        <path class="kw-river" d="M40 150 C 150 175, 160 215, 270 225 S 470 250, 640 270 V330 H600 C 470 300, 330 290, 230 262 S 90 205, 0 178 Z"/>
        <g class="kw-flow">${[0, 1, 2, 3, 4].map(i => `<path d="M${60 + i * 120} ${170 + i * 22} q20 4 40 2" style="animation-delay:${-i * .5}s"/>`).join('')}</g>
        <g class="kw-fac" transform="translate(70 70)"><rect x="0" y="40" width="96" height="56" class="kw-fac-b"/><path d="M0 40 L24 22 L24 40 L48 22 L48 40 L72 22 L72 40 L96 40" class="kw-fac-r"/><rect x="74" y="-14" width="14" height="56" class="kw-chim"/><g class="kw-smoke"></g><rect x="38" y="64" width="20" height="32" class="kw-door"/><text x="48" y="58" class="kw-fac-t">工場</text>
          <g class="kw-boxes"></g><path class="kw-pipe" d="M96 88 C 116 88, 116 104, 104 112"/></g>
        <g class="kw-fish"></g>
        <g class="kw-boat" transform="translate(500 236)"><path d="M-30 0 H30 L20 14 H-20 Z"/><rect x="-2" y="-30" width="3" height="30"/><path d="M1 -30 L24 -6 H1 Z" class="kw-sail"/><circle cx="-12" cy="-8" r="6" class="kw-man"/></g>
        <text class="kw-lab" x="504" y="314">川下の漁師さん</text>
      </svg>
      <div class="kw-hud"><p><span>工場がつくる数</span><b data-k="q">10</b><small>/ 年</small></p><p><span>川の魚</span><b data-k="fish">—</b><small>ひき</small></p></div>
    </div>
    <div class="kw-side">
      <label class="kw-tax"><span>1 つあたりの環境税</span><output data-k="t">0 万円</output><input type="range" min="0" max="100" step="5" value="0" aria-label="1 つあたりの環境税"></label>
      <p class="kw-why" data-k="why"></p>
      <ul class="kw-nums">
        <li><small>工場のもうけ（税をはらったあと）</small><b data-k="pf">—</b></li>
        <li><small>税として国に入るお金</small><b data-k="tx">—</b></li>
        <li class="is-bad"><small>漁師さんの損（川のよごれ）</small><b data-k="dm">—</b></li>
        <li class="is-sum"><small>社会全体の得（上の 3 つを合わせる）</small><b data-k="so">—</b></li>
      </ul>
      <svg class="kw-chart" viewBox="0 0 300 140" role="img" aria-label="環境税と、社会全体の得のグラフ"></svg>
      <p class="kw-found" data-k="found" hidden></p>
    </div>
    <div class="kw-learn">
      <p><b>外部性</b>工場と買う人のあいだの取引が、関係のない漁師さんに損をさせる。こうした「ほかの人へのえいきょう」を外部性といいます。そのままだと、工場は損を気にせず、つくりすぎてしまいます（<a href="glossary.html#externality">外部性</a>）。</p>
      <p><b>ピグー税</b>1 つあたりの被害と同じだけ税をかけると、工場は被害の分まで考えて、ちょうどよい数だけつくるようになります。経済学者ピグーにちなんで、こう呼ばれます。</p>
      <p><b>ゼロにすればいい？</b>工場をすっかり止めると川はきれいですが、工場がつくるものの価値もなくなります。「よごれゼロ」ではなく「社会全体でいちばんよい所」をさがすのが、経済学の考え方です。</p>
      <p><b>身近なところで</b>二酸化炭素を出すことに値段をつける「炭素税」や、レジ袋の有料化も、このなかまの考え方です。地球環境と SDGs にもつながります（<a href="glossary.html#sdgs">SDGs</a>）。</p>
    </div>
    <p class="kw-note">工場のもうけ・被害の金額は、しくみを知るための「たとえ」（万円／年）です。税として入ったお金は、社会全体のものとして数えています。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const range = box.querySelector('.kw-tax input'), stage = box.querySelector('.kw-stage'), chart = box.querySelector('.kw-chart');
  const smoke = box.querySelector('.kw-smoke'), boxes = box.querySelector('.kw-boxes'), fishG = box.querySelector('.kw-fish');
  // 魚の場所（川の中）
  const SPOTS = Array.from({ length: FISH }, (_, i) => { const u = (i + .5) / FISH, x = 300 + u * 300, y = 236 + u * 30 + ((i * 37) % 3 - 1) * 10; return [x, y]; });
  fishG.innerHTML = SPOTS.map(([x, y], i) => `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><g class="kw-f" data-f="${i}" style="--d:${3 + i % 4}s;--del:-${(i * .6 % 3).toFixed(1)}s"><path d="M-9 0 Q-2 -6 7 0 Q-2 6 -9 0 Z M7 0 L12 -4 L12 4 Z"/></g></g>`).join('');
  const fishes = [...fishG.querySelectorAll('.kw-f')];
  let found = false;

  const drawChart = t => {
    const X = v => 24 + v / 100 * 266, Y = v => 120 - (v + 20) / 220 * 108;
    let s = `<line class="kw-c-ax" x1="24" x2="290" y1="${Y(0)}" y2="${Y(0)}"/><line class="kw-c-ax" x1="24" x2="24" y1="8" y2="124"/>`;
    for (let v = 0; v <= 100; v += 20) s += `<text class="kw-c-t" x="${X(v)}" y="136">${v}</text>`;
    const pts = []; for (let v = 0; v <= 100; v += 2.5) { const q = qOf(v); pts.push(`${X(v).toFixed(1)},${Y(B(q) - DMG * q).toFixed(1)}`); }
    s += `<polyline class="kw-c-l" points="${pts.join(' ')}"/>`;
    if (found) s += `<line class="kw-c-best" x1="${X(DMG)}" x2="${X(DMG)}" y1="8" y2="124"/><text class="kw-c-bt" x="${X(DMG) + 4}" y="16">いちばんよい所</text>`;
    const q = qOf(t); s += `<circle class="kw-c-p" cx="${X(t)}" cy="${Y(B(q) - DMG * q).toFixed(1)}" r="6"/>`;
    s += `<text class="kw-c-t" x="290" y="20" style="text-anchor:end">社会全体の得</text>`;
    chart.innerHTML = s;
  };
  const update = () => {
    const t = +range.value, q = qOf(t), pf = B(q) - t * q, tx = t * q, dm = DMG * q, so = pf + tx - dm;
    K('t').textContent = man(t); K('q').textContent = q % 1 ? q.toFixed(1) : q; K('pf').textContent = man(pf); K('tx').textContent = man(tx); K('dm').textContent = man(-dm); K('so').textContent = man(so);
    const fishN = Math.round(FISH * (1 - q / MAXQ * .85));
    K('fish').textContent = fishN;
    fishes.forEach((f, i) => f.classList.toggle('is-gone', i >= fishN));
    stage.style.setProperty('--dirt', (q / MAXQ).toFixed(2));
    smoke.innerHTML = Array.from({ length: Math.round(q) }, (_, i) => `<circle cx="81" cy="-18" r="${8 + i * 1.6}" style="animation-delay:-${(i * .45).toFixed(2)}s"/>`).join('');
    boxes.innerHTML = Array.from({ length: Math.round(q) }, (_, i) => `<rect x="${-6 - (i % 5) * 14}" y="${84 - Math.floor(i / 5) * 12}" width="12" height="10" rx="2"/>`).join('');
    box.querySelector('.kw-boat').classList.toggle('is-sad', fishN < FISH * .4);
    K('why').textContent = t === 0 ? '税がないと、工場は自分のもうけだけを見て、たくさんつくります。漁師さんの損は気にしません。'
      : q === 0 ? '税が高すぎて、工場はつくるのをやめてしまいました。川はきれいですが、工場がつくるものの価値もなくなりました。'
      : `1 つあたり ${t} 万円の税。工場は、もうけが税より少ないものはつくらなくなるので、${q % 1 ? q.toFixed(1) : q} 個に減らしました。`;
    if (t === DMG && !found) { found = true; const f = K('found'); f.hidden = false; f.textContent = 'いちばんよい所を見つけました！ 税が「1 つあたりの被害（40 万円）」と同じとき、社会全体の得がいちばん大きくなります。これがピグー税の考え方です。'; try { localStorage.setItem('azakei_kawa', '1'); } catch (e) {} }
    drawChart(t);
  };
  range.addEventListener('input', update);
  update();
})();
