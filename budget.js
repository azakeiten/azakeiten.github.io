/* ================================================================
   budget.js — 経済ラボ：国の予算を 100 円にたとえると？（予想 → 100 円玉がドーナツグラフに割れる）
   ・割合は、財務省が公表している最近の一般会計の当初予算（2024〜2025 年度）の「だいたい」
   ================================================================ */
(function() {
  const box = document.querySelector('[data-budget]');
  if (!box) return;
  // [名前, 約◯円, 色, ひとこと]
  const P = [
    ['社会保障', 33, '#b5432f', '年金・医療・介護・子育てなど。お年寄りが増えるほど大きくなりやすい。'],
    ['国債費（借金の返済と利子）', 24, '#1c2b23', 'これまでに借りたお金（国債）を返したり、利子を払ったりするお金。'],
    ['地方交付税交付金など', 16, '#b08a4a', '地域によって税収に差があるので、国から地方へ配るお金。'],
    ['防衛', 7, '#5a6b7a', '自衛隊などのためのお金。'],
    ['公共事業', 5, '#2f6b3a', '道路・橋・堤防など、みんなが使うものをつくるお金。'],
    ['文教・科学', 5, '#d4688a', '学校や教科書、研究のためのお金。'],
    ['その他', 10, '#a99a80', 'エネルギー、食料、外国への協力など。']
  ];
  let pickIdx = -1;
  box.innerHTML = `
    <div class="bg-q"><p class="bg-q-h">予想してみよう：100 円のうち、<b>いちばん多く使われている</b>のは？</p>
      <div class="bg-opts">${P.slice(0, 6).map(([n], i) => `<button type="button" data-i="${i}">${n.replace(/（.*）/, '')}</button>`).join('')}</div></div>
    <div class="bg-stage" hidden>
      <div class="bg-coin"><svg viewBox="0 0 200 200" aria-hidden="true"><g transform="rotate(-90 100 100)" data-arcs></g><circle cx="100" cy="100" r="52" class="bg-hole"/></svg><p class="bg-center"><b>100</b><small>円</small></p></div>
      <ol class="bg-list"></ol>
    </div>
    <p class="bg-verdict" aria-live="polite"></p>
    <p class="bg-foot">※ 財務省が公表している、最近の国の一般会計の当初予算（2024〜2025 年度）を、100 円にたとえた「だいたい」の割合です。年度によって少しずつ変わります。</p>`;
  const R = 80, C = 2 * Math.PI * R;
  const show = () => {
    const stage = box.querySelector('.bg-stage'); stage.hidden = false;
    let off = 0;
    box.querySelector('[data-arcs]').innerHTML = P.map(([, v, c], i) => { const len = C * v / 100, s = `<circle cx="100" cy="100" r="${R}" fill="none" stroke="${c}" stroke-width="44" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" style="--d:${i * 0.12}s" class="bg-arc"/>`; off += len; return s; }).join('');
    box.querySelector('.bg-list').innerHTML = P.map(([n, v, c, t], i) => `<li style="--c:${c};--d:${i * 0.12 + .2}s"${i === pickIdx ? ' class="is-pick"' : ''}><span class="bg-dot"></span><b>${n}</b><span class="bg-yen">約 ${v} 円</span><small>${t}</small></li>`).join('');
    const ok = pickIdx === 0;
    box.querySelector('.bg-verdict').innerHTML = pickIdx < 0 ? '' : ok ? '<b>正解！</b> いちばん多いのは<b>社会保障</b>で、100 円のうち約 3 分の 1。次に多いのは、借金の返済と利子（国債費）です。'
      : `<b>残念……</b> いちばん多いのは<b>社会保障</b>（約 33 円）。「${P[pickIdx][0].replace(/（.*）/, '')}」は約 ${P[pickIdx][1]} 円でした。`;
    box.classList.add('is-open');
  };
  box.querySelectorAll('.bg-opts button').forEach(b => b.addEventListener('click', () => {
    pickIdx = +b.dataset.i; try { localStorage.setItem('azakei_budget', '1'); } catch (e) {}
    box.querySelectorAll('.bg-opts button').forEach(x => { x.disabled = true; x.classList.toggle('is-me', x === b); });
    show();
  }));
})();

/* ================================================================
   v343：「100 円の予算会議」— 予想して配る → 本物とくらべる → 3 つの悩みに答える
   ・第 1 部：5 円玉 20 枚（＝100 円）を、7 つの使いみちの箱に配って予想。本物の割合とならべて、近さで点
   ・第 2 部：予算会議の 3 つの悩み（お年寄りがふえる・堤防や橋の修理・利子がふえる）。
     お金は「ほかを減らす」「借金（国債）をふやす」「税をふやす」のどれかから出す。正解はない
   ・最後に、えらび方の傾向と、本物の国の収入（税金でまかなえているのは 6〜7 割ほど、残りの多くは借金）をまとめる
   ・割合は上の P（財務省が公表している最近の当初予算の「だいたい」）。悩みの 2 円は、たとえの大きさ
   ・自己ベスト（第 1 部の点）は azakei_budget_best
   ================================================================ */
