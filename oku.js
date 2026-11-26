/* ================================================================
   oku.js — 経済ラボ：1 億円って、どれくらい？（一万円札を積むと、高さと重さは？）
   ・一万円札 1 枚：厚さ約 0.1mm、重さ約 1g（どちらも「約」）
   ・高さを、身近なもの・東京タワー・スカイツリー・富士山とくらべる
   ================================================================ */
(function() {
  const box = document.querySelector('[data-oku]');
  if (!box) return;
  // [金額（円）, 表示]
  const STEPS = [[1e6, '100 万円'], [1e7, '1,000 万円'], [1e8, '1 億円'], [1e9, '10 億円'], [1e10, '100 億円'], [1e11, '1,000 億円'], [1e12, '1 兆円'], [1e13, '10 兆円'], [1.1e14, '約 110 兆円（国の 1 年の予算くらい）']];
  // 高さくらべ [名前, m]
  const H = [['机', 0.7], ['小学 1 年生の背', 1.15], ['大人の背', 1.7], ['学校の 3 階', 10], ['東京タワー', 333], ['スカイツリー', 634], ['富士山', 3776], ['エベレスト', 8849], ['飛行機が飛ぶ高さ', 10000]];
  // 重さくらべ [名前, kg]
  const W = [['ランドセル', 1.2], ['お米 1 袋', 10], ['大人 1 人', 60], ['軽自動車', 900], ['アフリカゾウ', 6000], ['ジャンボジェット', 180000]];
  const fmt = (n, u) => n >= 1000 && u === 'm' ? `${(n / 1000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })} km` : n >= 1000 && u === 'kg' ? `${(n / 1000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })} トン` : `${n.toLocaleString('ja-JP', { maximumFractionDigits: n < 1 ? 2 : 1 })} ${u === 'm' ? (n < 1 ? 'cm' : 'm') : u}`;
  box.innerHTML = `
    <div class="ok-ctrl">
      <p class="ok-amount" data-o="amt"></p>
      <input type="range" min="0" max="${STEPS.length - 1}" step="1" value="2" aria-label="金額" data-o="rng">
      <p class="ok-sub">一万円札で <b data-o="bills"></b> 枚</p>
    </div>
    <div class="ok-stage">
      <div class="ok-col"><p class="ok-k">高さ</p><p class="ok-v" data-o="h"></p><p class="ok-cmp" data-o="hc"></p><div class="ok-bar"><i data-o="hb"></i><span data-o="hm"></span></div></div>
      <div class="ok-col"><p class="ok-k">重さ</p><p class="ok-v" data-o="w"></p><p class="ok-cmp" data-o="wc"></p><div class="ok-bar is-w"><i data-o="wb"></i><span data-o="wm"></span></div></div>
    </div>
    <div class="ok-stack" aria-hidden="true" data-o="stack"></div>
    <p class="ok-note" data-o="note"></p>
    <p class="ok-foot">※ 一万円札 1 枚は、厚さ約 0.1 mm・重さ約 1 g として計算。くらべるものの高さ・重さも、どれも「約」です。</p>`;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const cmp = (v, list, unit) => {
    const below = list.filter(x => x[1] <= v).pop(), above = list.find(x => x[1] > v);
    if (!below) return { text: `${above[0]}より低い`.replace('低い', unit === 'kg' ? '軽い' : '低い'), ref: above };
    const r = v / below[1];
    if (above && above[1] / v < 1.25) return { text: `${above[0]}より少し${unit === 'kg' ? '軽い' : '低い'}`, ref: above };
    return { text: r < 1.15 ? `${below[0]}くらい` : `${below[0]}の 約 ${r < 10 ? r.toFixed(1) : Math.round(r).toLocaleString('ja-JP')} 倍`, ref: below };
  };
  let last = -1;
  const draw = () => {
    const i = +$('rng').value, [yen, label] = STEPS[i];
    const bills = yen / 10000, h = bills * 0.0001, w = bills * 0.001;
    $('amt').textContent = label;
    $('bills').textContent = bills.toLocaleString('ja-JP');
    $('h').textContent = h < 1 ? `${Math.round(h * 100)} cm` : fmt(h, 'm');
    $('w').textContent = fmt(w, 'kg');
    const hc = cmp(h, H, 'm'), wc = cmp(w, W, 'kg');
    $('hc').textContent = hc.text; $('wc').textContent = wc.text;
    // バー：比べるものを 100% として、どこまで届いているか
    const hp = Math.min(100, h / hc.ref[1] * 100), wp = Math.min(100, w / wc.ref[1] * 100);
    $('hb').style.width = Math.max(3, hp) + '%'; $('wb').style.width = Math.max(3, wp) + '%';
    $('hm').textContent = hc.ref[0]; $('wm').textContent = wc.ref[0];
    // 札束の山（見た目）：段の数を金額のケタで
    const layers = Math.min(14, i + 3);
    $('stack').innerHTML = Array.from({ length: layers }, (_, k) => `<i style="--k:${k}"></i>`).join('');
    $('stack').classList.toggle('is-grow', i > last); last = i;
    $('note').innerHTML = i <= 1 ? 'まずは、つまみを右に動かしてみよう。'
      : i === 2 ? '<b>1 億円</b>は、一万円札 1 万枚。積むと<b>約 1 m</b>、重さは<b>約 10 kg</b>。お米 1 袋くらいの重さで、運ぶのは意外と大変。'
      : i === 6 ? '<b>1 兆円</b>は 1 億枚。積むと<b>約 10 km</b>で、エベレストよりも高い山に。'
      : i === STEPS.length - 1 ? '日本の国の 1 年の予算（一般会計）は、ここ数年 <b>110 兆円台</b>。積むと 1,000 km をこえて、宇宙ステーションが飛ぶ高さ（約 400 km）よりずっと高くなります。'
      : 'ケタが 1 つ上がるたびに、高さも重さも 10 倍。ニュースの「◯兆円」の大きさが、少し見えてきたかな？';
  };
  $('rng').addEventListener('input', () => { draw(); if (+$('rng').value === STEPS.length - 1) { try { localStorage.setItem('azakei_oku', '1'); } catch (e) {} } });
  draw();
})();

