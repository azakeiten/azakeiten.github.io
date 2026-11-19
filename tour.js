/* ================================================================
   tour.js — 「お札マンと、このページを回る」（案内ツアー。トップ・クイズ・経済ラボ・用語辞典・麻布経済展）
   ・[data-tour] を押したときだけ読みこむ（site.js）
   ・お札マン（仮）が右下に出て、ページの段へ順にスクロールし、その段にスポットライトを当てて説明する
   ・「次へ」「前へ」、→ ← キー、Esc でおわる。自分のペースで進む
   ・せりふは、その段に書いてあることだけ
   ================================================================ */
(function() {
  if (window.AZAKEI_TOUR) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = s => typeof s === 'function' ? s() : document.querySelector(s);
  // ページごとの案内。[場所, せりふ（1〜2 文）, 顔]
  const TOURS = {};
  TOURS['index.html'] = [
    ['.ap-intro', ['こんにちは、お札マン（仮）だよ。このページを、いっしょに回ろう！', '麻経は、麻布中学校・高等学校の経済系同好会。経済を、勉強から体験にしているんだ。'], 'happy'],
    ['.st3', ['麻経のめざすことは、この 3 つ。親しんで、知って、つくる。', 'カードの中の名前を押すと、それぞれの遊びに行けるよ。']],
    ['#scenes', ['文化祭の「麻布経済展」は、教室ひとつを経済の町にした体験型の展示。', '4 つの場面で、中の様子がわかるよ。']],
    ['#overview', ['このサイトでできることは、ここにまとまっているよ。', 'クイズ、経済ラボ、用語辞典……気になるものから押してみて。'], 'happy'],
    ['#corners', ['展示の 6 つのコーナーのうち 4 つは、家でも Web で遊べるんだ。']],
    ['.npl-wrap', ['「新しく遊べるもの」には、最近ふえた遊びがならんでいるよ。', 'ときどきのぞいてみてね。']],
    ['.ecm-wrap', ['今日は、経済の何の日？', '経済の暦は、毎日変わるんだ。'], 'wow'],
    [() => { const c = document.getElementById('ch-next'); let n = c && c.nextElementSibling; while (n && n.tagName !== 'SECTION') n = n.nextElementSibling; return n; }, ['これからの予定は、ここで見られるよ。']],
    ['.ap-end', ['最後まで、ありがとう！', '気になったところから、遊んでみてね。いつでも、またぼくが案内するよ。'], 'happy']
  ];
  TOURS['quiz.html'] = [
    ['.page-hero', ['あそび場へようこそ。ここには、26 の遊びがあるよ。'], 'happy'],
    ['.gn-wrap', ['このきっぷから、遊びたいものへ飛べるよ。遊んだものには「済」のはんこ、記録も出るんだ。']],
    ['#quiz', ['億万長者クイズは、文化祭で人気だったチップのクイズ。', '賭ける枚数と難しさを選んで、2 問に挑戦するよ。']],
    ['#crossword', ['経済クロスワードは、14 のカギを解くパズル。'], 'think'],
    ['#shinka', ['お金の進化では、物々交換から電子のお金まで、6 つの場面をめくれるよ。']],
    ['#ehon', ['絵本では、1 枚の千円札が町をめぐるお話を読めるよ。ぼくも出てくるんだ。'], 'happy'],
    ['#koukan', ['交換の島では、物々交換とお金をくらべられる。', 'お金があると、なぜ楽になるのか。自分の手で確かめてね。'], 'wow'],
    ['#otsuri', ['おつりの達人は、60 秒でおつりをわたすタイムアタック。']],
    ['#taikai', ['クイズ大会では、班対抗で遊べるよ。教室のプロジェクターに映して使ってね。'], 'happy'],
    ['#make', ['さいごは、問題をつくってみよう。遊ぶ側から、つくる側へ！'], 'happy']
  ];
  TOURS['sim.html'] = [
    ['.page-hero', ['経済ラボへようこそ。動かして確かめる実験が、たくさんあるよ。'], 'happy'],
    ['[data-lab-board]', ['16 の実験は、この一覧から選べるよ。']],
    ['#meguri', ['まずは、お金のめぐり。', '矢印の上をコインが流れて、押すとその流れの意味がわかるんだ。']],
    ['#pazuru', ['めぐりパズルでは、6 本の矢印に札をはめるよ。ぜんぶ合うと、お金が流れだすんだ。'], 'wow'],
    ['#koubou', ['仕組みをつくる工房では、10 人の村の税の仕組みを、自分で決められる。', '正解は、ひとつじゃないよ。'], 'think'],
    ['#tsuuka', ['お祭りの券の工房では、お祭りで使う遊び用の券のルールを決めるよ。', '券を出しすぎると、どうなるかな？'], 'think'],
    ['#double', ['72 の法則で、お金が 2 倍になるまでのおよその年数がわかるよ。'], 'wow'],
    ['#seri', ['せりの会場では、4 人と札を上げて競りあうよ。', '自分にとっての価値より高く買わないように、気をつけて！'], 'wow'],
    ['#asagohan', ['朝ごはんの世界旅行では、お盆に朝ごはんをのせてみて。', '材料が、世界のどこから船で来るのか、地図の上でわかるよ。'], 'wow'],
    ['#kinri', ['景気の舵とりでは、日本銀行の会議のメンバーになるよ。', '金利を上げる？ 下げる？ 町のようすをよく見て決めてね。'], 'think'],
    ['#hoken', ['みんなで備える箱では、掛け金を決めて 10 年すすめてみて。', '箱が足りなくならない、ちょうどよい金額はいくらかな？'], 'think'],
    ['#ike', ['みんなの池では、ほかの 3 人と池の魚をとるよ。', '自分だけ多めにとったら、10 年後の池はどうなるかな？'], 'think'],
    ['#words', ['わからない言葉は、ここから辞典へ。いっしょに確かめよう！'], 'happy']
  ];
  TOURS['glossary.html'] = [
    ['.page-hero', ['用語辞典へようこそ。経済の言葉が、300 語あるよ。'], 'happy'],
    ['#gacha', ['ここからは、言葉で遊ぶコーナー。ゲームで、楽しく覚えられるよ。']],
    ['#shiritori', ['経済しりとりもあるよ。ぼくと勝負してみる？'], 'happy'],
    ['#karuta', ['ことばかるたでは、ぼくが説明を読むから、合う言葉の札をとってね。'], 'happy'],
    ['#g-basic', ['言葉は、分野ごとにならんでいるよ。まずは「経済の基本」から。']],
    ['#newsfind', ['ニュースの言葉さがしでは、記事を貼りつけると、辞典にある言葉に印がつくよ。'], 'wow'],
    ['#nenpyo', ['年表では、経済の歴史を年の順にたどれるよ。']],
    ['#jugyou', ['先生向けに、授業で使える 50 分の流れも 3 つあるよ。']],
    ['#sheet', ['ことばプリントもつくれる。印刷して使ってね。'], 'happy']
  ];
  TOURS['festival.html'] = [
    ['.page-hero', ['麻布経済展のページだよ。文化祭の展示を、ぼくが紹介するね。'], 'happy'],
    ['#aim', ['麻布経済展が目指したことは、ここに書いてあるよ。']],
    ['#story', ['3 日間の様子は、ここで見られるよ。']],
    ['#exhibition', ['展示の仕組みとルールを、くわしく紹介しているよ。'], 'think'],
    ['#room', ['会場を 3D で歩けるんだ。ドラッグで回してみて。'], 'wow'],
    ['#athome', ['家でも、麻布経済展を回れるよ。']],
    ['#bill', ['自分だけの麻経券（遊び用の券）を、デザインできるよ。ぼくの体と同じ、お札の形だね。'], 'happy'],
    ['#next', ['次の文化祭は、2027 年 5 月の予定。準備の流れは、ここで見られるよ。']]
  ];
  const PAGE = location.pathname.split('/').pop() || 'index.html';
  const STOPS = (TOURS[PAGE] || []).filter(s => q(s[0]));
  window.AZAKEI_TOUR_PAGES = Object.keys(TOURS);

  const MAN = `<svg viewBox="0 0 120 112" aria-hidden="true">
    <g stroke="#6b4a22" stroke-width="3.5" stroke-linecap="round"><path d="M50 76 L46 96"/><path d="M70 76 L74 96"/></g>
    <ellipse cx="44" cy="98" rx="7" ry="3.5" fill="#6b4a22"/><ellipse cx="76" cy="98" rx="7" ry="3.5" fill="#6b4a22"/>
    <g class="tr-arm"><path d="M22 54 L8 62" stroke="#6b4a22" stroke-width="3.5" stroke-linecap="round"/><circle cx="7" cy="63" r="4.5" fill="#fffaf0" stroke="#6b4a22" stroke-width="2"/></g>
    <path d="M98 52 L111 38" stroke="#6b4a22" stroke-width="3.5" stroke-linecap="round"/><circle cx="112" cy="36" r="4.5" fill="#fffaf0" stroke="#6b4a22" stroke-width="2"/>
    <rect x="20" y="28" width="80" height="50" rx="7" fill="#e6d5b3" stroke="#6b4a22" stroke-width="3"/>
    <rect x="26" y="34" width="68" height="38" rx="3" fill="none" stroke="#6b4a22" stroke-width="1.4" opacity=".6"/>
    <g fill="#2f6b3a"><polygon points="35,37 41,47 29,47"/><polygon points="35,50 29,40 41,40"/></g>
    <g class="tr-e-n" fill="#2a2015"><ellipse cx="54" cy="50" rx="3.6" ry="4.2"/><ellipse cx="72" cy="50" rx="3.6" ry="4.2"/></g>
    <g class="tr-e-h" fill="none" stroke="#2a2015" stroke-width="2.6" stroke-linecap="round"><path d="M50 52 Q54 46 58 52"/><path d="M68 52 Q72 46 76 52"/></g>
    <g class="tr-e-w"><circle cx="54" cy="49" r="5.2" fill="#fff" stroke="#2a2015" stroke-width="1.8"/><circle cx="72" cy="49" r="5.2" fill="#fff" stroke="#2a2015" stroke-width="1.8"/><circle cx="54" cy="49.5" r="2.6" fill="#2a2015"/><circle cx="72" cy="49.5" r="2.6" fill="#2a2015"/></g>
    <circle cx="48" cy="59" r="4.2" fill="#f0957c" opacity=".55"/><circle cx="78" cy="59" r="4.2" fill="#f0957c" opacity=".55"/>
    <path class="tr-m0" d="M57 58 Q63 64 69 58" fill="none" stroke="#2a2015" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse class="tr-m1" cx="63" cy="60" rx="5" ry="4" fill="#7a2b1c" stroke="#2a2015" stroke-width="1.6"/>
    <text x="88" y="70" font-family="Shippori Mincho, serif" font-weight="800" font-size="9" fill="#b5432f" text-anchor="middle">経</text>
  </svg>`;

  const CSS = `
  .tr-spot { position: fixed; z-index: 8000; border-radius: 22px; pointer-events: none; box-shadow: 0 0 0 4px #b5432f, 0 0 0 9999px rgba(15, 13, 11, .55); transition: opacity .4s; opacity: 0; }
  .tr-spot.is-on { opacity: 1; }
  .tr { position: fixed; right: clamp(10px, 3vw, 32px); bottom: calc(14px + env(safe-area-inset-bottom)); z-index: 8001; display: flex; align-items: flex-end; gap: 4px; max-width: calc(100vw - 20px); font-family: 'Hiragino Sans', 'BIZ UDPGothic', 'Yu Gothic UI', Meiryo, sans-serif; }
  .tr-man { width: clamp(84px, 9vw, 120px); flex: none; filter: drop-shadow(0 14px 18px rgba(0, 0, 0, .35)); transform-origin: 50% 100%; animation: tr-in .7s cubic-bezier(.2, 1.4, .4, 1) both, tr-idle 2.6s ease-in-out .7s infinite; }
  .tr-man svg { display: block; width: 100%; height: auto; overflow: visible; }
  @keyframes tr-in { from { transform: translateX(130%) rotate(14deg); opacity: 0; } to { transform: none; opacity: 1; } }
  @keyframes tr-idle { 50% { transform: translateY(-4px); } }
  .tr.is-hop .tr-man { animation: tr-hop .5s cubic-bezier(.3, 1.6, .5, 1), tr-idle 2.6s ease-in-out .5s infinite; }
  @keyframes tr-hop { 40% { transform: translateY(-18px) rotate(-5deg); } }
  .tr-e-h, .tr-e-w, .tr-m1 { opacity: 0; }
  .tr.is-happy .tr-e-n, .tr.is-wow .tr-e-n { opacity: 0; } .tr.is-happy .tr-e-h, .tr.is-wow .tr-e-w { opacity: 1; }
  .tr.is-talk .tr-m0 { opacity: 0; } .tr.is-talk .tr-m1 { opacity: 1; transform-box: fill-box; transform-origin: center; animation: tr-mouth .18s ease-in-out infinite alternate; }
  @keyframes tr-mouth { from { transform: scaleY(.25); } }
  .tr-arm { transform-box: fill-box; transform-origin: 100% 0; transition: transform .4s cubic-bezier(.2, 1.4, .4, 1); } .tr.is-talk .tr-arm { transform: rotate(52deg); }
  .tr-b { position: relative; width: min(440px, calc(100vw - 130px)); margin-bottom: 40px; padding: 12px 16px 12px; border-radius: 18px 18px 4px 18px; background: #fffaf0; color: #2a2015; border: 2px solid #6b4a22; box-shadow: 0 16px 36px rgba(0, 0, 0, .3); animation: tr-b .45s cubic-bezier(.2, 1.3, .4, 1) .3s both; }
  @keyframes tr-b { from { opacity: 0; transform: translateY(10px) scale(.95); } }
  .tr-b::after { content: ''; position: absolute; right: -11px; bottom: 12px; width: 16px; height: 16px; background: #fffaf0; border-right: 2px solid #6b4a22; border-bottom: 2px solid #6b4a22; transform: rotate(-45deg); }
  .tr-h { display: flex; align-items: center; gap: 8px; margin: 0 0 2px; font-size: 11.5px; font-weight: 800; color: #b5432f; letter-spacing: .06em; }
  .tr-h small { color: #8a7a62; letter-spacing: 0; font-weight: 700; }
  .tr-n { margin-left: auto; color: #8a7a62; font-weight: 700; letter-spacing: 0; }
  .tr-t { min-height: 3.3em; margin: 0 0 8px; font-size: 15px; font-weight: 700; line-height: 1.65; }
  .tr.is-talk .tr-t::after { content: ''; display: inline-block; width: .45em; height: 1em; margin-left: 2px; vertical-align: -.12em; background: #b5432f; animation: tr-c .5s steps(1) infinite; }
  @keyframes tr-c { 50% { opacity: 0; } }
  .tr-ctl { display: flex; gap: 6px; }
  .tr-ctl button { padding: 7px 14px; border-radius: 999px; border: 1px solid #c9b48c; background: transparent; color: #6b4a22; font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; }
  .tr-ctl button:disabled { opacity: .35; cursor: default; }
  .tr-ctl .tr-next { margin-left: auto; background: #b5432f; border-color: #b5432f; color: #fff; }
  .tr.is-ready .tr-next { animation: tr-pulse 1.4s ease-out infinite; }
  @keyframes tr-pulse { 0% { box-shadow: 0 0 0 0 rgba(181, 67, 47, .55); } 100% { box-shadow: 0 0 0 12px rgba(181, 67, 47, 0); } }
  .tr-dots { display: flex; gap: 4px; align-items: center; margin-right: 4px; }
  .tr-dots i { width: 6px; height: 6px; border-radius: 3px; background: #e2d6bd; transition: width .3s, background .3s; } .tr-dots i.is-on { width: 16px; background: #b5432f; }
  .tr[hidden], .tr-spot[hidden] { display: none; }
  @media (max-width: 560px) { .tr { left: 8px; right: 8px; } .tr-b { flex: 1; width: auto; margin-bottom: 26px; } .tr-man { width: 70px; } .tr-t { font-size: 14px; } }
  @media (prefers-reduced-motion: reduce) { .tr *, .tr-spot { animation: none !important; transition: none !important; } }`;

  let box, spot, n = 0, tok = 0, tm = null, raf = 0, target = null, lastFocus = null;
  const build = () => {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    spot = document.createElement('div'); spot.className = 'tr-spot'; spot.setAttribute('aria-hidden', 'true');
    box = document.createElement('div'); box.className = 'tr'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'お札マンの案内');
    box.innerHTML = `<div class="tr-b"><p class="tr-h">お札マン<small>（仮）</small><span class="tr-n"></span></p><p class="tr-t" aria-live="polite"></p>
      <div class="tr-ctl"><span class="tr-dots" aria-hidden="true">${STOPS.map(() => '<i></i>').join('')}</span><button type="button" class="tr-prev">前へ</button><button type="button" class="tr-x">おわる</button><button type="button" class="tr-next">次へ</button></div></div>
      <div class="tr-man">${MAN}</div>`;
    document.body.append(spot, box);
    box.querySelector('.tr-prev').onclick = () => go(n - 1);
    box.querySelector('.tr-next').onclick = () => n < STOPS.length - 1 ? go(n + 1) : stop();
    box.querySelector('.tr-x').onclick = stop;
  };
  // スポットライトを、いまの段の位置に合わせつづける
  const follow = () => {
    if (target) {
      const r = target.getBoundingClientRect(), pad = 8;
      const top = Math.max(r.top - pad, -4), bottom = Math.min(r.bottom + pad, innerHeight + 4);
      Object.assign(spot.style, { left: Math.max(r.left + pad, 6) + 'px', width: Math.min(r.width - pad * 2, innerWidth - 12) + 'px', top: top + 'px', height: Math.max(0, bottom - top) + 'px' });
    }
  };
  const onMove = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(follow); };
  const type = (txt, done) => {
    const t = box.querySelector('.tr-t'), my = tok; let k = 0;
    box.classList.add('is-talk');
    const step = () => {
      if (my !== tok) return;
      k = reduce ? txt.length : k + 1; t.textContent = txt.slice(0, k);
      if (k < txt.length) tm = setTimeout(step, /[、。！？]/.test(txt[k - 1]) ? 200 : 45);
      else { box.classList.remove('is-talk'); done(); }
    };
    step();
  };
  const go = i => {
    if (i < 0 || i >= STOPS.length) return;
    n = i; tok++; clearTimeout(tm);
    const [sel, lines, mood] = STOPS[n];
    target = q(sel);
    box.classList.remove('is-ready', 'is-happy', 'is-wow', 'is-hop'); void box.offsetWidth; box.classList.add('is-hop');
    if (mood) box.classList.add('is-' + mood);
    box.querySelector('.tr-n').textContent = `${n + 1} / ${STOPS.length}`;
    box.querySelectorAll('.tr-dots i').forEach((d, j) => d.classList.toggle('is-on', j === n));
    box.querySelector('.tr-prev').disabled = n === 0;
    box.querySelector('.tr-next').textContent = n === STOPS.length - 1 ? 'おわる' : '次へ';
    box.querySelector('.tr-t').textContent = '';
    // 段がちょうど見えるように（お札マンのふきだしに隠れないよう、少し上に）
    const r = target.getBoundingClientRect(), y = scrollY + r.top - Math.max(96, (innerHeight - Math.min(r.height, innerHeight * .62)) / 2 - 90);
    scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
    spot.classList.add('is-on'); follow();
    setTimeout(follow, 700);
    const my = tok;
    let k = 0;
    const next = () => { if (my !== tok) return; if (k >= lines.length) { box.classList.add('is-ready'); return; } const ln = lines[k++]; type(ln, () => { tm = setTimeout(next, 500); }); };
    tm = setTimeout(next, reduce ? 0 : 550);
  };
  const onKey = e => {
    const typing = e.target.closest && e.target.closest('input, textarea, select');
    if (e.key === 'Escape') stop();
    else if (e.key === 'ArrowRight' && !typing) { e.preventDefault(); n < STOPS.length - 1 ? go(n + 1) : stop(); }
    else if (e.key === 'ArrowLeft' && !typing) { e.preventDefault(); go(n - 1); }
  };
  const start = () => {
    if (!STOPS.length) return;
    if (!box) build();
    lastFocus = document.activeElement;
    box.hidden = false; spot.hidden = false;
    // 出てくる動きを毎回
    const m = box.querySelector('.tr-man'); m.style.animation = 'none'; void m.offsetWidth; m.style.animation = '';
    follow(); addEventListener("scroll", onMove, { passive: true }); addEventListener("resize", onMove);
    document.addEventListener('keydown', onKey);
    go(0);
    box.querySelector('.tr-next').focus({ preventScroll: true });
    try { localStorage.setItem('azakei_tour', '1'); } catch (e) {}
  };
  function stop() {
    tok++; clearTimeout(tm); cancelAnimationFrame(raf); target = null;
    removeEventListener("scroll", onMove); removeEventListener("resize", onMove);
    if (!box) return;
    box.hidden = true; spot.classList.remove('is-on'); spot.hidden = true;
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  window.AZAKEI_TOUR = { start, stop };
})();