(function () {
  const box = document.querySelector('[data-budget]');
  if (!box) return;
  if (!document.querySelector('link[href^="bdgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'bdgame.css?v=20261123b'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_budget_best';
  const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  // [短い名前, 本物（約◯円）, 色, 説明]
  const P = [
    ['社会保障', 33, '#b5432f', '年金・医療・介護・子育て'],
    ['国債費', 24, '#2a3d4a', '借金の返済と利子'],
    ['地方へ配る', 16, '#b08a4a', '地方交付税交付金など'],
    ['防衛', 7, '#5a6b7a', '自衛隊など'],
    ['公共事業', 5, '#2f6b3a', '道路・橋・堤防'],
    ['文教・科学', 5, '#c0587a', '学校・研究'],
    ['その他', 10, '#a99a80', 'エネルギー・食料・外国への協力など']
  ];
  const g = document.createElement('div');
  g.className = 'bd';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="bd-sub"><span aria-hidden="true">験</span>かんたん版：いちばん多い使いみちだけを当てる</p>');
  let mine, score, plan, picks;
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="bd-intro">
      <div class="bd-coin" aria-hidden="true"><b>100</b><small>円</small></div>
      <div><p class="bd-kicker">予算会議</p><h3 class="bd-h">100 円の予算会議</h3>
      <p class="bd-p">国が 1 年に使うお金（110 兆円台）を、100 円玉 1 枚にたとえます。第 1 部では、5 円玉 20 枚を 7 つの使いみちに配って予想し、本物とくらべます。第 2 部では、予算会議のメンバーとして 3 つの悩みに答えます。お金は、空からはふってきません。</p>
      <p class="bd-best">${b ? `第 1 部の自己ベスト <b>${b}</b> 点` : 'はじめての会議'}</p>
      <button type="button" class="bd-go" data-bd="start">会議をはじめる</button></div></div>`;
  };
  /* ドーナツ（円グラフ）：vals の合計を 1 周に */
  const donut = (vals, extra = 0, label = '') => {
    const R = 80, C = 2 * Math.PI * R, tot = vals.reduce((a, b) => a + b, 0) + extra;
    let off = 0;
    const arcs = vals.map((v, i) => { const len = C * v / (tot || 1); const s = `<circle cx="100" cy="100" r="${R}" fill="none" stroke="${P[i][2]}" stroke-width="40" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"/>`; off += len; return s; }).join('');
    const ex = extra ? `<circle cx="100" cy="100" r="${R}" fill="none" stroke="url(#bdx)" stroke-width="40" stroke-dasharray="${(C * extra / tot).toFixed(2)} ${(C - C * extra / tot).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"/>` : '';
    return `<svg viewBox="0 0 200 200" aria-hidden="true"><defs><pattern id="bdx" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#e9dfc8"/><rect width="3" height="8" fill="#8a7a5a"/></pattern></defs><g transform="rotate(-90 100 100)">${arcs}${ex}</g></svg><p class="bd-mid"><b>${label || tot}</b><small>円</small></p>`;
  };
  /* 第 1 部：配る */
  const deal = () => {
    const left = 20 - mine.reduce((a, b) => a + b, 0);
    g.innerHTML = `<div class="bd-deal">
      <p class="bd-step">第 1 部 ・ 予想して配る</p>
      <p class="bd-q">100 円のうち、それぞれにいくら使われていると思う？ 5 円玉を配ろう。</p>
      <div class="bd-dgrid">
        <div class="bd-pie">${donut(mine.map(n => n * 5), left * 5, String(100 - left * 5))}<p class="bd-left">のこり <b>${left}</b> 枚（${left * 5} 円）</p></div>
        <ul class="bd-boxes">${P.map((p, i) => `<li style="--c:${p[2]}"><span class="bd-name"><b>${p[0]}</b><small>${p[3]}</small></span>
          <span class="bd-ctl"><button type="button" data-d="-1" data-i="${i}" aria-label="${p[0]}から 5 円もどす"${mine[i] ? '' : ' disabled'}>−</button><span class="bd-coins" aria-label="${mine[i] * 5} 円">${'<i></i>'.repeat(mine[i])}<em>${mine[i] * 5} 円</em></span><button type="button" data-d="1" data-i="${i}" aria-label="${p[0]}に 5 円配る"${left ? '' : ' disabled'}>＋</button></span></li>`).join('')}</ul>
      </div>
      <button type="button" class="bd-go" data-bd="check"${left ? ' disabled' : ''}>${left ? `あと ${left} 枚配ってね` : '本物とくらべる'}</button></div>`;
  };
  const check = () => {
    const diff = P.reduce((s, p, i) => s + Math.abs(mine[i] * 5 - p[1]), 0);
    score = Math.max(0, Math.round(100 - diff * 1.2));
    const prev = getB();
    if (score > prev) { try { localStorage.setItem(KEY, String(score)); localStorage.setItem('azakei_budget', '1'); } catch (e) {} }
    const big = P.map((p, i) => [i, mine[i] * 5 - p[1]]).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
    g.innerHTML = `<div class="bd-check">
      <p class="bd-step">第 1 部 ・ 答え合わせ</p>
      <div class="bd-two"><figure><div class="bd-pie is-sm">${donut(mine.map(n => n * 5))}</div><figcaption>あなたの予想</figcaption></figure><figure><div class="bd-pie is-sm">${donut(P.map(p => p[1]))}</div><figcaption>本物（だいたい）</figcaption></figure></div>
      <ul class="bd-bars">${P.map((p, i) => `<li style="--c:${p[2]};--d:${i * 0.1}s"><b>${p[0]}</b><span class="bd-bar"><i class="is-me" style="width:${mine[i] * 5 * 2}%"></i><i class="is-real" style="width:${p[1] * 2}%"></i></span><span class="bd-num">${mine[i] * 5} <small>→</small> <b>約 ${p[1]}</b></span></li>`).join('')}</ul>
      <p class="bd-score"><b>${score}</b> 点<small>${score > prev && prev ? '自己ベスト更新' : ''}</small></p>
      <p class="bd-note">${Math.abs(big[1]) >= 5 ? `いちばんずれたのは「${P[big[0]][0]}」（${big[1] > 0 ? `${big[1]} 円多く予想` : `${-big[1]} 円少なく予想`}）。` : 'どれも近い！ よく知っているね。'}いちばん多いのは社会保障で約 3 分の 1。2 番目は、これまでの借金の返済と利子（国債費）で、約 4 分の 1 です。</p>
      <button type="button" class="bd-go" data-bd="meet">第 2 部：予算会議へ</button></div>`;
  };
  /* 第 2 部：3 つの悩み */
  const ISSUE = [
    ['社', 0, 'お年寄りがふえて、年金や医療のお金（社会保障）が 2 円ふえそうです。', '社会保障はいちばん大きな使いみち。お年寄りの数がふえると、何もしなくても少しずつ大きくなります。'],
    ['堤', 4, '大きな地震や大雨にそなえて、古くなった堤防や橋をなおしたい。公共事業を 2 円ふやしたいという意見が出ました。', '道路や橋は、つくったあとも、なおし続けるお金がかかります。'],
    ['利', 1, '金利が上がって、これまでの借金の利子（国債費）が 2 円ふえそうです。', '借金の残りが大きいと、金利が少し上がるだけで、利子の支払いが大きくふえます。']
  ];
  const CUT = [[6, 'その他'], [5, '文教・科学'], [3, '防衛'], [4, '公共事業']];
  const meet = () => {
    if (picks.length >= ISSUE.length) return fin();
    const k = picks.length, is = ISSUE[k];
    const cuts = [[CUT[0], CUT[1]], [CUT[2], CUT[0]], [CUT[3], CUT[1]]][k];
    const vals = plan.v, extra = plan.debt + plan.tax;
    g.innerHTML = `<div class="bd-meet">
      <p class="bd-step">第 2 部 ・ 予算会議 ${k + 1} / ${ISSUE.length}</p>
      <div class="bd-mgrid">
        <div class="bd-pie is-sm">${donut(vals, 0, String(vals.reduce((a, b) => a + b, 0)))}<p class="bd-legend">${plan.debt ? `<span class="is-debt">100 円をこえた分のうち 借金 ${plan.debt} 円</span>` : ''}${plan.tax ? `<span class="is-tax">ふやした税 ${plan.tax} 円</span>` : ''}</p></div>
        <div>
          <p class="bd-issue"><span aria-hidden="true">${is[0]}</span>${is[2]}</p>
          <p class="bd-why">${is[3]}</p>
          <p class="bd-ask">その 2 円、どこから出す？</p>
          <div class="bd-opts">
            ${cuts.map(c => `<button type="button" data-pick="cut" data-c="${c[0]}"><b>「${c[1]}」を 2 円へらす</b><small>${c[0] === 6 ? 'エネルギーや外国への協力などが少しへる' : c[0] === 5 ? '学校や研究のお金が少しへる' : c[0] === 3 ? '自衛隊などのお金が少しへる' : '道路や橋の工事が少しおそくなる'}</small></button>`).join('')}
            <button type="button" data-pick="debt"><b>借金（国債）をふやして出す</b><small>いまはだれも困らない。でも、将来の返済と利子がふえる</small></button>
            <button type="button" data-pick="tax"><b>税をふやして出す</b><small>いまの人の負担がふえる。借金はふえない</small></button>
          </div>
        </div>
      </div></div>`;
  };
  const pick = (kind, c) => {
    const is = ISSUE[picks.length];
    plan.v[is[1]] += 2;
    if (kind === 'cut') plan.v[c] = Math.max(0, plan.v[c] - 2);
    if (kind === 'debt') plan.debt += 2;
    if (kind === 'tax') plan.tax += 2;
    picks.push(kind);
    const msg = kind === 'cut' ? `「${P[c][0]}」をへらして、${P[is[1]][0]}にまわしました。100 円の中で、やりくりできています。` : kind === 'debt' ? '借金で出しました。いまの 100 円はそのまま。そのかわり、将来の「国債費」が少しずつふえていきます。' : '税をふやして出しました。借金はふえませんが、いまの人の手取りが少しへります。';
    g.querySelector('.bd-opts').outerHTML = `<p class="bd-res">${msg}</p><button type="button" class="bd-go" data-bd="meet">${picks.length < ISSUE.length ? '次の悩みへ' : '会議の結果を見る'}</button>`;
  };
  const fin = () => {
    const n = k => picks.filter(x => x === k).length;
    const type = n('debt') >= 2 ? ['先送り', 'いまのくらしを守るために、借金で乗りきるタイプ。いまはだれも困りませんが、そのぶん将来の人の返済と利子がふえます。'] : n('tax') >= 2 ? ['いまの世代で負担', '必要なお金は、いまの人が税で負担するタイプ。将来に借金を残しませんが、いまの人の手取りがへります。'] : n('cut') >= 2 ? ['やりくり', 'ほかの使いみちをへらして、100 円の中でやりくりするタイプ。借金も税もふえませんが、へらされた分野の人は困るかもしれません。'] : ['バランス', 'へらす・借りる・税の 3 つを組み合わせたタイプ。それぞれの負担を少しずつ分けあっています。'];
    const vals = plan.v, extra = plan.debt + plan.tax;
    g.innerHTML = `<div class="bd-end">
      <p class="bd-step">会議の結果</p>
      <div class="bd-mgrid">
        <div class="bd-pie is-sm">${donut(vals, 0, String(vals.reduce((a, b) => a + b, 0)))}<p class="bd-legend">${plan.debt ? `<span class="is-debt">100 円をこえた分のうち 借金 ${plan.debt} 円</span>` : ''}${plan.tax ? `<span class="is-tax">ふやした税 ${plan.tax} 円</span>` : ''}</p></div>
        <div>
          <p class="bd-type"><span aria-hidden="true">型</span>${type[0]}型</p>
          <p class="bd-p2">${type[1]}</p>
          <p class="bd-p2">第 1 部の予想は <b>${score} 点</b>でした。</p>
        </div>
      </div>
      <div class="bd-learn"><p><b>正解は、ひとつではありません。</b>だれが、いつ負担するのか。予算を決めることは、それを決めることでもあります。</p>
      <p>本物の国では、使うお金のうち、税金でまかなえているのは 6〜7 割ほど。残りの多くは、借金（国債）でまかなっています（最近の当初予算のだいたい）。だから、使いみちの 2 番目が「借金の返済と利子」なのです。</p></div>
      <button type="button" class="bd-go" data-bd="start">もう一度会議をひらく</button></div>`;
  };
  g.addEventListener('click', e => {
    const d = e.target.closest('[data-d]');
    if (d && !d.disabled) { const i = +d.dataset.i; mine[i] = Math.max(0, mine[i] + +d.dataset.d); deal(); g.querySelector(`[data-i="${i}"][data-d="${d.dataset.d}"]:not(:disabled)`)?.focus({ preventScroll: true }); return; }
    const p = e.target.closest('[data-pick]');
    if (p) { pick(p.dataset.pick, +p.dataset.c); return; }
    const a = e.target.closest('[data-bd]'); if (!a || a.disabled) return;
    const k = a.dataset.bd;
    if (k === 'start') { mine = [0, 0, 0, 0, 0, 0, 0]; picks = []; plan = { v: P.map(x => x[1]), debt: 0, tax: 0 }; deal(); }
    else if (k === 'check') check();
    else if (k === 'meet') { meet(); g.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); }
  });
  intro();
})();
