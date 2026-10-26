/* ================================================================
   infl.js — 経済ラボ：インフレのタイムマシン（物価が上がると、1,000 円で買えるおにぎりが減る）
   ・計算だけ：n 年後の値段 = 今の値段 ×（1 + 上昇率）^n。おにぎり 1 個 100 円は「たとえ」
   ================================================================ */
(function() {
  const box = document.querySelector('[data-infl]');
  if (!box) return;
  const ONI = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4 C27 4 37 22 36 30 C35 36 28 37 20 37 C12 37 5 36 4 30 C3 22 13 4 20 4Z" fill="#fffaf0" stroke="#6b4a22" stroke-width="2"/><rect x="11" y="24" width="18" height="13" rx="2" fill="#1c2b23"/></svg>`;
  box.innerHTML = `
    <div class="in-ctrl">
      <label><span>物価が上がる速さ<b><i data-v="r">2</i>%</b><small>（1 年あたり）</small></span><input type="range" min="0" max="10" step="0.5" value="2" data-k="r"></label>
      <label><span>何年後？<b><i data-v="n">10</i> 年後</b></span><input type="range" min="0" max="30" step="1" value="10" data-k="n"></label>
    </div>
    <div class="in-stage">
      <p class="in-k">1,000 円で買えるおにぎり（今は 1 個 100 円）</p>
      <div class="in-oni" data-o="oni">${Array.from({ length: 10 }, () => `<span>${ONI}</span>`).join('')}</div>
      <div class="in-out">
        <p><span>おにぎり 1 個の値段</span><b data-o="price"></b></p>
        <p><span>1,000 円で買える数</span><b data-o="cnt"></b></p>
        <p><span>今の 1,000 円の「値打ち」</span><b data-o="val"></b></p>
      </div>
    </div>
    <p class="in-note" data-o="note"></p>
    <p class="in-foot">※ 値段も上がる速さも、しくみを見るための「たとえ」です。実際の物価は、ものによって上がり方がちがいます。</p>`;
  const v = k => +box.querySelector(`[data-k="${k}"]`).value;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const draw = () => {
    const r = v('r') / 100, n = v('n');
    box.querySelector('[data-v="r"]').textContent = v('r');
    box.querySelector('[data-v="n"]').textContent = n;
    const f = Math.pow(1 + r, n), price = 100 * f, cnt = Math.floor(1000 / price + 1e-9), val = 1000 / f;
    $('price').innerHTML = `${Math.round(price).toLocaleString('ja-JP')}<small> 円</small>`;
    $('cnt').innerHTML = `${cnt}<small> 個</small>`;
    $('val').innerHTML = `${Math.round(val).toLocaleString('ja-JP')}<small> 円ぶん</small>`;
    $('cnt').className = cnt < 10 ? 'is-down' : '';
    // 買えなくなったおにぎりは、うすくなって消える（端数ぶんは半分の濃さ）
    const left = 1000 / price;
    [...$('oni').children].forEach((s, i) => { s.className = i < Math.floor(left) ? '' : i < left ? 'is-half' : 'is-gone'; });
    const dbl = r > 0 ? Math.round(72 / (r * 100) * 10) / 10 : 0;
    $('note').innerHTML = r === 0 ? '物価が上がらなければ、10 年後も 1,000 円でおにぎり 10 個。お金の「値打ち」は変わりません。'
      : `物価が毎年 <b>${v('r')}%</b> ずつ上がると、値段はおよそ <b>${dbl} 年</b>で 2 倍になります（72 の法則）。お金をそのまま置いておくだけでは、買えるものが少しずつ減っていく。これがインフレです。`;
  };
  box.addEventListener('input', e => { if (e.target.matches('input[type=range]')) draw(); });
  draw();
})();
