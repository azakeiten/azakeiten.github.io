/* ================================================================
   double.js — シミュレーター：お金が 2 倍になるまで（72 の法則）
   ・年利を動かすと、72 の法則と、きちんと計算した年数を出す
   ・チップ 5 枚が、年ごとに複利で増えて 10 枚になるまでを、3D の山で見せる
   ================================================================ */
(function() {
  const box = document.querySelector('[data-double]');
  if (!box) return;
  const range = box.querySelector('#dblRange'), out = box.querySelector('#dblRate');
  const stack = box.querySelector('[data-stack]'), yearsEl = box.querySelector('[data-years]'), chipsEl = box.querySelector('[data-chips]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PER = 1;   // チップ 1 枚を、山の 1 段に（5 枚 → 10 枚）
  let timer = 0;
  const chip = (i, gold) => `<span class="vt-chip" style="--z:${i * 9}px;--d:0s;--c:${gold ? '#b08a4a' : '#b5432f'};--s:#fffaf0"><i></i><i></i><i></i><b></b></span>`;
  const draw = (amount) => {
    const n = Math.floor(amount / PER + 1e-9);
    let h = ''; for (let i = 0; i < n; i++) h += chip(i, i >= 5);
    stack.innerHTML = h;
  };
  const run = () => {
    const r = +range.value, g = 1 + r / 100;
    const exact = Math.log(2) / Math.log(g), rule = 72 / r;
    out.textContent = r;
    box.querySelector('[data-r]').textContent = r;
    box.querySelector('[data-rule]').textContent = Number.isInteger(rule) ? rule : rule.toFixed(1);
    box.querySelector('[data-exact]').textContent = exact.toFixed(1);
    const age = Math.round(15 + exact);
    box.querySelector('[data-note]').textContent = `年 ${r}％ なら、15 歳で始めたお金は、${age} 歳ごろに 2 倍。`;
    // 年ごとに積み上げる
    clearTimeout(timer);
    const end = Math.ceil(exact);
    let y = 0;
    const step = () => {
      const amt = 5 * Math.pow(g, y);
      draw(Math.min(amt, 10)); yearsEl.textContent = y; chipsEl.textContent = (Math.round(amt * 10) / 10).toFixed(1);
      if (y < end) { y++; timer = setTimeout(step, reduce ? 0 : Math.max(60, 900 / end)); }
    };
    if (reduce) { y = end; step(); } else step();
  };
  range.addEventListener('input', run);
  // 画面に入ったら 1 回目を動かす
  new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { run(); io.disconnect(); } }), { threshold: 0.3 }).observe(box);
  draw(5);
})();

