/* ================================================================
   bakery.js — あそび場：麻経ベーカリー 12 か月（本格経営ゲーム。近づいてから読みこむ）
   ・4 月から 3 月まで、パン屋を 1 年経営する。むずかしさは やさしい・ふつう・むずかしい
   ・毎月決めること：パン 1 個の値段・1 日に焼く数・アルバイトの人数・広告・新メニューの開発・お金を借りる／返す
   ・毎月のできごと：オープン記念・梅雨・ライバル店・小麦の値上がり・SNS で話題・クリスマス・寒波 など
   ・1 日ずつ 30 日を計算（客数は日ごとに少しゆれる）。店の前にお客さんが来て、パンの棚がへり、売り切れ・廃棄が出る
   ・毎月の損益計算書（売上・材料費・粗利・人件費・家賃・広告・開発・利息・利益）と、評判・手元のお金
   ・お金が 0 円より少なくなったら閉店（資金ショート）。1 年後に、ミッション 3 つ・称号・グラフ
   ・数字はすべてたとえ。見た目は bakery.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-bakery]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="bakery.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'bakery.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const yen = n => (n < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString() + ' 円';
  const man = n => (n < 0 ? '−' : '') + (Math.round(Math.abs(n) / 1000) / 10).toLocaleString() + ' 万円';
  const MONTHS = ['4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月', '1 月', '2 月', '3 月'];
  // 季節ごとの「来たい人」の数（値段 250 円・評判 50・広告なしのとき。1 日あたり。たとえ）
  const BASE = [180, 175, 165, 160, 150, 170, 180, 178, 190, 170, 160, 172];
  const LEVEL = {
    easy: { name: 'やさしい', cash: 600000, rent: 220000, wheat: 118, rival: 1, cold: .9, target: 2500000 },
    normal: { name: 'ふつう', cash: 400000, rent: 250000, wheat: 125, rival: .9, cold: .86, target: 2000000 },
    hard: { name: 'むずかしい', cash: 250000, rent: 310000, wheat: 132, rival: .82, cold: .8, target: 1200000 }
  };
  const AD = [['なし', 0, 1], ['チラシ', 20000, 1.1], ['SNS 広告', 60000, 1.25]];
  const WAGE = 150000, CAP = 110, DEV = 150000, LOAN_STEP = 200000, LOAN_MAX = 600000;
  // 毎月のできごと（その月に起きること・そのあとも続くこと）
  const EVENT = (m, st, lv) => {
    const L = LEVEL[lv];
    switch (m) {
      case 0: return { t: 'オープン記念', d: '開店したてで、町の人が見に来てくれる。お客さん +25%', mult: 1.25 };
      case 1: return { t: '大型連休', d: 'お出かけの人が多い。お客さん +10%', mult: 1.1 };
      case 2: return { t: '梅雨', d: '雨の日が多く、出かける人がへる。お客さん −15%', mult: .85 };
      case 3: if (L.rival < 1) { st.rival = st.rep >= 70 ? Math.min(1, L.rival + .08) : L.rival; return { t: 'ライバル店が開店', d: `近くに新しいパン屋ができた。このあとずっと、お客さん ${Math.round((1 - st.rival) * 100)}% へる（評判が高いと、へりにくい）`, mult: 1 }; }
        return { t: '夏祭り', d: '町の夏祭り。お客さん +15%', mult: 1.15 };
      case 4: return { t: '猛暑', d: '暑くて、パンが売れにくい。お客さん −10%', mult: .9 };
      case 5: st.cost = L.wheat; return { t: '小麦の値上がり', d: `材料の小麦が高くなった。このあとずっと、パン 1 個の材料費が 110 円 → ${L.wheat} 円`, mult: 1 };
      case 6: { const hot = st.rep >= 60; if (hot) st.rep = Math.min(100, st.rep + 6); return { t: 'SNS で話題に', d: hot ? '評判がよかったので、写真が広まった！ お客さん +35%' : '少しだけ話題に。評判が高ければ、もっと広まったかも。お客さん +10%', mult: hot ? 1.35 : 1.1 }; }
      case 8: return { t: 'クリスマス', d: 'ケーキやシュトーレンが人気。お客さん +30%', mult: 1.3 };
      case 10: return { t: '寒波', d: `寒くて出かける人がへる。お客さん −${Math.round((1 - L.cold) * 100)}%`, mult: L.cold };
      case 11: return { t: '卒業シーズン', d: 'お祝いの買い物。お客さん +10%', mult: 1.1 };
      default: return { t: 'いつもの月', d: 'とくに大きなできごとはなし。', mult: 1 };
    }
  };
  let lv = 'normal', st, dec, busy = false, seed = 1;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const reset = () => {
    st = { m: 0, cash: LEVEL[lv].cash, rep: 50, loan: 0, menus: 0, pend: 0, cost: 110, rival: 1, hist: [], profitSum: 0, baked: 0, wasted: 0, over: false };
    dec = { price: 250, bake: 180, staff: 2, ad: 0, dev: false };
    seed = 7 + Math.floor(Math.random() * 1000);
  };
  reset();

  box.innerHTML = `
    <div class="bk-start" data-k="start">
      <p class="bk-st-h"><span aria-hidden="true">麦</span>麻経ベーカリー 12 か月</p>
      <p class="bk-st-p">4 月に、町に小さなパン屋を開きます。値段・焼く数・人・広告・新メニュー・借り入れを毎月決めて、1 年間お店を守りぬこう。お金が足りなくなったら、閉店です。</p>
      <div class="bk-lv" role="radiogroup" aria-label="むずかしさ">${Object.entries(LEVEL).map(([k, L]) => `<button type="button" role="radio" data-lv="${k}" aria-checked="${k === lv}"><b>${L.name}</b><small>はじめのお金 ${man(L.cash)}・家賃 ${man(L.rent)}</small></button>`).join('')}</div>
      <ul class="bk-mis" data-k="mis"></ul>
      <button type="button" class="bk-open" data-a="open">お店を開く</button>
    </div>
    <div class="bk-game" data-k="game" hidden>
      <div class="bk-head">
        <ol class="bk-cal" data-k="cal">${MONTHS.map((m, i) => `<li data-m="${i}"><b>${m}</b><i></i></li>`).join('')}</ol>
        <div class="bk-kpi"><p><small>手元のお金</small><b data-k="cash"></b></p><p><small>借りているお金</small><b data-k="loan"></b></p><p><small>評判</small><b data-k="rep"></b><span class="bk-repbar"><i data-k="repbar"></i></span></p><p><small>1 年の利益（いままで）</small><b data-k="psum"></b></p></div>
      </div>
      <div class="bk-main">
        <div class="bk-shop">
          <svg class="bk-svg" viewBox="0 0 520 300" role="img" aria-label="パン屋さんの店先">
            <rect width="520" height="300" fill="#cfe3ee"/><rect y="236" width="520" height="64" fill="#c9b48a"/><rect y="232" width="520" height="6" fill="#a8916a"/>
            <rect x="120" y="70" width="280" height="166" fill="#fff6e4" stroke="#6b4a22" stroke-width="3"/>
            <g>${Array.from({ length: 8 }, (_, i) => `<path d="M${112 + i * 37} 60 h37 v24 a18.5 10 0 0 1 -37 0 Z" fill="${i % 2 ? '#fffaf0' : '#b5432f'}" stroke="#6b4a22" stroke-width="1.5"/>`).join('')}</g>
            <rect x="160" y="30" width="200" height="28" rx="6" fill="#2a2015"/><text x="260" y="50" text-anchor="middle" class="bk-sign">麻経ベーカリー</text>
            <rect x="140" y="104" width="150" height="110" rx="4" fill="#fdecc8" stroke="#6b4a22" stroke-width="2"/>
            <g data-k="shelf"></g>
            <rect x="314" y="118" width="62" height="118" rx="3" fill="#8a5a2b" stroke="#6b4a22" stroke-width="2"/><circle cx="364" cy="180" r="3" fill="#e3b341"/>
            <g data-k="soldout" class="bk-soldout" opacity="0"><rect x="160" y="140" width="110" height="34" rx="6" fill="#b5432f" transform="rotate(-8 215 157)"/><text x="215" y="163" text-anchor="middle" transform="rotate(-8 215 157)" class="bk-so-t">本日売り切れ</text></g>
            <g transform="translate(424 196)"><rect x="0" y="0" width="34" height="40" rx="4" fill="#5a6470"/><rect x="-3" y="-6" width="40" height="8" rx="3" fill="#3d4650"/><text x="17" y="26" text-anchor="middle" class="bk-bin" data-k="bin">0</text></g>
            <g data-k="crowd"></g>
          </svg>
          <div class="bk-day"><p><small>日</small><b data-k="day">—</b></p><p><small>来た人</small><b data-k="came">—</b></p><p><small>売れた</small><b data-k="sold">—</b></p><p class="is-lost"><small>売り切れで帰った</small><b data-k="lost">—</b></p><p class="is-waste"><small>売れ残り（廃棄）</small><b data-k="waste">—</b></p></div>
          <div class="bk-news" data-k="news"></div>
        </div>
        <div class="bk-panel">
          <p class="bk-ph" data-k="ph">4 月の計画</p>
          <label class="bk-sl"><span>パン 1 個の値段</span><output data-k="o-price"></output><input type="range" min="150" max="400" step="10" data-d="price"></label>
          <label class="bk-sl"><span>1 日に焼く数</span><output data-k="o-bake"></output><input type="range" min="60" max="400" step="10" data-d="bake"></label>
          <label class="bk-sl"><span>アルバイト（1 人 1 日 ${CAP} 人まで売れる・月 ${man(WAGE)}）</span><output data-k="o-staff"></output><input type="range" min="1" max="4" step="1" data-d="staff"></label>
          <div class="bk-ad" role="radiogroup" aria-label="広告">${AD.map(([n, c], i) => `<button type="button" role="radio" data-ad="${i}"><b>${n}</b><small>${c ? man(c) : '0 円'}</small></button>`).join('')}</div>
          <label class="bk-chk"><input type="checkbox" data-d="dev"><span></span><b>新メニューを開発する（${man(DEV)}）</b><small>来月から、お客さんが 12% ふえる（2 回まで）</small></label>
          <div class="bk-loan"><span>お金を借りる（月 1% の利息）</span><button type="button" data-a="borrow">${man(LOAN_STEP)} 借りる</button><button type="button" data-a="repay">${man(LOAN_STEP)} 返す</button></div>
          <p class="bk-cost" data-k="cost"></p>
          <button type="button" class="bk-go" data-a="go">この月を営業する</button>
        </div>
      </div>
      <div class="bk-pl" data-k="pl" hidden></div>
      <div class="bk-end" data-k="end" hidden></div>
    </div>
    <div class="bk-learn">
      <p><b>損益計算書</b>1 か月の売上から、材料費（売上原価）を引いたのが粗利。そこから人件費・家賃・広告などを引くと、利益が残ります（<a href="glossary.html#pl">損益計算書</a>・<a href="glossary.html#gross-profit">粗利</a>）。</p>
      <p><b>固定費と変動費</b>家賃やアルバイト代は、売れても売れなくてもかかる固定費。材料費は、焼いた数だけかかる変動費。焼きすぎると、売れ残りの分も材料費がかかります（<a href="glossary.html#fixed-variable">固定費と変動費</a>）。</p>
      <p><b>値段とお客さん</b>値段を上げると 1 個のもうけはふえますが、買う人はへります。どれくらいへるかを「価格弾力性」といいます（<a href="glossary.html#price-elasticity">価格弾力性</a>）。</p>
      <p><b>借りる・評判・つぶれる</b>お金を借りると、すぐ使えるかわりに利息がかかります（<a href="glossary.html#loan-lending">融資</a>）。売り切れが多いと評判が下がり（<a href="glossary.html#brand">ブランド</a>）、手元のお金がなくなると、もうけが出ていても店を続けられません（<a href="glossary.html#bankruptcy">倒産</a>）。</p>
    </div>
    <p class="bk-note">お店・値段・お客さんの数・できごと・費用は、しくみを知るための「たとえ」です。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const missions = () => [['利', `1 年の利益合計 ${man(LEVEL[lv].target)} 以上`, st.profitSum >= LEVEL[lv].target], ['評', '評判 75 以上で 1 年を終える', st.rep >= 75], ['廃', '売れ残り（廃棄）を、焼いた数の 10% 以下に', st.baked > 0 && st.wasted / st.baked <= .1]];
  const showMis = () => { K('mis').innerHTML = missions().map(([s, t]) => `<li><span aria-hidden="true">${s}</span>${t}</li>`).join(''); };
  const fixedCost = () => LEVEL[lv].rent + dec.staff * WAGE + AD[dec.ad][1] + (dec.dev ? DEV : 0) + Math.round(st.loan * .01);
  const paintDec = () => {
    box.querySelectorAll('[data-d]').forEach(i => { if (i.type === 'checkbox') i.checked = dec.dev; else i.value = dec[i.dataset.d]; });
    K('o-price').textContent = yen(dec.price); K('o-bake').textContent = dec.bake + ' 個'; K('o-staff').textContent = dec.staff + ' 人';
    box.querySelectorAll('[data-ad]').forEach(b => b.setAttribute('aria-checked', +b.dataset.ad === dec.ad));
    const devOk = st.menus + st.pend < 2; const dv = box.querySelector('[data-d="dev"]'); dv.disabled = !devOk; if (!devOk) dec.dev = false;
    K('cost').innerHTML = `この月にかならずかかるお金 <b>${man(fixedCost())}</b>（家賃・アルバイト代・広告・開発・利息）＋ 材料費 <b>${man(dec.bake * st.cost * 30)}</b>（パン 1 個 ${st.cost} 円 × 焼く数 × 30 日）`;
  };
  const paintHead = () => {
    K('cash').textContent = yen(st.cash); K('cash').classList.toggle('is-bad', st.cash < 100000);
    K('loan').textContent = yen(st.loan); K('rep').textContent = Math.round(st.rep); K('repbar').style.width = st.rep + '%';
    K('psum').textContent = man(st.profitSum);
    box.querySelectorAll('.bk-cal li').forEach((li, i) => { const h = st.hist[i]; li.classList.toggle('is-now', i === st.m && !st.over); li.classList.toggle('is-plus', !!h && h.profit >= 0); li.classList.toggle('is-minus', !!h && h.profit < 0); li.querySelector('i').style.height = h ? Math.min(100, Math.abs(h.profit) / 4000) + '%' : '0'; });
    K('ph').textContent = st.over ? '営業おわり' : `${MONTHS[st.m]}の計画`;
    box.querySelector('[data-a="repay"]').disabled = st.loan <= 0 || st.cash < LOAN_STEP; box.querySelector('[data-a="borrow"]').disabled = st.loan >= LOAN_MAX;
  };
  const shelf = left => { const n = Math.max(0, Math.min(24, Math.round(left / Math.max(1, dec.bake) * 24))); K('shelf').innerHTML = Array.from({ length: n }, (_, i) => `<ellipse cx="${156 + (i % 8) * 17}" cy="${126 + Math.floor(i / 8) * 30}" rx="7.5" ry="5.5" class="bk-bread"/>`).join(''); };
  const crowd = (n, lost) => { K('crowd').innerHTML = Array.from({ length: Math.min(12, n) }, (_, i) => `<g class="bk-cust${i < lost ? ' is-lost' : ''}" style="--d:${(i * .09).toFixed(2)}s;--h:${(i * 47) % 360}"><circle cx="0" cy="-26" r="6" fill="#f3d6b5"/><rect x="-6" y="-20" width="12" height="18" rx="5" fill="hsl(var(--h) 45% 50%)"/></g>`).join(''); };
  const run = async () => {
    if (busy || st.over) return; busy = true; box.classList.add('is-busy');
    const L = LEVEL[lv], m = st.m;
    const ev = EVENT(m, st, lv);
    K('news').innerHTML = `<span class="bk-nw-h">${MONTHS[m]}のニュース</span><b>${ev.t}</b>${ev.d}`; K('news').classList.remove('is-in'); void K('news').offsetWidth; K('news').classList.add('is-in');
    // 先月開発した新メニューが、今月から店に並ぶ
    if (st.pend) { st.menus += st.pend; st.rep = Math.min(100, st.rep + 5 * st.pend); st.pend = 0; }
    const want = BASE[m] * ev.mult * Math.sqrt(st.rep / 50) * AD[dec.ad][2] * (1 + .12 * st.menus) * Math.pow(250 / dec.price, 1.5) * st.rival;
    const cap = dec.staff * CAP;
    let came = 0, sold = 0, lost = 0, waste = 0;
    K('pl').hidden = true;
    for (let d = 1; d <= 30; d++) {
      const D = Math.round(want * (.88 + rnd() * .24)), s = Math.min(D, dec.bake, cap), l = D - s, w = dec.bake - s;
      came += D; sold += s; lost += l; waste += w;
      K('day').textContent = d; K('came').textContent = came.toLocaleString(); K('sold').textContent = sold.toLocaleString(); K('lost').textContent = lost.toLocaleString(); K('waste').textContent = waste.toLocaleString(); K('bin').textContent = waste > 999 ? '999+' : waste;
      if (d % 6 === 1 || d === 30) { crowd(Math.round(D / 18), Math.round(l / 18)); }
      shelf(dec.bake - s); K('soldout').setAttribute('opacity', s >= dec.bake ? 1 : 0);
      await sleep(d < 4 ? 260 : 55);
    }
    // お金の計算
    const sales = sold * dec.price, material = dec.bake * 30 * st.cost, gross = sales - material;
    const wage = dec.staff * WAGE, rent = L.rent, ad = AD[dec.ad][1], dev = dec.dev ? DEV : 0, interest = Math.round(st.loan * .01);
    const profit = gross - wage - rent - ad - dev - interest;
    st.cash += profit; st.profitSum += profit; st.baked += dec.bake * 30; st.wasted += waste;
    // 評判
    const lostRate = came ? lost / came : 0; let dr = lostRate > .12 ? -Math.round(lostRate * 30) : 2;
    if (dec.price > 320) dr -= 4; if (dec.price <= 200) dr += 1;
    st.rep = Math.max(0, Math.min(100, st.rep + dr));
    st.hist.push({ m, sales, material, gross, wage, rent, ad, dev, interest, profit, cash: st.cash, rep: st.rep, came, sold, lost, waste, dev: !!dec.dev, ev: ev.t });
    if (dec.dev) st.pend++;
    dec.dev = false;
    const pl = K('pl');
    const row = (n, v, c = '') => `<li class="${c}"><span>${n}</span><b>${yen(v)}</b></li>`;
    pl.innerHTML = `<p class="bk-pl-h">${MONTHS[m]}の損益計算書<small>売れた ${sold.toLocaleString()} 個・売り切れで帰った ${lost.toLocaleString()} 人・廃棄 ${waste.toLocaleString()} 個</small></p>
      <ul class="bk-pl-l">${row('売上高', sales, 'is-top')}${row('売上原価（材料費）', -material)}${row('粗利', gross, 'is-sub')}${row('人件費（アルバイト）', -wage)}${row('家賃', -rent)}${ad ? row('広告費', -ad) : ''}${dev ? row('新メニュー開発費', -dev) : ''}${interest ? row('支払利息', -interest) : ''}${row('この月の利益', profit, profit >= 0 ? 'is-plus' : 'is-minus')}</ul>
      <p class="bk-pl-tip">${lostRate > .12 ? '売り切れで帰ったお客さんが多く、評判が下がりました。焼く数かアルバイトをふやしてみよう。' : waste > dec.bake * 30 * .15 ? '売れ残りが多めです。焼く数を少しへらすと、材料費がへります。' : profit < 0 ? '赤字です。値段・焼く数・人数のバランスを見直そう。' : 'いい調子！ この調子で次の月へ。'}</p>`;
    pl.hidden = false; pl.classList.remove('is-in'); void pl.offsetWidth; pl.classList.add('is-in');
    st.m++;
    if (st.cash < 0) { st.over = 'short'; }
    else if (st.m >= 12) { st.over = 'done'; }
    paintHead(); paintDec();
    if (st.over) finish();
    busy = false; box.classList.remove('is-busy');
  };
  const finish = () => {
    const L = LEVEL[lv], net = st.cash - st.loan, gain = net - L.cash, ms = missions();
    const ok = ms.filter(x => x[2]).length;
    const title = st.over === 'short' ? ['閉', '閉店（資金ショート）'] : gain >= 3000000 ? ['名', '町いちばんの名店'] : gain >= 1800000 ? ['人', '行列のできる人気店'] : gain >= 800000 ? ['町', '町に愛されるパン屋'] : gain > 0 ? ['続', 'なんとか 1 年つづいた店'] : ['赤', '赤字の 1 年'];
    // グラフ：月ごとの利益（棒）と手元のお金（線）
    const H = st.hist, mx = Math.max(200000, ...H.map(h => Math.abs(h.profit))), cmx = Math.max(L.cash, ...H.map(h => Math.abs(h.cash)));
    const X = i => 40 + i * 38, Y0 = 110, yb = v => Y0 - v / mx * 80, yc = v => 200 - v / cmx * 70;
    const svg = `<svg viewBox="0 0 500 220" class="bk-chart" role="img" aria-label="月ごとの利益と手元のお金"><line x1="30" x2="490" y1="${Y0}" y2="${Y0}" class="bk-ax"/>${H.map((h, i) => `<rect x="${X(i) - 12}" y="${Math.min(Y0, yb(h.profit))}" width="24" height="${Math.abs(yb(h.profit) - Y0)}" class="${h.profit >= 0 ? 'is-plus' : 'is-minus'}" rx="3"/><text x="${X(i)}" y="128" class="bk-ct">${MONTHS[h.m].replace(' ', '')}</text>`).join('')}<polyline class="bk-cash" points="${H.map((h, i) => `${X(i)},${yc(h.cash)}`).join(' ')}"/><text x="30" y="16" class="bk-ct is-l">月の利益（棒）</text><text x="30" y="146" class="bk-ct is-l">手元のお金（線）</text></svg>`;
    const e = K('end');
    e.innerHTML = `<div class="bk-e-top"><span class="bk-e-seal" aria-hidden="true">${title[0]}</span><div><p class="bk-e-t">${title[1]}</p><p class="bk-e-s">${LEVEL[lv].name}・${H.length} か月・はじめのお金 ${man(L.cash)} → 手元 ${man(st.cash)}（借金 ${man(st.loan)}）</p></div></div>
      ${st.over === 'short' ? '<p class="bk-e-warn">手元のお金が 0 円より少なくなり、仕入れや給料が払えなくなりました。利益が出ている月があっても、お金が足りなくなると店は続けられません（資金ショート）。</p>' : ''}
      <ul class="bk-e-mis">${ms.map(([s, t, ok]) => `<li class="${ok ? 'is-ok' : ''}"><span aria-hidden="true">${ok ? '達' : s}</span>${t}</li>`).join('')}</ul>
      ${svg}
      <div class="bk-e-btns"><button type="button" data-a="again">もう一度（同じむずかしさ）</button><button type="button" data-a="menu">むずかしさを変える</button></div>`;
    e.hidden = false;
    if (window.AZAKEI_TALK) { window.AZAKEI_TALK(e, 'bakery', st.over === 'short' ? 'low' : gain >= 1800000 ? 'top' : 'mid'); const lt = e.querySelector('.lt'), bt = e.querySelector('.bk-e-btns'); if (lt && bt) bt.before(lt); }
    try { const k = 'azakei_bakery_' + lv, b = +localStorage.getItem(k) || -1e9; if (gain > b && st.over === 'done') localStorage.setItem(k, String(gain)); localStorage.setItem('azakei_bakery', String(Math.max(ok, +localStorage.getItem('azakei_bakery') || 0))); } catch (er) {}
  };
  const start = () => { reset(); K('start').hidden = true; K('game').hidden = false; K('end').hidden = true; K('pl').hidden = true; K('news').innerHTML = '<span class="bk-nw-h">ようこそ</span><b>開店準備ができました</b>値段と焼く数を決めて、4 月の営業をはじめよう。'; crowd(0, 0); shelf(dec.bake); paintHead(); paintDec(); };
  box.addEventListener('click', e => {
    const l = e.target.closest('[data-lv]'); if (l) { lv = l.dataset.lv; box.querySelectorAll('[data-lv]').forEach(b => b.setAttribute('aria-checked', b === l)); reset(); showMis(); return; }
    if (e.target.closest('[data-a="open"]')) { start(); return; }
    if (busy) return;
    const a = e.target.closest('[data-ad]'); if (a) { dec.ad = +a.dataset.ad; paintDec(); return; }
    if (e.target.closest('[data-a="borrow"]')) { if (st.loan < LOAN_MAX) { st.loan += LOAN_STEP; st.cash += LOAN_STEP; paintHead(); paintDec(); } return; }
    if (e.target.closest('[data-a="repay"]')) { if (st.loan > 0 && st.cash >= LOAN_STEP) { st.loan -= LOAN_STEP; st.cash -= LOAN_STEP; paintHead(); paintDec(); } return; }
    if (e.target.closest('[data-a="go"]')) { run(); return; }
    if (e.target.closest('[data-a="again"]')) { start(); return; }
    if (e.target.closest('[data-a="menu"]')) { K('game').hidden = true; K('start').hidden = false; reset(); showMis(); }
  });
  box.addEventListener('input', e => { const i = e.target.closest('[data-d]'); if (!i || busy) return; if (i.type === 'checkbox') dec.dev = i.checked; else dec[i.dataset.d] = +i.value; paintDec(); });
  box.addEventListener('change', e => { const i = e.target.closest('[data-d="dev"]'); if (i) { dec.dev = i.checked; paintDec(); } });
  showMis();
})();