/* ================================================================
   v342：ケタの感覚テスト「大きなお金のものさし」
   ・6 問。答えは、ケタ（10 倍ごと）の目もりがついた「ものさし」の上で、つまみを動かして決める
   ・決めると、本当の位置に札束の印が落ちてきて、何ケタずれたかで点が出る（ぴったり 100 点、1 ケタずれると 40 点ほど）
   ・ものさしには、机・東京タワー・富士山などの目じるしがある（どれも「約」）
   ・計算のもと：一万円札 1 枚 厚さ約 0.1 mm・重さ約 1 g。国の予算は約 110 兆円（一般会計・ここ数年）
   ・自己ベストは azakei_oku_best
   ================================================================ */
(function () {
  const box = document.querySelector('[data-oku]');
  if (!box) return;
  if (!document.querySelector('link[href^="okgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'okgame.css?v=20261127b'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_oku_best';
  const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const g = document.createElement('div');
  g.className = 'og';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="og-sub"><span aria-hidden="true">験</span>じっくりためす：金額を動かして、高さと重さをくらべる</p>');
  const nf = (n, d = 1) => n.toLocaleString('ja-JP', { maximumFractionDigits: n < 10 ? d : 0 });
  const FMT = {
    m: v => v < 0.01 ? `${nf(v * 1000)} mm` : v < 1 ? `${nf(v * 100)} cm` : v < 1000 ? `${nf(v)} m` : `${nf(v / 1000)} km`,
    kg: v => v < 1 ? `${nf(v * 1000)} g` : v < 1000 ? `${nf(v)} kg` : `${nf(v / 1000)} トン`,
    day: v => v < 365 ? `${nf(v)} 日` : `${nf(v)} 日（約 ${nf(v / 365)} 年）`
  };
  /* ものさしの目もりの字（短く。1 万以上は「万」） */
  const cm = n => n >= 1e4 ? `${nf(n / 1e4)}万` : nf(n);
  const TICK = {
    m: v => v < 0.01 ? `${nf(v * 1000)}mm` : v < 1 ? `${nf(v * 100)}cm` : v < 1000 ? `${nf(v)}m` : `${cm(v / 1000)}km`,
    kg: v => v < 1 ? `${nf(v * 1000)}g` : v < 1000 ? `${nf(v)}kg` : `${cm(v / 1000)}トン`,
    day: v => `${cm(v)}日`
  };
  /* [問題, 単位, 答え, ものさしの左端と右端（10 の何乗）, 目じるし, 説明] */
  const Q = [
    ['100 万円を一万円札で積むと、高さは？', 'm', 0.01, [-4, 2], [['1 円玉の厚さ', 0.0015], ['消しゴム', 0.025], ['机', 0.7], ['大人の背', 1.7], ['学校の 3 階', 10]], '一万円札 100 枚 × 約 0.1 mm ＝ 約 1 cm。100 万円は、思ったより薄い札束です。'],
    ['1 億円を一万円札で積むと、高さは？', 'm', 1, [-3, 3], [['消しゴム', 0.025], ['机', 0.7], ['大人の背', 1.7], ['学校の 3 階', 10], ['東京タワー', 333]], '一万円札 1 万枚 × 約 0.1 mm ＝ 約 1 m。机より少し高いくらいです。'],
    ['1 億円の重さは？', 'kg', 10, [-1, 5], [['ランドセル', 1.2], ['お米 1 袋', 10], ['大人 1 人', 60], ['軽自動車', 900], ['アフリカゾウ', 6000]], '1 万枚 × 約 1 g ＝ 約 10 kg。お米 1 袋くらい。持ち上げられるけれど、運ぶのは大変です。'],
    ['1 兆円の重さは？', 'kg', 100000, [1, 7], [['大人 1 人', 60], ['軽自動車', 900], ['アフリカゾウ', 6000], ['ジャンボジェット', 180000]], '1 兆円は一万円札 1 億枚。× 約 1 g ＝ 約 100 トン。アフリカゾウ（約 6 トン）の 17 頭分くらいです。'],
    ['国の 1 年の予算（約 110 兆円）を積むと、高さは？', 'm', 1100000, [2, 8], [['東京タワー', 333], ['富士山', 3776], ['飛行機が飛ぶ高さ', 10000], ['宇宙ステーション', 400000], ['日本列島の長さ', 3000000]], '一万円札 110 億枚 × 約 0.1 mm ＝ 約 1,100 km。宇宙ステーションが飛ぶ高さ（約 400 km）の 2 倍以上です。'],
    ['1 億円を、毎日 1 万円ずつ使うと、なくなるのは何日後？', 'day', 10000, [1, 7], [['1 か月', 30], ['1 年', 365], ['10 年', 3650], ['人の一生', 30000], ['1000 年', 365000]], '1 億 ÷ 1 万 ＝ 1 万日。約 27 年かかります。毎日 1 万円使っても、なかなかなくなりません。'],
    ['1 兆円を、毎日 1 億円ずつ使うと、なくなるのは何日後？', 'day', 10000, [1, 7], [['1 か月', 30], ['1 年', 365], ['10 年', 3650], ['人の一生', 30000], ['1000 年', 365000]], '1 兆 ÷ 1 億 ＝ 1 万日。毎日 1 億円でも、約 27 年。「億」と「兆」は 1 万倍ちがいます。']
  ];
  const ORDER = [[0, 1], [2], [3], [4], [5, 6]];   // [0 か 1]・2・3・4・[5 か 6] … で 5 問（毎回少し変わる）
  const pickSet = () => { const s = ORDER.map(o => o[Math.floor(Math.random() * o.length)]); s.splice(2, 0, s[0] === 0 ? 1 : 0); return s; };
  const STEPS = 1000;
  let set = [], k = 0, total = 0, log = [];
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="og-intro">
      <div class="og-art" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><b>億</b></div>
      <div><p class="og-kicker">ケタの感覚テスト</p><h3 class="og-h">大きなお金のものさし</h3>
      <p class="og-p">1 億円を積んだら、どれくらいの高さ？ 1 兆円の重さは？ 10 倍ごとに目もりがついた「ものさし」の上で、つまみを動かして答えます。ぴったりなら 100 点。1 ケタ（10 倍）ずれると、点は半分以下に。全 6 問です。</p>
      <p class="og-best">${b ? `自己ベスト <b>${b}</b> 点 / 600` : 'はじめての挑戦'}</p>
      <button type="button" class="og-go" data-og="start">はじめる</button></div></div>`;
  };
  const posOf = (v, r) => (Math.log10(v) - r[0]) / (r[1] - r[0]);
  const valOf = (p, r) => 10 ** (r[0] + p * (r[1] - r[0]));
  const ask = () => {
    const q = Q[set[k]], r = q[3], u = FMT[q[1]];
    const ticks = []; for (let e = r[0]; e <= r[1]; e++) ticks.push(`<span class="og-tk" style="left:${((e - r[0]) / (r[1] - r[0]) * 100).toFixed(2)}%"><small>${TICK[q[1]](10 ** e)}</small></span>`);
    const marks = q[4].filter(m => { const p = posOf(m[1], r); return p > 0 && p < 1; }).map((m, j) => `<span class="og-mk${j % 2 ? ' is-lo' : ''}" style="left:${(posOf(m[1], r) * 100).toFixed(2)}%"><b>${m[0]}</b></span>`).join('');
    const start = Math.round(STEPS * 0.5);
    g.innerHTML = `<div class="og-play">
      <div class="og-top"><span class="og-n">${k + 1} / ${set.length}</span><span class="og-sc">合計 <b>${total}</b> 点</span></div>
      <p class="og-q">${q[0]}</p>
      <p class="og-guess"><small>あなたの答え</small><b data-og="gv">${u(valOf(start / STEPS, r))}</b></p>
      <div class="og-ruler">
        <div class="og-marks">${marks}</div>
        <div class="og-track"><i class="og-ans" data-og="ans" hidden></i>${ticks.join('')}<i class="og-thumb" data-og="th" style="left:50%"></i></div>
        <input type="range" min="0" max="${STEPS}" value="${start}" step="1" aria-label="答えの大きさ（右へ行くほど 10 倍ずつ大きい）" data-og="rng">
      </div>
      <p class="og-hint">右へ 1 目もり動かすと、10 倍。</p>
      <div class="og-res" data-og="res" aria-live="polite"><button type="button" class="og-go" data-og="ok">これで決める</button></div></div>`;
    const rng = g.querySelector('[data-og="rng"]');
    rng.addEventListener('input', () => { const p = rng.value / STEPS; g.querySelector('[data-og="th"]').style.left = (p * 100) + '%'; g.querySelector('[data-og="gv"]').textContent = u(valOf(p, r)); });
  };
  const decide = () => {
    const q = Q[set[k]], r = q[3], u = FMT[q[1]], rng = g.querySelector('[data-og="rng"]');
    const guess = valOf(rng.value / STEPS, r), off = Math.abs(Math.log10(guess / q[2]));
    const pts = Math.round(100 * Math.exp(-off * 1.1));
    total += Math.max(0, pts);
    log.push({ q: q[0], a: u(q[2]), gs: u(guess), off, pts: Math.max(0, pts) });
    rng.disabled = true;
    const ans = g.querySelector('[data-og="ans"]');
    ans.style.left = (posOf(q[2], r) * 100) + '%'; ans.hidden = false;
    const word = off < 0.15 ? 'ぴったり！' : off < 0.5 ? 'おしい！ ほぼ同じケタ' : off < 1.2 ? `${Math.round(off * 10) / 10} ケタずれ` : `${Math.round(off * 10) / 10} ケタずれ。10 倍以上ちがう！`;
    g.querySelector('.og-top b').textContent = total;
    g.querySelector('[data-og="res"]').innerHTML = `<p class="og-big ${off < 0.5 ? 'is-ok' : 'is-ng'}">${word}<b>＋${Math.max(0, pts)}</b></p>
      <p class="og-ansl">こたえ <b>約 ${u(q[2])}</b>　あなた ${u(guess)}${guess > q[2] ? `（約 ${nf(guess / q[2])} 倍大きい）` : guess < q[2] ? `（約 ${nf(q[2] / guess)} 分の 1）` : ''}</p>
      <p class="og-why">${q[5]}</p>
      <button type="button" class="og-go" data-og="next">${k + 1 < set.length ? '次の問題' : '結果を見る'}</button>`;
    try { g.querySelector('[data-og="next"]').focus({ preventScroll: true }); } catch (e) {}
  };
  const TITLE = [[480, 'ケタの達人'], [380, '大きな数が見える人'], [260, 'ニュースが少し身近に'], [0, 'ケタの旅は、これから']];
  const finish = () => {
    const prev = getB(), best = total > prev;
    if (best) { try { localStorage.setItem(KEY, String(total)); localStorage.setItem('azakei_oku', '1'); } catch (e) {} }
    g.innerHTML = `<div class="og-end">
      <p class="og-kicker">結果</p>
      <p class="og-total"><b>${total}</b> 点<small>/ ${set.length * 100}</small></p>
      <p class="og-title"><span aria-hidden="true">称</span>${TITLE.find(x => total >= x[0])[1]}${best ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${prev} 点</small>` : ''}</p>
      <ol class="og-log">${log.map(x => `<li><p>${x.q}</p><span>こたえ <b>${x.a}</b>・あなた ${x.gs}</span><em class="${x.off < 0.5 ? 'is-ok' : ''}">${x.pts} 点</em></li>`).join('')}</ol>
      <p class="og-memo">ケタが 1 つ上がると 10 倍、4 つ上がると 1 万倍。「億」と「兆」は 1 万倍ちがいます。ニュースの「◯兆円」は、一万円札を宇宙まで積めるほどの大きさです（一万円札 1 枚の厚さ約 0.1 mm・重さ約 1 g で計算した、およその数です）。</p>
      <button type="button" class="og-go" data-og="start">もう一度（問題が少し変わります）</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(g, 'oku', TITLE.findIndex(x => total >= x[0]), TITLE.length);
  };
  g.addEventListener('click', e => {
    const a = e.target.closest('[data-og]'); if (!a || a.tagName === 'INPUT') return;
    const kk = a.dataset.og;
    if (kk === 'start') { set = pickSet(); k = 0; total = 0; log = []; ask(); }
    else if (kk === 'ok') decide();
    else if (kk === 'next') { if (++k < set.length) ask(); else finish(); }
  });
  intro();
})();
