/* ================================================================
   nesage.js — 経済ラボ：となりのお店と値下げ競争（くり返しの「囚人のジレンマ」＝ゲーム理論）
   ・毎回「値段を守る」か「値下げする」を、となりのお店と同時に選ぶ。全 10 回
   ・もうけ（点）：両方守る 3・3 ／ 片方だけ値下げ 5・0 ／ 両方値下げ 1・1（しくみを見るための「たとえ」）
   ・となりのお店は 5 つの作戦のどれか（最後に正体がわかる）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-nesage]');
  if (!box) return;
  const KEY = 'azakei_nesage', ROUNDS = 10;
  const PAY = { KK: [3, 3], KC: [0, 5], CK: [5, 0], CC: [1, 1] }; // K = 守る, C = 値下げ（自分, 相手）
  // [名前, せつめい, 次の手を決める関数(自分の手の記録, 相手＝あなたの手の記録)]
  const AI = [
    ['まねっこ（しっぺ返し）', '最初は守り、あとは「あなたが前の回にしたこと」をまねする', (m, y) => y.length ? y[y.length - 1] : 'K'],
    ['いつも値下げ', 'あなたが何をしても、毎回値下げする', () => 'C'],
    ['いつも守る', 'あなたが何をしても、毎回値段を守る', () => 'K'],
    ['根にもつ', '最初は守る。でも、あなたが 1 回でも値下げしたら、そのあとずっと値下げ', (m, y) => y.includes('C') ? 'C' : 'K'],
    ['気まぐれ', '毎回、コインを投げるように半々で決める', () => Math.random() < .5 ? 'K' : 'C']
  ];
  const ICON = { K: '🏷', C: '✂' };
  // 色分けのクラス（CSS を分けるときに見つけられるよう、ここに書いておく）：is-K is-C is-KK is-KC is-CK is-CC
  let ai, you, them, sy, st, busy;
  box.innerHTML = `
    <div class="ns-pay" aria-label="もうけの表">
      <p class="ns-pay-k">もうけの表（あなた ／ となり）</p>
      <table><thead><tr><th></th><th>となりが<br>守る</th><th>となりが<br>値下げ</th></tr></thead>
      <tbody><tr><th>あなたが守る</th><td>3 ／ 3</td><td class="is-bad">0 ／ 5</td></tr><tr><th>あなたが値下げ</th><td class="is-good">5 ／ 0</td><td>1 ／ 1</td></tr></tbody></table>
      <p class="ns-pay-n">自分だけ値下げすると、お客さんをとれて 5。でも、2 軒とも値下げすると、どちらももうけが減って 1。</p>
    </div>
    <div class="ns-game">
      <div class="ns-shops">
        <div class="ns-shop is-you"><p>あなたのお店</p><span class="ns-card" data-o="yc" aria-hidden="true">?</span><b data-o="ys">0</b></div>
        <span class="ns-vs">VS</span>
        <div class="ns-shop is-them"><p>となりのお店<small data-o="who">作戦は、ひみつ</small></p><span class="ns-card" data-o="tc" aria-hidden="true">?</span><b data-o="ts">0</b></div>
      </div>
      <ol class="ns-track" data-o="track" aria-label="これまでの結果">${Array.from({ length: ROUNDS }, (_, i) => `<li><span>${i + 1}</span></li>`).join('')}</ol>
      <p class="ns-say" data-o="say" aria-live="polite">${ROUNDS} 回、くり返します。となりのお店がどんな作戦か、さぐりながら選ぼう。</p>
      <div class="ns-btns" data-o="btns"><button type="button" class="ns-k" data-m="K">🏷 値段を守る</button><button type="button" class="ns-c" data-m="C">✂ 値下げする</button></div>
      <div class="ns-end" data-o="end" hidden></div>
    </div>
    <p class="in-foot">※ もうけの数字は、しくみを見るための「たとえ」です。</p>`;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('is-lite');
  const reset = () => {
    ai = AI[Math.random() * AI.length | 0]; you = []; them = []; sy = 0; st = 0; busy = false;
    $('ys').textContent = 0; $('ts').textContent = 0; $('yc').textContent = '?'; $('tc').textContent = '?';
    $('yc').className = 'ns-card'; $('tc').className = 'ns-card'; $('who').textContent = '作戦は、ひみつ';
    box.querySelectorAll('.ns-track li').forEach(li => { li.className = ''; li.innerHTML = `<span>${li.querySelector('span').textContent}</span>`; });
    $('say').textContent = `${ROUNDS} 回、くり返します。となりのお店がどんな作戦か、さぐりながら選ぼう。`;
    $('btns').hidden = false; $('end').hidden = true; box.classList.remove('is-over');
  };
  const play = m => {
    if (busy) return; busy = true;
    const t = ai[2](them, you);
    const p = PAY[m + t];
    $('yc').className = 'ns-card'; $('tc').className = 'ns-card'; void $('yc').offsetWidth;
    $('yc').textContent = ICON[m]; $('tc').textContent = ICON[t];
    $('yc').classList.add('is-flip', 'is-' + m); $('tc').classList.add('is-flip', 'is-' + t);
    you.push(m); them.push(t); sy += p[0]; st += p[1];
    setTimeout(() => {
      $('ys').textContent = sy; $('ts').textContent = st;
      const li = box.querySelectorAll('.ns-track li')[you.length - 1];
      li.className = 'is-' + m + t; li.innerHTML = `<span>${you.length}</span><i>${ICON[m]}</i><i>${ICON[t]}</i>`;
      $('say').innerHTML = m === 'K' && t === 'K' ? `2 軒とも値段を守った。どちらも <b>+3</b>。`
        : m === 'C' && t === 'C' ? `2 軒とも値下げ……。お客さんは分かれたまま、もうけだけ減って <b>+1</b> ずつ。`
        : m === 'C' ? `あなただけ値下げ！ お客さんがあなたのお店に流れて <b>+5</b>（となりは 0）。`
        : `となりだけ値下げ……。お客さんをとられて <b>+0</b>（となりは 5）。`;
      busy = false;
      if (you.length >= ROUNDS) finish();
    }, reduce ? 0 : 450);
  };
  const finish = () => {
    $('btns').hidden = true; box.classList.add('is-over');
    $('who').textContent = `作戦：${ai[0]}`;
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    const both = you.filter((m, i) => m === 'K' && them[i] === 'K').length;
    const msg = both === ROUNDS ? 'みごと！ 2 軒そろって、いちばんもうかる形をつくれました。'
      : sy > st ? 'となりより多くもうけました。でも、2 軒の合計はどうだったかな？'
      : sy === st ? 'となりと同じもうけでした。'
      : 'となりのほうが、多くもうけました。';
    $('end').hidden = false;
    $('end').innerHTML = `<p class="ns-end-k">10 回のけっか</p>
      <p class="ns-end-s"><span>あなた <b>${sy}</b></span><span>となり <b>${st}</b></span><span>2 軒の合計 <b>${sy + st}</b> / 60</span></p>
      <p class="ns-end-who"><span aria-hidden="true">策</span><span>となりの作戦は<b>「${ai[0]}」</b>でした。<small>${ai[1]}</small></span></p>
      <p class="ns-end-m">${msg}<br>1 回だけなら、値下げしたほうが得に見えます。でも<b>何回もくり返す</b>と、相手も仕返しをしてきて、2 軒とも 1 ずつの「値下げ競争」になりがち。おたがいに値段を守ると、2 軒の合計がいちばん大きくなります（10 回で 60）。このように、相手の出方を考えて選ぶことを調べる学問が<b>ゲーム理論</b>です。2 軒とも守れた回は <b>${both} 回</b>でした。</p>
      <button type="button" class="btn-primary" data-a="again">別のお店と、もう 1 回</button>`;
  };
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-m]'); if (b) return play(b.dataset.m);
    if (e.target.closest('[data-a="again"]')) reset();
  });
  reset();
})();
