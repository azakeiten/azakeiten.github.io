/* ================================================================
   rousoku.js — コンテスト：ローソク足をつくろう（株価チャートの読み方・近づいてから読みこむ）
   ・たとえの会社の株価が、1 日のあいだ線で動く。そのとなりで、ローソク足が育っていく
   ・始値・高値・安値・終値を点線で結び、線とローソク足の関係が目で見える
   ・1 日が終わると、ローソク足が「1 週間のチャート」へとんでいく。5 日分そろうとクイズ
   ・値動きはランダムな「たとえ」。見た目は rousoku.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-rousoku]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="rousoku.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'rousoku.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const DAYS = ['月', '火', '水', '木', '金'], TICKS = 64;
  const yen = v => Math.round(v).toLocaleString() + ' 円';

  // 1 日の値動き（始値からのランダムな歩み。日ごとに、上がりやすさをかえる）
  const makeDay = open => {
    const drift = (Math.random() - .5) * 2.4, vol = 3 + Math.random() * 7, t = [open];
    for (let i = 1; i < TICKS; i++) t.push(Math.max(500, t[i - 1] + drift + (Math.random() - .5) * vol * 2));
    const o = t[0], c = t[TICKS - 1];
    return { t, o, c, h: Math.max(...t), l: Math.min(...t) };
  };

  box.innerHTML = `
    <div class="rs-board">
      <div class="rs-head"><p class="rs-co"><span class="rs-co-s">食</span><b>たとえ食品</b><small>株価（たとえ）</small></p><p class="rs-day"><b data-k="day">月</b>曜日</p><p class="rs-now"><span>いまの株価</span><b data-k="now">—</b></p></div>
      <svg class="rs-svg" viewBox="0 0 600 260" role="img" aria-label="1 日の株価の線と、育っていくローソク足"></svg>
      <ul class="rs-ohlc">
        <li data-o><span>始値</span><b data-k="o">—</b><small>その日、最初についた値段</small></li>
        <li data-h><span>高値</span><b data-k="h">—</b><small>その日、いちばん高い値段</small></li>
        <li data-l><span>安値</span><b data-k="l">—</b><small>その日、いちばん安い値段</small></li>
        <li data-c><span>終値</span><b data-k="c">—</b><small>その日、最後についた値段</small></li>
      </ul>
      <p class="rs-msg" data-k="msg" aria-live="polite">「1 日を進める」を押すと、株価が動きはじめます。</p>
      <div class="rs-btns"><button type="button" class="rs-go" data-a="day">1 日を進める</button><button type="button" data-a="week">のこりを早送り</button><button type="button" data-a="reset">はじめから</button></div>
    </div>
    <div class="rs-week">
      <p class="rs-week-h">1 週間のチャート<small>ローソク足 1 本 ＝ 1 日</small></p>
      <svg class="rs-wsvg" viewBox="0 0 400 220" role="img" aria-label="1 週間のローソク足"></svg>
      <div class="rs-quiz" hidden></div>
    </div>
    <div class="rs-learn">
      <p><b>4 つの値段を 1 本に</b>始値・高値・安値・終値の 4 つを、1 本の形にまとめたのがローソク足。ろうそくのような形から、この名前がつきました。</p>
      <p><b>陽線と陰線</b>始値より終値が高い（上がって終わった）日は「陽線」、低い日は「陰線」。このサイトでは陽線を赤、陰線を青にしています（色はアプリなどによってちがいます）。</p>
      <p><b>ひげ</b>四角い部分（実体）の上下にのびる線が「ひげ」。上ひげの先が高値、下ひげの先が安値です。ひげが長いと、その日のうちに大きくゆれたことがわかります。</p>
      <p><b>日本生まれ</b>江戸時代の大阪・堂島の米の取引で生まれたといわれ、いまは世界中で使われています。ストックリーグで会社を調べるときも、まずチャートを見ます（<a href="glossary.html#stock-price">株価</a>）。</p>
    </div>
    <p class="rs-note">たとえ食品は、実際の会社ではありません。株価の動きはランダムにつくっています。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const svg = box.querySelector('.rs-svg'), wsvg = box.querySelector('.rs-wsvg'), quiz = box.querySelector('.rs-quiz');
  let week = [], cur = null, busy = false, token = 0, start = 1000;
  const UP = '#c8432f', DN = '#2f5a8a';

  // ---- 1 日の図：左に線、右にローソク足。同じ高さの目盛りで、点線で結ぶ ----
  const drawDay = (d, n) => {
    const lo = d.l - (d.h - d.l) * .15 - 2, hi = d.h + (d.h - d.l) * .15 + 2;
    const Y = v => 18 + (hi - v) / (hi - lo) * 220, X = i => 40 + i / (TICKS - 1) * 360;
    const seen = d.t.slice(0, n), last = seen[seen.length - 1], h = Math.max(...seen), l = Math.min(...seen), up = last >= d.o;
    const done = n >= TICKS, CX = 500;
    let s = `<rect x="40" y="10" width="360" height="236" class="rs-bg"/>`;
    // 文字が重ならないように、上から順に 13px ずつ間をあける（線は本当の高さのまま）
    const labs = [['o', d.o, '始値'], ['h', h, '高値'], ['l', l, '安値']].concat(done ? [['c', d.c, '終値']] : []).map(([k, v, t]) => ({ k, t, y: Y(v), ty: Y(v) })).sort((a, b) => a.y - b.y);
    labs.forEach((a, i) => { if (i && a.ty - labs[i - 1].ty < 13) a.ty = labs[i - 1].ty + 13; });
    labs.forEach(({ k, t, y, ty }) => {
      s += `<line class="rs-guide is-${k}" x1="40" x2="${CX + 26}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/><text class="rs-gl is-${k}" x="${CX + 32}" y="${(ty + 4).toFixed(1)}">${t}</text>`;
    });
    s += `<polyline class="rs-line" points="${seen.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}"/>`;
    s += `<circle class="rs-dot is-o" cx="${X(0)}" cy="${Y(d.o).toFixed(1)}" r="4"/>`;
    s += `<circle class="rs-dot is-now" cx="${X(n - 1).toFixed(1)}" cy="${Y(last).toFixed(1)}" r="${done ? 4 : 6}"/>`;
    // ローソク足
    const top = Y(Math.max(d.o, last)), bot = Y(Math.min(d.o, last));
    s += `<g class="rs-candle ${up ? 'is-up' : 'is-dn'}"><line x1="${CX}" x2="${CX}" y1="${Y(h).toFixed(1)}" y2="${Y(l).toFixed(1)}" class="rs-wick"/><rect x="${CX - 18}" y="${top.toFixed(1)}" width="36" height="${Math.max(2, bot - top).toFixed(1)}" rx="2" class="rs-body"/></g>`;
    s += `<text class="rs-ax" x="34" y="${Y(hi - (hi - lo) * .06) + 4}">${Math.round(hi - (hi - lo) * .06)}</text><text class="rs-ax" x="34" y="${Y(lo + (hi - lo) * .06) + 4}">${Math.round(lo + (hi - lo) * .06)}</text>`;
    s += `<text class="rs-time" x="40" y="258">9 時</text><text class="rs-time" x="400" y="258" text-anchor="end">15 時半</text>`;
    s += `<text class="rs-ctag ${up ? 'is-up' : 'is-dn'}" x="${CX}" y="14">${n > 1 ? (up ? '陽線' : '陰線') : ''}</text>`;
    svg.innerHTML = s;
    K('now').textContent = yen(last); K('o').textContent = yen(d.o); K('h').textContent = yen(h); K('l').textContent = yen(l); K('c').textContent = done ? yen(d.c) : '—';
  };
  // ---- 1 週間のチャート ----
  const drawWeek = (mark) => {
    if (!week.length) { wsvg.innerHTML = `<text class="rs-empty" x="200" y="115">ここに、1 日ずつローソク足がならびます</text>`; return; }
    const lo = Math.min(...week.map(d => d.l)), hi = Math.max(...week.map(d => d.h)), pad = (hi - lo) * .12 + 2;
    const Y = v => 14 + (hi + pad - v) / (hi - lo + pad * 2) * 176;
    let s = '';
    DAYS.forEach((w, i) => { s += `<text class="rs-wd" x="${50 + i * 75}" y="212">${w}</text>`; });
    week.forEach((d, i) => {
      const x = 50 + i * 75, up = d.c >= d.o, top = Y(Math.max(d.o, d.c)), bot = Y(Math.min(d.o, d.c));
      s += `<g class="rs-wc ${up ? 'is-up' : 'is-dn'}${mark === i ? ' is-mark' : ''}${i === week.length - 1 && mark == null ? ' is-new' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="${DAYS[i]}曜日 始値 ${Math.round(d.o)} 円 終値 ${Math.round(d.c)} 円">
        <rect x="${x - 30}" y="4" width="60" height="196" class="rs-hit"/><line x1="${x}" x2="${x}" y1="${Y(d.h).toFixed(1)}" y2="${Y(d.l).toFixed(1)}" class="rs-wick"/><rect x="${x - 15}" y="${top.toFixed(1)}" width="30" height="${Math.max(2, bot - top).toFixed(1)}" rx="2" class="rs-body"/></g>`;
      if (i) { const p = week[i - 1]; s += `<line class="rs-wlink" x1="${x - 75 + 15}" x2="${x - 15}" y1="${Y(p.c).toFixed(1)}" y2="${Y(d.o).toFixed(1)}"/>`; }
    });
    wsvg.innerHTML = s;
  };

  const say = t => { K('msg').textContent = t; };
  const runDay = async (fast) => {
    if (busy || week.length >= 5) return;
    busy = true; box.classList.add('is-busy');
    const t = token;
    cur = makeDay(start + (Math.random() - .5) * 8);
    K('day').textContent = DAYS[week.length];
    say(`${DAYS[week.length]}曜日の取引がはじまりました。最初についた値段が「始値」です。`);
    for (let n = 1; n <= TICKS; n++) {
      drawDay(cur, n);
      if (n === Math.round(TICKS / 2)) say('値段が動くたびに、高値と安値の線がのびていきます。四角の色にも注目。');
      if (!fast) await sleep(n === 1 ? 600 : 55); else if (n % 8 === 0) await sleep(16);
      if (t !== token) return;
    }
    const up = cur.c >= cur.o, body = Math.abs(cur.c - cur.o), range = cur.h - cur.l;
    say(`取引終了。終値は ${yen(cur.c)}。始値より${up ? '高く終わったので「陽線」' : '安く終わったので「陰線」'}です。${range > body * 3 ? ' 実体にくらべて、ひげが長い 1 日でした。' : ''}`);
    week.push(cur); start = cur.c;
    await sleep(fast ? 80 : 700); if (t !== token) return;
    box.classList.add('is-fly'); await sleep(fast ? 0 : 450); box.classList.remove('is-fly');
    drawWeek();
    busy = false; box.classList.remove('is-busy');
    if (week.length >= 5) { box.querySelector('[data-a="day"]').textContent = '5 日分そろいました'; startQuiz(); }
  };

  // ---- クイズ（ローソク足を押して答える） ----
  let qs = [], qi = 0, score = 0;
  const startQuiz = () => {
    const ch = week.map(d => d.c - d.o), rg = week.map(d => d.h - d.l);
    const ups = week.filter(d => d.c >= d.o).length;
    qs = [
      ['いちばん大きく上がって終わった日（実体がいちばん長い陽線）は？', ch.some(v => v > 0) ? ch.indexOf(Math.max(...ch)) : null, 'pick'],
      ['1 日のゆれ（上ひげの先から下ひげの先まで）がいちばん大きかった日は？', rg.indexOf(Math.max(...rg)), 'pick'],
      ['陽線（上がって終わった日）は、5 日のうち何日？', ups, 'num']
    ].filter(q => q[1] !== null);
    qi = 0; score = 0; askQ();
  };
  const askQ = () => {
    if (qi >= qs.length) {
      quiz.innerHTML = `<p class="rs-q-h">${score} / ${qs.length} 問正解</p><p class="rs-q-t">${score === qs.length ? 'ローソク足が読めるようになりました。' : 'ローソク足を押すと、その日の 4 つの値段が出ます。もう一度ためしてみよう。'}</p><button type="button" class="rs-go" data-a="reset">新しい 1 週間</button>`;
      quiz.hidden = false; drawWeek();
      try { const prev = parseInt(localStorage.getItem('azakei_rousoku') || '0', 10) || 0; localStorage.setItem('azakei_rousoku', `${Math.max(score, prev)}/${qs.length}`); } catch (e) {}
      return;
    }
    const [q, , type] = qs[qi];
    quiz.innerHTML = `<p class="rs-q-n">クイズ ${qi + 1} / ${qs.length}</p><p class="rs-q-t">${q}</p>${type === 'num' ? `<div class="rs-q-nums">${[0, 1, 2, 3, 4, 5].map(v => `<button type="button" data-n="${v}">${v} 日</button>`).join('')}</div>` : '<p class="rs-q-hint">上のローソク足を押して答えよう。</p>'}`;
    quiz.hidden = false; box.classList.toggle('is-pick', type === 'pick');
  };
  const answer = v => {
    const [, ans, type] = qs[qi], ok = v === ans;
    if (ok) score++;
    drawWeek(type === 'pick' ? ans : null);
    quiz.insertAdjacentHTML('beforeend', `<p class="rs-q-r ${ok ? 'is-ok' : 'is-ng'}">${ok ? '正解！' : `ざんねん。答えは ${type === 'num' ? ans + ' 日' : DAYS[ans] + '曜日'}。`}</p>`);
    box.classList.remove('is-pick');
    qi++; setTimeout(askQ, reduce ? 0 : 1600);
  };

  const reset = () => {
    token++; busy = false; week = []; start = 1000; qs = []; quiz.hidden = true; quiz.innerHTML = '';
    box.classList.remove('is-busy', 'is-pick');
    box.querySelector('[data-a="day"]').textContent = '1 日を進める';
    K('day').textContent = '月';
    cur = makeDay(start); drawDay(cur, 1); K('now').textContent = '—'; ['o', 'h', 'l', 'c'].forEach(k => K(k).textContent = '—');
    say('「1 日を進める」を押すと、株価が動きはじめます。');
    drawWeek();
  };

  box.addEventListener('click', e => {
    const a = e.target.closest('[data-a]');
    if (a) { if (a.dataset.a === 'day') runDay(false); else if (a.dataset.a === 'week') (async () => { while (week.length < 5 && !busy) { await runDay(true); } })(); else reset(); return; }
    const nb = e.target.closest('[data-n]');
    if (nb && qs[qi] && qs[qi][2] === 'num') { answer(+nb.dataset.n); return; }
    const c = e.target.closest('.rs-wc');
    if (c) {
      const i = +c.dataset.i, d = week[i];
      if (qs[qi] && qs[qi][2] === 'pick' && box.classList.contains('is-pick')) { answer(i); return; }
      say(`${DAYS[i]}曜日：始値 ${yen(d.o)}・高値 ${yen(d.h)}・安値 ${yen(d.l)}・終値 ${yen(d.c)}（${d.c >= d.o ? '陽線' : '陰線'}）`);
    }
  });
  box.addEventListener('keydown', e => { const c = e.target.closest('.rs-wc'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); c.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
  reset();
})();
