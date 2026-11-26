/* ================================================================
   receipt.js — 経済ラボ：レシートの中の税金（消費税 10% と、軽減税率 8%）
   ・商品をかごに入れると、レシートが 1 行ずつ印字される。「店内で食べる」にすると食べものも 10% に
   ・税率は日本の消費税のしくみ（標準 10%・飲食料品の持ち帰りは 8%・店内飲食は 10%）。値段は「たとえ」
   ・税は、税率ごとに合計してから 1 円未満を切り捨て（よくあるレシートの計算）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-receipt]');
  if (!box) return;
  // [名前, 税抜きの値段, 食べもの？, 絵]
  const ITEMS = [
    ['おにぎり', 140, true], ['お茶', 130, true], ['からあげ', 240, true], ['アイス', 160, true],
    ['ノート', 180, false], ['電池', 300, false], ['ばんそうこう', 250, false], ['ボールペン', 120, false]
  ];
  const yen = n => '¥' + n.toLocaleString('ja-JP');
  box.innerHTML = `
    <div class="rc-shop">
      <p class="rc-k">かごに入れる（もう一度押すと出す）</p>
      <div class="rc-items">${ITEMS.map((it, i) => `<button type="button" class="rc-item" data-i="${i}" aria-pressed="false"><b>${it[0]}</b><small>${yen(it[1])}${it[2] ? '<em>食</em>' : ''}</small></button>`).join('')}</div>
      <div class="rc-eat" role="group" aria-label="食べる場所">
        <button type="button" class="is-on" data-eat="0">持ち帰る</button><button type="button" data-eat="1">店内で食べる</button>
      </div>
      <p class="rc-hint" data-o="hint"></p>
    </div>
    <div class="rc-paper" aria-live="polite">
      <p class="rc-logo">AZAKEI MART<small>※ 実験用のレシートです</small></p>
      <ol class="rc-lines" data-o="lines"></ol>
      <div class="rc-sum" data-o="sum"></div>
    </div>
    <p class="in-foot">※ 値段は「たとえ」です（税抜き）。税率は日本の消費税のしくみにあわせています。</p>`;
  const cart = new Set(); let eatIn = false;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const draw = (added) => {
    const list = [...cart].sort((a, b) => a - b).map(i => ITEMS[i]);
    const rate = it => it[2] && !eatIn ? 8 : 10;
    $('lines').innerHTML = list.length ? list.map(it => `<li class="${added === it ? 'is-new' : ''}"><span>${it[0]}${rate(it) === 8 ? ' <i>※</i>' : ''}</span><b>${yen(it[1])}</b></li>`).join('')
      : '<li class="rc-empty">（まだ何も買っていません）</li>';
    const g = { 8: 0, 10: 0 }; list.forEach(it => { g[rate(it)] += it[1]; });
    const t8 = Math.floor(g[8] * 0.08), t10 = Math.floor(g[10] * 0.1), sub = g[8] + g[10], tax = t8 + t10;
    $('sum').innerHTML = !list.length ? '' : `
      <p><span>小計（税抜き）</span><b>${yen(sub)}</b></p>
      ${g[8] ? `<p class="rc-t"><span>8% 対象 ${yen(g[8])}</span><b>（税 ${yen(t8)}）</b></p>` : ''}
      ${g[10] ? `<p class="rc-t"><span>10% 対象 ${yen(g[10])}</span><b>（税 ${yen(t10)}）</b></p>` : ''}
      <p class="rc-total"><span>合計</span><b>${yen(sub + tax)}</b></p>
      ${g[8] ? '<p class="rc-mark">※ は軽減税率（8%）の対象です</p>' : ''}
      <p class="rc-tax">このうち、国などに納める税金 <b>${yen(tax)}</b></p>`;
    const food = list.filter(it => it[2]).length;
    $('hint').innerHTML = !list.length ? '商品を押して、かごに入れてみよう。'
      : !food ? '文房具や電池などは、どこで使っても 10%。食べものも入れてみると……？'
      : eatIn ? `店内で食べると、食べものも <b>10%</b>。持ち帰りより税が <b>${yen(food ? Math.floor(list.filter(it => it[2]).reduce((s, it) => s + it[1], 0) * 0.1) - Math.floor(list.filter(it => it[2]).reduce((s, it) => s + it[1], 0) * 0.08) : 0)}</b> ほど多くなります（同じおにぎりなのに！）。`
      : '食べものの持ち帰りは、くらしに欠かせないものとして <b>8%</b>（軽減税率）。「店内で食べる」に切りかえると……？';
  };
  box.addEventListener('click', e => {
    const b = e.target.closest('.rc-item');
    if (b) {
      const i = +b.dataset.i, on = !cart.has(i);
      on ? cart.add(i) : cart.delete(i);
      b.setAttribute('aria-pressed', on);
      draw(on ? ITEMS[i] : null); return;
    }
    const s = e.target.closest('[data-eat]');
    if (s) {
      eatIn = s.dataset.eat === '1';
      box.querySelectorAll('[data-eat]').forEach(x => x.classList.toggle('is-on', x === s));
      box.querySelector('.rc-paper').classList.remove('is-reprint'); void box.offsetWidth; box.querySelector('.rc-paper').classList.add('is-reprint');
      draw();
    }
  });
  draw();
})();

/* ================================================================
   v346：「税率レジ 45 秒」— 8% か 10% か、レジで打ち分けるスピード勝負
   ・ベルトコンベアに品物が 1 つずつ流れてくる。8%（軽減税率）か 10%（標準）を押す
   ・正解で次へ。続けて正解すると倍率アップ。まちがえると 3 秒の減点
   ・終わったら、まちがえた品物と「なぜその税率か」を一覧で
   ・税率は日本の消費税のしくみ（飲食料品は 8%、ただしお酒・外食・医薬品などは 10%、定期購読の新聞は 8%）
   ・自己ベストは azakei_receipt_best
   ================================================================ */
