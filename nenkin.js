/* ================================================================
   nenkin.js — あそび場：胴上げから肩車へ（年金と少子高齢化・近づいてから読みこむ）
   ・65 歳以上の 1 人を、20〜64 歳の何人で支えるか。国の資料でよく使われる数字：
       1965 年 約 9.1 人（胴上げ型）／2012 年 約 2.4 人（騎馬戦型）／2050 年 約 1.2 人（肩車型・見通し）
   ・人形の組み方が、胴上げ → 騎馬戦 → 肩車 と変わる。1 人あたりの重さのメーターも
   ・2050 年に「くふう」を足すと、重さがどう変わるか（ここはたとえの計算）
   ・人形に顔はかかない。見た目は nenkin.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-nenkin]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="nenkin.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'nenkin.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const ERA = [
    { y: 1965, r: 9.1, t: '胴上げ型', d: 'お年寄り 1 人を、働く世代 約 9 人で支えていました。' },
    { y: 2012, r: 2.4, t: '騎馬戦型', d: 'お年寄り 1 人を、働く世代 約 2.4 人で支える形に。' },
    { y: 2050, r: 1.2, t: '肩車型', d: 'お年寄り 1 人を、働く世代 約 1.2 人で支える見通しです。' }
  ];
  const IDEA = [
    ['長', '70 歳まで働く人がふえる', '支える側にまわる人がふえる', { r: .3 }],
    ['働', '働きたい人が働きやすくなる', '子育てや介護をしながらでも働ける', { r: .2 }],
    ['機', '機械や AI で、1 人が生み出すものがふえる', '同じ人数でも、支える力が強くなる', { k: .8 }]
  ];
  const MAXW = 9;
  const worker = i => `<svg viewBox="0 0 40 72" aria-hidden="true"><path class="nk-arm" d="M9 30 L3 6 M31 30 L37 6"/><circle cx="20" cy="14" r="9" class="nk-head"/><path d="M8 70 Q8 28 20 26 Q32 28 32 70 Z" style="fill:hsl(${(i * 47 + 10) % 360} 42% 46%)"/></svg>`;
  const elder = `<svg viewBox="0 0 48 76" aria-hidden="true"><path class="nk-cane" d="M38 44 L42 74"/><circle cx="22" cy="14" r="10" class="nk-ehead"/><path class="nk-hair" d="M12 12 Q22 0 32 12"/><path d="M8 74 Q8 30 22 28 Q36 30 36 74 Z" class="nk-ebody"/><path class="nk-earm" d="M34 40 L40 46"/></svg>`;

  box.innerHTML = `
    <div class="nk-stage">
      <div class="nk-era" role="group" aria-label="時代">${ERA.map((e, i) => `<button type="button" data-e="${i}" aria-pressed="${i === 0}"><b>${e.y}</b><small>${e.t}</small></button>`).join('')}</div>
      <div class="nk-floor">
        ${Array.from({ length: MAXW }, (_, i) => `<span class="nk-w" data-w="${i}">${worker(i)}</span>`).join('')}
        <span class="nk-e">${elder}<em class="nk-e-tag">65 歳以上</em></span>
        <span class="nk-drop" aria-hidden="true"></span>
      </div>
      <div class="nk-read">
        <p class="nk-ratio"><span data-k="year">1965</span> 年<b data-k="ratio">9.1</b><span>人で 1 人を支える</span></p>
        <p class="nk-type" data-k="type">胴上げ型</p>
        <div class="nk-load"><p><span>働く人 1 人が支える重さ</span><b data-k="load">11%</b></p><div class="nk-meter"><i data-k="lbar"></i></div><small>お年寄り 1 人を支えるのに必要なものを 100% としたとき</small></div>
      </div>
      <p class="nk-msg" data-k="msg" aria-live="polite"></p>
      <button type="button" class="nk-play" data-a="play">時代を進める</button>
    </div>
    <div class="nk-ideas">
      <p class="nk-ideas-h"><span>2050 年に「くふう」を足すと</span><small>ここからは、しくみを知るための「たとえ」の計算です</small></p>
      <div class="nk-list">${IDEA.map(([s, t, d], i) => `<label class="nk-idea"><input type="checkbox" data-i="${i}"><span class="nk-s">${s}</span><b>${t}</b><small>${d}</small></label>`).join('')}</div>
    </div>
    <div class="nk-learn">
      <p><b>年金は、世代で支え合う</b>日本の年金は、いま働いている人が払う保険料で、いまのお年寄りの年金をまかなうしくみが中心です（積み立てたお金も使います）。だから、支える人の数が大切です（<a href="glossary.html#pension">年金</a>）。</p>
      <p><b>少子高齢化</b>生まれる子どもが減り、長生きする人がふえると、支える側が減って、支えられる側がふえます（<a href="glossary.html#aging">少子高齢化</a>）。</p>
      <p><b>20 歳から加入</b>日本に住む 20 歳以上 60 歳未満の人は、国民年金に加入します。学生のあいだは、保険料をあとで払える「学生納付特例」という制度もあります。</p>
      <p><b>数字の出どころ</b>20〜64 歳の人数を、65 歳以上の人数で割った数です。国の資料でよく使われています（2050 年は将来の見通し）。くふうの効果の数字は「たとえ」です（<a href="glossary.html#productivity">生産性</a>）。</p>
    </div>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const ws = [...box.querySelectorAll('.nk-w')], el = box.querySelector('.nk-e'), stage = box.querySelector('.nk-stage');
  let era = 0, ideas = [false, false, false], busy = false;

  // 支える人数 r にあわせて、人形を組みなおす
  const pose = (r, k) => {
    const n = Math.max(1, Math.min(MAXW, Math.round(r)));
    const type = n >= 6 ? 'dou' : n >= 2 ? 'kiba' : 'kata';
    stage.dataset.type = type;
    const gap = type === 'dou' ? 9.5 : 8.5;
    ws.forEach((w, i) => {
      const on = i < n, x = 50 + (i - (n - 1) / 2) * gap;
      w.classList.toggle('is-off', !on);
      w.style.left = (on ? x : (i % 2 ? 108 : -8)) + '%';
      w.style.setProperty('--d', (i * 40) + 'ms');
    });
    const load = Math.min(100, 100 / r * (k || 1));
    el.style.left = '50%';
    el.className = 'nk-e is-' + type;
    stage.style.setProperty('--strain', (load / 100).toFixed(2));
    K('load').textContent = Math.round(load) + '%';
    K('lbar').style.width = load.toFixed(1) + '%';
    K('lbar').className = load > 70 ? 'is-hi' : load > 35 ? 'is-mid' : '';
    return load;
  };
  const showEra = i => {
    era = i;
    box.querySelectorAll('[data-e]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.e === i));
    const e = ERA[i];
    let r = e.r, k = 1;
    if (i === 2) ideas.forEach((on, j) => { if (on) { r += IDEA[j][3].r || 0; k *= IDEA[j][3].k || 1; } });
    const load = pose(r, k);
    K('year').textContent = e.y; K('ratio').textContent = r.toFixed(1); K('type').textContent = i === 2 && ideas.some(Boolean) ? 'くふうを足すと' : e.t;
    const tweak = i === 2 && ideas.some(Boolean);
    K('msg').textContent = tweak ? `くふうを足すと、約 ${r.toFixed(1)} 人で 1 人を支える計算に。1 人あたりの重さは ${Math.round(load)}% になります（たとえ）。` : e.d + (i === 2 ? ' 1 人ひとりの重さは、1965 年の約 7.6 倍です。' : '');
    box.querySelector('.nk-ideas').classList.toggle('is-on', i === 2);
  };
  const play = async () => {
    if (busy) return; busy = true; box.classList.add('is-busy');
    for (let i = 0; i < ERA.length; i++) { showEra(i); await sleep(2600); }
    busy = false; box.classList.remove('is-busy');
    box.querySelector('[data-a="play"]').textContent = 'もう一度、時代を進める';
    try { localStorage.setItem('azakei_nenkin', '1'); } catch (e) {}
  };

  box.addEventListener('click', e => {
    const b = e.target.closest('[data-e]');
    if (b && !busy) { showEra(+b.dataset.e); return; }
    if (e.target.closest('[data-a="play"]')) play();
  });
  box.addEventListener('change', e => {
    const c = e.target.closest('[data-i]'); if (!c) return;
    ideas[+c.dataset.i] = c.checked;
    if (!busy) showEra(2);
    try { localStorage.setItem('azakei_nenkin', '1'); } catch (err) {}
  });
  showEra(0);
})();
