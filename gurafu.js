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
  let C = [
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
  // 上級編：もっと見えにくいグラフのしかけ（数字はたとえ）
  const AD6 = [2, 4, 6, 8, 9, 10], SA6 = [98, 98.8, 99.6, 100.6, 101.2, 102];
  const DAYS = Array.from({ length: 12 }, (_, k) => { const tp = 15 + k * 1.8, r1 = Math.sin(k * 2.3) * 18, r2 = Math.cos(k * 1.7) * .9; return { tp, ice: Math.round(tp * 10 + r1), acc: Math.max(0, +((tp - 14) * .35 + r2).toFixed(1)) }; });
  const NEW6 = [120, 100, 80, 60, 45, 30], CUM6 = NEW6.map((v, k) => NEW6.slice(0, k + 1).reduce((a, b) => a + b, 0));
  const SUBJ = [['数学', 55, '#d23a2a'], ['英語', 40, '#2f6fb0'], ['国語', 25, '#2f8a4a'], ['理科', 20, '#c9922e']];
  const ADV = [
    { head: '広告費をふやしたら、売上がぐんぐん上昇！', src: '広告費（右の軸・億円）と売上（左の軸・億円）、半年分',
      q: '広告費を 5 倍（2 → 10 億円）にしたら、売上は？', opts: [['広告費と同じくらい、大きく伸びた', 0], ['4% ほど（98 → 102 億円）しか伸びていない', 1]], seal: '二', name: '2 本の縦軸',
      how: '左と右で、目もりのちがう縦軸を使っています。左の軸を 97〜102 億円にしぼると、2 本の線がぴったり重なり、広告がとても効いたように見えます。', tip: '縦軸が 2 本あるグラフは、それぞれの目もりの幅を見くらべよう。',
      svg: t => { const R2 = 312, mn = lerp(97, 0, t), mx = lerp(102.5, 110, t), x = k => L + 14 + k / 5 * (R2 - L - 28), yl = v => B - (v - mn) / (mx - mn) * (B - T), yr = v => B - v / 11 * (B - T);
        let s = `<line class="gu-ax" x1="${L}" y1="${T - 6}" x2="${L}" y2="${B}"/><line class="gu-ax" x1="${L}" y1="${B}" x2="${R2}" y2="${B}"/><line class="gu-ax" x1="${R2}" y1="${T - 6}" x2="${R2}" y2="${B}"/>`;
        const rg = mx - mn, st = rg > 60 ? 20 : rg > 25 ? 10 : rg > 10 ? 5 : 1; for (let v = Math.ceil(mn / st) * st; v <= mx; v += st) s += `<text class="gu-t" x="${L - 6}" y="${(yl(v) + 4).toFixed(1)}" text-anchor="end">${v}</text>`;
        [0, 5, 10].forEach(v => { s += `<text class="gu-t is-r" x="${R2 + 5}" y="${yr(v) + 4}">${v}</text>`; });
        s += `<polyline class="gu-line is-blue" points="${AD6.map((v, k) => `${x(k)},${yr(v).toFixed(1)}`).join(' ')}"/><polyline class="gu-line" points="${SA6.map((v, k) => `${x(k)},${yl(v).toFixed(1)}`).join(' ')}"/>`;
        s += `<text class="gu-bl" x="${L + 4}" y="${T - 10}">売上</text><text class="gu-bl is-blue" x="${R2}" y="${T - 10}" text-anchor="end">広告費</text>`;
        return s; } },
    { head: 'アイスが売れる日ほど、水の事故が多い！ アイスは危険？', src: '12 日分。横はアイスの売上（個）、縦は水の事故（件）',
      q: 'アイスを売るのをやめれば、水の事故はへる？', opts: [['へる。アイスが事故の原因だ', 0], ['へらない。暑い日は両方ふえる（気温という別の原因）', 1]], seal: '因', name: '相関と因果',
      how: '2 つがいっしょにふえる（相関がある）ことと、片方がもう片方の原因（因果）であることは別です。暑い日は、アイスを買う人も、海や川へ行く人もふえます。かくれた原因は「気温」です。', tip: '「A がふえると B もふえる」を見たら、両方を動かす別の原因がないか考えよう。',
      svg: t => { const x = v => L + 8 + (v - 140) / 230 * (Rr - L - 20), y = v => B - v / 8 * (B - T);
        let s = frame + [0, 2, 4, 6, 8].map(v => `<text class="gu-t" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join('') + [150, 250, 350].map(v => `<text class="gu-t" x="${x(v)}" y="${B + 14}" text-anchor="middle">${v}</text>`).join('');
        DAYS.forEach(d => { const h = lerp(210, 220 - (d.tp - 15) / 20 * 220, t); s += `<circle cx="${x(d.ice).toFixed(1)}" cy="${y(d.acc).toFixed(1)}" r="${lerp(5, 7, t)}" fill="hsl(${h} ${lerp(15, 75, t)}% 50%)" stroke="#fff" stroke-width="1.5"/>`; });
        s += `<line x1="${x(150)}" y1="${y(.4)}" x2="${x(350)}" y2="${y(7.2)}" class="gu-trend" opacity="${1 - t * .6}"/>`;
        if (t > .3) s += `<g opacity="${(t - .3) / .7}"><text class="gu-bl is-blue" x="${x(160)}" y="${y(6.4)}">すずしい日</text><text class="gu-bl" x="${x(300)}" y="${y(1.2)}">暑い日</text><text class="gu-bv" x="${L + 10}" y="${T + 4}">色＝その日の気温</text></g>`;
        return s; } },
    { head: '会員数、ずっと右肩上がり！ 大人気のアプリ', src: 'アプリの会員（人）、6 か月分',
      q: '新しく会員になる人は、ふえ続けている？', opts: [['ふえ続けている', 0], ['毎月の新しい会員は、へってきている', 1]], seal: '累', name: '累積のグラフ',
      how: '「これまでの合計（累積）」のグラフは、1 人でもふえれば必ず右肩上がりになります。毎月の数にすると、120 人 → 30 人と、新しい会員はへり続けています。', tip: '「合計」「累計」のグラフを見たら、毎月の数ではどうなるかを考えよう。',
      svg: t => { const mx = lerp(460, 140, t), x = k => L + 30 + k * 48, y = v => B - v / mx * (B - T), vals = CUM6.map((c, k) => lerp(c, NEW6[k], t));
        let s = frame + axisY(0, mx, mx > 200 ? 100 : 20);
        vals.forEach((v, k) => { s += `<rect class="gu-bar${t > .5 ? ' is-hot' : ''}" x="${x(k) - 14}" y="${y(v).toFixed(1)}" width="28" height="${(B - y(v)).toFixed(1)}" rx="3" opacity="${lerp(.35, 1, t)}"/><text class="gu-t" x="${x(k)}" y="${B + 14}" text-anchor="middle">${k + 1} 月</text>`; });
        s += `<polyline class="gu-line" points="${vals.map((v, k) => `${x(k)},${y(v).toFixed(1)}`).join(' ')}" opacity="${1 - t * .5}"/>`;
        s += `<text class="gu-bv" x="${Rr}" y="${T + 4}" text-anchor="end">${t < .5 ? 'これまでの合計' : '毎月ふえた人数'}</text>`;
        return s; } },
    { head: '好きな教科アンケート、数学がトップ！', src: '「好きな教科は？」（いくつ選んでもよい）',
      q: 'この円グラフの数字を、ぜんぶ足すと何 %？', opts: [['100%', 0], ['140%（いくつも選べるので、円グラフにはできない）', 1]], seal: '円', name: '複数回答の円グラフ',
      how: '円グラフは「全体を 100% で分ける」ときだけ使えます。いくつも選べるアンケートでは、合計が 100% をこえるので、円グラフにすると割合の大きさがくるいます。棒グラフで、それぞれの % を見るのが正しい形です。', tip: '円グラフを見たら、数字を足して 100% になるか確かめよう。',
      svg: t => { const sum = SUBJ.reduce((a, s) => a + s[1], 0), cx = 130, cy = 120, r = 82; let a0 = -Math.PI / 2, s = `<g opacity="${1 - t}">`;
        SUBJ.forEach(([n, v, c]) => { const a1 = a0 + v / sum * Math.PI * 2, big = a1 - a0 > Math.PI ? 1 : 0, mid = (a0 + a1) / 2; s += `<path d="M${cx} ${cy} L${(cx + r * Math.cos(a0)).toFixed(1)} ${(cy + r * Math.sin(a0)).toFixed(1)} A${r} ${r} 0 ${big} 1 ${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)} Z" fill="${c}" stroke="#fff" stroke-width="2"/><text class="gu-pl" x="${(cx + r * .62 * Math.cos(mid)).toFixed(1)}" y="${(cy + r * .62 * Math.sin(mid) + 4).toFixed(1)}">${n} ${v}%</text>`; a0 = a1; });
        s += `</g><g opacity="${t}">`;
        SUBJ.forEach(([n, v, c], k) => { const y = 40 + k * 42; s += `<text class="gu-bl" x="56" y="${y + 16}" text-anchor="end">${n}</text><rect x="64" y="${y}" width="${(v / 100 * 250 * t).toFixed(1)}" height="24" rx="4" fill="${c}"/><rect x="64" y="${y}" width="250" height="24" rx="4" fill="none" stroke="rgba(31,35,41,.2)"/><text class="gu-bv" x="${(70 + v / 100 * 250 * t).toFixed(1)}" y="${y + 17}">${v}%</text>`; });
        s += `<text class="gu-t" x="314" y="${B + 6}" text-anchor="end">それぞれ 100% のうち</text></g>`;
        return s; } }
  ];
  const BASIC = C;
  let mode = 'basic';
  let i = 0, ok = 0, busy = false, anim = 0;
  box.innerHTML = `
    <div class="gu-news">
      <p class="gu-bar-top"><span class="gu-live" aria-hidden="true">速報</span><span data-k="n">1</span> / <span data-k="tot">${C.length}</span><b class="gu-chan">麻経ニュース</b></p>
      <h3 class="gu-head" data-k="head"></h3>
      <figure class="gu-fig"><svg viewBox="0 0 ${W} ${H}" role="img" data-k="svg"></svg><figcaption data-k="src"></figcaption></figure>
      <p class="gu-q" data-k="q"></p>
      <div class="gu-opts" data-k="opts" role="group" aria-label="こたえ"></div>
      <div class="gu-reveal" data-k="rev" hidden></div>
    </div>
    <div class="gu-side">
      <div class="gu-mode" role="radiogroup" aria-label="レベル"><button type="button" role="radio" data-mode="basic" aria-checked="true"><b>ふつう編</b><small>5 つのしかけ</small></button><button type="button" role="radio" data-mode="adv" aria-checked="false"><b>上級編</b><small>2 本の軸・相関と因果 など 4 つ</small></button></div>
      <p class="gu-h">見破ったしかけ <small><b data-k="ok">0</b> / <span data-k="tot2">${C.length}</span></small></p>
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
    const rt = ok / C.length, adv = mode === 'adv';
    const t = rt >= 1 ? ['眼', adv ? 'データの大名探偵' : 'グラフの名探偵'] : rt >= .6 ? ['鋭', 'するどい読者'] : ['初', 'これから見破れる'];
    const res = box.querySelector('.gu-res');
    res.innerHTML = `<span class="gu-r-seal" aria-hidden="true">${t[0]}</span><p class="gu-r-t">${t[1]}</p><p class="gu-r-s">見破った数 <b>${ok}</b> / ${C.length}</p><button type="button" class="gu-again" data-a="again">もう一度</button>`;
    res.hidden = false;
    K('head').textContent = '本日のニュースは、ここまで。'; K('q').textContent = `右の一覧で、${C.length} つのしかけをふり返ろう。${!adv && rt >= .6 ? ' つぎは「上級編」へ。' : ''}`; K('opts').innerHTML = ''; K('rev').hidden = true; K('src').textContent = ''; K('svg').innerHTML = '';
    try { const key = adv ? 'azakei_gurafu_adv' : 'azakei_gurafu', b = +localStorage.getItem(key) || 0; localStorage.setItem(key, String(Math.max(b, ok))); } catch (e) {}
  };
  box.addEventListener('click', e => {
    const o = e.target.closest('[data-o]'); if (o) { answer(+o.dataset.o); return; }
    if (e.target.closest('[data-a="fix"]')) { morph(); e.target.closest('[data-a="fix"]').disabled = true; return; }
    if (e.target.closest('[data-a="next"]')) { cancelAnimationFrame(anim); i++; if (i < C.length) show(); else finish(); return; }
    const md = e.target.closest('[data-mode]'); if (md) { setMode(md.dataset.mode); return; }
    if (e.target.closest('[data-a="again"]')) setMode(mode);
  });
  // ふつう編 ⇄ 上級編
  const setMode = m => {
    cancelAnimationFrame(anim); mode = m; C = m === 'adv' ? ADV : BASIC; i = 0; ok = 0;
    box.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-checked', b.dataset.mode === m));
    box.querySelector('.gu-book').innerHTML = C.map(c => `<li><span aria-hidden="true">${c.seal}</span><b>？？？</b></li>`).join('');
    K('ok').textContent = 0; K('tot').textContent = C.length; K('tot2').textContent = C.length; box.querySelector('.gu-res').hidden = true;
    box.classList.toggle('is-adv', m === 'adv');
    show();
  };
  show();
})();

/* ================================================================
   v364：「見出しチェック 40 秒」— グラフと見出しを見て、正しい？ 言いすぎ？
   ・毎回、数字から新しいグラフをつくる（棒・折れ線・帯）。数字はすべてたとえ
   ・見出しがグラフの数字と合っていれば「正しい」、合っていなければ「言いすぎ」
   ・縦軸を切りとったグラフも出る。見た目ではなく、目もりの数字で判断する
   ・正解で次へ。続けて正解すると倍率アップ。まちがえると 3 秒へる
   ・自己ベストは azakei_gurafu_best
   ================================================================ */
(function () {
  const box = document.querySelector('[data-gurafu]');
  if (!box || document.querySelector('.gq')) return;
  if (!document.querySelector('link[href^="gugame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'gugame.css?v=20261127c'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_gurafu_best', TIME = 40;
  const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const g = document.createElement('div');
  g.className = 'gq';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="gq-sub"><span aria-hidden="true">験</span>じっくりためす：5 つのしかけを、ひとつずつあばく</p>');
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.random() * a.length | 0];
  const coin = () => Math.random() < .5;
  const W = 300, H = 170, L = 40, Rr = 290, T = 14, B = 146;
  const COMP = ['A 社', 'B 社'], THING = [['売上', '億円'], ['来場者', '万人'], ['会員', '万人'], ['生産量', '万トン']];
  /* 棒グラフ：vals、縦軸 mn〜mx（mn が 0 でないと「切りとり」） */
  const bars = (labels, vals, mn, mx, step, unit) => {
    const y = v => B - (v - mn) / (mx - mn) * (B - T), n = vals.length, bw = Math.min(52, (Rr - L) / n * .55);
    let s = '';
    for (let v = mn; v <= mx + 1e-9; v += step) s += `<line class="gq-gr" x1="${L}" x2="${Rr}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="gq-tk" x="${L - 5}" y="${(y(v) + 4).toFixed(1)}">${v}</text>`;
    vals.forEach((v, i) => { const cx = L + (Rr - L) * (i + .5) / n; s += `<rect class="gq-bar${i === n - 1 ? ' is-last' : ''}" x="${(cx - bw / 2).toFixed(1)}" y="${y(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(B - y(v)).toFixed(1)}" rx="3"/><text class="gq-lb" x="${cx.toFixed(1)}" y="${B + 15}">${labels[i]}</text>`; });
    if (mn > 0) s += `<path class="gq-cut" d="M${L - 7} ${B - 8} l14 -4 M${L - 7} ${B - 3} l14 -4"/>`;
    return `<text class="gq-unit" x="${L - 5}" y="${T - 4}">${unit}</text>${s}<line class="gq-ax" x1="${L}" y1="${T - 4}" x2="${L}" y2="${B}"/><line class="gq-ax" x1="${L}" y1="${B}" x2="${Rr}" y2="${B}"/>`;
  };
  const line = (labels, vals, mn, mx, step, unit) => {
    const y = v => B - (v - mn) / (mx - mn) * (B - T), n = vals.length, x = i => L + 14 + (Rr - L - 28) * i / (n - 1);
    let s = '';
    for (let v = mn; v <= mx + 1e-9; v += step) s += `<line class="gq-gr" x1="${L}" x2="${Rr}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="gq-tk" x="${L - 5}" y="${(y(v) + 4).toFixed(1)}">${v}</text>`;
    s += `<polyline class="gq-ln" points="${vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>`;
    vals.forEach((v, i) => { s += `<circle class="gq-pt" cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.5"/><text class="gq-lb" x="${x(i).toFixed(1)}" y="${B + 15}">${labels[i]}</text>`; });
    return `<text class="gq-unit" x="${L - 5}" y="${T - 4}">${unit}</text>${s}<line class="gq-ax" x1="${L}" y1="${T - 4}" x2="${L}" y2="${B}"/><line class="gq-ax" x1="${L}" y1="${B}" x2="${Rr}" y2="${B}"/>`;
  };
  const band = (parts) => {   // 100% の帯：[名前, ％]
    let x = L, s = '';
    const cls = ['is-a', 'is-b', 'is-c'];
    parts.forEach(([n, p], i) => { const w = (Rr - L) * p / 100; s += `<rect class="gq-band ${cls[i]}" x="${x.toFixed(1)}" y="52" width="${w.toFixed(1)}" height="44"/><text class="gq-bt" x="${(x + w / 2).toFixed(1)}" y="79">${p}%</text><text class="gq-lb" x="${(x + w / 2).toFixed(1)}" y="${i % 2 ? 116 : 44}">${n}</text>`; x += w; });
    return s;
  };
  const yrs = n => { const y0 = R(2018, 2020); return Array.from({ length: n }, (_, i) => `${y0 + i}`); };
  const nice = (lo, hi) => { const span = hi - lo, st = span > 60 ? 20 : span > 30 ? 10 : span > 12 ? 5 : 2; return [Math.floor(lo / st) * st, Math.ceil(hi / st) * st, st]; };
  /* 問題のつくり方：[グラフの SVG, 見出し, 正しい？, なぜ] */
  const GEN = [
    // 2 社をくらべる棒（縦軸を切りとることが多い）
    () => {
      const [th, u] = pick(THING), a = R(40, 90), d = R(2, 6), b = a + d, cut = Math.random() < .7;
      const [lo, hi, st] = cut ? nice(a - 6, b + 1) : nice(0, b + 4);
      const svg = bars(COMP, [a, b], cut ? lo : 0, hi, st, u);
      const r = b / a, truth = coin();
      const head = truth ? `B 社の${th}、A 社とほぼ同じ` : `B 社の${th}、A 社の ${pick([2, 3])} 倍に！`;
      return [svg, head, truth, `${a} と ${b} ${u}。B 社は A 社の約 ${r.toFixed(2)} 倍で、ほとんど同じです。${cut ? '縦軸が 0 からではないので、差が大きく見えます。' : ''}`];
    },
    // 何年も続けて増えた？
    () => {
      const [th, u] = pick(THING.slice(1)), n = 5, v = [R(20, 40)];
      const up = coin();
      for (let i = 1; i < n; i++) v.push(v[i - 1] + R(1, 6));
      if (!up) { const k = R(1, n - 2); v[k] = v[k - 1] - R(1, 4); }
      const [lo, hi, st] = nice(Math.min(...v) - 4, Math.max(...v) + 2);
      const lb = yrs(n);
      const head = `${th}、${n - 1} 年連続で増加`;
      const down = v.findIndex((x, i) => i && x < v[i - 1]);
      return [line(lb, v, lo, hi, st, u), head, up, up ? `毎年、前の年より増えています（${v.join('→')}）。` : `${lb[down]} 年は ${v[down - 1]} から ${v[down]} に減っています。「連続」ではありません。`];
    },
    // 過去最高？
    () => {
      const n = 6, v = Array.from({ length: n }, () => R(30, 70)), best = coin();
      const mx = Math.max(...v.slice(0, n - 1));
      v[n - 1] = best ? mx + R(1, 5) : mx - R(2, 8);
      const [lo, hi, st] = nice(0, Math.max(...v) + 5);
      const lb = yrs(n);
      const head = `${lb[n - 1]} 年の来場者、過去最高に`;
      return [bars(lb, v, 0, hi, st, '万人'), head, best, best ? `${lb[n - 1]} 年の ${v[n - 1]} 万人は、6 年でいちばん多い数です。` : `いちばん多いのは ${mx} 万人の年。${lb[n - 1]} 年（${v[n - 1]} 万人）は最高ではありません。`];
    },
    // 何％増えた？
    () => {
      const a = R(5, 16) * 10, pct = pick([10, 20, 50]), b = a * (100 + pct) / 100, truth = coin();
      const claim = truth ? pct : pct * 2;
      const [, hi, st] = nice(0, b + 10);
      return [bars(['去年', 'ことし'], [a, b], 0, hi, st, '個'), `売れた数、去年より ${claim}% 増えた`, truth, `${a} 個から ${b} 個。ふえたのは ${b - a} 個で、${b - a} ÷ ${a} ＝ ${pct}% です。`];
    },
    // 半分以上？（帯グラフ）
    () => {
      const p = R(38, 62), q = R(10, Math.min(30, 100 - p - 8)), r = 100 - p - q, kind = R(0, 2);
      let head, truth, why;
      if (kind === 0) { head = '賛成が半分をこえた'; truth = p > 50; why = `賛成は ${p}%。半分（50%）を${p > 50 ? 'こえています' : 'こえていません'}。`; }
      else if (kind === 1) { head = '賛成は、反対の 2 倍以上'; truth = p >= q * 2; why = `賛成 ${p}% と反対 ${q}%。${p} は ${q} の約 ${(p / q).toFixed(1)} 倍です。`; }
      else { head = '「わからない」は 3 人に 1 人以上'; truth = r >= 100 / 3; why = `「わからない」は ${r}%。3 人に 1 人は約 33% です。`; }
      if (p === 50 && kind === 0) truth = false;
      return [band([['賛成', p], ['反対', q], ['わからない', r]]), head, truth, why];
    },
    // 折れ線の縦軸切りとり：大きくはね上がって見える
    () => {
      const n = 6, base = R(100, 140), v = [base];
      for (let i = 1; i < n; i++) v.push(v[i - 1] + R(0, 2));
      v[n - 1] = v[n - 2] + R(2, 4);
      const cut = Math.random() < .75, [lo, hi, st] = cut ? nice(Math.min(...v) - 1, Math.max(...v) + 1) : [0, Math.ceil((Math.max(...v) + 20) / 50) * 50, 50];
      const pct = ((v[n - 1] - v[0]) / v[0] * 100), truth = coin();
      const head = truth ? `値段、5 年で少しだけ上がる（約 ${Math.round(pct)}%）` : '値段が急上昇、5 年で約 2 倍に';
      return [line(yrs(n), v, lo, hi, st, '円'), head, truth, `${v[0]} 円から ${v[n - 1]} 円。上がったのは約 ${pct.toFixed(0)}% です。${cut ? '縦軸を切りとると、少しの上がり方が急に見えます。' : ''}`];
    }
  ];
  const make = (last) => { let k; do { k = R(0, GEN.length - 1); } while (k === last && GEN.length > 1); return [k, GEN[k]()]; };
  let st = null, tick = 0;
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="gq-intro">
      <div class="gq-paper" aria-hidden="true"><b>速報</b><i></i><i></i><svg viewBox="0 0 60 34"><path d="M4 30 L18 22 L30 25 L44 10 L56 6"/></svg></div>
      <div><p class="gq-kicker">スピード勝負</p><h3 class="gq-h">見出しチェック 40 秒</h3>
      <p class="gq-p">新聞のデスクになって、記者が書いた見出しをチェックします。グラフの数字と合っていれば<b>「正しい」</b>、合っていなければ<b>「言いすぎ」</b>。縦軸を切りとったグラフも出るので、見た目ではなく<b>目もりの数字</b>で判断しよう。続けて当てると点が上がり、まちがえると 3 秒へります。グラフの数字は、すべてたとえです。</p>
      <p class="gq-best">${b ? `自己ベスト <b>${b}</b> 点` : 'はじめてのデスク'}</p>
      <button type="button" class="gq-go" data-gq="start">チェックを始める</button></div></div>`;
  };
  const start = () => {
    st = { score: 0, streak: 0, ok: 0, miss: [], end: performance.now() + TIME * 1000, lock: false, k: -1 };
    g.innerHTML = `<div class="gq-play">
      <div class="gq-top"><span class="gq-t"><b data-gq="t">${TIME}</b> 秒</span><span class="gq-st" data-gq="st"></span><span class="gq-sc">得点 <b data-gq="sc">0</b></span></div>
      <div class="gq-time" aria-hidden="true"><i data-gq="bar"></i></div>
      <div class="gq-desk" data-gq="desk"></div>
      <div class="gq-keys"><button type="button" data-v="1"><b>正しい</b><small>数字と合っている</small></button><button type="button" data-v="0"><b>言いすぎ</b><small>数字と合わない</small></button></div>
      <p class="gq-fb" data-gq="fb" aria-live="polite"></p></div>`;
    show();
    clearInterval(tick);
    tick = setInterval(() => {
      if (!st) return;
      const left = Math.max(0, (st.end - performance.now()) / 1000);
      g.querySelector('[data-gq="t"]').textContent = Math.ceil(left);
      const bar = g.querySelector('[data-gq="bar"]'); bar.style.transform = `scaleX(${(left / TIME).toFixed(3)})`; bar.classList.toggle('is-low', left < 10);
      if (left <= 0) finish();
    }, 100);
  };
  const show = () => {
    const [k, q] = make(st.k); st.k = k; st.q = q;
    const d = g.querySelector('[data-gq="desk"]');
    d.innerHTML = `<p class="gq-head"><span aria-hidden="true">見出し</span>${q[1]}</p><svg class="gq-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="見出しのもとになったグラフ">${q[0]}</svg>`;
    d.classList.remove('is-in', 'is-ok', 'is-ng'); void d.offsetWidth; d.classList.add('is-in');
  };
  const mult = () => 1 + Math.min(st.streak, 8) * 0.25;
  const answer = v => {
    if (!st || st.lock) return;
    const q = st.q, ok = v === q[2], d = g.querySelector('[data-gq="desk"]'), fb = g.querySelector('[data-gq="fb"]');
    if (ok) { st.streak++; st.ok++; const pts = Math.round(10 * mult()); st.score += pts; fb.className = 'gq-fb is-ok'; fb.innerHTML = `<b>正解 ＋${pts}</b>${q[3]}`; d.classList.add('is-ok'); }
    else { st.streak = 0; st.end -= 3000; st.miss.push(q); fb.className = 'gq-fb is-ng'; fb.innerHTML = `<b>${q[2] ? '正しい見出しでした' : '言いすぎの見出しでした'}</b>${q[3]}`; d.classList.add('is-ng'); }
    d.insertAdjacentHTML('beforeend', `<span class="gq-stamp ${q[2] ? 'is-t' : 'is-f'}" aria-hidden="true">${q[2] ? '正' : '誤'}</span>`);
    g.querySelector('[data-gq="sc"]').textContent = st.score;
    g.querySelector('[data-gq="st"]').textContent = st.streak >= 3 ? `${st.streak} 連続 ×${mult().toFixed(2).replace(/0$/, '')}` : '';
    st.lock = true;
    setTimeout(() => { if (!st) return; st.lock = false; show(); }, ok ? (reduce ? 300 : 1100) : 2600);
  };
  const TITLE = [[220, '敏腕デスク'], [130, 'たよれるデスク'], [60, 'デスクの見習い'], [0, 'これから見る目を育てよう']];
  const finish = () => {
    clearInterval(tick);
    const s = st; st = null;
    const prev = getB(), best = s.score > prev;
    try { if (best) localStorage.setItem(KEY, String(s.score)); localStorage.setItem('azakei_gurafu', '1'); } catch (e) {}
    const ti = TITLE.findIndex(x => s.score >= x[0]);
    g.innerHTML = `<div class="gq-end">
      <p class="gq-kicker">本日の紙面</p>
      <p class="gq-big"><b>${s.score}</b> 点<small>正解 ${s.ok}・まちがい ${s.miss.length}</small></p>
      <p class="gq-title"><span aria-hidden="true">称</span>${TITLE[ti][1]}${best ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${prev} 点</small>` : ''}</p>
      ${s.miss.length ? `<p class="gq-l">見のがした見出し</p><ul class="gq-miss">${s.miss.slice(0, 4).map(q => `<li><span class="gq-tag ${q[2] ? 'is-t' : 'is-f'}">${q[2] ? '正しい' : '言いすぎ'}</span><p><b>${q[1]}</b>${q[3]}</p></li>`).join('')}</ul>` : '<p class="gq-perfect">見のがしゼロ！ 数字を見る目は確かです。</p>'}
      <div class="gq-rule"><p class="gq-l">見出しを見たら</p><ul><li>縦軸は 0 から始まっている？</li><li>「〇倍」「〇%」は、自分でわり算してみる</li><li>「連続」「過去最高」は、全部の年を見てたしかめる</li></ul></div>
      <button type="button" class="gq-go" data-gq="start">もう一度チェックする</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(g, 'gurafu', ti, TITLE.length);
  };
  g.addEventListener('click', e => {
    const k = e.target.closest('[data-v]'); if (k) { answer(k.dataset.v === '1'); return; }
    if (e.target.closest('[data-gq="start"]')) start();
  });
  intro();
})();
