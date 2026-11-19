/* ================================================================
   uchiwake.js — 経済ラボ：おにぎり 1 個の値段の中身（近づいてから読みこむ）
   ・コンビニのおにぎり 140 円（税こみ）。10 円玉 14 枚を、8 つの箱（お米・のりと具・包む・工場・運ぶ・お店・本部と広告・もうけ・税）に配って予想する
   ・答え合わせで、おにぎりの三角が中身の色で下からぬられ、予想と「たとえの答え」を棒でくらべる。近さで点数
   ・中身の割合はすべてたとえ（実際は商品・会社でちがう）。見た目は uchiwake.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-uchiwake]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="uchiwake.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'uchiwake.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const COINS = 14;
  // [印, 名前, たとえの答え（円）, 色, ひとこと]
  const C = [['米', 'お米', 26, '#f3ead2', '田んぼで育てた人、精米する人へ'], ['具', 'のりと具', 20, '#3d5a3a', '海でのりをつくる人、具をつくる人へ'], ['包', '包む袋', 6, '#9ec6dd', 'フィルムをつくる工場へ'],
    ['工', '工場でつくる', 24, '#e3b341', 'にぎる人・機械・電気代'], ['運', '運ぶ', 9, '#6b8fb0', 'トラックで、夜のうちにお店へ'], ['店', 'お店', 32, '#d8822a', '店員さん・お店の電気・家賃'],
    ['本', '本部と広告', 8, '#8a6fb0', '商品を考える人・広告'], ['益', 'もうけ', 5, '#2f8a4a', '次の工夫や、出資した人へ'], ['税', '消費税（8%）', 10, '#b5432f', '国と地方へ']];
  let g = C.map(() => 0), done = false;
  g = [3, 2, 1, 2, 1, 2, 1, 1, 1];   // はじめの配り方（14 枚）
  box.innerHTML = `
    <div class="uw-stage">
      <svg class="uw-oni" viewBox="0 0 260 240" role="img" aria-label="おにぎりの値段の中身">
        <defs><clipPath id="uwTri"><path d="M130 14 C150 14 248 190 236 214 C228 230 32 230 24 214 C12 190 110 14 130 14 Z"/></clipPath></defs>
        <g clip-path="url(#uwTri)"><rect width="260" height="240" fill="#fffaf0"/><g data-k="bands"></g></g>
        <path d="M130 14 C150 14 248 190 236 214 C228 230 32 230 24 214 C12 190 110 14 130 14 Z" fill="none" stroke="#2a2015" stroke-width="4"/>
        <rect x="92" y="150" width="76" height="80" rx="4" fill="#24331f" opacity=".9" data-k="nori"/>
        <text x="130" y="120" text-anchor="middle" class="uw-price" data-k="price">140 円</text>
      </svg>
      <p class="uw-total">配った 10 円玉 <b data-k="used">14</b> / ${COINS} 枚</p>
      <p class="uw-msg" data-k="msg" aria-live="polite">140 円は、だれのところへ？ 10 円玉を箱に配って予想しよう。</p>
    </div>
    <div class="uw-side">
      <ol class="uw-boxes">${C.map(([s, n, , c, d], i) => `
        <li style="--c:${c}"><span class="uw-s" aria-hidden="true">${s}</span><span class="uw-n"><b>${n}</b><small>${d}</small></span>
          <span class="uw-ctrl"><button type="button" data-m="${i}" aria-label="${n}を 1 枚へらす">−</button><span class="uw-coins" data-k="c${i}"></span><button type="button" data-p="${i}" aria-label="${n}に 1 枚ふやす">＋</button></span>
          <span class="uw-cmp" data-k="cmp${i}"></span></li>`).join('')}
      </ol>
      <button type="button" class="uw-go" data-a="go">答え合わせ</button>
      <div class="uw-res" hidden></div>
    </div>
    <div class="uw-learn">
      <p><b>140 円は、たくさんの人で分けている</b>お米をつくる人、運ぶ人、売る人……。1 個のおにぎりの値段は、かかわった人たちに少しずつ分かれていきます。それぞれが足した価値が「付加価値」です（<a href="glossary.html#fukakachi">付加価値</a>）。</p>
      <p><b>材料は、思ったより少ない？</b>お米や具など材料のお金（原価）は、値段の一部。つくる・運ぶ・売る手間や、お店の家賃・電気にも、多くのお金がかかっています（<a href="glossary.html#cost-price">原価</a>）。</p>
      <p><b>もうけは、ほんの少し</b>1 個あたりのもうけは小さくても、たくさん売ることで会社は続けられます。値段を上げずに続けるために、工夫が必要です。</p>
      <p><b>税金も入っている</b>お店で買って持ち帰る食べものの消費税は 8%（軽減税率）。140 円のうち約 10 円は税金です。</p>
    </div>
    <p class="uw-note">中身の金額は、しくみを知るための「たとえ」です。実際は、商品・お店・会社によってちがいます。</p>`;
  const K = k => box.querySelector(`[data-k="${k}"]`);
  const paint = () => {
    const used = g.reduce((a, b) => a + b, 0);
    K('used').textContent = used; box.querySelector('.uw-total').classList.toggle('is-ok', used === COINS);
    C.forEach((_, i) => { K('c' + i).innerHTML = '<i></i>'.repeat(g[i]) || '<em>0</em>'; });
    box.querySelector('.uw-go').disabled = used !== COINS;
    K('msg').textContent = done ? K('msg').textContent : used === COINS ? '14 枚ぜんぶ配れたら、「答え合わせ」を押そう。' : used < COINS ? `あと ${COINS - used} 枚、配れます。` : `${used - COINS} 枚多すぎます。どこかからへらそう。`;
  };
  // おにぎりを下から色でぬる（vals：円、合計 140）
  const bands = async vals => {
    let y = 230, h = '';
    const H = 216 / 140;
    K('bands').innerHTML = '';
    for (let i = C.length - 1; i >= 0; i--) {
      const hh = vals[i] * H; y -= hh;
      K('bands').insertAdjacentHTML('beforeend', `<rect class="uw-band" x="0" y="${y.toFixed(1)}" width="260" height="${hh.toFixed(1)}" fill="${C[i][3]}" style="--d:${((C.length - 1 - i) * .12).toFixed(2)}s"/>${hh > 16 ? `<text class="uw-bl" x="130" y="${(y + hh / 2 + 5).toFixed(1)}" text-anchor="middle" style="--d:${((C.length - 1 - i) * .12 + .2).toFixed(2)}s">${C[i][1]} ${vals[i]} 円</text>` : ''}`);
    }
    K('nori').style.opacity = '.25'; K('price').style.opacity = '0';
    await sleep(C.length * 120 + 400);
  };
  const check = async () => {
    done = true; box.classList.add('is-done');
    const ans = C.map(c => c[2]), diff = C.reduce((a, c, i) => a + Math.abs(g[i] * 10 - c[2]), 0), score = Math.max(0, Math.round(100 - diff / 2));
    C.forEach(([, , a], i) => { const me = g[i] * 10; K('cmp' + i).innerHTML = `<span class="uw-bar is-me" style="width:${me / 40 * 100}%"></span><span class="uw-bar is-ans" style="width:${a / 40 * 100}%"></span><small>予想 ${me}・たとえ ${a} 円</small>`; });
    await bands(ans);
    const far = C.map((c, i) => [Math.abs(g[i] * 10 - c[2]), i]).sort((a, b) => b[0] - a[0])[0][1];
    const t = score >= 90 ? ['眼', '値段の名探偵'] : score >= 75 ? ['鋭', 'なかなかの目'] : ['初', 'これから見ぬける'];
    K('msg').textContent = `いちばんずれたのは「${C[far][1]}」。たとえでは ${C[far][2]} 円でした。`;
    const res = box.querySelector('.uw-res');
    res.innerHTML = `<span class="uw-r-seal" aria-hidden="true">${t[0]}</span><div><p class="uw-r-t">${t[1]}<small>${score} 点</small></p><p>材料（お米・のり・具・袋）は合わせて ${ans[0] + ans[1] + ans[2]} 円。つくる・運ぶ・売る手間は ${ans[3] + ans[4] + ans[5]} 円でした。</p><button type="button" class="uw-again" data-a="again">もう一度予想する</button></div>`;
    res.hidden = false;
    try { const b = +localStorage.getItem('azakei_uchiwake') || 0; localStorage.setItem('azakei_uchiwake', String(Math.max(b, score))); } catch (e) {}
  };
  box.addEventListener('click', e => {
    if (done && !e.target.closest('[data-a="again"]')) return;
    const p = e.target.closest('[data-p]'), m = e.target.closest('[data-m]');
    if (p) { g[+p.dataset.p]++; paint(); return; }
    if (m) { const i = +m.dataset.m; if (g[i] > 0) g[i]--; paint(); return; }
    if (e.target.closest('[data-a="go"]')) { check(); return; }
    if (e.target.closest('[data-a="again"]')) { done = false; box.classList.remove('is-done'); box.querySelector('.uw-res').hidden = true; K('bands').innerHTML = ''; K('nori').style.opacity = ''; K('price').style.opacity = ''; C.forEach((_, i) => { K('cmp' + i).innerHTML = ''; }); paint(); }
  });
  paint();
})();
