/* ================================================================
   kibo.js — 経済ラボ：どの工場でつくる？（規模の経済・固定費と変動費・近づいてから読みこむ）
   ・パンの注文が 5 回くる（1 日 100 個 〜 20 万個）。手づくり／小さな機械／大きな工場のどれでつくると、1 個あたりがいちばん安いかを選ぶ
   ・1 個あたりの費用＝固定費 ÷ 個数 ＋ 1 個ごとの材料・電気代（変動費）。固定費が大きい工場ほど、たくさんつくると安くなる（規模の経済）
   ・答えると、3 つの工場の「1 個あたり」が、固定費の分と変動費の分に分かれた棒でならぶ
   ・最後に、つくる数と 1 個あたりの費用の曲線（横軸は 10 倍ごと）に、5 つの注文をならべる
   ・数字はすべて、説明のためのたとえ。自己ベストは azakei_kibo（5 問の正解数）。見た目は kibo.css
   ================================================================ */
(function () {
  const box = document.querySelector('[data-kibo]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="kibo.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'kibo.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const KEY = 'azakei_kibo';
  // [名前, 印, 説明, 固定費（1 日）, 変動費（1 個）, 色]
  const F = [
    ['手づくり', '手', 'オーブン 1 台。人の手でこねて焼く', 5000, 120, '#d08a3c'],
    ['小さな機械', '機', 'こねる機械と大きなオーブン', 50000, 60, '#2f7a8a'],
    ['大きな工場', '工', '自動の製造ラインがある工場', 800000, 25, '#6a4fb0']
  ];
  // [だれから, 1 日の個数, ひとこと]
  const ORD = [
    ['町の朝市', 100, '週末の朝市で、焼きたてパンを売ります。'],
    ['市内のスーパー 10 店', 2000, '市内のスーパーのパン売り場に、毎朝とどけます。'],
    ['県内のスーパー全部', 20000, '県内のスーパー全部に、毎日とどけます。'],
    ['全国のコンビニ', 50000, '全国のコンビニで、同じパンを売ります。'],
    ['全国と海外のお店', 200000, '全国のお店と、海外のお店にも出荷します。']
  ];
  const ac = (f, q) => f[3] / q + f[4];
  const fmt = n => n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(1).replace(/\.0$/, '');
  const best = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  let i = 0, ok = 0, got = [], lock = false;
  const card = (f, k) => `<button type="button" class="kb-f" data-v="${k}" style="--c:${f[5]}"><span class="kb-fi" aria-hidden="true">${f[1]}</span><b>${f[0]}</b><small>${f[2]}</small><span class="kb-cost"><span>固定費 1 日 ${f[3].toLocaleString()} 円</span><span>1 個ごと ${f[4]} 円</span></span></button>`;
  const intro = () => {
    const b = best();
    box.innerHTML = `<div class="kb-intro">
      <div class="kb-fac" aria-hidden="true"><i></i><i></i><i></i><b></b></div>
      <div><p class="kb-kicker">パンの注文が 5 回</p><h3 class="kb-h">どの工場でつくる？</h3>
      <p class="kb-p">工場には、毎日かかる<b>固定費</b>（機械・建物・人）と、1 個つくるごとにかかる<b>変動費</b>（材料・電気）があります。100 個の注文と 20 万個の注文では、いちばん安くつくれる工場がちがいます。注文を見て、<b>1 個あたりの費用</b>がいちばん安い工場を選ぼう。数字はすべてたとえです。</p>
      <p class="kb-best">${b ? `自己ベスト <b>${b}</b> / 5 問` : 'はじめての工場長'}</p>
      <button type="button" class="kb-go" data-a="start">工場長になる</button></div></div>`;
  };
  const show = () => {
    const [who, q, say] = ORD[i]; lock = false;
    box.innerHTML = `<div class="kb-top"><ol class="kb-dots">${ORD.map((_, j) => `<li class="${j < i ? (got[j] ? 'is-ok' : 'is-ng') : j === i ? 'is-now' : ''}"></li>`).join('')}</ol><span class="kb-sc">正解 <b>${ok}</b> / ${ORD.length}</span></div>
      <div class="kb-order"><span class="kb-stamp" aria-hidden="true">注文</span><p class="kb-who">${who}</p><p class="kb-q"><b>${q.toLocaleString()}</b> 個 / 1 日</p><p class="kb-say">${say}</p>
        <div class="kb-boxes" aria-hidden="true">${'<i></i>'.repeat(Math.min(24, Math.round(Math.log10(q) * 5)))}</div></div>
      <p class="kb-ask">1 個あたりの費用がいちばん安いのは？</p>
      <div class="kb-fs">${F.map(card).join('')}</div>
      <div class="kb-rv" data-k="rv" hidden></div>`;
  };
  const answer = v => {
    if (lock) return; lock = true;
    const q = ORD[i][1], costs = F.map(f => ac(f, q)), bi = costs.indexOf(Math.min(...costs)), hit = v === bi;
    got[i] = hit; if (hit) ok++;
    box.querySelectorAll('.kb-f').forEach((b, k) => { b.disabled = true; b.classList.add(k === bi ? 'is-best' : k === v ? 'is-bad' : 'is-dim'); });
    const mx = Math.max(...costs.map(c => Math.min(c, 500)));
    const rv = box.querySelector('[data-k="rv"]');
    rv.innerHTML = `<p class="kb-res ${hit ? 'is-ok' : 'is-ng'}">${hit ? '正解！' : `いちばん安いのは「${F[bi][0]}」`}</p>
      <div class="kb-bars">${F.map((f, k) => { const fx = f[3] / q, c = costs[k], over = c > 500, w = x => (Math.min(x, 500) / mx * 100).toFixed(1); return `<div class="kb-row${k === bi ? ' is-best' : ''}${over ? ' is-over' : ''}" style="--c:${f[5]}"><span class="kb-rn">${f[0]}</span><span class="kb-rb"><i class="is-fx" style="--w:${over ? 100 * Math.min(1, fx / c) : w(fx)}"></i><i class="is-vr" style="--w:${over ? 100 * f[4] / c : w(f[4])}"></i></span><b>${fmt(c)} 円</b><small>固定費 ${f[3].toLocaleString()} ÷ ${q.toLocaleString()} 個 ＝ ${fmt(fx)} 円 ＋ 1 個ごと ${f[4]} 円</small></div>`; }).join('')}</div>
      <p class="kb-leg"><span><i class="is-fx"></i>固定費の分</span><span><i class="is-vr"></i>1 個ごとの分</span></p>
      <p class="kb-why">${q <= 100 ? '数が少ないと、大きな機械の固定費を少ない個数で分けることになり、1 個あたりがとても高くなります。' : bi === 2 ? '固定費が大きくても、たくさんの個数で分けると 1 個あたりはわずか。1 個ごとの費用が安い大きな工場が、いちばん安くなります。' : q === 20000 ? '2 万個でも、大きな工場の 80 万円の固定費はまだ重い。1 個あたりでくらべると、小さな機械のほうがわずかに安くなります。' : '手づくりは 1 個ごとの費用が高く、大きな工場は固定費が重すぎる。ちょうど中くらいの機械がいちばんです。'}</p>
      <button type="button" class="kb-go" data-a="next">${i + 1 < ORD.length ? '次の注文' : '結果を見る'}</button>`;
    rv.hidden = false;
    box.querySelector('.kb-sc b').textContent = ok;
    box.querySelectorAll('.kb-dots li')[i].className = hit ? 'is-ok' : 'is-ng';
  };
  // 1 個あたりの費用の曲線（横軸は 10 倍ごと：10 個〜100 万個）
  const chart = () => {
    const W = 520, H = 260, L = 46, R = 506, T = 14, B = 222, ymax = 300;
    const x = q => L + (Math.log10(q) - 1) / 5 * (R - L), y = c => B - Math.min(c, ymax) / ymax * (B - T);
    let s = '';
    for (let c = 0; c <= ymax; c += 50) s += `<line class="kb-gr" x1="${L}" x2="${R}" y1="${y(c)}" y2="${y(c)}"/><text class="kb-tk" x="${L - 6}" y="${y(c) + 4}">${c}</text>`;
    ['10', '100', '1,000', '1 万', '10 万', '100 万'].forEach((t, k) => { const xx = L + k / 5 * (R - L); s += `<line class="kb-gr" x1="${xx}" x2="${xx}" y1="${T}" y2="${B}"/><text class="kb-lb" x="${xx}" y="${B + 16}">${t}</text>`; });
    F.forEach(f => { let d = ''; for (let k = 0; k <= 100; k++) { const q = Math.pow(10, 1 + k / 20); d += `${k ? 'L' : 'M'}${x(q).toFixed(1)} ${y(ac(f, q)).toFixed(1)}`; } s += `<path class="kb-ln" style="--c:${f[5]}" d="${d}"/><text class="kb-ll" style="--c:${f[5]}" x="${R - 4}" y="${y(ac(f, 1e6)) - 6}">${f[0]}</text>`; });
    ORD.forEach((o, k) => { const xx = x(o[1]); s += `<line class="kb-od" x1="${xx}" x2="${xx}" y1="${T}" y2="${B}"/><circle class="kb-pt${got[k] ? ' is-ok' : ''}" cx="${xx}" cy="${y(Math.min(...F.map(f => ac(f, o[1]))))}" r="6"/><text class="kb-on" x="${xx}" y="${T + 10 + (k % 2) * 12}">${k + 1}</text>`; });
    s += `<text class="kb-ax" x="${(L + R) / 2}" y="${H - 4}">1 日につくる数（10 倍ごと）</text><text class="kb-ax" x="12" y="${T + 2}" text-anchor="start">円</text>`;
    return `<svg class="kb-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="つくる数と、1 個あたりの費用の曲線">${s}</svg>`;
  };
  const TITLE = [[5, '名工場長', '極'], [4, 'たよれる工場長', '良'], [2, '工場長の見習い', '見'], [0, 'これからわかる', '初']];
  const finish = () => {
    const prev = best(); if (ok > prev) try { localStorage.setItem(KEY, String(ok)); } catch (e) {}
    const ti = TITLE.findIndex(t => ok >= t[0]);
    box.innerHTML = `<div class="kb-end">
      <span class="kb-seal" aria-hidden="true">${TITLE[ti][2]}</span>
      <p class="kb-big"><b>${ok}</b> / ${ORD.length} 問</p>
      <p class="kb-title">${TITLE[ti][1]}${ok > prev && prev ? '<em>自己ベスト更新</em>' : prev && ok <= prev ? `<small>自己ベスト ${prev} 問</small>` : ''}</p>
      <div class="kb-chart"><p class="kb-ch">つくる数と、1 個あたりの費用<small>丸は 5 つの注文。いちばん下の線が、その数でいちばん安い工場</small></p>${chart()}</div>
      <div class="kb-sum">
        <div><span aria-hidden="true">規</span><p><b>規模の経済</b>たくさんつくるほど、固定費を多くの個数で分けられて、1 個あたりが安くなる。大きな会社が安く売れる理由のひとつです。</p></div>
        <div><span aria-hidden="true">固</span><p><b>固定費と変動費</b>つくる数に関係なくかかるのが固定費、1 個ごとに増えるのが変動費。小さな注文には、固定費の小さいつくり方が向いています。</p></div>
      </div>
      <button type="button" class="kb-go" data-a="start">もう一度、はじめから</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(box.querySelector('.kb-end'), 'kibo', ti, TITLE.length);
  };
  box.addEventListener('click', e => {
    const f = e.target.closest('[data-v]'); if (f) { answer(+f.dataset.v); return; }
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'start') { i = 0; ok = 0; got = []; show(); }
    else if (a.dataset.a === 'next') { i++; if (i < ORD.length) show(); else finish(); }
  });
  intro();
})();
