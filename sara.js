/* ================================================================
   sara.js — あそび場：何皿で、ごちそうさま？（限界効用逓減・回転ずし・近づいてから読みこむ）
   ・回転ずしで、1 皿ずつ「取って食べる」か「ごちそうさま」かを決める。3 つのお店（ルール）で遊ぶ
   ・1 皿目はとてもうれしいが、食べるほど 1 皿のうれしさ（円にするといくら分か）は小さくなる（限界効用逓減）
   ・得点＝うれしさの合計 − 払ったお金。1 皿ごとの店では「次の 1 皿のうれしさ」が値段より小さくなったら止めるのがいちばん
   ・食べ放題では、もう払ったお金は関係なし。うれしさが 0 より大きいあいだ食べるのがいちばん（食べすぎはマイナス）
   ・値段とうれしさはすべてたとえ。お店の名前は架空。自己ベストは azakei_sara（3 店の合計・円）。見た目は sara.css
   ================================================================ */
(function () {
  const box = document.querySelector('[data-sara]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="sara.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'sara.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_sara';
  const NETA = [['まぐろ', '鮪', '#c9483b'], ['サーモン', '鮭', '#ee8a4f'], ['たまご', '玉', '#f2c84b'], ['えび', '海', '#e86f5d'], ['いか', '烏', '#e9e4da'], ['ねぎとろ', '葱', '#d36b84'], ['かっぱ巻き', '胡', '#5c9a5a']];
  // [お店, 印, 説明, 1 皿の値段, 入店料, うれしさの列（円分）]
  const SHOP = [
    { name: 'くるくる寿司', seal: '一', how: '1 皿 130 円。食べた分だけ払うお店。', price: 130, fee: 0, joy: [320, 260, 210, 170, 140, 110, 85, 60, 40, 20, 5, -15, -35, -60] },
    { name: '食べ放題の寿司ひろば', seal: '放', how: '入るときに 1,200 円。あとは何皿食べても 0 円。', price: 0, fee: 1200, joy: [320, 260, 210, 170, 140, 110, 85, 60, 40, 20, 5, -15, -35, -60] },
    { name: '大好きなネタの日', seal: '好', how: '大好きなネタだけが流れてくる。1 皿 200 円。', price: 200, fee: 0, joy: [480, 380, 300, 240, 190, 140, 95, 55, 20, -10, -40, -70] }
  ];
  const yen = n => `${n < 0 ? '−' : ''}${Math.abs(Math.round(n)).toLocaleString()} 円`;
  let r = 0, total = 0, st = null, results = [];
  const best = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  // 少しだけ、ゆらぎをつける（毎回まったく同じにならないように）
  const makeJoy = a => a.map(v => Math.round(v * (0.94 + Math.random() * 0.12) / 5) * 5);
  const optimal = s => { let n = 0, sum = 0; for (const j of s.joyR) { if (j > s.price) { n++; sum += j; } else break; } return { n, surplus: sum - n * s.price - s.fee }; };
  const intro = () => {
    const b = best();
    box.innerHTML = `<div class="sr-intro">
      <div class="sr-belt is-demo" aria-hidden="true"><div class="sr-track">${[0, 1, 2, 3, 4, 5].map(k => `<span class="sr-plate" style="--c:${NETA[k][2]}"><i>${NETA[k][1]}</i></span>`).join('')}</div></div>
      <p class="sr-kicker">3 つのお店で</p><h3 class="sr-h">何皿で、ごちそうさま？</h3>
      <p class="sr-p">回転ずしで、流れてくるお皿を「取って食べる」か「ごちそうさま」か。1 皿目は最高においしい。でも 2 皿目、3 皿目と食べるほど、1 皿のうれしさは小さくなっていきます。<b>うれしさの合計 − 払ったお金</b>が得点。どこで止めるのがいちばんか、3 つのお店でためそう。値段とうれしさは、すべてたとえです。</p>
      <p class="sr-best">${b ? `自己ベスト <b>${yen(b)}</b>` : 'はじめての来店'}</p>
      <button type="button" class="sr-go" data-a="start">お店に入る</button></div>`;
  };
  const enter = () => {
    const s = Object.assign({}, SHOP[r]); s.joyR = makeJoy(s.joy);
    st = { s, n: 0, joy: 0, eaten: [], done: false };
    box.innerHTML = `<div class="sr-play">
      <div class="sr-top"><span class="sr-shop"><i aria-hidden="true">${s.seal}</i><span><small>${r + 1} / 3 店目</small><b>${s.name}</b></span></span><span class="sr-rule">${s.how}</span></div>
      <div class="sr-belt" aria-hidden="true"><div class="sr-track">${Array.from({ length: 10 }, (_, k) => `<span class="sr-plate" style="--c:${NETA[k % NETA.length][2]}"><i>${NETA[k % NETA.length][1]}</i></span>`).join('')}</div></div>
      <div class="sr-main">
        <div class="sr-stage">
          <div class="sr-next" data-k="next"></div>
          <p class="sr-say" data-k="say" aria-live="polite">いらっしゃいませ！ 1 皿目が流れてきました。</p>
          <div class="sr-btns"><button type="button" class="sr-eat" data-a="eat">取って食べる</button><button type="button" class="sr-stop" data-a="stop">ごちそうさま</button></div>
        </div>
        <div class="sr-board">
          <div class="sr-belly"><span>おなか</span><b><i data-k="belly"></i></b></div>
          <p class="sr-row"><span>食べた皿</span><b data-k="n">0 皿</b></p>
          <p class="sr-row"><span>うれしさの合計</span><b data-k="joy">0 円</b></p>
          <p class="sr-row"><span>払ったお金</span><b data-k="pay">${yen(s.fee)}</b></p>
          <p class="sr-row is-sum"><span>得点</span><b data-k="sc">${yen(-s.fee)}</b></p>
        </div>
      </div>
      <div class="sr-chart" data-k="chart"><p class="sr-ch">1 皿ずつの、うれしさ<small>${s.price ? `点線は 1 皿の値段（${s.price} 円）` : '食べ放題なので、1 皿の値段は 0 円'}</small></p><div class="sr-bars" data-k="bars" style="--p:${s.price}"></div></div>
    </div>`;
    showNext();
  };
  const showNext = () => {
    const k = st.n % NETA.length, nt = NETA[k];
    box.querySelector('[data-k="next"]').innerHTML = `<span class="sr-plate is-big" style="--c:${nt[2]}"><i>${nt[1]}</i></span><b>${st.n + 1} 皿目：${nt[0]}</b>${st.s.price ? `<small>${st.s.price} 円</small>` : '<small>食べ放題</small>'}`;
    const nx = box.querySelector('.sr-next'); nx.classList.remove('is-in'); void nx.offsetWidth; nx.classList.add('is-in');
  };
  const MAXJ = 500;
  const feel = j => j >= 250 ? '最高においしい！' : j >= 160 ? 'とてもおいしい。' : j >= 90 ? 'おいしい。' : j >= 30 ? 'まあまあかな。' : j > 0 ? 'ちょっとおなかいっぱい……。' : j > -30 ? 'もう苦しい……。' : 'うう、食べすぎた……。';
  const eat = () => {
    if (!st || st.done) return;
    const s = st.s, j = s.joyR[st.n];
    if (j === undefined) { stop(); return; }
    st.n++; st.joy += j; st.eaten.push(j);
    const pay = s.fee + s.price * st.n, sc = st.joy - pay;
    box.querySelector('[data-k="n"]').textContent = `${st.n} 皿`;
    box.querySelector('[data-k="joy"]').textContent = yen(st.joy);
    box.querySelector('[data-k="pay"]').textContent = yen(pay);
    const scEl = box.querySelector('[data-k="sc"]'); scEl.textContent = yen(sc); scEl.classList.toggle('is-neg', sc < 0);
    box.querySelector('[data-k="belly"]').style.width = Math.min(100, st.n / s.joyR.length * 118) + '%';
    box.querySelector('[data-k="say"]').innerHTML = `${st.n} 皿目、${feel(j)} <b>${yen(j)}分</b>のうれしさ。`;
    const h = Math.max(-60, Math.min(MAXJ, j));
    box.querySelector('[data-k="bars"]').insertAdjacentHTML('beforeend', `<span class="sr-bar${j < s.price ? ' is-low' : ''}${j < 0 ? ' is-neg' : ''}" style="--h:${(Math.abs(h) / MAXJ * 100).toFixed(1)}"><i>${j}</i></span>`);
    if (!reduce) { const p = box.querySelector('.sr-next .sr-plate'); if (p) p.classList.add('is-eat'); }
    if (st.n >= s.joyR.length) { setTimeout(stop, 500); return; }
    setTimeout(() => { if (st && !st.done) showNext(); }, reduce ? 0 : 350);
  };
  const stop = () => {
    if (!st || st.done) return; st.done = true;
    const s = st.s, opt = optimal(s), sc = st.joy - s.fee - s.price * st.n;
    total += sc; results.push({ name: s.name, n: st.n, sc, opt });
    const bars = box.querySelector('[data-k="bars"]');
    // まだ食べていない分も、うすく見せる
    for (let k = st.n; k < Math.min(s.joyR.length, opt.n + 2); k++) { const j = s.joyR[k], h = Math.max(-60, Math.min(MAXJ, j)); bars.insertAdjacentHTML('beforeend', `<span class="sr-bar is-ghost${j < s.price ? ' is-low' : ''}${j < 0 ? ' is-neg' : ''}" style="--h:${(Math.abs(h) / MAXJ * 100).toFixed(1)}"><i>${j}</i></span>`); }
    const mk = bars.children[opt.n - 1]; if (mk) mk.classList.add('is-best');
    const gap = opt.surplus - sc;
    const why = s.price ? `${opt.n + 1} 皿目のうれしさ（${s.joyR[opt.n]} 円分）は、値段の ${s.price} 円より小さい。だから <b>${opt.n} 皿</b>で止めるのがいちばんでした。` : `食べ放題では、入るときの 1,200 円はもう払ったお金。何皿食べても変わりません。だから、うれしさが 0 より大きいあいだ食べる <b>${opt.n} 皿</b>がいちばん。それ以上は、食べすぎでマイナスです。考えるのは入る前。「1,200 円より楽しめるか」で決めよう。`;
    box.querySelector('.sr-stage').innerHTML = `<div class="sr-res"><p class="sr-res-h">${st.n} 皿でごちそうさま</p>
      <p class="sr-res-sc">得点 <b class="${sc < 0 ? 'is-neg' : ''}">${yen(sc)}</b><small>いちばんよい止め方なら ${yen(opt.surplus)}${gap <= 0 ? '。ぴったりです！' : `（あと ${yen(gap)}）`}</small></p>
      <p>${why}</p>
      <button type="button" class="sr-go" data-a="${r + 1 < SHOP.length ? 'next' : 'end'}">${r + 1 < SHOP.length ? '次のお店へ' : '結果を見る'}</button></div>`;
    box.querySelector('.sr-belt').classList.add('is-stop');
  };
  const TITLE = [[0.97, '限界で考える名人', '極'], [0.85, 'ちょうどよく食べる人', '良'], [0.6, '腹八分目の見習い', '見'], [-1e9, 'これからわかる', '初']];
  const finish = () => {
    const optSum = results.reduce((a, x) => a + x.opt.surplus, 0), rate = total / optSum;
    const prev = best(), isBest = total > prev;
    try { if (isBest) localStorage.setItem(KEY, String(Math.round(total))); } catch (e) {}
    const ti = TITLE.findIndex(x => rate >= x[0]);
    box.innerHTML = `<div class="sr-end">
      <span class="sr-seal" aria-hidden="true">${TITLE[ti][2]}</span>
      <p class="sr-big"><b>${yen(total)}</b><small>3 店の得点の合計（いちばんよい止め方なら ${yen(optSum)}）</small></p>
      <p class="sr-title">${TITLE[ti][1]}${isBest && prev ? '<em>自己ベスト更新</em>' : prev && !isBest ? `<small>自己ベスト ${yen(prev)}</small>` : ''}</p>
      <ul class="sr-list">${results.map(x => `<li><b>${x.name}</b><span>${x.n} 皿 ・ ${yen(x.sc)}</span><small>いちばんは ${x.opt.n} 皿</small></li>`).join('')}</ul>
      <div class="sr-sum">
        <div><span aria-hidden="true">減</span><p><b>限界効用逓減</b>同じものを続けると、1 つ増やしたときのうれしさ（限界効用）は、だんだん小さくなる。<a href="glossary.html#marginal-utility">用語辞典へ</a></p></div>
        <div><span aria-hidden="true">限</span><p><b>「次の 1 つ」でくらべる</b>次の 1 皿のうれしさが値段より大きければ買う。小さくなったら止める。食べ放題の入店料のように、もう払ったお金は関係ない。</p></div>
      </div>
      <button type="button" class="sr-go" data-a="again">もう一度、3 店をまわる</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(box.querySelector('.sr-end'), 'sara', ti, TITLE.length);
  };
  box.addEventListener('click', e => {
    const a = e.target.closest('[data-a]'); if (!a) return;
    const v = a.dataset.a;
    if (v === 'start' || v === 'again') { r = 0; total = 0; results = []; enter(); }
    else if (v === 'eat') eat();
    else if (v === 'stop') stop();
    else if (v === 'next') { r++; enter(); }
    else if (v === 'end') finish();
  });
  intro();
})();
