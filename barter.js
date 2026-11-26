/* ================================================================
   barter.js — あそび場：「交換の島」6 日間（物々交換とお金をくらべる・近づいてから読みこむ）
   ・あなたは魚をとる人。毎朝 3 匹とれる。魚は 2 日でいたむ（とった次の次の朝に捨てる）
   ・1 日に動けるのは 4 回。6 日のうちに、本・布・薪の 3 つを手に入れる
   ・一の島：物々交換。話しかけるまで、相手のほしい物と交換の割合はわからない
   ・二の島：同じ島に「貝のお金」。魚は市場で売れて、どの品物にも値段がついている。貝はいたまない
   ・最後に、動いた回数・かかった日数・いたんだ魚をくらべ、お金の 3 つの働き（交換・ものさし・ためておく）を見る
   ・人や品物、割合と値段は、しくみを考えるための「たとえ」。見た目は barter.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-barter]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="barter.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'barter.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NAMES = ['汐', '岬', '凪', '浜', '磯', '澪'];
  const MIDS = ['米', '塩', '茶', '壺'];
  const U = { 魚: '匹', 米: '袋', 塩: '袋', 茶: '箱', 壺: '個', 本: '冊', 布: '枚', 薪: '束', 貝: '枚' };
  const GOALS = ['本', '布', '薪'], DAYS = 6, ACTS = 4, CATCH = 3;
  const PRICE = { 魚: 2, 本: 4, 布: 4, 薪: 6 };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const q = (it, n) => `${it} ${n} ${U[it]}`;
  let G, res = null;

  const build = () => {
    const [m0, m1, m2] = shuffle(MIDS), nm = shuffle(NAMES);
    // [持っている物, ほしい物, わたす数, もらえる数]
    const P = [[m0, '魚', 2, 1], ['本', m0, 1, 1], [m1, m0, 1, 2], ['布', m1, 2, 1], [m2, '魚', 3, 1], ['薪', m2, 1, 1]];
    PRICE[m0] = 4; PRICE[m1] = 2; PRICE[m2] = 6;
    return shuffle(P).map((p, i) => ({ n: nm[i], has: p[0], want: p[1], give: p[2], get: p[3] }));
  };
  const start = (mode, folk) => {
    G = { mode, folk: folk.map(f => Object.assign({}, f, { known: mode === 'money' })), day: 1, act: ACTS, fish: [], bag: {}, shell: 0, got: [], acts: 0, rot: 0, talks: 0, log: [], over: false };
    morning();
  };
  const fishN = () => G.fish.reduce((s, f) => s + f.n, 0);
  const useFish = n => { while (n > 0) { const f = G.fish[0], k = Math.min(f.n, n); f.n -= k; n -= k; if (!f.n) G.fish.shift(); } };
  const say = (t, k = '') => { G.log.unshift([t, k]); G.log.length = Math.min(G.log.length, 3); };
  const morning = () => {
    const bad = G.fish.filter(f => G.day - f.d >= 2).reduce((s, f) => s + f.n, 0);
    G.fish = G.fish.filter(f => G.day - f.d < 2);
    if (bad) { G.rot += bad; say(`いたんだ魚を ${bad} 匹すてた。魚は 2 日しかもたない。`, 'ng'); }
    G.fish.push({ d: G.day, n: CATCH }); G.act = ACTS;
    say(`${G.day} 日目の朝。魚が ${CATCH} 匹とれた。`, '');
  };
  const spend = () => { G.act--; G.acts++; };
  const check = () => {
    GOALS.forEach(g => { if (!G.got.includes(g) && (G.bag[g] || 0) > 0) { G.got.push(g); say(`${g}を手に入れた！`, 'ok'); } });
    if (G.got.length === GOALS.length) { G.over = 'clear'; }
  };

  const talk = i => {
    if (G.over || G.act <= 0) return;
    const f = G.folk[i];
    spend();
    if (G.mode === 'barter') {
      const first = !f.known; f.known = true; if (first) G.talks++;
      const have = f.want === '魚' ? fishN() : (G.bag[f.want] || 0);
      if (have >= f.give) {
        if (f.want === '魚') useFish(f.give); else G.bag[f.want] -= f.give;
        G.bag[f.has] = (G.bag[f.has] || 0) + f.get;
        say(`${f.n}さんと交換。${q(f.want, f.give)}をわたして、${q(f.has, f.get)}をもらった。`, 'ok');
        G.flash = i;
      } else say(`${f.n}さん「${f.has}がほしいなら、${q(f.want, f.give)}と交換だよ」${have ? `（いまは ${have} ${U[f.want]}）` : ''}`, 'ng');
    } else {
      const p = PRICE[f.has];
      if (G.shell >= p) { G.shell -= p; G.bag[f.has] = (G.bag[f.has] || 0) + 1; say(`${f.n}さんから、${f.has}を貝 ${p} 枚で買った。`, 'ok'); G.flash = i; }
      else say(`${f.has}は貝 ${p} 枚。貝が ${p - G.shell} 枚たりない。市場で魚を売ろう。`, 'ng');
    }
    check(); after();
  };
  const sell = () => {
    if (G.over || G.act <= 0 || G.mode !== 'money') return;
    const n = fishN(); if (!n) { say('売る魚がない。', 'ng'); return paint(); }
    spend(); useFish(n); G.shell += n * PRICE.魚; say(`市場で魚 ${n} 匹を売って、貝 ${n * PRICE.魚} 枚になった。貝はいたまない。`, 'ok');
    after();
  };
  const sleep = () => {
    if (G.over) return;
    if (G.day >= DAYS) { G.over = 'fail'; return after(); }
    G.day++; morning(); paint();
  };
  const after = () => {
    if (G.over) return setTimeout(G.mode === 'barter' ? mid : end, reduce ? 0 : 900), paint();
    if (G.act <= 0) say('今日はもう動けない。「寝る」で次の日へ。', '');
    paint();
  };

  const paint = () => {
    const M = G.mode === 'money';
    const fishHtml = G.fish.map(f => `<span class="bt-fish${G.day - f.d >= 1 ? ' is-old' : ''}" title="${G.day - f.d >= 1 ? '明日の朝にいたむ' : 'とれたて'}">魚<b>${f.n}</b><small>${G.day - f.d >= 1 ? 'あすまで' : 'とれたて'}</small></span>`).join('') || '<span class="bt-none">魚なし</span>';
    const bagHtml = Object.keys(G.bag).filter(k => G.bag[k] > 0 && !GOALS.includes(k)).map(k => `<span class="bt-good">${k}<b>${G.bag[k]}</b></span>`).join('');
    box.innerHTML = `<div class="bt-hud"><p class="bt-step"><span>${M ? '二' : '一'}</span>${M ? '貝のお金がある島' : '物々交換の島'}</p>
        <p class="bt-day"><b>${G.day}</b> 日目<small> / ${DAYS} 日</small></p>
        <p class="bt-act" aria-label="のこりの行動 ${G.act} 回">${Array.from({ length: ACTS }, (_, i) => `<i${i < G.act ? ' class="is-on"' : ''}></i>`).join('')}<small>今日の行動</small></p>
        <button type="button" class="bt-sleep">${G.day >= DAYS ? 'ここで終える' : '寝る（次の日へ）'}</button></div>
      <div class="bt-goal">${GOALS.map(g => `<span class="${G.got.includes(g) ? 'is-got' : ''}"><i>${g}</i>${G.got.includes(g) ? '手に入れた' : 'まだ'}</span>`).join('')}</div>
      <div class="bt-bag"><p class="bt-bk">もち物</p><div>${fishHtml}${bagHtml}${M ? `<span class="bt-shell">貝<b>${G.shell}</b></span>` : ''}</div></div>
      ${M ? `<div class="bt-market"><p><b>市場</b>魚は 1 匹 貝 ${PRICE.魚} 枚で、いつでも売れる。どの品物にも、貝で値段がついている（ものさし）。</p><button type="button" class="bt-sell" ${fishN() && G.act > 0 ? '' : 'disabled'}>魚を全部売る（${fishN()} 匹 → 貝 ${fishN() * PRICE.魚} 枚）</button></div>` : ''}
      <ul class="bt-folk">${G.folk.map((f, i) => `<li><button type="button" class="bt-p${G.flash === i ? ' is-flash' : ''}${GOALS.includes(f.has) ? ' is-goalp' : ''}" data-i="${i}" ${G.act <= 0 || G.over ? 'disabled' : ''}>
          <span class="bt-seal" aria-hidden="true">${f.n}</span><span class="bt-nm">${f.n}さん</span>
          <span class="bt-has">持っている<b>${f.has}</b></span>
          ${M ? `<span class="bt-want is-price">値段<b>貝 ${PRICE[f.has]} 枚</b></span>` : `<span class="bt-want">ほしい<b>${f.known ? `${q(f.want, f.give)}` : '？'}</b>${f.known ? `<small>→ ${q(f.has, f.get)}</small>` : ''}</span>`}</button></li>`).join('')}</ul>
      <div class="bt-msg" aria-live="polite">${G.log.map(([t, k], i) => `<p class="${k ? 'is-' + k : ''}${i ? ' is-old' : ''}">${t}</p>`).join('')}</div>
      <p class="bt-note">${M ? '人は話しかけなくても、値段が見えています。' : '話しかける（1 回の行動）と、その人のほしい物と交換の割合がわかります。持っていれば、そのまま交換します。'}島の人や品物、割合と値段は「たとえ」です。</p>`;
    G.flash = -1;
  };

  const mid = () => {
    res = { acts: G.acts, day: G.day, rot: G.rot, talks: G.talks, ok: G.over === 'clear' };
    box.innerHTML = `<div class="bt-end"><span class="bt-stamp" aria-hidden="true">換</span>
      <p class="bt-res">${res.ok ? `${res.day} 日目に、3 つとも手に入れた` : '6 日では、3 つそろわなかった'}</p>
      <p class="bt-sum">行動 <b>${res.acts}</b> 回・いたんだ魚 <b>${res.rot}</b> 匹</p>
      <p class="bt-word">物々交換では「相手のほしい物を、自分が持っている」ときしか交換できません。そのために、ほしくもない品物を何回も持ちかえました。では、同じ島に「だれでも受けとる貝のお金」があったら？</p>
      <button type="button" class="bt-go" data-go="money">貝のお金がある島で、もう一度</button></div>`;
    G.folk0 = G.folk;
  };
  const end = () => {
    try { localStorage.setItem('azakei_koukan', '1'); } catch (e) {}
    const m = { acts: G.acts, day: G.day, rot: G.rot, ok: G.over === 'clear' };
    const r = res || { acts: '—', day: '—', rot: '—', ok: false };
    const bar = (a, b) => typeof a === 'number' && typeof b === 'number' ? Math.round(b / Math.max(a, b, 1) * 100) : 100;
    box.innerHTML = `<div class="bt-end"><span class="bt-stamp" aria-hidden="true">貨</span>
      <p class="bt-res">${m.ok ? `貝のお金があると、${m.day} 日目にそろった` : '6 日では、そろわなかった'}</p>
      <table class="bt-vs"><thead><tr><th></th><th>物々交換</th><th>お金がある</th></tr></thead><tbody>
        <tr><th>行動の回数</th><td>${r.acts}</td><td>${m.acts}<i style="width:${bar(r.acts, m.acts)}%"></i></td></tr>
        <tr><th>かかった日数</th><td>${r.ok ? r.day : '6 日でそろわず'}</td><td>${m.ok ? m.day : '6 日でそろわず'}</td></tr>
        <tr><th>いたんだ魚</th><td>${r.rot} 匹</td><td>${m.rot} 匹</td></tr></tbody></table>
      <div class="bt-roles">
        <p><b>交換</b>お金はだれでも受けとるので、「売る」と「買う」の 2 つですむ。ほしくもない品物を持ちかえなくていい。</p>
        <p><b>ものさし</b>8 つの品物の交換の割合は、物々交換だと 28 通り。お金があれば値段の 8 つだけで、くらべやすい。</p>
        <p><b>ためておく</b>魚は 2 日でいたむけれど、貝のお金はいたまない。とった日に売って、必要な日に使える。</p></div>
      <p class="bt-links"><a href="glossary.html#money-roles">お金の 3 つの役割</a><a href="#shinka">お金の進化を見る</a></p>
      <button type="button" class="bt-go" data-go="new">ちがう島で、はじめから</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(box.querySelector('.bt-end'), 'koukan', m.ok ? (m.day <= 4 ? 'top' : 'mid') : 'low');
  };
  const intro = () => {
    box.innerHTML = `<div class="bt-end bt-intro"><span class="bt-stamp" aria-hidden="true">島</span>
      <p class="bt-res">交換の島の 6 日間</p>
      <ul class="bt-rules"><li>あなたは魚をとる人。毎朝 <b>3 匹</b>とれる。でも魚は <b>2 日でいたむ</b>。</li><li>1 日に動けるのは <b>4 回</b>。島の人に話しかけて交換しよう。</li><li>6 日のうちに、<b>本・布・薪</b>の 3 つを手に入れたら成功。</li><li>はじめは物々交換の島。次に、同じ島に貝のお金があったらどうなるかをくらべます。</li></ul>
      <button type="button" class="bt-go" data-go="new">島へ行く</button></div>`;
  };

  box.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) { if (g.dataset.go === 'new') { res = null; start('barter', build()); } else start('money', G.folk0); paint(); const r = box.getBoundingClientRect(); if (r.top < 0) box.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (!G || G.over) return;
    const p = e.target.closest('.bt-p'); if (p && !p.disabled) { talk(+p.dataset.i); return; }
    if (e.target.closest('.bt-sell')) { sell(); return; }
    if (e.target.closest('.bt-sleep')) sleep();
  });
  intro();
})();
