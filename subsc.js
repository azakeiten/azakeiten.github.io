/* ================================================================
   subsc.js — あそび場：サブスクと買い切り（近づいてから読みこむ）
   ・漫画・音楽・動画から 1 つえらび、1 か月に使う量を決めて、1 年（12 か月）をすすめる
   ・「1 つずつ買う」と「月ぎめで使い放題（サブスク）」の、払ったお金の合計を線でくらべる
   ・「4 か月目からあきる」「あきても解約を忘れる」で、使わない月も払いつづけるようすを見る
   ・値段はたとえ。見た目は subsc.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-subsc]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="subsc.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'subsc.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const yen = n => Math.round(n).toLocaleString() + ' 円';
  const IT = [['漫', '漫画', '冊', 500, 980, '読み放題'], ['音', '音楽', '曲', 250, 1080, '聴き放題'], ['映', '動画', '本', 400, 990, '見放題']];
  let it = 0, use = 3, bored = false, forget = false, busy = false;

  box.innerHTML = `
    <div class="sb-stage">
      <div class="sb-items" role="group" aria-label="なにを使う？">${IT.map(([s, n], i) => `<button type="button" data-it="${i}" aria-pressed="${!i}"><span>${s}</span>${n}</button>`).join('')}</div>
      <div class="sb-cal">${Array.from({ length: 12 }, (_, m) => `<div class="sb-m" data-m="${m}"><b>${m + 1} 月</b><span class="sb-use"></span><i class="sb-pay is-buy"></i><i class="sb-pay is-sub"></i></div>`).join('')}</div>
      <svg class="sb-chart" viewBox="0 0 520 220" role="img" aria-label="払ったお金の合計のくらべ"></svg>
      <p class="sb-legend"><i class="is-buy"></i>1 つずつ買う <i class="is-sub"></i><span data-k="subname">読み放題</span>（月ぎめ）</p>
      <p class="sb-msg" data-k="msg" aria-live="polite">使う量を決めて「1 年をすすめる」を押そう。</p>
    </div>
    <div class="sb-side">
      <div class="sb-price"><p><small>1 つずつ買うと</small><b data-k="unit">1 冊 500 円</b></p><p><small data-k="subname2">読み放題</small><b data-k="fee">月 980 円</b></p></div>
      <label class="sb-sl"><span>1 か月に使う量</span><output data-k="use">3 冊</output><input type="range" min="0" max="10" value="3"></label>
      <label class="sb-sw"><input type="checkbox" data-o="bored"><span></span>4 か月目からあきて、ほとんど使わなくなる</label>
      <label class="sb-sw"><input type="checkbox" data-o="forget"><span></span>あきても、サブスクの解約を忘れる</label>
      <button type="button" class="sb-go" data-a="go">1 年をすすめる</button>
      <div class="sb-res" hidden></div>
    </div>
    <div class="sb-learn">
      <p><b>どちらが得かは、使い方しだい</b>月ぎめの料金を 1 つの値段でわると、「何個より多く使えばサブスクが得か」がわかります。この境目が損益分岐点です（<a href="glossary.html#break-even">損益分岐点</a>）。</p>
      <p><b>サブスクは「固定費」</b>使っても使わなくても、毎月同じ金額がかかります。1 つずつ買うのは、使ったぶんだけかかる「変動費」です（<a href="glossary.html#fixed-variable">固定費と変動費</a>）。</p>
      <p><b>解約忘れに気をつけよう</b>あきて使わなくなっても、解約しなければ払いつづけます。会社にとっては、使われなくても入ってくるお金。ときどき、入っているサブスクを見直そう（<a href="glossary.html#subscription">サブスク</a>）。</p>
      <p><b>買い切りには「残る」よさも</b>買ったものは手元に残り、ほかの人にゆずれることもあります。サブスクは、やめると読めなくなることが多い。値段だけでなく、ちがいも考えてえらぼう。</p>
    </div>
    <p class="sb-note">値段は、しくみを知るための「たとえ」です。実際の料金はサービスによってちがいます。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const chart = box.querySelector('.sb-chart'), months = [...box.querySelectorAll('.sb-m')], range = box.querySelector('.sb-sl input'), res = box.querySelector('.sb-res');
  const usage = m => bored && m >= 3 ? 0 : use;
  const plan = () => {
    const [, , u, price, fee] = IT[it]; let b = 0, s = 0, subOn = true; const B = [0], S = [0], U = [];
    for (let m = 0; m < 12; m++) {
      const n = usage(m); U.push(n); b += n * price;
      if (bored && m >= 3 && !forget) subOn = false;
      if (subOn) s += fee;
      B.push(b); S.push(s);
    }
    return { B, S, U };
  };
  const draw = (p, upto) => {
    const mx = Math.max(12000, ...p.B, ...p.S) * 1.08, X = m => 40 + m / 12 * 466, Y = v => 196 - v / mx * 180;
    let s = `<line class="sb-ax" x1="40" x2="506" y1="196" y2="196"/>`;
    for (let v = 0; v <= mx; v += mx > 30000 ? 10000 : 5000) s += `<line class="sb-g" x1="40" x2="506" y1="${Y(v)}" y2="${Y(v)}"/><text class="sb-t" x="34" y="${Y(v) + 3}">${(v / 10000).toFixed(v % 10000 ? 1 : 0)}万</text>`;
    for (let m = 0; m <= 12; m += 3) s += `<text class="sb-t is-x" x="${X(m)}" y="212">${m} か月</text>`;
    const pts = a => a.slice(0, upto + 1).map((v, m) => `${X(m).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
    s += `<polyline class="sb-l is-buy" points="${pts(p.B)}"/><polyline class="sb-l is-sub" points="${pts(p.S)}"/>`;
    if (upto > 0) s += `<circle class="sb-p is-buy" cx="${X(upto)}" cy="${Y(p.B[upto])}" r="5"/><circle class="sb-p is-sub" cx="${X(upto)}" cy="${Y(p.S[upto])}" r="5"/>`;
    chart.innerHTML = s;
  };
  const prices = () => { const [, , u, price, fee, nm] = IT[it]; K('unit').textContent = `1 ${u} ${yen(price)}`; K('fee').textContent = `月 ${yen(fee)}`; K('subname').textContent = nm; K('subname2').textContent = nm; K('use').textContent = `${use} ${u}`; };
  const reset = () => { months.forEach(m => { m.className = 'sb-m'; m.querySelector('.sb-use').textContent = ''; }); res.hidden = true; draw(plan(), 0); };
  const run = async () => {
    if (busy) return; busy = true; box.classList.add('is-busy'); reset();
    const p = plan(), [, , u, price, fee, nm] = IT[it];
    for (let m = 0; m < 12; m++) {
      const el = months[m], n = p.U[m], paid = p.S[m + 1] > p.S[m];
      el.classList.add('is-on'); el.querySelector('.sb-use').textContent = n ? `${n} ${u}` : '使わない';
      el.classList.toggle('is-idle', !n); el.classList.toggle('is-waste', !n && paid); el.classList.toggle('is-stop', !paid);
      draw(p, m + 1);
      K('msg').textContent = !n && paid ? `${m + 1} 月：使っていないのに、${nm}の ${yen(fee)} を払っています。` : `${m + 1} 月：1 つずつなら合計 ${yen(p.B[m + 1])}、${nm}なら合計 ${yen(p.S[m + 1])}。`;
      await sleep(320);
    }
    const B = p.B[12], S = p.S[12], be = Math.ceil(fee / price), waste = p.S.slice(1).filter((v, m) => v > p.S[m] && !p.U[m]).length;
    const win = B === S ? '同じ' : B < S ? '1 つずつ買うほうが得' : `${nm}のほうが得`;
    K('msg').textContent = `1 年で、1 つずつ買うと ${yen(B)}、${nm}なら ${yen(S)}。${win}でした。`;
    res.innerHTML = `<p class="sb-r-h">${win}<small>差は ${yen(Math.abs(B - S))}</small></p>
      <p>${nm}は月 ${yen(fee)}、1 ${u} ${yen(price)} なので、<b>1 か月に ${be} ${u}以上</b>使うなら${nm}が得になります（損益分岐点）。</p>
      ${waste ? `<p class="sb-r-w">使わないのに払った月が <b>${waste} か月</b>（${yen(waste * fee)}）。解約を忘れると、こうなります。</p>` : ''}`;
    res.hidden = false;
    busy = false; box.classList.remove('is-busy');
    try { localStorage.setItem('azakei_subsc', '1'); } catch (e) {}
  };
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-it]'); if (b && !busy) { it = +b.dataset.it; box.querySelectorAll('[data-it]').forEach(x => x.setAttribute('aria-pressed', x === b)); prices(); reset(); return; }
    if (e.target.closest('[data-a="go"]')) run();
  });
  box.addEventListener('change', e => { const o = e.target.closest('[data-o]'); if (!o) return; if (o.dataset.o === 'bored') bored = o.checked; else forget = o.checked; if (!busy) reset(); });
  range.addEventListener('input', () => { use = +range.value; prices(); if (!busy) reset(); });
  prices(); reset();
})();
