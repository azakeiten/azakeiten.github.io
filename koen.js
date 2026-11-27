/* ================================================================
   koen.js — あそび場：みんなの公園（公共財とただ乗り・近づいてから読みこむ）
   ・あなたと 4 人のご近所さん。毎回 10 コインずつもらい、公園の箱にいくつ入れるかを決める
   ・箱のコインは 2 倍になって、入れた数に関係なく 5 人で同じに分ける。公園も、入ったぶんだけ育つ
   ・ご近所さん：まじめさん（多め）／まねっこさん（前の回のみんなの平均）／ちゃっかりさん（ほとんど入れない）／ふつうさん（はじめは半分、まわりに合わせる）
   ・5 回のあと、全員がたくさん入れた場合とくらべる。「税のルール」（全員 6 コインずつ）でもためせる
   ・数字はたとえ。見た目は koen.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-koen]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="koen.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'koen.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const ROUNDS = 5, END = 10, TAX = 6;
  const WHO = [['あなた', '#b5432f'], ['まじめさん', '#3b5a78'], ['まねっこさん', '#5f7f4e'], ['ちゃっかりさん', '#7a4a8a'], ['ふつうさん', '#c9921f']];
  // 公園に育つもの：[しきい（それまでに入ったコインの合計）, 形]
  const PARTS = [[15, 'tree1'], [35, 'bench'], [55, 'flower'], [80, 'tree2'], [105, 'swing'], [135, 'tree3'], [165, 'slide'], [200, 'fount']];
  const ART = {
    tree1: '<g transform="translate(120 150)"><rect x="-4" y="0" width="8" height="26" class="pk-trunk"/><circle cy="-8" r="22" class="pk-leaf"/></g>',
    tree2: '<g transform="translate(470 140)"><rect x="-4" y="0" width="8" height="30" class="pk-trunk"/><circle cy="-10" r="26" class="pk-leaf"/></g>',
    tree3: '<g transform="translate(300 105)"><rect x="-3" y="0" width="6" height="22" class="pk-trunk"/><circle cy="-6" r="18" class="pk-leaf is-2"/></g>',
    bench: '<g transform="translate(220 190)"><rect x="-30" y="-6" width="60" height="7" rx="2" class="pk-wood"/><rect x="-30" y="-20" width="60" height="6" rx="2" class="pk-wood"/><rect x="-26" y="0" width="4" height="12" class="pk-iron"/><rect x="22" y="0" width="4" height="12" class="pk-iron"/></g>',
    flower: `<g transform="translate(380 210)">${[-36, -18, 0, 18, 36].map((x, i) => `<g transform="translate(${x} 0)"><path d="M0 0 V-12" class="pk-stem"/><circle cy="-15" r="5" style="fill:hsl(${i * 60 + 320} 70% 65%)"/></g>`).join('')}</g>`,
    swing: '<g transform="translate(560 170)"><path d="M-30 30 L-22 -24 H22 L30 30" class="pk-frame"/><path d="M-8 -24 V12 M8 -24 V12" class="pk-rope"/><rect x="-12" y="12" width="24" height="5" rx="2" class="pk-wood"/></g>',
    slide: '<g transform="translate(60 205)"><path d="M0 -40 V20 M14 -40 V20" class="pk-frame"/><path d="M14 -40 C 40 -36, 50 10, 70 20" class="pk-slide"/><path d="M0 -40 h14" class="pk-frame"/></g>',
    fount: '<g transform="translate(320 200)"><ellipse rx="40" ry="10" class="pk-pool"/><path d="M0 -4 V-30" class="pk-jet"/><path class="pk-drop" d="M0 -30 q-14 4 -18 18 M0 -30 q14 4 18 18"/></g>'
  };

  box.innerHTML = `
    <div class="pk-stage">
      <svg class="pk-svg" viewBox="0 0 640 260" role="img" aria-label="町の公園。コインが入るほど、木やベンチや遊具がふえる">
        <rect width="640" height="260" class="pk-sky"/>
        <path d="M0 96 Q160 60 320 92 T640 84 V260 H0 Z" class="pk-grass"/>
        <path d="M0 236 H640" class="pk-path"/>
        <g class="pk-parts">${PARTS.map(([t, k]) => `<g class="pk-part" data-part="${k}" data-t="${t}">${ART[k]}</g>`).join('')}</g>
        <text class="pk-empty" x="320" y="170">まだ、なにもない広場</text>
        <g class="pk-box" transform="translate(320 52)"><rect x="-36" y="-22" width="72" height="40" rx="6"/><rect x="-14" y="-26" width="28" height="5" rx="2" class="pk-slot"/><text y="4" data-k="box">0</text><text y="14" class="pk-box-l">公園の箱</text></g>
        <g class="pk-fx"></g>
      </svg>
      <p class="pk-total"><span>公園に入ったコイン</span><b data-k="total">0</b><small>（2 倍されて分けられる前の数）</small></p>
      <ul class="pk-ppl">${WHO.map(([n, c], i) => `<li data-p="${i}" style="--c:${c}"><span class="pk-av"></span><b>${n}</b><span class="pk-put" data-put="${i}">—</span><span class="pk-coins" data-coin="${i}">0</span></li>`).join('')}</ul>
    </div>
    <div class="pk-side">
      <div class="pk-rule"><label class="pk-sw"><input type="checkbox" data-tax><span></span>税のルール：全員が 1 回 ${TAX} コインずつ公園に出す</label><p>ルールを変えると、1 回目からやり直します。</p></div>
      <div class="pk-pick"><p class="pk-round"><b data-k="round">1</b> / ${ROUNDS} 回目</p><p class="pk-q">この回の 10 コインのうち、公園の箱にいくつ入れる？</p>
        <div class="pk-dial"><button type="button" data-d="-1" aria-label="1 つへらす">−</button><output data-k="mine">5</output><button type="button" data-d="1" aria-label="1 つふやす">+</button></div>
        <button type="button" class="pk-go" data-a="go">箱に入れる</button></div>
      <p class="pk-msg" data-k="msg" aria-live="polite">箱のコインは 2 倍になって、入れた数に関係なく 5 人で同じに分けられます。手元にのこしたコインは、そのまま自分のもの。</p>
    </div>
    <div class="pk-result" hidden></div>
    <div class="pk-learn">
      <p><b>公共財</b>公園や道路、街灯のように、お金を出した人も出さない人も、みんなが使えるもの。だれかひとりが買うのはむずかしいので、みんなで出し合ってつくります（<a href="glossary.html#public-goods">公共財</a>）。</p>
      <p><b>ただ乗り（フリーライダー）</b>出さなくても使えるなら、「自分は出さずに使おう」と考える人が出てきます。それを見たほかの人も出さなくなり、公園はなかなか育ちません。</p>
      <p><b>税というしくみ</b>だから国や市は、税としてみんなから少しずつ集めて、公園や道路をつくります。決まりがあると、全員が出すので、みんなが得をします（<a href="glossary.html#tax">税金</a>・<a href="glossary.html#public-works">公共事業</a>）。</p>
      <p><b>ほかにも</b>町内会の清掃、クラスの係の仕事、ウィキペディアのようにみんなでつくる百科事典も、このしくみに近いものです。となりの「みんなの池」とも、くらべてみよう。</p>
    </div>
    <p class="pk-note">ご近所さんの性格やコインの数は、しくみを知るための「たとえ」です。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const parts = [...box.querySelectorAll('.pk-part')], fx = box.querySelector('.pk-fx'), result = box.querySelector('.pk-result'), taxBox = box.querySelector('[data-tax]');
  let mine = 5, st;
  const reset = () => {
    st = { r: 1, total: 0, coins: [0, 0, 0, 0, 0], last: [5, 5, 5, 5, 5], hist: [] };
    if (taxBox.checked) mine = Math.max(mine, TAX);
    K('mine').textContent = mine; K('round').textContent = 1; K('total').textContent = 0; K('box').textContent = 0;
    box.querySelectorAll('[data-put]').forEach(e => e.textContent = '—'); box.querySelectorAll('[data-coin]').forEach(e => e.textContent = 0);
    parts.forEach(p => p.classList.remove('is-on')); box.classList.remove('has-park', 'is-done');
    result.hidden = true; box.querySelector('[data-a="go"]').textContent = '箱に入れる';
    K('msg').textContent = taxBox.checked ? `税のルールあり。全員が少なくとも ${TAX} コインを出します（あなたはそれより多くもできます）。` : '箱のコインは 2 倍になって、入れた数に関係なく 5 人で同じに分けられます。手元にのこしたコインは、そのまま自分のもの。';
  };
  const others = () => {
    const avg = st.last.reduce((a, b) => a + b, 0) / 5, r = st.r;
    let v = [8 - (r > 3 && avg < 4 ? 3 : 0), Math.round(avg), r === 1 ? 2 : (Math.random() < .5 ? 0 : 1), r === 1 ? 5 : Math.round((st.last[4] + avg) / 2 - (avg < 5 ? 1 : 0))];
    v = v.map(x => Math.max(0, Math.min(END, x)));
    if (taxBox.checked) v = v.map(x => Math.max(TAX, x));
    return v;
  };
  const NS = 'http://www.w3.org/2000/svg';
  const fly = (i, k) => { if (reduce) return; for (let j = 0; j < Math.min(k, 6); j++) setTimeout(() => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', 6); c.setAttribute('class', 'pk-coin'); c.style.setProperty('--x', (64 + i * 128 - 320) + 'px'); fx.appendChild(c); setTimeout(() => c.remove(), 900); }, i * 80 + j * 70); };
  const grow = () => { parts.forEach(p => { const on = st.total >= +p.dataset.t; if (on && !p.classList.contains('is-on')) p.classList.add('is-on'); }); box.classList.toggle('has-park', st.total >= PARTS[0][0]); };

  const play = async () => {
    if (st.r > ROUNDS) { reset(); return; }
    box.classList.add('is-busy');
    const put = [mine, ...others()], sum = put.reduce((a, b) => a + b, 0), share = sum * 2 / 5;
    put.forEach((v, i) => { box.querySelector(`[data-put="${i}"]`).textContent = `${v} 入れた`; fly(i, v); });
    box.querySelector('.pk-ppl').classList.remove('is-show'); void box.offsetWidth; box.querySelector('.pk-ppl').classList.add('is-show');
    await sleep(900);
    st.total += sum; K('total').textContent = st.total; K('box').textContent = sum * 2;
    put.forEach((v, i) => { st.coins[i] += END - v + share; box.querySelector(`[data-coin="${i}"]`).textContent = Math.round(st.coins[i] * 10) / 10; });
    grow();
    st.hist.push(put); st.last = put;
    const cheap = put[3];
    K('msg').textContent = `5 人で ${sum} コイン。2 倍の ${sum * 2} コインを、1 人 ${share} コインずつ分けました。${!taxBox.checked && cheap <= 2 ? `ちゃっかりさんは ${cheap} しか入れていないのに、同じ ${share} コインを受けとっています。` : ''}`;
    st.r++;
    box.classList.remove('is-busy');
    if (st.r > ROUNDS) finish(); else K('round').textContent = st.r;
  };
  const finish = () => {
    box.classList.add('is-done');
    const you = st.coins[0], best = (END * 2) * ROUNDS, none = END * ROUNDS, cheap = st.coins[3];
    const avgPut = st.hist.reduce((a, h) => a + h.reduce((x, y) => x + y, 0), 0) / ROUNDS / 5;
    const firstAvg = st.hist[0].reduce((a, b) => a + b, 0) / 5, lastAvg = st.hist[ROUNDS - 1].reduce((a, b) => a + b, 0) / 5;
    const nParts = parts.filter(p => p.classList.contains('is-on')).length;
    const head = nParts >= 6 ? 'すてきな公園ができました' : nParts >= 4 ? 'まあまあの公園になりました' : 'さびしい広場のままでした';
    result.innerHTML = `<span class="pk-r-seal" aria-hidden="true">園</span><div><p class="pk-r-h">${head}<small>遊具や木 ${nParts} / ${PARTS.length}</small></p>
      <p>5 回で、あなたの手元は ${Math.round(you)} コイン、ちゃっかりさんは ${Math.round(cheap)} コイン。1 人が 1 回に入れた平均は ${avgPut.toFixed(1)} コイン${taxBox.checked ? '' : `（1 回目 ${firstAvg.toFixed(1)} → 5 回目 ${lastAvg.toFixed(1)}）`}でした。</p>
      <ul class="pk-r-nums"><li><small>全員が 10 ずつ入れたら</small><b>1 人 ${best} コイン</b></li><li><small>だれも入れなかったら</small><b>1 人 ${none} コイン</b></li><li><small>あなた</small><b>${Math.round(you)} コイン</b></li></ul>
      <p class="pk-r-hint">${taxBox.checked ? '税のルールがあると、ちゃっかりさんも出すので、公園がしっかり育ちました。' : 'みんなが出せば全員が得をするのに、「自分だけ出さない」が得に見えるので、出す人が減っていきがちです。「税のルール」をオンにして、くらべてみよう。'}</p></div>`;
    result.hidden = false;
    box.querySelector('[data-a="go"]').textContent = 'もう一度（1 回目から）';
    try { localStorage.setItem('azakei_koen', String(nParts)); } catch (e) {}
    window.AZAKEI_TALK && window.AZAKEI_TALK(result.querySelector(':scope > div') || result, 'koen', nParts >= 6 ? 'top' : nParts >= 4 ? 'mid' : 'low');
  };

  box.addEventListener('click', e => {
    const d = e.target.closest('[data-d]'); if (d && !box.classList.contains('is-busy')) { mine = Math.max(taxBox.checked ? TAX : 0, Math.min(END, mine + +d.dataset.d)); K('mine').textContent = mine; return; }
    if (e.target.closest('[data-a="go"]') && !box.classList.contains('is-busy')) play();
  });
  taxBox.addEventListener('change', reset);
  reset();
})();
