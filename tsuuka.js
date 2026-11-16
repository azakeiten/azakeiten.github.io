/* ================================================================
   tsuuka.js — 経済ラボ「仕組みをつくる工房 二：お祭りの券のルール」
   ・お祭りで使う遊び用の券のルールを決める：何枚用意するか／どう配るか／何軒の店で使えるか／にせもの対策
   ・→ 品物 1 つの値段（何枚）、売れた品物、買えた人、信用 がその場で変わる
   ・紹介スライドの「お金ひとつにも、決めることがある。」の続き。数字と変わり方は、すべて説明のための「たとえ」
   ================================================================ */
(function() {
  const box = document.querySelector('[data-tsuuka]');
  if (!box) return;
  const GOODS = 100, PEOPLE = 100, SHOPS = 10;
  const NAMES = ['団子', '焼きそば', '綿あめ', 'お面', 'くじ', '金魚', 'ラムネ', '風船', '射的', '本'];
  const st = { m: 1200, dist: 'all', shops: 10, guard: true };
  const PRESET = {
    few: { m: 40, dist: 'all', shops: 10, guard: true },
    many: { m: 2000, dist: 'all', shops: 10, guard: true },
    narrow: { m: 300, dist: 'all', shops: 2, guard: true },
    win: { m: 300, dist: 'win', shops: 10, guard: true },
    fake: { m: 300, dist: 'all', shops: 10, guard: false }
  };
  const fmt = n => Math.round(n).toLocaleString('ja-JP');

  box.innerHTML = `<div class="ts-grid">
      <div class="ts-ctl">
        <label class="ts-row"><span>① 用意する券の枚数 <b data-o="m"></b> 枚</span><input type="range" min="10" max="3000" step="10" data-k="m"></label>
        <p class="ts-h">② 配り方</p>
        <div class="ts-seg" role="group" aria-label="配り方"><button type="button" data-dist="all">入口で、みんなに同じ枚数</button><button type="button" data-dist="win">ゲームに勝った人にだけ</button></div>
        <label class="ts-row"><span>③ 券が使えるお店 <b data-o="shops"></b> / ${SHOPS} 軒</span><input type="range" min="1" max="${SHOPS}" step="1" data-k="shops"></label>
        <p class="ts-h">④ にせもの対策</p>
        <div class="ts-seg" role="group" aria-label="にせもの対策"><button type="button" data-guard="1">通し番号とはんこを入れる</button><button type="button" data-guard="0">何もしない</button></div>
        <p class="ts-h">ためしてみる</p>
        <div class="ts-pre"><button type="button" data-pre="few">少なすぎる</button><button type="button" data-pre="many">多すぎる</button><button type="button" data-pre="narrow">使える店が少ない</button><button type="button" data-pre="win">勝った人だけ</button><button type="button" data-pre="fake">にせものが出回る</button></div>
      </div>
      <div class="ts-out">
        <div class="ts-tag" aria-live="polite"><span class="ts-tag-k">団子 1 本の値段</span><b data-r="p"></b><small data-r="pu">枚</small></div>
        <ul class="ts-stalls" aria-label="お祭りの 10 軒のお店">${NAMES.map((n, i) => `<li style="--i:${i}"><i aria-hidden="true">${n[0]}</i><span>${n}</span></li>`).join('')}</ul>
        <div class="ts-meters">
          <p><span>売れた品物</span><i><em data-m="sold"></em></i><b data-r="sold"></b></p>
          <p><span>買えた人</span><i><em data-m="buy"></em></i><b data-r="buy"></b></p>
          <p><span>券への信用</span><i><em data-m="trust"></em></i><b data-r="trust"></b></p>
        </div>
        <p class="ts-msg" aria-live="polite"></p>
        <p class="ts-good" hidden><span aria-hidden="true">良</span>ちょうどいい仕組みです。値段がわかりやすく、品物もよく売れ、みんなが券を信じています。</p>
      </div>
    </div>
    <p class="ts-note">お祭りの品物は ${GOODS} 個、来る人は ${PEOPLE} 人とした「たとえ」です。券は会場の中だけで使う遊び用のもので、本物のお金ではありません。値段の決まり方は、お金の量と品物の量の関係を、わかりやすく単純にしたものです。</p>`;

  const render = () => {
    box.querySelectorAll('[data-k]').forEach(r => { r.value = st[r.dataset.k]; });
    box.querySelector('[data-o="m"]').textContent = fmt(st.m);
    box.querySelector('[data-o="shops"]').textContent = st.shops;
    box.querySelectorAll('[data-dist]').forEach(b => b.setAttribute('aria-pressed', b.dataset.dist === st.dist));
    box.querySelectorAll('[data-guard]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.guard === '1') === st.guard));
    // 出回る券（にせものがあると 3 割ふえる）と、券で買える品物
    const money = st.m * (st.guard ? 1 : 1.3);
    const reach = GOODS * st.shops / SHOPS;
    const holders = st.dist === 'all' ? PEOPLE : PEOPLE * .3;
    const p = money / reach;                       // 品物 1 つあたりの券
    const price = Math.max(1, Math.round(p));
    const sold = Math.min(reach, Math.floor(money / price), st.dist === 'all' ? reach : reach * .6);
    const perHead = money / holders;
    const buy = Math.min(holders, perHead >= price ? holders : Math.floor(money / price)) / PEOPLE * 100;
    const trust = st.guard ? (p > 6 ? 70 : 100) : 40;
    const soldP = sold / GOODS * 100;
    box.querySelector('[data-r="p"]').textContent = p < 1 ? '1' : fmt(price);
    box.querySelector('[data-r="pu"]').textContent = p < 1 ? '枚（券が足りない）' : '枚';
    const tag = box.querySelector('.ts-tag'); tag.classList.remove('is-flip'); void tag.offsetWidth; tag.classList.add('is-flip');
    tag.classList.toggle('is-hot', p > 6);
    box.querySelectorAll('.ts-stalls li').forEach((li, i) => li.classList.toggle('is-on', i < st.shops));
    [['sold', soldP], ['buy', buy], ['trust', trust]].forEach(([k, v]) => {
      box.querySelector(`[data-m="${k}"]`).style.width = v + '%';
      box.querySelector(`[data-r="${k}"]`).textContent = k === 'sold' ? `${fmt(sold)} 個` : `${fmt(v)}%`;
      box.querySelector(`[data-m="${k}"]`).classList.toggle('is-low', v < 50);
    });
    let m;
    if (!st.guard) m = 'にせものの券がまぎれこみ、出回る券がふえて値段が上がりました。本物かどうか疑われるので、券を受けとりたがらないお店も出てきます。お金は「みんなが信じている」から使えるのです。';
    else if (p < 1) m = `券が ${fmt(st.m)} 枚しかなく、品物 ${fmt(reach)} 個に足りません。券が回ってこない人は、ほしい物があっても買えず、品物が売れ残ります。`;
    else if (st.shops <= 4) m = `券が使えるのは ${st.shops} 軒だけ。ほかのお店の品物は券では買えないので、券で買える品物が少なくなり、団子 1 本は ${fmt(price)} 枚に上がりました。使える店に人が集まり、すぐ売り切れてしまいます。`;
    else if (p > 6) m = `券を出しすぎて、団子 1 本が ${fmt(price)} 枚に。品物の数は同じなのに券だけふえると、1 枚の値打ちが下がります（インフレ）。`;
    else if (st.dist === 'win') m = 'ゲームに勝った 3 割の人だけが券を持っています。買えるのはその人たちだけで、品物は残り、券を持たない人は見ているだけに。配り方も、仕組みの大事な一部です。';
    else m = `団子 1 本が ${fmt(price)} 枚。券の量と品物の量がつりあっています。券の枚数やお店の数を動かして、どう変わるか確かめてみてください。`;
    box.querySelector('.ts-msg').textContent = m;
    const good = st.guard && p >= 1 && p <= 4 && soldP >= 80 && buy >= 90;
    box.querySelector('.ts-good').hidden = !good;
    if (good) { try { localStorage.setItem('azakei_tsuuka', '1'); } catch (e) {} }
  };
  box.addEventListener('input', e => { const k = e.target.dataset.k; if (k) { st[k] = +e.target.value; render(); } });
  box.addEventListener('click', e => {
    const d = e.target.closest('[data-dist]'); if (d) { st.dist = d.dataset.dist; render(); return; }
    const g = e.target.closest('[data-guard]'); if (g) { st.guard = g.dataset.guard === '1'; render(); return; }
    const p = e.target.closest('[data-pre]'); if (p) { Object.assign(st, PRESET[p.dataset.pre]); render(); }
  });
  render();
})();
