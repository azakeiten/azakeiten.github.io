/* ================================================================
   hama.js — コンテスト：浜辺のアイス屋さん（独占と競争・近づいてから読みこむ）
   ・浜辺に 30 人。1 人ひとり「ここまでなら払う」値段（100〜500 円）がちがう。アイス 1 つの原価は 100 円
   ・第 1 幕「浜辺でただ 1 つのお店」：値段を決めると、買う人がお店に集まる。もうけが最大になる値段をさがす
   ・第 2 幕「となりにライバル」：5 回の勝負。ライバルはあなたの前の値段より 20 円安くしてくる
   ・お客さんは安いほうで買う。値段は原価に近づき、買える人とお客さんの得がふえる
   ・数字はたとえ。見た目は hama.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-hama]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="hama.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'hama.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const N = 30, COST = 100, ROUNDS = 5;
  const WTP = Array.from({ length: N }, (_, i) => 100 + Math.round((i + .5) / N * 400 / 10) * 10);   // 110〜490 円
  const order = WTP.map((_, i) => i).sort((a, b) => ((a * 17) % N) - ((b * 17) % N));                 // 浜辺の上での並び
  const POS = order.map((_, k) => [112 + (k % 10) * 46 + (Math.floor(k / 10) % 2) * 23, 146 + Math.floor(k / 10) * 44]);
  const yen = n => Math.round(n).toLocaleString() + ' 円';
  const person = i => `<g class="hm-p" data-p="${i}" transform="translate(${POS[order.indexOf(i)].join(' ')})"><g class="hm-pi"><ellipse cy="20" rx="12" ry="3" class="hm-shadow"/><path d="M-8 18 Q-8 2 0 0 Q8 2 8 18 Z" style="fill:hsl(${(i * 47) % 360} 50% 55%)"/><circle cy="-7" r="7" class="hm-head"/><g class="hm-ice"><path d="M5 -2 l4 12 l4 -12 Z" class="hm-cone"/><circle cx="9" cy="-4" r="4.5" style="fill:hsl(${(i * 83) % 360} 70% 80%)"/></g></g><text class="hm-w" y="34">${WTP[i]}</text></g>`;

  box.innerHTML = `
    <div class="hm-stage">
      <div class="hm-acts" role="group" aria-label="幕"><button type="button" data-act="1" aria-pressed="true">第 1 幕　ただ 1 つのお店</button><button type="button" data-act="2" aria-pressed="false">第 2 幕　となりにライバル</button></div>
      <svg class="hm-svg" viewBox="0 0 640 320" role="img" aria-label="浜辺とアイス屋さん、30 人のお客さん">
        <rect width="640" height="320" class="hm-sea"/>
        <g class="hm-waves">${[0, 1, 2].map(i => `<path d="M0 ${40 + i * 18} Q40 ${34 + i * 18} 80 ${40 + i * 18} T160 ${40 + i * 18} T240 ${40 + i * 18} T320 ${40 + i * 18} T400 ${40 + i * 18} T480 ${40 + i * 18} T560 ${40 + i * 18} T640 ${40 + i * 18}" style="animation-delay:-${i}s"/>`).join('')}</g>
        <circle cx="580" cy="34" r="20" class="hm-sun"/>
        <path class="hm-sand" d="M0 100 Q320 80 640 104 V320 H0 Z"/>
        <g class="hm-shop is-me" transform="translate(40 250)"><rect x="-30" y="-18" width="60" height="44" rx="4" class="hm-stall"/><path d="M-36 -18 h72 l-6 -14 h-60 Z" class="hm-awn"/><text y="10" class="hm-shop-t">あなた</text><g class="hm-tag"><rect x="-30" y="-58" width="60" height="22" rx="6"/><text y="-42" data-k="myTag">—</text></g></g>
        <g class="hm-shop is-rival" transform="translate(600 250)"><rect x="-30" y="-18" width="60" height="44" rx="4" class="hm-stall"/><path d="M-36 -18 h72 l-6 -14 h-60 Z" class="hm-awn"/><text y="10" class="hm-shop-t">ライバル</text><g class="hm-tag"><rect x="-30" y="-58" width="60" height="22" rx="6"/><text y="-42" data-k="rvTag">—</text></g></g>
        <g class="hm-people">${WTP.map((_, i) => person(i)).join('')}</g>
      </svg>
      <p class="hm-msg" data-k="msg" aria-live="polite"></p>
    </div>
    <div class="hm-side">
      <label class="hm-price"><span>アイス 1 つの値段</span><output data-k="p">300 円</output><input type="range" min="100" max="500" step="10" value="300"></label>
      <p class="hm-cost">原価（材料など）は 1 つ 100 円。小さな数字は、その人が「ここまでなら払う」値段です。</p>
      <button type="button" class="hm-go" data-a="sell">この値段で売る</button>
      <ul class="hm-nums">
        <li><small>買った人</small><b data-k="n">—</b></li>
        <li><small>あなたのもうけ</small><b data-k="pf">—</b></li>
        <li><small>お客さんの得（払ってもよい額 − 値段）</small><b data-k="cs">—</b></li>
      </ul>
      <svg class="hm-chart" viewBox="0 0 300 150" role="img" aria-label="値段ともうけのグラフ"></svg>
      <ol class="hm-rounds" data-k="rounds" hidden></ol>
    </div>
    <div class="hm-result" hidden></div>
    <div class="hm-learn">
      <p><b>独占</b>お店が 1 つしかないと、お店は値段を高めにして、もうけを大きくできます。そのかわり、買えない人がふえます（<a href="glossary.html#monopoly">独占・寡占</a>）。</p>
      <p><b>競争</b>ライバルが来ると、お客さんは安いほうへ。値段は原価に近づき、買える人も、お客さんの得もふえます。お店のもうけは小さくなります。</p>
      <p><b>独占禁止法</b>日本では、お店どうしで値段を相談して決めること（カルテル）などが、独占禁止法で禁止されています。見はっているのは公正取引委員会です。</p>
      <p><b>こんなところにも</b>新しい店ができて近所の値段が下がる、スマホの料金が会社どうしの競争で変わる。身近な値段の動きも、このしくみで考えられます。</p>
    </div>
    <p class="hm-note">お客さんの数や「ここまでなら払う」値段、ライバルの作戦は、しくみを知るための「たとえ」です。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const ppl = [...box.querySelectorAll('.hm-p')], range = box.querySelector('.hm-price input'), chart = box.querySelector('.hm-chart'), result = box.querySelector('.hm-result'), roundsEl = K('rounds');
  const MY = [40, 250], RV = [600, 250];
  let act = 1, P = 300, busy = false, tried = new Set(), round = 0, last = 300, hist = [], rv = 0;

  const monoStats = p => { const b = WTP.filter(w => w >= p); return { n: b.length, pf: (p - COST) * b.length, cs: b.reduce((s, w) => s + w - p, 0) }; };
  let BEST = 100; for (let p = 100; p <= 500; p += 10) if (monoStats(p).pf > monoStats(BEST).pf) BEST = p;
  const drawChart = () => {
    const X = p => 24 + (p - 100) / 400 * 266, Y = v => 132 - v / 3200 * 120;
    let s = `<line class="hm-c-ax" x1="24" x2="290" y1="132" y2="132"/><line class="hm-c-ax" x1="24" x2="24" y1="8" y2="132"/>`;
    for (let p = 100; p <= 500; p += 100) s += `<text class="hm-c-t" x="${X(p)}" y="146">${p}</text>`;
    if (act === 1) {
      const pts = []; for (let p = 100; p <= 500; p += 10) pts.push(`${X(p)},${Y(monoStats(p).pf)}`);
      s += `<polyline class="hm-c-ghost" points="${pts.join(' ')}"/>`;
      [...tried].forEach(p => { s += `<circle class="hm-c-p" cx="${X(p)}" cy="${Y(monoStats(p).pf)}" r="4"/>`; });
      s += `<text class="hm-c-t" x="28" y="16" style="text-anchor:start">もうけ（ためした値段）</text>`;
    } else {
      const Xr = i => 30 + i * 60, Yp = p => 132 - (p - 100) / 400 * 120;
      s = `<line class="hm-c-ax" x1="24" x2="290" y1="132" y2="132"/><line class="hm-c-cost" x1="24" x2="290" y1="${Yp(100)}" y2="${Yp(100)}"/>`;
      hist.forEach((h, i) => { s += `<text class="hm-c-t" x="${Xr(i)}" y="146">${i + 1} 回</text>`; });
      if (hist.length) {
        s += `<polyline class="hm-c-me" points="${hist.map((h, i) => `${Xr(i)},${Yp(h.p)}`).join(' ')}"/><polyline class="hm-c-rv" points="${hist.map((h, i) => `${Xr(i)},${Yp(h.r)}`).join(' ')}"/>`;
        hist.forEach((h, i) => { s += `<circle class="hm-c-mp" cx="${Xr(i)}" cy="${Yp(h.p)}" r="4"/><circle class="hm-c-rp" cx="${Xr(i)}" cy="${Yp(h.r)}" r="4"/>`; });
      }
      s += `<text class="hm-c-t" x="28" y="16" style="text-anchor:start">値段の動き（金：あなた／青：ライバル）</text>`;
    }
    chart.innerHTML = s;
  };
  const resetPeople = () => ppl.forEach(p => { p.classList.remove('is-buy', 'is-no', 'to-me', 'to-rv'); p.style.removeProperty('--tx'); p.style.removeProperty('--ty'); });
  const walk = (i, to) => { const [x, y] = POS[order.indexOf(i)], [tx, ty] = to === 'me' ? MY : RV; const el = ppl[i]; el.style.setProperty('--tx', (tx - x + (to === 'me' ? 40 : -40) + ((i * 7) % 30 - 15)) + 'px'); el.style.setProperty('--ty', (ty - y + ((i * 11) % 24 - 12)) + 'px'); el.classList.add('is-buy', to === 'me' ? 'to-me' : 'to-rv'); };

  const sell = async () => {
    if (busy) return; busy = true; box.classList.add('is-busy');
    resetPeople(); await sleep(250);
    if (act === 1) {
      const st = monoStats(P); tried.add(P);
      WTP.forEach((w, i) => { if (w >= P) setTimeout(() => walk(i, 'me'), reduce ? 0 : (500 - w) * 2); else ppl[i].classList.add('is-no'); });
      await sleep(900);
      K('n').textContent = `${st.n} / ${N} 人`; K('pf').textContent = yen(st.pf); K('cs').textContent = yen(st.cs);
      const best = P === BEST;
      K('msg').textContent = best ? `${yen(P)} で ${st.n} 人が買い、もうけは ${yen(st.pf)}。これが、ただ 1 つのお店のもうけがいちばん大きくなる値段です。でも、${N - st.n} 人は買えませんでした。` : `${yen(P)} で ${st.n} 人が買い、もうけは ${yen(st.pf)}。${P > BEST ? '高すぎると、買う人が少なすぎます。' : '安すぎると、1 つあたりのもうけが小さすぎます。'} もうけがいちばん大きい値段をさがそう。`;
      drawChart();
      if (best) { box.querySelector('[data-act="2"]').classList.add('is-hint'); try { localStorage.setItem('azakei_hama', '1'); } catch (e) {} }
    } else {
      if (round >= ROUNDS) { busy = false; box.classList.remove('is-busy'); return; }
      round++;
      rv = round === 1 ? 290 : Math.max(COST + 10, last - 20);
      K('rvTag').textContent = yen(rv);
      const lo = Math.min(P, rv);
      let mine = 0, cs = 0;
      WTP.forEach((w, i) => {
        if (w < lo) { ppl[i].classList.add('is-no'); return; }
        const toMe = P < rv || (P === rv && i % 2 === 0);
        if (toMe) mine++; cs += w - lo;
        setTimeout(() => walk(i, toMe ? 'me' : 'rv'), reduce ? 0 : (500 - w) * 2);
      });
      await sleep(900);
      const pf = (P - COST) * mine; last = P;
      hist.push({ p: P, r: rv, mine, pf, cs, buyers: WTP.filter(w => w >= lo).length });
      K('n').textContent = `${mine} 人（全体 ${WTP.filter(w => w >= lo).length} 人）`; K('pf').textContent = yen(pf); K('cs').textContent = yen(cs);
      K('msg').textContent = P > rv ? `ライバルは ${yen(rv)}。お客さんはみんなライバルへ。あなたのもうけは 0 円です。` : P < rv ? `あなたのほうが安いので、買う人は全員あなたへ（${mine} 人）。でも次の回、ライバルはさらに下げてきます。` : `同じ値段なので、お客さんは半分ずつ。`;
      roundsEl.hidden = false; roundsEl.innerHTML = hist.map((h, i) => `<li><span>${i + 1} 回目</span><b>${yen(h.p)}</b><i>ライバル ${yen(h.r)}</i><em>${yen(h.pf)}</em></li>`).join('');
      drawChart();
      if (round >= ROUNDS) finish();
    }
    busy = false; box.classList.remove('is-busy');
  };
  const finish = () => {
    const avg = hist.reduce((s, h) => s + Math.min(h.p, h.r), 0) / hist.length, m = monoStats(BEST), lastH = hist[hist.length - 1];
    result.innerHTML = `<span class="hm-r-seal" aria-hidden="true">競</span><div><p class="hm-r-h">競争で、値段が下がりました</p>
      <p>5 回の勝負で、お客さんが買った値段は平均 ${yen(avg)}。ただ 1 つのお店のとき（${yen(BEST)}）より下がりました。</p>
      <ul class="hm-r-nums"><li><small>買えた人</small><b>${m.n} → ${lastH.buyers} 人</b></li><li><small>お客さんの得</small><b>${yen(m.cs)} → ${yen(lastH.cs)}</b></li><li><small>あなたのもうけ（5 回の合計）</small><b>${yen(hist.reduce((s, h) => s + h.pf, 0))}</b></li></ul>
      <p class="hm-r-hint">お店のもうけは小さくなりましたが、買える人と、お客さんの得はふえました。お店どうしで「高いままにしよう」と相談するのは、カルテルといって法律で禁止されています。</p>
      <button type="button" class="hm-again" data-a="again">もう一度、5 回勝負</button></div>`;
    result.hidden = false;
    try { localStorage.setItem('azakei_hama', '2'); } catch (e) {}
  };
  const setAct = a => {
    act = a; box.dataset.mode = a; resetPeople(); result.hidden = true; round = 0; hist = []; last = 300;
    box.querySelectorAll('[data-act]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.act === a));
    K('rvTag').textContent = a === 2 ? '？' : '—'; roundsEl.hidden = true; roundsEl.innerHTML = '';
    ['n', 'pf', 'cs'].forEach(k => K(k).textContent = '—');
    K('msg').textContent = a === 1 ? '浜辺でアイスを売るのは、あなたのお店だけ。値段を決めて「この値段で売る」。もうけがいちばん大きくなる値段は？' : 'となりにライバルのお店ができました。5 回勝負。ライバルは、あなたの前の値段より 20 円安くしてきます。お客さんは安いほうで買います。';
    drawChart();
  };
  range.addEventListener('input', () => { P = +range.value; K('p').textContent = yen(P); K('myTag').textContent = yen(P); });
  box.addEventListener('click', e => {
    const a = e.target.closest('[data-act]'); if (a && !busy) { setAct(+a.dataset.act); return; }
    const b = e.target.closest('[data-a]'); if (!b) return;
    if (b.dataset.a === 'sell') sell(); else if (b.dataset.a === 'again') setAct(2);
  });
  K('myTag').textContent = yen(P);
  setAct(1);
})();
