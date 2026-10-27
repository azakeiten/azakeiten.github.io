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
    ['おにぎり', 140, true, '🍙'], ['お茶', 130, true, '🍵'], ['からあげ', 240, true, '🍗'], ['アイス', 160, true, '🍦'],
    ['ノート', 180, false, '📓'], ['電池', 300, false, '🔋'], ['ばんそうこう', 250, false, '🩹'], ['ボールペン', 120, false, '🖊']
  ];
  const yen = n => '¥' + n.toLocaleString('ja-JP');
  box.innerHTML = `
    <div class="rc-shop">
      <p class="rc-k">かごに入れる（もう一度押すと出す）</p>
      <div class="rc-items">${ITEMS.map((it, i) => `<button type="button" class="rc-item" data-i="${i}" aria-pressed="false"><span aria-hidden="true">${it[3]}</span><b>${it[0]}</b><small>${yen(it[1])}${it[2] ? '<em>食</em>' : ''}</small></button>`).join('')}</div>
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
