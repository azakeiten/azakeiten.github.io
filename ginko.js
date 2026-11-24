/* ================================================================
   ginko.js — 経済ラボ：銀行のふしぎ（あずけたお金が貸し出され、また預金になる＝信用創造）
   ・最初の預金 10,000 円。銀行は「準備率」のぶんを手元に残し、のこりを次の人に貸す
   ・借りた人がお店で使い、お店がそのお金を銀行にあずける……をくり返す
   ・預金の合計は 10,000 ÷ 準備率 に近づいていく。準備率や流れは、しくみを見るための「たとえ」
   ================================================================ */
(function() {
  const box = document.querySelector('[data-ginko]');
  if (!box) return;
  const KEY = 'azakei_ginko', FIRST = 10000, N = 12;
  const WHO = ['あなた', 'パン屋さん', '文房具店', '本屋さん', '花屋さん', '八百屋さん', 'カフェ', '自転車店', '電器店', 'くつ屋さん', 'おもちゃ屋さん', '魚屋さん', '時計店'];
  const yen = n => Math.round(n).toLocaleString('ja-JP') + ' 円';
  const narrow = innerWidth < 560, W = narrow ? 420 : 720, H = narrow ? 230 : 190, BW = W / N;
  box.innerHTML = `
    <div class="gk-top">
      <div class="gk-rates" role="group" aria-label="銀行が手元に残す割合（準備率）"><span>銀行が手元に残す割合<small>（準備率）</small></span>
        ${[10, 20, 50].map(v => `<button type="button" data-r="${v}" aria-pressed="${v === 10}">${v}%</button>`).join('')}</div>
      <div class="gk-total"><small>みんなの預金の合計</small><b data-o="total">${yen(0)}</b><span data-o="times">最初の 0 倍</span></div>
    </div>
    <div class="gk-meter" aria-hidden="true"><i data-o="fill"></i></div>
    <p class="gk-cap" data-o="cap"></p>
    <svg class="gk-chart" viewBox="0 -24 ${W} ${H + 50}" role="img" aria-label="人ごとの預金と、貸し出しの流れ">
      <g data-o="bars"></g>
    </svg>
    <p class="gk-legend"><span><i class="is-keep"></i>銀行が手元に残す</span><span><i class="is-lend"></i>次の人に貸す</span></p>
    <p class="gk-say" data-o="say" aria-live="polite">まずは、あなたが <b>10,000 円</b>を銀行にあずけます。ボタンを押して、お金の旅をはじめよう。</p>
    <div class="gk-btns"><button type="button" class="btn-primary" data-a="step">あずける →</button><button type="button" class="gk-sub" data-a="all">最後まで一気に</button><button type="button" class="gk-sub" data-a="reset">はじめから</button></div>
    <p class="gk-note" data-o="note" hidden></p>
    <p class="in-foot">※ 準備率やお金の流れは、しくみを見るための「たとえ」です。実際には、借りたお金がぜんぶ銀行にもどるとはかぎりません。</p>`;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('is-lite');
  let r = .1, k = 0, total = 0, shown = 0, raf, timer;
  const dep = i => FIRST * Math.pow(1 - r, i);
  const countTo = to => {
    cancelAnimationFrame(raf);
    const from = shown, t0 = performance.now(), dur = reduce ? 0 : 500;
    const f = now => {
      const p = dur ? Math.min(1, (now - t0) / dur) : 1;
      shown = from + (to - from) * (1 - Math.pow(1 - p, 3));
      $('total').textContent = yen(shown);
      $('times').textContent = `最初の ${(shown / FIRST).toFixed(1)} 倍`;
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
  };
  const bar = i => {
    const d = dep(i), keep = d * r, h = d / FIRST * H, hk = keep / FIRST * H, x = i * BW + 6, w = BW - 12;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'gk-bar'); g.style.setProperty('--d', '0ms');
    g.innerHTML = `<rect x="${x}" y="${H - h}" width="${w}" height="${h - hk}" rx="4" class="gk-lend"/><rect x="${x}" y="${H - hk}" width="${w}" height="${hk}" class="gk-keep"/>`
      + (i < N - 1 ? `<path d="M${x + w - 4} ${H - h + 4} q ${BW * .3} -16 ${BW * .55} ${(d - dep(i + 1)) / FIRST * H}" class="gk-arrow"/>` : '')
      + `<text x="${x + w / 2}" y="${H + 16}" text-anchor="middle" class="gk-who">${i + 1}</text>`
      + `<text x="${x + w / 2}" y="${H - h - 5}" text-anchor="middle" class="gk-amt">${d >= 9950 ? "1万" : d >= 1000 ? (d / 1000).toFixed(1) + '千' : Math.round(d)}</text>`;
    $('bars').appendChild(g);
  };
  const paintCap = () => {
    const cap = FIRST / r;
    $('cap').textContent = `どこまで続けても、${yen(FIRST)} ÷ ${Math.round(r * 100)}% ＝ ${yen(cap)} まで`;
    $('fill').style.width = (total / cap * 100) + '%';
  };
  const reset = () => {
    clearTimeout(timer); k = 0; total = 0; $('bars').innerHTML = ''; countTo(0); paintCap();
    $('say').innerHTML = 'まずは、あなたが <b>10,000 円</b>を銀行にあずけます。ボタンを押して、お金の旅をはじめよう。';
    $('note').hidden = true; box.querySelector('[data-a="step"]').textContent = 'あずける →'; box.querySelector('[data-a="step"]').disabled = false;
    box.classList.remove('is-done');
  };
  const step = () => {
    if (k >= N) return;
    const d = dep(k), lend = d * (1 - r);
    bar(k); total += d; countTo(total); paintCap();
    $('say').innerHTML = k === 0
      ? `あなたが <b>${yen(d)}</b> をあずけた。銀行は <b>${yen(d * r)}</b> を手元に残し、<b>${yen(lend)}</b> を${WHO[1]}に貸します。`
      : `${WHO[k]}が借りたお金でお店から買い物 → お店が <b>${yen(d)}</b> を銀行にあずけた。銀行はまた <b>${yen(lend)}</b> を貸します。`;
    k++;
    box.querySelector('[data-a="step"]').textContent = '次の人へ →';
    if (k >= N) finish();
  };
  const finish = () => {
    const cap = FIRST / r;
    box.querySelector('[data-a="step"]').disabled = true;
    box.classList.add('is-done');
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    $('note').hidden = false;
    $('note').innerHTML = `お札は最初の <b>${yen(FIRST)}</b> しかないのに、<b>預金の数字</b>は ${N} 人で <b>${yen(total)}</b>（${(total / FIRST).toFixed(1)} 倍）に。ずっと続けると <b>${yen(cap)}</b> に近づきます。銀行が貸し出しをくり返すことで、世の中の預金が何倍にもふえる。これが<b>信用創造</b>です。<br>手元に残す割合を大きくすると、どうなる？ 上の「${r === .5 ? '10' : '50'}%」でためしてみよう。`;
  };
  box.addEventListener('click', e => {
    const rb = e.target.closest('[data-r]');
    if (rb) { r = rb.dataset.r / 100; box.querySelectorAll('[data-r]').forEach(b => b.setAttribute('aria-pressed', b === rb)); reset(); return; }
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'step') step();
    else if (a.dataset.a === 'reset') reset();
    else if (a.dataset.a === 'all') {
      clearTimeout(timer);
      const go = () => { if (k < N) { step(); timer = setTimeout(go, reduce ? 0 : 160); } };
      go();
    }
  });
  reset();
})();

