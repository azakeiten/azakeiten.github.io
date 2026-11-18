/* ================================================================
   cfund.js — コンテスト：クラウドファンディングに挑戦（近づいてから読みこむ）
   ・プロジェクト・目標金額・お礼（リターン）の値段・広め方を決めて、30 日間の募集をはじめる
   ・支援してくれる人が毎日あらわれ、進み具合の棒がのびる。はじめと終わりに多く集まる（よくある形）
   ・目標にとどかなければ、お金は 1 円も受けとれない（オール・オア・ナッシング型）
   ・とどいたら、手数料（たとえ 10%）とお礼をつくるお金を引いて、手元にのこる額を出す
   ・数字はすべてたとえ。見た目は cfund.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-cfund]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="cfund.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'cfund.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const man = v => (Math.round(v / 1000) / 10).toLocaleString() + ' 万円';
  const DAYS = 30, FEE = .1;
  const PJ = [['本', '町の古本カフェ', '使われなくなった本を集めて、だれでも読めるカフェに。', 1], ['祭', '文化祭の体験展示キット', '経済を遊んで学べるゲームを、ほかの学校にも届ける。', 1.2], ['旗', '商店街のスタンプラリー', 'お店をめぐると景品がもらえる、町のお祭りをつくる。', .85]];
  const TIER = [[1000, '感謝の手紙とお名前の掲載', .8, .3], [3000, 'オリジナルステッカーと活動報告', .45, .4], [10000, '招待券と限定グッズ', .12, .5]];   // 値段・中身・支援してくれる割合・お礼をつくるお金の割合
  const PR = [['SNS で毎日発信', 1.25, 0], ['チラシを配る', 1.1, 20000], ['なにもしない', 1, 0]];
  let pj = 0, goal = 300000, tier = 1, pr = 0, busy = false;

  box.innerHTML = `
    <div class="kf-page">
      <div class="kf-hero"><span class="kf-seal" data-k="seal">本</span><div><p class="kf-tag">プロジェクト</p><p class="kf-title" data-k="title"></p><p class="kf-desc" data-k="desc"></p></div></div>
      <div class="kf-bar"><i data-k="fill"></i><span class="kf-goal">目標</span></div>
      <div class="kf-stats"><p><small>集まった金額</small><b data-k="raised">0 円</b></p><p><small>達成率</small><b data-k="pct">0%</b></p><p><small>支援した人</small><b data-k="ppl">0 人</b></p><p><small>のこり</small><b data-k="left">${DAYS} 日</b></p></div>
      <div class="kf-crowd" data-k="crowd" aria-hidden="true"></div>
      <svg class="kf-days" viewBox="0 0 300 70" role="img" aria-label="毎日の支援の数"></svg>
      <div class="kf-stamp" data-k="stamp" aria-hidden="true"></div>
      <p class="kf-msg" data-k="msg" aria-live="polite">プロジェクトと目標を決めて、「募集をはじめる」を押そう。</p>
    </div>
    <div class="kf-side">
      <p class="kf-h">1. プロジェクト</p>
      <div class="kf-opts" data-g="pj">${PJ.map(([s, t], i) => `<button type="button" data-v="${i}" aria-pressed="${!i}"><span>${s}</span>${t}</button>`).join('')}</div>
      <label class="kf-goalset"><span class="kf-h">2. 目標金額</span><output data-k="goal">30 万円</output><input type="range" min="100000" max="1200000" step="50000" value="300000"></label>
      <p class="kf-h">3. お礼（リターン）1 口の値段</p>
      <div class="kf-opts is-tier" data-g="tier">${TIER.map(([p, t], i) => `<button type="button" data-v="${i}" aria-pressed="${i === 1}"><b>${p.toLocaleString()} 円</b><small>${t}</small></button>`).join('')}</div>
      <p class="kf-h">4. 広め方</p>
      <div class="kf-opts" data-g="pr">${PR.map(([t, , c], i) => `<button type="button" data-v="${i}" aria-pressed="${!i}">${t}${c ? `<small>${c.toLocaleString()} 円かかる</small>` : ''}</button>`).join('')}</div>
      <button type="button" class="kf-go" data-a="go">30 日間の募集をはじめる</button>
    </div>
    <div class="kf-result" hidden></div>
    <div class="kf-learn">
      <p><b>クラウドファンディング</b>インターネットでアイデアを発表し、共感した多くの人から少しずつお金を集める方法です（<a href="glossary.html#crowdfunding">クラウドファンディング</a>）。</p>
      <p><b>オール・オア・ナッシング</b>目標にとどいたときだけお金を受けとれる形。とどかなければ、支援したお金は返されます。目標が高すぎると、1 円も受けとれないことも。とどかなくても受けとれる形もあります。</p>
      <p><b>のこるお金は、集めた額より少ない</b>サイトに払う手数料や、お礼の品をつくって送るお金がかかります。お礼を豪華にしすぎると、手元にのこるお金が減ります（<a href="glossary.html#fee">手数料</a>）。</p>
      <p><b>大切なのは「共感」</b>なぜやりたいのか、どんな人が喜ぶのか。ビジネスプランと同じで、伝わる言葉がお金を集めます。上の「ビジネスプランのたね」とも、つながっています（<a href="glossary.html#startup">起業</a>）。</p>
    </div>
    <p class="kf-note">プロジェクト・支援してくれる人の数・手数料（10%）は、しくみを知るための「たとえ」です。実際の手数料はサイトによってちがいます。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const result = box.querySelector('.kf-result'), range = box.querySelector('.kf-goalset input'), days = box.querySelector('.kf-days'), page = box.querySelector('.kf-page');
  const showPJ = () => { const [s, t, d] = PJ[pj]; K('seal').textContent = s; K('title').textContent = t; K('desc').textContent = d; };
  const reset = () => {
    K('fill').style.width = '0%'; K('raised').textContent = '0 円'; K('pct').textContent = '0%'; K('ppl').textContent = '0 人'; K('left').textContent = DAYS + ' 日';
    K('crowd').innerHTML = ''; days.innerHTML = ''; K('stamp').className = 'kf-stamp'; K('stamp').textContent = ''; page.classList.remove('is-ok', 'is-ng'); result.hidden = true;
  };
  // 30 日の、支援が集まる形（はじめと終わりが多い）
  const shape = Array.from({ length: DAYS }, (_, d) => (d < 3 ? 4 - d : d > DAYS - 4 ? 2 + (d - (DAYS - 4)) : .55) * (.75 + Math.random() * .5));
  const run = async () => {
    if (busy) return; busy = true; box.classList.add('is-busy'); reset();
    const [price, , will, costR] = TIER[tier], [, boost, prCost] = PR[pr];
    const backers = Math.round(300 * PJ[pj][3] * will * boost * (.85 + Math.random() * .3));
    const sum = shape.reduce((a, b) => a + b, 0), per = shape.map(v => v / sum * backers);
    let got = 0, acc = 0; const daily = [];
    K('msg').textContent = '募集がはじまりました。まずは、家族や友だち、ちかくの人たちが応援してくれます。';
    for (let d = 0; d < DAYS; d++) {
      acc += per[d]; const n = Math.round(acc) - got; got += n; daily.push(n);
      const raised = got * price, pct = raised / goal * 100;
      K('fill').style.width = Math.min(100, pct).toFixed(1) + '%'; K('raised').textContent = raised.toLocaleString() + ' 円'; K('pct').textContent = Math.floor(pct) + '%'; K('ppl').textContent = got + ' 人'; K('left').textContent = (DAYS - d - 1) + ' 日';
      page.classList.toggle('is-over', pct >= 100);
      const crowd = K('crowd'); for (let k = 0; k < Math.min(n, 12); k++) { if (crowd.children.length < 120) { const i = document.createElement('i'); i.style.setProperty('--h', Math.floor(Math.random() * 360)); crowd.appendChild(i); } }
      const mx = Math.max(...daily, 1); days.innerHTML = daily.map((v, i) => `<rect x="${i * 10 + 1}" y="${64 - v / mx * 56}" width="8" height="${v / mx * 56}" rx="2" class="${i === d ? 'is-now' : ''}"/>`).join('') + '<line x1="0" x2="300" y1="64" y2="64"/>';
      if (d === 5) K('msg').textContent = 'まんなかの時期は、支援がゆっくりになりがち。広め方の工夫が大切です。';
      if (d === DAYS - 4) K('msg').textContent = 'のこりわずか！ 「終わる前に応援しよう」という人がふえてきました。';
      await sleep(d < 3 || d > DAYS - 5 ? 260 : 120);
    }
    const raised = got * price, ok = raised >= goal;
    const fee = raised * FEE, cost = raised * costR, net = raised - fee - cost - prCost;
    page.classList.add(ok ? 'is-ok' : 'is-ng'); K('stamp').textContent = ok ? '達成' : '不成立'; K('stamp').classList.add('is-in');
    K('msg').textContent = ok ? `目標の ${man(goal)} をこえて、${man(raised)} が集まりました！` : `${man(raised)} 集まりましたが、目標の ${man(goal)} にとどきませんでした。お金は支援者に返されます。`;
    result.innerHTML = `<span class="kf-r-seal" aria-hidden="true">${ok ? '達' : '戻'}</span><div><p class="kf-r-h">${ok ? 'プロジェクト成立' : 'プロジェクト不成立'}</p>
      ${ok ? `<ul class="kf-r-calc"><li><small>集まった金額</small><b>${raised.toLocaleString()} 円</b></li><li class="is-minus"><small>手数料（10%）</small><b>− ${fee.toLocaleString()} 円</b></li><li class="is-minus"><small>お礼をつくって送るお金</small><b>− ${Math.round(cost).toLocaleString()} 円</b></li>${prCost ? `<li class="is-minus"><small>チラシ代</small><b>− ${prCost.toLocaleString()} 円</b></li>` : ''}<li class="is-net"><small>手元にのこるお金</small><b>${Math.round(net).toLocaleString()} 円</b></li></ul>
      <p>${tier === 2 ? '1 口が高いと、支援してくれる人は少なくなります。' : tier === 0 ? '1 口が安いと、支援してくれる人は多くなりますが、たくさんの人が必要です。' : ''}${goal < raised * .6 ? '目標を少し高くしても、とどいたかもしれません。' : ''}</p>`
      : `<p>オール・オア・ナッシング型では、目標にとどかないと 1 円も受けとれません。目標を下げる、お礼の値段を変える、広め方を工夫する、のどれかでためしてみよう。</p>`}</div>`;
    result.hidden = false;
    busy = false; box.classList.remove('is-busy');
    try { localStorage.setItem('azakei_cfund', ok ? 'ok' : 'ng'); } catch (e) {}
  };

  box.addEventListener('click', e => {
    const b = e.target.closest('.kf-opts button'); if (b && !busy) {
      const g = b.closest('[data-g]').dataset.g, v = +b.dataset.v;
      b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      if (g === 'pj') { pj = v; showPJ(); } else if (g === 'tier') tier = v; else pr = v;
      reset(); return;
    }
    if (e.target.closest('[data-a="go"]')) run();
  });
  range.addEventListener('input', () => { goal = +range.value; K('goal').textContent = man(goal); if (!busy) reset(); });
  showPJ();
})();
