/* ================================================================
   hirogari.js — コンテスト：アプリが広がるとき（ネットワーク効果・近づいてから読みこむ）
   ・70 人の町。線は友だちのつながり。新しいアプリを、はじめに 5 人までタダで配れる
   ・毎週、友だちのうち使っている人の割合が、その人の「気にする度合い」をこえたら、その人も使いはじめる
   ・広がりは 10 週。使う人の数のグラフは S 字になり、ある所から一気にふえる（ティッピング・ポイント）
   ・友だちの多い人（人気者）に配ると、よく広がる。町も人もたとえ。見た目は hirogari.css
   ================================================================ */
(function () {
  const box = document.querySelector('[data-hirogari]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="hirogari.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'hirogari.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const W = 640, H = 400, NUM = 70, SEEDS = 5, WEEKS = 10;
  // たねつきの乱数（町のかたちを毎回同じにして、くらべやすくする）
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const P = [];
  while (P.length < NUM) { const x = 30 + rnd() * (W - 60), y = 30 + rnd() * (H - 60); if (P.every(p => Math.hypot(p.x - x, p.y - y) > 34)) P.push({ x, y, f: new Set(), th: .21 + rnd() * .32 }); }
  const link = (a, b) => { if (a !== b) { P[a].f.add(b); P[b].f.add(a); } };
  P.forEach((p, i) => P.map((q, j) => [j, Math.hypot(p.x - q.x, p.y - q.y)]).sort((a, b) => a[1] - b[1]).slice(1, 3).forEach(([j]) => link(i, j)));   // 近所の 2 人
  [3, 17, 29, 44, 58, 66].forEach(h => { for (let k = 0; k < 9; k++) link(h, Math.floor(rnd() * NUM)); });                                            // 人気者
  for (let k = 0; k < 18; k++) link(Math.floor(rnd() * NUM), Math.floor(rnd() * NUM));                                                                    // 遠くの友だち
  const E = []; P.forEach((p, i) => p.f.forEach(j => { if (i < j) E.push([i, j]); }));
  const deg = i => P[i].f.size;

  box.innerHTML = `
    <div class="hg-stage">
      <div class="hg-head"><p class="hg-app"><span class="hg-icon" aria-hidden="true">繋</span><b>まちトーク</b><small>新しいアプリ（たとえ）</small></p><p class="hg-week"><b data-k="week">0</b> 週目</p><p class="hg-users"><span>使っている人</span><b data-k="users">0</b><small>/ ${NUM} 人</small></p></div>
      <svg class="hg-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="70 人の町と、友だちのつながり">
        <g class="hg-edges">${E.map(([a, b]) => `<line x1="${P[a].x.toFixed(1)}" y1="${P[a].y.toFixed(1)}" x2="${P[b].x.toFixed(1)}" y2="${P[b].y.toFixed(1)}" data-a="${a}" data-b="${b}"/>`).join('')}</g>
        <g class="hg-nodes">${P.map((p, i) => `<g class="hg-n" data-i="${i}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})" tabindex="0" role="button" aria-label="友だち ${deg(i)} 人"><circle class="hg-ring" r="${(7 + deg(i) * .9).toFixed(1)}"/><circle class="hg-dot" r="${(4 + deg(i) * .45).toFixed(1)}"/>${deg(i) >= 8 ? `<text class="hg-deg" y="${(-9 - deg(i) * .5).toFixed(1)}">${deg(i)}</text>` : ''}</g>`).join('')}</g>
      </svg>
      <p class="hg-msg" data-k="msg" aria-live="polite">はじめにアプリをタダで配る人を、${SEEDS} 人えらんで押そう。大きい丸ほど、友だちが多い人です。</p>
    </div>
    <div class="hg-side">
      <p class="hg-left"><span>配れるのは、あと</span><b data-k="left">${SEEDS}</b><small>人</small></p>
      <div class="hg-btns"><button type="button" class="hg-go" data-a="go" disabled>10 週間すすめる</button><button type="button" data-a="auto">人気者に配る</button><button type="button" data-a="rand">でたらめに配る</button><button type="button" data-a="reset">はじめから</button></div>
      <div class="hg-rule"><p><b>町のルール（たとえ）</b>友だちのうち、使っている人の割合が「その人の気にする度合い（2〜5 割）」をこえたら、その人も使いはじめます。一度使いはじめたら、やめません。</p></div>
      <svg class="hg-chart" viewBox="0 0 300 150" role="img" aria-label="使っている人の数のグラフ"></svg>
      <ol class="hg-hist" data-k="hist"></ol>
    </div>
    <div class="hg-result" hidden></div>
    <div class="hg-learn">
      <p><b>ネットワーク効果</b>使う人がふえるほど、1 人ひとりにとっての価値も上がること。友だちがいないチャットアプリは、だれも使いません（<a href="glossary.html#network-effect">ネットワーク効果</a>）。</p>
      <p><b>ティッピング・ポイント</b>はじめはなかなか広がらないのに、ある人数をこえると一気に広がる。グラフが S 字になる理由です。</p>
      <p><b>だれに配るか</b>友だちの多い人から広がると、町じゅうに届きやすい。新しい商品を有名な人に使ってもらうのも、同じ考え方です（<a href="glossary.html#marketing">マーケティング</a>）。</p>
      <p><b>ひとり勝ちになりやすい</b>みんなが使うものに、さらに人が集まるので、1 つのサービスが大きくなりやすい。プラットフォームの強さと、気をつけたいところです（<a href="glossary.html#platform">プラットフォーム</a>・<a href="glossary.html#monopoly">独占</a>）。</p>
    </div>
    <p class="hg-note">町の人・つながり・ルールは、しくみを知るための「たとえ」です。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const nodes = [...box.querySelectorAll('.hg-n')], lines = [...box.querySelectorAll('.hg-edges line')], chart = box.querySelector('.hg-chart'), result = box.querySelector('.hg-result');
  let on = new Set(), seeds = new Set(), week = 0, hist = [], busy = false, runs = [];

  const paint = (fresh) => {
    nodes.forEach((n, i) => { n.classList.toggle('is-on', on.has(i)); n.classList.toggle('is-seed', seeds.has(i)); n.classList.toggle('is-new', !!fresh && fresh.has(i)); });
    lines.forEach(l => { const a = +l.dataset.a, b = +l.dataset.b; l.classList.toggle('is-on', on.has(a) && on.has(b)); l.classList.toggle('is-half', on.has(a) !== on.has(b)); });
    K('users').textContent = on.size; K('week').textContent = week; K('left').textContent = SEEDS - seeds.size;
    box.querySelector('[data-a="go"]').disabled = busy || !seeds.size || week > 0;
  };
  const drawChart = () => {
    const X = w => 26 + w / WEEKS * 266, Y = v => 132 - v / NUM * 120;
    let s = `<line class="hg-c-ax" x1="26" x2="292" y1="132" y2="132"/><line class="hg-c-ax" x1="26" x2="26" y1="8" y2="132"/><line class="hg-c-goal" x1="26" x2="292" y1="${Y(NUM * .6)}" y2="${Y(NUM * .6)}"/><text class="hg-c-t" x="290" y="${Y(NUM * .6) - 4}">6 割</text>`;
    for (let w = 0; w <= WEEKS; w += 2) s += `<text class="hg-c-t is-x" x="${X(w)}" y="146">${w} 週</text>`;
    runs.slice(-3, -1).forEach(r => { s += `<polyline class="hg-c-old" points="${r.map((v, w) => `${X(w)},${Y(v)}`).join(' ')}"/>`; });
    if (hist.length) s += `<polyline class="hg-c-l" points="${hist.map((v, w) => `${X(w)},${Y(v)}`).join(' ')}"/>` + hist.map((v, w) => `<circle class="hg-c-p" cx="${X(w)}" cy="${Y(v)}" r="3"/>`).join('');
    chart.innerHTML = s;
    K('hist').innerHTML = hist.map((v, w) => w ? `<li><span>${w} 週目</span><b>+${v - hist[w - 1]}</b></li>` : '').join('');
  };
  const reset = () => { on = new Set(); seeds = new Set(); week = 0; hist = []; busy = false; result.hidden = true; box.classList.remove('is-run', 'is-done'); paint(); drawChart(); K('msg').textContent = `はじめにアプリをタダで配る人を、${SEEDS} 人えらんで押そう。大きい丸ほど、友だちが多い人です。`; };
  const toggleSeed = i => {
    if (busy || week > 0) return;
    if (seeds.has(i)) { seeds.delete(i); on.delete(i); }
    else if (seeds.size < SEEDS) { seeds.add(i); on.add(i); }
    paint();
    K('msg').textContent = seeds.size < SEEDS ? `この人は友だち ${deg(i)} 人。あと ${SEEDS - seeds.size} 人えらべます。` : '5 人そろいました。「10 週間すすめる」を押そう。';
  };
  const run = async () => {
    if (busy || !seeds.size || week > 0) return;
    busy = true; box.classList.add('is-run'); paint();
    hist = [on.size]; drawChart();
    let tip = -1;
    for (week = 1; week <= WEEKS; week++) {
      const fresh = new Set();
      P.forEach((p, i) => { if (on.has(i) || !p.f.size) return; let c = 0; p.f.forEach(j => { if (on.has(j)) c++; }); if (c / p.f.size >= p.th) fresh.add(i); });
      fresh.forEach(i => on.add(i));
      hist.push(on.size);
      // ティッピング・ポイント：ゆっくりのあとで、ふえ方が前の週の 2 倍以上（6 人以上）になった週
      const prevGain = week >= 2 ? hist[week - 1] - hist[week - 2] : 99;
      if (tip < 0 && week >= 2 && hist[week - 1] < NUM * .5 && fresh.size >= 6 && fresh.size >= prevGain * 2) tip = week;
      paint(fresh); drawChart();
      K('msg').textContent = fresh.size ? `${week} 週目：あらたに ${fresh.size} 人が使いはじめました。${tip === week ? 'ここから一気に広がりはじめました！' : ''}` : `${week} 週目：だれもふえませんでした。友だちがあまり使っていないと、なかなか広がりません。`;
      await sleep(fresh.size ? 900 : 500);
      if (!fresh.size && week >= 3 && hist[week - 1] === hist[week - 2]) { week++; while (week <= WEEKS) { hist.push(on.size); week++; } break; }
    }
    week = WEEKS; busy = false; box.classList.remove('is-run'); box.classList.add('is-done'); paint(); drawChart();
    runs.push(hist.slice());
    finish(tip);
  };
  const finish = tip => {
    const pct = Math.round(on.size / NUM * 100), sd = [...seeds], avgDeg = sd.reduce((a, i) => a + deg(i), 0) / Math.max(1, sd.length);
    const head = pct >= 60 ? '町じゅうに広がりました' : pct >= 25 ? 'ある所で止まりました' : 'ほとんど広がりませんでした';
    result.innerHTML = `<span class="hg-r-seal" aria-hidden="true">繋</span><div><p class="hg-r-h">${head}<small>${pct}%（${on.size} / ${NUM} 人）</small></p>
      <p>はじめに配った ${sd.length} 人の友だちの数は、平均 ${avgDeg.toFixed(1)} 人。${tip > 0 ? `${tip} 週目から一気に広がりました。ゆっくりのあとで急に上がる、S 字のグラフがティッピング・ポイントのしるしです。` : hist[1] - hist[0] >= 8 ? '友だちの多い人から、はじめの週から勢いよく広がりました。' : pct >= 25 ? '少しずつ広がりました。' : 'グラフがなかなか上がりませんでした。友だちが使っていないと、広がりません。'}</p>
      <p class="hg-r-hint">${avgDeg >= 8 ? '人気者に配ると、よく広がりますね。' : '友だちの多い人（大きい丸）に配ると、どうなるかな？ 「人気者に配る」でくらべてみよう。'}グラフには、前の 2 回の結果も細い線で残ります。</p></div>`;
    result.hidden = false;
    try { localStorage.setItem('azakei_hirogari', String(Math.max(pct, +localStorage.getItem('azakei_hirogari') || 0))); } catch (e) {}
  };

  box.addEventListener('click', e => {
    const n = e.target.closest('.hg-n'); if (n) { toggleSeed(+n.dataset.i); return; }
    const a = e.target.closest('[data-a]'); if (!a || busy) return;
    if (a.dataset.a === 'go') run();
    else if (a.dataset.a === 'reset') reset();
    else { reset(); const order = P.map((_, i) => i); if (a.dataset.a === 'auto') order.sort((x, y) => deg(y) - deg(x)); else order.sort(() => Math.random() - .5); order.slice(0, SEEDS).forEach(i => { seeds.add(i); on.add(i); }); paint(); K('msg').textContent = a.dataset.a === 'auto' ? '友だちの多い 5 人に配りました。「10 週間すすめる」を押そう。' : 'でたらめに 5 人に配りました。「10 週間すすめる」を押そう。'; }
  });
  box.addEventListener('keydown', e => { const n = e.target.closest('.hg-n'); if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleSeed(+n.dataset.i); } });
  reset();
})();
