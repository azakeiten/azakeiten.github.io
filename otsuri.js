/* ================================================================
   otsuri.js — クイズ：「おつりの達人」（60 秒タイムアタック）
   ・お店の人になって、1,000 円札で払ったお客さんにおつりをわたす
   ・お金のボタンを押してトレーに出し、「わたす」。ぴったりで 1 点、いちばん少ない枚数なら +1 点
   ・お金の絵は、本物に似せない丸と四角（金額の数字だけ）。自己ベストはこのブラウザの中だけ
   ================================================================ */
(function() {
  const box = document.querySelector('[data-otsuri]');
  if (!box) return;
  const COINS = [500, 100, 50, 10, 5, 1];
  // 品物と、だいたいの値段のはば（たとえ）
  const ITEMS = [['おにぎり', 100, 250], ['ノート', 100, 350], ['ジュース', 100, 220], ['えんぴつ', 50, 150], ['パン', 100, 320], ['お菓子', 50, 400], ['お弁当', 380, 980], ['ドーナツ', 100, 260], ['牛乳', 120, 280], ['シール', 100, 500], ['絵の具', 300, 900], ['本', 450, 990]];
  const TIME = 60, BK = 'azakei_otsuri_best';
  let best = 0; try { best = +localStorage.getItem(BK) || 0; } catch (e) {}
  let price, change, tray, score, left, timer, combo;
  const fewest = n => COINS.reduce((a, c) => { a += Math.floor(n / c); n %= c; return a; }, 0);
  const coinHTML = (v, tag = 'button') => `<${tag}${tag === 'button' ? ' type="button"' : ''} class="ot-c ot-${v}" data-v="${v}" aria-label="${v} 円">${v}</${tag}>`;

  const intro = () => {
    clearInterval(timer);
    box.innerHTML = `<div class="ot-intro"><p class="ot-rule">お店の人になって、おつりをわたそう。お客さんは 1,000 円札で払います。<br>お金のボタンを押してトレーに出し、「わたす」。<b>ぴったりで 1 点</b>、<b>いちばん少ない枚数なら +1 点</b>。${TIME} 秒で何点とれるかな。</p>
      ${best ? `<p class="ot-best">これまでの最高 <b>${best}</b> 点</p>` : ''}<button type="button" class="ot-start">はじめる</button></div>`;
  };
  const sumT = () => tray.reduce((a, b) => a + b, 0);
  const next = () => {
    const it = ITEMS[Math.random() * ITEMS.length | 0];
    price = it[1] + Math.floor(Math.random() * (it[2] - it[1] + 1));
    change = 1000 - price; tray = [];
    const item = it[0];
    box.querySelector('.ot-q').innerHTML = `<span class="ot-item">${item}</span><b>${price.toLocaleString('ja-JP')}</b> 円。<span class="ot-paid">1,000 円をもらいました。</span>`;
    paint();
  };
  const paint = () => {
    box.querySelector('.ot-tray').innerHTML = tray.length ? tray.map((v, i) => `<button type="button" class="ot-c ot-${v} is-in" data-i="${i}" aria-label="${v} 円をもどす">${v}</button>`).join('') : '<span class="ot-empty">ここにおつりを出す</span>';
    box.querySelector('.ot-sum').innerHTML = `トレー <b>${sumT().toLocaleString('ja-JP')}</b> 円`;
  };
  const start = () => {
    score = 0; left = TIME; combo = 0;
    box.innerHTML = `<div class="ot-top"><p class="ot-score">得点 <b>0</b></p><div class="ot-time" aria-hidden="true"><i></i></div><p class="ot-left"><b>${TIME}</b> 秒</p></div>
      <p class="ot-q" aria-live="polite"></p>
      <div class="ot-trayw"><div class="ot-tray"></div><p class="ot-sum"></p></div>
      <div class="ot-pad">${COINS.map(v => coinHTML(v)).join('')}</div>
      <div class="ot-act"><button type="button" class="ot-clear">やりなおす</button><button type="button" class="ot-give">わたす</button></div>
      <p class="ot-msg" aria-live="polite"></p>`;
    const bar = box.querySelector('.ot-time i');
    bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; void bar.offsetWidth;
    bar.style.transition = `transform ${TIME}s linear`; bar.style.transform = 'scaleX(0)';
    next();
    clearInterval(timer);
    timer = setInterval(() => { left--; const l = box.querySelector('.ot-left b'); if (l) l.textContent = left; if (left <= 0) end(); }, 1000);
  };
  const end = () => {
    clearInterval(timer);
    const nb = score > best; if (nb) { best = score; try { localStorage.setItem(BK, best); } catch (e) {} }
    const word = score >= 20 ? 'レジの達人です。' : score >= 12 ? 'たのもしいお店の人。' : score >= 6 ? 'いい調子。もう一回で、もっと速く。' : 'まずは、大きいお金から考えるのがコツ。';
    box.innerHTML = `<div class="ot-end"><p class="ot-seal" aria-hidden="true">${score >= 20 ? '達' : score >= 12 ? '良' : '釣'}</p>
      <p class="ot-res"><b>${score}</b> 点${nb && score ? '<em>最高記録</em>' : ''}</p><p class="ot-word">${word}</p>
      <p class="ot-tip">コツ：おつりの「百の位・十の位・一の位」を、大きいお金から順に考えると、枚数がいちばん少なくなります。</p>
      <button type="button" class="ot-start">もう一度</button></div>`;
  };
  box.addEventListener('click', e => {
    if (e.target.closest('.ot-start')) { start(); return; }
    if (left <= 0 || !box.querySelector('.ot-pad')) return;
    const c = e.target.closest('.ot-pad .ot-c'); if (c) { tray.push(+c.dataset.v); tray.sort((a, b) => b - a); paint(); return; }
    const t = e.target.closest('.ot-tray .ot-c'); if (t) { tray.splice(+t.dataset.i, 1); paint(); return; }
    if (e.target.closest('.ot-clear')) { tray = []; paint(); return; }
    if (e.target.closest('.ot-give')) {
      const msg = box.querySelector('.ot-msg');
      if (sumT() !== change) {
        combo = 0;
        msg.className = 'ot-msg is-ng';
        msg.textContent = sumT() < change ? `あと ${(change - sumT()).toLocaleString('ja-JP')} 円たりません。` : `${(sumT() - change).toLocaleString('ja-JP')} 円わたしすぎです。`;
        return;
      }
      const min = fewest(change), ok = tray.length === min;
      score += ok ? 2 : 1; combo = ok ? combo + 1 : 0;
      box.querySelector('.ot-score b').textContent = score;
      msg.className = 'ot-msg is-ok';
      msg.textContent = ok ? `ぴったり、しかも最少の ${min} 枚。+2 点${combo >= 3 ? `（${combo} 回つづけて）` : ''}` : `ぴったり。+1 点（${min} 枚でもわたせます）`;
      next();
    }
  });
  intro();
})();
