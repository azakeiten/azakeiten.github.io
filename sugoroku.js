/* ================================================================
   sugoroku.js — クイズ：経済すごろく（サイコロを 12 回ふって、お金をいちばん増やせるのは？）
   ・16 マスの輪。給料・税金・投資・保険・ハプニングなど。ルールと金額は遊びのための「たとえ」
   ・投資：300 円を出して、サイコロ 1〜2 → 0 円 / 3〜4 → 300 円 / 5〜6 → 900 円（平均すると少し得、でも当たりはずれ）
   ・保険：100 円払うと、次のハプニングが 0 円に
   ================================================================ */
(function() {
  const box = document.querySelector('[data-sugo]');
  if (!box) return;
  const KEY = 'azakei_sugo_best', TURNS = 12, START = 1000;
  // [絵, 名前, 種類, 金額]
  const SQ = [
    ['🏁', 'スタート', 'start', 0], ['🪙', 'おこづかい', 'in', 200], ['🛍', '買い物', 'out', 300], ['📈', '投資チャンス', 'inv', 0],
    ['🏛', '税金', 'tax', 10], ['🐷', '貯金の利息', 'int', 5], ['📱', 'スマホが割れた', 'hap', 600], ['🧺', 'フリマで売れた', 'in', 250],
    ['📈', '投資チャンス', 'inv', 0], ['🛡', '保険に入る？', 'ins', 100], ['🎂', '誕生日', 'in', 400], ['🍩', 'ついつい買い', 'out', 400],
    ['📈', '投資チャンス', 'inv', 0], ['🚲', '自転車がパンク', 'hap', 300], ['🏛', '税金', 'tax', 10], ['🧹', 'お手伝い', 'in', 300]
  ];
  // マスの色のクラス（CSS を分けるときに見つけられるよう、ここに書いておく）：is-start is-in is-out is-inv is-tax is-int is-hap is-ins
  // 16 マスを 5×5 のまわりに並べる（左上から時計回り）
  const POS = [[1,1],[1,2],[1,3],[1,4],[1,5],[2,5],[3,5],[4,5],[5,5],[5,4],[5,3],[5,2],[5,1],[4,1],[3,1],[2,1]];
  const yen = n => Math.round(n).toLocaleString('ja-JP') + ' 円';
  const FACES = '⚀⚁⚂⚃⚄⚅';
  let best = 0; try { best = +localStorage.getItem(KEY) || 0; } catch (e) {}
  box.innerHTML = `
    <div class="sg-board">
      ${SQ.map((s, i) => `<div class="sg-sq is-${s[2]}" style="grid-row:${POS[i][0]};grid-column:${POS[i][1]}" data-i="${i}"><span aria-hidden="true">${s[0]}</span><small>${s[1]}</small></div>`).join('')}
      <div class="sg-center">
        <p class="sg-money"><small>もっているお金</small><b data-o="money">${yen(START)}</b></p>
        <p class="sg-turn">のこり <b data-o="left">${TURNS}</b> 回<span data-o="ins" hidden>🛡 保険あり</span></p>
        <button type="button" class="sg-roll btn-primary"><span class="sg-die" data-o="die" aria-hidden="true">⚀</span><span data-o="rollt">サイコロをふる</span></button>
        <div class="sg-choice" data-o="choice" hidden></div>
        <ol class="sg-log" data-o="log" aria-live="polite"></ol>
      </div>
      <span class="sg-token" data-o="token" aria-hidden="true">🙂</span>
    </div>
    <p class="sg-best">自己ベスト <b data-o="best">${best ? yen(best) : '—'}</b></p>
    <p class="in-foot">※ マスの金額やルールは、遊ぶための「たとえ」です。スタートを通るたびに、給料 500 円。</p>`;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const board = box.querySelector('.sg-board'), token = $('token'), roll = box.querySelector('.sg-roll');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let st;
  const reset = () => { st = { pos: 0, money: START, left: TURNS, ins: false, busy: false, over: false }; $('log').innerHTML = ''; moveToken(0); paint(); };
  const paint = () => {
    $('money').textContent = yen(st.money); $('left').textContent = st.left; $('ins').hidden = !st.ins;
    $('money').classList.toggle('is-low', st.money < START);
  };
  const log = (t, cls) => { const li = document.createElement('li'); li.className = cls || ''; li.innerHTML = t; $('log').prepend(li); while ($('log').children.length > 3) $('log').lastChild.remove(); };
  const moveToken = i => {
    const sq = box.querySelector(`.sg-sq[data-i="${i}"]`), b = board.getBoundingClientRect(), r = sq.getBoundingClientRect();
    token.style.transform = `translate(${r.left - b.left + r.width / 2 - 14}px, ${r.top - b.top + r.height / 2 - 16}px)`;
    box.querySelectorAll('.sg-sq').forEach(x => x.classList.toggle('is-here', x === sq));
  };
  const pop = (amt) => {
    const sq = box.querySelector('.sg-sq.is-here'); if (!sq || !amt) return;
    const p = document.createElement('span'); p.className = 'sg-pop ' + (amt > 0 ? 'is-up' : 'is-down'); p.textContent = (amt > 0 ? '+' : '−') + Math.abs(Math.round(amt)).toLocaleString('ja-JP');
    sq.appendChild(p); setTimeout(() => p.remove(), 1100);
  };
  const add = (amt, text) => { st.money = Math.max(0, st.money + amt); pop(amt); log(text, amt > 0 ? 'is-up' : amt < 0 ? 'is-down' : ''); paint(); };
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const ask = (html, opts) => new Promise(res => {
    const c = $('choice'); c.innerHTML = `<p>${html}</p><div>${opts.map((o, i) => `<button type="button" data-c="${i}">${o}</button>`).join('')}</div>`; c.hidden = false; roll.hidden = true;
    c.onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; c.hidden = true; roll.hidden = false; res(+b.dataset.c); };
  });
  const land = async () => {
    const s = SQ[st.pos];
    if (s[2] === 'in') add(s[3], `${s[0]} ${s[1]}　+${s[3]} 円`);
    else if (s[2] === 'out') add(-s[3], `${s[0]} ${s[1]}　−${s[3]} 円`);
    else if (s[2] === 'tax') { const t = Math.floor(st.money * s[3] / 100); add(-t, `${s[0]} 税金（もっているお金の 10%）　−${t.toLocaleString('ja-JP')} 円`); }
    else if (s[2] === 'int') { const t = Math.floor(st.money * s[3] / 100); add(t, `${s[0]} 利息（5%）　+${t.toLocaleString('ja-JP')} 円`); }
    else if (s[2] === 'hap') {
      if (st.ins) { st.ins = false; log(`${s[0]} ${s[1]}…… でも保険で 0 円！`, 'is-up'); paint(); }
      else add(-s[3], `${s[0]} ${s[1]}　−${s[3]} 円`);
    } else if (s[2] === 'ins') {
      if (st.ins) { log('🛡 保険はもう入っています'); return; }
      const c = await ask('100 円で保険に入る？<small>次のハプニングが 0 円になります</small>', ['入る（−100 円）', '入らない']);
      if (c === 0 && st.money >= 100) { st.ins = true; add(-100, '🛡 保険に入った　−100 円'); } else log('🛡 保険に入らなかった');
    } else if (s[2] === 'inv') {
      if (st.money < 300) { log('📈 投資チャンス…… でもお金が足りない'); return; }
      const c = await ask('300 円を投資する？<small>サイコロ 1〜2：0 円 ／ 3〜4：300 円 ／ 5〜6：900 円が戻る</small>', ['投資する', '見送る']);
      if (c === 1) { log('📈 投資は見送った'); return; }
      const d = 1 + Math.random() * 6 | 0; $('die').textContent = FACES[d - 1];
      const back = d <= 2 ? 0 : d <= 4 ? 300 : 900;
      add(back - 300, `📈 投資の結果（サイコロ ${d}）　${back - 300 >= 0 ? '+' : '−'}${Math.abs(back - 300)} 円`);
    }
  };
  const finish = () => {
    st.over = true;
    const nb = st.money > best; if (nb) { best = st.money; try { localStorage.setItem(KEY, best); } catch (e) {} $('best').textContent = yen(best); }
    const rank = st.money >= 3000 ? '経済の達人' : st.money >= 2400 ? 'やりくり上手' : st.money >= 1800 ? 'コツコツ派' : 'これからが本番';
    log(`<b>ゴール！ ${yen(st.money)}</b>　称号「${rank}」${nb ? '　<em>自己ベスト更新！</em>' : ''}`, 'is-goal');
    $('rollt').textContent = 'もう 1 回あそぶ';
    box.classList.add('is-over');
  };
  roll.addEventListener('click', async () => {
    if (st.busy) return;
    if (st.over) { box.classList.remove('is-over'); reset(); $('rollt').textContent = 'サイコロをふる'; return; }
    st.busy = true; roll.disabled = true;
    // サイコロがころころ回る
    for (let k = 0; k < 8; k++) { $('die').textContent = FACES[Math.random() * 6 | 0]; await sleep(60); }
    const d = 1 + Math.random() * 6 | 0; $('die').textContent = FACES[d - 1];
    st.left--; paint();
    for (let k = 0; k < d; k++) {
      st.pos = (st.pos + 1) % SQ.length; moveToken(st.pos); await sleep(220);
      if (st.pos === 0) add(500, '🏁 スタートを通った！ 給料　+500 円');
    }
    await land();
    roll.disabled = false; st.busy = false;
    if (st.left <= 0) finish();
  });
  addEventListener('resize', () => st && moveToken(st.pos));
  reset();
})();
