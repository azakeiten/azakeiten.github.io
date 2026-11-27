/* ================================================================
   kyuyo.js — あそび場：はじめての給料明細（近づいてから読みこむ）
   ・社会人 1 年目と 2 年目の給料明細。2 年目は給料が上がったのに、手取りが減る？ を予想してから明細を見る
   ・プリンターから明細が出てきて、支給・控除の行が 1 行ずつ印字される
   ・引かれたお金が、病院・年金・仕事をさがす人・国・町へ飛んでいく（どこで使われるか）
   ・額面のスライダーで、手取りが額面のおよそ何割かを見る
   ・料率と金額はすべて「約」「たとえ」。見た目は kyuyo.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-kyuyo]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="kyuyo.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'kyuyo.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const yen = n => Math.round(n).toLocaleString() + ' 円';
  // 控除のたとえ：健康保険 約 5%、厚生年金 約 9%、雇用保険 約 0.6%、所得税・住民税は下のかんたんな式（たとえ）
  const slip = (gross, prevGross) => {
    const ken = Math.round(gross * .05 / 10) * 10, nen = Math.round(gross * .09 / 10) * 10, koyo = Math.round(gross * .006 / 10) * 10, ins = ken + nen + koyo;
    const shotoku = Math.max(0, Math.round((gross - ins - 88000) * .05 / 10) * 10);
    const pIns = prevGross ? prevGross * .146 : 0;
    const jumin = prevGross ? Math.max(0, Math.round((prevGross - pIns - 90000) * .1 / 100) * 100) : 0;
    const ded = ins + shotoku + jumin;
    return { gross, rows: [['健康保険', ken, '病', '病気やけがのとき、病院で払うのが 3 割ですむ'], ['厚生年金', nen, '年', 'いまのお年寄りの年金と、自分の将来の年金に'], ['雇用保険', koyo, '職', '仕事をなくしたとき、次の仕事をさがすあいだの支え'], ['所得税', shotoku, '国', '国の税金。道路・学校・防衛などに'], ['住民税', jumin, '町', '住んでいる町や都道府県の税金。ごみ集め・図書館などに']], ded, net: gross - ded };
  };
  const Y1 = slip(220000, 0), Y2 = slip(230000, 220000);
  let stage = 0, gross = 250000, busy = false;
  box.innerHTML = `
    <div class="ky-desk">
      <div class="ky-printer" aria-hidden="true"><span class="ky-led" data-k="led"></span><span class="ky-slot"></span></div>
      <article class="ky-paper" data-k="paper" aria-live="polite">
        <header class="ky-ph"><p class="ky-co">株式会社 あさぶ商事</p><h3 data-k="title">給与明細書</h3><p class="ky-who">麻経 太郎 さま　<span data-k="when"></span></p></header>
        <div class="ky-sec"><p class="ky-sh">支給</p><dl class="ky-rows" data-k="pay"></dl></div>
        <div class="ky-sec"><p class="ky-sh is-ded">控除（引かれるお金）</p><dl class="ky-rows" data-k="ded"></dl></div>
        <div class="ky-net"><span>差引支給額（手取り）</span><b data-k="net">—</b></div>
        <span class="ky-hanko" data-k="hanko" aria-hidden="true">確認</span>
      </article>
      <div class="ky-dest" data-k="dest" aria-hidden="true">${Y1.rows.map(([n, , s]) => `<span><i>${s}</i>${n}</span>`).join('')}</div>
    </div>
    <div class="ky-side">
      <div class="ky-quiz" data-k="quiz">
        <p class="ky-q-h"><span aria-hidden="true">問</span>2 年目、給料は 1 万円上がって 23 万円に。手取りはどうなる？</p>
        <div class="ky-q-opts">${['1 万円ぐらい増える', '少しだけ増える', '同じか、少し減る'].map((t, i) => `<button type="button" data-q="${i}">${t}</button>`).join('')}</div>
      </div>
      <div class="ky-ans" data-k="ans" hidden></div>
      <div class="ky-tabs" role="tablist" aria-label="何年目の明細"><button type="button" role="tab" data-y="1" aria-selected="false">1 年目の明細</button><button type="button" role="tab" data-y="2" aria-selected="false">2 年目の明細</button></div>
      <div class="ky-try">
        <label class="ky-sl"><span>額面（ひと月の給料）を変えてみる</span><output data-k="g">25 万円</output><input type="range" min="150000" max="500000" step="10000" value="250000" data-s="g"></label>
        <div class="ky-bar" aria-hidden="true"><i data-k="barNet"></i><i class="is-ded" data-k="barDed"></i></div>
        <p class="ky-ratio">手取りは額面の <b data-k="ratio">—</b>（2 年目のたとえ）</p>
      </div>
    </div>
    <div class="ky-keiri"><p class="ky-k-h"><span aria-hidden="true">経</span>経理の仕事：明細を完成させよう<small>あなたは会社の経理係。3 人分の給料明細の「引かれるお金」を計算して、正しい金額をえらぼう。まちがえると 5 秒たされます。</small></p><div class="ky-k-box" data-k="keiri"><button type="button" class="ky-k-go" data-k-a="start">明細づくりをはじめる</button></div></div>
    <div class="ky-learn">
      <p><b>額面と手取り</b>会社が決めた給料（額面）から、保険料や税金が引かれて、残りが口座に入ります。これが手取りです。手取りは、額面のおよそ 8 割ぐらいになることが多いといわれます（<a href="glossary.html#take-home">手取り</a>）。</p>
      <p><b>2 年目の「住民税」</b>住民税は、前の年の収入をもとに、次の年の 6 月ごろから引かれはじめます。そのため、働きはじめた年はほとんど引かれず、2 年目に給料が上がっても手取りが減ることがあります。</p>
      <p><b>引かれたお金は、どこへ？</b>健康保険・年金・雇用保険は、みんなで支え合う保険です（<a href="glossary.html#social-insurance">社会保険料</a>）。所得税は会社が先に引いて国へ納めます（<a href="glossary.html#withholding">源泉徴収</a>）。</p>
      <p><b>明細は、ちゃんと見よう</b>働いた時間・交通費・引かれたお金が合っているかを確かめるのも、働く人の大切な仕事です。アルバイトでも明細をもらったら、目を通そう。</p>
    </div>
    <p class="ky-note">会社・名前・給料・料率・税額は、しくみを知るための「たとえ」です（料率は「約」。実際は、年齢・住む場所・家族・会社などで変わります）。</p>`;
  const K = k => box.querySelector(`[data-k="${k}"]`);
  const print = async (s, label, when) => {
    if (busy) return; busy = true; box.classList.add('is-busy');
    const paper = K('paper'); paper.classList.remove('is-out', 'is-done'); void paper.offsetWidth; paper.classList.add('is-out');
    K('led').classList.add('is-on'); K('title').textContent = '給与明細書（' + label + '）'; K('when').textContent = when;
    K('pay').innerHTML = ''; K('ded').innerHTML = ''; K('net').textContent = '—';
    box.querySelectorAll('.ky-dest span').forEach(x => x.classList.remove('is-hit'));
    await sleep(500);
    K('pay').insertAdjacentHTML('beforeend', `<div class="ky-row is-in"><dt>基本給</dt><dd>${yen(s.gross)}</dd></div>`);
    await sleep(350);
    for (let i = 0; i < s.rows.length; i++) {
      const [n, v, , d] = s.rows[i];
      K('ded').insertAdjacentHTML('beforeend', `<div class="ky-row is-in${!v ? ' is-zero' : ''}${n === '住民税' ? ' is-jumin' : ''}" title="${d}"><dt>${n}</dt><dd>${v ? '− ' + yen(v) : '0 円'}</dd><small>${d}</small></div>`);
      if (v) { const t = box.querySelectorAll('.ky-dest span')[i]; t.classList.remove('is-hit'); void t.offsetWidth; t.classList.add('is-hit'); }
      await sleep(380);
    }
    K('net').textContent = yen(s.net); paper.classList.add('is-done'); K('led').classList.remove('is-on');
    busy = false; box.classList.remove('is-busy');
  };
  const tab = y => { box.querySelectorAll('[data-y]').forEach(b => b.setAttribute('aria-selected', b.dataset.y == y)); return y === 1 ? print(Y1, '1 年目', '2026 年 5 月分') : print(Y2, '2 年目', '2027 年 6 月分'); };
  const tryit = () => {
    const s = slip(gross, gross); K('g').textContent = gross / 10000 + ' 万円';
    const r = s.net / gross; K('barNet').style.width = (r * 100).toFixed(1) + '%'; K('barDed').style.width = ((1 - r) * 100).toFixed(1) + '%';
    K('barNet').textContent = '手取り ' + yen(s.net); K('ratio').textContent = '約 ' + Math.round(r * 100) + '%';
  };
  box.addEventListener('click', async e => {
    const q = e.target.closest('[data-q]');
    if (q && !stage) {
      stage = 1; const ok = q.dataset.q === '2';
      box.querySelectorAll('[data-q]').forEach(b => { b.disabled = true; b.classList.toggle('is-right', b.dataset.q === '2'); b.classList.toggle('is-wrong', b === q && !ok); });
      await tab(1); await sleep(900); await tab(2);
      const diff = Y2.net - Y1.net;
      K('ans').innerHTML = `<p class="ky-a-h">${ok ? '正解！' : 'じつは……'}<small>手取りは ${diff < 0 ? yen(-diff) + ' 減った' : yen(diff) + ' 増えた'}</small></p><p>給料は 1 万円上がったのに、2 年目の 6 月から「住民税」（たとえ ${yen(Y2.rows[4][1])}）が引かれはじめたからです。住民税は、前の年の収入をもとに決まります。</p>`;
      K('ans').hidden = false;
      try { localStorage.setItem('azakei_kyuyo', ok ? 'ok' : '1'); } catch (er) {}
      return;
    }
    const y = e.target.closest('[data-y]'); if (y && !busy) tab(+y.dataset.y);
  });
  box.addEventListener('input', e => { const s = e.target.closest('[data-s="g"]'); if (s) { gross = +s.value; tryit(); } });
  /* ---- v318：経理の仕事「明細を完成させよう」（3 人分の控除を、自分で計算して当てる） ---- */
  const STAFF = [['新人', '麻布 花子', 200000, 0, '1 年目。住民税は、まだ引かれない'], ['3 年目', '六本木 一郎', 280000, 270000, '前の年の給料は 27 万円'], ['課長', '広尾 誠', 420000, 400000, '前の年の給料は 40 万円']];
  const kq = box.querySelector('[data-k="keiri"]');
  let kg = null;
  const kOpts = (s, i) => {
    const g = s.gross, v = s.rows[i][1], ins = s.rows[0][1] + s.rows[1][1] + s.rows[2][1];
    const wrong = [
      [Math.round(g * .09 / 10) * 10, Math.round(g * .005 / 10) * 10, v * 10],
      [Math.round(g * .05 / 10) * 10, Math.round(g * .009 / 10) * 10, v * 10],
      [Math.round(g * .06 / 10) * 10, v * 10, Math.round(g * .0006 / 10) * 10],
      [Math.max(0, Math.round((g - 88000) * .05 / 10) * 10), Math.round(g * .05 / 10) * 10, Math.max(0, Math.round((g - ins) * .05 / 10) * 10)]
    ][i];
    const set = [v]; wrong.forEach(w => { if (w > 0 && !set.includes(w) && set.length < 3) set.push(w); });
    let k = 2; while (set.length < 3) { const w = v + k * 1000; if (!set.includes(w)) set.push(w); k++; }
    return set.sort(() => Math.random() - .5);
  };
  const HINT = ['額面 × 約 5%', '額面 × 約 9%', '額面 × 約 0.6%', '（額面 − 3 つの保険料の合計 − 88,000 円）× 5%'];
  const kDraw = () => {
    const p = STAFF[kg.n], s = kg.s, step = kg.step;
    const line = (i, n) => { const v = s.rows[i][1]; return `<div class="ky-k-row${i === step ? ' is-now' : ''}${i < step ? ' is-ok' : ''}"><dt>${n}</dt><dd>${i < step || i === 4 ? (v ? '− ' + yen(v) : '0 円') : i === step ? '？' : '—'}</dd>${i === step ? `<small>${HINT[i]}</small>` : ''}</div>`; };
    const net = step === 5, opts = net ? kg.netOpts : step < 4 ? kOpts(s, step) : [];
    kq.innerHTML = `<div class="ky-k-top"><p><small>${kg.n + 1} / 3 人目・${p[0]}</small><b>${p[1]} さん</b><span>${p[4]}</span></p><p class="ky-k-clock"><small>時間</small><b data-k="kclock">${kg.t.toFixed(1)} 秒</b><small>まちがい ${kg.miss}</small></p></div>
      <dl class="ky-k-slip"><div class="ky-k-row is-pay"><dt>基本給（額面）</dt><dd>${yen(s.gross)}</dd></div>${s.rows.map((r, i) => line(i, r[0] + (i === 4 ? '（市役所の通知の額）' : ''))).join('')}<div class="ky-k-row is-net${net ? ' is-now' : ''}"><dt>差引支給額（手取り）</dt><dd>？</dd>${net ? '<small>額面 − 控除の合計</small>' : ''}</div></dl>
      <p class="ky-k-q">${net ? '手取りはいくら？' : `${s.rows[step][0]}はいくら？`}</p>
      <div class="ky-k-opts">${opts.map(v => `<button type="button" data-kv="${v}">${yen(v)}</button>`).join('')}</div>`;
  };
  const kNext = () => {
    const p = STAFF[kg.n]; kg.s = slip(p[2], p[3]); kg.step = 0;
    const s = kg.s, ins = s.rows[0][1] + s.rows[1][1] + s.rows[2][1];
    const set = [s.net]; [s.gross - ins, s.net - s.rows[4][1], s.net + s.rows[3][1], s.net - 10000].forEach(w => { if (w > 0 && !set.includes(w) && set.length < 4) set.push(w); });
    kg.netOpts = set.sort(() => Math.random() - .5); kDraw();
  };
  const kStart = () => {
    if (kg) clearInterval(kg.iv); kg = { n: 0, t: 0, miss: 0, t0: performance.now() };
    kg.iv = setInterval(() => { kg.t = (performance.now() - kg.t0) / 1000 + kg.miss * 5; const c = kq.querySelector('[data-k="kclock"]'); if (c) c.textContent = kg.t.toFixed(1) + ' 秒'; }, 100);
    kNext();
  };
  const kEnd = () => {
    clearInterval(kg.iv); const t = (performance.now() - kg.t0) / 1000 + kg.miss * 5;
    const rank = kg.miss === 0 && t < 90 ? ['ベテラン経理', 'まちがいなし、しかも速い。会社のみんなの給料を任せられます。'] : kg.miss <= 2 ? ['一人前の経理', 'ほぼ正確。ひっかけに気づけました。'] : ['経理の見習い', 'まちがえやすいのは「保険料を引いてから税金を計算する」ところ。もう一度ためそう。'];
    let best = 0; try { best = +localStorage.getItem('azakei_kyuyo_keiri') || 0; if (!best || t < best) localStorage.setItem('azakei_kyuyo_keiri', t.toFixed(1)); } catch (e) {}
    kq.innerHTML = `<div class="ky-k-end"><p class="ky-k-rk">${rank[0]}</p><p>3 人分の明細を完成。時間 <b>${t.toFixed(1)} 秒</b>（まちがい ${kg.miss} 回 × 5 秒をふくむ）${best && t >= best ? `・自己ベスト ${best} 秒` : '・自己ベスト更新'}</p><p>${rank[1]}</p><p class="ky-k-tip">ポイント：所得税は、額面からそのままではなく、健康保険・厚生年金・雇用保険を引いた残りにかかります。住民税は前の年の収入で決まるので、1 年目の人は 0 円でした。</p><button type="button" class="ky-k-go" data-k-a="start">もう一度</button></div>`;
    try { if (!localStorage.getItem('azakei_kyuyo')) localStorage.setItem('azakei_kyuyo', '1'); } catch (e) {}
    window.AZAKEI_TALK && window.AZAKEI_TALK(kq.querySelector('.ky-k-end') || kq, 'kyuyo', kg.miss === 0 && t < 90 ? 'top' : kg.miss <= 2 ? 'mid' : 'low');
  };
  kq.addEventListener('click', e => {
    if (e.target.closest('[data-k-a="start"]')) { kStart(); return; }
    const b = e.target.closest('[data-kv]'); if (!b || !kg || b.disabled) return;
    const v = +b.dataset.kv, s = kg.s, right = kg.step === 5 ? s.net : s.rows[kg.step][1];
    if (v !== right) { kg.miss++; b.disabled = true; b.classList.add('is-ng'); return; }
    b.classList.add('is-ok');
    setTimeout(() => {
      kg.step++; if (kg.step === 4) kg.step = 5;
      if (kg.step > 5) { kg.n++; if (kg.n >= STAFF.length) return kEnd(); return kNext(); }
      kDraw();
    }, reduce ? 0 : 260);
  });
  tryit();
  print(Y1, '1 年目', '2026 年 5 月分');
})();
