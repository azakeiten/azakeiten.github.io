/* ================================================================
   zeidan.js — あそび場：税の階段（所得税の累進課税・近づいてから読みこむ）
   ・所得税の税率は、課税所得（収入から控除を引いた額）が多いほど上がる 7 段（5%〜45%、国税庁の税率表）
   ・高い税率がかかるのは「その段をこえた部分だけ」。階段にコインがたまり、税の部分が赤くなる
   ・平均の税率といちばん上の税率をくらべる。「全部に高い税率」というまちがった考えも、グラフで見せる
   ・上に「勝負：手取りはいくら増える？」（8 問・1 問 15 秒）。答えると下の階段がその昇給の分だけ動く。自己ベストは azakei_zeidan_best
   ・復興特別所得税（2.1%）や住民税はふくめない（説明だけ）。見た目は zeidan.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-zeidan]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="zeidan.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'zeidan.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 段のさかい（万円）と税率。いちばん上の段は、図では 6,000 万円までを見せる
  const B = [0, 195, 330, 695, 900, 1800, 4000, 6000], R = [5, 10, 20, 23, 33, 40, 45];
  const man = v => (Math.round(v * 10) / 10).toLocaleString() + ' 万円';
  const inc = v => { const i = Math.min(6, Math.floor(v)), f = v - i; return B[i] + f * (B[i + 1] - B[i]); };   // スライダー（0〜7）→ 課税所得
  const pos = x => { for (let i = 0; i < 7; i++) if (x <= B[i + 1]) return i + (x - B[i]) / (B[i + 1] - B[i]); return 7; };
  const tax = x => R.reduce((s, r, i) => s + Math.max(0, Math.min(x, B[i + 1] === 6000 ? Infinity : B[i + 1]) - B[i]) * r / 100, 0);
  const top = x => { for (let i = 0; i < 6; i++) if (x <= B[i + 1]) return R[i]; return R[6]; };
  const wrong = x => x * top(x) / 100;

  const W = 700, H = 314, X0 = 40, SW = 90, BASE = 270;
  box.innerHTML = `<div class="zd-game"></div>
    <div class="zd-stage">
      <svg class="zd-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="所得税の 7 段の階段。課税所得が、低い段から順にたまっていく">
        <defs><pattern id="zd-coin" width="12" height="8" patternUnits="userSpaceOnUse"><rect width="12" height="8" fill="#e3b341"/><path d="M0 7.5 H12" stroke="#a77b16" stroke-width="1"/></pattern></defs>
        ${R.map((r, i) => { const x = X0 + i * SW, h = 40 + r * 4.6; return `<g class="zd-step" data-i="${i}"><rect class="zd-wall" x="${x}" y="${BASE - h}" width="${SW - 6}" height="${h}" rx="4"/><rect class="zd-keep" x="${x + 3}" y="${BASE}" width="${SW - 12}" height="0" data-h="${h - 6}"/><rect class="zd-tax" x="${x + 3}" y="${BASE}" width="${SW - 12}" height="0"/><text class="zd-rate" x="${x + (SW - 6) / 2}" y="${BASE - h - 10}">${r}%</text><text class="zd-range" x="${x + (SW - 6) / 2}" y="${BASE + 18}">${i < 6 ? `${B[i]}〜${B[i + 1]}` : '4000〜'}</text></g>`; }).join('')}
        <text class="zd-unit" x="${X0}" y="${BASE + 34}">課税所得（万円）の段</text>
        <g class="zd-flag"><line y1="0" y2="-26"/><path d="M0 -26 h34 l-6 7 l6 7 h-34 Z"/><text x="16" y="-15">ここまで</text></g>
      </svg>
      <div class="zd-ctrl">
        <label class="zd-slider"><span>課税所得</span><output data-k="x">500 万円</output><input type="range" min="0" max="7" step="any" value="${pos(500)}" aria-label="課税所得"></label>
        <div class="zd-pre">${[200, 500, 1000, 3000, 5000].map(v => `<button type="button" data-v="${v}">${v.toLocaleString()} 万円</button>`).join('')}</div>
      </div>
    </div>
    <div class="zd-side">
      <ul class="zd-read">
        <li><small>所得税</small><b data-k="tax">—</b></li>
        <li class="is-avg"><small>平均の税率（所得税 ÷ 課税所得）</small><b data-k="avg">—</b></li>
        <li class="is-top"><small>いちばん上の段の税率</small><b data-k="top">—</b></li>
      </ul>
      <p class="zd-msg" data-k="msg" aria-live="polite"></p>
      <svg class="zd-chart" viewBox="0 0 320 170" role="img" aria-label="課税所得と所得税のグラフ"></svg>
      <label class="zd-sw"><input type="checkbox" data-wrong><span></span>まちがった考え「全部に、いちばん上の税率」も重ねる</label>
    </div>
    <div class="zd-learn">
      <p><b>累進課税</b>所得が多い人ほど、高い税率がかかるしくみ。でも高い税率がかかるのは、その段をこえた部分だけです。だから、所得が少しふえて税率の段が上がっても、手元に残るお金が減ることはありません（<a href="glossary.html#progressive-tax">累進課税</a>）。</p>
      <p><b>課税所得とは</b>収入（給料など）から、いろいろな「控除」を引いた残りの額。税率をかけるのは、この課税所得です。給料の額そのものではありません。</p>
      <p><b>ほかの税</b>このほかに、所得税の 2.1% にあたる復興特別所得税（2037 年まで）と、住む市町村などに払う住民税（多くは約 10%）があります。ここでは所得税だけを計算しています（<a href="glossary.html#tax">税金</a>）。</p>
      <p><b>なぜ段々にするの？</b>余裕のある人に多めに負担してもらい、そのお金を社会保障などに回して、くらしの差を小さくするためです（<a href="glossary.html#redistribution">所得の再分配</a>）。</p>
    </div>
    <p class="zd-note">税率は、国税庁の所得税の税率表（課税所得 1,000 円から）にもとづいています。計算は万円単位のおおまかなもので、実際の申告とは端数などがちがいます。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const range = box.querySelector('.zd-slider input'), chart = box.querySelector('.zd-chart'), flag = box.querySelector('.zd-flag');
  const steps = [...box.querySelectorAll('.zd-step')];
  let showWrong = false;

  const drawChart = x => {
    const Xc = v => 24 + v / 7 * 286, maxT = tax(6000), Yc = t => 150 - t / maxT * 136;
    let s = `<line class="zd-c-ax" x1="24" x2="312" y1="150" y2="150"/><line class="zd-c-ax" x1="24" x2="24" y1="10" y2="150"/>`;
    for (let i = 1; i < 7; i++) s += `<line class="zd-c-g" x1="${Xc(i)}" x2="${Xc(i)}" y1="10" y2="150"/>`;
    const pts = [], wpts = [];
    for (let v = 0; v <= 7.0001; v += .05) { const x2 = inc(Math.min(7, v)); pts.push(`${Xc(v).toFixed(1)},${Yc(tax(x2)).toFixed(1)}`); }
    if (showWrong) for (let i = 0; i < 7; i++) { const a = i + .001, b = i + .999; wpts.push(`${Xc(a).toFixed(1)},${Yc(wrong(inc(a))).toFixed(1)} ${Xc(b).toFixed(1)},${Yc(Math.min(maxT * 1.05, wrong(inc(b)))).toFixed(1)}`); }
    if (showWrong) s += wpts.map(p => `<polyline class="zd-c-w" points="${p}"/>`).join('');
    s += `<polyline class="zd-c-r" points="${pts.join(' ')}"/>`;
    const v = pos(x); s += `<circle class="zd-c-pt" cx="${Xc(v).toFixed(1)}" cy="${Yc(tax(x)).toFixed(1)}" r="5"/>`;
    s += `<text class="zd-c-t" x="28" y="20">所得税</text><text class="zd-c-t is-x" x="312" y="166">課税所得 →</text>`;
    chart.innerHTML = s;
  };
  const update = () => {
    const v = +range.value, x = inc(v), t = tax(x), r = top(x), avg = x ? t / x * 100 : 0;
    K('x').textContent = man(x); K('tax').textContent = man(t); K('avg').textContent = avg.toFixed(1) + '%'; K('top').textContent = (x ? r : 0) + '%';
    steps.forEach((g, i) => {
      const keep = g.querySelector('.zd-keep'), tx = g.querySelector('.zd-tax'), full = +keep.dataset.h;
      const part = Math.max(0, Math.min(1, (x - B[i]) / (B[i + 1] - B[i])));
      const h = full * part, th = h * R[i] / 100;
      keep.setAttribute('y', (BASE - 3 - h).toFixed(1)); keep.setAttribute('height', Math.max(0, h - th).toFixed(1));
      tx.setAttribute('y', (BASE - 3 - h).toFixed(1)); tx.setAttribute('height', th.toFixed(1));
      g.classList.toggle('is-on', part > 0); g.classList.toggle('is-top', i === Math.min(6, Math.floor(v)) && x > 0);
    });
    const cur = Math.min(6, Math.floor(v));
    flag.setAttribute('transform', `translate(${(X0 + cur * SW + Math.min(1, v - cur) * (SW - 6)).toFixed(1)} ${(BASE - 40 - R[cur] * 4.6 - 30).toFixed(1)})`);
    let m = `課税所得 ${man(x)} のとき、所得税は ${man(t)}。`;
    if (x > 195) m += ` いちばん上の段は ${r}% ですが、それがかかるのは ${man(B[cur])} をこえた ${man(x - B[cur])} だけ。全体の平均では ${avg.toFixed(1)}% です。`;
    else m += ' いちばん下の段なので、全部に 5% です。';
    K('msg').textContent = m;
    drawChart(x);
  };
  range.addEventListener('input', update);
  box.addEventListener('click', e => {
    const p = e.target.closest('[data-v]'); if (!p) return;
    const to = pos(+p.dataset.v), from = +range.value;
    if (reduce) { range.value = to; update(); return; }
    const t0 = performance.now();
    const f = now => { const k = Math.min(1, (now - t0) / 700), e2 = 1 - Math.pow(1 - k, 3); range.value = from + (to - from) * e2; update(); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
    try { localStorage.setItem('azakei_zeidan', '1'); } catch (err) {}
  });
  box.querySelector('[data-wrong]').addEventListener('change', e => { showWrong = e.target.checked; update(); try { localStorage.setItem('azakei_zeidan', '1'); } catch (err) {} });
  range.addEventListener('change', () => { try { localStorage.setItem('azakei_zeidan', '1'); } catch (err) {} });
  update();

  /* ---- 勝負：手取りはいくら増える？（8 問・1 問 15 秒） ----
     昇給で段をまたぐとき、手取りがいくら増えるかを 4 つからえらぶ。下の階段が、その人の昇給の分だけ動いて答え合わせ。
     まちがいの選びかたは「全部に高い税率」「税を忘れる」「前の段の税率のまま」。点＝正解 100＋早さ（最大 60）、続けると倍率 */
  const game = box.querySelector('.zd-game'), GT = 15, GB = 'azakei_zeidan_best';
  const yen = v => Math.round(v * 10000).toLocaleString() + ' 円';
  const sgn = v => (v < 0 ? '−' : '＋') + yen(Math.abs(v));
  const snap = v => Math.round(v / 5) * 5;
  const ROLE = [['新', '新人の会社員'], ['店', 'お店の店長'], ['看', '看護師'], ['技', 'エンジニア'], ['職', '大工の親方'], ['医', 'お医者さん'], ['社', '会社の社長'], ['作', '人気の作家']];
  const PLAN = [[150, 180, 0], [175, 235, 0], [300, 370, 1], [640, 730, 2], [680, 705, 'pair'], [860, 960, 3], [1720, 1900, 4], [3850, 4300, 5]];
  let G = null, gbest = 0; try { gbest = +localStorage.getItem(GB) || 0; } catch (e) {}
  const glide = (to, ms = 900) => new Promise(res => {
    const from = +range.value, p = pos(to);
    if (reduce) { range.value = p; update(); return res(); }
    const t0 = performance.now();
    const f = now => { const k = Math.min(1, (now - t0) / ms), e2 = 1 - Math.pow(1 - k, 3); range.value = from + (p - from) * e2; update(); if (k < 1) requestAnimationFrame(f); else res(); };
    requestAnimationFrame(f);
  });
  const ginto = () => {
    game.innerHTML = `<div class="zg-intro"><span class="zg-seal" aria-hidden="true">勝</span><div class="zg-it"><p class="zg-k">8 問勝負・1 問 15 秒</p><p class="zg-t">この昇給、手取りはいくら増える？</p><p class="zg-d">8 人の昇給を見て、手取り（所得税を引いたあと）がいくら増えるかを 4 つからえらぶ。段をまたぐと、ひっかけが待っています。答えるたびに、下の階段が動いて答え合わせ。</p></div><div class="zg-go">${gbest ? `<p>自己ベスト <b>${gbest.toLocaleString()}</b> 点</p>` : ''}<button type="button" class="zg-start">勝負する</button></div></div>`;
  };
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const mkQ = n => {
    const [a0, b0, ri] = PLAN[n], A = Math.max(60, snap(a0 + (Math.random() * 30 - 15))), B = snap(b0 + (Math.random() * 30 - 15));
    if (ri === 'pair') {
      const lo = snap(690 + (Math.random() * 10 - 5)), hi = 700 + (Math.random() * 3 | 0) * 5;
      return { kind: 'pair', A: lo, B: hi, role: ROLE[3], ch: shuffle([['a', `A 社（課税所得 ${lo} 万円）`], ['b', `B 社（課税所得 ${hi} 万円）`], ['s', '手取りは同じ']]), ok: 'b' };
    }
    const d = B - A, right = d - (tax(B) - tax(A)), all = B * (1 - top(B) / 100) - A * (1 - top(A) / 100), old = d * (1 - top(A) / 100);
    const seen = new Set([right.toFixed(2)]), ch = [['ok', right]];
    [['all', all], ['none', d], ['old', old], ['hi', d * (1 - (top(B) + 7) / 100)], ['half', right - d * .05]].forEach(([k, v]) => { if (ch.length < 4 && !seen.has(v.toFixed(2))) { seen.add(v.toFixed(2)); ch.push([k, v]); } });
    return { kind: 'raise', A, B, d, role: ROLE[n], ch: shuffle(ch.map(([k, v]) => [k, v < 0 ? `手取りは ${yen(-v)} 減る` : `${yen(v)} 増える`])), ok: 'ok', right };
  };
  const gstart = () => { G = { n: 0, score: 0, combo: 0, ok: 0, all: 0, none: 0, old: 0, timer: 0 }; gq(); };
  const gq = async () => {
    const q = G.q = mkQ(G.n); G.lock = 1;
    game.innerHTML = `<div class="zg-play"><div class="zg-hud"><p>${G.n + 1}<small> / 8 問</small></p><div class="zg-bar"><i></i></div><p class="zg-sc"><b>${G.score.toLocaleString()}</b><small>点</small>${G.combo >= 2 ? `<em>×${(1 + Math.min(G.combo - 1, 4) * .1).toFixed(1)}</em>` : ''}</p></div>
      <div class="zg-card"><p class="zg-who"><span>${q.role[0]}</span>${q.role[1]}</p>
      ${q.kind === 'pair' ? `<p class="zg-q">2 つの会社から声がかかった。仕事の中身は同じ。<b>所得税を引いたあとの手取り</b>が多いのは、どっち？</p><p class="zg-hint">695 万円をこえると、税率が 20% から 23% に上がります。</p>`
        : `<p class="zg-q">課税所得 <b>${A2(q.A)}</b> から <b>${A2(q.B)}</b> へ。昇給 <em>＋${q.d} 万円</em>。<br>所得税を引いたあとの<b>手取り</b>は、いくら増える？</p>`}
      <div class="zg-ch">${q.ch.map(([k, t]) => `<button type="button" data-c="${k}">${t}</button>`).join('')}</div><p class="zg-exp" aria-live="polite"></p></div></div>`;
    await glide(q.A, 500);
    if (!G || G.q !== q) return;
    G.lock = 0; G.t0 = performance.now();
    const bar = game.querySelector('.zg-bar i'); bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; void bar.offsetWidth; bar.style.transition = `transform ${GT}s linear`; bar.style.transform = 'scaleX(0)';
    clearTimeout(G.timer); G.timer = setTimeout(() => ganswer(null), GT * 1000);
  };
  const A2 = v => v.toLocaleString() + ' 万円';
  const explain = q => {
    if (q.kind === 'pair') { const dt = tax(q.B) - tax(q.A); return `B 社のほうが ${A2(q.B - q.A)} 多く、所得税は ${yen(dt)} 多い。それでも手取りは B 社が ${yen(q.B - q.A - dt)} 多い。23% がかかるのは 695 万円をこえた部分だけなので、所得が多いほうが手取りが少なくなることはありません。`; }
    const parts = []; let x = q.A;
    for (let i = 0; i < 7 && x < q.B; i++) { const hi = i < 6 ? B[i + 1] : Infinity; if (x >= hi) continue; const seg = Math.min(q.B, hi) - x; parts.push(`${A2(seg)}に ${R[i]}%（${yen(seg * R[i] / 100)}）`); x += seg; }
    return `昇給の ${A2(q.d)}のうち、${parts.join('、')}。税は ${yen(tax(q.B) - tax(q.A))} 増え、手取りは ${yen(q.right)} 増える。`;
  };
  const ganswer = async c => {
    if (!G || G.lock) return; G.lock = 1; clearTimeout(G.timer);
    const q = G.q, left = Math.max(0, GT - (performance.now() - G.t0) / 1000), hit = c === q.ok;
    { const bi = game.querySelector('.zg-bar i'), cur = getComputedStyle(bi).transform; bi.style.transition = 'none'; bi.style.transform = cur; }
    game.querySelectorAll('.zg-ch button').forEach(b => { b.disabled = true; if (b.dataset.c === q.ok) b.classList.add('is-ok'); else if (b.dataset.c === c) b.classList.add('is-ng'); });
    let pts = 0;
    if (hit) { G.ok++; G.combo++; pts = Math.round((100 + Math.ceil(left * 4)) * (G.combo >= 2 ? 1 + Math.min(G.combo - 1, 4) * .1 : 1)); G.score += pts; }
    else { G.combo = 0; if (c === 'all' || c === 's' || c === 'a') G.all++; if (c === 'none') G.none++; if (c === 'old') G.old++; }
    const head = hit ? `正解 +${pts} 点。` : c === null ? '時間切れ。' : c === 'all' || c === 'a' || c === 's' ? '「段が上がると、全部に高い税率」のひっかけ。' : c === 'none' ? '税を引くのを忘れています。' : c === 'old' ? '前の段の税率のまま計算しています。' : 'ざんねん。';
    const exp = game.querySelector('.zg-exp'); exp.className = 'zg-exp ' + (hit ? 'is-ok' : 'is-ng'); exp.innerHTML = `<b>${head}</b>${explain(q)}`;
    game.querySelector('.zg-sc b').textContent = G.score.toLocaleString();
    if (hit && !reduce) { const s = document.createElement('span'); s.className = 'zg-pop'; s.textContent = '+' + pts; game.querySelector('.zg-card').appendChild(s); }
    box.querySelector('.zd-stage').classList.add('is-show');
    await glide(q.B, 1100);
    box.querySelector('.zd-stage')?.classList.remove('is-show');
    game.querySelector('.zg-card')?.insertAdjacentHTML('beforeend', `<button type="button" class="zg-next">${G.n < 7 ? '次の人へ' : 'けっかを見る'}</button>`);
  };
  const gend = () => {
    const R2 = G; G = null;
    const nb = R2.score > gbest; if (nb) { gbest = R2.score; try { localStorage.setItem(GB, gbest); localStorage.setItem('azakei_zeidan', '1'); } catch (e) {} }
    const rk = R2.ok === 8 ? ['名', '税の階段の名人'] : R2.ok >= 6 ? ['良', '頼れる税理士の卵'] : R2.ok >= 4 ? ['段', 'もう一段上へ'] : ['初', 'はじめの一段'];
    const tips = [];
    if (R2.all) tips.push(`「段が上がると全部に高い税率」をえらんだのが ${R2.all} 回。高い税率は、その段をこえた部分だけ。だから昇給して手取りが減ることはありません。`);
    if (R2.none) tips.push('昇給の全部が手取りになるわけではありません。昇給分にも、その段の税率がかかります。');
    if (R2.old) tips.push('段をまたぐ昇給は、さかいの前と後で税率が変わります。さかいで 2 つに分けて計算しよう。');
    if (!tips.length) tips.push('ひっかけにかからずに解けました。昇給分を段のさかいで分けて考えるのがコツです。');
    tips.push('実際には、このほかに住民税（多くは約 10%）や社会保険料も引かれます。ここでは所得税だけを計算しています。');
    game.innerHTML = `<div class="zg-end"><span class="zg-stamp" aria-hidden="true">${rk[0]}</span><div><p class="zg-k">${rk[1]}</p><p class="zg-res"><b>${R2.score.toLocaleString()}</b> 点${nb ? '<em>自己ベスト</em>' : ''}</p><p class="zg-d">8 問中 ${R2.ok} 問正解</p></div>
      <ul class="zg-tips">${tips.map(t => `<li>${t}</li>`).join('')}</ul><button type="button" class="zg-start">もう一度</button></div>`;
  };
  game.addEventListener('click', e => {
    if (e.target.closest('.zg-start')) { gstart(); return; }
    const c = e.target.closest('.zg-ch button'); if (c && !c.disabled) { ganswer(c.dataset.c); return; }
    if (e.target.closest('.zg-next') && G) { G.n++; if (G.n >= 8) gend(); else gq(); }
  });
  ginto();
})();
