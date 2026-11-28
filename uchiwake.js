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

/* ================================================================
   v365：「おにぎり屋の値上げ会議」— 材料や電気代が上がる 6 か月。値段をどうする？
   ・毎月ニュースが来て、原価（お米・具・工場・運ぶ・お店など）が上がる
   ・となりの店も、原価が上がると値上げする（少しおくれて）
   ・毎月の作戦：値上げ（+10 円）／小さくする（原価 −8 円・満足度 −25）／そのまま／工夫する（1 回だけ・30 万円・次の月から工場 −8 円）
   ・お客さんの数＝常連 ×（となりの値段 ÷ 自分の値段）^5 ×（満足度）^2。となりより高いと常連が少しずつはなれる
   ・6 か月のもうけ（万円）が得点。数字はすべてたとえ。自己ベストは azakei_oni_best
   ・バランス：工夫＋原価に合わせた値上げ（平均 約 130 万円）＞ 1 回小さくする（約 115）＞ 毎月値上げ（約 110）＞ そのまま（約 −230）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-uchiwake]');
  if (!box || document.querySelector('.og')) return;
  if (!document.querySelector('link[href^="onigame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'onigame.css?v=20261129c'; document.head.appendChild(l); }
  const KEY = 'azakei_oni_best';
  const getB = () => { try { const v = localStorage.getItem(KEY); return v === null ? null : +v; } catch (e) { return null; } };
  const g = document.createElement('div');
  g.className = 'og';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="og-sub"><span aria-hidden="true">験</span>じっくりためす：10 円玉 14 枚で、値段の中身を予想する</p>');
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // 原価の中身（1 個あたり・税ぬき・たとえ）：[印, 名前, 円, 色]
  const PART = [['米', 'お米', 26, '#e9dcb8'], ['具', 'のりと具', 20, '#3d5a3a'], ['包', '包む袋', 6, '#9ec6dd'], ['工', '工場', 24, '#e3b341'], ['運', '運ぶ', 9, '#6b8fb0'], ['店', 'お店', 32, '#d8822a'], ['本', '本部・広告', 8, '#8a6fb0']];
  // ニュース：[印, 見出し, くわしく, どの原価, 何円]
  const NEWS = [
    ['米', 'お米が不作。お米の値段が上がった', '夏の暑さで、お米のとれる量が減りました。', 0, 6],
    ['米', 'お米の値段が、上がりつづけている', '足りないお米を、みんなが買おうとしています。', 0, 5],
    ['円', '円安で、輸入する具が高くなった', 'さけやツナは外国から。1 ドルに払う円が増えると、高くなります。', 1, 4],
    ['電', '電気代が上がった', '工場の機械や冷蔵庫は、電気で動いています。', 3, 3],
    ['油', 'トラックの燃料が高くなった', '夜のうちにお店へ運ぶトラックの燃料代です。', 4, 3],
    ['時', '最低賃金が上がった', 'お店の人の時給が上がりました。働く人にはうれしいニュース。', 5, 4],
    ['人', '人手不足。工場の時給を上げた', '働く人が集まらず、時給を上げて募集しました。', 3, 4],
    ['袋', '包む袋の原料（石油）が高くなった', '袋のフィルムは、石油からつくります。', 2, 2]
  ];
  const TITLE = [[140, 'おにぎり屋の名社長'], [110, 'たよれる社長'], [60, '見習い社長'], [-1e9, 'これから学ぶ社長']];
  let s = null;
  const cost = () => s.part.reduce((a, b) => a + b, 0);
  const sales = () => Math.min(1.5 * s.B, s.B * Math.pow(s.r / s.p, 5) * Math.pow(s.sat / 100, 2));
  const man = v => (Math.round(v * 10) / 10).toFixed(1);
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="og-intro">
      <div class="og-tri" aria-hidden="true"><svg viewBox="0 0 120 110"><path d="M60 6 C70 6 116 88 110 99 C106 107 14 107 10 99 C4 88 50 6 60 6 Z" fill="#fffaf0" stroke="#2a2015" stroke-width="3"/><rect x="42" y="66" width="36" height="40" rx="3" fill="#24331f"/><text x="60" y="52" text-anchor="middle">↑</text></svg></div>
      <div><p class="og-kicker">6 か月の経営会議</p><h3 class="og-h">おにぎり屋の値上げ会議</h3>
      <p class="og-p">あなたはおにぎり屋の社長。1 個 <b>130 円</b>（税ぬき）で、作るのにかかるお金（原価）は 125 円。お米や電気代が上がるニュースが毎月とどきます。<b>値上げ</b>する？ <b>小さく</b>する？ <b>そのまま</b>？ それとも<b>工夫</b>する？ となりの店より高すぎると、お客さんがはなれていきます。6 か月で、いちばんもうけを残そう。数字はすべてたとえです。</p>
      <p class="og-best">${b !== null ? `自己ベスト <b>${man(b)}</b> 万円` : 'はじめての会議'}</p>
      <button type="button" class="og-go" data-og="start">会議を始める</button></div></div>`;
  };
  const start = () => {
    s = { m: 0, news: shuffle(NEWS).slice(0, 6), part: PART.map(x => x[2]), p: 130, r: 130, acc: 0, sat: 100, B: 1000, tot: 0, log: [], kz: 0, shrink: 0, ups: 0 };
    month();
  };
  const bar = () => { const c = cost(); return `<div class="og-cost" aria-hidden="true">${s.part.map((v, i) => `<i style="flex:${v};background:${PART[i][3]}" title="${PART[i][1]} ${v} 円"></i>`).join('')}<b style="flex:${Math.max(0, s.p - c)}"></b></div>`; };
  const month = () => {
    const n = s.news[s.m];
    s.part[n[3]] += n[4]; s.acc += n[4];
    let rival = '';
    if (s.acc >= 8) { s.r += 10; s.acc -= 10; rival = `<p class="og-rival"><span aria-hidden="true">隣</span>となりの店が <b>${s.r} 円</b> に値上げしました。</p>`; }
    if (s.kz === 1) { s.part[3] -= 8; s.kz = 2; }
    const c = cost(), mg = s.p - c;
    g.innerHTML = `<div class="og-play">
      <ol class="og-cal" aria-label="${s.m + 1} か月目 / 6 か月">${[0, 1, 2, 3, 4, 5].map(i => `<li class="${i < s.m ? 'is-done' : i === s.m ? 'is-now' : ''}">${i + 1}<small>月目</small></li>`).join('')}</ol>
      <div class="og-news"><span class="og-seal" aria-hidden="true">${n[0]}</span><div><p class="og-nh">${n[1]}</p><p class="og-nd">${n[2]}<b>${PART[n[3]][1]} ＋${n[4]} 円</b></p></div></div>
      ${rival}
      <div class="og-board">
        <div class="og-num"><span>うちの値段</span><b>${s.p}<small>円</small></b></div>
        <div class="og-num"><span>原価</span><b>${c}<small>円</small></b></div>
        <div class="og-num ${mg <= 0 ? 'is-red' : ''}"><span>1 個のもうけ</span><b>${mg > 0 ? '+' : ''}${mg}<small>円</small></b></div>
        <div class="og-num"><span>となりの店</span><b>${s.r}<small>円</small></b></div>
      </div>
      ${bar()}
      <ul class="og-legend">${PART.map((x, i) => `<li><i style="background:${x[3]}"></i>${x[1]} ${s.part[i]}</li>`).join('')}<li><i class="is-m"></i>もうけ</li></ul>
      <div class="og-meters"><p><span>お客さんの満足</span><i><b style="width:${s.sat}%"></b></i><em>${s.sat}</em></p><p><span>常連さん</span><i><b style="width:${s.B / 10}%"></b></i><em>${Math.round(s.B)} 人</em></p></div>
      <p class="og-q">今月は、どうする？</p>
      <div class="og-acts">
        <button type="button" data-act="up"><span aria-hidden="true">上</span><b>値上げ</b><small>${s.p} → ${s.p + 10} 円</small></button>
        <button type="button" data-act="shrink"><span aria-hidden="true">小</span><b>小さくする</b><small>原価 −8 円・満足 −25</small></button>
        <button type="button" data-act="keep"><span aria-hidden="true">同</span><b>そのまま</b><small>値段も大きさも変えない</small></button>
        <button type="button" data-act="kaizen" ${s.kz ? 'disabled' : ''}><span aria-hidden="true">工</span><b>工夫する</b><small>${s.kz ? '工夫は済み' : '30 万円で機械を入れる。来月から工場 −8 円'}</small></button>
      </div>
      <div class="og-res" data-og="res" aria-live="polite"></div>
      <p class="og-tot">これまでのもうけ <b>${man(s.tot)}</b> 万円</p></div>`;
  };
  const act = a => {
    if (!s || s.done) return;
    s.done = true;
    let extra = 0, note = '';
    if (a === 'up') { s.p += 10; s.ups++; note = '値上げしました。'; }
    else if (a === 'shrink') { s.part[0] -= 5; s.part[1] -= 3; s.sat -= 25; s.shrink++; note = 'ご飯と具を少し減らしました。気づいたお客さんは、がっかり……。'; }
    else if (a === 'kaizen' && !s.kz) { s.kz = 1; extra = -30; note = '新しい機械を入れました（30 万円）。来月から、工場の原価が 8 円下がります。'; }
    else note = '値段も大きさも、そのまま。';
    s.B *= s.p >= s.r + 20 ? 0.8 : s.p > s.r ? 0.88 : 1;
    const c = cost(), q = sales(), pr = (s.p - c) * q * 30 / 10000 + extra;
    s.tot += pr; s.log.push({ a, pr, p: s.p, r: s.r, c });
    if (s.sat < 100 && a !== 'shrink') s.sat = Math.min(100, s.sat + 2);
    { const nb = g.querySelectorAll('.og-num b'), mg2 = s.p - c; nb[0].innerHTML = s.p + '<small>円</small>'; nb[1].innerHTML = c + '<small>円</small>'; nb[2].innerHTML = (mg2 > 0 ? '+' : '') + mg2 + '<small>円</small>'; nb[2].parentNode.classList.toggle('is-red', mg2 <= 0); g.querySelector('.og-cost').outerHTML = bar(); g.querySelector('.og-meters').innerHTML = `<p><span>お客さんの満足</span><i><b style="width:${s.sat}%"></b></i><em>${s.sat}</em></p><p><span>常連さん</span><i><b style="width:${s.B / 10}%"></b></i><em>${Math.round(s.B)} 人</em></p>`; }
    g.querySelectorAll('[data-act]').forEach(b => { b.disabled = true; b.classList.toggle('is-on', b.dataset.act === a); });
    const lost = s.p > s.r ? `<p class="og-warn">となりより高いので、常連さんが ${s.p >= s.r + 20 ? '大ぜい' : '少し'}はなれました。</p>` : '';
    g.querySelector('[data-og="res"]').innerHTML = `<p>${note}</p>${lost}<div class="og-out"><p><span>1 日のお客さん</span><b>${Math.round(q)}</b> 人</p><p><span>今月のもうけ</span><b class="${pr < 0 ? 'is-red' : ''}">${pr >= 0 ? '+' : ''}${man(pr)}</b> 万円</p></div><button type="button" class="og-go" data-og="next">${s.m < 5 ? '次の月へ' : '6 か月の決算へ'}</button>`;
    g.querySelector('.og-tot b').textContent = man(s.tot);
    g.querySelector('[data-og="next"]').focus({ preventScroll: true });
  };
  const finish = () => {
    const prev = getB(), best = prev === null || s.tot > prev;
    try { if (best) localStorage.setItem(KEY, String(Math.round(s.tot * 10) / 10)); localStorage.setItem('azakei_uchiwake_ceo', '1'); } catch (e) {}
    const ti = TITLE.findIndex(x => s.tot >= x[0]);
    const mx = Math.max(...s.log.map(l => Math.abs(l.pr)), 1);
    const AN = { up: '値上げ', shrink: '小さく', keep: 'そのまま', kaizen: '工夫' };
    const tips = [];
    if (s.log.every(l => l.a === 'keep')) tips.push('ずっと「そのまま」だと、上がった原価をお店が全部かぶって、赤字になります。');
    if (s.shrink) tips.push('「小さくする」は、値札が変わらないので「見えない値上げ」とも言われます。気づいたお客さんの満足は、なかなかもどりません。');
    if (s.kz) tips.push('機械を入れる工夫で、少ない手間で多く作れるようになりました。これを「<a href="glossary.html#productivity">生産性</a>が上がる」と言います。'); else tips.push('「工夫する」を使うと、値上げにたよらずに原価を下げられます。');
    if (s.log.some(l => l.p >= l.r + 20)) tips.push('となりより 20 円以上高くすると、常連さんが大きくはなれました。');
    g.innerHTML = `<div class="og-end">
      <p class="og-kicker">6 か月の決算</p>
      <p class="og-big"><b>${s.tot >= 0 ? '' : '−'}${man(Math.abs(s.tot))}</b> 万円<small>最後の値段 ${s.p} 円（となり ${s.r} 円）・原価 ${cost()} 円・常連さん ${Math.round(s.B)} 人</small></p>
      <p class="og-title"><span aria-hidden="true">称</span>${TITLE[ti][1]}${best ? '<em>自己ベスト更新</em>' : `<small>自己ベスト ${man(prev)} 万円</small>`}</p>
      <div class="og-chart" aria-label="月ごとのもうけ">${s.log.map((l, i) => `<div class="og-col"><i class="${l.pr < 0 ? 'is-neg' : ''}" style="--h:${(Math.abs(l.pr) / mx * 100).toFixed(0)}%"></i><b>${man(l.pr)}</b><small>${i + 1} 月<br>${AN[l.a]}</small></div>`).join('')}</div>
      <ul class="og-tips">${tips.map(t => `<li>${t}</li>`).join('')}</ul>
      <div class="og-learn"><p><b>コストが上がって物価が上がる</b>材料・電気・人の時給が上がると、お店は値上げしないと続けられません。こうして物価が上がることを、<a href="glossary.html#inflation">インフレ</a>（<a href="glossary.html#cost-push">コストプッシュ型</a>）と言います。値上げは悪いことではなく、働く人の時給を上げるためにも必要なことがあります。</p></div>
      <button type="button" class="og-go" data-og="start">もう一度、会議をひらく</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(g, 'oni', ti, TITLE.length);
    s = null;
  };
  g.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (b && !b.disabled) { act(b.dataset.act); return; }
    if (e.target.closest('[data-og="start"]')) { start(); return; }
    if (e.target.closest('[data-og="next"]') && s) { s.m++; s.done = false; s.m < 6 ? month() : finish(); g.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
  intro();
})();
