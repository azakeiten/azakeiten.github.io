/* ================================================================
   lemon.js — あそび場：フリマのなぞ（情報の非対称性・レモン市場・近づいてから読みこむ）
   ・8 つのお店が、見た目そっくりの中古スマホを売る。半分は良品、半分ははずれ。売る人だけが中身を知っている
   ・あなたは値段を決めて買う。その値段では売りたくない良品のお店は、シャッターを下ろしてしまう
   ・「保証書・レビュー」を入れると、中身がわかって、良品にもちょうどよい値段がつく
   ・値段はすべてたとえ。見た目は lemon.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-lemon]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="lemon.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'lemon.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const yen = n => (n < 0 ? '−' : n > 0 ? '+' : '') + Math.abs(Math.round(n)).toLocaleString() + ' 円';
  const yen0 = n => Math.round(n).toLocaleString() + ' 円';
  // 良品・はずれ：売る人が「これより安くは売らない」値段／買う人（あなた）にとっての価値／保証つきで売るときの値段
  const Q = { good: { min: 24000, val: 30000, fair: 27000, t: '良品' }, bad: { min: 8000, val: 10000, fair: 9000, t: 'はずれ' } };
  const STALLS = 8, HUE = [12, 200, 140, 40, 280, 330, 95, 25];
  const phone = `<svg viewBox="0 0 40 64" aria-hidden="true"><rect x="3" y="2" width="34" height="60" rx="6" class="fm-ph-b"/><rect x="7" y="9" width="26" height="42" rx="2" class="fm-ph-s"/><path class="fm-crack" d="M12 14 L20 26 L15 32 L24 44 M20 26 L29 22"/><path class="fm-shine" d="M10 12 L18 12 L10 30 Z"/><circle cx="20" cy="56" r="2.4" class="fm-ph-h"/></svg>`;

  box.innerHTML = `
    <div class="fm-market">
      <p class="fm-sign"><span>フリマ</span>中古スマホ　どれも見た目はそっくり</p>
      <div class="fm-stalls">${Array.from({ length: STALLS }, (_, i) => `<div class="fm-st" data-s="${i}" style="--h:${HUE[i]}"><span class="fm-awn"></span><div class="fm-box"><span class="fm-ph">${phone}</span><span class="fm-tag"></span></div><span class="fm-shut"><b>この値段では<br>売らない</b></span><span class="fm-label"></span><span class="fm-got">あなたが買った</span></div>`).join('')}</div>
      <p class="fm-msg" data-k="msg" aria-live="polite">値段を決めて「この値段で買う」を押そう。8 つのお店のうち、半分が良品、半分がはずれ。でも見た目では見分けがつきません。</p>
    </div>
    <div class="fm-side">
      <div class="fm-mode" role="group" aria-label="情報"><button type="button" data-m="hide" aria-pressed="true">中身はわからない</button><button type="button" data-m="show" aria-pressed="false">保証書・レビューあり</button></div>
      <div class="fm-know"><p><span>あなたにとっての価値</span><b>良品 30,000 円</b><b class="is-bad">はずれ 10,000 円</b></p><small>売る人は、良品なら 24,000 円より安くは売りたくありません（はずれは 8,000 円）。</small></div>
      <label class="fm-price" data-k="pricebox"><span>あなたが出す値段</span><output>20,000 円</output><input type="range" min="6000" max="30000" step="1000" value="20000"></label>
      <button type="button" class="fm-go" data-a="buy">この値段で買う</button>
      <p class="fm-pickhint" hidden>レビューを見て、買いたいお店を押そう。値段はお店が決めています。</p>
      <div class="fm-score"><p><span>あなたの得の合計</span><b data-k="total">0 円</b></p><ol class="fm-log" data-k="log"></ol></div>
      <button type="button" class="fm-reset" data-a="reset">はじめから</button>
    </div>
    <div class="fm-lesson" hidden></div>
    <div class="fm-learn">
      <p><b>情報の非対称性</b>売る人は中身を知っているのに、買う人は知らない。こうした「知っていることの差」を<a href="glossary.html#info-asymmetry">情報の非対称性</a>といいます。</p>
      <p><b>レモン市場</b>中身がわからないと、買う人は「平均くらい」の値段しか出しません。すると良品を持つ人は売るのをやめ、はずれ（英語の俗語で「レモン」）ばかりが残ります。経済学者アカロフが説明し、2001 年のノーベル経済学賞の理由の 1 つになりました。</p>
      <p><b>どうやって解決する？</b>保証書、鑑定、お店の評判、返品できるしくみ。中身を伝えるくふうがあると、良いものにちゃんと値段がつきます。</p>
      <p><b>身近なところで</b>フリマアプリの評価や、中古品の「動作確認済み」も、このくふうのなかま（<a href="glossary.html#flea-app">フリマアプリ</a>）。買うときは、説明や評価をよく見よう。</p>
    </div>
    <p class="fm-note">スマホの値段・良品とはずれの数は、しくみを知るための「たとえ」です。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const sts = [...box.querySelectorAll('.fm-st')], range = box.querySelector('.fm-price input'), out = box.querySelector('.fm-price output'), lesson = box.querySelector('.fm-lesson');
  let mode = 'hide', P = 20000, q = [], total = 0, round = 0, busy = false, hist = [];

  const deal = () => { q = ['good', 'good', 'good', 'good', 'bad', 'bad', 'bad', 'bad'].sort(() => Math.random() - .5); };
  const paint = () => {
    sts.forEach((s, i) => {
      s.className = 'fm-st'; s.querySelector('.fm-label').textContent = ''; s.querySelector('.fm-tag').textContent = '';
      if (mode === 'show') { const g = q[i] === 'good'; s.classList.add('is-info', g ? 'is-good' : 'is-bad'); s.querySelector('.fm-label').innerHTML = g ? '保証書つき<br>評価 ★4.8' : '動作不良あり<br>評価 ★2.1'; s.querySelector('.fm-tag').textContent = yen0(Q[q[i]].fair); }
    });
  };
  const setMode = m => {
    mode = m; box.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m));
    box.classList.toggle('is-show', m === 'show');
    box.querySelector('.fm-pickhint').hidden = m !== 'show';
    deal(); paint();
    K('msg').textContent = m === 'show' ? '保証書とレビューで、中身がわかるようになりました。買いたいお店を押してみよう。' : '値段を決めて「この値段で買う」を押そう。半分が良品、半分がはずれ。でも見た目では見分けがつきません。';
  };
  const logRow = (t, g) => { hist.push([t, g]); total += g; K('total').textContent = yen(total); K('total').className = total < 0 ? 'is-minus' : ''; K('log').innerHTML = hist.slice(-6).map(([a, b]) => `<li><span>${a}</span><b class="${b < 0 ? 'is-minus' : ''}">${yen(b)}</b></li>`).join(''); };

  // ---- 中身がわからないとき：値段を決めて買う ----
  const buy = async () => {
    if (busy || mode !== 'hide') return;
    busy = true; box.classList.add('is-busy'); round++;
    deal(); paint();
    K('msg').textContent = `${yen0(P)} で買います、と声をかけました。お店の人は、自分のスマホの中身を知っています……`;
    await sleep(700);
    const open = [];
    for (let i = 0; i < STALLS; i++) {
      const sell = P >= Q[q[i]].min;
      if (!sell) sts[i].classList.add('is-closed'); else open.push(i);
      await sleep(110);
    }
    await sleep(500);
    if (!open.length) { K('msg').textContent = 'この値段では、どのお店も売ってくれませんでした。'; logRow(`${round} 回目 ${yen0(P)}`, 0); busy = false; box.classList.remove('is-busy'); return; }
    const pick = open[Math.floor(Math.random() * open.length)];
    sts[pick].classList.add('is-pick');
    K('msg').textContent = '箱を開けてみると……';
    await sleep(900);
    sts[pick].classList.add('is-open', q[pick] === 'good' ? 'is-good' : 'is-bad');
    const gain = Q[q[pick]].val - P;
    await sleep(500);
    open.forEach(i => { if (i !== pick) sts[i].classList.add('is-reveal', q[i] === 'good' ? 'is-good' : 'is-bad'); });
    const goods = open.filter(i => q[i] === 'good').length;
    K('msg').textContent = `${q[pick] === 'good' ? '良品' : 'はずれ'}でした（${yen(gain)}）。この値段で売ってくれたのは ${open.length} 店、そのうち良品は ${goods} 店。`;
    logRow(`${round} 回目 ${yen0(P)}`, gain);
    busy = false; box.classList.remove('is-busy');
    if (round >= 3 && lesson.hidden) showLesson();
  };
  // ---- 中身がわかるとき：お店をえらんで買う ----
  const pickInfo = async i => {
    if (busy || mode !== 'show' || sts[i].classList.contains('is-open')) return;
    busy = true;
    const kind = q[i], price = Q[kind].fair, gain = Q[kind].val - price;
    sts[i].classList.add('is-pick'); await sleep(500); sts[i].classList.add('is-open');
    K('msg').textContent = `${Q[kind].t}を ${yen0(price)} で買いました（${yen(gain)}）。売った人も、ほしかった値段より高く売れて満足。`;
    logRow(`${Q[kind].t} ${yen0(price)}`, gain);
    busy = false;
    try { localStorage.setItem('azakei_lemon', '1'); } catch (e) {}
    if (box.querySelectorAll('.fm-st.is-open').length >= STALLS) { await sleep(900); deal(); paint(); }
  };
  const showLesson = () => {
    lesson.innerHTML = `<span class="fm-l-seal" aria-hidden="true">檸</span><div><p class="fm-l-h">良品が、市場から消えていく</p>
      <p>中身がわからないとき、あなたにとっての価値の平均は（30,000 ＋ 10,000）÷ 2 ＝ <b>20,000 円</b>。でも、良品を持つ人は 24,000 円より安くは売りません。</p>
      <ul class="fm-l-row"><li><small>24,000 円以上出すと</small><b>良品もはずれも来る。平均 20,000 円の価値なのに高く払うので、損をしやすい</b></li><li><small>24,000 円より下げると</small><b>良品のお店は閉まって、はずれだけ。価値は 10,000 円</b></li></ul>
      <p>どの値段でも、良品はうまく売り買いできません。中身を伝えるくふう（保証書・レビュー）が大切な理由です。上の「保証書・レビューあり」を押してみよう。</p></div>`;
    lesson.hidden = false;
    window.AZAKEI_TALK && window.AZAKEI_TALK(lesson.querySelector(':scope > div') || lesson, 'lemon', 'top');
    try { localStorage.setItem('azakei_lemon', '1'); } catch (e) {}
  };

  range.addEventListener('input', () => { P = +range.value; out.textContent = yen0(P); });
  box.addEventListener('click', e => {
    const m = e.target.closest('[data-m]'); if (m && !busy) { setMode(m.dataset.m); return; }
    const st = e.target.closest('.fm-st'); if (st && mode === 'show') { pickInfo(+st.dataset.s); return; }
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'buy') buy();
    else if (a.dataset.a === 'reset' && !busy) { total = 0; round = 0; hist = []; K('total').textContent = '0 円'; K('total').className = ''; K('log').innerHTML = ''; lesson.hidden = true; setMode('hide'); }
  });
  setMode('hide');
})();
