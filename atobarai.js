/* ================================================================
   atobarai.js — あそび場：10 万円のゲーム機、どう払う？（後払いの体験・近づいてから読みこむ）
   ・たとえのクレジットカードで、10 万円のゲーム機を買う。払い方を選ぶと、1 か月ずつ支払いが進む
   ・1 回払い／3 回払い／12 回払い／リボ払い（毎月決まった額）／ためてから買う
   ・分割とリボには手数料（このたとえでは年 15%）。のこりのお金に毎月かかる
   ・最後に 5 つの払い方を、払った合計と、終わるまでの月数でくらべる
   ・見た目は atobarai.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-atobarai]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="atobarai.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'atobarai.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const P = 100000, R = .15 / 12;
  const yen = n => Math.round(n).toLocaleString() + ' 円';
  const M = [
    ['一', '1 回払い', '次の月に、まとめて払う', 'once'],
    ['三', '3 回払い', '3 か月に分けて払う（手数料あり）', 'n3'],
    ['十', '12 回払い', '1 年に分けて払う（手数料あり）', 'n12'],
    ['リ', 'リボ払い', '毎月、決まった額だけ払う（手数料あり）', 'revo'],
    ['貯', 'ためてから買う', '毎月ためて、10 万円になったら買う', 'save']
  ];
  // 払い方ごとに、毎月の [元のお金, 手数料] の列を計算する
  const plan = (k, A) => {
    const rows = [];
    if (k === 'once') rows.push([P, 0]);
    else if (k === 'n3' || k === 'n12') {
      const n = k === 'n3' ? 3 : 12, pay = P * R / (1 - Math.pow(1 + R, -n)); let b = P;
      for (let i = 0; i < n; i++) { const it = b * R, pr = Math.min(b, pay - it); rows.push([pr, it]); b -= pr; }
    } else if (k === 'revo') {
      let b = P;
      for (let i = 0; i < 240 && b > .5; i++) { const it = b * R, pay = Math.min(A, b + it), pr = pay - it; rows.push([pr, it]); b -= pr; }
    } else { let s = 0; while (s < P) { rows.push([Math.min(A, P - s), 0]); s += A; } }
    return rows;
  };
  const sum = (rows, i) => rows.reduce((a, r) => a + r[i], 0);

  box.innerHTML = `
    <div class="ah-top">
      <div class="ah-item">
        <svg viewBox="0 0 220 150" class="ah-console" aria-hidden="true"><rect x="20" y="40" width="180" height="84" rx="38" class="ah-c-body"/><rect x="72" y="52" width="76" height="52" rx="6" class="ah-c-screen"/><circle cx="48" cy="82" r="13" class="ah-c-pad"/><path d="M42 82 h12 M48 76 v12" class="ah-c-x"/><circle cx="172" cy="74" r="6" class="ah-c-b1"/><circle cx="160" cy="90" r="6" class="ah-c-b2"/><path d="M90 78 l10 -10 l10 10 l10 -10 l10 10" class="ah-c-wave"/><rect x="86" y="18" width="48" height="20" rx="4" class="ah-tag"/><text x="110" y="32" class="ah-tag-t">新作</text></svg>
        <p class="ah-price"><small>ゲーム機（たとえ）</small><b>100,000</b> 円</p>
        <div class="ah-card" aria-hidden="true"><span class="ah-chip"></span><b>たとえのカード</b><small>後払い</small></div>
      </div>
      <div class="ah-pick">
        <p class="ah-h">どう払う？</p>
        <div class="ah-ms" role="radiogroup" aria-label="払い方">${M.map(([s, n, d, k], i) => `<button type="button" role="radio" class="ah-m" data-m="${k}" aria-checked="${i === 3}"><span class="ah-s">${s}</span><b>${n}</b><small>${d}</small></button>`).join('')}</div>
        <label class="ah-a"><span>リボ払い・ためるときの、毎月の額</span><output>5,000 円</output><input type="range" min="2000" max="10000" step="1000" value="5000"></label>
        <button type="button" class="ah-go" data-a="go">支払いを始める</button>
      </div>
    </div>
    <div class="ah-run" aria-live="polite">
      <div class="ah-cal"><span>支払い</span><b data-k="mon">0</b><span>か月目</span><small data-k="yr"></small></div>
      <div class="ah-bars">
        <p class="ah-bl"><span>のこり</span><b data-k="left">100,000 円</b></p>
        <div class="ah-left"><i data-k="lbar"></i></div>
        <p class="ah-bl"><span>払ったお金</span><b data-k="paid">0 円</b></p>
        <div class="ah-paid"><i class="ah-pr" data-k="pbar"></i><i class="ah-it" data-k="ibar"></i></div>
        <p class="ah-legend"><i class="is-pr"></i>ゲーム機の代金 <i class="is-it"></i>手数料 <b data-k="fee">0 円</b></p>
      </div>
      <div class="ah-coins" aria-hidden="true"></div>
      <p class="ah-msg" data-k="msg">払い方を選んで、「支払いを始める」を押そう。</p>
    </div>
    <div class="ah-cmp" hidden></div>
    <div class="ah-learn">
      <p><b>クレジットカードは後払い</b>手元にお金がなくても買えるのが便利なところ。でも、あとで必ず払います。払える分だけ使うのが大切です（<a href="glossary.html#credit-card">クレジットカード</a>）。</p>
      <p><b>リボ払いのこわさ</b>毎月の額が少ないと楽に見えます。でも、のこりのお金に手数料がかかり続けるので、払い終わるまでが長く、合計も大きくなります（<a href="glossary.html#revolving">リボ払い</a>）。</p>
      <p><b>手数料は「借りたお金の金利」</b>このたとえでは年 15%。実際の手数料は、カード会社や契約によってちがいます。後払いのアプリも、しくみは似ています（<a href="glossary.html#bnpl">後払い決済</a>）。</p>
      <p><b>18 歳からは自分で契約</b>2022 年 4 月から、18 歳で成年（大人）になりました。クレジットカードも、親の同意なしで自分で契約できます。だからこそ、いまのうちにしくみを知っておこう。</p>
    </div>
    <p class="ah-note">ゲーム機の値段や手数料（年 15%）は、しくみを知るための「たとえ」です。1 回払いは手数料なしとして計算しています。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const range = box.querySelector('.ah-a input'), out = box.querySelector('.ah-a output'), coins = box.querySelector('.ah-coins'), cmp = box.querySelector('.ah-cmp');
  let m = 'revo', A = 5000, token = 0, busy = false;
  const pick = () => box.querySelectorAll('.ah-m').forEach(b => b.setAttribute('aria-checked', b.dataset.m === m));
  const reset = () => {
    token++; busy = false; box.classList.remove('is-running');
    K('mon').textContent = 0; K('yr').textContent = ''; K('left').textContent = yen(P); K('paid').textContent = yen(0); K('fee').textContent = yen(0);
    K('lbar').style.width = '100%'; K('pbar').style.width = '0%'; K('ibar').style.width = '0%'; coins.innerHTML = '';
    box.querySelector('.ah-a').classList.toggle('is-off', !(m === 'revo' || m === 'save'));
    box.querySelector('.ah-item').classList.remove('is-mine', 'is-wait');
  };
  const MAXV = 160000; // 払ったお金の棒の、いっぱいの長さ
  const run = async () => {
    if (busy) return;
    reset(); busy = true; box.classList.add('is-running'); cmp.hidden = true;
    const t = token, rows = plan(m, A), n = rows.length, dt = Math.max(70, Math.min(420, 9000 / n));
    let pr = 0, it = 0;
    K('msg').textContent = m === 'save' ? '毎月ためていきます。10 万円になったら買えます。' : 'ゲーム機が手に入りました。ここから支払いが始まります。';
    if (m !== 'save') box.querySelector('.ah-item').classList.add('is-mine'); else box.querySelector('.ah-item').classList.add('is-wait');
    await sleep(700); if (t !== token) return;
    for (let i = 0; i < n; i++) {
      pr += rows[i][0]; it += rows[i][1];
      const left = m === 'save' ? P - pr : Math.max(0, P - pr);
      K('mon').textContent = i + 1; K('yr').textContent = i + 1 >= 12 ? `（${Math.floor((i + 1) / 12)} 年${(i + 1) % 12 ? ` ${(i + 1) % 12} か月` : ''}）` : '';
      K('left').textContent = m === 'save' ? `あと ${yen(left)}` : yen(left); K('paid').textContent = yen(pr + it); K('fee').textContent = yen(it);
      K('lbar').style.width = (left / P * 100).toFixed(1) + '%';
      K('pbar').style.width = (pr / MAXV * 100).toFixed(1) + '%'; K('ibar').style.width = (it / MAXV * 100).toFixed(1) + '%';
      if (!reduce && i % Math.max(1, Math.round(n / 24)) === 0) { const c = document.createElement('i'); c.className = rows[i][1] > rows[i][0] * .25 ? 'is-red' : ''; c.style.left = (8 + Math.random() * 84) + '%'; coins.appendChild(c); setTimeout(() => c.remove(), 900); }
      if (m === 'revo' && i === 11 && n > 12) K('msg').textContent = `1 年たったのに、まだ ${yen(left)} のこっています。`;
      if (m === 'revo' && i === 35 && n > 36) K('msg').textContent = `3 年たちました。ゲーム機は、もう新しい型が出ているかも。`;
      await sleep(dt); if (t !== token) return;
    }
    if (m === 'save') box.querySelector('.ah-item').classList.replace('is-wait', 'is-mine');
    K('msg').textContent = m === 'save' ? `${n} か月ためて、ゲーム機を買いました。手数料は 0 円。そのかわり、待つ時間がかかりました。` : `${n} か月で払い終わりました。払った合計は ${yen(pr + it)}（手数料 ${yen(it)}）。`;
    busy = false; box.classList.remove('is-running');
    compare();
    try { localStorage.setItem('azakei_atobarai', String((+localStorage.getItem('azakei_atobarai') || 0) + 1)); } catch (e) {}
  };
  const compare = () => {
    const all = M.map(([s, n, , k]) => { const r = plan(k, A); return { s, n, k, months: r.length, fee: sum(r, 1), total: sum(r, 0) + sum(r, 1) }; });
    const mx = Math.max(...all.map(x => x.total));
    const me = all.find(x => x.k === m), revo = all.find(x => x.k === 'revo');
    let tip = '';
    if (m === 'revo') tip = `毎月 ${yen(A)} は楽に見えます。でも払い終わるまで ${revo.months} か月（${(revo.months / 12).toFixed(1)} 年）、手数料は ${yen(revo.fee)}。毎月の額を大きくすると、どう変わるかな？`;
    else if (m === 'save') tip = 'ためてから買うと手数料は 0 円。待つあいだに、本当にほしいかを考える時間にもなります。';
    else if (m === 'once') tip = '1 回払いは手数料なし。そのかわり、次の月に 10 万円を用意できることが条件です。';
    else tip = `${me.n}なら手数料は ${yen(me.fee)}。回数が多いほど、1 回は少なく、合計は大きくなります。`;
    cmp.innerHTML = `<p class="ah-cmp-h">5 つの払い方をくらべると（毎月の額 ${yen(A)} のとき）</p>
      <ul class="ah-cmp-l">${all.map(x => `<li class="${x.k === m ? 'is-me' : ''}"><span class="ah-s">${x.s}</span><b>${x.n}</b><span class="ah-cmp-bar"><i class="ah-pr" style="width:${(P / mx * 100).toFixed(1)}%"></i><i class="ah-it" style="width:${(x.fee / mx * 100).toFixed(1)}%"></i></span><span class="ah-cmp-v">${yen(x.total)}<small>${x.k === 'save' ? `${x.months} か月後に手に入る` : `${x.months} か月で完了`}</small></span></li>`).join('')}</ul>
      <p class="ah-cmp-tip">${tip}</p>`;
    cmp.hidden = false;
  };

  box.addEventListener('click', e => {
    const b = e.target.closest('.ah-m');
    if (b && !busy) { m = b.dataset.m; pick(); reset(); K('msg').textContent = '「支払いを始める」を押そう。'; return; }
    if (e.target.closest('[data-a="go"]')) run();
  });
  range.addEventListener('input', () => { A = +range.value; out.textContent = yen(A); if (!busy) { reset(); if (!cmp.hidden) compare(); } });
  pick(); reset();
})();