(function () {
  const box = document.querySelector('[data-receipt]');
  if (!box) return;
  if (!document.querySelector('link[href^="rcgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'rcgame.css?v=20261126k'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_receipt_best', TIME = 45;
  const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  /* [品物, 場面, 正しい税率, 一字, なぜ] */
  const P = [
    ['おにぎり', '持ち帰り', 8, '握', '食べものの持ち帰りは、軽減税率の 8%。'],
    ['おにぎり', 'お店のイートインで食べる', 10, '握', '同じおにぎりでも、お店の席で食べると「外食」あつかいで 10%。'],
    ['ハンバーガー', 'ドライブスルーで持ち帰り', 8, '包', '持ち帰りなので 8%。'],
    ['ハンバーガー', 'お店の席で食べる', 10, '包', 'お店の席で食べるのは外食なので 10%。'],
    ['ピザ', '家に届けてもらう（宅配）', 8, '配', '宅配や出前は、届けてもらった食べものを買っているので 8%。'],
    ['料理', '家に来て作ってもらう（ケータリング）', 10, '膳', '家で料理を作って出してもらうのはサービスなので 10%。'],
    ['ミネラルウォーター', 'コンビニで買う', 8, '水', 'ペットボトルの水は食べもの・飲みものなので 8%。'],
    ['水道の水', '家の水道料金', 10, '栓', '水道水は、飲むだけでなくお風呂や洗たくにも使うので 10%。'],
    ['ノンアルコールビール', 'スーパーで買う', 8, '泡', 'アルコールが入っていないので「お酒」ではなく、飲みものとして 8%。'],
    ['ビール', 'スーパーで買う', 10, '酒', 'お酒は軽減税率の対象外で 10%。'],
    ['本みりん', 'スーパーで買う', 10, '醂', '本みりんはアルコールをふくむので、お酒として 10%。'],
    ['みりん風調味料', 'スーパーで買う', 8, '醂', 'アルコールがほとんどない調味料なので 8%。'],
    ['栄養ドリンク（医薬部外品）', 'ドラッグストアで買う', 10, '薬', '医薬品・医薬部外品は、食べものではないので 10%。'],
    ['新聞（毎朝とどく定期購読）', '家に配達', 8, '新', '週 2 回以上出る新聞の定期購読は、食べもの以外で唯一の 8%。'],
    ['新聞', '駅の売店で 1 部買う', 10, '新', '定期購読ではない 1 部買いは 10%。'],
    ['食用の氷', 'コンビニで買う', 8, '氷', '食べるための氷は食べものなので 8%。'],
    ['ドライアイス', 'ケーキといっしょに買う', 10, '冷', 'ドライアイスは食べものではないので 10%。'],
    ['ノート', '文房具屋さんで買う', 10, '帳', '食べもの以外は、ふつう 10%。'],
    ['ポップコーン', '映画館の売店で買って席で食べる', 8, '映', '映画館の座席は食事のための席ではないので、売店の食べものは 8%。'],
    ['おまけつきのお菓子（1 万円以下で、お菓子が中心）', 'お店で買う', 8, '玩', '食べものが中心のセット（値段 1 万円以下など）は 8%。']
  ];
  const g = document.createElement('div');
  g.className = 'rg';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="rg-sub"><span aria-hidden="true">験</span>じっくりためす：かごに入れて、レシートを見る</p>');
  let st = null, tick = 0;
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="rg-intro">
      <div class="rg-reg" aria-hidden="true"><b>8</b><i></i><b>10</b></div>
      <div><p class="rg-kicker">スピード勝負</p><h3 class="rg-h">税率レジ 45 秒</h3>
      <p class="rg-p">レジに品物が流れてきます。消費税は <b>8%</b>（軽減税率）？ それとも <b>10%</b>？ 45 秒で、何個正しく打ち分けられるか。続けて正解すると点が上がり、まちがえると 3 秒へります。同じおにぎりでも、食べる場所で税率が変わるので注意。</p>
      <p class="rg-best">${b ? `自己ベスト <b>${b}</b> 点` : 'はじめてのレジ'}</p>
      <button type="button" class="rg-go" data-rg="start">レジを開ける</button></div></div>`;
  };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const start = () => {
    st = { q: shuffle(P.map((_, i) => i)), at: 0, score: 0, streak: 0, ok: 0, miss: [], left: TIME, end: performance.now() + TIME * 1000, lock: false };
    g.innerHTML = `<div class="rg-play">
      <div class="rg-top"><span class="rg-t"><b data-rg="t">${TIME}</b> 秒</span><span class="rg-st" data-rg="st"></span><span class="rg-sc">得点 <b data-rg="sc">0</b></span></div>
      <div class="rg-time" aria-hidden="true"><i data-rg="bar"></i></div>
      <div class="rg-belt"><div class="rg-item" data-rg="item"></div></div>
      <div class="rg-keys"><button type="button" data-tax="8"><b>8</b><small>%　軽減税率</small></button><button type="button" data-tax="10"><b>10</b><small>%　標準</small></button></div>
      <p class="rg-fb" data-rg="fb" aria-live="polite"></p></div>`;
    show();
    clearInterval(tick);
    tick = setInterval(() => {
      const left = Math.max(0, (st.end - performance.now()) / 1000);
      g.querySelector('[data-rg="t"]').textContent = Math.ceil(left);
      g.querySelector('[data-rg="bar"]').style.transform = `scaleX(${(left / TIME).toFixed(3)})`;
      g.querySelector('[data-rg="bar"]').classList.toggle('is-low', left < 10);
      if (left <= 0) finish();
    }, 100);
  };
  const show = () => {
    if (st.at >= st.q.length) st.q = st.q.concat(shuffle(P.map((_, i) => i))); // 全部出たら、もう一周
    const p = P[st.q[st.at]];
    const el = g.querySelector('[data-rg="item"]');
    el.innerHTML = `<span class="rg-seal" aria-hidden="true">${p[3]}</span><span class="rg-what"><b>${p[0]}</b><small>${p[1]}</small></span>`;
    el.classList.remove('is-in', 'is-ok', 'is-ng'); void el.offsetWidth; el.classList.add('is-in');
  };
  const mult = () => 1 + Math.min(st.streak, 8) * 0.25;
  const answer = t => {
    if (!st || st.lock) return;
    const p = P[st.q[st.at]], ok = t === p[2], el = g.querySelector('[data-rg="item"]'), fb = g.querySelector('[data-rg="fb"]');
    if (ok) { st.streak++; st.ok++; const pts = Math.round(10 * mult()); st.score += pts; fb.className = 'rg-fb is-ok'; fb.textContent = `正解 ＋${pts}`; el.classList.add('is-ok'); }
    else { st.streak = 0; st.end -= 3000; st.miss.push(st.q[st.at]); fb.className = 'rg-fb is-ng'; fb.textContent = `${p[2]}% でした。${p[4]}`; el.classList.add('is-ng'); }
    g.querySelector('[data-rg="sc"]').textContent = st.score;
    g.querySelector('[data-rg="st"]').textContent = st.streak >= 3 ? `${st.streak} 連続 ×${mult().toFixed(2).replace(/0$/, '')}` : '';
    st.lock = true;
    setTimeout(() => { if (!st) return; st.lock = false; st.at++; show(); }, ok ? (reduce ? 0 : 260) : 1300);
  };
  const TITLE = [[400, '税率レジの名人'], [250, 'たよれるレジ係'], [120, 'レジの見習い'], [0, 'これから覚えよう']];
  const finish = () => {
    clearInterval(tick);
    const s = st; st = null;
    const prev = getB(), best = s.score > prev;
    if (best) { try { localStorage.setItem(KEY, String(s.score)); localStorage.setItem('azakei_receipt', '1'); } catch (e) {} }
    const miss = [...new Set(s.miss)];
    g.innerHTML = `<div class="rg-end">
      <p class="rg-kicker">レジ締め</p>
      <p class="rg-big"><b>${s.score}</b> 点<small>正解 ${s.ok} 個・まちがい ${s.miss.length} 個</small></p>
      <p class="rg-title"><span aria-hidden="true">称</span>${TITLE.find(x => s.score >= x[0])[1]}${best ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${prev} 点</small>` : ''}</p>
      ${miss.length ? `<p class="rg-l">まちがえた品物</p><ul class="rg-miss">${miss.map(i => `<li><span class="rg-tag is-${P[i][2]}">${P[i][2]}%</span><p><b>${P[i][0]}</b><small>${P[i][1]}</small>${P[i][4]}</p></li>`).join('')}</ul>` : '<p class="rg-perfect">まちがいなし！ 完ぺきなレジ係です。</p>'}
      <div class="rg-rule"><p class="rg-l">覚え方</p><ul><li><b>8%</b>　食べもの・飲みもの（持ち帰り・宅配）、定期購読の新聞</li><li><b>10%</b>　お酒、外食（お店の席で食べる・ケータリング）、医薬品、食べもの以外</li></ul><p>軽減税率は、毎日の食べものの負担を軽くするために、2019 年 10 月に消費税が 10% になったときに始まりました。</p></div>
      <button type="button" class="rg-go" data-rg="start">もう一度レジに立つ</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(g, 'receipt', TITLE.findIndex(x => s.score >= x[0]), TITLE.length);
  };
  g.addEventListener('click', e => {
    const k = e.target.closest('[data-tax]'); if (k) { answer(+k.dataset.tax); return; }
    const a = e.target.closest('[data-rg="start"]'); if (a) start();
  });
  /* キーボードでも：8 と 0（10 の 0）、← → */
  g.addEventListener('keydown', e => { if (!st) return; if (e.key === '8' || e.key === 'ArrowLeft') { e.preventDefault(); answer(8); } if (e.key === '0' || e.key === '1' || e.key === 'ArrowRight') { e.preventDefault(); answer(10); } });
  intro();
})();
