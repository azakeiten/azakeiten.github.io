/* ================================================================
   barter.js — クイズ：「交換の島」（物々交換と、お金をくらべる）
   ・魚を持って、本がほしい。島の 6 人と交換して、本を手に入れる
   ・一回め：物々交換（相手がほしい物を持っていないと交換できない）
   ・二回め：同じ島に「貝のお金」がある（だれでも受けとる）→ 売って、買うだけ
   ・最後に、二つの回数をくらべる。人や品物は、しくみを考えるための「たとえ」
   ================================================================ */
(function() {
  const box = document.querySelector('[data-barter]');
  if (!box) return;
  const NAMES = ['汐', '岬', '凪', '浜', '磯', '澪'];
  const POOL = ['米', '布', '塩', '薪', '茶', '壺'];
  const START = '魚', GOAL = '本';
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let folk, hold, mode, tries, trades, log, res;

  const build = () => {
    const mid = shuffle(POOL.slice()), x = mid.slice(0, 3), rest = mid.slice(3);
    // 交換のくさり：魚 → x0 → x1 → x2 → 本
    const chain = [[x[0], START], [x[1], x[0]], [x[2], x[1]], [GOAL, x[2]]];
    const decoy = [[rest[0], GOAL], [rest[1], rest[2]]];
    const nm = shuffle(NAMES.slice());
    folk = shuffle(chain.concat(decoy)).map(([has, want], i) => ({ n: nm[i], has, want, known: false, done: false }));
  };
  const reset = m => {
    mode = m; hold = START; tries = 0; trades = 0; log = [];
    folk.forEach(f => { f.done = false; f.known = m === 'money'; });
    // 二回めは、くさりを元にもどす
    if (m === 'money') folk.forEach(f => { f.has = f.has0; f.want = f.want0; });
    else folk.forEach(f => { f.has0 = f.has; f.want0 = f.want; });
  };

  const paint = flash => {
    const isM = mode === 'money';
    box.innerHTML = `<div class="bt-top">
        <p class="bt-step"><span>${isM ? '二' : '一'}</span>${isM ? '同じ島に、貝のお金があったら' : '物々交換の島'}</p>
        <div class="bt-me"><p class="bt-me-k">あなたが持っている物</p><p class="bt-item${hold === '貝' ? ' is-coin' : ''}">${hold}</p><p class="bt-me-g">ほしい物　<b>${GOAL}</b></p></div>
        <p class="bt-cnt"><span>話しかけた <b>${tries}</b> 回</span><span>交換 <b>${trades}</b> 回</span></p>
      </div>
      <p class="bt-rule">${isM ? '島の人はみんな、貝のお金を受けとります。魚をほしい人に<b>売って</b>貝をもらい、本を持っている人から<b>買い</b>ましょう。' : '島の人に話しかけて、交換してもらいましょう。<b>相手がほしい物</b>を持っていないと、交換はできません。'}</p>
      <ul class="bt-folk">${folk.map((f, i) => `<li><button type="button" class="bt-p${f.done ? ' is-done' : ''}${flash === i ? ' is-flash' : ''}" data-i="${i}">
          <span class="bt-seal" aria-hidden="true">${f.n}</span><span class="bt-nm">${f.n}さん</span>
          <span class="bt-has">持っている<b>${f.has}</b></span>
          <span class="bt-want">ほしい<b>${f.known ? (f.done ? '―' : f.want) : '？'}</b></span></button></li>`).join('')}</ul>
      <p class="bt-msg" aria-live="polite">${log[0] || '人をえらんで、話しかけてください。'}</p>
      <p class="bt-note">島の人や品物は、しくみを考えるための「たとえ」です。</p>`;
  };

  const talk = i => {
    const f = folk[i]; tries++;
    if (mode === 'barter') {
      const first = !f.known; f.known = true;
      if (f.done) log.unshift(`${f.n}さんとは、もう交換しました。`);
      else if (f.want === hold) {
        const got = f.has; f.has = hold; f.done = true; hold = got; trades++;
        log.unshift(`${f.n}さんと交換。${f.has}をわたして、${got}をもらいました。`);
      } else log.unshift(`${f.n}さんは「${f.want}がほしい」そうです。${hold}はいらないみたい。${first ? '' : 'ほかの人をあたってみて。'}`);
    } else {
      if (hold === '貝') {
        if (f.has === GOAL) { f.has = '貝'; hold = GOAL; trades++; log.unshift(`${f.n}さんから、貝のお金で本を買いました。`); }
        else log.unshift(`${f.n}さんの${f.has}も買えますが、ほしいのは本です。`);
      } else if (f.want === hold) { f.done = true; hold = '貝'; trades++; log.unshift(`${f.n}さんに魚を売って、貝のお金をもらいました。`); }
      else log.unshift(`${f.n}さんは、魚はいらないそうです。`);
    }
    paint(i);
    if (hold === GOAL) setTimeout(() => (mode === 'barter' ? mid() : end()), 900);
  };

  const mid = () => {
    res = { t: tries, x: trades };
    box.innerHTML = `<div class="bt-end"><p class="bt-seal-l" aria-hidden="true">換</p>
      <p class="bt-res">本が手に入りました。話しかけた回数 <b>${tries}</b>・交換 <b>${trades}</b> 回</p>
      <p class="bt-word">本にたどりつくまで、物を ${trades} 回も持ちかえました。では、同じ島に「だれでも受けとるお金」があったら？</p>
      <button type="button" class="bt-go" data-go="money">貝のお金で、もう一度</button></div>`;
  };
  const end = () => {
    try { localStorage.setItem('azakei_koukan', '1'); } catch (e) {}
    box.innerHTML = `<div class="bt-end"><p class="bt-seal-l" aria-hidden="true">貨</p>
      <div class="bt-vs"><p><span>物々交換</span><b>${res.t}</b><small>回話しかけて、${res.x} 回交換</small></p><p class="is-m"><span>お金があると</span><b>${tries}</b><small>回話しかけて、${trades} 回（売る・買う）</small></p></div>
      <p class="bt-word">物々交換は、「相手のほしい物を、自分が持っている」ことがそろわないと進みません。お金はだれもが受けとるので、<b>売る</b>と<b>買う</b>の 2 回ですみます。これが、お金の「交換の手段」という役割です。</p>
      <p class="bt-links"><a href="glossary.html#money-roles">お金の 3 つの役割</a><a href="#shinka">お金の進化を見る</a></p>
      <button type="button" class="bt-go" data-go="new">ちがう島で遊ぶ</button></div>`;
  };
  const intro = () => {
    box.innerHTML = `<div class="bt-end"><p class="bt-seal-l" aria-hidden="true">島</p>
      <p class="bt-word">あなたは魚をとる人。ほしいのは、本です。でも、本を持っている人が、魚をほしがっているとはかぎりません。島の 6 人と交換して、本を手に入れてください。</p>
      <button type="button" class="bt-go" data-go="new">島へ行く</button></div>`;
  };

  box.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) { if (g.dataset.go === 'new') { build(); reset('barter'); } else reset('money'); paint(); box.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
    const p = e.target.closest('.bt-p'); if (p && hold !== GOAL) talk(+p.dataset.i);
  });
  intro();
})();
