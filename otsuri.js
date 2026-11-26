/* ================================================================
   otsuri.js — あそび場：「おつりの達人」レジの 90 秒（近づいてから読みこむ）
   ・お客さんが列にならぶ。先頭の人のおつりを、レジの中のお金から出して「わたす」
   ・お客さんには待てる時間（輪）がある。0 になると帰ってしまい、評判が 1 つ下がる
   ・レジの中のお金には限りがある。お客さんが払ったお金はレジに入り、おつりに使える。
     小銭や千円札が切れたら「金庫から補充」（5 秒かかる）
   ・時間がたつと、5,000 円札・1 万円札や、「1,080 円で」と小銭を足して払う人も来る
   ・ぴったりで 100 点＋早さで最大 50 点＋いちばん少ない枚数で 50 点。続けると倍率が上がる
   ・わたしすぎると、閉店のレジ締めでお金が合わない。値段はたとえ
   ・お金の絵は本物に似せない丸と四角（数字だけ）。見た目は otsuri.css（このファイルが読みこむ）
   ・自己ベストはこのブラウザの中だけ（azakei_otsuri_best）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-otsuri]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="otsuri.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'otsuri.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D = [5000, 1000, 500, 100, 50, 10, 5, 1];
  const START = { 5000: 2, 1000: 8, 500: 4, 100: 10, 50: 5, 10: 10, 5: 4, 1: 10 };
  const REFILL = { 1000: 5, 500: 4, 100: 10, 50: 5, 10: 20, 5: 5, 1: 20 };
  const TIME = 90, REFT = 5, BK = 'azakei_otsuri_best';
  const PH = [['朝', '1,000 円札のお客さん'], ['昼のピーク', '5,000 円札や、小銭を足して払う人も'], ['夕方', '1 万円札の人も。列が長くなる']];
  // 品物と、値段のはば（たとえ）と、出てくる時間帯（0 朝から）
  const ITEMS = [['おにぎり', 110, 250, 0], ['ノート', 120, 380, 0], ['ジュース', 100, 220, 0], ['えんぴつ', 60, 180, 0], ['パン', 130, 340, 0], ['お菓子', 80, 420, 0], ['お弁当', 380, 780, 0], ['牛乳', 160, 280, 0], ['絵の具', 480, 960, 0], ['本', 550, 990, 0],
    ['お弁当 2 つ', 980, 1580, 1], ['文房具セット', 1080, 2480, 1], ['おかし箱', 1200, 3200, 1], ['くつ下', 380, 980, 1],
    ['お花', 1500, 4800, 2], ['パーティのお菓子', 1800, 4500, 2], ['ケーキ', 2200, 4980, 2]];
  const WHO = [['学', '小学生'], ['会', '会社員'], ['年', '年配の人'], ['親', '親子'], ['高', '高校生'], ['旅', '旅行の人']];
  const yen = n => n.toLocaleString('ja-JP');
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.random() * a.length | 0];
  const brk = n => D.reduce((a, d) => { while (n >= d) { a.push(d); n -= d; } return a; }, []);
  const isBill = d => d >= 1000;
  const money = (d, cls = '', extra = '') => `<span class="ot-m ${isBill(d) ? 'is-bill' : 'is-coin'} ot-${d}${cls}"${extra}>${yen(d)}</span>`;
  let best = 0; try { best = +localStorage.getItem(BK) || 0; } catch (e) {}
  let S = null, timer = 0;

  /* レジの中のお金だけで出すとき、いちばん少ない枚数（数に限りのある両替の計算） */
  const minPieces = (n, have) => {
    const INF = 1e9, dp = new Array(n + 1).fill(INF); dp[0] = 0;
    D.forEach(d => { const c = have[d] || 0; for (let k = 0; k < c && d <= n; k++) { let moved = false; for (let a = n; a >= d; a--) if (dp[a - d] + 1 < dp[a]) { dp[a] = dp[a - d] + 1; moved = true; } if (!moved) break; } });
    return dp[n];
  };

  const intro = () => {
    clearInterval(timer); S = null;
    box.innerHTML = `<div class="ot-intro">
      <div class="ot-ih"><span class="ot-iseal" aria-hidden="true">釣</span><div><p class="ot-ik">レジの 90 秒</p><p class="ot-it">お客さんの列を、さばききれるか</p></div></div>
      <ol class="ot-rules">
        <li><b>先頭のお客さん</b>のおつりを、下のお金のボタンでトレーに出して「わたす」。</li>
        <li>お客さんのまわりの<b>輪</b>は、待てる時間。0 になると帰ってしまい、<b>評判</b>が 1 つ下がる。</li>
        <li>おつりは<b>レジの中のお金</b>からしか出せない。払ってもらったお金もレジに入る。小銭や千円札が切れたら、金庫から「補充」（5 秒）。</li>
        <li>ぴったりで 100 点。早いほど最大 +50 点、<b>いちばん少ない枚数</b>なら +50 点。続けると倍率が上がる。</li>
        <li>わたしすぎると、閉店のレジ締めでお金が合わなくなる。</li>
      </ol>
      <p class="ot-note">時間がたつと 5,000 円札・1 万円札の人や、「1,080 円で」と小銭を足して払う人も来ます。値段はたとえです。</p>
      <div class="ot-ifoot">${best ? `<p class="ot-best">自己ベスト <b>${yen(best)}</b> 点</p>` : '<p class="ot-best">はじめての開店</p>'}<button type="button" class="ot-start">開店する</button></div></div>`;
  };

  const newCustomer = () => {
    const p = S.ph, it = pick(ITEMS.filter(x => x[3] <= p));
    let price = rnd(it[1], it[2]); const r = Math.random();
    price = r < .45 ? Math.round(price / 10) * 10 : r < .8 ? Math.floor(price / 10) * 10 + 8 : price;
    if (price % 1000 === 0) price -= 20;
    let bill = price < 1000 ? 1000 : price < 5000 ? 5000 : 10000;
    if (p >= 1 && bill === 1000 && Math.random() < .18) bill = 5000;
    if (p >= 2 && Math.random() < .3) bill = 10000;
    let extra = 0, kind = bill === 10000 ? 'man' : 'bill';
    if (bill < 10000 && price % 100 && Math.random() < (bill === 5000 ? .3 : p ? .42 : .28)) { extra = price % 100; kind = 'hasu'; }
    const pay = [bill, ...brk(extra)], paid = bill + extra;
    const who = pick(WHO), pm = [19, 16, 13][p] + (who[0] === '年' ? 2 : 0);
    const say = kind === 'hasu' ? `${yen(paid)} 円で。小銭がへるとうれしいな` : kind === 'man' ? '1 万円札しかなくて、すみません' : bill === 5000 ? '5,000 円札でお願いします' : `${yen(bill)} 円でお願いします`;
    S.queue.push({ id: ++S.uid, who, item: it[0], price, pay, paid, change: paid - price, kind, say, pat: pm, pm, miss: 0, taken: 0 });
    S.dirtyQ = 1;
  };

  const start = () => {
    clearInterval(timer);
    S = { t: 0, ph: 0, drawer: Object.assign({}, START), tray: [], queue: [], uid: 0, score: 0, combo: 0, rep: 5, next: 0, lock: 0,
      served: 0, left: 0, first: 0, fewest: 0, over: 0, loss: 0, short: 0, refills: 0, stuck: 0, hasu: 0, sales: 0, times: [], best: 0, maxCombo: 0, front: 0, dirtyQ: 1 };
    box.innerHTML = `<div class="ot-hud"><p class="ot-ph"><span>朝</span></p><div class="ot-clock"><div class="ot-bar"><i></i></div><p><b class="ot-sec">${TIME}</b> 秒</p></div>
        <p class="ot-rep" aria-label="評判">${'<i class="is-on"></i>'.repeat(5)}</p><p class="ot-sc"><b>0</b><small>点</small><em class="ot-cb"></em></p></div>
      <div class="ot-stage"><div class="ot-line" aria-label="列"></div><div class="ot-flash" aria-hidden="true"></div></div>
      <div class="ot-counter"><div class="ot-cust" aria-live="polite"></div>
        <div class="ot-trayw"><p class="ot-th">おつりトレー<span class="ot-sum">0 円</span></p><div class="ot-tray"></div></div></div>
      <div class="ot-reg"><p class="ot-rh">レジの中<small>ボタンでトレーに出す・トレーのお金を押すともどす</small></p><div class="ot-pad"></div><div class="ot-lockv" hidden><p>金庫からお金を出しています<b></b></p></div></div>
      <div class="ot-act"><button type="button" class="ot-refill">金庫から補充<small>小銭と千円札・5 秒</small></button><button type="button" class="ot-clear">やりなおす</button><button type="button" class="ot-give">わたす</button></div>
      <p class="ot-msg" aria-live="polite"></p>`;
    newCustomer(); S.next = 3;
    { const r = box.getBoundingClientRect(); if (r.top < 0 || r.top > innerHeight * .35) box.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" }); }
    paintAll(); flash(0);
    let last = performance.now();
    timer = setInterval(() => { const now = performance.now(), dt = Math.min(.25, (now - last) / 1000); last = now; tick(dt); }, 100);
  };

  const flash = p => {
    const f = box.querySelector('.ot-flash'); if (!f) return;
    f.innerHTML = `<b>${PH[p][0]}</b><span>${PH[p][1]}</span>`; f.classList.remove('is-on'); void f.offsetWidth; f.classList.add('is-on');
    box.querySelector('.ot-ph span').textContent = PH[p][0];
  };

  const takeFront = () => {
    const c = S.queue[0]; if (!c || c.taken) return;
    c.taken = 1; c.t0 = S.t; c.pay.forEach(d => S.drawer[d]++);
    if (c.kind === 'hasu') S.hasu++;
    if (minPieces(c.change, S.drawer) >= 1e9) { S.stuck++; say('このままでは、おつりが出せません。金庫から補充しよう。', 'ng'); }
  };

  const leave = (c, i) => {
    S.queue.splice(i, 1); S.rep--; S.left++; S.combo = 0;
    if (c.taken) { c.pay.forEach(d => S.drawer[d]--); S.tray = []; }
    say(`${c.who[1]}のお客さんが、待ちきれずに帰ってしまった。評判が下がった。`, 'ng');
    box.querySelector('.ot-rep')?.classList.add('is-hit'); setTimeout(() => box.querySelector('.ot-rep')?.classList.remove('is-hit'), 600);
    S.dirtyQ = 1;
  };

  const tick = dt => {
    if (!S) return;
    if (document.hidden || !box.offsetParent) return; // 見えていないあいだは止める
    S.t += dt;
    const p = S.t < 30 ? 0 : S.t < 60 ? 1 : 2; if (p !== S.ph) { S.ph = p; flash(p); }
    if (S.lock > 0) { S.lock -= dt; if (S.lock <= 0) { S.lock = 0; D.forEach(d => S.drawer[d] += REFILL[d] || 0); S.refills++; say('金庫から、小銭と千円札を補充した。', 'ok'); paintPad(); } }
    for (let i = S.queue.length - 1; i >= 0; i--) { const c = S.queue[i]; c.pat -= dt * (i === 0 ? 1 : .85); if (c.pat <= 0) leave(c, i); }
    S.next -= dt;
    if (S.next <= 0) { if (S.queue.length < 5) newCustomer(); S.next = [6.2, 4.8, 3.9][S.ph] + Math.random() * 1.6; }
    if (S.t >= TIME || S.rep <= 0) return end();
    if (S.dirtyQ) { S.dirtyQ = 0; takeFront(); paintAll(); }
    paintTick();
  };

  const say = (t, k) => { const m = box.querySelector('.ot-msg'); if (m) { m.className = 'ot-msg is-' + k; m.textContent = t; } };
  const inTray = d => S.tray.filter(v => v === d).length;
  const sumT = () => S.tray.reduce((a, b) => a + b, 0);

  const paintQueue = () => {
    box.querySelector('.ot-line').innerHTML = S.queue.map((c, i) => `<span class="ot-q${i ? '' : ' is-front'}" data-id="${c.id}" style="--p:${(c.pat / c.pm).toFixed(3)}"><i>${c.who[0]}</i>${i ? '' : '<em>レジ</em>'}</span>`).join('') + (S.queue.length ? '' : '<span class="ot-none">お客さんを待っています</span>');
  };
  const paintCust = () => {
    const c = S.queue[0], el = box.querySelector('.ot-cust');
    if (!c) { el.innerHTML = '<p class="ot-wait">いまは、列にだれもいません。</p>'; S.front = 0; return; }
    if (S.front === c.id) return;
    S.front = c.id;
    el.innerHTML = `<div class="ot-cw is-in"><p class="ot-who"><span>${c.who[0]}</span>${c.who[1]}</p><p class="ot-say">「${c.say}」</p>
      <p class="ot-buy"><span class="ot-item">${c.item}</span><b>${yen(c.price)}</b> 円</p>
      <div class="ot-paid"><small>お預かり ${yen(c.paid)} 円</small><span>${c.pay.map(d => money(d, ' is-sm')).join('')}</span></div>
      <p class="ot-chg">おつり <b>?</b> 円</p></div>`;
  };
  const paintTray = () => {
    box.querySelector('.ot-tray').innerHTML = S.tray.length ? S.tray.map((v, i) => `<button type="button" class="ot-m ${isBill(v) ? 'is-bill' : 'is-coin'} ot-${v} is-in" data-i="${i}" aria-label="${yen(v)} 円をもどす">${yen(v)}</button>`).join('') : '<span class="ot-empty">ここにおつりを出す</span>';
    box.querySelector('.ot-sum').textContent = `${yen(sumT())} 円・${S.tray.length} 枚`;
  };
  const paintPad = () => {
    box.querySelector('.ot-pad').innerHTML = D.map(d => { const n = S.drawer[d] - inTray(d); return `<button type="button" class="ot-k ${isBill(d) ? 'is-bill' : 'is-coin'} ot-${d}${n <= 0 ? ' is-out' : n <= 2 ? ' is-low' : ''}" data-v="${d}" aria-label="${yen(d)} 円（のこり ${n}）"${n <= 0 || S.lock ? ' disabled' : ''}><span>${yen(d)}</span><em>${n <= 0 ? '切れ' : n}</em></button>`; }).join('');
    const lk = box.querySelector('.ot-lockv'); lk.hidden = !S.lock;
  };
  const paintAll = () => { paintQueue(); paintCust(); paintTray(); paintPad(); paintHud(); };
  const paintHud = () => {
    box.querySelector('.ot-sc b').textContent = yen(S.score);
    box.querySelector('.ot-cb').textContent = S.combo >= 2 ? `×${(1 + Math.min(S.combo - 1, 5) * .1).toFixed(1)}` : '';
    box.querySelectorAll('.ot-rep i').forEach((e, i) => e.classList.toggle('is-on', i < S.rep));
  };
  const paintTick = () => {
    box.querySelector('.ot-sec').textContent = Math.max(0, Math.ceil(TIME - S.t));
    box.querySelector('.ot-bar i').style.transform = `scaleX(${Math.max(0, 1 - S.t / TIME)})`;
    S.queue.forEach(c => { const e = box.querySelector(`.ot-q[data-id="${c.id}"]`); if (e) { const v = c.pat / c.pm; e.style.setProperty('--p', v.toFixed(3)); e.classList.toggle('is-hurry', v < .3); } });
    const lk = box.querySelector('.ot-lockv b'); if (lk && S.lock) lk.textContent = ` あと ${Math.ceil(S.lock)} 秒`;
  };

  const pop = (t, k) => {
    if (reduce) return;
    const s = document.createElement('span'); s.className = 'ot-pop is-' + k; s.textContent = t;
    box.querySelector('.ot-counter').appendChild(s); setTimeout(() => s.remove(), 1100);
  };

  const give = () => {
    const c = S.queue[0]; if (!c || S.lock) return;
    const s = sumT(); if (!s) { say('トレーにおつりを出してから「わたす」。', 'ng'); return; }
    if (s < c.change) { c.miss = 1; S.combo = 0; S.short++; say(`「あと ${yen(c.change - s)} 円たりませんよ」と言われた。`, 'ng'); paintHud(); shake(); return; }
    const min = minPieces(c.change, S.drawer);
    S.tray.forEach(d => S.drawer[d]--);
    let pts = 0;
    if (s > c.change) {
      S.over++; S.loss += s - c.change; S.combo = 0;
      say(`${yen(s - c.change)} 円わたしすぎた。お客さんは気づかず帰った。レジのお金が合わなくなる。`, 'ng'); shake();
    } else {
      const ok = S.tray.length === min, sp = Math.round(50 * Math.max(0, c.pat / c.pm));
      if (!c.miss) S.first++; if (ok) S.fewest++;
      S.combo = !c.miss && ok ? S.combo + 1 : 0; S.maxCombo = Math.max(S.maxCombo, S.combo);
      const mult = S.combo >= 2 ? 1 + Math.min(S.combo - 1, 5) * .1 : 1;
      pts = Math.round((100 + sp + (ok ? 50 : 0)) * mult); S.score += pts;
      say(ok ? `ぴったり、しかも最少の ${min} 枚。+${pts} 点${S.combo >= 2 ? `（${S.combo} 人つづけて）` : ''}` : `ぴったり。+${pts} 点（いまのレジなら ${min} 枚でわたせた）`, 'ok');
      pop('+' + pts, ok ? 'gold' : 'ok');
    }
    S.served++; S.sales += c.price; S.times.push(S.t - (c.t0 || S.t));
    S.queue.shift(); S.tray = []; S.front = 0; takeFront(); paintAll();
  };
  const shake = () => { if (reduce) return; const e = box.querySelector('.ot-counter'); e.classList.remove('is-shake'); void e.offsetWidth; e.classList.add('is-shake'); };

  const end = () => {
    clearInterval(timer);
    const R = S; S = null;
    const nb = R.score > best; if (nb) { best = R.score; try { localStorage.setItem(BK, best); } catch (e) {} }
    const avg = R.times.length ? R.times.reduce((a, b) => a + b, 0) / R.times.length : 0;
    const fr = R.served ? Math.round(R.fewest / R.served * 100) : 0, ft = R.served ? Math.round(R.first / R.served * 100) : 0;
    const rk = R.rep <= 0 ? ['閉', '今日は早じまい', '評判が 0 になって、お店を閉めることに。列の先頭から、まずは速く。'] : R.score >= 2600 ? ['達', 'レジの達人', '列をさばききった。お店の看板です。'] : R.score >= 1800 ? ['長', '頼れる店長', '速くて正確。もう少しで達人。'] : R.score >= 1000 ? ['良', '一人前のレジ係', 'いい調子。枚数と速さの両立をねらおう。'] : ['見', 'レジの見習い', 'まずは大きいお金から順に考えるのがコツ。'];
    const tips = [];
    if (R.loss) tips.push(`わたしすぎが ${yen(R.loss)} 円。お店では閉店のあとに「レジ締め」をして、売上とレジのお金が合うか数えます。合わないと、原因をさがすことになります。`);
    if (R.served && fr < 60) tips.push('いちばん少ない枚数は「大きいお金から順に」。たとえば 380 円なら 100 円玉 3 枚・50 円玉 1 枚・10 円玉 3 枚の 7 枚です。');
    if (R.stuck) tips.push(`おつりが出せない場面が ${R.stuck} 回ありました。少ない枚数でわたすと小銭が長持ちします。切れる前に補充するのも、お店の人の仕事です。`);
    if (R.hasu) tips.push(`「1,080 円で」のように小銭を足す人が ${R.hasu} 人いました。おつりが 100 円単位になり、お客さんは財布の小銭がへり、お店は細かいおつりを出さずにすみます。`);
    if (R.left) tips.push(`帰ってしまった人が ${R.left} 人。列が長いときは、まず速く。待ち時間もお店の評判になります。`);
    if (!tips.length) tips.push('ミスなし。列の長さを見ながら、速さと正確さを両立できました。');
    box.innerHTML = `<div class="ot-end"><div class="ot-eh"><span class="ot-seal" aria-hidden="true">${rk[0]}</span><div><p class="ot-rank">${rk[1]}</p><p class="ot-res"><b>${yen(R.score)}</b> 点${nb && R.score ? '<em>自己ベスト</em>' : ''}</p><p class="ot-word">${rk[2]}</p></div></div>
      <div class="ot-receipt"><p class="ot-rt">レジ締め<small>${R.rep <= 0 ? '早じまい' : '90 秒の営業'}</small></p>
        <dl><div><dt>おつりをわたした人</dt><dd>${R.served} 人</dd></div><div><dt>帰ってしまった人</dt><dd>${R.left} 人</dd></div>
        <div><dt>一回でぴったり</dt><dd>${ft} %</dd></div><div><dt>いちばん少ない枚数</dt><dd>${fr} %</dd></div>
        <div><dt>ひとりにかかった時間</dt><dd>平均 ${avg.toFixed(1)} 秒</dd></div><div><dt>いちばん長い連続</dt><dd>${R.maxCombo} 人</dd></div>
        <div><dt>小銭の補充</dt><dd>${R.refills} 回</dd></div><div><dt>売上（たとえ）</dt><dd>${yen(R.sales)} 円</dd></div>
        <div class="ot-diff${R.loss ? ' is-ng' : ''}"><dt>レジのお金と売上の差</dt><dd>${R.loss ? '−' + yen(R.loss) : '0'} 円</dd></div></dl></div>
      <ul class="ot-tips">${tips.slice(0, 3).map(t => `<li>${t}</li>`).join('')}</ul>
      <button type="button" class="ot-start">もう一度開店する</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(box.querySelector('.ot-end'), 'otsuri', R.rep <= 0 || R.score < 1000 ? 'low' : R.score >= 2600 ? 'top' : 'mid');
  };

  box.addEventListener('click', e => {
    if (e.target.closest('.ot-start')) { start(); return; }
    if (!S) return;
    const k = e.target.closest('.ot-pad .ot-k');
    if (k && !k.disabled) { const d = +k.dataset.v; if (S.drawer[d] - inTray(d) > 0) { S.tray.push(d); S.tray.sort((a, b) => b - a); paintTray(); paintPad(); } return; }
    const t = e.target.closest('.ot-tray .ot-m'); if (t) { S.tray.splice(+t.dataset.i, 1); paintTray(); paintPad(); return; }
    if (e.target.closest('.ot-clear')) { S.tray = []; paintTray(); paintPad(); return; }
    if (e.target.closest('.ot-refill')) { if (!S.lock) { S.lock = REFT; S.tray = []; paintTray(); paintPad(); say('金庫からお金を出しています。そのあいだも列は待っています。', 'ng'); } return; }
    if (e.target.closest('.ot-give')) give();
  });
  intro();
})();
