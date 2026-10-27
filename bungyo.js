/* ================================================================
   bungyo.js — 経済ラボ：分業のふしぎ（比較優位）
   ・文化祭の準備。A さんは何でも速い、B さんはどちらもゆっくり。それでも分けると得をする
   ・1 時間でつくれる数（A：クッキー 10 枚 / ポスター 2 枚、B：クッキー 4 枚 / ポスター 1 枚）は「たとえ」
   ・ポスター 6 枚をそろえて、クッキーがいちばん多くなる分け方（60 枚）を見つけたら「済」
   ================================================================ */
(function() {
  const box = document.querySelector('[data-bungyo]');
  if (!box) return;
  const KEY = 'azakei_bungyo', H = 6, NEED = 6, BEST = 60;
  const P = { a: { c: 10, p: 2, name: 'A さん', tag: '何でも速い' }, b: { c: 4, p: 1, name: 'B さん', tag: 'どちらもゆっくり' } };
  const COOKIE = '<i class="bg-c"></i>', POSTER = '<i class="bg-p"></i>';
  const person = k => `
    <div class="bg-person" data-who="${k}">
      <p class="bg-name"><span class="bg-seal" aria-hidden="true">${k.toUpperCase()}</span><b>${P[k].name}</b><small>${P[k].tag}</small></p>
      <p class="bg-rate">1 時間で　クッキー <b>${P[k].c}</b> 枚　または　ポスター <b>${P[k].p}</b> 枚</p>
      <label class="bg-slide"><span>ポスターにつかう時間 <b><i data-v="${k}">0</i> / ${H} 時間</b></span><input type="range" min="0" max="${H}" step="0.5" value="0" data-k="${k}"></label>
      <div class="bg-bar" aria-hidden="true"><span class="bg-bar-p" data-bar="${k}"></span></div>
      <p class="bg-made" data-made="${k}"></p>
    </div>`;
  box.innerHTML = `
    <p class="bg-mission"><span>お題</span>文化祭までに、<b>ポスターを ${NEED} 枚</b>。残りの時間でクッキーを焼く。2 人とも ${H} 時間ずつ。<b>クッキーがいちばん多くなる分け方</b>は？</p>
    <div class="bg-people">${person('a')}${person('b')}</div>
    <div class="bg-total">
      <p><span>ポスター</span><b data-o="p"></b><small data-o="pmsg"></small></p>
      <p><span>クッキー</span><b data-o="c"></b><small data-o="cmsg"></small></p>
    </div>
    <div class="bg-icons" aria-hidden="true"><div data-o="pi"></div><div data-o="ci"></div></div>
    <div class="bg-presets"><span>ためしに：</span>
      <button type="button" data-set="3,0">A がポスター全部</button>
      <button type="button" data-set="1.5,3">半分ずつ</button>
    </div>
    <details class="bg-why"><summary>なぜ、そうなるの？（ヒント）</summary>
      <p>ポスター 1 枚をつくると、そのあいだに焼けたはずのクッキーをあきらめることになります。これが<a href="glossary.html#opportunity-cost">機会費用</a>。</p>
      <p>A さんがポスター 1 枚 ＝ クッキー <b>5 枚</b>をあきらめる。B さんがポスター 1 枚 ＝ クッキー <b>4 枚</b>をあきらめる。</p>
      <p>A さんは両方とも速いけれど、「あきらめるもの」が少ないのは B さん。だから、ポスターは B さんに、クッキーは A さんにまかせると、2 人の合計がいちばん多くなります。これを<a href="glossary.html#comparative-advantage">比較優位</a>といい、国どうしの貿易が得になる理由にもなっています。</p>
    </details>
    <p class="in-foot">※ 1 時間でつくれる数は、しくみを見るための「たとえ」です。</p>`;
  const $ = s => box.querySelector(s);
  let done = false; try { done = !!localStorage.getItem(KEY); } catch (e) {}
  const draw = () => {
    const h = { a: +$('[data-k="a"]').value, b: +$('[data-k="b"]').value };
    let tp = 0, tc = 0;
    ['a', 'b'].forEach(k => {
      const p = h[k] * P[k].p, c = (H - h[k]) * P[k].c;
      tp += p; tc += c;
      $(`[data-v="${k}"]`).textContent = h[k];
      $(`[data-bar="${k}"]`).style.width = (h[k] / H * 100) + '%';
      $(`[data-made="${k}"]`).innerHTML = `ポスター <b>${p}</b> 枚 ＋ クッキー <b>${c}</b> 枚`;
    });
    const ok = tp >= NEED;
    $('[data-o="p"]').innerHTML = `${tp}<small> / ${NEED} 枚</small>`;
    $('[data-o="p"]').className = ok ? 'is-ok' : 'is-ng';
    $('[data-o="pmsg"]').textContent = ok ? 'そろった！' : `あと ${NEED - tp} 枚`;
    $('[data-o="c"]').innerHTML = `${tc}<small> 枚</small>`;
    $('[data-o="cmsg"]').textContent = !ok ? 'まずポスターを' : tc >= BEST ? 'これが最高！' : `最高は、もっと上`;
    $('[data-o="pi"]').innerHTML = POSTER.repeat(Math.floor(tp));
    $('[data-o="ci"]').innerHTML = COOKIE.repeat(Math.floor(tc / 2));
    const win = ok && tc >= BEST;
    box.classList.toggle('is-win', win);
    if (win && !done) {
      done = true;
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      const t = document.createElement('p');
      t.className = 'bg-win'; t.setAttribute('role', 'status');
      t.innerHTML = '<span aria-hidden="true">済</span>正解！ ゆっくりの B さんにポスターを任せるのが、いちばん得。「比較優位」を見つけました。';
      $('.bg-total').after(t);
      const w = box.querySelector('.bg-why'); if (w) w.open = true;
    }
  };
  box.addEventListener('input', e => { if (e.target.matches('input[type=range]')) draw(); });
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-set]'); if (!b) return;
    const [a, bb] = b.dataset.set.split(',');
    $('[data-k="a"]').value = a; $('[data-k="b"]').value = bb; draw();
  });
  draw();
})();
