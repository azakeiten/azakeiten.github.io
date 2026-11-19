/* ================================================================
   robot.js — 経済ラボ：ロボットがやってきた工場（近づいてから読みこむ）
   ・20 人が働くパン工場。機械化の目標（0〜80%）と、学び直し（なし・少し・たくさん）を決めて 5 年すすめる
   ・ベルトコンベアの上をパンが流れ、ロボットの腕がふえていく。20 人の色が、つくる・機械の世話・新しいパンづくり・ほかの仕事へ、と変わる
   ・パンの値段・1 日に売れる数・町の人の得・工場で働く人を、年ごとに見る
   ・数字はすべてたとえ。見た目は robot.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-robot]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="robot.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'robot.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const W0 = 20, P0 = 200, Q0 = 2000;
  const LEARN = [['なし', 0], ['少し', .5], ['たくさん', 1]];
  let goal = 50, learn = 1, busy = false;
  // 1 年分（たとえ）：機械化が進むと、1 人あたりつくれる数がふえ、パンが安くなり、買う人がふえる
  const year = (y, g, r) => {
    const a = g / 100 * y / 5, p = P0 * (1 - .35 * a), q = Q0 * Math.pow(P0 / p, 1.2);
    const make = Math.min(W0, Math.ceil(q * (1 - a) / 100)), care = Math.ceil(a * 6);
    const newJob = Math.round(r * a * 10);                 // 学び直しで生まれる、新しいパンづくり・お店の仕事
    let rest = W0 - make, toCare = Math.min(rest, care); rest -= toCare;
    const toNew = Math.min(rest, newJob); rest -= toNew;
    const extra = toNew * 60;                               // 新しいパンの売上（1 人あたり 1 日 60 個、たとえ）
    return { a, p, q: q + extra, make, care: toCare, neu: toNew, out: rest, save: (P0 - p) * Q0 * 365 / 1e4 };
  };
  box.innerHTML = `
    <div class="rb-plant">
      <svg class="rb-line" viewBox="0 0 520 170" role="img" aria-label="パン工場のベルトコンベア">
        <rect width="520" height="170" fill="#e8eef3"/>
        <rect x="0" y="118" width="520" height="16" rx="8" class="rb-belt"/>
        <g class="rb-rollers">${Array.from({ length: 14 }, (_, i) => `<circle cx="${18 + i * 37}" cy="126" r="5"/>`).join('')}</g>
        <g data-k="breads">${Array.from({ length: 8 }, (_, i) => `<g class="rb-bread" style="--d:${(-i * .75).toFixed(2)}s"><ellipse cx="0" cy="108" rx="16" ry="10"/><path d="M-8 104 q4 -4 8 0 q4 -4 8 0" class="rb-cut"/></g>`).join('')}</g>
        <g data-k="arms"></g>
        <text x="12" y="24" class="rb-tag" data-k="ytag">いま</text>
      </svg>
      <ol class="rb-years" data-k="years">${Array.from({ length: 6 }, (_, y) => `<li data-y="${y}">${y ? y + ' 年目' : 'いま'}</li>`).join('')}</ol>
      <div class="rb-people" data-k="people" aria-hidden="true">${'<i class="is-make"></i>'.repeat(W0)}</div>
      <p class="rb-legend"><span><i class="is-make"></i>パンをつくる</span><span><i class="is-care"></i>機械の世話</span><span><i class="is-new"></i>新しいパンづくり</span><span><i class="is-out"></i>ほかの仕事をさがす</span></p>
      <div class="rb-stats"><p><small>パン 1 個</small><b data-k="p">200 円</b></p><p><small>1 日に売れる</small><b data-k="q">2,000 個</b></p><p><small>町の人の得（1 年）</small><b data-k="save">0 万円</b></p><p><small>工場で働く人</small><b data-k="w">20 人</b></p></div>
      <p class="rb-msg" data-k="msg" aria-live="polite">機械化の目標と学び直しを決めて、「5 年すすめる」を押そう。</p>
    </div>
    <div class="rb-side">
      <label class="rb-sl"><span>5 年後の機械化の目標</span><output data-k="goal">50%</output><input type="range" min="0" max="80" step="10" value="50" data-s="goal"></label>
      <p class="rb-h">学び直し（新しい仕事を覚える時間とお金）</p>
      <div class="rb-learn-opts" role="radiogroup" aria-label="学び直し">${LEARN.map(([n], i) => `<button type="button" role="radio" data-l="${i}" aria-checked="${i === learn}">${n}</button>`).join('')}</div>
      <button type="button" class="rb-go" data-a="go">5 年すすめる</button>
      <div class="rb-res" hidden></div>
    </div>
    <div class="rb-learn">
      <p><b>機械は、1 人がつくれる量をふやす</b>同じ人数で、もっと多くつくれるようになることを「生産性が上がる」といいます。パンは安くなり、町の人はその分ほかのことにお金を使えます（<a href="glossary.html#productivity">生産性</a>）。</p>
      <p><b>なくなる仕事と、生まれる仕事</b>くり返しの作業は機械に任せられる一方、機械の世話や、新しい商品を考える仕事が生まれます。新しい仕事につけるかどうかは、学び直しにかかっています（<a href="glossary.html#ai-work">AI と仕事</a>）。</p>
      <p><b>安くなると、たくさん売れる</b>パンが安くなると買う人がふえ、つくる量もふえます。そのため、機械が入っても、思ったほどは人がへらないこともあります。</p>
      <p><b>こまる人をひとりにしない</b>仕事が変わる人には、学ぶ時間やお金、次の仕事をさがす手助けが必要です。会社だけでなく、国や町のしくみも大切です。</p>
    </div>
    <p class="rb-note">工場・人数・値段・売れる数は、しくみを知るための「たとえ」です。実際にどの仕事がどれだけ変わるかは、まだわからないことも多くあります。</p>`;
  const K = k => box.querySelector(`[data-k="${k}"]`);
  const people = [...box.querySelectorAll('.rb-people i')];
  const paint = (y, r) => {
    K('p').textContent = Math.round(r.p) + ' 円'; K('q').textContent = Math.round(r.q).toLocaleString() + ' 個';
    K('save').textContent = Math.round(r.save).toLocaleString() + ' 万円'; K('w').textContent = (r.make + r.care + r.neu) + ' 人';
    const roles = [].concat(Array(r.make).fill('make'), Array(r.care).fill('care'), Array(r.neu).fill('new'), Array(r.out).fill('out'));
    people.forEach((p, i) => { const c = 'is-' + roles[i]; if (!p.classList.contains(c)) { p.className = c; p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; } });
    const arms = Math.round(r.a * 6);
    K('arms').innerHTML = Array.from({ length: arms }, (_, i) => `<g class="rb-arm" transform="translate(${60 + i * 72} 0)" style="--d:${(i * .3).toFixed(1)}s"><rect x="-10" y="20" width="20" height="14" rx="3"/><g class="rb-swing"><rect x="-3" y="32" width="6" height="40" rx="3"/><path d="M-10 74 h20 v8 h-6 v-4 h-8 v4 h-6 Z"/></g></g>`).join('');
    K('ytag').textContent = y ? `${y} 年目・機械化 ${Math.round(r.a * 100)}%` : 'いま';
    box.querySelectorAll('.rb-years li').forEach(li => li.classList.toggle('is-on', +li.dataset.y <= y));
    box.querySelector('.rb-line').style.setProperty('--speed', (2.4 / (1 + r.a * 2.5)).toFixed(2) + 's');
  };
  const reset = () => { paint(0, year(0, goal, LEARN[learn][1])); K('msg').textContent = '機械化の目標と学び直しを決めて、「5 年すすめる」を押そう。'; box.querySelector('.rb-res').hidden = true; };
  const run = async () => {
    if (busy) return; busy = true; box.classList.add('is-busy'); reset();
    const L = LEARN[learn][1]; let r;
    for (let y = 1; y <= 5; y++) {
      r = year(y, goal, L); paint(y, r);
      K('msg').textContent = `${y} 年目：パンは ${Math.round(r.p)} 円に。工場で働く人は ${r.make + r.care + r.neu} 人（新しいパンづくり ${r.neu} 人）、ほかの仕事をさがす人は ${r.out} 人。`;
      await sleep(1300);
    }
    const res = box.querySelector('.rb-res');
    res.innerHTML = `<p class="rb-r-h">5 年後の工場</p>
      <ul class="rb-r-list"><li><small>パンの値段</small><b>200 円 → ${Math.round(r.p)} 円</b></li><li><small>1 日に売れる数</small><b>2,000 → ${Math.round(r.q).toLocaleString()} 個</b></li><li><small>町の人の得（1 年）</small><b>${Math.round(r.save).toLocaleString()} 万円</b></li><li class="${r.out ? 'is-warn' : ''}"><small>ほかの仕事をさがす人</small><b>${r.out} 人</b></li></ul>
      <p class="rb-r-tip">${!goal ? '機械化しないと、値段も仕事も変わりません。でも、ほかの工場が安くつくりはじめたら……？' : r.out && L < 1 ? '学び直しを「たくさん」にすると、新しいパンづくりに移れる人がふえます。' : r.out ? '学び直しをしても、全員は残れませんでした。町や国の手助けが大切です。' : '機械化しても、学び直しと売れる量のおかげで、全員が工場に残れました。'}</p>`;
    res.hidden = false;
    busy = false; box.classList.remove('is-busy');
    try { localStorage.setItem('azakei_robot', '1'); } catch (e) {}
  };
  box.addEventListener('input', e => { const s = e.target.closest('[data-s="goal"]'); if (s && !busy) { goal = +s.value; K('goal').textContent = goal + '%'; reset(); } });
  box.addEventListener('click', e => {
    const l = e.target.closest('[data-l]'); if (l && !busy) { learn = +l.dataset.l; box.querySelectorAll('[data-l]').forEach(b => b.setAttribute('aria-checked', b === l)); reset(); return; }
    if (e.target.closest('[data-a="go"]')) run();
  });
  reset();
})();
