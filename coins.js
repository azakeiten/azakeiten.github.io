/* ================================================================
   coins.js — あそび場：世界のお金図鑑「両替しながら世界一周」（近づいてから読みこむ）
   ・日本から 6 つの国・地域をめぐる。着いた空港で「この国のお金は？」（4 択）→ 正解でコインが図鑑に入る
   ・お土産の値段（その国のお金）を見て、日本円でだいたいいくらかを 12 秒で 3 つからえらぶ
   ・最後に、円高・円安のクイズ。パスポートに国ごとのスタンプがたまる
   ・交換の割合は、計算しやすいように丸めた「たとえ」（実際の値は毎日変わる）
   ・記録はこのブラウザの中だけ（図鑑 azakei_coins・旅の自己ベスト azakei_coins_trip）。見た目は coins.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-coins]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="coins.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'coins.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const KEY = 'azakei_coins', BK = 'azakei_coins_trip', ET = 12;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  // [記号, 通貨, 国・地域, ひとこと, 経度, 緯度, 1 単位あたりの円（たとえ）, レートの見せ方, お土産, 値段]
  const C = [
    ['$', '米ドル', 'アメリカ', '世界の貿易や外国為替で、いちばん多く使われているお金。', -98, 39, 150, '1 ドル ≒ 150 円', 'Tシャツ', 20, 'ドル'],
    ['€', 'ユーロ', 'ドイツ・フランスなど', 'EU（ヨーロッパ連合）の多くの国で使われている共通のお金。', 6, 49, 160, '1 ユーロ ≒ 160 円', '板チョコ', 8, 'ユーロ'],
    ['£', 'ポンド', 'イギリス', '今も使われているお金の中では、とても長い歴史をもつお金。', -2, 54, 190, '1 ポンド ≒ 190 円', '紅茶の缶', 12, 'ポンド'],
    ['元', '人民元', '中国', 'お札には、毛沢東の肖像が描かれている。', 108, 34, 20, '1 元 ≒ 20 円', 'パンダのぬいぐるみ', 120, '元'],
    ['₩', 'ウォン', '韓国', 'ケタが大きく、いちばん小さいお札が 1,000 ウォン札。', 128, 36, 0.11, '100 ウォン ≒ 11 円', '味つけのり', 15000, 'ウォン'],
    ['₹', 'ルピー', 'インド', '記号 ₹ は、2010 年に公募で決まった比較的新しい記号。', 79, 22, 1.8, '1 ルピー ≒ 1.8 円', 'スパイスのセット', 900, 'ルピー'],
    ['฿', 'バーツ', 'タイ', 'お札には、タイの国王の肖像が描かれている。', 101, 14, 4, '1 バーツ ≒ 4 円', 'ゾウの置き物', 350, 'バーツ'],
    ['A$', 'オーストラリア・ドル', 'オーストラリア', 'お札はプラスチック（ポリマー）製で、水にぬれても破れにくい。', 134, -25, 100, '1 オーストラリア・ドル ≒ 100 円', 'コアラのキーホルダー', 15, 'オーストラリア・ドル'],
    ['Fr', 'スイス・フラン', 'スイス', 'スイスは EU に入っておらず、ユーロではなく自分の国のお金を使う。', 9, 45, 170, '1 フラン ≒ 170 円', '腕時計', 150, 'フラン'],
    ['R$', 'レアル', 'ブラジル', '南アメリカでいちばん人口の多い国のお金。', -50, -12, 28, '1 レアル ≒ 28 円', 'サッカーボール', 120, 'レアル'],
    ['₫', 'ドン', 'ベトナム', 'ケタがとても大きく、10 万ドン札や 50 万ドン札もある。', 106, 17, 0.006, '1,000 ドン ≒ 6 円', 'コーヒー豆', 250000, 'ドン'],
    ['¥', '円', '日本', 'お札は日本銀行、硬貨は国（政府）が発行している。', 139, 36, 1, '', '', 0, '円']
  ];
  const JP = 11, STOPS = 6;
  const LBL = { 1: [-4, -7, "end"], 8: [0, 13, "middle"], 4: [-7, -5, "end"], 11: [7, 3, "start"], 10: [0, 13, "middle"], 6: [-7, 3, "end"], 3: [0, -8, "middle"] };
  let got = []; try { got = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) {}
  let best = 0; try { best = +localStorage.getItem(BK) || 0; } catch (e) {}
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const yen = n => Math.round(n).toLocaleString('ja-JP') + ' 円';
  const round = n => n >= 10000 ? Math.round(n / 500) * 500 : n >= 1000 ? Math.round(n / 10) * 10 : Math.round(n);
  const X = i => (C[i][4] + 180) / 360 * 360, Y = i => (90 - C[i][5]) / 180 * 170 + 5;
  let T = null;

  box.innerHTML = `<div class="ct-top"><svg class="ct-map" viewBox="0 0 360 180" role="img" aria-label="旅の地図（経度と緯度の目もり）"></svg><div class="ct-pass"><p class="ct-ph">パスポート<small data-sc></small></p><ol class="ct-stamps"></ol></div></div>
    <div class="ct-play" aria-live="polite"></div>
    <div class="ct-book"><p class="ct-bh">コイン図鑑<small data-n></small></p><ul class="ct-grid"></ul></div>
    <p class="ct-note">交換の割合は、計算しやすいように丸めた「たとえ」です。実際の割合は毎日変わります。</p>`;
  const map = box.querySelector('.ct-map'), play = box.querySelector('.ct-play'), grid = box.querySelector('.ct-grid');

  const drawMap = (from, to) => {
    let s = '';
    for (let lo = 0; lo <= 360; lo += 30) s += `<line class="ct-g" x1="${lo}" x2="${lo}" y1="5" y2="175"/>`;
    for (let la = 5; la <= 175; la += 170 / 6) s += `<line class="ct-g" x1="0" x2="360" y1="${la.toFixed(1)}" y2="${la.toFixed(1)}"/>`;
    s += `<line class="ct-eq" x1="0" x2="360" y1="90" y2="90"/>`;
    const route = T ? [JP].concat(T.route) : [JP];
    C.forEach((c, i) => { const on = route.includes(i), done = T && T.done.includes(i); s += `<circle class="ct-dot${on ? ' is-route' : ''}${done ? ' is-done' : ''}${i === JP ? ' is-home' : ''}" cx="${X(i).toFixed(1)}" cy="${Y(i).toFixed(1)}" r="${on ? 4.5 : 2.5}"/>`; if (done || i === JP) { const o = LBL[i] || [0, -8, "middle"]; s += `<text class="ct-lb" x="${(X(i) + o[0]).toFixed(1)}" y="${(Y(i) + o[1]).toFixed(1)}" text-anchor="${o[2]}">${i === JP ? '日本' : c[2].split('・')[0]}</text>`; } });
    if (from != null && to != null) {
      const x1 = X(from), y1 = Y(from), x2 = X(to), y2 = Y(to), mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 30;
      s += `<path class="ct-arc" d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}"/><g class="ct-plane"><path d="M-7 0 L6 0 M0 -5 L2 0 L0 5 M-6 -2 L-5 0 L-6 2" /></g>`;
    }
    map.innerHTML = s;
    if (from != null && to != null && !reduce) {
      const p = map.querySelector('.ct-arc'), pl = map.querySelector('.ct-plane'), L = p.getTotalLength(); const t0 = performance.now();
      const f = now => { const k = Math.min(1, (now - t0) / 1100), a = p.getPointAtLength(L * k), b = p.getPointAtLength(Math.min(L, L * k + 1)); pl.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI})`); if (k < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    }
  };
  const drawPass = () => {
    box.querySelector('.ct-stamps').innerHTML = Array.from({ length: STOPS }, (_, k) => { const i = T && T.done[k]; return i != null ? `<li class="is-on" style="--r:${(k % 2 ? 6 : -7) + k}deg"><b>${C[i][0]}</b><small>${C[i][2].split('・')[0]}</small></li>` : '<li></li>'; }).join('');
    box.querySelector('[data-sc]').textContent = T ? `${T.score} 点` : (best ? `自己ベスト ${best} 点` : '');
  };
  const drawBook = fresh => {
    grid.innerHTML = C.map(([s, name, land], i) => { const has = got.includes(i); return `<li class="${has ? 'is-got' : ''}${fresh === i ? ' is-new' : ''}"><span class="ct-coin" aria-hidden="true">${has ? s : '?'}</span><b>${has ? name : '？？？'}</b><small>${has ? land : 'まだ'}</small></li>`; }).join('');
    box.querySelector('[data-n]').textContent = `${got.length} / ${C.length}`;
  };
  const addCoin = i => { if (got.includes(i)) return null; got.push(i); try { localStorage.setItem(KEY, JSON.stringify(got)); } catch (e) {} if (window.AZAKEI_CHECK_BADGES) setTimeout(AZAKEI_CHECK_BADGES, 500); return i; };

  const intro = () => {
    T = null; drawMap(); drawPass();
    play.innerHTML = `<div class="ct-card ct-intro"><p class="ct-k">両替しながら世界一周</p><p class="ct-t">6 つの国・地域をめぐる旅に出よう</p>
      <ol class="ct-rules"><li>空港に着いたら「この国のお金は？」。正解するとコインが図鑑に入る。</li><li>お土産の値札を見て、日本円でだいたいいくらかを ${ET} 秒で見積もる。</li><li>帰りの空港で、円高・円安のクイズ。</li></ol>
      <button type="button" class="ct-go" data-go="start">出発する</button></div>`;
  };
  const start = () => {
    const pool = C.map((_, i) => i).filter(i => i !== JP);
    const route = shuffle(pool.filter(i => !got.includes(i))).concat(shuffle(pool.filter(i => got.includes(i)))).slice(0, STOPS);
    T = { route, done: [], k: 0, score: 0, cur: 0, est: 0 };
    fly();
  };
  const fly = async () => {
    const from = T.k ? T.route[T.k - 1] : JP, to = T.route[T.k];
    play.innerHTML = `<div class="ct-card ct-fly"><p class="ct-k">${T.k + 1} / ${STOPS} か国目</p><p class="ct-t">飛行中……</p><p class="ct-hint">${C[to][5] < 0 ? '赤道をこえて、南半球' : '北半球'}のどこかへ向かっています</p></div>`;
    drawMap(from, to); drawPass();
    await sleep(1300);
    askCur(to);
  };
  const askCur = i => {
    const opts = shuffle([i].concat(shuffle(C.map((_, k) => k).filter(k => k !== i && k !== JP)).slice(0, 3)));
    play.innerHTML = `<div class="ct-card"><p class="ct-k">空港に着いた</p><p class="ct-t"><span class="ct-land">${C[i][2]}</span>のお金は？</p>
      <div class="ct-opts">${opts.map(k => `<button type="button" data-cur="${k}"><span class="ct-coin is-sm" aria-hidden="true">${C[k][0]}</span>${C[k][1]}</button>`).join('')}</div><div class="ct-fb"></div></div>`;
    T.ans = i;
  };
  const pickCur = k => {
    const i = T.ans, bs = [...play.querySelectorAll('[data-cur]')]; if (bs[0].disabled) return;
    const ok = k === i; bs.forEach(b => { b.disabled = true; if (+b.dataset.cur === i) b.classList.add('is-ok'); else if (+b.dataset.cur === k) b.classList.add('is-ng'); });
    let fresh = null; if (ok) { T.score += 100; T.cur++; fresh = addCoin(i); }
    drawBook(fresh); drawPass();
    play.querySelector('.ct-fb').innerHTML = `<p class="${ok ? 'is-ok' : 'is-ng'}">${ok ? (fresh != null ? '正解！ 図鑑に新しいコインが入った。+100 点' : '正解！ +100 点') : `ざんねん。${C[i][2]}のお金は「${C[i][1]}」。`}</p><p>${C[i][3]}</p><button type="button" class="ct-go" data-go="shop">お土産屋さんへ</button>`;
  };
  const shop = () => {
    const i = T.ans, c = C[i], right = round(c[9] * c[6]);
    const cand = [right, round(right * 10), round(right / 10), round(c[9])].filter((v, k, a) => v > 0 && a.indexOf(v) === k && (k === 0 || v !== right));
    const opts = shuffle(cand.slice(0, 3));
    play.innerHTML = `<div class="ct-card ct-shop"><p class="ct-k">お土産屋さん・${c[2]}</p>
      <div class="ct-tag"><span>${c[8]}</span><b>${c[9].toLocaleString('ja-JP')} <small>${c[10]}</small></b></div>
      <p class="ct-rate">両替所の表示：<b>${c[7]}</b><small>（たとえ）</small></p>
      <p class="ct-t">日本円で、だいたいいくら？</p><div class="ct-bar"><i></i></div>
      <div class="ct-opts is-yen">${opts.map(v => `<button type="button" data-est="${v}">${yen(v)}</button>`).join('')}</div><div class="ct-fb"></div></div>`;
    T.right = right; T.t0 = performance.now();
    const bar = play.querySelector('.ct-bar i'); bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; void bar.offsetWidth; bar.style.transition = `transform ${ET}s linear`; bar.style.transform = 'scaleX(0)';
    clearTimeout(T.tm); T.tm = setTimeout(() => pickEst(null), ET * 1000);
  };
  const pickEst = v => {
    const bs = [...play.querySelectorAll('[data-est]')]; if (!bs.length || bs[0].disabled) return;
    clearTimeout(T.tm); const bi = play.querySelector('.ct-bar i'), cur = getComputedStyle(bi).transform; bi.style.transition = 'none'; bi.style.transform = cur;
    const i = T.ans, c = C[i], ok = v === T.right, left = Math.max(0, ET - (performance.now() - T.t0) / 1000);
    bs.forEach(b => { b.disabled = true; if (+b.dataset.est === T.right) b.classList.add('is-ok'); else if (+b.dataset.est === v) b.classList.add('is-ng'); });
    const pts = ok ? 50 + Math.round(left / ET * 50) : 0; T.score += pts; if (ok) T.est++;
    const how = c[6] >= 1 ? `${c[9].toLocaleString('ja-JP')} × ${c[6]} 円` : c[6] === 0.11 ? `${c[9].toLocaleString('ja-JP')} ÷ 100 × 11 円` : `${c[9].toLocaleString('ja-JP')} ÷ 1,000 × 6 円`;
    T.done.push(i); drawPass(); drawMap();
    play.querySelector('.ct-fb').innerHTML = `<p class="${ok ? 'is-ok' : 'is-ng'}">${ok ? `正解！ +${pts} 点` : v == null ? '時間切れ。' : 'ざんねん。'}　${how} ＝ 約 ${yen(T.right)}</p>${c[6] < 1 ? '<p>ケタの大きいお金は、0 の数に気をつけて。</p>' : ''}<button type="button" class="ct-go" data-go="${T.k + 1 < STOPS ? 'next' : 'home'}">${T.k + 1 < STOPS ? '次の国へ飛ぶ' : '日本へ帰る'}</button>`;
  };
  const home = async () => {
    const last = T.route[STOPS - 1];
    play.innerHTML = `<div class="ct-card ct-fly"><p class="ct-k">帰りの便</p><p class="ct-t">日本へ向かっています……</p></div>`;
    drawMap(last, JP); await sleep(1300);
    const up = Math.random() < .5;
    T.fx = up;
    play.innerHTML = `<div class="ct-card"><p class="ct-k">最後のクイズ：帰りの空港で</p><p class="ct-t">旅のあいだに、1 ドルが 150 円から <b class="ct-fx">${up ? '120' : '180'} 円</b>になった。アメリカのお土産（20 ドル）は、日本円で見ると？</p>
      <div class="ct-opts">${[['cheap', '安くなった'], ['dear', '高くなった'], ['same', '変わらない']].map(([k, t]) => `<button type="button" data-fx="${k}">${t}</button>`).join('')}</div><div class="ct-fb"></div></div>`;
  };
  const pickFx = k => {
    const bs = [...play.querySelectorAll('[data-fx]')]; if (bs[0].disabled) return;
    const right = T.fx ? 'cheap' : 'dear', ok = k === right;
    bs.forEach(b => { b.disabled = true; if (b.dataset.fx === right) b.classList.add('is-ok'); else if (b.dataset.fx === k) b.classList.add('is-ng'); });
    if (ok) T.score += 100;
    play.querySelector('.ct-fb').innerHTML = `<p class="${ok ? 'is-ok' : 'is-ng'}">${ok ? '正解！ +100 点' : 'ざんねん。'}　20 ドルは ${T.fx ? '3,000 円 → 2,400 円' : '3,000 円 → 3,600 円'}。</p><p>${T.fx ? '1 ドルを手に入れるのに必要な円が少なくなった＝円の力が強くなった（円高）。外国の物は安く買える。' : '1 ドルを手に入れるのに必要な円が多くなった＝円の力が弱くなった（円安）。外国の物は高くなる。'}</p><button type="button" class="ct-go" data-go="end">旅の結果を見る</button>`;
  };
  const end = () => {
    const sc = T.score, nb = sc > best; if (nb) { best = sc; try { localStorage.setItem(BK, best); } catch (e) {} }
    const rk = sc >= 1050 ? ['博', '世界のお金博士'] : sc >= 800 ? ['旅', '旅なれた両替名人'] : sc >= 550 ? ['航', 'はじめての海外旅行'] : ['港', 'まずは空港から'];
    drawMap(); drawPass();
    play.innerHTML = `<div class="ct-card ct-end"><span class="ct-stamp" aria-hidden="true">${rk[0]}</span><p class="ct-k">${rk[1]}</p><p class="ct-res"><b>${sc}</b> 点${nb ? '<em>自己ベスト</em>' : ''}</p>
      <p class="ct-sum">お金の名前 ${T.cur} / ${STOPS}・値段の見積もり ${T.est} / ${STOPS}</p>
      <p class="ct-x">${got.length >= C.length ? '図鑑がうまった！ 世界のお金博士。' : `図鑑はあと ${C.length - got.length} 枚。次の旅は、まだのコインの国から回ります。`}</p>
      <button type="button" class="ct-go" data-go="start">もう一度、旅に出る</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(play.querySelector('.ct-end'), 'coins', sc >= 1050 ? 'top' : sc < 550 ? 'low' : 'mid');
  };

  box.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) { const v = g.dataset.go; if (v === 'start') start(); else if (v === 'shop') shop(); else if (v === 'next') { T.k++; fly(); } else if (v === 'home') home(); else if (v === 'end') end(); return; }
    const c = e.target.closest('[data-cur]'); if (c) { pickCur(+c.dataset.cur); return; }
    const s = e.target.closest('[data-est]'); if (s) { pickEst(+s.dataset.est); return; }
    const f = e.target.closest('[data-fx]'); if (f) pickFx(f.dataset.fx);
  });
  drawBook(); intro();
})();
