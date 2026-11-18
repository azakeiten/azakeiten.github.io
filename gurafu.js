/* ================================================================
   gurafu.js — 経済ラボ：グラフのうそを見破れ（近づいてから読みこむ）
   ・ニュースの見出しとグラフ。「このグラフから何がわかる？」に答える（5 問）
   ・答えると、しかけ（縦軸の切りとり・期間の切りとり・絵の大きさ・割合のわな・平均のわな）があばかれ、
     「正しく描きなおす」で、グラフが本当の形へ動いて変わる
   ・最後に見破った数と称号。数字はすべてたとえ。見た目は gurafu.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-gurafu]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="gurafu.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'gurafu.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const W = 360, H = 230, L = 46, B = 196, T = 24, Rr = 344;   // 図の大きさと余白
  const axisY = (mn, mx, step, f = v => v) => { let s = ''; for (let v = mn; v <= mx + 1e-9; v += step) { const y = B - (v - mn) / (mx - mn) * (B - T); s += `<line class="gu-g" x1="${L}" x2="${Rr}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/><text class="gu-t" x="${L - 6}" y="${(y + 4).toFixed(1)}" text-anchor="end">${f(Math.round(v))}</text>`; } return s; };
  const frame = `<line class="gu-ax" x1="${L}" y1="${T - 6}" x2="${L}" y2="${B}"/><line class="gu-ax" x1="${L}" y1="${B}" x2="${Rr}" y2="${B}"/>`;
  // 24 か月の株価（たとえ）：長く見ると下がり、最後の 3 か月だけ上がる
  const PRICE = [1500, 1470, 1490, 1420, 1380, 1400, 1350, 1300, 1320, 1270, 1240, 1250, 1190, 1150, 1170, 1120, 1080, 1090, 1040, 1000, 980, 1010, 1060, 1120];
  const INC = [300, 300, 300, 300, 300, 300, 300, 300, 300, 5000];
  const C = [
    { head: 'B 社の売上、A 社を大きく引きはなす！', src: 'A 社 98 億円・B 社 102 億円',
      q: 'B 社の売上は、A 社の何倍くらい？', opts: [['3 倍くらい', 0], ['ほとんど同じ（約 1.04 倍）', 1]], seal: '縦', name: '縦軸の切りとり',
      how: '縦軸が 0 からではなく 96 から始まっています。わずか 4 億円の差が、何倍もの差に見えます。', tip: '棒グラフを見たら、まず縦軸がいくつから始まっているかを見よう。',
      svg: t => { const mn = lerp(96, 0, t), mx = lerp(103, 110, t); const y = v => B - (v - mn) / (mx - mn) * (B - T); const st = t < .5 ? 1 : 10, s0 = Math.ceil(mn / st) * st;
        return frame + axisY(s0, mx, mx - mn > 30 ? 20 : 1) + [['A 社', 98, 110], ['B 社', 102, 230]].map(([n, v, x]) => `<rect class="gu-bar${n === 'B 社' ? ' is-hot' : ''}" x="${x}" y="${y(v).toFixed(1)}" width="70" height="${(B - y(v)).toFixed(1)}" rx="4"/><text class="gu-bl" x="${x + 35}" y="${B + 18}" text-anchor="middle">${n}</text><text class="gu-bv" x="${x + 35}" y="${(y(v) - 6).toFixed(1)}" text-anchor="middle">${v}</text>`).join(''); } },
    { head: 'この株、ぐんぐん上昇中！ いまが買いどき？', src: '株価（円）・2 年分のうち',
      q: 'この株は、ずっと上がっている？', opts: [['ずっと上がっている', 0], ['長く見ると、下がってきている', 1]], seal: '期', name: '期間の切りとり',
      how: '見せていたのは、2 年のうち最後の 3 か月だけ。2 年全体では、1,500 円から 1,120 円へ下がっています。', tip: '線グラフは「いつからいつまで」を見よう。長い期間でも見くらべよう。',
      svg: t => { const a = Math.round(lerp(20, 0, t)), d = PRICE.slice(a), mn = 900, mx = 1550; const x = i => L + 8 + i / (d.length - 1) * (Rr - L - 16), y = v => B - (v - mn) / (mx - mn) * (B - T);
        return frame + axisY(900, 1500, 200, v => v.toLocaleString()) + `<polyline class="gu-line" points="${d.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/><circle class="gu-dot" cx="${x(d.length - 1)}" cy="${y(d[d.length - 1])}" r="5"/><text class="gu-bl" x="${L + 8}" y="${B + 18}">${24 - a} か月前</text><text class="gu-bl" x="${Rr}" y="${B + 18}" text-anchor="end">いま</text>`; } },
    { head: '家の売れ行き、去年の 2 倍に！', src: '売れた家の数：去年 50 けん・今年 100 けん',
      q: '右の家の絵は、左の何倍の大きさに見える？ 本当は何倍？', opts: [['絵のとおり 4 倍', 0], ['絵は 4 倍に見えるが、本当は 2 倍', 1]], seal: '絵', name: '絵の大きさのわな',
      how: '数が 2 倍なのに、絵をたても横も 2 倍にすると、面積は 4 倍。数字以上に大きく見えます。', tip: '絵やアイコンのグラフは、数字の倍率と、絵の面積の倍率がそろっているか見よう。',
      svg: t => { const k = lerp(2, Math.SQRT2, t), house = (x, s) => `<g transform="translate(${x} ${B}) scale(${s})"><path class="gu-house" d="M-24 0 V-30 L0 -52 L24 -30 V0 Z"/><rect class="gu-door" x="-6" y="-16" width="12" height="16"/></g>`;
        return `<line class="gu-ax" x1="20" y1="${B}" x2="${Rr}" y2="${B}"/>` + house(100, 1.2) + house(250, 1.2 * k) + `<text class="gu-bl" x="100" y="${B + 18}" text-anchor="middle">去年 50</text><text class="gu-bl" x="250" y="${B + 18}" text-anchor="middle">今年 100</text><text class="gu-bv" x="250" y="${T + 4}" text-anchor="middle">面積 ${(k * k).toFixed(1)} 倍</text>`; } },
    { head: '公園での転倒事故、2 倍に急増！ 危険な公園', src: '1 万人あたりの事故：去年 1 件・今年 2 件',
      q: 'このニュース、どう受けとめる？', opts: [['すぐに公園を閉めるべきだ', 0], ['もとの数が小さい。1 件ふえただけかも', 1]], seal: '割', name: '割合のわな',
      how: '「2 倍」はうそではありません。でも、1 万人のうち 1 件が 2 件になっただけ。もとの数が小さいと、少しの変化でも大きな「倍」になります。', tip: '「〇倍」「〇% 増」を見たら、もとの数（いくつからいくつか）をさがそう。',
      svg: t => { const mx = lerp(2.2, 100, t); const y = v => B - v / mx * (B - T); const step = mx > 30 ? 20 : 1;
        return frame + axisY(0, mx, step, v => v + ' 件') + [['去年', 1, 110], ['今年', 2, 230]].map(([n, v, x]) => `<rect class="gu-bar${n === '今年' ? ' is-hot' : ''}" x="${x}" y="${y(v).toFixed(1)}" width="70" height="${Math.max(1, B - y(v)).toFixed(1)}" rx="3"/><text class="gu-bl" x="${x + 35}" y="${B + 18}" text-anchor="middle">${n}</text><text class="gu-bv" x="${x + 35}" y="${(y(v) - 6).toFixed(1)}" text-anchor="middle">${v} 件</text>`).join('') + (t > .6 ? `<text class="gu-bl" x="${Rr}" y="${T + 6}" text-anchor="end" opacity="${(t - .6) * 2.5}">1 万人のうち</text>` : ''); } },
    { head: 'この町の平均年収は 770 万円！ お金持ちの町', src: '10 人の町の年収（万円）',
      q: 'この町の多くの人の年収は？', opts: [['770 万円くらい', 0], ['300 万円くらい', 1]], seal: '均', name: '平均のわな',
      how: '10 人のうち 9 人は 300 万円。1 人だけ 5,000 万円の人がいて、平均を大きく引き上げています。まん中の人の値（中央値）は 300 万円です。', tip: '平均だけでなく、まん中の値（中央値）や、ばらつきも見よう。',
      svg: t => { const mx = 5200, x = v => L + 8 + v / mx * (Rr - L - 20), avg = 770;
        let s = `<line class="gu-ax" x1="${L}" y1="${B}" x2="${Rr}" y2="${B}"/>` + [0, 1000, 2000, 3000, 4000, 5000].map(v => `<text class="gu-t" x="${x(v)}" y="${B + 16}" text-anchor="middle">${v.toLocaleString()}</text>`).join('');
        s += `<rect class="gu-bar is-hot" x="${L + 8}" y="${lerp(90, 40, t)}" width="${(x(avg) - L - 8).toFixed(1)}" height="${lerp(60, 26, t)}" rx="4" opacity="${lerp(1, .55, t)}"/><text class="gu-bv" x="${x(avg) + 6}" y="${lerp(126, 58, t)}">平均 770</text>`;
        if (t > 0) { INC.forEach((v, i) => { const yy = B - 18 - (v === 300 ? i * 9 : 0); s += `<circle class="gu-pp" cx="${x(v)}" cy="${yy}" r="${6 * t}"/>`; }); s += `<line class="gu-med" x1="${x(300)}" x2="${x(300)}" y1="${T + 60}" y2="${B}" opacity="${t}"/><text class="gu-bv is-med" x="${x(300) + 6}" y="${T + 74}" opacity="${t}">中央値 300</text>`; }
        return s; } }
  ];
  let i = 0, ok = 0, busy = false, anim = 0;
  box.innerHTML = `
    <div class="gu-news">
      <p class="gu-bar-top"><span class="gu-live" aria-hidden="true">速報</span><span data-k="n">1</span> / ${C.length}<b class="gu-chan">麻経ニュース</b></p>
      <h3 class="gu-head" data-k="head"></h3>
      <figure class="gu-fig"><svg viewBox="0 0 ${W} ${H}" role="img" data-k="svg"></svg><figcaption data-k="src"></figcaption></figure>
      <p class="gu-q" data-k="q"></p>
      <div class="gu-opts" data-k="opts" role="group" aria-label="こたえ"></div>
      <div class="gu-reveal" data-k="rev" hidden></div>
    </div>
    <div class="gu-side">
      <p class="gu-h">見破ったしかけ <small><b data-k="ok">0</b> / ${C.length}</small></p>
      <ol class="gu-book">${C.map(c => `<li><span aria-hidden="true">${c.seal}</span><b>？？？</b></li>`).join('')}</ol>
      <div class="gu-res" hidden></div>
    </div>
    <div class="gu-learn">
      <p><b>グラフは、うそをつかずにだませる</b>数字は正しくても、軸・期間・絵の大きさ・見せ方しだいで、受けとる印象は大きく変わります。</p>
      <p><b>ニュースを読む力</b>経済のニュースはグラフだらけ。「どこから？ いつから？ もとの数は？ 平均だけ？」と自分に聞くくせをつけよう。自分でグラフを描くときも、同じ点に気をつけよう。</p>
    </div>
    <p class="gu-note">見出し・会社・数字は、しくみを知るための「たとえ」です。</p>`;
  const K = k => box.querySelector(`[data-k="${k}"]`);
  const draw = t => { K('svg').innerHTML = C[i].svg(t); };
  const morph = () => {
    cancelAnimationFrame(anim); const t0 = performance.now(), dur = reduce ? 1 : 1400;
    const step = now => { const p = Math.min(1, (now - t0) / dur), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; draw(e); if (p < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
    box.querySelector('.gu-fig').classList.add('is-true');
  };
  const show = () => {
    const c = C[i]; busy = false;
    K('n').textContent = i + 1; K('head').textContent = c.head; K('src').textContent = c.src; K('q').textContent = c.q;
    K('opts').innerHTML = c.opts.map(([t], j) => `<button type="button" data-o="${j}">${t}</button>`).join('');
    K('rev').hidden = true; box.querySelector('.gu-fig').classList.remove('is-true');
    const h = K('head'); h.classList.remove('is-in'); void h.offsetWidth; h.classList.add('is-in');
    draw(0);
  };
  const answer = j => {
    if (busy) return; busy = true;
    const c = C[i], good = !!c.opts[j][1]; if (good) ok++;
    box.querySelectorAll('[data-o]').forEach((b, k) => { b.disabled = true; b.classList.toggle('is-right', !!c.opts[k][1]); b.classList.toggle('is-wrong', k === j && !good); });
    const li = box.querySelectorAll('.gu-book li')[i]; li.classList.add('is-got'); li.classList.toggle('is-miss', !good); li.querySelector('b').textContent = c.name;
    K('ok').textContent = ok;
    K('rev').innerHTML = `<p class="gu-r-h"><span aria-hidden="true">${c.seal}</span>${good ? '見破った！' : 'だまされた…'}<small>しかけ：${c.name}</small></p><p>${c.how}</p><p class="gu-tip"><b>見破るコツ</b>${c.tip}</p><div class="gu-r-btns"><button type="button" class="gu-fix" data-a="fix">正しく描きなおす</button><button type="button" class="gu-next" data-a="next">${i < C.length - 1 ? '次のニュースへ' : '結果を見る'}</button></div>`;
    K('rev').hidden = false;
  };
  const finish = () => {
    const t = ok >= 5 ? ['眼', 'グラフの名探偵'] : ok >= 3 ? ['鋭', 'するどい読者'] : ['初', 'これから見破れる'];
    const res = box.querySelector('.gu-res');
    res.innerHTML = `<span class="gu-r-seal" aria-hidden="true">${t[0]}</span><p class="gu-r-t">${t[1]}</p><p class="gu-r-s">見破った数 <b>${ok}</b> / ${C.length}</p><button type="button" class="gu-again" data-a="again">もう一度</button>`;
    res.hidden = false;
    K('head').textContent = '本日のニュースは、ここまで。'; K('q').textContent = '右の一覧で、5 つのしかけをふり返ろう。'; K('opts').innerHTML = ''; K('rev').hidden = true; K('src').textContent = ''; K('svg').innerHTML = '';
    try { const b = +localStorage.getItem('azakei_gurafu') || 0; localStorage.setItem('azakei_gurafu', String(Math.max(b, ok))); } catch (e) {}
  };
  box.addEventListener('click', e => {
    const o = e.target.closest('[data-o]'); if (o) { answer(+o.dataset.o); return; }
    if (e.target.closest('[data-a="fix"]')) { morph(); e.target.closest('[data-a="fix"]').disabled = true; return; }
    if (e.target.closest('[data-a="next"]')) { cancelAnimationFrame(anim); i++; if (i < C.length) show(); else finish(); return; }
    if (e.target.closest('[data-a="again"]')) { i = 0; ok = 0; K('ok').textContent = 0; box.querySelector('.gu-res').hidden = true; box.querySelectorAll('.gu-book li').forEach(li => { li.className = ''; li.querySelector('b').textContent = '？？？'; }); show(); }
  });
  show();
})();
