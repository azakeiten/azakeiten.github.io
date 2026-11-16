/* ================================================================
   kinri.js — 経済ラボ：景気の舵とり（金融政策のゲーム・近づいてから読みこむ）
   ・あなたは日本銀行の会議のメンバー。3 か月ごとにニュースが届き、政策金利を決める（12 回 = 3 年）
   ・金利を上げると、お金を借りにくくなって景気は冷え、物価の上がり方はおだやかに。下げるとその逆
   ・効果はすぐには出ない（決めた金利の半分は、次の回にきいてくる）
   ・目標は「物価が 1 年に 2% くらい上がる」こと（日本銀行の物価安定の目標）。景気が大きくゆれないことも大切
   ・町のようす（お店の明かり・工場の煙・歩く人・値札）で、景気と物価を見せる。計算のしかたは「たとえ」
   ・見た目（kinri.css）も、このファイルといっしょに読みこむ（経済ラボのページを軽くするため）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-kinri]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="kinri.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'kinri.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const TURNS = 12;
  // ニュース：印・見出し・ひとこと・景気への影響・物価への影響
  const NEWS = [
    ['輸', '海外で日本の製品が大人気', '工場はフル回転。働く人の募集もふえています。', 1.2, .2],
    ['冷', '世界の景気が冷えこんだ', '海外で物が売れにくくなり、会社は慎重に。', -1.5, -.3],
    ['油', '原油の値段が上がった', 'ガソリンや電気代が上がり、物価は上へ。でも、みんなの財布はきびしく。', -.6, .9],
    ['円', '円安が進んだ', '輸出する会社にはうれしいけれど、輸入品は値上がり。', .4, .6],
    ['技', '新しい技術に会社が投資', '工場や機械を新しくする会社がふえました。', 1, 0],
    ['災', '大きな台風で工場が止まった', '物が足りなくなり、値段は少し上へ。生産は落ちこみました。', -1, .3],
    ['賃', '給料がよく上がった', 'お金を使う人がふえ、お店もにぎわっています。', .5, .5],
    ['静', 'とくに大きなニュースはない', 'おだやかな 3 か月。前のようすが、そのまま続きそうです。', 0, 0],
    ['株', '株価が大きく下がった', '先行きを心配して、会社も家計も、お金を使うのをひかえぎみ。', -.8, -.1],
    ['旅', '海外からの旅行客がふえた', 'ホテルやお店がにぎわっています。', .6, .2]
  ];
  const mood = g => g > 2.5 ? ['熱すぎ', 'is-hot'] : g > 1 ? ['良い', 'is-good'] : g > -1 ? ['ふつう', 'is-mid'] : g > -2.5 ? ['悪い', 'is-bad'] : ['とても悪い', 'is-cold'];
  const f1 = v => (v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
  const f2 = v => (v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
  const SHOPS = [[40, 70], [118, 92], [196, 64], [282, 100], [368, 76], [446, 88]];

  box.innerHTML = `
    <div class="kn-stage">
      <div class="kn-news" aria-live="polite"><span class="kn-news-seal" data-k="ns">—</span><div><p class="kn-news-q" data-k="nq"></p><p class="kn-news-h" data-k="nh"></p><p class="kn-news-t" data-k="nt"></p></div></div>
      <svg class="kn-town" viewBox="0 0 640 300" role="img" aria-label="町のようす。お店の明かり、工場の煙、歩く人で景気をあらわす">
        <rect class="kn-sky" width="640" height="300"/>
        <circle class="kn-sun" cx="560" cy="70" r="30"/>
        <path class="kn-hill" d="M0 210 Q120 160 260 200 T520 190 T640 196 V300 H0 Z"/>
        <g class="kn-fac" transform="translate(530 150)"><rect x="0" y="40" width="96" height="70" class="kn-fac-b"/><path d="M0 40 L24 22 L24 40 L48 22 L48 40 L72 22 L72 40 L96 40" class="kn-fac-r"/><rect x="70" y="-20" width="14" height="62" class="kn-chim"/><g class="kn-smoke">${[0, 1, 2, 3].map(i => `<circle cx="77" cy="-26" r="${9 + i * 3}" style="animation-delay:${-i * .9}s"/>`).join('')}</g><text x="48" y="84" class="kn-fac-t">工場</text></g>
        ${SHOPS.map(([x, h], i) => `<g class="kn-shop" data-s="${i}" transform="translate(${x} ${250 - h})"><rect width="70" height="${h}" class="kn-wall" style="--h:${(i * 37) % 360}"/><rect x="-4" y="-8" width="78" height="12" rx="3" class="kn-awn" style="--h:${(i * 37) % 360}"/>${Array.from({ length: Math.floor((h - 30) / 22) }, (_, r) => `<rect x="10" y="${12 + r * 22}" width="18" height="12" class="kn-win"/><rect x="42" y="${12 + r * 22}" width="18" height="12" class="kn-win"/>`).join('')}<rect x="24" y="${h - 26}" width="22" height="26" class="kn-door"/><g class="kn-shut"><rect y="${h - 34}" width="70" height="34"/><text x="35" y="${h - 13}">休業中</text></g><g class="kn-tag"><rect x="18" y="-40" width="44" height="20" rx="4"/><text x="40" y="-26"></text></g></g>`).join('')}
        <rect class="kn-road" y="250" width="640" height="50"/>
        <path d="M0 275 H640" class="kn-lane"/>
        <g class="kn-people"></g>
      </svg>
      <div class="kn-decide" aria-hidden="true"><span>決定</span></div>
    </div>
    <div class="kn-side">
      <div class="kn-g kn-pi"><p class="kn-g-l">物価の上がり方（1 年あたり）<b data-k="pi">—</b></p><div class="kn-scale"><i class="kn-band"></i><i class="kn-mark" data-k="pim"></i><span style="left:0%">−1%</span><span style="left:42.9%">2%</span><span style="left:100%">6%</span></div><small>目標は 2% くらい（1〜3% の帯）</small></div>
      <div class="kn-g kn-gap"><p class="kn-g-l">景気<b data-k="gap">—</b></p><div class="kn-meter"><i data-k="gm"></i></div></div>
      <p class="kn-g kn-u"><span>失業率</span><b data-k="u">—</b></p>
      <div class="kn-wheel">
        <p class="kn-wheel-l">あなたが決める、政策金利</p>
        <div class="kn-dial"><button type="button" data-r="-.25" aria-label="金利を 0.25% 下げる">下げる</button><output data-k="rate">0.50%</output><button type="button" data-r=".25" aria-label="金利を 0.25% 上げる">上げる</button></div>
        <p class="kn-hint" data-k="hint"></p>
        <button type="button" class="kn-go" data-a="go">この金利で決める</button>
        <p class="kn-turn"><b data-k="turn">1</b> / ${TURNS} 回目の会議（3 か月ごと）</p>
      </div>
    </div>
    <div class="kn-hist"><svg class="kn-chart" viewBox="0 0 640 170" role="img" aria-label="物価・景気・金利の移りかわり"></svg><p class="kn-legend"><i class="is-pi"></i>物価の上がり方 <i class="is-band"></i>目標の帯 <i class="is-r"></i>政策金利 <i class="is-g"></i>景気</p></div>
    <div class="kn-result" hidden></div>
    <div class="kn-learn">
      <p><b>金利を上げると</b>お金を借りにくくなり、家や機械を買う人が減って、景気は冷えます。物価の上がり方もおだやかに。下げると、その逆です。くわしくは<a href="glossary.html#monetary-policy">金融政策</a>・<a href="glossary.html#policy-rate">政策金利</a>へ。</p>
      <p><b>物価安定の目標 2%</b>日本銀行は、物価が 1 年に 2% くらいずつ上がる状態をめざしています。上がりすぎても、下がりつづけても、くらしは困ります（<a href="glossary.html#inflation-target">インフレターゲット</a>）。</p>
      <p><b>効き目には時間がかかる</b>金利を変えても、景気や物価が動くまでには時間がかかります。いまだけでなく、少し先を考えて決めるのが、むずかしいところです。</p>
      <p><b>板ばさみのニュース</b>原油の値上がりのように、物価は上がるのに景気は悪くなることもあります。金利を上げても下げても、どこかに無理が出る。本物の会議でも悩むところです（<a href="glossary.html#business-cycle">景気の波</a>）。</p>
    </div>
    <p class="kn-note">景気や物価の動き方は、しくみを知るための「たとえ」の計算です。実際の日本の経済や、日本銀行の決め方そのものではありません。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const stage = box.querySelector('.kn-stage'), svg = box.querySelector('.kn-town'), chart = box.querySelector('.kn-chart'), result = box.querySelector('.kn-result');
  const shops = [...svg.querySelectorAll('.kn-shop')], people = svg.querySelector('.kn-people');
  let st, busy = false;

  const pickNews = () => { let n; do { n = Math.floor(Math.random() * NEWS.length); } while (st && n === st.news); return n; };
  const reset = () => {
    st = { t: 1, g: .4, pi: 2.5, rate: .5, prev: .5, news: null, hist: [], score: 0, sawOil: false };
    st.hist.push({ g: st.g, pi: st.pi, rate: st.rate });
    st.news = pickNews();
    result.hidden = true; result.innerHTML = '';
    box.classList.remove('is-done');
    box.querySelector('[data-a="go"]').textContent = 'この金利で決める';
    showNews(); draw(); drawChart();
  };
  const showNews = () => {
    const [s, h, t] = NEWS[st.news];
    K('ns').textContent = s; K('nh').textContent = h; K('nt').textContent = t;
    K('nq').textContent = `${st.t} 回目の会議の前に届いたニュース`;
    const n = box.querySelector('.kn-news'); n.classList.remove('is-in'); void n.offsetWidth; n.classList.add('is-in');
  };

  // ---- 町と計器 ----
  const draw = () => {
    const { g, pi, rate } = st;
    const u = Math.max(1.5, Math.min(8, 2.6 - .5 * g));
    K('pi').textContent = `${f1(pi)}%`;
    K('pim').style.left = Math.max(0, Math.min(100, (pi + 1) / 7 * 100)) + '%';
    box.querySelector('.kn-pi').classList.toggle('is-ok', pi >= 1 && pi <= 3);
    const [mw, mc] = mood(g);
    K('gap').textContent = mw; K('gap').className = mc;
    K('gm').style.width = Math.max(4, Math.min(100, (g + 4) / 8 * 100)) + '%'; K('gm').className = mc;
    K('u').textContent = `${f1(u)}%`;
    K('rate').textContent = `${f2(rate)}%`;
    K('turn').textContent = Math.min(st.t, TURNS);
    // 空の色：寒い（灰）→ ふつう（青）→ 熱い（夕焼け）
    const k = Math.max(-1, Math.min(1, g / 3));
    const mix = (a, b, x) => a.map((v, i) => Math.round(v + (b[i] - v) * x));
    const sky = k < 0 ? mix([142, 197, 232], [150, 156, 166], -k) : mix([142, 197, 232], [246, 190, 120], k);
    stage.style.setProperty('--sky', `rgb(${sky})`);
    stage.style.setProperty('--smoke', Math.max(.05, Math.min(1, (g + 3) / 5)).toFixed(2));
    stage.classList.toggle('is-hot', g > 2.5); stage.classList.toggle('is-cold', g < -2.5);
    // お店：明かりの数と、休業中のシャッター
    const lit = Math.round((g + 3) / 6 * 10), shut = g < -1 ? Math.min(4, Math.round((-g - .6) * 1.4)) : 0;
    shops.forEach((s, i) => {
      s.querySelectorAll('.kn-win').forEach((w, j) => w.classList.toggle('is-lit', (i * 3 + j * 7) % 10 < lit));
      s.classList.toggle('is-shut', !!shut && [4, 1, 3, 0].slice(0, shut).includes(i));
      const tg = s.querySelector('.kn-tag'), tx = tg.querySelector('text');
      const up = pi > 3.2 && i % 2 === 0, down = pi < .6 && i % 2 === 1;
      tg.classList.toggle('is-up', up); tg.classList.toggle('is-down', down);
      tx.textContent = up ? '値上げ' : down ? '値下げ' : '';
    });
    // 歩く人
    const n = Math.max(2, Math.min(16, Math.round(8 + g * 2.6)));
    if (people.children.length !== n) {
      people.innerHTML = Array.from({ length: n }, (_, i) => { const dir = i % 2 ? -1 : 1, y = 262 + (i % 3) * 10, d = (9 + (i * 7) % 8).toFixed(1); return `<g class="kn-p" style="--x:${(20 + i * 39) % 600}px;--d:${d}s;--del:-${(i * 2.3 % 9).toFixed(1)}s;--dir:${dir}" transform="translate(0 ${y})"><g class="kn-pw"><circle cy="-15" r="4.5"/><rect x="-4" y="-10" width="8" height="12" rx="3" style="fill:hsl(${(i * 53) % 360} 45% 45%)"/></g></g>`; }).join('');
    }
    K('hint').textContent = rate > st.prev ? `前回より ${f2(rate - st.prev)}% 上げる` : rate < st.prev ? `前回より ${f2(st.prev - rate)}% 下げる` : '前回と同じ金利';
    const tip = pi > 3 && g > 1 ? '物価も景気も熱め。上げる場面かも' : pi < 1 && g < -1 ? '物価も景気も冷えぎみ。下げる場面かも' : pi > 3 && g < -1 ? '物価は高いのに景気は悪い。板ばさみ' : pi >= 1 && pi <= 3 && Math.abs(g) <= 1 ? 'いい調子。大きく動かさなくてもよさそう' : '';
    if (tip) K('hint').textContent += '　' + tip;
  };

  const drawChart = () => {
    const W = 640, H = 170, L = 36, R = 12, T = 12, B = 24, lo = -2, hi = 6;
    const X = i => L + i / TURNS * (W - L - R), Y = v => T + (1 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (H - T - B);
    let s = `<rect class="kn-c-band" x="${L}" y="${Y(3)}" width="${W - L - R}" height="${Y(1) - Y(3)}"/>`;
    for (let v = lo; v <= hi; v += 2) s += `<line class="kn-c-grid${v === 0 ? ' is-zero' : ''}" x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}"/><text class="kn-c-ax" x="${L - 6}" y="${Y(v) + 3.5}">${v}%</text>`;
    for (let i = 0; i <= TURNS; i += 4) s += `<text class="kn-c-ax is-x" x="${X(i)}" y="${H - 6}">${i / 4} 年</text>`;
    const h = st.hist;
    h.forEach((p, i) => { const y0 = Y(0), y1 = Y(p.g); s += `<rect class="kn-c-g ${p.g >= 0 ? 'is-up' : 'is-dn'}" x="${X(i) - 6}" y="${Math.min(y0, y1)}" width="12" height="${Math.abs(y1 - y0)}" rx="2"/>`; });
    s += `<polyline class="kn-c-r" points="${h.map((p, i) => `${X(i)},${Y(p.rate)}` + (i < h.length - 1 ? ` ${X(i + 1)},${Y(p.rate)}` : '')).join(' ')}"/>`;
    s += `<polyline class="kn-c-pi" points="${h.map((p, i) => `${X(i)},${Y(p.pi)}`).join(' ')}"/>`;
    h.forEach((p, i) => { s += `<circle class="kn-c-pt${p.pi >= 1 && p.pi <= 3 ? '' : ' is-off'}" cx="${X(i)}" cy="${Y(p.pi)}" r="${i === h.length - 1 ? 5 : 3.2}"/>`; });
    chart.innerHTML = s;
  };

  // ---- 決める → 3 か月がたつ ----
  const decide = async () => {
    if (busy) return;
    if (st.t > TURNS) { reset(); return; }
    busy = true; box.classList.add('is-busy');
    const dec = box.querySelector('.kn-decide'); dec.classList.remove('is-go'); void dec.offsetWidth; dec.classList.add('is-go');
    await sleep(700);
    const [, , , ng, np] = NEWS[st.news];
    if (st.news === 2) st.sawOil = true;
    const eff = .5 * st.rate + .5 * st.prev;                 // 金利の効き目は、半分が次の回へ
    const g2 = .65 * st.g - .38 * (eff - st.pi - .5) + ng + (Math.random() - .5) * .5;
    const p2 = .55 * st.pi + .45 * 2 + .3 * st.g + np + (Math.random() - .5) * .3;
    st.g = Math.max(-5, Math.min(5, g2)); st.pi = Math.max(-1.5, Math.min(7, p2));
    st.prev = st.rate;
    st.hist.push({ g: st.g, pi: st.pi, rate: st.rate });
    st.score += Math.max(0, 10 - 3 * Math.max(0, Math.abs(st.pi - 2) - .3) - 1.6 * Math.max(0, Math.abs(st.g) - .3));
    st.t++;
    draw(); drawChart();
    await sleep(500);
    busy = false; box.classList.remove('is-busy');
    if (st.t > TURNS) return finish();
    st.news = pickNews(); showNews(); draw();
  };

  const finish = () => {
    box.classList.add('is-done');
    const h = st.hist.slice(1), inBand = h.filter(p => p.pi >= 1 && p.pi <= 3).length, rough = h.filter(p => Math.abs(p.g) > 2.5).length;
    const sc = Math.round(st.score / TURNS * 10);   // 100 点満点
    const [head, seal] = sc >= 80 ? ['名かじとり', '舵'] : sc >= 60 ? ['おだやかな航海', '凪'] : sc >= 40 ? ['なんとか乗りきった', '波'] : ['荒波の 3 年', '嵐'];
    let body = `12 回の会議のうち、物価の上がり方が目標の帯（1〜3%）に入ったのは ${inBand} 回。景気が「熱すぎ」や「とても悪い」になったのは ${rough} 回でした。`;
    const maxR = Math.max(...h.map(p => p.rate)), minR = Math.min(...h.map(p => p.rate));
    body += maxR - minR < .3 ? ' 金利はほとんど動かしませんでした。ニュースに合わせて動かすと、どうなるでしょう。' : ` 金利は ${f2(minR)}% から ${f2(maxR)}% のあいだで動かしました。`;
    result.innerHTML = `<span class="kn-r-seal" aria-hidden="true">${seal}</span><div><p class="kn-r-h">${head}<small>${sc} 点</small></p><p>${body}</p>${st.sawOil ? '<p>「原油の値上がり」の回は、物価は上がるのに景気は下がる、板ばさみでした。こういうとき、本物の会議でも意見が分かれます。</p>' : ''}<p class="kn-r-hint">ニュースは毎回かわります。金利は、効き目が出るまでに時間がかかることを思い出して、もう一度。</p></div>`;
    result.hidden = false;
    box.querySelector('[data-a="go"]').textContent = 'もう一度（新しい 3 年）';
    K('turn').textContent = TURNS;
    try { localStorage.setItem('azakei_kinri', String(Math.max(sc, +localStorage.getItem('azakei_kinri') || 0))); } catch (e) {}
  };

  box.addEventListener('click', e => {
    const r = e.target.closest('[data-r]');
    if (r && !busy && st.t <= TURNS) { st.rate = Math.max(-.5, Math.min(5, Math.round((st.rate + +r.dataset.r) * 100) / 100)); draw(); const o = K('rate'); o.classList.remove('is-bump'); void o.offsetWidth; o.classList.add('is-bump'); return; }
    if (e.target.closest('[data-a="go"]')) decide();
  });
  reset();
})();
