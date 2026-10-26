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
    pickIdx = +b.dataset.i;
    box.querySelectorAll('.bg-opts button').forEach(x => { x.disabled = true; x.classList.toggle('is-me', x === b); });
    show();
  }));
})();
