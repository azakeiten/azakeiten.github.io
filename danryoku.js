/* ================================================================
   danryoku.js — 経済ラボ：値上げしたら、売上は？（価格弾力性・近づいてから読みこむ）
   ・8 つの品物で「値段を 20% 上げると、売上（値段 × 売れた数）は増える？ 減る？」を予想する
   ・答えると、20 人のお客さんのうち何人かが帰っていき（代わりがあるときは、代わりのお店へ）、売上の棒がのびちぢみする
   ・代わりがない・生活に欠かせない → お客さんが減りにくい（弾力性が小さい）→ 値上げで売上は増える
   ・代わりがある・なくても困らない → 減りやすい（弾力性が大きい）→ 値上げで売上は減る
   ・減り方はすべて、説明のためのたとえ。最後に「代わりがある ←→ ない」の線の上に 8 品をならべる
   ・自己ベストは azakei_danryoku（8 問の正解数）。見た目は danryoku.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-danryoku]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="danryoku.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'danryoku.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_danryoku', N = 20, UP = 0.2;
  // [品物, 印, 場面, 値段, 弾力性（たとえ）, 代わり, 説明]
  const IT = [
    ['お米', '米', '毎日のごはんに使う', 2000, 0.2, '', '毎日食べるものは、少し高くなっても買う量はあまり変わりません。'],
    ['電気', '電', '家の明かり・冷蔵庫・スマホの充電', 8000, 0.15, '', '生活に欠かせず、すぐには代わりがありません。使う量は少ししか減りません。'],
    ['ガソリン', '油', 'バスが少なく、車がないと通えない町', 3000, 0.25, '', '車で通うしかない人は、高くなってもすぐにはやめられません。'],
    ['かぜ薬', '薬', '熱が出た夜、近くの薬局で', 1200, 0.3, '', '今すぐ必要なものは、値段が上がっても買う人が多いです。'],
    ['遊園地の入場券', '遊', '休みの日のおでかけ先', 6000, 1.5, '映画・公園', 'ほかの遊び方がたくさんあるので、高くなると「今回はやめよう」となりやすいです。'],
    ['ケーキ', '菓', 'となりにも、ケーキ屋さんがある', 500, 2.5, 'となりのケーキ屋', 'すぐとなりに代わりのお店があると、お客さんはそちらへ移ります。'],
    ['自販機のお茶', '茶', 'すぐとなりにコンビニがある', 160, 3, 'となりのコンビニ', '同じお茶が近くで買えるので、少し高いだけで多くの人が買わなくなります。'],
    ['旅行のツアー', '旅', '春休みの家族旅行', 50000, 1.8, 'ほかの会社のツアー', 'ほかの会社のツアーや、近場の旅行にかえることができます。']
  ];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const yen = n => Math.round(n).toLocaleString() + ' 円';
  let Q = [], i = 0, ok = 0, lock = false;
  const best = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const people = () => Array.from({ length: N }, (_, k) => `<i class="dr-p" style="--k:${k}"></i>`).join('');
  const intro = () => {
    const b = best();
    box.innerHTML = `<div class="dr-intro">
      <div class="dr-tag" aria-hidden="true"><s>100</s><b>120</b><small>円</small></div>
      <div><p class="dr-kicker">8 つの品物で</p><h3 class="dr-h">値上げしたら、売上は？</h3>
      <p class="dr-p0">値段を 20% 上げると、1 つあたりは高く売れます。でも、買うのをやめる人も出ます。売上（値段 × 売れた数）は<b>増える</b>？ それとも<b>減る</b>？ お米、電気、遊園地、自販機のお茶。8 つの品物で予想しよう。お客さんの減り方は、説明のためのたとえです。</p>
      <p class="dr-best">${b ? `自己ベスト <b>${b}</b> / 8 問` : 'はじめての値上げ会議'}</p>
      <button type="button" class="dr-go" data-a="start">値上げ会議を始める</button></div></div>`;
  };
  const start = () => { Q = shuffle(IT); i = 0; ok = 0; show(); };
  const show = () => {
    const [name, seal, scene, p] = Q[i]; lock = false;
    box.innerHTML = `<div class="dr-top"><ol class="dr-dots">${Q.map((q, j) => `<li class="${j < i ? (q.ok ? 'is-ok' : 'is-ng') : j === i ? 'is-now' : ''}"></li>`).join('')}</ol><span class="dr-sc">正解 <b>${ok}</b> / ${Q.length}</span></div>
      <div class="dr-card">
        <div class="dr-item"><span class="dr-seal" aria-hidden="true">${seal}</span><div><h3>${name}</h3><p>${scene}</p></div>
          <span class="dr-price"><s data-k="old">${yen(p)}</s><b data-k="new">${yen(p * (1 + UP))}</b><small>20% 値上げ</small></span></div>
        <div class="dr-shop"><div class="dr-line" data-k="line">${people()}</div><div class="dr-alt" data-k="alt" hidden></div></div>
        <div class="dr-rev" data-k="rev" hidden></div>
      </div>
      <p class="dr-q">値上げすると、売上は？</p>
      <div class="dr-btns" data-k="btns"><button type="button" class="dr-b is-up" data-v="1"><b>増える</b><small>お客さんは、あまり減らない</small></button><button type="button" class="dr-b is-down" data-v="0"><b>減る</b><small>お客さんが、たくさん帰る</small></button></div>
      <div class="dr-rv" data-k="rv" hidden></div>`;
  };
  const K = k => box.querySelector(`[data-k="${k}"]`);
  const answer = v => {
    if (lock) return; lock = true;
    const q = Q[i], [name, , , p, e, alt, why] = q;
    const keep = Math.max(0, 1 - e * UP), stay = Math.round(N * keep), left = N - stay;
    const before = p * N, after = p * (1 + UP) * stay, up = after > before, hit = (v === 1) === up;
    q.ok = hit; if (hit) ok++;
    K('btns').innerHTML = '';
    box.querySelector('.dr-q').textContent = hit ? '予想どおり！' : '予想とちがった……';
    box.querySelector('.dr-q').className = `dr-q ${hit ? 'is-ok' : 'is-ng'}`;
    // お客さんが帰っていく（代わりがあれば、そちらへ）
    const ps = [...K('line').children];
    if (alt) { K('alt').hidden = false; K('alt').innerHTML = `<span>${alt}</span>`; }
    ps.slice(stay).forEach((el, k) => setTimeout(() => el.classList.add(alt ? 'is-go' : 'is-off'), reduce ? 0 : 80 * k));
    const mx = Math.max(before, after);
    setTimeout(() => {
      K('rev').hidden = false;
      K('rev').innerHTML = `<p class="dr-rl"><span>値上げの前</span><span class="dr-rb"><i style="--w:${(before / mx * 100).toFixed(1)}"></i></span><b>${yen(before)}</b><small>${yen(p)} × ${N} 人</small></p>
        <p class="dr-rl ${up ? 'is-up' : 'is-down'}"><span>値上げの後</span><span class="dr-rb"><i style="--w:${(after / mx * 100).toFixed(1)}"></i></span><b>${yen(after)}</b><small>${yen(p * (1 + UP))} × ${stay} 人</small></p>`;
      K('rv').hidden = false;
      K('rv').innerHTML = `<p class="dr-res"><b>${N} 人のうち ${left} 人</b>が${alt ? `「${alt}」へ` : '買うのをやめて'}。売上は<b class="${up ? 'is-up' : 'is-down'}">${up ? '増えました' : '減りました'}</b>（${up ? '+' : '−'}${Math.abs(Math.round((after / before - 1) * 100))}%）。</p><p>${why}</p>
        <button type="button" class="dr-go" data-a="next">${i + 1 < Q.length ? '次の品物' : '結果を見る'}</button>`;
      box.querySelector('.dr-sc b').textContent = ok;
      box.querySelectorAll('.dr-dots li')[i].className = hit ? 'is-ok' : 'is-ng';
    }, reduce ? 0 : 80 * left + 300);
  };
  const TITLE = [[8, '値上げ会議の名社長', '極'], [6, 'たよれる店長', '良'], [4, '見習い店長', '見'], [0, 'これからわかる', '初']];
  const finish = () => {
    const prev = best(); if (ok > prev) try { localStorage.setItem(KEY, String(ok)); } catch (e) {}
    const ti = TITLE.findIndex(x => ok >= x[0]);
    const pos = e => Math.min(95, Math.max(5, 50 + Math.log(e) / Math.log(12) * 46));
    box.innerHTML = `<div class="dr-end">
      <span class="dr-eseal" aria-hidden="true">${TITLE[ti][2]}</span>
      <p class="dr-big"><b>${ok}</b> / ${Q.length} 問</p>
      <p class="dr-title">${TITLE[ti][1]}${ok > prev && prev ? '<em>自己ベスト更新</em>' : prev && ok <= prev ? `<small>自己ベスト ${prev} 問</small>` : ''}</p>
      <div class="dr-axis"><p class="dr-al"><span>代わりがない・欠かせない<small>値上げしても減りにくい</small></span><span>代わりがある・なくても困らない<small>値上げすると減りやすい</small></span></p>
        <div class="dr-bar"><span class="dr-mid" aria-hidden="true">売上が増える ｜ 減る</span>${IT.slice().sort((a, b) => a[4] - b[4]).map((q, k) => `<span class="dr-pin ${q[4] < 1 ? 'is-up' : 'is-down'}" style="--x:${pos(q[4]).toFixed(1)};--d:${k};--row:${k % 4}"><i aria-hidden="true">${q[1]}</i><small>${q[0]}</small></span>`).join('')}</div></div>
      <div class="dr-sum"><span aria-hidden="true">弾</span><p><b>価格弾力性</b>値段が変わったとき、買う量がどれだけ変わるか。代わりがあるもの、なくても困らないものは大きく、生活に欠かせないものは小さい。お店や国が値段や税を決めるときに、大事な考え方です。<a href="glossary.html#supply-demand">需要と供給へ</a></p></div>
      <button type="button" class="dr-go" data-a="start">もう一度、別の順番で</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(box.querySelector('.dr-end'), 'danryoku', ti, TITLE.length);
  };
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-v]'); if (b) { answer(+b.dataset.v); return; }
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'start') start();
    else if (a.dataset.a === 'next') { i++; if (i < Q.length) show(); else finish(); }
  });
  intro();
})();
