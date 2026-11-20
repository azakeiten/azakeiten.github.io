/* ================================================================
   cardgame.js — あそび場：経済カード勝負（Web 用に新しく作ったゲーム。会場のカードゲームとはルールが別・近づいてから読みこむ）
   ・5 枚の「お金の置き場所」カード（預金・債券・株・外貨・起業）を、1 回に 1 枚ずつ出す。5 回戦
   ・ニュースの予報は 2 つのできごとと、その確率（たとえば 好景気 70% ／ 不景気 30%）
   ・チップ 1 枚で「取材」すると、記者のメモ（85% 当たる）で確率が読みなおせる
   ・カードには、予報の 2 つが起きたときの増減が書いてある。賭ける倍率（×1〜×3）もえらぶ
   ・相手（コンピューター）には性格がある（慎重派・強気派・読み上手）
   ・終わりに、毎回の「えらんだ手の期待値」と「いちばん期待値が高かった手」をくらべる
   ・数字は遊びのための「たとえ」。見た目は cardgame.css（このファイルが読みこむ）
   ・記録はこのブラウザの中だけ（azakei_card_best / azakei_card_win）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-card]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="cardgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'cardgame.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const CARDS = [
    ['預', '預金', 'ほとんど減らない。増え方も小さい'],
    ['債', '債券', '安定して増える。金利が上がると値下がり'],
    ['株', '株', '景気しだいで大きく増えたり減ったり'],
    ['外', '外貨', '円安で増えて、円高で減る'],
    ['起', '起業', '当たれば大きい。外れると大きく減る']
  ];
  const EV = [
    ['好', '好景気', [1, 1, 5, 1, 3], 'モノがよく売れて会社がもうかると、株価が上がりやすくなります。新しい事業も伸びやすい時期です。'],
    ['不', '不景気', [1, 3, -3, 0, -4], '会社のもうけが減ると、株価は下がりがち。金利が下がりやすく、すでに持っている債券の値段は上がります。'],
    ['安', '円安', [1, 2, 2, 4, 1], '円の価値が下がると、ドルなどの外貨を円にもどしたときに増えます。輸出する会社にも追い風です。'],
    ['高', '円高', [1, 2, 0, -3, 1], '円の価値が上がると、外貨を円にもどしたときに目減りします。'],
    ['利', '金利が上がる', [2, -1, -1, -1, -2], '預金の利息は増えます。前に買った低い金利の債券は値下がりし、お金を借りて始める事業は苦しくなります。'],
    ['技', '新しい技術のブーム', [1, 2, 3, 1, 6], '新しい技術が広がると、それを使った新しい事業が大きく伸びることがあります。']
  ];
  const PERS = [['慎', '慎重派', '倍率はほとんど上げない。大きく減るカードはさける'], ['強', '強気派', 'よく倍率を上げてくる。当たれば大きい'], ['読', '読み上手', '確率が五分五分なら取材して、期待値で選ぶ']];
  const ROUNDS = 5, START = 10, KB = 'azakei_card_best', KW = 'azakei_card_win', MEMO = .85;
  const get = k => { try { return +localStorage.getItem(k) || 0; } catch (e) { return 0; } };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sign = n => n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '±0';
  const pct = p => Math.round(p * 100) + '%';
  const post = (p, saysA) => saysA ? MEMO * p / (MEMO * p + (1 - MEMO) * (1 - p)) : (1 - MEMO) * p / ((1 - MEMO) * p + MEMO * (1 - p));
  const evOf = (c, R, p) => p * EV[R.a][2][c] + (1 - p) * EV[R.b][2][c];
  let S;
  const fresh = () => {
    const rounds = Array.from({ length: ROUNDS }, () => {
      const [a, b] = shuffle(EV.map((_, i) => i)); const p = [.5, .6, .7, .8][Math.random() * 4 | 0];
      const t = Math.random() < p ? a : b; const memoA = Math.random() < MEMO ? t === a : t !== a;
      return { a, b, p, t, memoA };
    });
    return { r: 0, rounds, me: [0, 1, 2, 3, 4], cpu: [0, 1, 2, 3, 4], my: START, op: START, pick: null, stake: 1, scoop: false, busy: false, hist: [], pers: PERS[Math.random() * 3 | 0] };
  };
  const curP = () => { const R = S.rounds[S.r]; return S.scoop ? post(R.p, R.memoA) : R.p; };

  const cpuMove = () => {
    const R = S.rounds[S.r], P = S.pers[0];
    let p = R.p, scoop = false;
    if (P === '読' && Math.abs(R.p - .5) < .15 && S.op > 4) { p = post(R.p, R.memoA); scoop = true; }
    const score = c => { const e = evOf(c, R, p), lo = Math.min(EV[R.a][2][c], EV[R.b][2][c]); return P === '慎' ? e + Math.min(0, lo) * .6 : P === '強' ? e + Math.max(EV[R.a][2][c], EV[R.b][2][c]) * .25 : e; };
    const c = S.cpu.slice().sort((x, y) => score(y) - score(x) + (Math.random() - .5) * .4)[0], e = evOf(c, R, p);
    let st = 1;
    if (P === '強') st = e > 1 ? 3 : e > 0 ? 2 : 1;
    else if (P === '読') st = e > 2 ? 3 : e > 1 ? 2 : 1;
    else st = e > 2.5 && Math.min(EV[R.a][2][c], EV[R.b][2][c]) >= 0 ? 2 : 1;
    const avail = S.op - (scoop ? 1 : 0);
    return { c, st: Math.max(1, Math.min(st, avail)), scoop };
  };
  const cardHtml = (c, cls = '', tag = 'button', R) => {
    const o = R ? `<span class="cg-oc"><span class="${EV[R.a][2][c] >= 0 ? 'is-up' : 'is-dn'}">${EV[R.a][1]}<b>${sign(EV[R.a][2][c])}</b></span><span class="${EV[R.b][2][c] >= 0 ? 'is-up' : 'is-dn'}">${EV[R.b][1]}<b>${sign(EV[R.b][2][c])}</b></span></span>` : `<small>${CARDS[c][2]}</small>`;
    return `<${tag} ${tag === 'button' ? 'type="button" ' : ''}class="cg-card ${cls}" data-c="${c}"><span class="cg-seal">${CARDS[c][0]}</span><b class="cg-nm">${CARDS[c][1]}</b>${o}</${tag}>`;
  };
  const chips = n => `<span class="cg-stack" aria-hidden="true">${'<i></i>'.repeat(Math.min(12, Math.max(0, n)))}</span>`;

  function draw() {
    const done = S.r >= ROUNDS || S.my <= 0 || S.op <= 0;
    if (done) return finish();
    const R = S.rounds[S.r], p = curP();
    box.innerHTML = `<div class="cg-top">
        <div class="cg-score"><p>あなた</p>${chips(S.my)}<b data-my>${S.my}</b><small>枚</small></div>
        <div class="cg-round"><b>${S.r + 1}</b><small> / ${ROUNDS} 回戦</small></div>
        <div class="cg-score is-op"><p>相手<span class="cg-pers" title="${S.pers[2]}">${S.pers[1]}</span></p>${chips(S.op)}<b data-op>${S.op}</b><small>枚</small></div>
      </div>
      <div class="cg-news"><p class="cg-news-k">ニュースの予報</p>
        <div class="cg-fc">${[[R.a, p], [R.b, 1 - p]].map(([e, q]) => `<div class="cg-fe"><span class="cg-fi">${EV[e][0]}</span><b>${EV[e][1]}</b><span class="cg-pb"><i style="width:${Math.round(q * 100)}%"></i></span><em>${pct(q)}</em></div>`).join('')}</div>
        <div class="cg-scoop">${S.scoop ? `<p class="cg-memo"><b>記者のメモ</b>「どうやら<em>${EV[R.memoA ? R.a : R.b][1]}</em>になりそうです」<small>メモは 85% 当たる。予報を ${pct(R.p)} から ${pct(p)} に読みなおしました</small></p>` : `<button type="button" class="cg-scoop-b" ${S.my < 2 ? 'disabled' : ''}>取材する<small>チップ 1 枚・85% 当たるメモ</small></button><p class="cg-scoop-t">確率が五分五分に近いときほど、取材が役に立ちます。</p>`}</div>
      </div>
      <div class="cg-table"><div class="cg-slot" data-slot="me"><span>あなた</span></div><div class="cg-ev" aria-live="polite"><span class="cg-reel"><b>？</b></span></div><div class="cg-slot" data-slot="op"><span>相手</span></div></div>
      <p class="cg-hand-k">出すカードをえらぶ<small>カードの数字は、予報の 2 つが起きたときのチップの増減</small></p>
      <div class="cg-hand">${S.me.map(c => cardHtml(c, S.pick === c ? 'is-pick' : '', 'button', R)).join('')}</div>
      <div class="cg-bet"><p>賭ける倍率<small>増えるのも減るのも、この倍</small></p><div class="cg-seg">${[1, 2, 3].map(k => `<button type="button" data-st="${k}" aria-pressed="${S.stake === k}" ${k > S.my ? 'disabled' : ''}>×${k}</button>`).join('')}</div>
        <button type="button" class="cg-go" ${S.pick === null ? 'disabled' : ''}>${S.pick === null ? 'カードをえらんでください' : `${CARDS[S.pick][1]} ×${S.stake} で勝負`}</button></div>
      <div class="cg-log">${S.hist.map(h => h.html).join('')}</div>`;
  }

  async function play() {
    if (S.busy || S.pick === null) return; S.busy = true;
    const R = S.rounds[S.r], c = S.pick, st = S.stake, p = curP(), o = cpuMove();
    const myBest = S.me.reduce((b, x) => evOf(x, R, p) > evOf(b, R, p) ? x : b, S.me[0]);
    S.me = S.me.filter(x => x !== c); S.cpu = S.cpu.filter(x => x !== o.c);
    if (o.scoop) S.op--;
    box.querySelectorAll('.cg-hand .cg-card, .cg-seg button, .cg-go, .cg-scoop-b').forEach(b => { b.disabled = true; });
    box.querySelector(`.cg-hand .cg-card[data-c="${c}"]`)?.classList.add('is-out');
    box.querySelector('[data-slot="me"]').innerHTML = cardHtml(c, 'is-in', 'div') + `<span class="cg-x">×${st}</span>`;
    await sleep(350);
    box.querySelector('[data-slot="op"]').innerHTML = cardHtml(o.c, 'is-in is-back', 'div') + `<span class="cg-x">×${o.st}</span>`;
    if (o.scoop) box.querySelector('[data-slot="op"]').insertAdjacentHTML('beforeend', '<span class="cg-oscoop">相手も取材した</span>');
    // 予報の 2 つのあいだで、くるくる回ってから止まる
    const reel = box.querySelector('.cg-reel b');
    if (!reduce) { const n = 9 + (R.t === R.a ? 0 : 1); for (let k = 0; k < n; k++) { reel.textContent = EV[k % 2 ? R.b : R.a][1]; reel.parentNode.classList.toggle('is-tick'); await sleep(70 + k * 22); } }
    const ev = box.querySelector('.cg-ev'); ev.innerHTML = `<span class="cg-ev-front"><i>${EV[R.t][0]}</i><b>${EV[R.t][1]}</b></span>`; ev.classList.add('is-open');
    await sleep(500);
    box.querySelector('[data-slot="op"] .cg-card').classList.remove('is-back');
    const a = EV[R.t][2][c] * st, b = EV[R.t][2][o.c] * o.st;
    S.my = Math.max(0, S.my + a); S.op = Math.max(0, S.op + b);
    [['me', a], ['op', b]].forEach(([k, v]) => { const s = document.createElement('span'); s.className = 'cg-gain ' + (v >= 0 ? 'is-up' : 'is-dn'); s.textContent = sign(v); box.querySelector(`[data-slot="${k}"]`).appendChild(s); });
    box.querySelector('[data-my]').textContent = S.my; box.querySelector('[data-op]').textContent = S.op;
    const res = a > b ? '<em class="w">この回はあなた</em>' : a < b ? '<em class="l">この回は相手</em>' : '<em>引き分け</em>';
    const myE = evOf(c, R, p) * st;
    S.hist.unshift({ myE, a, html: `<p><span class="cg-log-n">${S.r + 1}</span><b>${EV[R.t][1]}</b>（予報 ${pct(R.t === R.a ? p : 1 - p)}）　あなた：${CARDS[c][1]}×${st} <strong class="${a >= 0 ? 'is-up' : 'is-dn'}">${sign(a)}</strong>　相手：${CARDS[o.c][1]}×${o.st} <strong class="${b >= 0 ? 'is-up' : 'is-dn'}">${sign(b)}</strong>　${res}<br><small>${EV[R.t][3]}</small></p>`, card: c, st, best: myBest, p: R.p });
    await sleep(1400);
    S.r++; S.pick = null; S.stake = 1; S.scoop = false; S.busy = false;
    draw();
  }

  function finish() {
    const win = S.my > S.op, tie = S.my === S.op;
    let best = get(KB), wins = get(KW);
    const nb = S.my > best;
    if (nb) { best = S.my; try { localStorage.setItem(KB, best); } catch (e) {} }
    if (win && !S.saved) { wins++; try { localStorage.setItem(KW, wins); } catch (e) {} }
    S.saved = true;
    const H = S.hist.slice().reverse();
    const tips = [];
    if (H.some(h => h.st === 3 && h.a < 0)) tips.push('×3 で外れると、大きく減ります。倍率を上げるのは、期待値が高く、外れても減りが小さいときに。');
    if (H.filter(h => h.card === h.best).length >= 4) tips.push('ほとんどの回で、期待値がいちばん高いカードをえらべていました。');
    else tips.push('「確率 × 増減」を足した期待値でくらべると、迷ったときの目安になります。たとえば好景気 70%・不景気 30% の株は 0.7×5 ＋ 0.3×(−3) ＝ 2.6。');
    tips.push('カードは 1 回ずつしか使えません。強いカードをどの回に使うかも作戦です。現実の投資でも、置き場所を分けておくと、外れたときのダメージが小さくなります（分散）。');
    box.innerHTML = `<div class="cg-fin"><span class="cg-stamp" aria-hidden="true">${win ? '勝' : tie ? '分' : '負'}</span>
      <p class="cg-end-k">${win ? 'あなたの勝ち' : tie ? '引き分け' : '相手の勝ち'}<small>相手は${S.pers[1]}</small></p>
      <p class="cg-end-n">チップ <b>${S.my}</b> 枚 <span>（相手 ${S.op} 枚）</span>${nb ? '<em>自己ベスト</em>' : ''}</p>
      <p class="cg-end-s">自己ベスト ${best} 枚・これまでの勝ち ${wins} 回</p>
      <table class="cg-rv"><thead><tr><th>回</th><th>あなたの手</th><th>期待値</th><th>いちばん期待値が高い手</th></tr></thead><tbody>
        ${H.map((h, i) => `<tr><td>${i + 1}</td><td>${CARDS[h.card][1]}×${h.st}</td><td>${h.myE >= 0 ? '+' : '−'}${Math.abs(h.myE).toFixed(1)}</td><td>${h.card === h.best ? '<span class="is-same">同じカード</span>' : CARDS[h.best][1]}</td></tr>`).join('')}</tbody></table>
      <ul class="cg-tips">${tips.map(t => `<li>${t}</li>`).join('')}</ul>
      <button type="button" class="cg-again">もう一度勝負する</button></div>
      <div class="cg-log">${S.hist.map(h => h.html).join('')}</div>`;
  }

  box.addEventListener('click', e => {
    if (e.target.closest('.cg-again')) { S = fresh(); draw(); const r = box.getBoundingClientRect(); if (r.top < 0) box.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); return; }
    if (!S || S.busy) return;
    const c = e.target.closest('.cg-hand .cg-card'); if (c && !c.disabled) { S.pick = +c.dataset.c; draw(); return; }
    const k = e.target.closest('[data-st]'); if (k && !k.disabled) { S.stake = +k.dataset.st; draw(); return; }
    if (e.target.closest('.cg-scoop-b') && !S.scoop && S.my >= 2) { S.my--; S.scoop = true; if (S.stake > S.my) S.stake = S.my; draw(); return; }
    if (e.target.closest('.cg-go')) play();
  });
  S = fresh(); draw();
})();
