/* ================================================================
   kuji.js — 経済ラボ：くじ引きの期待値（1 回 300 円のくじ。平均すると、いくら戻ってくる？）
   ・予想してから 100 回引くと、1 回あたりの平均がだんだん「期待値」に近づいていく（大数の法則）
   ・賞金と確率は「たとえ」。期待値 = 3,000×1% + 1,000×5% + 300×20% = 140 円
   ================================================================ */
(function() {
  const box = document.querySelector('[data-kuji]');
  if (!box) return;
  const PRICE = 300, N = 100;
  // [名前, 賞金, 確率(%), 色]
  const P = [['1 等', 3000, 1, '#d49a2a'], ['2 等', 1000, 5, '#b5432f'], ['3 等', 300, 20, '#2f6b3a'], ['はずれ', 0, 74, '#8a8172']];
  const EV = P.reduce((s, p) => s + p[1] * p[2] / 100, 0);
  const yen = n => Math.round(n).toLocaleString('ja-JP') + ' 円';
  const W = 720, H = 170, MAX = 600;
  const y = v => H - Math.min(v, MAX) / MAX * H;
  box.innerHTML = `
    <div class="kj-board">
      <p class="kj-k">文化祭のくじ　1 回 <b>${PRICE} 円</b></p>
      <table class="kj-table"><tbody>${P.map(p => `<tr><th><i style="background:${p[3]}"></i>${p[0]}</th><td>${p[1] ? yen(p[1]) : '—'}</td><td>${p[2]}%</td></tr>`).join('')}</tbody></table>
    </div>
    <div class="kj-guess" data-o="guess">
      <p class="kj-q">1 回引くと、<b>平均でいくら</b>戻ってくると思う？</p>
      <div class="kj-opts">${[80, 140, 300, 450].map(v => `<button type="button" data-g="${v}">${yen(v)}</button>`).join('')}</div>
    </div>
    <div class="kj-run" data-o="run" hidden>
      <div class="kj-balls" data-o="balls" aria-hidden="true"></div>
      <svg class="kj-chart" viewBox="0 0 ${W} ${H + 16}" role="img" aria-label="1 回あたりの平均のうつりかわり">
        <line x1="0" x2="${W}" y1="${y(PRICE)}" y2="${y(PRICE)}" class="kj-price"/><text x="${W - 2}" y="${y(PRICE) - 4}" text-anchor="end" class="kj-lb">くじの値段 300 円</text>
        <line x1="0" x2="${W}" y1="${y(EV)}" y2="${y(EV)}" class="kj-ev" data-o="evline"/><text x="${W - 2}" y="${y(EV) + 13}" text-anchor="end" class="kj-lb kj-evt" data-o="evtext">期待値 ${yen(EV)}</text>
        <polyline class="kj-avg" data-o="line" points=""/>
      </svg>
      <div class="kj-stats"><p><span>引いた回数</span><b data-o="n">0</b></p><p><span>1 回あたりの平均</span><b data-o="avg">—</b></p><p><span>使ったお金と、戻ったお金の差</span><b data-o="diff">—</b></p></div>
      <p class="kj-note" data-o="note"></p>
      <button type="button" class="btn-primary kj-again" hidden>もう 100 回</button>
    </div>
    <p class="in-foot">※ 賞金と確率は、しくみを見るための「たとえ」です。</p>`;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('is-lite');
  let guess = 0, timer;
  const draw1 = () => { let r = Math.random() * 100; for (const p of P) { if ((r -= p[2]) < 0) return p; } return P[3]; };
  const run = () => {
    clearInterval(timer);
    let n = 0, got = 0; const pts = [];
    $('balls').innerHTML = ''; box.querySelector('.kj-again').hidden = true; $('note').innerHTML = '';
    box.classList.remove('is-shown');
    const step = () => {
      const p = draw1(); n++; got += p[1];
      const b = document.createElement('i'); b.style.background = p[3]; b.title = p[0]; if (p[1] >= 1000) b.className = 'is-big'; $('balls').appendChild(b);
      pts.push(`${(n / N * W).toFixed(1)},${y(got / n).toFixed(1)}`);
      $('line').setAttribute('points', pts.join(' '));
      $('n').textContent = n; $('avg').textContent = yen(got / n);
      const d = got - PRICE * n; $('diff').textContent = (d >= 0 ? '+' : '−') + yen(Math.abs(d)); $('diff').className = d >= 0 ? 'is-up' : 'is-down';
      if (n >= N) {
        clearInterval(timer);
        box.classList.add('is-shown');
        const near = Math.abs(guess - EV) < 1;
        $('note').innerHTML = `${near ? '<b>予想ぴったり！</b> ' : `予想は ${yen(guess)}。`}賞金 × 確率 を足すと、<b>期待値は ${yen(EV)}</b>（3,000×1% ＋ 1,000×5% ＋ 300×20%）。引くほど、平均はこの線に近づいていきます（大数の法則）。<br>300 円のくじで平均 140 円しか戻らないので、<b>1 回あたり平均 160 円</b>はお店の取り分。たまに大当たりしても、たくさん引くほど、くじを売る側がもうかるしくみです。`;
        box.querySelector('.kj-again').hidden = false;
      }
    };
    if (reduce) { for (let i = 0; i < N; i++) step(); } else timer = setInterval(step, 40);
  };
  box.addEventListener('click', e => {
    const g = e.target.closest('[data-g]');
    if (g) {
      guess = +g.dataset.g;
      box.querySelectorAll('[data-g]').forEach(x => x.classList.toggle('is-on', x === g));
      $('run').hidden = false; run();
      return;
    }
    if (e.target.closest('.kj-again')) run();
  });
})();

