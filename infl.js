/* ================================================================
   infl.js — 経済ラボ：インフレのタイムマシン（物価が上がると、1,000 円で買えるおにぎりが減る）
   ・計算だけ：n 年後の値段 = 今の値段 ×（1 + 上昇率）^n。おにぎり 1 個 100 円は「たとえ」
   ================================================================ */
(function() {
  const box = document.querySelector('[data-infl]');
  if (!box) return;
  const ONI = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4 C27 4 37 22 36 30 C35 36 28 37 20 37 C12 37 5 36 4 30 C3 22 13 4 20 4Z" fill="#fffaf0" stroke="#6b4a22" stroke-width="2"/><rect x="11" y="24" width="18" height="13" rx="2" fill="#1c2b23"/></svg>`;
  box.innerHTML = `
    <div class="in-ctrl">
      <label><span>物価が上がる速さ<b><i data-v="r">2</i>%</b><small>（1 年あたり）</small></span><input type="range" min="0" max="10" step="0.5" value="2" data-k="r"></label>
      <label><span>何年後？<b><i data-v="n">10</i> 年後</b></span><input type="range" min="0" max="30" step="1" value="10" data-k="n"></label>
    </div>
    <div class="in-stage">
      <p class="in-k">1,000 円で買えるおにぎり（今は 1 個 100 円）</p>
      <div class="in-oni" data-o="oni">${Array.from({ length: 10 }, () => `<span>${ONI}</span>`).join('')}</div>
      <div class="in-out">
        <p><span>おにぎり 1 個の値段</span><b data-o="price"></b></p>
        <p><span>1,000 円で買える数</span><b data-o="cnt"></b></p>
        <p><span>今の 1,000 円の「値打ち」</span><b data-o="val"></b></p>
      </div>
    </div>
    <p class="in-note" data-o="note"></p>
    <p class="in-foot">※ 値段も上がる速さも、しくみを見るための「たとえ」です。実際の物価は、ものによって上がり方がちがいます。</p>`;
  const v = k => +box.querySelector(`[data-k="${k}"]`).value;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const draw = () => {
    const r = v('r') / 100, n = v('n');
    box.querySelector('[data-v="r"]').textContent = v('r');
    box.querySelector('[data-v="n"]').textContent = n;
    const f = Math.pow(1 + r, n), price = 100 * f, cnt = Math.floor(1000 / price + 1e-9), val = 1000 / f;
    $('price').innerHTML = `${Math.round(price).toLocaleString('ja-JP')}<small> 円</small>`;
    $('cnt').innerHTML = `${cnt}<small> 個</small>`;
    $('val').innerHTML = `${Math.round(val).toLocaleString('ja-JP')}<small> 円ぶん</small>`;
    $('cnt').className = cnt < 10 ? 'is-down' : '';
    // 買えなくなったおにぎりは、うすくなって消える（端数ぶんは半分の濃さ）
    const left = 1000 / price;
    [...$('oni').children].forEach((s, i) => { s.className = i < Math.floor(left) ? '' : i < left ? 'is-half' : 'is-gone'; });
    const dbl = r > 0 ? Math.round(72 / (r * 100) * 10) / 10 : 0;
    $('note').innerHTML = r === 0 ? '物価が上がらなければ、10 年後も 1,000 円でおにぎり 10 個。お金の「値打ち」は変わりません。'
      : `物価が毎年 <b>${v('r')}%</b> ずつ上がると、値段はおよそ <b>${dbl} 年</b>で 2 倍になります（72 の法則）。お金をそのまま置いておくだけでは、買えるものが少しずつ減っていく。これがインフレです。`;
  };
  box.addEventListener('input', e => { if (e.target.matches('input[type=range]')) draw(); });
  draw();
})();

/* ================================================================
   v352：「実質ジャッジ 40 秒」— タイムマシンで来年へ。買えるものは、ふえた？ へった？
   ・毎回その場で問題をつくる（給料と物価／預金の利子と物価／決まった額のおこづかいと物価）
   ・「買えるものがふえる（得）」か「へる（損）」かを 40 秒で答える。まちがえると 3 秒へる
   ・答えると「給料 +3% − 物価 +5% ＝ 実質 およそ −2%」と、おにぎりの個数の変化が出る
   ・数字はたとえ。実質はおよそ「名目の上がり方 − 物価の上がり方」。自己ベストは azakei_infl_best
   ================================================================ */
