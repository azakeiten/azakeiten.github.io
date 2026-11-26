/* ================================================================
   nenkin.js — あそび場：胴上げから肩車へ「年金の村 100 年」（年金と少子高齢化・近づいてから読みこむ）
   ・たとえの村（100 人から）。10 歳ごとの年齢の層で、10 年ずつ人口を計算する
     （生まれる子の数と長生きの変化は、日本の流れに似せたたとえ。支え手は 1965 年 約 9.6 人 → 2015 年 約 2.1 人 → 2055 年 約 1.2 人）
   ・1965〜1985 年は流れを見るだけ。1995 年から 2055 年まで、10 年ごとに村長として政策を 1 つえらぶ（7 回）
       子育てを支える（生まれる子がふえる・効くのは 20 年後から・いまは少し負担）
       長く働ける職場（65〜79 歳の一部が支える側に・3 回まで）
       年金を少し下げる（働く世代は軽く・高齢世代はくらしが苦しく）
       保険料を上げて積み立てる（いまの働く世代がつらい・あとの負担が軽く）
   ・働く世代のくらし／高齢世代のくらし を 100 から、負担の重さや年金の少なさで減らす。2065 年の合計で称号
   ・人形に顔はかかない。見た目は nenkin.css（このファイルが読みこむ）。自己ベストは azakei_nenkin_best
   ================================================================ */
