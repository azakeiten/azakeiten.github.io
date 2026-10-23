/* ================================================================
   oku.js — 経済ラボ：1 億円って、どれくらい？（一万円札を積むと、高さと重さは？）
   ・一万円札 1 枚：厚さ約 0.1mm、重さ約 1g（どちらも「約」）
   ・高さを、身近なもの・東京タワー・スカイツリー・富士山とくらべる
   ================================================================ */
(function() {
  const box = document.querySelector('[data-oku]');
  if (!box) return;
  // [金額（円）, 表示]
  const STEPS = [[1e6, '100 万円'], [1e7, '1,000 万円'], [1e8, '1 億円'], [1e9, '10 億円'], [1e10, '100 億円'], [1e11, '1,000 億円'], [1e12, '1 兆円'], [1e13, '10 兆円'], [1.1e14, '約 110 兆円（国の 1 年の予算くらい）']];
  // 高さくらべ [名前, m]
  const H = [['机', 0.7], ['小学 1 年生の背', 1.15], ['大人の背', 1.7], ['学校の 3 階', 10], ['東京タワー', 333], ['スカイツリー', 634], ['富士山', 3776], ['エベレスト', 8849], ['飛行機が飛ぶ高さ', 10000]];
  // 重さくらべ [名前, kg]
  const W = [['ランドセル', 1.2], ['お米 1 袋', 10], ['大人 1 人', 60], ['軽自動車', 900], ['アフリカゾウ', 6000], ['ジャンボジェット', 180000]];
  const fmt = (n, u) => n >= 1000 && u === 'm' ? `${(n / 1000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })} km` : n >= 1000 && u === 'kg' ? `${(n / 1000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })} トン` : `${n.toLocaleString('ja-JP', { maximumFractionDigits: n < 1 ? 2 : 1 })} ${u === 'm' ? (n < 1 ? 'cm' : 'm') : u}`;
  box.innerHTML = `
    <div class="ok-ctrl">
      <p class="ok-amount" data-o="amt"></p>
      <input type="range" min="0" max="${STEPS.length - 1}" step="1" value="2" aria-label="金額" data-o="rng">
      <p class="ok-sub">一万円札で <b data-o="bills"></b> 枚</p>
    </div>
    <div class="ok-stage">
      <div class="ok-col"><p class="ok-k">高さ</p><p class="ok-v" data-o="h"></p><p class="ok-cmp" data-o="hc"></p><div class="ok-bar"><i data-o="hb"></i><span data-o="hm"></span></div></div>
      <div class="ok-col"><p class="ok-k">重さ</p><p class="ok-v" data-o="w"></p><p class="ok-cmp" data-o="wc"></p><div class="ok-bar is-w"><i data-o="wb"></i><span data-o="wm"></span></div></div>
    </div>
    <div class="ok-stack" aria-hidden="true" data-o="stack"></div>
    <p class="ok-note" data-o="note"></p>
    <p class="ok-foot">※ 一万円札 1 枚は、厚さ約 0.1 mm・重さ約 1 g として計算。くらべるものの高さ・重さも、どれも「約」です。</p>`;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const cmp = (v, list, unit) => {
    const below = list.filter(x => x[1] <= v).pop(), above = list.find(x => x[1] > v);
    if (!below) return { text: `${above[0]}より低い`.replace('低い', unit === 'kg' ? '軽い' : '低い'), ref: above };
    const r = v / below[1];
    if (above && above[1] / v < 1.25) return { text: `${above[0]}より少し${unit === 'kg' ? '軽い' : '低い'}`, ref: above };
    return { text: r < 1.15 ? `${below[0]}くらい` : `${below[0]}の 約 ${r < 10 ? r.toFixed(1) : Math.round(r).toLocaleString('ja-JP')} 倍`, ref: below };
  };
  let last = -1;
  const draw = () => {
    const i = +$('rng').value, [yen, label] = STEPS[i];
    const bills = yen / 10000, h = bills * 0.0001, w = bills * 0.001;
    $('amt').textContent = label;
    $('bills').textContent = bills.toLocaleString('ja-JP');
    $('h').textContent = h < 1 ? `${Math.round(h * 100)} cm` : fmt(h, 'm');
    $('w').textContent = fmt(w, 'kg');
    const hc = cmp(h, H, 'm'), wc = cmp(w, W, 'kg');
    $('hc').textContent = hc.text; $('wc').textContent = wc.text;
    // バー：比べるものを 100% として、どこまで届いているか
    const hp = Math.min(100, h / hc.ref[1] * 100), wp = Math.min(100, w / wc.ref[1] * 100);
    $('hb').style.width = Math.max(3, hp) + '%'; $('wb').style.width = Math.max(3, wp) + '%';
    $('hm').textContent = hc.ref[0]; $('wm').textContent = wc.ref[0];
    // 札束の山（見た目）：段の数を金額のケタで
    const layers = Math.min(14, i + 3);
    $('stack').innerHTML = Array.from({ length: layers }, (_, k) => `<i style="--k:${k}"></i>`).join('');
    $('stack').classList.toggle('is-grow', i > last); last = i;
    $('note').innerHTML = i <= 1 ? 'まずは、つまみを右に動かしてみよう。'
      : i === 2 ? '<b>1 億円</b>は、一万円札 1 万枚。積むと<b>約 1 m</b>、重さは<b>約 10 kg</b>。お米 1 袋くらいの重さで、運ぶのは意外と大変。'
      : i === 6 ? '<b>1 兆円</b>は 1 億枚。積むと<b>約 10 km</b>で、エベレストよりも高い山に。'
      : i === STEPS.length - 1 ? '日本の国の 1 年の予算（一般会計）は、ここ数年 <b>110 兆円台</b>。積むと 1,000 km をこえて、宇宙ステーションが飛ぶ高さ（約 400 km）よりずっと高くなります。'
      : 'ケタが 1 つ上がるたびに、高さも重さも 10 倍。ニュースの「◯兆円」の大きさが、少し見えてきたかな？';
  };
  $('rng').addEventListener('input', draw);
  draw();
})();
