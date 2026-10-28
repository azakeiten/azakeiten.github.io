/* ================================================================
   kabu.js — 経済ラボ：株式会社をつくろう（出したお金のぶんだけ株をもち、配当と「決める力」が分かれる）
   ・1 株 = 1,000 円。出資額・利益・配当にまわす割合は、しくみを見るための「たとえ」
   ・株の割合 → 円グラフ。半分をこえる人がいると「1 人で決められる」（過半数）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-kabu]');
  if (!box) return;
  const ONE = 1000;
  const P = [{ k: 'a', name: 'A さん', c: '#b5432f', v: 30000 }, { k: 'b', name: 'B さん', c: '#2f6b3a', v: 15000 }, { k: 'c', name: 'C さん', c: '#d49a2a', v: 5000 }];
  const yen = n => Math.round(n).toLocaleString('ja-JP') + ' 円';
  const R = 15.9155; // 円周がちょうど 100 になる半径
  box.innerHTML = `
    <div class="kb-step"><p class="kb-k"><span>1</span>3 人で、お金を出しあって会社をつくる（1 株 = ${ONE.toLocaleString('ja-JP')} 円）</p>
      <div class="kb-people">${P.map(p => `
        <label class="kb-p" style="--c:${p.c}"><span class="kb-name"><i></i>${p.name}</span>
          <b data-o="v-${p.k}"></b><small data-o="s-${p.k}"></small>
          <input type="range" min="1000" max="50000" step="1000" value="${p.v}" data-k="${p.k}" aria-label="${p.name}が出すお金"></label>`).join('')}</div>
    </div>
    <div class="kb-mid">
      <div class="kb-pie">
        <svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="${R}" class="kb-bg"/>${P.map(p => `<circle cx="21" cy="21" r="${R}" class="kb-seg" data-seg="${p.k}" style="stroke:${p.c}"/>`).join('')}<line x1="21" y1="0.5" x2="21" y2="41.5" class="kb-half"/></svg>
        <p class="kb-pie-c"><small>株の合計</small><b data-o="total"></b></p>
      </div>
      <div class="kb-vote" data-o="vote" aria-live="polite"></div>
    </div>
    <div class="kb-step"><p class="kb-k"><span>2</span>1 年後。もうけ（利益）を、どう分ける？</p>
      <div class="kb-ctrl">
        <label><span>今年の利益 <b data-o="profit"></b></span><input type="range" min="0" max="100000" step="5000" value="40000" data-k="profit"></label>
        <label><span>配当にまわす割合 <b data-o="ratio"></b></span><input type="range" min="0" max="100" step="10" value="50" data-k="ratio"></label>
      </div>
      <div class="kb-split"><span class="kb-div" data-o="divbar"></span><span class="kb-keep" data-o="keepbar"></span></div>
      <p class="kb-split-l"><span><i class="is-div"></i>株主に配当 <b data-o="div"></b></span><span><i class="is-keep"></i>会社に残す（次の年の準備に） <b data-o="keep"></b></span></p>
      <div class="kb-pay" data-o="pay"></div>
    </div>
    <p class="kb-note" data-o="note"></p>
    <p class="in-foot">※ 金額や割合は、しくみを見るための「たとえ」です。実際の会社では、配当や大事なことは株主総会などで決めます。</p>`;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const val = k => +box.querySelector(`[data-k="${k}"]`).value;
  const draw = () => {
    const sh = P.map(p => val(p.k) / ONE), tot = sh.reduce((a, b) => a + b, 0);
    let off = 0;
    P.forEach((p, i) => {
      const pct = sh[i] / tot * 100;
      $(`v-${p.k}`).textContent = yen(val(p.k));
      $(`s-${p.k}`).textContent = `${sh[i]} 株（${Math.round(pct)}%）`;
      const seg = box.querySelector(`[data-seg="${p.k}"]`);
      seg.style.strokeDasharray = `${pct} ${100 - pct}`; seg.style.strokeDashoffset = `${25 - off}`;
      off += pct;
    });
    $('total').textContent = `${tot} 株`;
    const top = sh.indexOf(Math.max(...sh)), topPct = sh[top] / tot * 100;
    $('vote').innerHTML = topPct > 50
      ? `<p class="kb-v-k">新しいメニューを出す？ 多数決をすると……</p><p class="kb-v-t"><b style="color:${P[top].c}">${P[top].name}</b>だけで、半分をこえる <b>${Math.round(topPct)}%</b>。<br>1 人で決められます（過半数）。</p>`
      : `<p class="kb-v-k">新しいメニューを出す？ 多数決をすると……</p><p class="kb-v-t">だれも半分をこえていません（いちばん多い人で <b>${Math.round(topPct)}%</b>）。<br><b>2 人以上が賛成</b>しないと決まりません。</p>`;
    const profit = val('profit'), ratio = val('ratio') / 100, div = Math.floor(profit * ratio), keep = profit - div;
    $('profit').textContent = yen(profit); $('ratio').textContent = `${val('ratio')}%`;
    $('div').textContent = yen(div); $('keep').textContent = yen(keep);
    $('divbar').style.width = profit ? (div / profit * 100) + '%' : '0%'; $('keepbar').style.width = profit ? (keep / profit * 100) + '%' : '0%';
    const per = tot ? div / tot : 0, max = Math.max(...sh) * per || 1;
    $('pay').innerHTML = `<p class="kb-per">1 株あたりの配当 <b>${yen(per)}</b></p>` + P.map((p, i) => `
      <div class="kb-row" style="--c:${p.c}"><span>${p.name}</span><span class="kb-track"><i style="width:${sh[i] * per / max * 100}%"></i></span><b>${yen(sh[i] * per)}</b></div>`).join('');
    $('note').innerHTML = `出したお金が多い人ほど株を多くもち、<b>配当</b>も<b>決める力</b>も大きくなります。もうけを全部配らずに会社に残すと、そのお金で次の年に新しい道具を買ったり、お店を広げたりできます。これが<b>株式会社</b>の基本のしくみです。`;
  };
  box.addEventListener('input', e => { if (e.target.matches('input[type=range]')) draw(); });
  draw();
})();