/* ================================================================
   v347：「まちの銀行 6 年」— 銀行の店長になって、預金をあずかり、町の人に貸す
   ・1 ターン＝1 年。毎年 3 人がお金を借りに来る。貸すかどうかを 1 人ずつ決める（貸すと金庫の現金がへる）
   ・年のとちゅうで、預金を引き出しに来る人がいる。金庫の現金が足りないと、日本銀行から高い利子で借りることに
   ・貸したお金の半分は、町で使われて、また預金として銀行にもどってくる（信用創造）
   ・年の終わりに、借りた人が利子をつけて返す。でも、ときどき返せない人もいる（貸し倒れ）
   ・金額は「万円」。利子・返せない確率・引き出しの量は、しくみを見るための「たとえ」
   ・自己ベスト（6 年のもうけ）は azakei_bank_best
   ================================================================ */
(function () {
  const box = document.querySelector('[data-ginko]');
  if (!box) return;
  if (!document.querySelector('link[href^="bkgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'bkgame.css?v=20261124e'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_bank_best', YEARS = 6, DEP_RATE = 0.005;
  const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const man = n => `${Math.round(n).toLocaleString('ja-JP')} 万円`;
  const sman = n => `${n >= 0 ? '＋' : '−'}${Math.abs(Math.round(n)).toLocaleString('ja-JP')} 万円`;
  /* 借りに来る人 [一字, だれ, 何に使う, 金額（万円）, 年の利子（%）, 返せない確率（%）, 銀行が調べてわかったこと] */
  const POOL = [
    ['麺', '老舗のそば屋さん', '店の屋根の修理', 150, 2, 1, '50 年続くお店。毎年きちんと返してきた'],
    ['麺', 'できたばかりのラーメン屋', '2 号店を出したい', 300, 9, 18, '1 号店は行列。でも開店してまだ半年'],
    ['工', '町の部品工場', '新しい機械を買う', 400, 3, 2, '大きな会社から毎年注文がある'],
    ['花', '花屋さん', '冷蔵ケースを買う', 100, 4, 3, '売上は安定。母の日がいちばん忙しい'],
    ['農', 'いちご農家', 'ビニールハウスをふやす', 250, 4, 4, '天気に左右されるが、毎年ほぼ予定どおり'],
    ['券', 'ゲーム会社の社長', '大ヒット予定の新作', 400, 12, 30, '「絶対売れる」と言うが、前の 2 作は売れなかった'],
    ['宿', '駅前のホテル', '部屋を新しくする', 350, 3, 3, '観光客がふえていて、部屋はいつも満室に近い'],
    ['車', '自転車屋さん', '電動自転車をたくさん仕入れる', 120, 5, 5, '若い店長。売上はのびているが、まだ 3 年目'],
    ['家', '会社員の家族', '家のリフォーム', 200, 2, 1, '同じ会社に 20 年。給料から毎月返す計画'],
    ['薬', '薬局', 'となり町に新しい店', 300, 4, 4, '地域の病院のとなり。お客さんは多い'],
    ['菓', 'ケーキ屋さん', '有名店の味をまねた新商品', 180, 8, 15, '材料費が上がっていて、最近は赤字の月もある'],
    ['宝', '「必ずもうかる」投資の会', '集めたお金で投資する', 400, 15, 45, '説明があいまいで、会社の住所もよくわからない'],
    ['書', '本屋さん', 'カフェをつくる', 150, 5, 6, '本の売上はへっているが、カフェの計画はしっかりしている'],
    ['工', '町工場の 2 代目', 'ロボットを入れる', 280, 4, 3, '人手不足を、機械でおぎなう計画'],
    ['店', 'コンビニの店長', '店の改装', 160, 3, 2, 'チェーン店で、本部の計画もある'],
    ['魚', '魚屋さん', '冷凍車を買う', 140, 6, 8, '遠くのお店にも売りに行きたい。はじめての挑戦']
  ];
  const YEAR = [
    ['ふつうの年', '大きなできごとはありませんでした。', 1, 1],
    ['ボーナスが多い年', '会社のもうけがふえて、町の人の預金がふえました。', 0.4, 1],
    ['景気が悪い年', 'お店のお客さんがへって、返せない人がふえそうです。', 1.2, 1.8],
    ['年末に引き出しが多い年', 'お正月の準備で、たくさんの人が預金を引き出します。', 1.8, 1],
    ['ふつうの年', '大きなできごとはありませんでした。', 1, 1],
    ['景気がよい年', '町がにぎわって、返せない人はへりそうです。', 0.8, 0.6]
  ];
  const g = document.createElement('div');
  g.className = 'bk';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="bk-sub"><span aria-hidden="true">験</span>じっくりためす：1 万円が旅をすると、預金はいくらに？（信用創造）</p>');
  let S = null;
  const rnd = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="bk-intro">
      <div class="bk-vault" aria-hidden="true"><i></i><b>銀</b></div>
      <div><p class="bk-kicker">経営ゲーム</p><h3 class="bk-h">まちの銀行 6 年</h3>
      <p class="bk-p">あなたは町の銀行の店長。町の人から 1,000 万円をあずかっています。毎年、3 人がお金を借りに来ます。貸せば、1 年後に利子がもうけになる。でも、返せない人もいるし、金庫の現金がへりすぎると、預金を引き出しに来た人に払えなくなります。</p>
      <ul class="bk-rule"><li><b>もうけ</b>　貸したお金の利子 − 預金の利子 − 返してもらえなかったお金</li><li><b>金庫</b>　足りなくなったら日本銀行から高い利子で借りる（信用も下がる）</li><li><b>信用創造</b>　貸したお金の半分は、町で使われて預金にもどる</li><li><b>担保</b>　返せなくなっても、あずかった物を売って 4 分の 3 は取りもどせる（あやしい相手はべつ）</li></ul>
      <p class="bk-best">${b ? `自己ベスト <b>${sman(b)}</b>` : 'はじめての開店'}</p>
      <button type="button" class="bk-go" data-bk="start">銀行をひらく</button></div></div>`;
  };
  const start = () => {
    S = { y: 0, dep: 1000, cash: 1000, loans: [], profit: 0, boj: 0, bad: 0, trust: 3, pool: shuffle(POOL.map((_, i) => i)), log: [] };
    year();
  };
  /* 金庫のメーター（預金に対する現金の割合） */
  const meter = () => {
    const r = S.cash / Math.max(1, S.dep), pct = Math.max(0, Math.min(100, r * 100));
    const lent = S.loans.reduce((a, l) => a + l.amt, 0);
    return `<div class="bk-stat">
      <div><small>みんなの預金</small><b>${man(S.dep)}</b></div>
      <div><small>金庫の現金</small><b class="${r < 0.15 ? 'is-ng' : ''}">${man(S.cash)}</b></div>
      <div><small>貸しているお金</small><b>${man(lent)}</b></div>
      <div><small>もうけの合計</small><b class="${S.profit < 0 ? 'is-ng' : 'is-ok'}">${sman(S.profit)}</b></div>
    </div>
    <div class="bk-meter" aria-hidden="true"><i style="width:${pct.toFixed(1)}%" class="${r < 0.15 ? 'is-ng' : r < 0.3 ? 'is-mid' : ''}"></i><span style="left:15%">あぶない</span></div>
    <p class="bk-mcap">預金に対する金庫の現金 <b>${Math.round(r * 100)}%</b>　信用 ${'★★★'.slice(0, S.trust)}${'☆☆☆'.slice(0, 3 - S.trust)}</p>`;
  };
  const year = () => {
    if (S.y >= YEARS) return finish();
    if (S.pool.length < 3) S.pool = S.pool.concat(shuffle(POOL.map((_, i) => i)).filter(i => !S.pool.includes(i)));
    S.apps = S.pool.splice(0, 3).map(i => POOL[i]); S.k = 0; S.dec = [];
    S.ev = YEAR[S.y];
    app();
  };
  const app = () => {
    const a = S.apps[S.k], ev = S.ev;
    g.innerHTML = `<div class="bk-play">
      <div class="bk-top"><span class="bk-n">${S.y + 1} 年目 / ${YEARS}</span><span class="bk-ev">${ev[0]}</span><span class="bk-k">${S.k + 1} / 3 人目</span></div>
      ${meter()}
      <div class="bk-app">
        <span class="bk-seal" aria-hidden="true">${a[0]}</span>
        <div class="bk-who"><b>${a[1]}</b><small>${a[2]}</small></div>
        <dl class="bk-terms"><div><dt>借りたい額</dt><dd>${man(a[3])}</dd></div><div><dt>年の利子</dt><dd>${a[4]}%（1 年で ${man(a[3] * a[4] / 100)}）</dd></div></dl>
        <p class="bk-check"><span>調べてわかったこと</span>${a[6]}</p>
        <div class="bk-btns"><button type="button" class="bk-yes" data-lend="1"${S.cash < a[3] ? ' disabled' : ''}>${S.cash < a[3] ? '金庫の現金が足りない' : '貸す'}</button><button type="button" class="bk-no" data-lend="0">ことわる</button></div>
      </div></div>`;
  };
  const lend = yes => {
    const a = S.apps[S.k];
    if (yes && S.cash >= a[3]) { S.cash -= a[3]; S.loans.push({ a, amt: a[3] }); S.dec.push([a, 1]); }
    else S.dec.push([a, 0]);
    S.k++;
    if (S.k < 3) app(); else run();
  };
  /* 1 年が進む：信用創造 → 引き出し（足りなければ日本銀行）→ 返済・貸し倒れ → 預金の利子 */
  const run = () => {
    const ev = S.ev, lines = [];
    const newLoans = S.loans.reduce((a, l) => a + l.amt, 0);
    const back = Math.round(newLoans * 0.5);
    if (back) { S.dep += back; S.cash += back; lines.push(['巡', `貸したお金のうち ${man(back)} が、町で使われて、お店の人の預金としてもどってきた`, 0]); }
    let wd = Math.round(S.dep * (0.06 + Math.random() * 0.1) * ev[2]);
    if (ev[2] < 1) { const plus = Math.round(S.dep * 0.08); S.dep += plus; S.cash += plus; lines.push(['貯', `ボーナスで、預金が ${man(plus)} ふえた`, 0]); }
    const ratio = S.cash / S.dep;
    if (ratio < 0.12) { const run2 = Math.round(S.dep * 0.15); wd += run2; lines.push(['噂', '「あの銀行、現金が少ないらしい」とうわさが広がり、引き出しがふえた', 0]); }
    S.dep -= wd;
    if (S.cash >= wd) { S.cash -= wd; lines.push(['引', `預金の引き出し ${man(wd)}。金庫から払えた`, 0]); }
    else {
      const short = wd - S.cash; S.cash = 0; const cost = Math.round(short * 0.1);
      S.boj++; S.trust = Math.max(0, S.trust - 1); S.profit -= cost;
      lines.push(['日', `預金の引き出し ${man(wd)}。金庫が ${man(short)} 足りず、日本銀行から借りた（利子 ${man(cost)}）`, -cost]);
    }
    let inc = 0, loss = 0;
    S.loans.forEach(l => {
      const p = l.a[5] / 100 * ev[3];
      if (Math.random() < p) { const rec = l.a[0] === '宝' ? 0 : Math.round(l.amt * 0.75); loss += l.amt - rec; S.cash += rec; S.bad++; lines.push(['倒', `${l.a[1]}は、返せなくなった。${rec ? `担保（借りるときにあずかった物）を売って ${man(rec)} は取りもどしたが、${man(l.amt - rec)} は損に` : `お金を集めた人はいなくなり、${man(l.amt)} が全部もどらない`}`, -(l.amt - rec)]); }
      else { const it = l.amt * l.a[4] / 100; inc += it; S.cash += l.amt + it; lines.push(['返', `${l.a[1]}が、${man(l.amt)} と利子 ${man(it)} を返した`, it]); }
    });
    const di = Math.round(S.dep * DEP_RATE);
    S.dep += di;
    lines.push(['利', `預金をあずけている人に、利子 ${man(di)} を払った（預金にたす）`, -di]);
    const yp = inc - loss - di + lines.filter(x => x[0] === '日').reduce((a, x) => a + x[2], 0);
    S.profit += inc - loss - di;
    S.log.push({ y: S.y + 1, ev: ev[0], lent: newLoans, yp: Math.round(yp) });
    S.loans = [];
    g.innerHTML = `<div class="bk-play">
      <div class="bk-top"><span class="bk-n">${S.y + 1} 年目の終わり</span><span class="bk-ev">${ev[0]}</span></div>
      <p class="bk-evd">${ev[1]}</p>
      <ol class="bk-lines">${lines.map((x, i) => `<li style="--d:${i * (reduce ? 0 : 0.35)}s" class="${x[2] > 0 ? 'is-ok' : x[2] < 0 ? 'is-ng' : ''}"><span aria-hidden="true">${x[0]}</span><p>${x[1]}</p></li>`).join('')}</ol>
      <p class="bk-yp">この年のもうけ <b class="${yp < 0 ? 'is-ng' : 'is-ok'}">${sman(yp)}</b></p>
      ${meter()}
      <button type="button" class="bk-go" data-bk="next">${S.y + 1 < YEARS ? `${S.y + 2} 年目へ` : '6 年の結果を見る'}</button></div>`;
    S.y++;
  };
  const TITLE = [[70, '町いちばんの銀行家'], [45, 'たよれる銀行の店長'], [15, '一人前の銀行員'], [-1e9, '見習い銀行員']];
  const finish = () => {
    const prev = getB(), p = Math.round(S.profit), best = !prev || p > prev;
    if (best) { try { localStorage.setItem(KEY, String(p || 1)); localStorage.setItem('azakei_ginko', '1'); } catch (e) {} }
    g.innerHTML = `<div class="bk-end">
      <p class="bk-kicker">6 年の決算</p>
      <p class="bk-big"><small>6 年のもうけ</small><b class="${p < 0 ? 'is-ng' : ''}">${sman(p)}</b></p>
      <p class="bk-title"><span aria-hidden="true">称</span>${TITLE.find(x => p >= x[0])[1]}${best && prev ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${sman(prev)}</small>` : ''}</p>
      <p class="bk-sum">貸し倒れ ${S.bad} 件・日本銀行から借りた回数 ${S.boj} 回・信用 ${'★★★'.slice(0, S.trust)}${'☆☆☆'.slice(0, 3 - S.trust)}</p>
      <table class="bk-tab"><thead><tr><th>年</th><th>できごと</th><th>貸した額</th><th>もうけ</th></tr></thead><tbody>${S.log.map(x => `<tr><th>${x.y}</th><td>${x.ev}</td><td>${man(x.lent)}</td><td class="${x.yp < 0 ? 'is-ng' : ''}">${sman(x.yp)}</td></tr>`).join('')}</tbody></table>
      <div class="bk-learn"><p><b>銀行のもうけは、貸すときの利子と、預金につける利子の差。</b>でも、利子が高いのは、たいてい返せない心配が大きい相手です。「必ずもうかる」と言う相手ほど、気をつけます。</p>
      <p>銀行は、あずかったお金を全部金庫に置いておくわけではありません。だから、みんなが一度に引き出しに来ると困ります。そんなときに銀行にお金を貸すのが日本銀行で、「銀行の銀行」とよばれます。また、銀行がつぶれても、預金は 1 人 1,000 万円とその利子までは守られるしくみ（預金保険）があります。</p></div>
      <button type="button" class="bk-go" data-bk="start">もう一度銀行をひらく</button></div>`;
  };
  g.addEventListener('click', e => {
    const l = e.target.closest('[data-lend]'); if (l && !l.disabled) { lend(l.dataset.lend === '1'); return; }
    const a = e.target.closest('[data-bk]'); if (!a) return;
    if (a.dataset.bk === 'start') start(); else if (a.dataset.bk === 'next') { year(); if (g.getBoundingClientRect().top < 0) g.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); }
  });
  intro();
})();