/* ================================================================
   v340：72 の法則の早解き勝負「複利の時計」
   ・8 問。1 問 12 秒。「2 倍まで何年？」「何 % なら？」「何倍になる？」「物価・借金なら？」
   ・答えると、その問題の「2 倍・4 倍…」を年の線の上で見せる（ふえ方が目で見える）
   ・早く正解するほど点が高く、続けて正解すると倍率が上がる。自己ベストは azakei_dbl_best
   ・数字は「毎年同じ割合で増える」としたときの、72 の法則でのおよその年数（たとえ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-double]');
  if (!box) return;
  if (!document.querySelector('link[href^="dblgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'dblgame.css?v=20261126i'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_dbl_best', LIM = 12;
  const get = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const g = document.createElement('div');
  g.className = 'dg2';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="dg2-sub"><span aria-hidden="true">験</span>じっくりためす：年利を動かして、2 倍になるまでを見る</p>');
  const rnd = n => Math.floor(Math.random() * n);
  const shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[rnd(a.length)];
  const f = n => Number.isInteger(n) ? String(n) : n.toFixed(1);
  /* 正解 1 つと、ちがう答え 3 つ（同じものは入れない） */
  const uniq = (ans, cands) => { const o = [ans]; cands.forEach(c => { if (!o.includes(c) && o.length < 4) o.push(c); }); return shuf(o); };
  const MAKE = {
    years() {
      const r = pick([2, 3, 4, 6, 8, 9, 12]), y = 72 / r, A = `約 ${y} 年`;
      return { tag: '2 倍まで', q: `年 ${r}% で増えるお金。2 倍になるのは、だいたい何年後？`, ans: A, opts: uniq(A, [`約 ${Math.round(100 / r)} 年`, `約 ${y * 2} 年`, `約 ${Math.max(1, Math.round(y / 2))} 年`, `約 ${y + 6} 年`]), r, yrs: y * 2, why: `72 ÷ ${r} ＝ ${y}。年 ${r}% なら約 ${y} 年で 2 倍、そのまた ${y} 年後には 4 倍です。` };
    },
    rate() {
      const y = pick([6, 8, 9, 12, 18, 24, 36]), r = 72 / y, A = `年 約 ${f(r)}%`;
      return { tag: '何 % なら', q: `${y} 年で 2 倍にしたい。年に何 % で増えればいい？`, ans: A, opts: uniq(A, [`年 約 ${f(100 / y)}%`, `年 約 ${f(r * 2)}%`, `年 約 ${f(Math.max(1, r / 2))}%`, `年 約 ${f(r + 2)}%`]), r, yrs: y * 2, why: `72 ÷ ${y} ＝ ${f(r)}。72 の法則は「年利 × 年数 ≒ 72」なので、年数から年利も出せます。` };
    },
    times() {
      const r = pick([3, 4, 6, 8, 9, 12]), k = pick([2, 3]), d = 72 / r, y = d * k, m = 2 ** k, A = `約 ${m} 倍`;
      return { tag: '何倍に', q: `年 ${r}% で増えるお金を、${y} 年そのままにしておくと、だいたい何倍？`, ans: A, opts: uniq(A, [`約 ${k + 1} 倍`, `約 ${k} 倍`, `約 ${m * 2} 倍`, `約 ${m + 1} 倍`]), r, yrs: y, why: `${d} 年ごとに 2 倍。${y} 年は ${d} 年の ${k} 回分なので、2 を ${k} 回かけて ${m} 倍。足し算（${k + 1} 倍）ではなく、かけ算でふえるのが複利です。` };
    },
    life() {
      const L = [
        { q: '物価が毎年 2% ずつ上がると、いま 150 円のおにぎりが 300 円くらいになるのは何年後？', r: 2, a: '約 36 年後', w: ['約 50 年後', '約 18 年後', '約 72 年後'], why: '72 ÷ 2 ＝ 36。物価が 2 倍になると、同じお金で買える量は半分。物価が上がり続けると、お金の「買う力」は少しずつ減ります（値段はたとえです）。' },
        { q: '物価が毎年 3% ずつ上がると、物の値段がだいたい 2 倍になるのは何年後？', r: 3, a: '約 24 年後', w: ['約 33 年後', '約 12 年後', '約 48 年後'], why: '72 ÷ 3 ＝ 24。ふえるお金だけでなく、上がる物価にも 72 の法則が使えます。' },
        { q: '年 18% の利息がつく借金。返さずにいると、借りたお金がだいたい 2 倍になるのは？', r: 18, a: '約 4 年', w: ['約 6 年', '約 8 年', '約 2 年'], why: '72 ÷ 18 ＝ 4。複利は、借りる側にも同じ力で働きます。利息の高い借金は、早く返すほど得です（利率はたとえです）。' },
        { q: '年 0.01% の利息の預金。2 倍になるのは、だいたい何年後？', r: 0.01, a: '約 7,200 年後', w: ['約 720 年後', '約 72 年後', '約 100 年後'], why: '72 ÷ 0.01 ＝ 7,200。利率がとても低いと、預けておくだけではほとんど増えません（利率はたとえです）。' },
        { q: '年 6% で増えるお金。15 歳で始めると、4 倍になるのは何歳ごろ？', r: 6, a: '39 歳ごろ', w: ['27 歳ごろ', '63 歳ごろ', '33 歳ごろ'], why: '72 ÷ 6 ＝ 12 年で 2 倍、24 年で 4 倍。15 ＋ 24 ＝ 39 歳。早く始めるほど、2 倍になる回数がふえます。' }
      ];
      const o = pick(L.filter(x => !seen.includes(x.q)));
      seen.push(o.q);
      return { tag: 'くらしで', q: o.q, ans: o.a, opts: shuf([o.a, ...o.w]), r: o.r, yrs: o.r >= 1 ? 72 / o.r * 2 : 0, why: o.why };
    }
  };
  const ORDER = ['years', 'rate', 'times', 'life', 'years', 'times', 'rate', 'life'];
  let Q = [], i = 0, score = 0, streak = 0, t0 = 0, tick = 0, log = [], seen = [];
  const mult = () => 1 + Math.min(streak, 5) * 0.2;
  const intro = () => {
    const b = get();
    g.innerHTML = `<div class="dg2-intro">
      <div class="dg2-clock" aria-hidden="true"><i></i><b>72</b></div>
      <div class="dg2-in"><p class="dg2-kicker">早解き勝負</p><h3 class="dg2-h">複利の時計</h3>
      <p class="dg2-p">「72 ÷ 年利 ＝ 2 倍になるまでの年数」。この式 1 つで、8 問に答えます。1 問 12 秒。早いほど点が高く、続けて正解すると倍率が上がります。</p>
      <ul class="dg2-kinds"><li>2 倍まで何年？</li><li>何 % なら？</li><li>何倍になる？</li><li>物価や借金なら？</li></ul>
      <p class="dg2-best">${b ? `自己ベスト <b>${b.toLocaleString()}</b> 点` : 'はじめての挑戦'}</p>
      <button type="button" class="dg2-go" data-dg="start">勝負をはじめる</button></div></div>`;
  };
  const start = () => {
    seen = [];
    Q = ORDER.map(k => MAKE[k]());
    i = 0; score = 0; streak = 0; log = [];
    ask();
  };
  const top = () => `<div class="dg2-top"><span class="dg2-n">${i + 1} / ${Q.length}</span><span class="dg2-tag">${Q[i].tag}</span>${streak >= 2 ? `<span class="dg2-st">${streak} 連続 ×${mult().toFixed(1)}</span>` : ''}<span class="dg2-sc">得点 <b data-dg="sc">${score.toLocaleString()}</b></span></div>`;
  const ask = () => {
    const q = Q[i];
    g.innerHTML = `<div class="dg2-play">${top()}
      <div class="dg2-time" aria-hidden="true"><i data-dg="tm"></i></div>
      <p class="dg2-q">${q.q}</p>
      <div class="dg2-opts">${q.opts.map((o, j) => `<button type="button" data-o="${j}">${o}</button>`).join('')}</div>
      <div class="dg2-ex" data-dg="ex" aria-live="polite"></div></div>`;
    t0 = performance.now();
    const tm = g.querySelector('[data-dg="tm"]');
    clearInterval(tick);
    tick = setInterval(() => {
      const left = Math.max(0, LIM - (performance.now() - t0) / 1000);
      tm.style.transform = `scaleX(${(left / LIM).toFixed(3)})`;
      tm.classList.toggle('is-low', left < 4);
      if (left <= 0) answer(-1);
    }, 100);
    try { g.querySelector('[data-o]').focus({ preventScroll: true }); } catch (e) {}
  };
  /* 年の線：0 年から、2 倍・4 倍…の点を順に置く */
  const line = q => {
    if (!q.r || q.r < 1 || !q.yrs) return '';
    const d = 72 / q.r, max = Math.max(q.yrs, d), n = Math.floor(max / d + 1e-9);
    let pts = '';
    for (let k = 1; k <= n; k++) pts += `<span class="dg2-pt" style="left:${(k * d / max * 100).toFixed(1)}%;--k:${k}"><b>×${2 ** k}</b><small>${f(k * d)} 年</small></span>`;
    return `<div class="dg2-line" aria-hidden="true"><i></i><span class="dg2-pt is-0" style="left:0;--k:0"><b>×1</b><small>0 年</small></span>${pts}</div>`;
  };
  const answer = j => {
    clearInterval(tick);
    if (g.querySelector('[data-o]:disabled')) return;
    const q = Q[i], sec = (performance.now() - t0) / 1000, ok = j >= 0 && q.opts[j] === q.ans;
    let got = 0;
    if (ok) { streak++; got = Math.round((100 + 50 * Math.max(0, LIM - sec) / LIM) * mult()); score += got; } else streak = 0;
    log.push({ q: q.q, ans: q.ans, ok });
    g.querySelectorAll('[data-o]').forEach((b, k) => { b.disabled = true; if (q.opts[k] === q.ans) b.classList.add('is-ok'); else if (k === j) b.classList.add('is-ng'); });
    const sc = g.querySelector('[data-dg="sc"]'); if (sc) sc.textContent = score.toLocaleString();
    g.querySelector('[data-dg="ex"]').innerHTML = `<p class="dg2-res ${ok ? 'is-ok' : 'is-ng'}">${ok ? `正解 <b>＋${got}</b>${streak >= 2 ? `<small>${streak} 連続</small>` : ''}` : j < 0 ? `時間切れ。答えは ${q.ans}` : `ざんねん。答えは ${q.ans}`}</p>${line(q)}<p class="dg2-why">${q.why}</p><button type="button" class="dg2-go" data-dg="next">${i + 1 < Q.length ? '次の問題' : '結果を見る'}</button>`;
    try { g.querySelector('[data-dg="next"]').focus({ preventScroll: true }); } catch (e) {}
  };
  const TITLE = [[1400, '複利の時計職人'], [1000, '72 の名人'], [650, 'ふえ方が見える人'], [300, '複利の見習い'], [0, 'これから 2 倍']];
  const finish = () => {
    const ok = log.filter(x => x.ok).length, prev = get(), best = score > prev;
    if (best) { try { localStorage.setItem(KEY, String(score)); } catch (e) {} }
    const t = TITLE.find(x => score >= x[0])[1];
    g.innerHTML = `<div class="dg2-end">
      <p class="dg2-kicker">結果</p>
      <p class="dg2-big"><b>${score.toLocaleString()}</b> 点<small>${ok} / ${Q.length} 問正解</small></p>
      <p class="dg2-title"><span aria-hidden="true">称</span>${t}${best ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${prev.toLocaleString()} 点</small>` : ''}</p>
      <ol class="dg2-log">${log.map(x => `<li class="${x.ok ? 'is-ok' : 'is-ng'}"><span>${x.ok ? '正' : '誤'}</span><p>${x.q}<b>${x.ans}</b></p></li>`).join('')}</ol>
      <p class="dg2-memo">おぼえておきたいこと：72 ÷ 年利 ＝ 2 倍になるまでの年数。ふえるお金にも、上がる物価にも、ふくらむ借金にも、同じ式が使えます（毎年同じ割合で増えるとしたときの、およその数です）。</p>
      <button type="button" class="dg2-go" data-dg="start">もう一度（問題が変わります）</button></div>`;
    if (!reduce && g.querySelector('.dg2-big b').animate) g.querySelector('.dg2-big b').animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1 }, { transform: 'scale(1)' }], { duration: 600, easing: 'cubic-bezier(.3,1.4,.5,1)' });
    window.AZAKEI_TALK && window.AZAKEI_TALK(g, 'dbl', TITLE.findIndex(x => score >= x[0]), TITLE.length);
  };
  g.addEventListener('click', e => {
    const o = e.target.closest('[data-o]'); if (o && !o.disabled) { answer(+o.dataset.o); return; }
    const a = e.target.closest('[data-dg]'); if (!a) return;
    if (a.dataset.dg === 'start') start();
    if (a.dataset.dg === 'next') { if (++i < Q.length) ask(); else finish(); }
  });
  intro();
})();