(function () {
  const box = document.querySelector('[data-nenkin]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="nenkin.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'nenkin.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const F = [0.54, 0.52, 0.47, 0.40, 0.34, 0.31, 0.30, 0.30, 0.30, 0.30, 0.30];
  const surv = (t, i) => { const g = Math.min(t, 8) / 8; return i < 5 ? 1 : i === 5 ? .95 : i === 6 ? .88 + .07 * g : i === 7 ? .65 + .2 * g : i === 8 ? .3 + .15 * g : .1 + .1 * g; };
  const POL = {
    A: ['育', '子育てを支える', '保育所や手当で、生まれる子が少しふえる。効くのは 20 年後から。いまは少し負担がふえる。'],
    B: ['働', '長く働ける職場', '65〜79 歳の人の一部も、支える側にまわる。3 回まで。'],
    C: ['減', '年金を少し下げる', '働く世代の負担は軽くなる。でも高齢世代のくらしは苦しくなる。'],
    D: ['積', '保険料を上げて積み立てる', 'いまの働く世代はつらい。積み立てたお金で、あとの負担が軽くなる。']
  };
  const BK = 'azakei_nenkin_best', START = 3, END = 10;
  let best = 0; try { best = +localStorage.getItem(BK) || 0; } catch (e) {}
  let G;
  const yr = t => 1965 + t * 10;
  const groups = c => ({ K: c[0] + c[1], W: c[2] + c[3] + c[4] + c[5] + c[6] / 2, E: c[6] / 2 + c[7] + c[8] + c[9], O: c[6] / 2 + c[7] });
  const fresh = () => ({ t: 0, c: [16, 20, 18, 15, 12, 9, 5, 2.5, .8, .1], fb: 0, work: 0, p: 1, fund: 0, hw: 100, he: 100, extra: 0, picks: [], hist: [] });
  const state = () => { const g = groups(G.c), wk = G.work * g.O, S = (g.W + wk) / (g.E - wk); const b = Math.max(.05, G.p / S - .04 * G.fund + G.extra); return { g, wk, S, b }; };
  const step = () => { const c = G.c, b = (c[2] + c[3]) * (F[G.t] + G.fb), n = [b]; for (let i = 1; i < 10; i++) n[i] = c[i - 1] * surv(G.t, i - 1); G.c = n; G.t++; };
  const shape = S => S >= 5 ? ['胴上げ型', 'たくさんの人で、1 人を持ち上げる'] : S >= 2 ? ['騎馬戦型', '数人で、1 人を支える'] : S >= 1.4 ? ['騎馬戦から肩車へ', '支える人が、どんどん少なくなる'] : ['肩車型', 'ほぼ 1 人で、1 人を支える'];

  const people = (n, cls) => Array.from({ length: Math.round(n / 4) }, () => `<i class="${cls}"></i>`).join('');
  const pyramid = c => { const mx = 22; return `<svg class="nk-pyr" viewBox="0 0 200 150" aria-label="年齢ごとの人数">${c.map((v, i) => { const w = Math.min(1, v / mx) * 90, y = 136 - i * 14, cl = i < 2 ? 'k' : i < 6 ? 'w' : i === 6 ? 'm' : 'e'; return `<rect class="is-${cl}" x="${100 - w}" y="${y}" width="${w * 2}" height="11" rx="3"/><text x="4" y="${y + 9}">${i * 10}</text>`; }).join('')}</svg>`; };
  const meter = (v, lo, hi, cls) => `<span class="nk-m ${cls}"><i style="width:${Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100))}%"></i></span>`;

  const paint = (msg) => {
    const s = state(), sh = shape(s.S), dec = G.t >= START && G.t < END;
    box.innerHTML = `<ol class="nk-tl">${Array.from({ length: END + 1 }, (_, t) => `<li class="${t < G.t ? 'is-past' : t === G.t ? 'is-now' : ''}${t === START ? ' is-start' : ''}">${yr(t)}</li>`).join('')}</ol>
      <div class="nk-main"><div class="nk-village"><p class="nk-y"><b>${yr(G.t)}</b> 年の村<small>${sh[0]}・${sh[1]}</small></p>
        <div class="nk-row"><span>子ども</span><div>${people(s.g.K, 'is-k')}</div></div>
        <div class="nk-row"><span>働く世代</span><div>${people(s.g.W, 'is-w')}${people(s.wk, 'is-ow')}</div></div>
        <div class="nk-row"><span>高齢世代</span><div>${people(s.g.E - s.wk, 'is-e')}</div></div>
        <p class="nk-leg"><i class="is-w"></i>20〜64 歳<i class="is-ow"></i>働く 65 歳以上<i class="is-e"></i>支えられる 65 歳以上・人形 1 つで約 4 人</p></div>
        <div class="nk-side">${pyramid(G.c)}
          <dl class="nk-st"><div><dt>1 人の高齢者を支える人数</dt><dd><b>${s.S.toFixed(1)}</b> 人</dd></div>
          <div><dt>働く 1 人の負担（高齢者何人分）</dt><dd><b>${s.b.toFixed(2)}</b> 人分</dd>${meter(s.b, 0, 1, s.b > .45 ? 'is-bad' : '')}</div>
          ${G.t >= START ? `<div><dt>働く世代のくらし</dt><dd><b>${Math.max(0, Math.round(G.hw))}</b></dd>${meter(G.hw, 0, 100, G.hw < 40 ? 'is-bad' : 'is-good')}</div>
          <div><dt>高齢世代のくらし（年金 ${Math.round(G.p * 100)}%）</dt><dd><b>${Math.max(0, Math.round(G.he))}</b></dd>${meter(G.he, 0, 100, G.he < 40 ? 'is-bad' : 'is-good')}</div>` : ''}</dl></div></div>
      ${msg ? `<p class="nk-msg">${msg}</p>` : ''}
      ${dec ? `<p class="nk-ask"><b>${yr(G.t)} 年、村長のあなたは、どうする？</b><small>10 年に 1 つ。次の 10 年の村が変わります。</small></p>
        <div class="nk-pol">${Object.entries(POL).map(([k, v]) => `<button type="button" data-pol="${k}" ${k === 'B' && G.work >= .45 ? 'disabled' : ''}><span>${v[0]}</span><b>${v[1]}</b><small>${k === 'B' && G.work >= .45 ? 'もう 3 回えらんだ' : v[2]}</small></button>`).join('')}</div>`
        : G.t < START ? `<button type="button" class="nk-go" data-go="watch">10 年すすめる</button>` : ''}
      ${G.picks.length ? `<ol class="nk-log">${G.picks.map(([t, k]) => `<li><span>${yr(t)}</span>${POL[k][1]}</li>`).join('')}</ol>` : ''}`;
  };
  const intro = () => {
    G = fresh();
    box.innerHTML = `<div class="nk-intro"><span class="nk-seal" aria-hidden="true">支</span><div><p class="nk-k">年金の村 100 年</p><p class="nk-t">あなたは、たとえの村の村長</p>
      <p class="nk-d">1965 年の村では、働く世代が約 9 人で、1 人のお年寄りを支えていました。子どもが減り、長生きする人がふえると、支える人はどんどん少なくなります。1995 年から 2055 年まで、10 年ごとに政策を 1 つえらんで、2065 年まで<b>働く世代</b>と<b>高齢世代</b>のくらしを守ろう。</p>
      ${best ? `<p class="nk-best">自己ベスト <b>${best}</b> 点</p>` : ''}<button type="button" class="nk-go" data-go="start">1965 年の村へ</button></div></div>
      ${LEARN}`;
  };
  const watch = async () => { step(); paint(G.t === START ? '1995 年。ここから、あなたが村長です。' : `${yr(G.t)} 年。子どもが少なくなり、支える人の数が減ってきた。`); };
  const pick = async k => {
    if (G.busy) return; G.busy = true;
    const t0 = G.t; G.picks.push([t0, k]);
    G.extra = 0;
    if (k === 'A') { G.fb += .04; G.extra = .04; }
    if (k === 'B') G.work = Math.min(.45, G.work + .15);
    if (k === 'C') G.p -= .08;
    if (k === 'D') { G.fund++; G.hw -= 6; }
    // この 10 年の暮らしを計算してから、次の 10 年へ
    const s = state();
    const dw = s.b > .45 ? (s.b - .45) * 100 : 0, de = G.p < .9 ? (.9 - G.p) * 120 : 0;
    G.hw -= dw; G.he -= de;
    G.hist.push({ t: t0, S: s.S, b: s.b, hw: G.hw, he: G.he }); G.extra = 0;
    box.querySelectorAll('[data-pol]').forEach(b => b.disabled = true);
    box.querySelector(`[data-pol="${k}"]`)?.classList.add('is-on');
    await sleep(500);
    step();
    const msg = `${yr(t0)} 年に「${POL[k][1]}」。${dw ? `働く世代の負担が重く、くらしが ${Math.round(dw)} 下がった。` : '働く世代の負担は、まだがまんできる重さ。'}${de ? `年金が少なく、高齢世代のくらしが ${Math.round(de)} 下がった。` : ''}`;
    G.busy = false;
    if (G.t >= END) return finish(msg);
    paint(msg);
  };
  const finish = msg => {
    const s = state();
    const hw = Math.max(0, Math.round(G.hw)), he = Math.max(0, Math.round(G.he)), sc = hw + he;
    const nb = sc > best; try { localStorage.setItem('azakei_nenkin', '1'); if (nb) { best = sc; localStorage.setItem(BK, best); } } catch (e) {}
    const rk = Math.min(hw, he) < 30 ? ['難', 'どちらかの世代が行きづまった'] : sc >= 180 ? ['名', '名村長'] : sc >= 150 ? ['良', '頼れる村長'] : sc >= 100 ? ['村', 'なんとか乗りきった村長'] : ['難', '村は行きづまった'];
    const cnt = k => G.picks.filter(p => p[1] === k).length;
    const tips = [];
    if (!cnt('A')) tips.push('子育て支援は、効くまでに 20 年かかります。早めに始めるほど、あとの支え手がふえます。');
    if (!cnt('B')) tips.push('長く働ける職場は、支える人をすぐにふやせる手です。');
    if (cnt('C') >= 3) tips.push('年金を下げつづけると、働く世代は楽でも、高齢世代のくらしが苦しくなります。');
    if (!cnt('D')) tips.push('積み立ては、いまはつらくても、あとの世代の負担を軽くします。');
    tips.push('日本でも、子育て支援・長く働ける制度・年金の伸びをおさえるしくみ・積み立てたお金の運用を、組み合わせて取り組んでいます。1 つの政策だけでは解決しないのが、少子高齢化のむずかしさです。');
    const X = i => 20 + i * 40, Y = v => 90 - Math.max(0, Math.min(100, v)) * .8;
    paint(msg);
    box.insertAdjacentHTML('afterbegin', `<div class="nk-fin"><span class="nk-stamp" aria-hidden="true">${rk[0]}</span><p class="nk-k">${rk[1]}</p><p class="nk-res"><b>${sc}</b> 点<small>（働く世代 ${hw} ＋ 高齢世代 ${he}）</small>${nb ? '<em>自己ベスト</em>' : ''}</p>
      <svg class="nk-hist" viewBox="0 0 300 100" aria-label="くらしのうつりかわり"><polyline class="is-w" points="${G.hist.map((h, i) => `${X(i)},${Y(h.hw)}`).join(' ')}"/><polyline class="is-e" points="${G.hist.map((h, i) => `${X(i)},${Y(h.he)}`).join(' ')}"/>${G.hist.map((h, i) => `<text x="${X(i)}" y="99">${yr(h.t)}</text>`).join('')}</svg>
      <p class="nk-lg"><i class="is-w"></i>働く世代のくらし<i class="is-e"></i>高齢世代のくらし</p>
      <ul class="nk-tips">${tips.slice(-3).map(t => `<li>${t}</li>`).join('')}</ul><button type="button" class="nk-go" data-go="start">もう一度、1965 年から</button></div>`);
    box.querySelector('.nk-ask')?.remove(); box.querySelector('.nk-pol')?.remove();
    const r = box.getBoundingClientRect(); if (r.top < 0) box.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    window.AZAKEI_TALK && window.AZAKEI_TALK(box.querySelector('.nk-fin'), 'nenkin', Math.min(hw, he) < 30 || sc < 100 ? 'low' : sc >= 180 ? 'top' : 'mid');
  };
  const LEARN = `
    <div class="nk-learn">
      <p><b>年金は、世代で支え合う</b>日本の年金は、いま働いている人が払う保険料で、いまのお年寄りの年金をまかなうしくみが中心です（積み立てたお金も使います）。だから、支える人の数が大切です（<a href="glossary.html#pension">年金</a>）。</p>
      <p><b>少子高齢化</b>生まれる子どもが減り、長生きする人がふえると、支える側が減って、支えられる側がふえます（<a href="glossary.html#aging">少子高齢化</a>）。</p>
      <p><b>本当の数字</b>20〜64 歳の人数を 65 歳以上の人数で割ると、日本では 1965 年 約 9.1 人（胴上げ型）、2012 年 約 2.4 人（騎馬戦型）、2050 年 約 1.2 人（肩車型・見通し）。国の資料でよく使われる数字です。</p>
      <p><b>この村の計算</b>村の人口と政策の効き目は、日本の流れに似せた「たとえ」の計算です。20 歳以上 60 歳未満の人は国民年金に加入します（学生は保険料をあとで払える「学生納付特例」もあります）。</p>
    </div>`;
  box.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) { if (g.dataset.go === 'start') { G = fresh(); paint('1965 年。働く世代が約 9 人で、1 人のお年寄りを支える「胴上げ型」の村です。'); } else watch(); return; }
    const p = e.target.closest('[data-pol]'); if (p && !p.disabled) pick(p.dataset.pol);
  });
  intro();
})();