(function () {
  const box = document.querySelector('[data-infl]');
  if (!box) return;
  if (!document.querySelector('link[href^="ijgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'ijgame.css?v=20261129b'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_infl_best', TIME = 40, ONI = 150;
  const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pc = n => `${n > 0 ? '+' : n < 0 ? '−' : '±'}${Math.abs(n)}%`;
  const yen = n => `${Math.round(n).toLocaleString('ja-JP')} 円`;
  /* 問題をつくる：{ seal, who, a 名目の変化 %, p 物価の変化 %, base 金額, unit } */
  const make = () => {
    const t = rnd(0, 2);
    let a, p;
    do {
      p = t === 2 ? rnd(-2, 6) : rnd(-1, 6);
      a = t === 0 ? rnd(-1, 6) : t === 1 ? [0, 0, 1, 1, 2, 3][rnd(0, 5)] : 0;
    } while (a === p || (t === 2 && p === 0));
    if (t === 0) return { seal: '給', who: '会社員のお父さん', what: `給料 ${pc(a)}・物価 ${pc(p)}`, line: '月の給料', base: 300000, a, p };
    if (t === 1) return { seal: '預', who: '銀行に 100 万円をあずけている人', what: `預金の利子 年 ${a}%・物価 ${pc(p)}`, line: '預金', base: 1000000, a, p };
    return { seal: '遣', who: '月 3,000 円のおこづかいの中学生', what: `おこづかい そのまま・物価 ${pc(p)}`, line: 'おこづかい', base: 3000, a: 0, p };
  };
  const g = document.createElement('div');
  g.className = 'ij';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="ij-sub"><span aria-hidden="true">験</span>じっくりためす：物価が上がる速さと年数を動かして、おにぎりで見る</p>');
  let st = null, tick = 0;
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="ij-intro">
      <div class="ij-tm" aria-hidden="true"><i></i><b>来年</b></div>
      <div><p class="ij-kicker">スピード勝負</p><h3 class="ij-h">実質ジャッジ 40 秒</h3>
      <p class="ij-p">タイムマシンで 1 年先へ。給料や預金がふえても、物価がもっと上がっていたら、買えるものはへってしまいます。「給料 +3%・物価 +5%」のような変化を見て、その人が<b>買えるものはふえた？ へった？</b> 40 秒で何問ジャッジできるか。</p>
      <p class="ij-best">${b ? `自己ベスト <b>${b}</b> 点` : 'はじめてのタイムマシン'}</p>
      <button type="button" class="ij-go" data-ij="start">タイムマシンに乗る</button></div></div>`;
  };
  const start = () => {
    st = { q: make(), score: 0, streak: 0, ok: 0, miss: [], n: 0, end: performance.now() + TIME * 1000, lock: false, year: 2027 };
    g.innerHTML = `<div class="ij-play">
      <div class="ij-top"><span class="ij-t"><b data-ij="t">${TIME}</b> 秒</span><span class="ij-st" data-ij="st"></span><span class="ij-sc">得点 <b data-ij="sc">0</b></span></div>
      <div class="ij-time" aria-hidden="true"><i data-ij="bar"></i></div>
      <div class="ij-card" data-ij="card"></div>
      <div class="ij-keys"><button type="button" data-ans="1"><b>ふえた</b><small>買えるものがふえる</small></button><button type="button" data-ans="-1"><b>へった</b><small>買えるものがへる</small></button></div>
      <div class="ij-fb" data-ij="fb" aria-live="polite"></div></div>`;
    show();
    clearInterval(tick);
    tick = setInterval(() => {
      const left = Math.max(0, (st.end - performance.now()) / 1000);
      g.querySelector('[data-ij="t"]').textContent = Math.ceil(left);
      const bar = g.querySelector('[data-ij="bar"]'); bar.style.transform = `scaleX(${(left / TIME).toFixed(3)})`; bar.classList.toggle('is-low', left < 10);
      if (left <= 0) finish();
    }, 100);
  };
  const show = () => {
    const q = st.q, el = g.querySelector('[data-ij="card"]');
    el.innerHTML = `<p class="ij-year"><span>${st.year} 年</span><i aria-hidden="true">→</i><b>${st.year + 1} 年</b></p>
      <p class="ij-who"><span aria-hidden="true">${q.seal}</span>${q.who}</p>
      <p class="ij-what">${q.what}</p>`;
    el.classList.remove('is-in', 'is-ok', 'is-ng'); void el.offsetWidth; el.classList.add('is-in');
  };
  const mult = () => 1 + Math.min(st.streak, 8) * 0.25;
  const answer = v => {
    if (!st || st.lock) return;
    const q = st.q, real = q.a - q.p, right = real > 0 ? 1 : -1, ok = v === right;
    const before = Math.floor(q.base / ONI), after = Math.floor(q.base * (1 + q.a / 100) / (ONI * (1 + q.p / 100)));
    const fb = g.querySelector('[data-ij="fb"]'), el = g.querySelector('[data-ij="card"]');
    if (ok) { st.streak++; st.ok++; const pt = Math.round(10 * mult()); st.score += pt; el.classList.add('is-ok'); }
    else { st.streak = 0; st.end -= 3000; st.miss.push(q); el.classList.add('is-ng'); }
    fb.className = `ij-fb ${ok ? 'is-ok' : 'is-ng'}`;
    fb.innerHTML = `<b>${ok ? '正解' : 'ざんねん'}：買えるものは${right > 0 ? 'ふえた' : 'へった'}</b><span>${q.line} ${pc(q.a)} − 物価 ${pc(q.p)} ＝ 実質 およそ ${pc(real)}</span><span class="ij-oni">${q.line}で買えるおにぎり（1 個 ${ONI} 円から）<em>${before.toLocaleString()} 個</em> → <em class="${after > before ? 'is-up' : 'is-dn'}">${after.toLocaleString()} 個</em></span>`;
    g.querySelector('[data-ij="sc"]').textContent = st.score;
    g.querySelector('[data-ij="st"]').textContent = st.streak >= 3 ? `${st.streak} 連続` : '';
    st.lock = true;
    setTimeout(() => { if (!st) return; st.lock = false; st.n++; st.year++; st.q = make(); show(); }, ok ? (reduce ? 0 : 900) : 2000);
  };
  const TITLE = [[300, '実質を見ぬく名人'], [180, '物価に強い人'], [80, 'タイムマシンの見習い'], [0, 'これから見ぬこう']];
  const finish = () => {
    clearInterval(tick);
    const s = st; st = null;
    const prev = getB(), best = s.score > prev;
    if (best) { try { localStorage.setItem(KEY, String(s.score)); } catch (e) {} }
    g.innerHTML = `<div class="ij-end">
      <p class="ij-kicker">タイムマシン到着</p>
      <p class="ij-big"><b>${s.score}</b> 点<small>正解 ${s.ok} 問・まちがい ${s.miss.length} 問・${s.n} 年分の旅</small></p>
      <p class="ij-title"><span aria-hidden="true">称</span>${TITLE.find(t => s.score >= t[0])[1]}${best ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${prev} 点</small>` : ''}</p>
      ${s.miss.length ? `<p class="ij-l">まちがえた問題</p><ul class="ij-miss">${s.miss.slice(0, 6).map(q => `<li><b>${q.who}</b>${q.what}<span>実質 およそ ${pc(q.a - q.p)}：買えるものは${q.a - q.p > 0 ? 'ふえた' : 'へった'}</span></li>`).join('')}</ul>` : ''}
      <div class="ij-rule"><p class="ij-l">覚えておきたいこと</p>
        <p><b>実質 ≒ お金の上がり方 − 物価の上がり方</b></p>
        <ul><li>給料が上がっても、物価がもっと上がれば、買えるものはへる（実質賃金が下がる）</li><li>預金の利子より物価の上がり方が大きいと、あずけているあいだに買う力がへる（実質金利がマイナス）</li><li>金額が決まっているもの（おこづかいなど）は、物価が上がるだけで買えるものがへる。物価が下がる（デフレ）と、ふえる</li></ul></div>
      <button type="button" class="ij-go" data-ij="start">もう一度タイムマシンに乗る</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(g, 'infl', TITLE.findIndex(t => s.score >= t[0]), TITLE.length);
  };
  g.addEventListener('click', e => {
    const k = e.target.closest('[data-ans]'); if (k) { answer(+k.dataset.ans); return; }
    if (e.target.closest('[data-ij="start"]')) start();
  });
  intro();
})();
