/* ================================================================
   cardgame.js — 経済カード勝負（Web 用に新しく作ったゲーム。会場のカードゲームとはルールが別）
   ・5 枚の「お金の置き場所」カード（預金・債券・株・外貨・起業）を、1 回に 1 枚ずつ出す
   ・ニュースの予報（2 つのうちどちらかが起きる）を読んで選ぶ → できごとが開いて、チップが増減
   ・相手（コンピューター）と 5 回勝負。チップが多いほうの勝ち
   ・記録はこのブラウザの中だけ（azakei_card_best / azakei_card_win）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-card]');
  if (!box) return;
  // カード [記号, 名前, ひとこと]
  const CARDS = [
    ['預', '預金', 'ほとんど減らない。そのかわり、増え方も小さい'],
    ['債', '債券', '安定して増える。金利が上がると値下がり'],
    ['株', '株', '景気しだいで大きく増えたり、減ったり'],
    ['外', '外貨', '円安で増えて、円高で減る'],
    ['起', '起業', '当たれば大きいけれど、外れると大きく減る']
  ];
  // できごと [記号, 名前, [預金, 債券, 株, 外貨, 起業] の増減, なぜ]
  const EV = [
    ['好', '好景気', [1, 1, 5, 1, 3], 'モノがよく売れて会社がもうかると、株価が上がりやすくなります。新しい事業も伸びやすい時期です。'],
    ['不', '不景気', [1, 3, -3, 0, -4], '会社のもうけが減ると、株価は下がりがち。金利が下がりやすく、すでに持っている債券の値段は上がります。'],
    ['安', '円安', [1, 2, 2, 4, 1], '円の価値が下がると、ドルなどの外貨を円にもどしたときに増えます。輸出する会社にも追い風です。'],
    ['高', '円高', [1, 2, 0, -3, 1], '円の価値が上がると、外貨を円にもどしたときに目減りします。'],
    ['利', '金利が上がる', [2, -1, -1, -1, -2], '預金の利息は増えます。日本の金利が上がると円が買われやすく、外貨は少し目減りしがち。また、前に買った低い金利の債券は人気がなくなって値下がりし、お金を借りて始める事業は苦しくなります。'],
    ['技', '新しい技術のブーム', [1, 2, 3, 1, 6], '新しい技術が広がると、それを使った新しい事業が大きく伸びることがあります。']
  ];
  const ROUNDS = 5, START = 10, KB = 'azakei_card_best', KW = 'azakei_card_win';
  const get = k => { try { return +localStorage.getItem(k) || 0; } catch (e) { return 0; } };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sign = n => n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '±0';
  let S;
  const fresh = () => {
    const deck = shuffle(EV.map((_, i) => i)).slice(0, ROUNDS);
    // 予報：本当に起きるできごとと、もう 1 つ（おとり）
    const hints = deck.map(e => shuffle([e, shuffle(EV.map((_, i) => i).filter(i => i !== e))[0]]));
    return { r: 0, deck, hints, me: [0, 1, 2, 3, 4], cpu: [0, 1, 2, 3, 4], my: START, op: START, log: [], busy: false };
  };
  // 相手の作戦：予報の 2 つの平均がいちばん大きいカード（ときどき気まぐれ）
  const cpuPick = () => {
    const [a, b] = S.hints[S.r];
    const ev = S.cpu.map(c => [c, (EV[a][2][c] + EV[b][2][c]) / 2 + (Math.random() - .5) * 1.6]);
    ev.sort((x, y) => y[1] - x[1]);
    return ev[0][0];
  };
  const cardHtml = (c, cls = '', tag = 'button') => `<${tag} ${tag === 'button' ? 'type="button" ' : ''}class="cg-card ${cls}" data-c="${c}"><span class="cg-seal">${CARDS[c][0]}</span><b>${CARDS[c][1]}</b><small>${CARDS[c][2]}</small></${tag}>`;
  function draw() {
    const done = S.r >= ROUNDS;
    const h = S.hints[Math.min(S.r, ROUNDS - 1)];
    box.innerHTML = `<div class="cg-top">
        <div class="cg-score"><p>あなた</p><b data-my>${S.my}</b><small>枚</small></div>
        <div class="cg-round">${done ? '勝負あり' : `${S.r + 1} / ${ROUNDS} 回戦`}</div>
        <div class="cg-score is-op"><p>相手</p><b data-op>${S.op}</b><small>枚</small></div>
      </div>
      ${done ? '' : `<div class="cg-news"><p class="cg-news-k">ニュースの予報</p><p class="cg-news-t">次に起きるのは、<b>${EV[h[0]][1]}</b> か <b>${EV[h[1]][1]}</b> のどちらか。</p></div>
      <div class="cg-table"><div class="cg-slot" data-slot="me"><span>あなたのカード</span></div><div class="cg-ev" aria-live="polite"><span class="cg-ev-back">？</span></div><div class="cg-slot" data-slot="op"><span>相手のカード</span></div></div>
      <p class="cg-hand-k">出すカードを選んでください</p>
      <div class="cg-hand">${S.me.map(c => cardHtml(c)).join('')}</div>`}
      <div class="cg-log">${S.log.map(l => `<p>${l}</p>`).join('')}</div>
      <div class="cg-end"></div>`;
    if (done) finish();
    box.querySelectorAll('.cg-hand .cg-card').forEach(b => b.addEventListener('click', () => play(+b.dataset.c)));
  }
  function play(c) {
    if (S.busy) return; S.busy = true;
    const o = cpuPick(), e = S.deck[S.r], d = EV[e][2];
    S.me = S.me.filter(x => x !== c); S.cpu = S.cpu.filter(x => x !== o);
    box.querySelectorAll('.cg-hand .cg-card').forEach(b => { b.disabled = true; if (+b.dataset.c === c) b.classList.add('is-out'); });
    box.querySelector('[data-slot="me"]').innerHTML = cardHtml(c, 'is-in', 'div');
    box.querySelector('[data-slot="op"]').innerHTML = cardHtml(o, 'is-in is-back', 'div');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => {
      box.querySelector('[data-slot="op"] .cg-card').classList.remove('is-back');
      const ev = box.querySelector('.cg-ev');
      ev.innerHTML = `<span class="cg-ev-front"><i>${EV[e][0]}</i><b>${EV[e][1]}</b></span>`;
      ev.classList.add('is-open');
    }, reduce ? 0 : 650);
    setTimeout(() => {
      const a = d[c], b = d[o];
      S.my = Math.max(0, S.my + a); S.op = Math.max(0, S.op + b);
      const res = a > b ? '<em class="w">この回はあなた</em>' : a < b ? '<em class="l">この回は相手</em>' : '<em>この回は引き分け</em>';
      S.log.unshift(`<span class="cg-log-n">${S.r + 1}</span><b>${EV[e][1]}</b>　あなた：${CARDS[c][1]} ${sign(a)}　相手：${CARDS[o][1]} ${sign(b)}　${res}<br><small>${EV[e][3]}</small>`);
      S.r++; S.busy = false;
      draw();
    }, reduce ? 300 : 1700);
  }
  function finish() {
    const win = S.my > S.op, tie = S.my === S.op;
    let best = get(KB), wins = get(KW);
    if (S.my > best) { best = S.my; try { localStorage.setItem(KB, best); } catch (e) {} }
    if (win && !S.saved) { wins++; try { localStorage.setItem(KW, wins); } catch (e) {} }
    S.saved = true;
    const end = box.querySelector('.cg-end');
    end.innerHTML = `<p class="cg-end-k">${win ? 'あなたの勝ち' : tie ? '引き分け' : '相手の勝ち'}</p>
      <p class="cg-end-n">チップ <b>${S.my}</b> 枚 <span>（相手 ${S.op} 枚）</span></p>
      <p class="cg-end-s">自己ベスト ${best} 枚・これまでの勝ち ${wins} 回</p>
      <p class="cg-end-m">${win ? '予報を読んで、増えそうな場所にお金を置けました。' : '大きく増えるカードは、外れると大きく減ります。予報の 2 つのどちらが起きても困らないカードを選ぶのも、リスクマネジメントです。'}</p>
      <button type="button" class="cn-next cg-again">もう一度勝負する</button>`;
    end.querySelector('.cg-again').addEventListener('click', () => { S = fresh(); draw(); box.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  }
  S = fresh(); draw();
})();
