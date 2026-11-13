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