/* ================================================================
   v341：くじ屋さんの店主になる「文化祭のくじ屋」
   ・100 枚のくじの箱を、午前・昼・午後の 3 回つくる。決めるのは 値段・1 等の賞金・1 等/2 等/3 等の本数
   ・来るお客さんの数は「値段の安さ」「1 等の豪華さ」「当たりの多さ」「評判」で決まる（たとえの計算）
   ・お客さんは箱から 1 枚ずつ引く（引いたくじは箱にもどらない）。売上 − 出た賞金 ＝ もうけ
   ・1 枚あたりの期待値が値段にくらべて低すぎると「当たらない」とうわさになり、次の回の評判が下がる
   ・自己ベスト（3 回のもうけの合計）は azakei_kuji_best
   ================================================================ */
(function () {
  const box = document.querySelector('[data-kuji]');
  if (!box) return;
  if (!document.querySelector('link[href^="kjgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'kjgame.css?v=20261128c'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_kuji_best';
  const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const yen = n => Math.round(n).toLocaleString('ja-JP') + ' 円';
  const g = document.createElement('div');
  g.className = 'kg';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="kg-sub"><span aria-hidden="true">験</span>じっくりためす：お客さんの側で、100 回引いてみる</p>');
  /* 決められること */
  const PRICE = [100, 200, 300, 500];
  const BASE = { 100: 100, 200: 80, 300: 60, 500: 24 };       // 値段だけで考えたときの、引きたい人の数（たとえ）
  const TOP = [1000, 3000, 5000, 10000];
  const P2 = 500, P3 = 100;                                   // 2 等は 500 円の図書カード、3 等は 100 円のお菓子（たとえ）
  const ROUND = [['午前', 1, '開場したばかり。お客さんは、ふつう。'], ['昼', 1.3, 'お昼どき。会場がいちばんにぎわう時間。'], ['午後', 0.8, '小雨が降ってきた。外を歩く人が少なめ。']];
  let S, cur;
  const fresh = () => ({ price: 300, top: 3000, k1: 1, k2: 5, k3: 20 });
  const ev = c => (c.top * c.k1 + P2 * c.k2 + P3 * c.k3) / 100;
  const win = c => (c.k1 + c.k2 + c.k3) / 100;
  const demand = (c, r) => {
    const mTop = 1 + 0.15 * Math.log2(c.top / 1000) + 0.08 * (c.k1 - 1);
    const mWin = 0.6 + 0.8 * Math.min(win(c), 0.5) / 0.5;
    return BASE[c.price] * mTop * mWin * S.rep * ROUND[r][1];
  };
  const start = () => { S = { r: 0, rep: 1, total: 0, log: [] }; cur = fresh(); plan(); };
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="kg-intro">
      <div class="kg-box-art" aria-hidden="true"><b>籤</b><i></i><i></i><i></i></div>
      <div><p class="kg-kicker">店主になる</p><h3 class="kg-h">文化祭のくじ屋</h3>
      <p class="kg-p">こんどは、くじを売る側です。100 枚のくじの箱を、午前・昼・午後の 3 回つくります。値段と、1 等・2 等・3 等の本数を決めると、お客さんが来て 1 枚ずつ引いていきます。賞金を出しすぎると赤字。でも、当たらないくじは評判が落ちて、お客さんが来なくなります。</p>
      <p class="kg-best">${b ? `自己ベスト <b>${yen(b)}</b>` : 'はじめての出店'}</p>
      <button type="button" class="kg-go" data-kg="start">お店をひらく</button></div></div>`;
  };
  const seg = (name, list, val, fmt) => `<div class="kg-seg" role="group" aria-label="${name}">${list.map(v => `<button type="button" data-set="${name}" data-v="${v}" aria-pressed="${v === val}">${fmt(v)}</button>`).join('')}</div>`;
  const step = (name, val, min, max, unit) => `<div class="kg-step"><button type="button" data-st="${name}" data-d="-1" aria-label="${unit}を減らす"${val <= min ? ' disabled' : ''}>−</button><b>${val}</b><small>本</small><button type="button" data-st="${name}" data-d="1" aria-label="${unit}を増やす"${val >= max ? ' disabled' : ''}>＋</button></div>`;
  const stars = n => { const k = Math.max(1, Math.min(5, Math.round(n))); return '★★★★★'.slice(0, k) + '☆☆☆☆☆'.slice(0, 5 - k); };
  const plan = () => {
    const c = cur, e = ev(c), rate = e / c.price, d = demand(c, S.r), sum = c.top * c.k1 + P2 * c.k2 + P3 * c.k3;
    const R = ROUND[S.r];
    g.innerHTML = `<div class="kg-plan">
      <div class="kg-top"><span class="kg-n">${S.r + 1} / 3</span><b class="kg-when">${R[0]}</b><span class="kg-ev">${R[2]}</span><span class="kg-rep">評判 <i>${stars(S.rep * 3.2)}</i> ${Math.round(S.rep * 100)} 点</span><span class="kg-tot">もうけの合計 <b>${yen(S.total)}</b></span></div>
      <div class="kg-grid">
        <div class="kg-ctl">
          <p class="kg-l">1 回の値段</p>${seg('price', PRICE, c.price, v => `${v} 円`)}
          <p class="kg-l">1 等の賞金</p>${seg('top', TOP, c.top, v => v.toLocaleString() + ' 円')}
          <div class="kg-rows">
            <div><p class="kg-l"><i class="kg-c1"></i>1 等（${c.top.toLocaleString()} 円）</p>${step('k1', c.k1, 1, 3, '1 等の本数')}</div>
            <div><p class="kg-l"><i class="kg-c2"></i>2 等（500 円の図書カード）</p>${step('k2', c.k2, 0, 15, '2 等の本数')}</div>
            <div><p class="kg-l"><i class="kg-c3"></i>3 等（100 円のお菓子）</p>${step('k3', c.k3, 0, 40, '3 等の本数')}</div>
          </div>
        </div>
        <div class="kg-calc">
          <p class="kg-l">この箱の計算</p>
          <p class="kg-eq">賞金の合計 <b>${yen(sum)}</b> ÷ 100 枚 ＝ 1 枚あたり <b class="kg-evb">${yen(e)}</b></p>
          <div class="kg-meter" aria-hidden="true"><i style="width:${Math.min(100, rate * 100).toFixed(0)}%"></i><span style="left:45%"></span></div>
          <p class="kg-rate">お客さんにもどる割合（値段の何 %）<b>${Math.round(rate * 100)}%</b>${rate < 0.3 ? '<em class="is-ng">当たらないと、うわさになりそう</em>' : rate < 0.45 ? '<em class="is-ng">評判が少し下がりそう</em>' : rate > 0.8 ? '<em class="is-ng">賞金を出しすぎかも</em>' : '<em>評判が上がりそう</em>'}</p>
          <p class="kg-pre">当たりの本数 <b>${c.k1 + c.k2 + c.k3} / 100</b>　来そうなお客さん <b>約 ${Math.min(100, Math.round(d))} 人</b>${d > 100 ? '（箱が売り切れ）' : ''}</p>
          <p class="kg-pre">全部の人が平均どおりに当たると、もうけは約 <b>${yen(Math.min(100, d) * (c.price - e))}</b></p>
          <button type="button" class="kg-go" data-kg="open">この箱で売る</button>
        </div>
      </div></div>`;
  };
  /* 売る：お客さんが 1 人ずつ引く。箱の 100 マスが、引かれた順にめくれる */
  const sell = () => {
    const c = { ...cur }, R = ROUND[S.r];
    const n = Math.min(100, Math.round(demand(c, S.r) * (0.9 + Math.random() * 0.2)));
    const tix = [];
    for (let i = 0; i < c.k1; i++) tix.push(1);
    for (let i = 0; i < c.k2; i++) tix.push(2);
    for (let i = 0; i < c.k3; i++) tix.push(3);
    while (tix.length < 100) tix.push(0);
    for (let i = tix.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [tix[i], tix[j]] = [tix[j], tix[i]]; }
    const PR = [0, c.top, P2, P3];
    g.innerHTML = `<div class="kg-sell">
      <div class="kg-top"><span class="kg-n">${S.r + 1} / 3</span><b class="kg-when">${R[0]}</b><span class="kg-ev">1 回 ${c.price} 円</span></div>
      <div class="kg-sgrid">
        <div class="kg-board" aria-hidden="true">${tix.map(() => '<i></i>').join('')}</div>
        <div class="kg-live">
          <p><span>お客さん</span><b><span data-kg="n">0</span> 人</b></p>
          <p><span>売上</span><b data-kg="in">0 円</b></p>
          <p><span>出た賞金</span><b data-kg="out">0 円</b></p>
          <p class="kg-net"><span>もうけ</span><b data-kg="net">0 円</b></p>
          <p class="kg-shout" data-kg="shout" aria-live="polite"></p>
        </div>
      </div></div>`;
    const cells = g.querySelectorAll('.kg-board i'), $ = k => g.querySelector(`[data-kg="${k}"]`);
    let i = 0, got = 0, hits = [0, 0, 0, 0];
    const tick = () => {
      if (i < n) {
        const t = tix[i]; got += PR[t]; hits[t]++;
        cells[i].className = 'is-t' + t;
        i++;
        $('n').textContent = i; $('in').textContent = yen(i * c.price); $('out').textContent = yen(got);
        const net = i * c.price - got; $('net').textContent = yen(net); $('net').classList.toggle('is-ng', net < 0);
        if (t === 1) { $('shout').textContent = `${i} 人目が 1 等！ ${yen(c.top)}`; $('shout').classList.remove('is-pop'); void $('shout').offsetWidth; $('shout').classList.add('is-pop'); }
        setTimeout(tick, reduce ? 0 : t === 1 ? 700 : 45);
      } else done(c, n, got, hits);
    };
    setTimeout(tick, reduce ? 0 : 400);
  };
  const VOICE = (rate, w, c) => {
    const v = [];
    if (rate < 0.3) v.push('「ぜんぜん当たらないよ…」'); else if (rate > 0.7) v.push('「すごく当たる！ また来よう」'); else v.push('「ほどほどに当たって、楽しかった」');
    if (c.top >= 5000) v.push('「1 等が豪華で、つい引いちゃった」');
    if (w >= 0.3) v.push('「お菓子でも、当たるとうれしい」'); else if (w < 0.1) v.push('「はずればっかり…」');
    if (c.price >= 500) v.push('「1 回 500 円は、ちょっと高いかな」');
    return v.slice(0, 3);
  };
  const done = (c, n, got, hits) => {
    const e = ev(c), rate = e / c.price, net = n * c.price - got, before = S.rep;
    S.rep = Math.max(0.5, Math.min(1.3, S.rep + (rate - 0.45) * 1.6));
    S.total += net;
    S.log.push({ when: ROUND[S.r][0], price: c.price, n, net, rate, hits });
    const last = S.r === 2, left = c.k1 + c.k2 + c.k3 - hits[1] - hits[2] - hits[3];
    g.querySelector('.kg-live').insertAdjacentHTML('beforeend', `<div class="kg-after">
      <p class="kg-hits">出た当たり：1 等 ${hits[1]}・2 等 ${hits[2]}・3 等 ${hits[3]}（${n} 人中）</p>
      <ul class="kg-voice">${VOICE(rate, win(c), c).map(v => `<li>${v}</li>`).join('')}</ul>
      <p class="kg-repc">評判 ${Math.round(before * 100)} 点 → <b>${Math.round(S.rep * 100)} 点</b>${S.rep < before - 0.005 ? '（下がった）' : S.rep > before + 0.005 ? '（上がった）' : ''}</p>
      ${n < 100 ? `<p class="kg-note">売れ残りは ${100 - n} 枚${left > 0 ? `（まだ当たりが ${left} 本入っています）` : ''}。全部売れたら、もうけは ${yen(100 * c.price - (c.top * c.k1 + P2 * c.k2 + P3 * c.k3))} でした。</p>` : ''}
      <button type="button" class="kg-go" data-kg="${last ? 'end' : 'next'}">${last ? '3 回の結果を見る' : `次は「${ROUND[S.r + 1][0]}」の箱`}</button></div>`);
  };
  const TITLE = [[52000, 'くじ屋の名店主'], [44000, 'お客さんに愛される店主'], [34000, '一人前の店主'], [18000, '見習い店主'], [-1e9, 'これからの店主']];
  const finish = () => {
    const prev = getB(), best = S.total > prev;
    if (best) { try { localStorage.setItem(KEY, String(S.total)); } catch (e) {} }
    g.innerHTML = `<div class="kg-end">
      <p class="kg-kicker">閉店</p>
      <p class="kg-big"><small>3 回のもうけ</small><b>${yen(S.total)}</b></p>
      <p class="kg-title"><span aria-hidden="true">称</span>${TITLE.find(x => S.total >= x[0])[1]}${best ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${yen(prev)}</small>` : ''}</p>
      <table class="kg-tab"><thead><tr><th>回</th><th>値段</th><th>お客さん</th><th>もどる割合</th><th>もうけ</th></tr></thead><tbody>${S.log.map(x => `<tr><th>${x.when}</th><td>${x.price} 円</td><td>${x.n} 人</td><td>${Math.round(x.rate * 100)}%</td><td class="${x.net < 0 ? 'is-ng' : ''}">${yen(x.net)}</td></tr>`).join('')}</tbody></table>
      <div class="kg-learn"><p><b>くじは、売る側が必ず「平均では」もうかるように作られています。</b>1 枚あたりの期待値（賞金の合計 ÷ 枚数）は、値段より低くなります。その差が、お店のもうけです。</p>
      <p>でも、もどる割合を下げすぎると、お客さんは来なくなります。宝くじは、法律で、賞金の合計が売上の半分をこえないように決められています。買う人にとっては、平均すると払ったお金の半分以下しかもどらない、ということです。</p></div>
      <button type="button" class="kg-go" data-kg="start">もう一度出店する</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(g, 'kuji', TITLE.findIndex(x => S.total >= x[0]), TITLE.length);
  };
  g.addEventListener('click', e => {
    const s = e.target.closest('[data-set]');
    if (s) { cur[s.dataset.set] = +s.dataset.v; plan(); return; }
    const st = e.target.closest('[data-st]');
    if (st && !st.disabled) {
      const k = st.dataset.st, d = +st.dataset.d * (k === 'k3' ? 5 : 1);
      const lim = { k1: [1, 3], k2: [0, 15], k3: [0, 40] }[k];
      cur[k] = Math.max(lim[0], Math.min(lim[1], cur[k] + d));
      plan(); g.querySelector(`[data-st="${k}"][data-d="${st.dataset.d}"]`)?.focus({ preventScroll: true });
      return;
    }
    const a = e.target.closest('[data-kg]'); if (!a) return;
    const k = a.dataset.kg;
    if (k === 'start') start();
    else if (k === 'open') sell();
    else if (k === 'next') { S.r++; plan(); g.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); }
    else if (k === 'end') finish();
  });
  intro();
})();
