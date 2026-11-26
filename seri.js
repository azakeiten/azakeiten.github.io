/* ================================================================
   seri.js — 経済ラボ：せりの会場（オークション・近づいてから読みこむ）
   ・3 つの品物を、4 人の仲買人と競りあう。あなたには「この品物があなたにとっていくらの価値か」が見える
   ・せり上げ式：値段がだんだん上がり、自分の価値をこえた人から札を下ろす。最後の 1 人が落札
   ・封筒式（封印入札）：1 回だけ金額を書いて出す。いちばん高い人が、書いた金額で落札
   ・終わると、みんなの「価値」を見せて、値段がどう決まったかをふり返る（数字はすべてたとえ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-seri]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const yen = n => '¥' + Math.round(n).toLocaleString();
  const rnd = (lo, hi, st) => lo + Math.floor(Math.random() * ((hi - lo) / st + 1)) * st;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  // 品物：印・名前・ひとこと・価値のはば（下・上）・値段の刻み
  const LOTS = [
    ['鮪', 'マグロ 1 本', '朝のせりで有名な、大きなマグロ。すし屋さんも料理屋さんも、ほしがっています。', 200000, 500000, 10000],
    ['瓜', '高級メロン 1 玉', 'あみ目のきれいなメロン。贈りものにする人には、とくに価値があります。', 3000, 12000, 500],
    ['切', '古い切手 1 枚', '集めている人には宝もの。でも、興味のない人にはただの紙です。', 2000, 30000, 1000]
  ];
  const WHO = [['12', 'すし屋さん', '#3b5a78'], ['27', '料理屋さん', '#5f7f4e'], ['35', 'スーパー', '#8a5a2b'], ['48', '仲買人', '#7a4a6b']];
  const XS = [76, 198, 320, 442, 564];   // 0〜3 が仲買人、4 があなた

  const figure = (i, col, num, you) => `<g class="sr-b${you ? ' is-you' : ''}" data-b="${i}" transform="translate(${XS[i]} 300)">
      <ellipse cx="0" cy="4" rx="34" ry="6" class="sr-shadow"/>
      <path d="M-26 0 Q-26 -44 0 -46 Q26 -44 26 0 Z" fill="${col}"/>
      <circle cx="0" cy="-60" r="17" class="sr-head"/>
      <path d="M-8 -60 h3 M5 -60 h3" class="sr-eye"/><path d="M-5 -52 Q0 -48 5 -52" class="sr-eye"/>
      <g class="sr-pad"><path d="M16 -34 L30 -70" class="sr-arm"/><rect x="18" y="-108" width="30" height="34" rx="6" class="sr-paddle"/><text x="33" y="-85" class="sr-num">${num}</text></g>
      <text y="22" class="sr-name">${you ? 'あなた' : WHO[i][1]}</text>
      <g class="sr-say" transform="translate(-34 -120)"><rect x="-36" y="-16" width="72" height="24" rx="12"/><text y="1">はい</text></g>
      <g class="sr-env" transform="translate(0 -150)"><rect x="-38" y="-18" width="76" height="34" rx="4"/><path d="M-38 -18 L0 4 L38 -18" class="sr-flap"/><text y="9" class="sr-env-t"></text></g>
    </g>`;

  box.innerHTML = `
    <div class="sr-stage">
      <svg class="sr-hall" viewBox="0 0 640 340" role="img" aria-label="せりの会場。まん中に値段の板、下に 5 人が札を持って並ぶ">
        <defs><radialGradient id="sr-lamp"><stop offset="0" stop-color="#ffd98a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient></defs>
        <rect width="640" height="340" class="sr-bg"/>
        ${[120, 320, 520].map(x => `<g class="sr-lampg"><line x1="${x}" y1="0" x2="${x}" y2="22" class="sr-cord"/><circle cx="${x}" cy="60" r="90" fill="url(#sr-lamp)"/><path d="M${x - 16} 34 Q${x} 18 ${x + 16} 34 Z" class="sr-shade"/></g>`).join('')}
        <rect x="0" y="300" width="640" height="40" class="sr-floor"/>
        <g class="sr-board"><rect x="180" y="18" width="280" height="92" rx="12"/><text x="320" y="44" class="sr-board-l">いまの値段</text><text x="320" y="92" class="sr-price">—</text></g>
        <g class="sr-gavel" transform="translate(498 64)"><g class="sr-gavel-h"><rect x="-6" y="-2" width="44" height="8" rx="3"/><rect x="30" y="-14" width="22" height="32" rx="5"/></g><rect x="20" y="22" width="44" height="10" rx="4" class="sr-block"/></g>
        <g class="sr-lot" transform="translate(320 160)"></g>
        ${WHO.map((w, i) => figure(i, w[2], w[0], false)).join('')}${figure(4, '#b5432f', '50', true)}
        <g class="sr-sold" transform="translate(320 170) rotate(-8)"><rect x="-96" y="-34" width="192" height="64" rx="10"/><text y="14">落札</text></g>
      </svg>
      <p class="sr-msg" aria-live="polite">品物と、せりの方法を選んで始めよう。</p>
    </div>
    <div class="sr-side">
      <div class="sr-mode" role="group" aria-label="せりの方法"><button type="button" data-mode="up" aria-pressed="true">せり上げ式</button><button type="button" data-mode="env" aria-pressed="false">封筒式</button></div>
      <p class="sr-how" data-how></p>
      <div class="sr-lotcard"><span class="sr-seal" data-k="seal">鮪</span><div><p class="sr-lot-n"><small data-k="no">1 / 3 品目</small><b data-k="name"></b></p><p class="sr-lot-t" data-k="note"></p></div></div>
      <p class="sr-val"><span>この品物の、あなたにとっての価値</span><b data-k="val">—</b><small>これより高く買うと、損になります。ほかの 4 人の価値は、終わるまでひみつ。</small></p>
      <div class="sr-ctl" data-ctl="up"><button type="button" class="sr-go" data-a="start">せりを始める</button><button type="button" class="sr-drop" data-a="drop" disabled>札を下ろす（おりる）</button></div>
      <div class="sr-ctl" data-ctl="env" hidden><label class="sr-bid"><span>封筒に書く金額</span><output>—</output><input type="range"></label><button type="button" class="sr-go" data-a="seal">封筒を出す</button></div>
      <ol class="sr-score" data-k="score"></ol>
    </div>
    <div class="sr-reveal" hidden></div>
    <div class="sr-learn">
      <p><b>値段は、どう決まる？</b>せり上げ式では、いちばん高く評価した人が落札し、値段は「2 番目に高く評価した人が降りたところ」で決まります。ほしい人どうしの競争が、値段を決めるのです。</p>
      <p><b>身近なせり</b>魚や野菜の市場では、毎朝せりで値段が決まります。ネットのオークションも、せり上げ式のなかまです。</p>
      <p><b>封筒式（封印入札）</b>ほかの人の金額が見えないまま、1 回だけ書いて出します。国や市が工事をたのむ相手を決める「入札」も、このなかま（こちらは安い金額を書いた会社が選ばれます）。</p>
      <p><b>価値は、人によってちがう</b>同じ切手でも、集めている人と興味のない人では、価値がまったくちがいます。取引は、価値のちがう人どうしが出会うから生まれます。くわしくは<a href="glossary.html#market">市場</a>・<a href="glossary.html#supply-demand">需要と供給</a>へ。</p>
    </div>
    <p class="sr-note">品物の価値や仲買人の考え方は、しくみを知るための「たとえ」です。実際の市場の値段ではありません。</p>`;

  const svg = box.querySelector('.sr-hall'), stage = box.querySelector('.sr-stage');
  const priceT = svg.querySelector('.sr-price'), lotG = svg.querySelector('.sr-lot');
  const msg = box.querySelector('.sr-msg'), reveal = box.querySelector('.sr-reveal');
  const K = k => box.querySelector(`[data-k="${k}"]`);
  const B = [...svg.querySelectorAll('.sr-b')];
  const bidIn = box.querySelector('.sr-bid input'), bidOut = box.querySelector('.sr-bid output');
  // 品物の絵
  const ART = [
    `<ellipse cx="0" cy="0" rx="78" ry="26" fill="#47617a"/><path d="M-78 0 Q-60 -26 0 -26 Q60 -26 78 0 Z" fill="#2f4458"/><path d="M70 0 L104 -22 L96 0 L104 22 Z" fill="#2f4458"/><circle cx="-56" cy="-4" r="5" fill="#fff"/><circle cx="-56" cy="-4" r="2.4" fill="#1a1a1a"/><path d="M-30 6 Q10 14 50 6" stroke="#9fb4c7" stroke-width="3" fill="none"/><ellipse cx="0" cy="34" rx="92" ry="7" fill="rgba(0,0,0,.25)"/>`,
    `<circle cx="0" cy="0" r="36" fill="#8fb36a"/><path d="M-30 -18 Q0 -6 30 -18 M-34 0 Q0 12 34 0 M-30 18 Q0 28 30 18 M-18 -32 Q-8 0 -18 32 M0 -36 Q8 0 0 36 M18 -32 Q26 0 18 32" stroke="#e8f0d6" stroke-width="2" fill="none" opacity=".8"/><path d="M0 -36 Q4 -48 12 -50" stroke="#6b4a22" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="42" rx="44" ry="6" fill="rgba(0,0,0,.25)"/>`,
    `<g transform="rotate(-6)"><rect x="-40" y="-48" width="80" height="96" fill="#fffaf0" stroke="#fffaf0" stroke-width="6" stroke-dasharray="4 5"/><rect x="-32" y="-40" width="64" height="80" fill="#c55a3c"/><circle cx="0" cy="-4" r="20" fill="#f3d08a"/><text x="0" y="3" text-anchor="middle" font-size="18" font-weight="800" fill="#7d2c1e" font-family="serif">郵</text><text x="0" y="34" text-anchor="middle" font-size="11" font-weight="700" fill="#fffaf0">10 銭</text></g><ellipse cx="0" cy="56" rx="48" ry="6" fill="rgba(0,0,0,.25)"/>`
  ];

  let mode = 'up', lot = 0, vals = [], step = 0, price = 0, out = [], token = 0, running = false, total = 0, rec = [];
  const L = () => LOTS[lot];
  const how = () => { box.querySelector('[data-how]').textContent = mode === 'up' ? '値段が少しずつ上がります。高すぎると思ったら「札を下ろす」。最後まで札を上げていた 1 人が、そのときの値段で落札します。' : '金額を 1 回だけ書いて、封筒で出します。いちばん高い金額を書いた人が、自分の書いた金額で落札します。'; };
  const setPrice = (v, bump) => { priceT.textContent = v == null ? '—' : yen(v); if (bump && !reduce) { priceT.classList.remove('is-bump'); void priceT.getBBox(); priceT.classList.add('is-bump'); } };
  const say = t => { msg.textContent = t; };
  const cls = (i, c, on) => B[i].classList.toggle(c, on);

  const setup = () => {
    token++; running = false;
    const [seal, name, note, lo, hi, st] = L();
    step = st;
    vals = [0, 1, 2, 3, 4].map(() => rnd(lo, hi, st));
    out = [false, false, false, false, false];
    B.forEach((b, i) => { b.classList.remove('is-out', 'is-bid', 'is-win', 'is-env', 'is-open'); b.querySelector('.sr-env-t').textContent = ''; });
    stage.classList.remove('is-sold'); svg.querySelector('.sr-gavel').classList.remove('is-hit');
    lotG.innerHTML = ART[lot]; lotG.classList.remove('is-in'); void lotG.getBBox(); lotG.classList.add('is-in');
    K('seal').textContent = seal; K('name').textContent = name; K('note').textContent = note; K('no').textContent = `${lot + 1} / 3 品目`;
    K('val').textContent = yen(vals[4]);
    setPrice(null); reveal.hidden = true; reveal.innerHTML = '';
    bidIn.min = Math.round(lo / 2 / st) * st; bidIn.max = hi * 1.2; bidIn.step = st; bidIn.value = Math.round(vals[4] * .85 / st) * st; bidOut.textContent = yen(+bidIn.value);
    box.querySelector('[data-a="start"]').disabled = false; box.querySelector('[data-a="drop"]').disabled = true; box.querySelector('[data-a="seal"]').disabled = false;
    say(mode === 'up' ? `${name}。あなたの価値は ${yen(vals[4])}。「せりを始める」を押そう。` : `${name}。あなたの価値は ${yen(vals[4])}。封筒に書く金額を決めよう。`);
  };

  // ---- せり上げ式 ----
  const runUp = async () => {
    const t = ++token; running = true;
    box.querySelector('[data-a="start"]').disabled = true; box.querySelector('[data-a="drop"]').disabled = false;
    price = Math.max(step, L()[3] - 4 * step); setPrice(price, true);
    say('せりが始まりました。値段が上がっていきます。');
    await sleep(900);
    while (t === token) {
      const next = price + step;
      // 次の値段が自分の価値をこえる仲買人は、札を下ろす（少しだけ迷うこともある）
      const stay = [0, 1, 2, 3, 4].filter(i => !out[i] && (i === 4 || vals[i] >= next));
      const willOut = [0, 1, 2, 3].filter(i => !out[i] && vals[i] < next);
      const activeNow = [0, 1, 2, 3, 4].filter(i => !out[i]);
      if (stay.length <= 1) {
        const win = stay.length ? stay[0] : activeNow[Math.floor(Math.random() * activeNow.length)];
        willOut.forEach(i => { if (i !== win) { out[i] = true; cls(i, 'is-out', true); } });
        return sold(win, price, t);
      }
      willOut.forEach(i => { out[i] = true; cls(i, 'is-out', true); cls(i, 'is-bid', false); });
      if (willOut.length) say(`${willOut.map(i => WHO[i][1]).join('・')}が札を下ろしました。のこり ${stay.length} 人。`);
      await sleep(willOut.length ? 650 : 120); if (t !== token) return;
      price = next; setPrice(price, true);
      stay.forEach(i => { cls(i, 'is-bid', false); void B[i].getBBox(); cls(i, 'is-bid', true); });
      await sleep(Math.max(320, 760 - (price - L()[3]) / step * 12)); if (t !== token) return;
    }
  };
  const dropMe = () => {
    if (!running || out[4]) return;
    out[4] = true; cls(4, 'is-out', true); cls(4, 'is-bid', false);
    box.querySelector('[data-a="drop"]').disabled = true;
    say(`あなたは ${yen(price)} で札を下ろしました。のこりの人で、せりは続きます。`);
  };

  // ---- 封筒式 ----
  const runEnv = async () => {
    const t = ++token; running = true;
    box.querySelector('[data-a="seal"]').disabled = true;
    const bids = vals.map((v, i) => i === 4 ? +bidIn.value : Math.round(v * (.68 + Math.random() * .22) / step) * step);
    say('みんなが封筒を出しました。いまから開けます。');
    B.forEach(b => b.classList.add('is-env'));
    await sleep(1100); if (t !== token) return;
    for (const i of [0, 1, 2, 3, 4]) {
      B[i].querySelector('.sr-env-t').textContent = yen(bids[i]); cls(i, 'is-open', true);
      await sleep(620); if (t !== token) return;
    }
    const top = Math.max(...bids), ws = [0, 1, 2, 3, 4].filter(i => bids[i] === top), win = ws[Math.floor(Math.random() * ws.length)];
    [0, 1, 2, 3, 4].forEach(i => { if (i !== win) cls(i, 'is-out', true); });
    setPrice(top, true);
    sold(win, top, t, bids);
  };

  // ---- 落札とふり返り ----
  const sold = async (win, p, t, bids) => {
    running = false;
    box.querySelector('[data-a="drop"]').disabled = true;
    cls(win, 'is-win', true); cls(win, 'is-bid', true);
    svg.querySelector('.sr-gavel').classList.add('is-hit');
    await sleep(380); if (t !== token) return;
    stage.classList.add('is-sold');
    const gain = win === 4 ? vals[4] - p : 0;
    total += gain; rec.push([L()[1], win === 4, gain, mode]);
    say(win === 4 ? (gain >= 0 ? `落札！ あなたが ${yen(p)} で買いました。価値との差 ${yen(gain)} が、あなたの得です。` : `落札！ でも ${yen(p)} は、あなたの価値 ${yen(vals[4])} より高い。${yen(-gain)} の払いすぎです。`)
      : `落札！ ${WHO[win][1]}（${WHO[win][0]} 番）が ${yen(p)} で買いました。`);
    await sleep(900); if (t !== token) return;
    // みんなの価値を見せる
    const order = [0, 1, 2, 3, 4].sort((a, b) => vals[b] - vals[a]);
    const mx = Math.max(...vals, p) * 1.08;
    const nm = i => i === 4 ? 'あなた' : WHO[i][1];
    const second = vals[order[1]];
    let why;
    if (mode === 'up') why = win === order[0] ? `いちばん高く評価した${nm(win)}が落札。値段 ${yen(p)} は、2 番目に高く評価した${nm(order[1])}（${yen(second)}）のあたりで決まりました。` : win === 4 ? `あなたは、自分の価値（${yen(vals[4])}）をこえても札を下ろさなかったので、いちばん高く評価した${nm(order[0])}（${yen(vals[order[0]])}）に競り勝ちました。でも、価値より高く買うと損。自分の価値に来たら札を下ろすのが、いちばん損をしないやり方です。`
      : `いちばん高く評価したあなたは、途中で札を下ろしました。せり上げ式では、自分の価値まで札を上げつづけるのが、いちばん損をしないやり方です。`;
    else why = `封筒式では、みんな自分の価値より少し低く書きます（価値どおりに書くと、勝っても得はゼロ）。でも低すぎると、ほかの人に負けます。${win === 4 ? '' : `あなたが書いたのは ${yen(bids[4])}。`}`;
    reveal.innerHTML = `<p class="sr-r-h">ふり返り：みんなの「価値」</p>
      <ul class="sr-bars">${order.map(i => `<li class="${i === win ? 'is-win' : ''}${i === 4 ? ' is-you' : ''}"><span>${nm(i)}</span><i style="--w:${(vals[i] / mx * 100).toFixed(1)}%"></i><b>${yen(vals[i])}</b>${bids ? `<small>書いた金額 ${yen(bids[i])}</small>` : ''}</li>`).join('')}
        <li class="sr-pline" style="--w:${(p / mx * 100).toFixed(1)}%"><em>落札の値段 ${yen(p)}</em></li></ul>
      <p>${why}</p>
      <div class="sr-next"><button type="button" class="sr-go" data-a="next">${lot < 2 ? '次の品物へ' : 'もう一度、3 品'}</button><button type="button" data-a="again">同じ品物でもう一度</button></div>`;
    reveal.hidden = false;
    score();
    if (lot === 2) {
      try { localStorage.setItem('azakei_seri', String((+localStorage.getItem('azakei_seri') || 0) + 1)); const b = localStorage.getItem('azakei_seri_best'); if (total >= 0 && (b === null || total > +b)) localStorage.setItem('azakei_seri_best', String(Math.round(total))); } catch (e) {}
      if (window.AZAKEI_TALK) { window.AZAKEI_TALK(reveal, 'seri', total > 0 ? 'top' : rec.some(r => r[1]) ? 'mid' : 'low'); const lt = reveal.querySelector('.lt'), nx = reveal.querySelector('.sr-next'); if (lt && nx) nx.before(lt); }
    }
  };
  const score = () => {
    K('score').innerHTML = rec.map(([n, w, g, m]) => `<li><span>${n}<small>${m === 'up' ? 'せり上げ' : '封筒'}</small></span><b class="${g < 0 ? 'is-minus' : ''}">${w ? (g >= 0 ? '+' : '−') + yen(Math.abs(g)) : '買わず'}</b></li>`).join('') + (rec.length ? `<li class="sr-total"><span>あなたの得の合計</span><b class="${total < 0 ? 'is-minus' : ''}">${total < 0 ? '−' : ''}${yen(Math.abs(total))}</b></li>` : '');
  };

  box.addEventListener('click', e => {
    const m = e.target.closest('[data-mode]');
    if (m) { mode = m.dataset.mode; box.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b === m)); box.querySelectorAll('[data-ctl]').forEach(c => { c.hidden = c.dataset.ctl !== mode; }); how(); setup(); return; }
    const a = e.target.closest('[data-a]');
    if (!a) return;
    const k = a.dataset.a;
    if (k === 'start') runUp();
    else if (k === 'drop') dropMe();
    else if (k === 'seal') runEnv();
    else if (k === 'next') { if (lot === 2) { lot = 0; total = 0; rec = []; score(); } else lot++; setup(); }
    else if (k === 'again') setup();
  });
  bidIn.addEventListener('input', () => { bidOut.textContent = yen(+bidIn.value); });
  how(); setup();
})();
