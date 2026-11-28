/* ================================================================
   flow.js — 経済ラボ：「お金のめぐり」（家計・企業・銀行・政府のあいだを、お金が流れる図）
   ・矢印の上をコインが流れる。矢印や丸を押すと、その流れの説明と辞典の言葉
   ・「1 万円のゆくえ」：たとえの 1 万円が、どこを通るかを順に光らせる
   ================================================================ */
(function() {
  const box = document.querySelector('[data-flow]');
  if (!box) return;
  const N = {
    home: { x: 150, y: 150, t: '家計', s: 'わたしたちの家', d: '働いて給料を受けとり、買い物をし、税金をおさめ、残りを預けたり投資したりします。', gl: ['consumption', 'income', 'disposable'] },
    firm: { x: 650, y: 150, t: '企業', s: 'お店や会社', d: 'モノやサービスを売って代金を受けとり、働く人に給料を払います。お金を借りて、工場や機械にお金を使う（設備投資）ことも。', gl: ['sales-profit', 'capex', 'kabushiki-gaisha'] },
    bank: { x: 400, y: 268, t: '銀行', s: 'お金の通り道', d: '家計から預かったお金を、お金を必要としている企業などに貸し出します。間に立って、お金をめぐらせる役目です。', gl: ['bank', 'deposit', 'loan-lending'] },
    gov: { x: 400, y: 448, t: '政府', s: '国や市区町村', d: '税金を集め、道路や学校などの公共事業や、年金・医療などの社会保障にお金を使います。', gl: ['tax', 'fiscal-policy', 'public-goods'] }
  };
  const F = [
    { id: 'buy', a: 'home', b: 'firm', d: 'M200,118 Q400,30 600,118', lx: 400, ly: 64, t: '代金（消費）', x: '家計が、モノやサービスを買うときに払うお金。企業にとっては売上になります。', gl: ['consumption', 'sales-profit'] },
    { id: 'wage', a: 'firm', b: 'home', d: 'M600,182 Q400,150 200,182', lx: 400, ly: 156, t: '給料', x: '企業が、働く人に払うお金。家計にとっては所得になります。', gl: ['wage', 'income'] },
    { id: 'dep', a: 'home', b: 'bank', d: 'M196,206 Q260,262 338,266', lx: 228, ly: 262, t: '預金', x: '家計が、使わないお金を銀行に預けます。銀行は、そのお金を貸し出しに回します。', gl: ['deposit', 'interest'] },
    { id: 'loan', a: 'bank', b: 'firm', d: 'M462,266 Q540,262 604,206', lx: 572, ly: 262, t: '融資', x: '銀行が、企業にお金を貸します。企業は利息をつけて返します。', gl: ['loan-lending', 'interest'] },
    { id: 'taxh', a: 'home', b: 'gov', d: 'M150,206 Q160,400 338,442', lx: 148, ly: 350, t: '税金', x: '所得税や、買い物のときの消費税など。', gl: ['tax', 'progressive-tax'] },
    { id: 'ss', a: 'gov', b: 'home', d: 'M352,404 Q250,330 196,206', lx: 288, ly: 334, t: '社会保障', x: '年金や医療、子育ての支援など。政府から家計へ戻っていくお金です。', gl: ['social-security', 'pension', 'redistribution'] },
    { id: 'taxf', a: 'firm', b: 'gov', d: 'M650,206 Q640,400 462,442', lx: 652, ly: 350, t: '税金', x: '会社のもうけにかかる法人税など。', gl: ['tax', 'national-local-tax'] },
    { id: 'pub', a: 'gov', b: 'firm', d: 'M448,404 Q550,330 604,206', lx: 512, ly: 334, t: '公共事業', x: '道路や橋、学校づくりなどを、政府が企業にお願いして代金を払います。', gl: ['public-works', 'public-goods'] }
  ];
  const STORY = [
    ['wage', 'たとえば、給料として 1 万円を受けとったとします。'],
    ['buy', 'そのうち一部で、お店で買い物。払ったお金は、お店（企業）の売上になります。'],
    ['taxh', '買い物には消費税がかかります。給料からは所得税も。税金は政府へ。'],
    ['dep', '使わなかった分は、銀行に預金。'],
    ['loan', '銀行は、預かったお金を、新しい機械を買いたい企業に貸し出します。'],
    ['pub', '政府は集めた税金で、道路や学校をつくる仕事を企業に頼みます。'],
    ['ss', '年金や医療として、家計に戻っていくお金もあります。'],
    ['wage', 'もうけた企業は、また給料を払う。こうしてお金は、ぐるぐるめぐります。']
  ];
  // 辞典の言葉の名前（用語辞典のページの見出しと同じ）
  const GLN = { consumption: '消費', income: '所得', disposable: '可処分所得', 'sales-profit': '売上高と利益', capex: '設備投資', 'kabushiki-gaisha': '株式会社', bank: '銀行', deposit: '預金', 'loan-lending': '融資', tax: '税金', 'fiscal-policy': '財政政策', 'public-goods': '公共財', wage: '賃金（給料）', interest: '金利・利息', 'progressive-tax': '累進課税', 'social-security': '社会保障', pension: '年金', redistribution: '所得の再分配', 'national-local-tax': '国税と地方税', 'public-works': '公共事業' };
  const glLinks = ids => ids.map(id => `<a href="glossary.html#${id}">${GLN[id] || id}</a>`).join('');

  box.innerHTML = `<div class="fl-grid">
      <div class="fl-stage">
        <svg viewBox="0 0 800 520" role="img" aria-label="家計・企業・銀行・政府のあいだのお金の流れの図">
          <defs><marker id="fl-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
          ${F.map(f => `<g class="fl-f" data-f="${f.id}" tabindex="0" role="button" aria-label="${N[f.a].t}から${N[f.b].t}へ：${f.t}">
            <path class="fl-hit" d="${f.d}"/><path class="fl-p" id="fl-${f.id}" d="${f.d}" marker-end="url(#fl-arr)"/>
            <circle class="fl-c" r="7"><animateMotion dur="3.2s" repeatCount="indefinite"><mpath href="#fl-${f.id}"/></animateMotion></circle>
            <circle class="fl-c" r="7"><animateMotion dur="3.2s" begin="1.6s" repeatCount="indefinite"><mpath href="#fl-${f.id}"/></animateMotion></circle>
            <text class="fl-l" x="${f.lx}" y="${f.ly}">${f.t}</text></g>`).join('')}
          ${Object.entries(N).map(([k, n]) => `<g class="fl-n" data-n="${k}" tabindex="0" role="button" aria-label="${n.t}（${n.s}）" transform="translate(${n.x},${n.y})">
            <circle r="${k === 'bank' ? 56 : 62}"/><text class="fl-nt" y="6">${n.t}</text><text class="fl-ns" y="30">${n.s}</text></g>`).join('')}
        </svg>
      </div>
      <div class="fl-side">
        <div class="fl-info" aria-live="polite"><p class="fl-i-k">図の矢印や丸を押してみてください</p><p class="fl-i-t">お金は、ぐるぐるめぐる</p><p class="fl-i-x">家計・企業・銀行・政府のあいだを、お金は形を変えながら流れています。1 か所で止まると、どこかが困ります。</p></div>
        <div class="fl-story"><button type="button" class="fl-go">「1 万円のゆくえ」を見る</button><p class="fl-note">金額は、説明のための「たとえ」です。</p></div>
      </div>
    </div>`;
  const svg = box.querySelector('svg'), info = box.querySelector('.fl-info');
  const clear = () => svg.querySelectorAll('.is-on, .is-dim').forEach(e => e.classList.remove('is-on', 'is-dim'));
  const focusFlow = (id, head) => {
    const f = F.find(x => x.id === id); if (!f) return;
    clear(); svg.classList.add('is-focus');
    svg.querySelectorAll('.fl-f').forEach(g => g.classList.toggle('is-on', g.dataset.f === id));
    svg.querySelectorAll('.fl-n').forEach(g => g.classList.toggle('is-on', g.dataset.n === f.a || g.dataset.n === f.b));
    info.innerHTML = `<p class="fl-i-k">${head || `${N[f.a].t} → ${N[f.b].t}`}</p><p class="fl-i-t">${f.t}</p><p class="fl-i-x">${f.x}</p><p class="fl-gl">${glLinks(f.gl)}</p>`;
  };
  const focusNode = k => {
    const n = N[k]; clear(); svg.classList.add('is-focus');
    svg.querySelectorAll('.fl-n').forEach(g => g.classList.toggle('is-on', g.dataset.n === k));
    svg.querySelectorAll('.fl-f').forEach(g => { const f = F.find(x => x.id === g.dataset.f); g.classList.toggle('is-on', f.a === k || f.b === k); });
    info.innerHTML = `<p class="fl-i-k">${n.s}</p><p class="fl-i-t">${n.t}</p><p class="fl-i-x">${n.d}</p><p class="fl-gl">${glLinks(n.gl)}</p>`;
  };
  let timer = null, step = -1;
  const stopStory = () => { clearTimeout(timer); timer = null; step = -1; box.querySelector('.fl-go').textContent = '「1 万円のゆくえ」を見る'; };
  const pick = e => {
    const g = e.target.closest('.fl-f, .fl-n'); if (!g) return;
    stopStory();
    g.dataset.f ? focusFlow(g.dataset.f) : focusNode(g.dataset.n);
  };
  svg.addEventListener('click', pick);
  svg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); } });
  const next = () => {
    step++;
    if (step >= STORY.length) { stopStory(); return; }
    const [id, txt] = STORY[step];
    focusFlow(id, `1 万円のゆくえ　${step + 1} / ${STORY.length}`);
    info.querySelector('.fl-i-x').textContent = txt;
    box.querySelector('.fl-go').textContent = step === STORY.length - 1 ? 'もう一度' : '止める';
    timer = setTimeout(next, 4200);
  };
  box.querySelector('.fl-go').addEventListener('click', () => {
    if (timer) { stopStory(); return; }
    next();
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) svg.pauseAnimations && svg.pauseAnimations();
})();
/* ================================================================
   v375：「お金の配達 40 秒」— できごとを読んで、お金が「どこから」「どこへ」流れるかを 2 回押す
   ・家計・企業・銀行・政府の 4 つ。押すと、コインが矢印の上を飛んでいく
   ・正解で次へ。続けて正解すると倍率アップ。まちがえると 3 秒へる
   ・自己ベストは azakei_meguri_best。見た目は mgame.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-flow]');
  if (!box || document.querySelector('.mq')) return;
  if (!document.querySelector('link[href^="mgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'mgame.css?v=20261128c'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_meguri_best', TIME = 40;
  const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const N = { H: ['家計', '家', 'わたしたちの家'], F: ['企業', '企', '会社・お店'], B: ['銀行', '銀', 'お金をあずかって貸す'], G: ['政府', '政', '国や市町村'] };
  // [できごと, から, へ, ひとこと]
  const EV = [
    ['コンビニで、おにぎりを買った', 'H', 'F', '買い物の代金は、家計から企業へ（消費）。'],
    ['会社が、社員に給料を払った', 'F', 'H', '働いた分の給料は、企業から家計へ。'],
    ['お年玉を、銀行の口座にあずけた', 'H', 'B', '預金は、家計から銀行へ。'],
    ['銀行が、新しい工場を建てる会社にお金を貸した', 'B', 'F', 'あずかったお金を、銀行が企業に貸し出す（融資）。'],
    ['給料から、所得税が引かれた', 'H', 'G', '所得税は、家計から政府へ。'],
    ['会社が、もうけにかかる税金（法人税）をおさめた', 'F', 'G', '法人税は、企業から政府へ。'],
    ['おじいちゃんに、年金が振りこまれた', 'G', 'H', '年金は、政府（国）から家計へ（社会保障）。'],
    ['市が、道路工事の代金を建設会社に払った', 'G', 'F', '公共事業の代金は、政府から企業へ。'],
    ['会社が、借りたお金の利息を銀行に払った', 'F', 'B', '借りた分の利息は、企業から銀行へ。'],
    ['銀行が、預金に利息をつけた', 'B', 'H', '預金の利息は、銀行から家計へ。'],
    ['家を買うために、銀行から住宅ローンを借りた', 'B', 'H', 'ローンで借りたお金は、銀行から家計へ。'],
    ['住宅ローンを、今月も銀行に返した', 'H', 'B', '借りたお金の返済は、家計から銀行へ。'],
    ['子育ての家に、国から手当が振りこまれた', 'G', 'H', '児童手当などは、政府から家計へ。'],
    ['会社が、使う予定のないお金を銀行にあずけた', 'F', 'B', '企業も、銀行にお金をあずけます。'],
    ['国が、省エネの機械を入れた工場に補助金を出した', 'G', 'F', '補助金は、政府から企業へ。'],
    ['美容院で、髪を切ってもらった', 'H', 'F', 'サービスの代金も、家計から企業へ。'],
    ['アルバイト代が、口座に振りこまれた', 'F', 'H', 'バイト代も給料。企業から家計へ。']
  ];
  const g = document.createElement('div');
  g.className = 'mq';
  box.after(g);
  g.insertAdjacentHTML('beforebegin', '<p class="mq-sub"><span aria-hidden="true">験</span>スピード勝負：めぐりの図を見たら、お金を配達してみよう</p>');
  let st = null, tick = 0;
  const node = k => `<button type="button" class="mq-n is-${k}" data-n="${k}"><span aria-hidden="true">${N[k][1]}</span><b>${N[k][0]}</b><small>${N[k][2]}</small></button>`;
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="mq-intro"><div class="mq-bag" aria-hidden="true"><i>円</i></div><div>
      <p class="mq-kicker">スピード勝負</p><h3 class="mq-h">お金の配達 40 秒</h3>
      <p class="mq-p">「コンビニで、おにぎりを買った」。このお金は、どこから、どこへ？ できごとを読んで、<b>お金が出ていくところ</b>、次に<b>お金が届くところ</b>の順に押そう。家計・企業・銀行・政府の 4 つです。続けて当てると点が上がり、まちがえると 3 秒へります。</p>
      <p class="mq-best">${b ? `自己ベスト <b>${b}</b> 点` : 'はじめての配達'}</p>
      <button type="button" class="mq-go" data-mq="start">配達を始める</button></div></div>`;
  };
  const start = () => {
    st = { score: 0, streak: 0, ok: 0, miss: [], end: performance.now() + TIME * 1000, lock: false, from: null, last: -1 };
    g.innerHTML = `<div class="mq-play">
      <div class="mq-top"><span class="mq-t"><b data-mq="t">${TIME}</b> 秒</span><span class="mq-st" data-mq="st"></span><span class="mq-sc">得点 <b data-mq="sc">0</b></span></div>
      <div class="mq-time" aria-hidden="true"><i data-mq="bar"></i></div>
      <p class="mq-ev" data-mq="ev"></p>
      <p class="mq-step" data-mq="step"></p>
      <div class="mq-map" data-mq="map">
        <svg class="mq-svg" aria-hidden="true"><line data-mq="line"/></svg>
        ${node('H')}${node('F')}${node('B')}${node('G')}
        <span class="mq-coin" data-mq="coin" aria-hidden="true">円</span>
      </div>
      <p class="mq-fb" data-mq="fb" aria-live="polite"></p></div>`;
    show();
    clearInterval(tick);
    tick = setInterval(() => {
      if (!st) return;
      const left = Math.max(0, (st.end - performance.now()) / 1000);
      g.querySelector('[data-mq="t"]').textContent = Math.ceil(left);
      const bar = g.querySelector('[data-mq="bar"]'); bar.style.transform = `scaleX(${(left / TIME).toFixed(3)})`; bar.classList.toggle('is-low', left < 10);
      if (left <= 0) finish();
    }, 100);
  };
  const show = () => {
    let k; do { k = Math.random() * EV.length | 0; } while (k === st.last); st.last = k; st.q = EV[k]; st.from = null;
    const ev = g.querySelector('[data-mq="ev"]'); ev.textContent = st.q[0]; ev.classList.remove('is-in'); void ev.offsetWidth; ev.classList.add('is-in');
    g.querySelector('[data-mq="step"]').innerHTML = '<b>1</b> お金が<em>出ていく</em>ところは？';
    g.querySelectorAll('.mq-n').forEach(n => n.classList.remove('is-from', 'is-to', 'is-ok', 'is-ng'));
    g.querySelector('[data-mq="line"]').setAttribute('class', '');
  };
  const center = el => { const m = g.querySelector('[data-mq="map"]').getBoundingClientRect(), r = el.getBoundingClientRect(); return [r.left - m.left + r.width / 2, r.top - m.top + r.height / 2]; };
  const fly = (a, b, ok) => {
    const [x1, y1] = center(a), [x2, y2] = center(b), ln = g.querySelector('[data-mq="line"]'), c = g.querySelector('[data-mq="coin"]');
    ln.setAttribute('x1', x1); ln.setAttribute('y1', y1); ln.setAttribute('x2', x2); ln.setAttribute('y2', y2); ln.setAttribute('class', ok ? 'is-ok' : 'is-ng');
    if (reduce) return;
    c.style.transition = 'none'; c.style.transform = `translate(${x1}px, ${y1}px) scale(.6)`; c.style.opacity = 1; void c.offsetWidth;
    c.style.transition = 'transform .55s cubic-bezier(.4, 0, .2, 1), opacity .3s .5s'; c.style.transform = `translate(${x2}px, ${y2}px) scale(1)`; c.style.opacity = 0;
  };
  const mult = () => 1 + Math.min(st.streak, 8) * 0.25;
  const tap = k => {
    if (!st || st.lock) return;
    const n = g.querySelector(`[data-n="${k}"]`);
    if (!st.from) { st.from = k; n.classList.add('is-from'); g.querySelector('[data-mq="step"]').innerHTML = `<b>2</b> ${N[k][0]}から、お金が<em>届く</em>ところは？`; return; }
    if (k === st.from) { st.from = null; n.classList.remove('is-from'); g.querySelector('[data-mq="step"]').innerHTML = '<b>1</b> お金が<em>出ていく</em>ところは？'; return; }
    const q = st.q, ok = st.from === q[1] && k === q[2], fb = g.querySelector('[data-mq="fb"]');
    n.classList.add('is-to');
    g.querySelector('[data-mq="step"]').innerHTML = `<b>${ok ? '○' : '×'}</b> ${N[q[1]][0]} → ${N[q[2]][0]}`;
    const A = g.querySelector(`[data-n="${q[1]}"]`), B = g.querySelector(`[data-n="${q[2]}"]`);
    if (ok) { st.streak++; st.ok++; const pts = Math.round(10 * mult()); st.score += pts; fb.className = 'mq-fb is-ok'; fb.innerHTML = `<b>配達成功 ＋${pts}</b>${q[3]}`; fly(A, B, true); }
    else { st.streak = 0; st.end -= 3000; st.miss.push(q); fb.className = 'mq-fb is-ng'; fb.innerHTML = `<b>正しくは ${N[q[1]][0]} → ${N[q[2]][0]}</b>${q[3]}`; g.querySelectorAll('.mq-n').forEach(x => x.classList.remove('is-from', 'is-to')); A.classList.add('is-from'); B.classList.add('is-to'); fly(A, B, false); }
    g.querySelector('[data-mq="sc"]').textContent = st.score;
    g.querySelector('[data-mq="st"]').textContent = st.streak >= 3 ? `${st.streak} 連続 ×${mult().toFixed(2).replace(/0$/, '')}` : '';
    st.lock = true;
    setTimeout(() => { if (!st) return; st.lock = false; fb.className = 'mq-fb'; fb.innerHTML = ''; show(); }, ok ? (reduce ? 400 : 1200) : 2600);
  };
  const TITLE = [[180, '名配達人', '極'], [100, 'たよれる配達人', '良'], [40, '配達の見習い', '見'], [0, 'これから道を覚えよう', '初']];
  const finish = () => {
    clearInterval(tick);
    const s = st; st = null;
    const prev = getB(), best = s.score > prev;
    try { if (best) localStorage.setItem(KEY, String(s.score)); } catch (e) {}
    const ti = TITLE.findIndex(x => s.score >= x[0]);
    g.innerHTML = `<div class="mq-end">
      <p class="mq-kicker">本日の配達</p>
      <p class="mq-big"><b>${s.score}</b> 点<small>成功 ${s.ok}・まちがい ${s.miss.length}</small></p>
      <p class="mq-title"><span aria-hidden="true">${TITLE[ti][2]}</span>${TITLE[ti][1]}${best ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${prev} 点</small>` : ''}</p>
      ${s.miss.length ? `<p class="mq-l">まちがえた配達</p><ul class="mq-miss">${s.miss.slice(0, 3).map(q => `<li><b>${q[0]}</b><span>${N[q[1]][0]} → ${N[q[2]][0]}</span></li>`).join('')}</ul>` : '<p class="mq-perfect">まちがいゼロ！ お金の道は、もうばっちりです。</p>'}
      <div class="mq-rule"><p class="mq-l">めぐりの 4 つの道</p><ul><li>家計 ⇄ 企業：買い物の代金と、給料</li><li>家計・企業 → 政府：税金。政府 → 家計・企業：年金・手当・工事の代金・補助金</li><li>家計・企業 ⇄ 銀行：預金と貸し出し、そして利息</li></ul></div>
      <button type="button" class="mq-go" data-mq="start">もう一度配達する</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(g.querySelector('.mq-end'), 'meguri', ti, TITLE.length);
  };
  g.addEventListener('click', e => {
    const n = e.target.closest('[data-n]'); if (n) { tap(n.dataset.n); return; }
    if (e.target.closest('[data-mq="start"]')) start();
  });
  intro();
})();
