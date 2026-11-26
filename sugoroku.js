/* ================================================================
   sugoroku.js — あそび場：経済すごろく（12 回ふって、1,000 円をいくらにできる？・近づいてから読みこむ）
   ・お金の置き場所は 3 つ。財布（使える）・貯金（毎回 3% の利息、おろすときはその回に 1 度だけ手数料 110 円）・投資（株価で増えたり減ったり）
   ・サイコロは 2 つふって、進む目を自分でえらぶ。ふる前に、置き場所を 100 円ずつ動かせる。「景気予報」は、次の株価の動きを 4 回に 3 回当てる
   ・止まったマスの支払いは財布から。足りなければ「貯金をおろす・投資を売る・借りる（次の給料で 2 割増しで返す）」をえらぶ
   ・好景気・不景気・配当・もうけ話（「絶対もうかる」は詐欺）・保険のマスも。点＝最後の財布＋貯金＋投資−借金
   ・ルールと金額は遊びのための「たとえ」。見た目は sugoroku.css（このファイルが読みこむ）。自己ベストは azakei_sugo_best
   ================================================================ */
(function () {
  const box = document.querySelector('[data-sugo]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="sugoroku.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'sugoroku.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const KEY = 'azakei_sugo_best', TURNS = 12, START = 1000, PAY = 500, FEE = 110;
  // [印, 名前, 種類, 金額]
  const SQ = [
    ['始', 'スタート', 'start', 0], ['小', 'おこづかい', 'in', 200], ['買', '買い物', 'out', 300], ['景', '好景気', 'boom', 20],
    ['税', '住民税', 'out', 150], ['利', 'ボーナス利息', 'int', 5], ['損', 'スマホが割れた', 'hap', 600], ['売', 'フリマで売れた', 'in', 250],
    ['配', '株の配当', 'div', 5], ['保', '保険に入る？', 'ins', 100], ['祝', '誕生日', 'in', 400], ['誘', 'もうけ話', 'scam', 500],
    ['落', '不景気', 'bust', 25], ['損', '自転車がパンク', 'hap', 300], ['病', 'かぜでお休み', 'hap', 400], ['手', 'お手伝い', 'in', 300]
  ];
  const POS = [[1,1],[1,2],[1,3],[1,4],[1,5],[2,5],[3,5],[4,5],[5,5],[5,4],[5,3],[5,2],[5,1],[4,1],[3,1],[2,1]];
  const yen = n => Math.round(n).toLocaleString('ja-JP') + ' 円';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const PIP = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
  const dieHTML = n => Array.from({ length: 9 }, (_, i) => `<i${PIP[n].includes(i + 1) ? ' class="is-on"' : ''}></i>`).join('');
  let best = 0; try { best = +localStorage.getItem(KEY) || 0; } catch (e) {}

  box.innerHTML = `
    <div class="sg-board">
      ${SQ.map((s, i) => `<div class="sg-sq is-${s[2]}" style="grid-row:${POS[i][0]};grid-column:${POS[i][1]}" data-i="${i}"><span aria-hidden="true">${s[0]}</span><small>${s[1]}</small></div>`).join('')}
      <div class="sg-center">
        <p class="sg-turn"><b data-o="turn">1</b> 回目<small> / ${TURNS} 回</small><span data-o="ins" hidden>保険あり</span></p>
        <button type="button" class="sg-roll"><span class="sg-dice" aria-hidden="true"><span class="sg-die" data-o="die">${dieHTML(1)}</span><span class="sg-die" data-o="die2">${dieHTML(2)}</span></span><span data-o="rollt">サイコロをふる</span></button>
        <div class="sg-choice" data-o="choice" hidden></div>
        <ol class="sg-log" data-o="log" aria-live="polite"></ol>
      </div>
      <span class="sg-token" data-o="token" aria-hidden="true">駒</span>
    </div>
    <div class="sg-side">
      <div class="sg-res" data-o="res" aria-live="polite" hidden></div>
      <div class="sg-fc" data-o="fc"></div>
      <div class="sg-pk">
        <div class="sg-p is-w"><p><small>財布</small><b data-o="w"></b></p><em>止まったマスの支払いは、ここから</em></div>
        <div class="sg-p is-b"><p><small>貯金</small><b data-o="b"></b></p><em>毎回 3% の利息。おろすときは、その回に 1 度だけ手数料 ${FEE} 円</em><div class="sg-mv"><button type="button" data-mv="b+">入れる</button><button type="button" data-mv="b-">おろす</button></div></div>
        <div class="sg-p is-v"><p><small>投資</small><b data-o="v"></b></p><em>株価に合わせて増えたり減ったり</em><div class="sg-mv"><button type="button" data-mv="v+">買う</button><button type="button" data-mv="v-">売る</button></div></div>
      </div>
      <p class="sg-step">1 回押すごとに 100 円ずつ動かせます</p>
      <div class="sg-mk"><p><small>株価</small><b data-o="idx">100</b><span data-o="chg"></span></p><svg data-o="chart" viewBox="0 0 240 70" aria-hidden="true"></svg></div>
      <p class="sg-total">合計 <b data-o="tot"></b><span data-o="debt" hidden></span></p>
    </div>
    <p class="sg-best">自己ベスト <b data-o="best">${best ? yen(best) : '—'}</b></p>
    <p class="in-foot">※ マスの金額・利息・株価の動きは、遊ぶための「たとえ」です。スタートを通るたびに給料 ${PAY} 円。</p>`;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const board = box.querySelector('.sg-board'), token = $('token'), roll = box.querySelector('.sg-roll');
  let st;
  const fc = () => { const up = Math.random() < .55; const move = up ? .06 + Math.random() * .22 : -(.06 + Math.random() * .22); st.next = move; st.fcUp = Math.random() < .75 ? up : !up; };
  const reset = () => {
    st = { pos: 0, w: START, b: 0, v: 0, debt: 0, idx: 100, hist: [100], tot: [START], ins: false, busy: false, over: false, turn: 1, fees: 0, borrowed: 0, scam: 0, scamNo: 0, crash: 0, interest: 0, sold: 0 };
    fc(); $("res").hidden = true; $("log").innerHTML = ""; log('作戦タイム。景気予報を見て、財布のお金を貯金や投資に動かしてから、サイコロをふろう。'); moveToken(0); paint();
  };
  const total = () => st.w + st.b + st.v - st.debt;
  const paint = () => {
    $('w').textContent = yen(st.w); $('b').textContent = yen(st.b); $('v').textContent = yen(st.v);
    $('turn').textContent = Math.min(st.turn, TURNS); $('ins').hidden = !st.ins;
    $('idx').textContent = Math.round(st.idx);
    const c = st.hist.length > 1 ? st.hist[st.hist.length - 1] / st.hist[st.hist.length - 2] - 1 : 0;
    $('chg').textContent = c ? `${c > 0 ? '＋' : '−'}${Math.abs(Math.round(c * 100))}%` : ''; $('chg').className = c > 0 ? 'is-up' : c < 0 ? 'is-down' : '';
    $('tot').textContent = yen(total());
    $('debt').hidden = !st.debt; $('debt').textContent = st.debt ? `借金 ${yen(st.debt)}（次の給料で 2 割増しで返す）` : '';
    $('fc').innerHTML = st.over ? '' : `<span class="sg-sky is-${st.fcUp ? 'up' : 'down'}" aria-hidden="true"></span><p><small>景気予報（4 回に 3 回当たる）</small><b>${st.fcUp ? '次は、株価が上がりそう' : '次は、株価が下がりそう'}</b></p>`;
    const lock = st.busy || st.over;
    box.querySelectorAll('[data-mv]').forEach(btn => { const k = btn.dataset.mv; btn.disabled = lock || (k[1] === '+' ? st.w < 100 : (k[0] === "b" ? st.b <= (st.feeT === st.turn ? 0 : FEE) : st.v < 1)); });
    drawChart();
  };
  const drawChart = () => {
    const h = st.hist, max = Math.max(140, ...h), min = Math.min(60, ...h), X = i => 6 + i * (228 / TURNS), Y = v => 62 - (v - min) / (max - min) * 54;
    $('chart').innerHTML = `<line x1="6" x2="234" y1="${Y(100).toFixed(1)}" y2="${Y(100).toFixed(1)}" class="sg-c-base"/><polyline class="sg-c-l" points="${h.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}"/><circle class="sg-c-pt" cx="${X(h.length - 1).toFixed(1)}" cy="${Y(h[h.length - 1]).toFixed(1)}" r="4"/>`;
  };
  const log = (t, cls) => { const li = document.createElement('li'); li.className = cls || ''; li.innerHTML = t; $('log').prepend(li); while ($('log').children.length > 3) $('log').lastChild.remove(); };
  const moveToken = i => {
    const sq = box.querySelector(`.sg-sq[data-i="${i}"]`), b = board.getBoundingClientRect(), r = sq.getBoundingClientRect();
    token.style.transform = `translate(${r.left - b.left + r.width / 2 - 15}px, ${r.top - b.top + r.height / 2 - 15}px)`;
    box.querySelectorAll('.sg-sq').forEach(x => x.classList.toggle('is-here', x === sq));
  };
  const pop = (amt, where) => {
    const sq = where || box.querySelector('.sg-sq.is-here'); if (!sq || !amt || reduce) return;
    const p = document.createElement('span'); p.className = 'sg-pop ' + (amt > 0 ? 'is-up' : 'is-down'); p.textContent = (amt > 0 ? '+' : '−') + Math.abs(Math.round(amt)).toLocaleString('ja-JP');
    sq.appendChild(p); setTimeout(() => p.remove(), 1100);
  };
  const flash = k => { const e = box.querySelector('.sg-p.is-' + k); if (!e || reduce) return; e.classList.remove('is-hit'); void e.offsetWidth; e.classList.add('is-hit'); };
  const ask = (html, opts) => new Promise(res => {
    const c = $('choice'); c.innerHTML = `<p>${html}</p><div>${opts.map((o, i) => o ? `<button type="button" data-c="${i}">${o}</button>` : '').join('')}</div>`; c.hidden = false; roll.hidden = true;
    c.onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; c.hidden = true; roll.hidden = false; res(+b.dataset.c); };
  });
  /* 財布から払う。足りなければ、どうやって用意するかをえらぶ */
  const pay = async (amt, why) => {
    while (st.w < amt) {
      const need = amt - st.w;
      const c = await ask(`${why}で ${yen(amt)} 必要。財布は ${yen(st.w)}、あと <b>${yen(need)}</b> 足りない。<small>どうやって用意する？</small>`,
        [st.b >= need + (st.feeT === st.turn ? 0 : FEE) ? `貯金をおろす${st.feeT === st.turn ? "" : `（手数料 ${FEE} 円）`}` : "", st.v >= need ? `投資を売る（いまの株価で）` : '', '借りる（次の給料で 2 割増しで返す）']);
      if (c === 0) { const f = st.feeT === st.turn ? 0 : FEE; st.b -= need + f; st.w += need; st.fees += f; st.feeT = st.turn; log(`貯金をおろした${f ? `（手数料 −${FEE} 円）` : ""}`, "is-down"); flash("b"); }
      else if (c === 1) { st.v -= need; st.w += need; st.sold++; log(`投資を ${yen(need)} 分売った`, ''); flash('v'); }
      else { st.debt += need; st.w += need; st.borrowed += need; log(`${yen(need)} 借りた`, 'is-down'); }
      paint();
    }
    st.w -= amt; pop(-amt); flash('w'); log(`${why}　−${yen(amt)}`, 'is-down'); paint();
  };
  const gain = (amt, why) => { st.w += amt; pop(amt); flash('w'); log(`${why}　+${yen(amt)}`, 'is-up'); paint(); };
  const payday = () => {
    let got = PAY;
    if (st.debt) { const back = Math.round(st.debt * 1.2); log(`給料から借金を返した　−${yen(back)}（借りた ${yen(st.debt)} の 2 割増し）`, 'is-down'); got -= back; st.debt = 0; }
    st.w += got; if (st.w < 0) { st.debt = Math.round(-st.w / 1.2); st.w = 0; }
    pop(PAY, box.querySelector('.sg-sq[data-i="0"]')); log(`スタートを通った。給料　+${yen(PAY)}`, 'is-up'); flash('w'); paint();
  };
  const land = async () => {
    const s = SQ[st.pos], k = s[2];
    if (k === 'in') gain(s[3], s[1]);
    else if (k === 'out') await pay(s[3], s[1]);
    else if (k === 'int') { const t = Math.floor(st.b * s[3] / 100); if (t) { st.b += t; st.interest += t; pop(t); flash('b'); log(`ボーナス利息（貯金の 5%）　+${yen(t)}`, 'is-up'); } else log('ボーナス利息…… でも貯金が 0 円なので 0 円'); paint(); }
    else if (k === 'div') { const t = Math.floor(st.v * s[3] / 100); if (t) gain(t, '株の配当（投資の 5%）'); else log('株の配当…… でも投資が 0 円なので 0 円'); }
    else if (k === 'boom' || k === 'bust') {
      const m = k === 'boom' ? 1 + s[3] / 100 : 1 - s[3] / 100, before = st.v;
      st.idx *= m; st.v = Math.round(st.v * m); st.hist[st.hist.length - 1] = st.idx;
      if (k === 'bust' && before) st.crash += before - st.v;
      log(`${s[1]}！ 株価が ${k === 'boom' ? '＋' : '−'}${s[3]}%${before ? `（投資 ${st.v - before >= 0 ? '+' : '−'}${yen(Math.abs(st.v - before))}）` : ''}`, k === 'boom' ? 'is-up' : 'is-down');
      if (before) { pop(st.v - before); flash('v'); } paint();
    } else if (k === 'hap') {
      if (st.ins) { st.ins = false; log(`${s[1]}…… でも保険で 0 円`, 'is-up'); paint(); } else await pay(s[3], s[1]);
    } else if (k === 'ins') {
      if (st.ins) { log('保険はもう入っています'); return; }
      const c = await ask(`${s[3]} 円で保険に入る？<small>次のハプニング（スマホ・自転車・かぜ）が 0 円になります</small>`, ['入る', '入らない']);
      if (c === 0) { await pay(s[3], '保険料'); st.ins = true; paint(); } else log('保険に入らなかった');
    } else if (k === 'scam') {
      const c = await ask(`知らない人から「${yen(s[3])}出せば、1 か月で必ず 2 倍。絶対にもうかる」<small>出す？</small>`, ['出す', 'ことわる']);
      if (c === 0) { await pay(s[3], 'もうけ話'); st.scam++; log('……その人とは、もう連絡がとれない。「絶対もうかる」は詐欺の決まり文句', 'is-down'); }
      else { st.scamNo++; log('ことわった。「絶対もうかる」と言う話は、まず疑う', 'is-up'); }
    }
  };
  const endTurn = () => {
    const bi = Math.floor(st.b * .03); st.b += bi; st.interest += bi;
    const before = st.v; st.idx *= 1 + st.next; st.v = Math.round(st.v * (1 + st.next)); st.hist.push(st.idx);
    if (st.next < 0 && before) st.crash += before - st.v;
    log(`株価 ${st.next > 0 ? '＋' : '−'}${Math.abs(Math.round(st.next * 100))}%${before ? `（投資 ${st.v - before >= 0 ? '+' : '−'}${yen(Math.abs(st.v - before))}）` : ''}${bi ? `・利息 +${yen(bi)}` : ''}`, st.next > 0 ? 'is-up' : 'is-down');
    if (before) flash('v');
    st.tot.push(total()); st.turn++; fc(); paint();
  };
  const finish = () => {
    st.over = true;
    const sc = Math.max(0, Math.round(st.w + st.b + st.v - st.debt * 1.2));
    const nb = sc > best; if (nb) { best = sc; try { localStorage.setItem(KEY, best); } catch (e) {} $('best').textContent = yen(best); }
    const rank = sc >= 4200 ? ['達', '経済の達人'] : sc >= 3400 ? ['上', 'やりくり上手'] : sc >= 2600 ? ['堅', 'コツコツ派'] : ['始', 'これからが本番'];
    const tips = [];
    if (st.scam) tips.push('「絶対もうかる」「必ず 2 倍」という話は、詐欺の決まり文句です。本当にもうかる話を、知らない人がわざわざ教えてくれることはありません。');
    if (st.borrowed) tips.push(`足りなくて ${yen(st.borrowed)} 借りました。急な出費に備えて、すぐ使えるお金を少し残しておくと（生活防衛資金）、高い利息を払わずにすみます。`);
    if (st.crash >= 300) tips.push(`株価が下がって、投資が合わせて ${yen(st.crash)} 減りました。投資は増えることも減ることもあります。全部を投資にせず、置き場所を分けるのが「分散」です。`);
    if (!st.b && !st.v) tips.push('ずっと財布だけで持っていました。貯金なら毎回 3% の利息、投資なら値上がりの可能性。お金にも働いてもらいましょう。');
    if (st.fees >= 220) tips.push(`貯金をおろす手数料で ${yen(st.fees)} 払いました。使う予定のお金は、財布に残しておくのも作戦です。`);
    if (!tips.length) tips.push('借金なし・詐欺にもかからず、置き場所を上手に使い分けました。');
    const X = i => 10 + i * (300 / TURNS), mx = Math.max(...st.tot, START), Y = v => 96 - v / mx * 86;
    roll.hidden = false; $("res").hidden = false;
    $("res").innerHTML = `<div class="sg-end"><span class="sg-stamp" aria-hidden="true">${rank[0]}</span><p class="sg-rank">${rank[1]}</p><p class="sg-sc"><b>${yen(sc)}</b>${nb ? '<em>自己ベスト</em>' : ''}</p>
      <svg viewBox="0 0 320 104" class="sg-hist" aria-label="12 回の合計のうつりかわり"><line x1="10" x2="310" y1="${Y(START).toFixed(1)}" y2="${Y(START).toFixed(1)}" class="sg-c-base"/><polyline class="sg-c-l" points="${st.tot.map((v, i) => `${X(i).toFixed(1)},${Y(Math.max(0, v)).toFixed(1)}`).join(' ')}"/></svg>
      <p class="sg-brk">財布 ${yen(st.w)}・貯金 ${yen(st.b)}・投資 ${yen(st.v)}${st.debt ? `・借金 −${yen(st.debt * 1.2)}` : ''}・利息で増えた分 ${yen(st.interest)}</p><ul class="sg-tips">${tips.slice(0, 3).map(t => `<li>${t}</li>`).join("")}</ul></div>`;
    log(`ゴール！ 合計 ${yen(sc)}`, "is-goal");
    $("rollt").textContent = "もう 1 回あそぶ";
    box.classList.add('is-over'); paint();
    window.AZAKEI_TALK && window.AZAKEI_TALK($('res').querySelector('.sg-end'), 'sugoroku', sc >= 4200 ? 'top' : sc < 2600 ? 'low' : 'mid');
  };
  box.addEventListener('click', e => {
    const m = e.target.closest('[data-mv]'); if (!m || m.disabled || st.busy || st.over) return;
    const k = m.dataset.mv;
    if (k === 'b+') { st.w -= 100; st.b += 100; flash('b'); }
    else if (k === "b-") { const f = st.feeT === st.turn ? 0 : FEE, t = Math.min(100, st.b - f); st.b -= t + f; st.w += t; if (f) { st.fees += f; st.feeT = st.turn; log(`貯金をおろした（この回の手数料 −${FEE} 円）`, "is-down"); } flash("w"); }
    else if (k === 'v+') { st.w -= 100; st.v += 100; flash('v'); }
    else if (k === 'v-') { const t = Math.min(100, st.v); st.v -= t; st.w += t; flash('w'); }
    paint();
  });
  roll.addEventListener('click', async () => {
    if (st.busy) return;
    if (st.over) { box.classList.remove('is-over'); $('choice').hidden = true; reset(); $('rollt').textContent = 'サイコロをふる'; return; }
    st.busy = true; roll.disabled = true; paint();
    roll.classList.add('is-rolling');
    for (let k = 0; k < 8; k++) { $("die").innerHTML = dieHTML(1 + Math.random() * 6 | 0); $("die2").innerHTML = dieHTML(1 + Math.random() * 6 | 0); await sleep(60); }
    roll.classList.remove("is-rolling");
    const d1 = 1 + Math.random() * 6 | 0, d2 = 1 + Math.random() * 6 | 0; $("die").innerHTML = dieHTML(d1); $("die2").innerHTML = dieHTML(d2);
    const dest = n => { const p = (st.pos + n) % SQ.length; return `${n} で進む<small>${st.pos + n >= SQ.length ? "給料をもらって " : ""}${SQ[p][1]}</small>`; };
    box.querySelectorAll(".sg-sq").forEach(x => x.classList.toggle("is-cand", [d1, d2].some(n => +x.dataset.i === (st.pos + n) % SQ.length)));
    const d = d1 === d2 ? d1 : [d1, d2][await ask("サイコロは 2 つ。<b>どちらの目で進む？</b>", [dest(d1), dest(d2)])];
    box.querySelectorAll(".sg-sq.is-cand").forEach(x => x.classList.remove("is-cand"));
    for (let k = 0; k < d; k++) { st.pos = (st.pos + 1) % SQ.length; moveToken(st.pos); await sleep(220); if (st.pos === 0) payday(); }
    await land();
    await sleep(250);
    endTurn();
    roll.disabled = false; st.busy = false; paint();
    if (st.turn > TURNS) finish();
  });
  addEventListener('resize', () => st && moveToken(st.pos));
  reset();
})();
