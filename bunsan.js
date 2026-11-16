/* ================================================================
   bunsan.js — コンテスト：ポートフォリオの 10 年（分散投資の体験・近づいてから読みこむ）
   ・チップ 100 枚を、6 つの「たとえ」の会社に分ける。毎年 1 枚の出来事カードで、会社の値打ちが上下する
   ・猛暑ならアイス屋さん、長雨ならかさメーカー。逆に動く会社をいっしょに持つと、ゆれが小さくなる
   ・10 年後に「均等に分けた場合」「1 社だけの場合」と見くらべる（同じ出来事の並びで計算）
   ・会社も数字もすべてたとえ。実際の会社・株価ではなく、投資をすすめるものでもない
   ================================================================ */
(function () {
  const box = document.querySelector('[data-bunsan]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const YEARS = 10;
  const CO = [
    ['氷', 'アイス屋さん', '#5fa8c9'], ['傘', 'かさメーカー', '#3b5a78'], ['旅', '旅行会社', '#d08a2e'],
    ['遊', 'ゲーム会社', '#7a4a8a'], ['電', '電力会社', '#b8901c'], ['食', '食品会社', '#4f7f45']
  ];
  // 出来事：印・題・ひとこと・6 社の値動き（%）
  const EV = [
    ['暑', '記録的な猛暑', 'アイスが飛ぶように売れ、冷房で電気もたくさん使われた。', [32, -14, 4, -2, 12, 1]],
    ['雨', '雨ばかりの夏', 'かさが売れに売れた。出かける人は減って、家でゲーム。', [-22, 34, -12, 14, 0, -2]],
    ['客', '海外からの旅行客がふえた', '観光地がにぎわい、おみやげのお菓子も売れた。', [6, 2, 28, 0, 3, 8]],
    ['冷', '景気が悪くなった', 'みんながお金を使うのをひかえ、旅行やぜいたくが減った。', [-10, -4, -26, -8, -2, 2]],
    ['当', 'ゲームが大ヒット', '新作ゲームが世界中で遊ばれた。', [0, 0, -2, 42, 2, 0]],
    ['燃', '燃料が値上がり', '電気をつくるお金や、ものを運ぶお金がふくらんだ。', [-6, -3, -10, 0, -18, -8]],
    ['健', '健康ブーム', '体にいい食べものが人気。甘いものはひかえめに。', [-9, 0, 4, -4, 0, 15]],
    ['技', '新しい技術', '電気を安くつくれる技術ができた。', [2, 0, 2, 6, 18, 2]],
    ['穏', 'おだやかな 1 年', '大きな出来事はなく、どの会社も少しずつ成長した。', [5, 4, 5, 5, 4, 4]],
    ['病', '病気がはやった', '外出が減って旅行は大打撃。家で遊ぶ人がふえた。', [-6, -2, -35, 28, -2, 6]]
  ];
  const PRE = { ice: [10, 0, 0, 0, 0, 0], pair: [5, 5, 0, 0, 0, 0], even: [2, 2, 2, 1, 2, 1], game: [0, 0, 2, 8, 0, 0] };
  const W = 520, H = 250, PL = 40, PR = 14, PT = 16, PB = 28;

  box.innerHTML = `
    <div class="bs-stage">
      <div class="bs-chartw">
        <p class="bs-total"><span>あなたのポートフォリオ</span><b data-k="total">100</b><small>枚分</small><em data-k="chg"></em></p>
        <svg class="bs-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="ポートフォリオの値打ちの移りかわり"></svg>
        <p class="bs-legend"><i class="is-you"></i>あなた<span class="bs-lg-more" hidden><i class="is-even"></i>6 社に均等 <i class="is-single"></i>1 社だけ（6 通り）</span></p>
      </div>
      <div class="bs-cardw" aria-live="polite">
        <div class="bs-card"><div class="bs-card-in"><div class="bs-back"><span>出来事</span><b>?</b></div><div class="bs-front"><span class="bs-ev-seal" data-k="evs">—</span><p class="bs-ev-y" data-k="evy"></p><p class="bs-ev-t" data-k="evt"></p><p class="bs-ev-d" data-k="evd"></p></div></div></div>
        <p class="bs-year"><b data-k="year">0</b> / ${YEARS} 年</p>
      </div>
    </div>
    <div class="bs-cos">${CO.map(([s, n, c], i) => `<div class="bs-co" data-i="${i}" style="--c:${c}">
        <div class="bs-co-h"><span class="bs-seal">${s}</span><b>${n}</b><em class="bs-delta"></em></div>
        <div class="bs-bar"><i></i></div>
        <p class="bs-co-v"><span data-v>0 枚</span></p>
        <div class="bs-step"><button type="button" data-d="-1" aria-label="${n}を 10 枚へらす">−</button><output>0</output><button type="button" data-d="1" aria-label="${n}を 10 枚ふやす">+</button></div>
      </div>`).join('')}</div>
    <div class="bs-ctl">
      <p class="bs-left">のこりのチップ <b data-k="left">100</b> 枚<small>（10 枚ずつ分けます）</small></p>
      <div class="bs-pre"><span>おためし：</span><button type="button" data-p="ice">ぜんぶアイス屋さん</button><button type="button" data-p="pair">晴れと雨のペア</button><button type="button" data-p="even">6 社に分ける</button><button type="button" data-p="game">ゲームと旅行</button></div>
      <div class="bs-btns"><button type="button" class="bs-go" data-a="go" disabled>10 年すすめる</button><button type="button" data-a="reset">分け方をやり直す</button></div>
    </div>
    <div class="bs-result" hidden></div>
    <div class="bs-learn">
      <p><b>分散投資</b>ひとつの会社だけにお金をあずけると、その会社に悪いことが起きたとき、大きく減ります。いくつもの会社に分けると、ゆれが小さくなります。くわしくは<a href="glossary.html#diversify">分散投資</a>へ。</p>
      <p><b>逆に動くものを組み合わせる</b>晴れればアイス、雨ならかさ。逆に動く会社をいっしょに持つと、どちらの夏が来てもあまり困りません。</p>
      <p><b>リスクとリターン</b>1 社に集中すると、大きく増えることも、大きく減ることもあります。どれくらいのゆれまでがまんできるかを考えて組むのが大切です（<a href="glossary.html#risk-return">リスクとリターン</a>）。</p>
      <p><b>ストックリーグでは</b>麻経が参加している日経ストックリーグでも、テーマを決めて企業を調べ、いくつもの会社を組み合わせたポートフォリオをつくります。<a href="#stockleague">ストックリーグを見る</a></p>
    </div>
    <p class="bs-note">会社・出来事・値動きは、しくみを知るための「たとえ」です。実際の会社や株価ではありません。投資をすすめるものでもありません。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const chart = box.querySelector('.bs-chart'), card = box.querySelector('.bs-card'), result = box.querySelector('.bs-result');
  const tiles = [...box.querySelectorAll('.bs-co')];
  let lastHold = null, alloc = [0, 0, 0, 0, 0, 0], running = false, token = 0, plan = [], series = null;
  const left = () => 10 - alloc.reduce((a, b) => a + b, 0);
  const pct = v => (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v) + '%';

  // 出来事の並びを決める（同じ出来事が 2 年つづかない）。値動きに ±3% の小さなゆらぎ
  const makePlan = () => {
    const p = []; let last = -1;
    for (let y = 0; y < YEARS; y++) { let e; do { e = Math.floor(Math.random() * EV.length); } while (e === last); last = e; p.push([e, EV[e][3].map(v => v + Math.round(Math.random() * 6 - 3))]); }
    return p;
  };
  // 分け方 a（10 枚単位）で、同じ出来事の並びを通したときの、毎年の合計
  const run = a => {
    let h = a.map(n => n * 10); const out = [100];
    plan.forEach(([, r]) => { h = h.map((v, i) => v * (1 + r[i] / 100)); out.push(h.reduce((s, v) => s + v, 0)); });
    return out;
  };

  const drawTiles = (hold, base) => {
    const mx = hold ? Math.max(60, ...hold) : 100;
    tiles.forEach((t, i) => {
      t.querySelector('output').textContent = alloc[i] * 10;
      t.querySelector('[data-v]').textContent = hold ? `${Math.round(hold[i])} 枚分` : `${alloc[i] * 10} 枚`;
      t.querySelector('.bs-bar i').style.width = ((hold ? hold[i] : alloc[i] * 10) / (hold ? mx : 100) * 100).toFixed(1) + '%';
      t.classList.toggle('is-zero', !alloc[i]);
    });
    K('left').textContent = left() * 10;
    box.querySelector('[data-a="go"]').disabled = running || left() !== 0;
    box.querySelector('.bs-ctl').classList.toggle('is-ready', left() === 0);
  };

  const yMap = (lo, hi) => v => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);
  const xMap = y => PL + y / YEARS * (W - PL - PR);
  const drawChart = (upto, showAll) => {
    const all = series ? [series.you, series.even, ...series.single] : [[100]];
    const flat = all.flat();
    let lo = Math.min(80, ...flat), hi = Math.max(130, ...flat);
    const span = hi - lo; lo = Math.max(0, lo - span * .06); hi += span * .06;
    const Y = yMap(lo, hi);
    const tick = Math.pow(10, Math.floor(Math.log10(span))) * (span / Math.pow(10, Math.floor(Math.log10(span))) > 4 ? 1 : .5);
    let s = '';
    for (let v = Math.ceil(lo / tick) * tick; v <= hi; v += tick) s += `<line class="bs-grid${v === 100 ? ' is-base' : ''}" x1="${PL}" x2="${W - PR}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text class="bs-ax" x="${PL - 6}" y="${(Y(v) + 3.5).toFixed(1)}">${Math.round(v)}</text>`;
    for (let y = 0; y <= YEARS; y += 2) s += `<text class="bs-ax is-x" x="${xMap(y).toFixed(1)}" y="${H - 8}">${y} 年</text>`;
    const pts = arr => arr.map((v, y) => `${xMap(y).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
    if (showAll && series) {
      series.single.forEach((sr, i) => { s += `<polyline class="bs-l is-single" style="--c:${CO[i][2]}" points="${pts(sr)}" pathLength="1"/><text class="bs-lt" x="${W - PR + 2}" y="${(Y(sr[YEARS]) + 3).toFixed(1)}" fill="${CO[i][2]}">${CO[i][0]}</text>`; });
      s += `<polyline class="bs-l is-even" points="${pts(series.even)}" pathLength="1"/>`;
    }
    if (series && upto > 0) {
      const u = series.you.slice(0, upto + 1);
      s += `<polyline class="bs-l is-you" points="${pts(u)}"/>`;
      u.forEach((v, y) => { if (y) s += `<circle class="bs-pt${y === upto ? ' is-last' : ''}" cx="${xMap(y).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="${y === upto ? 5 : 3}"/>`; });
    } else s += `<circle class="bs-pt is-last" cx="${xMap(0)}" cy="${Y(100).toFixed(1)}" r="5"/>`;
    chart.innerHTML = s;
  };

  let shown = 100;
  const countTo = to => {
    const from = shown; shown = to;
    if (reduce) { K('total').textContent = Math.round(to); return; }
    const t0 = performance.now();
    const f = now => { const k = Math.max(0, Math.min(1, (now - t0) / 600)), e = 1 - (1 - k) ** 3; K('total').textContent = Math.round(from + (to - from) * e); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };

  const reset = () => {
    token++; running = false; series = null; shown = 100;
    K('total').textContent = '100'; K('chg').textContent = ''; K('chg').className = ''; K('year').textContent = '0';
    card.classList.remove('is-flip'); box.querySelector('.bs-lg-more').hidden = true;
    tiles.forEach(t => { t.classList.remove('is-up', 'is-down'); t.querySelector('.bs-delta').textContent = ''; });
    box.classList.remove('is-running', 'is-done');
    result.hidden = true; result.innerHTML = '';
    drawTiles(); drawChart(0);
  };

  const go = async () => {
    if (running || left()) return;
    const t = ++token; running = true;
    box.classList.add('is-running'); box.classList.remove('is-done'); result.hidden = true;
    plan = makePlan();
    series = { you: run(alloc), even: run([10 / 6, 10 / 6, 10 / 6, 10 / 6, 10 / 6, 10 / 6]), single: CO.map((_, i) => run(CO.map((__, j) => j === i ? 10 : 0))) };
    let hold = alloc.map(n => n * 10);
    drawTiles(hold); drawChart(0);
    for (let y = 0; y < YEARS; y++) {
      const [e, r] = plan[y];
      card.classList.remove('is-flip'); await sleep(260); if (t !== token) return;
      K('evs').textContent = EV[e][0]; K('evy').textContent = `${y + 1} 年目`; K('evt').textContent = EV[e][1]; K('evd').textContent = EV[e][2];
      card.classList.add('is-flip'); K('year').textContent = y + 1;
      await sleep(900); if (t !== token) return;
      tiles.forEach((tl, i) => {
        tl.classList.remove('is-up', 'is-down'); void tl.offsetWidth;
        tl.classList.add(r[i] >= 0 ? 'is-up' : 'is-down');
        tl.querySelector('.bs-delta').textContent = pct(r[i]);
      });
      hold = hold.map((v, i) => v * (1 + r[i] / 100));
      lastHold = hold;
      drawTiles(hold);
      const now = series.you[y + 1], prev = series.you[y], ch = Math.round((now / prev - 1) * 100);
      countTo(now); K('chg').textContent = `この年 ${pct(ch)}`; K('chg').className = ch >= 0 ? 'is-up' : 'is-down';
      drawChart(y + 1);
      await sleep(1100); if (t !== token) return;
    }
    running = false; finish();
  };

  const finish = () => {
    box.classList.remove('is-running'); box.classList.add('is-done');
    box.querySelector('.bs-lg-more').hidden = false;
    drawChart(YEARS, true); drawTiles(lastHold);
    const worst = s => Math.min(...s.slice(1).map((v, y) => (v / s[y] - 1) * 100));
    const you = series.you[YEARS], even = series.even[YEARS], singles = series.single.map(s => s[YEARS]);
    const best = singles.indexOf(Math.max(...singles)), bad = singles.indexOf(Math.min(...singles));
    const wy = Math.round(worst(series.you)), we = Math.round(worst(series.even));
    const share = Math.max(...alloc) * 10, kinds = alloc.filter(Boolean).length;
    const r = n => Math.round(n);
    let head, body;
    if (share >= 70) {
      head = you >= even ? '集中が、当たりました' : '集中が、はずれました';
      body = `${CO[alloc.indexOf(Math.max(...alloc))][1]}に ${share} 枚。10 年後は ${r(you)} 枚分で、6 社に均等に分けた場合（${r(even)} 枚分）より ${you >= even ? r(you - even) + ' 枚分多く' : r(even - you) + ' 枚分少なく'}なりました。いちばん下がった年は ${pct(wy)}。均等なら ${pct(we)} でした。`;
    } else {
      head = kinds >= 4 ? '分けたので、大きくはゆれませんでした' : 'いくつかに分けて、ゆれをおさえました';
      body = `${kinds} 社に分けて、10 年後は ${r(you)} 枚分。いちばん下がった年は ${pct(wy)} でした。1 社だけに集中していたら、いちばん良くて ${CO[best][1]}の ${r(singles[best])} 枚分、いちばん悪いと ${CO[bad][1]}の ${r(singles[bad])} 枚分でした。`;
    }
    const wet = plan.some(([e]) => e < 2), pair = alloc[0] && alloc[1] && wet ? '<p>アイス屋さんとかさメーカーを両方持っていたので、猛暑や長雨の年は、どちらかが支えてくれました。</p>' : '';
    result.innerHTML = `<span class="bs-r-seal" aria-hidden="true">散</span><div><p class="bs-r-h">${head}</p><p>${body}</p>${pair}
      <ul class="bs-r-nums"><li><small>あなた</small><b>${r(you)}</b></li><li><small>6 社に均等</small><b>${r(even)}</b></li><li><small>1 社だけ（いちばん良い）</small><b>${r(singles[best])}</b></li><li><small>1 社だけ（いちばん悪い）</small><b>${r(singles[bad])}</b></li></ul>
      <p class="bs-r-hint">グラフの細い線が、1 社だけに集中した 6 通り。広がりが大きいほど「ゆれ」が大きいということです。出来事は毎回かわります。分け方を変えて、もう一度。</p></div>`;
    result.hidden = false;
    box.querySelector('[data-a="go"]').textContent = 'もう一度（新しい 10 年）';
    try { localStorage.setItem('azakei_bunsan', String((+localStorage.getItem('azakei_bunsan') || 0) + 1)); } catch (e) {}
  };

  box.addEventListener('click', e => {
    const d = e.target.closest('[data-d]');
    if (d && !running) {
      const i = +d.closest('.bs-co').dataset.i, v = +d.dataset.d;
      if (v > 0 && left() > 0) alloc[i]++; else if (v < 0 && alloc[i] > 0) alloc[i]--;
      if (series) reset(); else drawTiles();
      return;
    }
    const p = e.target.closest('[data-p]');
    if (p && !running) { alloc = PRE[p.dataset.p].slice(); reset(); return; }
    const a = e.target.closest('[data-a]');
    if (!a) return;
    if (a.dataset.a === 'go') { if (series && !running) reset(); go(); }
    else if (a.dataset.a === 'reset') { alloc = [0, 0, 0, 0, 0, 0]; box.querySelector('[data-a="go"]').textContent = '10 年すすめる'; reset(); }
  });
  reset();
})();
