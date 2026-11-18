/* ================================================================
   jika.js — あそび場：チケットの値段は時価（近づいてから読みこむ）
   ・遊園地の 1 週間。1 日に入れるのは 1,000 人まで。曜日と天気で、来たい人の数がちがう
   ・「毎日同じ値段」か「曜日で変える（ダイナミックプライシング）」をえらび、値段を決めて 1 週間営業する
   ・1 日ずつ、入った人（点）と、入れなかった人（列の外の赤い点）が出る。売上・空いた席・お客さんの声
   ・いちばんよい「同じ値段」と「曜日で変える値段」をくらべ、点数をつける
   ・来たい人の数・値段はすべてたとえ。見た目は jika.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-jika]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="jika.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'jika.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const yen = n => Math.round(n).toLocaleString() + ' 円';
  const man = n => (Math.round(n / 1000) / 10).toLocaleString() + ' 万円';
  const CAP = 1000, STEP = 500, MIN = 1000, MAX = 9000;
  // 曜日・天気・来たい人の数（値段 0 円のとき）・この値段なら誰も来ない、の目安（すべてたとえ）
  const DAYS = [['月', '晴', 700, 5000], ['火', '晴', 650, 5000], ['水', '雨', 420, 4500], ['木', '曇', 800, 5500], ['金', '晴', 1300, 7000], ['土', '晴', 2600, 9000], ['日', '晴', 2200, 8500]];
  const want = (d, p) => Math.max(0, Math.round(DAYS[d][2] * (1 - p / DAYS[d][3])));
  const day = (d, p) => { const w = want(d, p), in_ = Math.min(CAP, w); return { w, in: in_, out: w - in_, sales: in_ * p, empty: CAP - in_ }; };
  const week = ps => ps.map((p, d) => day(d, p));
  const sum = (r, k) => r.reduce((a, x) => a + x[k], 0);
  const grid = []; for (let p = MIN; p <= MAX; p += STEP) grid.push(p);
  // いちばんよい値段（同じ値段・曜日ごと）
  const bestFixed = grid.reduce((b, p) => { const s = sum(week(DAYS.map(() => p)), 'sales'); return s > b.s ? { p, s } : b; }, { p: 0, s: -1 });
  const bestDyn = DAYS.map((_, d) => grid.reduce((b, p) => { const s = day(d, p).sales; return s > b.s ? { p, s } : b; }, { p: 0, s: -1 }));
  const bestDynSales = bestDyn.reduce((a, b) => a + b.s, 0);
  let mode = 'fixed', fixed = 4000, prices = DAYS.map(() => 4000), busy = false;

  box.innerHTML = `
    <div class="jk-park">
      <div class="jk-gate"><span class="jk-seal" aria-hidden="true">遊</span><div><p class="jk-name">あさぶ遊園地</p><p class="jk-cap">1 日に入れるのは <b>1,000 人</b> まで</p></div><p class="jk-total"><small>1 週間の売上</small><b data-k="total">0 円</b></p></div>
      <ol class="jk-week">${DAYS.map(([w, sky], d) => `
        <li class="jk-day${d >= 5 ? ' is-end' : ''}" data-d="${d}">
          <p class="jk-dh"><b>${w}</b><span class="jk-sky is-${sky === '晴' ? 'sun' : sky === '雨' ? 'rain' : 'cloud'}">${sky}</span></p>
          <p class="jk-tag" data-k="tag${d}">4,000 円</p>
          <div class="jk-dots" aria-hidden="true">${'<i></i>'.repeat(50)}</div>
          <div class="jk-line" aria-hidden="true"></div>
          <p class="jk-num"><b data-k="in${d}">–</b><small>人</small></p>
          <p class="jk-sales" data-k="sales${d}"></p>
        </li>`).join('')}
      </ol>
      <p class="jk-legend"><span><i class="is-in"></i>入った人（点 1 つで 20 人）</span><span><i class="is-out"></i>満員で入れなかった人</span><span><i class="is-empty"></i>空いた席</span></p>
      <p class="jk-msg" data-k="msg" aria-live="polite">値段のつけ方と値段を決めて、「1 週間 営業する」を押そう。天気の予報も見てね。</p>
    </div>
    <div class="jk-side">
      <div class="jk-mode" role="radiogroup" aria-label="値段のつけ方">
        <button type="button" role="radio" data-m="fixed" aria-checked="true"><b>毎日同じ値段</b><small>わかりやすい</small></button>
        <button type="button" role="radio" data-m="dyn" aria-checked="false"><b>曜日で変える</b><small>ダイナミックプライシング</small></button>
      </div>
      <label class="jk-sl jk-fixed"><span>毎日の値段</span><output data-k="fixed">4,000 円</output><input type="range" min="${MIN}" max="${MAX}" step="${STEP}" value="4000" data-s="fixed"></label>
      <div class="jk-dyn" hidden>${DAYS.map(([w], d) => `<label class="jk-row"><b>${w}</b><input type="range" min="${MIN}" max="${MAX}" step="${STEP}" value="4000" data-s="${d}" aria-label="${w}曜日の値段"><output data-k="p${d}">4,000 円</output></label>`).join('')}</div>
      <button type="button" class="jk-go" data-a="go">1 週間 営業する</button>
      <div class="jk-res" hidden></div>
    </div>
    <div class="jk-learn">
      <p><b>ダイナミックプライシング</b>混みそうな日は高く、すいていそうな日は安く。来たい人の数に合わせて値段を変えるやり方です。ホテルや飛行機、テーマパーク、スポーツ観戦のチケットなどで使われています。</p>
      <p><b>安すぎても、高すぎても損</b>土曜に安すぎると、満員で入れない人があふれ、もっと払ってもいい人の分を取りのがします。平日に高すぎると、席が空いたままです（<a href="glossary.html#supply-demand">需要と供給</a>）。</p>
      <p><b>空いた席は、取りもどせない</b>今日の空席は、明日に回せません。売れなかった席の分だけ、得られたはずのお金を失っています（<a href="glossary.html#opportunity-cost">機会費用</a>）。</p>
      <p><b>公平さも大切</b>値段を大きく変えすぎると「ずるい」「高すぎる」と感じる人も。もうけだけでなく、お客さんの気持ちや、平日に来やすくなるよさも考えよう。</p>
    </div>
    <p class="jk-note">来たい人の数・値段・天気は、しくみを知るための「たとえ」です。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const cards = [...box.querySelectorAll('.jk-day')];
  const cur = () => mode === 'fixed' ? DAYS.map(() => fixed) : prices.slice();
  const tags = () => { const ps = cur(); ps.forEach((p, d) => { K('tag' + d).textContent = yen(p); }); K('fixed').textContent = yen(fixed); prices.forEach((p, d) => { K('p' + d).textContent = yen(p); }); };
  const clear = () => {
    cards.forEach((c, d) => { c.className = 'jk-day' + (d >= 5 ? ' is-end' : ''); c.querySelectorAll('.jk-dots i').forEach(i => { i.className = ''; }); c.querySelector('.jk-line').innerHTML = ''; K('in' + d).textContent = '–'; K('sales' + d).textContent = ''; });
    K('total').textContent = '0 円'; box.querySelector('.jk-res').hidden = true;
  };
  const voices = (r, ps) => {
    const v = [], mx = Math.max(...ps), mn = Math.min(...ps), out = sum(r, 'out'), empty = sum(r, 'empty');
    if (out >= 300) v.push(['怒', `満員で入れなかった…（${out.toLocaleString()} 人）`]);
    if (empty >= 1500) v.push(['空', `平日はがらがら。乗り物が待ち時間なしだった（空いた席 ${empty.toLocaleString()}）`]);
    if (mx >= mn * 2.5) v.push(['高', '土日だけ高すぎない？ ちょっとずるい気がする']);
    if (mode === 'dyn' && mx < mn * 2.5 && mx > mn) v.push(['得', '平日に来たら安かった！ 混んでなくて最高']);
    if (!v.length) v.push(['良', 'ちょうどいい混み具合で、楽しかった']);
    return v;
  };
  const run = async () => {
    if (busy) return; busy = true; box.classList.add('is-busy'); clear();
    const ps = cur(), r = week(ps); let tot = 0;
    for (let d = 0; d < 7; d++) {
      const c = cards[d], x = r[d], dots = c.querySelectorAll('.jk-dots i'), n = Math.round(x.in / 20);
      c.classList.add('is-on');
      K('msg').textContent = `${DAYS[d][0]}曜日（${DAYS[d][1]}）：${yen(ps[d])} で、来たい人は ${x.w.toLocaleString()} 人。`;
      for (let k = 0; k < 50; k++) { if (k < n) { dots[k].className = 'is-in'; if (!reduce && k % 5 === 4) await sleep(16); } else dots[k].className = 'is-empty'; }
      if (x.out) { const m = Math.min(40, Math.ceil(x.out / 20)); c.querySelector('.jk-line').innerHTML = '<i></i>'.repeat(m) + (x.out / 20 > 40 ? '<b>…</b>' : ''); c.classList.add('is-full'); }
      if (x.in < 400) c.classList.add('is-low');
      K('in' + d).textContent = x.in.toLocaleString(); K('sales' + d).textContent = man(x.sales);
      tot += x.sales; K('total').textContent = yen(tot);
      await sleep(380);
    }
    const S = sum(r, 'sales'), score = Math.round(S / bestDynSales * 100);
    const rank = score >= 97 ? ['極', '名支配人'] : score >= 90 ? ['上', 'やり手の支配人'] : score >= 75 ? ['中', '見習い支配人'] : ['初', 'これから'];
    K('msg').textContent = `1 週間で ${yen(S)}。来た人 ${sum(r, 'in').toLocaleString()} 人、入れなかった人 ${sum(r, 'out').toLocaleString()} 人、空いた席 ${sum(r, 'empty').toLocaleString()}。`;
    const res = box.querySelector('.jk-res');
    res.innerHTML = `<div class="jk-r-top"><span class="jk-r-seal" aria-hidden="true">${rank[0]}</span><div><p class="jk-r-h">${rank[1]}<small>${score} 点</small></p><p class="jk-r-s">いちばんよい売り方の ${score}% の売上</p></div></div>
      <ul class="jk-r-cmp">
        <li${mode === 'fixed' ? ' class="is-me"' : ''}><small>いちばんよい「毎日同じ値段」</small><b>${yen(bestFixed.p)}</b><span>${man(bestFixed.s)}</span></li>
        <li${mode === 'dyn' ? ' class="is-me"' : ''}><small>いちばんよい「曜日で変える」</small><b>${bestDyn.map((b, d) => `${DAYS[d][0]} ${(b.p / 1000).toFixed(1)}`).join('・')}<i>千円</i></b><span>${man(bestDynSales)}</span></li>
      </ul>
      <ul class="jk-r-voice">${voices(r, ps).map(([s, t]) => `<li><span aria-hidden="true">${s}</span>${t}</li>`).join('')}</ul>
      <p class="jk-r-tip">${mode === 'fixed' ? '「曜日で変える」にすると、土日は高く・平日は安くできます。どこまで変えるか、ためしてみよう。' : score >= 97 ? 'みごと！ でも、値段の差が大きいほど不満も出やすい。もうけと公平さのバランスも考えてみよう。' : '満員で入れなかった日は値段を上げ、空いた日は下げてみよう。雨の水曜にも注目。'}</p>`;
    res.hidden = false;
    busy = false; box.classList.remove('is-busy');
    try { const b = +localStorage.getItem('azakei_jika') || 0; if (score > b) localStorage.setItem('azakei_jika', String(score)); } catch (e) {}
  };
  box.addEventListener('click', e => {
    const m = e.target.closest('[data-m]');
    if (m && !busy) {
      mode = m.dataset.m;
      box.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-checked', b === m));
      box.querySelector('.jk-fixed').hidden = mode !== 'fixed'; box.querySelector('.jk-dyn').hidden = mode !== 'dyn';
      if (mode === 'dyn') { prices = DAYS.map(() => fixed); box.querySelectorAll('.jk-dyn input').forEach(i => { i.value = fixed; }); }
      tags(); clear(); return;
    }
    if (e.target.closest('[data-a="go"]')) run();
  });
  box.addEventListener('input', e => {
    const s = e.target.closest('[data-s]'); if (!s || busy) return;
    if (s.dataset.s === 'fixed') fixed = +s.value; else prices[+s.dataset.s] = +s.value;
    tags(); clear();
  });
  tags();
})();
