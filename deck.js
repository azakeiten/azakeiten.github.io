/* ================================================================
   deck.js — 「1 分でわかる麻経」スライド（画面いっぱいの紹介）
   ・[data-deck] を押したとき、または URL が #deck のときに開く（site.js から読みこむ）
   ・自動で進む。← → キー・スワイプ・画面の左右を押しても動く。Esc で閉じる
   ・段（親しむ → 知る → つくる）が変わるところで、大きな印が出る
   ・「発表」（N キー）：自動送りを止め、話す台本・経過時間・次のスライドを出す（部員が人前で話すとき用）
   ・「一覧」（G キー）：全部のスライドを並べて、好きな場面へ
   ・「指し棒」（L キー）：赤い光の点。「ペン」（D キー）：スライドに書きこむ（C で消す。スライドを変えると消える）
   ・発表者メモの「別の画面で台本を開く」：もう 1 つの窓に、台本・経過時間・目標との差・次のスライド
   ・数字は、サイトのほかのページに出ているものだけ
   ================================================================ */
(function() {
  if (window.AZAKEI_DECK) return;
  // 麻経のめざすこと：経済に「親しむ」→ 仕組みを「知る」→ 自分たちで仕組みを「つくる」。step は 0・1・2（なしは全体の話）
  const STEPS = [['親', '親しむ'], ['知', '知る'], ['創', 'つくる']];
  const S = [
    { k: '表紙', seal: '麻', img: 'hero-s.jpg', t: 'AZAKEI<span>麻経</span>', s: '世の中の仕組みを理解し、<br>自らで仕組みを創り出す。<small>麻布中学校・高等学校の経済系同好会（2025 年〜）</small>', cls: 'is-cover',
      n: '麻布中学校・高等学校の経済系同好会、麻経（AZAKEI）です。合言葉は「世の中の仕組みを理解し、自らで仕組みを創り出す」。1 分ほどで、わたしたちの活動を紹介します。' },
    { k: '麻経のめざすこと', seal: '志', t: '経済を、<br>勉強から体験へ。', s: '経済は、教科書の中だけのものではありません。まず遊んで親しみ、その仕組みを知り、こんどは自分たちで仕組みをつくる。この 3 つを、ぐるぐる回しています。', cls: 'is-purpose', steps: true,
      n: 'わたしたちがやっていることは、3 つの段に分けられます。親しむ、知る、つくる。この順に、紹介していきます。' },
    { k: '親しむ', step: 0, img: 'photos/s/star-door.jpg', t: '教室ひとつを、<br>経済の町に。', s: '文化祭の体験型展示「麻布経済展」。入口でチップを受けとり、6 つのコーナーで遊びながら、チップが増える・減るを体で感じます。',
      n: 'まず「親しむ」。文化祭では、教室ひとつを経済の町にした「麻布経済展」を開いています。入口でチップを受けとって、6 つのコーナーで遊びます。' },
    { k: '親しむ', step: 0, num: '2,364', u: '人', t: '3 日間で、2,364 人が<br>経済で遊んだ。', s: '2026 年の文化祭。1 日目 492 人、2 日目 1,152 人、3 日目 720 人。', bars: [492, 1152, 720],
      n: '2026 年の文化祭では、3 日間で 2,364 人が来てくれました。いちばん多かったのは 2 日目の 1,152 人です。' },
    { k: '親しむ', step: 0, seal: '試', t: 'この場で、<br>ひとつ選んでください。', s: 'A：かならず 100 チップもらえる。　B：コインを投げて、表なら 200 チップ、裏なら 0。', cls: 'is-try', tryit: true, dur: 12000,
      n: '会場のみなさんに、ひとつ質問です。A は、かならず 100 チップ。B は、コインの表なら 200、裏なら 0。どちらを選びますか。手をあげてもらってから、コインを投げます。どちらが正しい、ということはありません。「確実」と「ふえるかも」をくらべる気持ちが、経済のリスクの考え方の入口です。' },
    { k: '知る', step: 1, img: 'photos/s/room-diagnosis.jpg', t: '遊んだあとに、<br>仕組みを知る。', s: 'なぜチップが増えたのか、減ったのか。お金は、家計・企業・銀行・政府のあいだを、どうめぐっているのか。Web でも、図や辞典で確かめられます。', chips: ['用語辞典 300 語', 'お金のめぐりの図', '経済ラボ 16 の実験', 'クイズ 84 問'],
      n: '次に「知る」。遊んだあとで、なぜチップが増えたのか、減ったのかを考えます。ホームページには、用語辞典 300 語、経済ラボの 16 の実験、クイズ 84 問があります。' },
    { k: '知る', step: 1, seal: '巡', t: 'お金は、<br>めぐっている。', s: '給料をもらい、買い物をし、預けたお金は貸し出され、税金は道路や学校になる。一人の 1 万円も、町の中をぐるりと回っています。', cls: 'is-flow', flow: true,
      n: 'たとえば、お金のめぐり。家計は働いて給料をもらい、企業から物を買います。預けたお金は銀行から企業に貸し出され、税金は道路や学校になって返ってきます。こうした仕組みを、図や実験で知ることができます。' },
    { k: 'つくる', step: 2, img: 'photos/s/room-paper.jpg', t: '仕組みを、<br>自分たちの手で。', s: '展示のゲームとルール、オリジナルの紙幣、会場の飾り。どれも部員が考えて、つくりました。遊ぶ側から、仕組みをつくる側へ。',
      n: '最後に「つくる」。展示のゲームやルール、オリジナルの紙幣、会場の飾りは、部員が考えてつくりました。遊ぶ側から、仕組みをつくる側にまわります。' },
    { k: 'つくる', step: 2, seal: '設', t: 'お金ひとつにも、<br>決めることがある。', s: '何枚つくるか。いくらの価値にするか。どうやって増え、どこで使えるか。紙幣を 1 枚つくることは、小さな経済の仕組みを 1 つ設計することです。', cls: 'is-bill', bill: true,
      n: 'たとえば、会場で使うお金を 1 枚つくるだけでも、何枚つくるか、いくらの価値にするか、どこで使えるかを決めなければいけません。お金をつくることは、仕組みを設計することだと気づきました。' },
    { k: 'つくる', step: 2, num: '2', u: '大会', t: '学校の外でも、<br>仕組みを考える。', s: '日経ストックリーグでは、企業を調べてポートフォリオを組んでいます。高校生ビジネスプラン・グランプリには、事業のプランをつくって応募しました。',
      n: '学校の外でも挑戦しています。日経ストックリーグでは企業を調べてポートフォリオを組み、高校生ビジネスプラン・グランプリには事業のプランをつくって応募しました。' },
    { k: 'めぐる', seal: '環', t: 'つくった仕組みで、<br>次の人が経済に親しむ。', s: 'つくった展示で、また誰かが経済を身近に感じる。親しむ → 知る → つくる の輪を、麻経は少しずつ大きくしていきます。', cls: 'is-cycle', cycle: true,
      n: 'そして、わたしたちがつくった展示で、また次の人が経済に親しみます。親しむ、知る、つくるの輪を、少しずつ大きくしていきたいと考えています。' },
    { k: 'まとめ', seal: '要', t: '今日、お伝えしたこと。', s: 'ご質問があれば、どうぞ。', cls: 'is-sum', sum: [['親', '親しむ', '教室ひとつを経済の町に。3 日間で 2,364 人が遊んだ。'], ['知', '知る', '遊んだあとに、お金のめぐりと仕組みを知る。'], ['創', 'つくる', 'お金やルールを、自分たちの手で設計する。']], dur: 8000,
      n: 'まとめます。親しむ：教室ひとつを経済の町にして、3 日間で 2,364 人が遊びました。知る：遊んだあとに、お金のめぐりと仕組みを知ります。つくる：お金やルールを、自分たちの手で設計します。ご質問があれば、どうぞ。（質問の間は、この画面のままにしておけます）' },
    { k: 'いっしょに', seal: '結', t: '一緒に、<br>仕組みをつくりませんか。', s: '協賛・取材・見学のご相談を、お待ちしています。<br>Instagram @azakei_vlog ／ azakeiten.github.io', cls: 'is-end', cta: true,
      n: '協賛や取材、見学のご相談をお待ちしています。Instagram は @azakei_vlog、ホームページは azakeiten.github.io です。ありがとうございました。' }
  ];
  const DUR = 5500;
  const dur = n => S[n].dur || DUR;
  let el, i = 0, timer = null, playing = true, startAt = 0, left = DUR, lastFocus = null, note = false, t0 = 0, clock = null, prevI = -1, tool = '', pv = null, pvT0 = 0, pvClock = null;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const label = s => s.step !== undefined ? STEPS[s.step][0] : s.seal;
  const plain = h => h.replace(/<small>.*?<\/small>/g, '').replace(/<span>(.*?)<\/span>/g, ' $1').replace(/<br>/g, '');

  // 見出しは 1 行ずつ、下からせり上がる
  const lines = (t, cover) => cover ? t : t.split('<br>').map((l, j) => `<span class="dk-l" style="--l:${j}"><span>${l}</span></span>`).join('');

  // 知る：お金のめぐり（4 つの場所のあいだを、点が流れる）
  const FLOW = () => {
    const N = { h: [70, 150, '家計'], c: [330, 150, '企業'], b: [200, 40, '銀行'], g: [200, 262, '政府'] };
    const E = [['h', 'c', -26, '代金'], ['c', 'h', -26, '給料'], ['h', 'b', 0, '預金'], ['b', 'c', 0, '貸出'], ['h', 'g', 0, '税金'], ['g', 'h', 30, '公共サービス']];
    const path = ([a, b, bend]) => { const [x1, y1] = N[a], [x2, y2] = N[b], mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy); return `M${x1} ${y1}Q${mx - dy / L * bend} ${my + dx / L * bend} ${x2} ${y2}`; };
    return `<div class="dk-flow" aria-hidden="true"><svg viewBox="0 0 400 300">
      ${E.map((e, j) => `<path id="dkf${j}" d="${path(e)}" class="dk-f-p"/>`).join('')}
      ${E.map((e, j) => [0, 1].map(k => `<circle r="5" class="dk-f-d${j % 2 ? ' is-b' : ''}"><animateMotion dur="${3 + j * .35}s" begin="${k * 1.6 + j * .2}s" repeatCount="indefinite" rotate="auto"><mpath href="#dkf${j}"/></animateMotion></circle>`).join('')).join('')}
      ${Object.values(N).map(([x, y, t], j) => `<g class="dk-f-n" style="--j:${j}" transform="translate(${x},${y})"><rect x="-40" y="-22" width="80" height="44" rx="10"/><text y="7">${t}</text></g>`).join('')}
    </svg><p class="dk-f-leg">${E.map(e => `<span>${N[e[0]][2]} → ${N[e[1]][2]}<b>${e[3]}</b></span>`).join('')}</p></div>`;
  };
  // つくる：紙幣を 1 枚、線で描いていく（見本）
  const BILL = () => `<div class="dk-bill" aria-hidden="true"><svg viewBox="0 0 360 190">
      <rect x="6" y="6" width="348" height="178" rx="12" class="dk-b-o"/><rect x="20" y="20" width="320" height="150" rx="6" class="dk-b-i"/>
      <circle cx="96" cy="95" r="44" class="dk-b-i"/><path d="M70 95h52M96 69v52M78 77l36 36M114 77l-36 36" class="dk-b-i"/>
      <path d="M170 60h140M170 132h140" class="dk-b-i"/>
      <text x="240" y="106" class="dk-b-t">麻経券</text><text x="320" y="160" class="dk-b-s">見本</text><text x="40" y="44" class="dk-b-n">100</text>
    </svg><ul class="dk-b-q">${['何枚つくる？', 'いくらの価値？', 'どう増える？', 'どこで使える？'].map((q, j) => `<li style="--j:${j}">${q}</li>`).join('')}</ul><a class="dk-b-go" href="sim.html#tsuuka">工房で、お金をつくってみる</a></div>`;
  // 親しむ：この場で選ぶ（A か B か。コインはこの画面の中だけ）
  const TRY = () => `<div class="dk-try"><div class="dk-try-ab"><button type="button" data-ab="A"><b>A</b>かならず<em>100</em>チップ</button><div class="dk-coin" aria-hidden="true"><span class="dk-coin-f">表</span><span class="dk-coin-b">裏</span></div><button type="button" data-ab="B"><b>B</b>表なら<em>200</em>裏なら 0</button></div>
      <p class="dk-try-r" aria-live="polite">A か B を押すと、コインを投げます。</p></div>`;

  const slideHTML = (s, n) => `<section class="dk-s ${s.cls || ''}" data-n="${n}" aria-roledescription="スライド" aria-label="${n + 1} / ${S.length}：${s.k}">
      ${s.img ? `<div class="dk-bg"><img src="${s.img}" alt="" decoding="async"${n > 1 ? ' loading="lazy"' : ''}></div>` : ''}
      <div class="dk-in">
        <p class="dk-k"><span>${label(s)}</span>${s.step !== undefined ? `${['一', '二', '三'][s.step]}　${s.k}` : s.k}</p>
        ${s.num ? `<p class="dk-num"><b data-to="${s.num.replace(/,/g, '')}">${s.num}</b><small>${s.u}</small></p>` : ''}
        <h2 class="dk-t">${lines(s.t, s.cls === 'is-cover')}</h2>
        <p class="dk-sub">${s.s}</p>
        ${s.bars ? `<div class="dk-bars">${s.bars.map((v, j) => `<span style="--h:${Math.round(v / Math.max(...s.bars) * 100)}%"><i>${v.toLocaleString('ja-JP')}</i><em>${j + 1} 日目</em></span>`).join('')}</div>` : ''}
        ${s.chips ? `<ul class="dk-chips">${s.chips.map((c, j) => `<li style="--j:${j}">${c}</li>`).join('')}</ul>` : ''}
        ${s.steps ? `<ol class="dk-3">${STEPS.map(([k, t], j) => `<li style="--j:${j}"><span>${k}</span><b>${t}</b><small>${['遊んで、経済を身近に感じる', 'お金の流れと、その仕組みを知る', '自分たちで、仕組みを創り出す'][j]}</small></li>`).join('')}</ol>` : ''}
        ${s.sum ? `<ol class="dk-sum">${s.sum.map(([k, t, x], j) => `<li style="--j:${j}"><span>${k}</span><b>${t}</b><small>${x}</small></li>`).join('')}</ol><p class="dk-url">azakeiten.github.io</p>` : ''}
        ${s.flow ? FLOW() : ''}${s.bill ? BILL() : ''}${s.tryit ? TRY() : ''}
        ${s.cycle ? `<div class="dk-ring" aria-hidden="true"><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="110" class="dk-ring-c"/><circle cx="150" cy="150" r="110" class="dk-ring-run"/>${STEPS.map(([k], j) => { const a = -Math.PI / 2 + j * 2 * Math.PI / 3; return `<g transform="translate(${150 + Math.cos(a) * 110},${150 + Math.sin(a) * 110})"><rect x="-30" y="-30" width="60" height="60" rx="8" class="dk-ring-s"/><text y="11">${k}</text></g>`; }).join('')}</svg></div>` : ''}
        ${s.cta ? `<div class="dk-cta"><a href="sponsor.html">協賛のご案内</a><a href="contact.html">お問い合わせ</a><a href="https://www.instagram.com/azakei_vlog/" target="_blank" rel="noopener">Instagram</a></div>` : ''}
      </div>
    </section>`;

  const build = () => {
    el = document.createElement('div');
    el.className = 'dk'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', '1 分でわかる麻経（スライド）');
    el.innerHTML = `<div class="dk-stage">${S.map(slideHTML).join('')}</div>
      <div class="dk-stamp" aria-hidden="true"><span></span><b></b></div>
      <div class="dk-bar">${S.map(() => '<span><i></i></span>').join('')}</div>
      <ol class="dk-track" aria-hidden="true">${STEPS.map(([k, t]) => `<li><span>${k}</span>${t}</li>`).join('<li class="dk-arr">→</li>')}</ol>
      <div class="dk-grid" hidden><p class="dk-grid-h">スライド一覧<small>押すと、その場面へ</small></p><ol>${S.map((s, n) => `<li><button type="button" data-go="${n}"><span>${label(s)}</span><small>${n + 1}　${s.k}</small><b>${plain(s.t)}</b></button></li>`).join('')}</ol></div>
      <aside class="dk-note" hidden aria-label="発表者メモ"><div class="dk-note-h"><b>台本</b><span class="dk-time">0:00</span><span class="dk-nx"></span><button type="button" class="dk-pv">別の画面で台本を開く</button></div><p class="dk-note-t"></p></aside>
      <canvas class="dk-pen" hidden></canvas><div class="dk-laser" hidden aria-hidden="true"></div>
      <div class="dk-ctl">
        <button type="button" class="dk-prev" aria-label="前のスライド">←</button>
        <button type="button" class="dk-play" aria-label="一時停止">II</button>
        <button type="button" class="dk-next" aria-label="次のスライド">→</button>
        <span class="dk-count" aria-live="polite"></span>
        <button type="button" class="dk-lbtn" aria-pressed="false" title="指し棒（L）">指し棒</button>
        <button type="button" class="dk-dbtn" aria-pressed="false" title="ペンで書きこむ（D）。スライドを変えると消えます">ペン</button>
        <button type="button" class="dk-gbtn" aria-pressed="false" title="一覧（G）">一覧</button>
        <button type="button" class="dk-nbtn" aria-pressed="false" title="発表者メモ（N）">発表</button>
        <button type="button" class="dk-x" aria-label="閉じる">閉じる</button>
      </div>`;
    document.body.appendChild(el);
    el.querySelector('.dk-prev').onclick = () => go(i - 1);
    el.querySelector('.dk-next').onclick = () => go(i + 1);
    el.querySelector('.dk-x').onclick = close;
    el.querySelector('.dk-play').onclick = () => setPlay(!playing);
    el.querySelector('.dk-gbtn').onclick = () => grid();
    el.querySelector('.dk-nbtn').onclick = () => setNote(!note);
    el.querySelector('.dk-lbtn').onclick = () => setTool(tool === 'laser' ? '' : 'laser');
    el.querySelector('.dk-dbtn').onclick = () => setTool(tool === 'pen' ? '' : 'pen');
    el.querySelector('.dk-pv').onclick = presenter;
    // 指し棒：赤い光の点がマウスについてくる
    const lz = el.querySelector('.dk-laser');
    el.addEventListener('pointermove', e => { if (tool === 'laser') { lz.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; } });
    // ペン：スライドの上に、朱色で書きこむ
    const cv = el.querySelector('.dk-pen'), cx = cv.getContext('2d');
    let drawing = false;
    cv.addEventListener('pointerdown', e => { drawing = true; cv.setPointerCapture(e.pointerId); cx.beginPath(); cx.moveTo(e.clientX, e.clientY); });
    cv.addEventListener('pointermove', e => { if (!drawing) return; cx.lineTo(e.clientX, e.clientY); cx.stroke(); });
    const up = () => { drawing = false; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    el.querySelector('.dk-grid').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { grid(false); go(+b.dataset.go); } });
    // 画面の左 3 分の 1 で戻る、それ以外で進む（ボタンやリンクの上は除く）
    el.querySelector('.dk-stage').addEventListener('click', e => {
      const ab = e.target.closest('[data-ab]'); if (ab) { flip(ab); return; }
      if (e.target.closest('a, button, .dk-try')) return; (e.clientX < innerWidth / 3) ? go(i - 1) : go(i + 1);
    });
    let sx = null;
    el.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => { if (sx === null || !el.querySelector('.dk-grid').hidden) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) { dx < 0 ? go(i + 1) : go(i - 1); } }, { passive: true });
  };
  const bars = () => el.querySelectorAll('.dk-bar i');

  // コインを投げる（この画面の中だけの遊び）
  const flip = btn => {
    const box = btn.closest('.dk-try'), coin = box.querySelector('.dk-coin'), r = box.querySelector('.dk-try-r');
    if (coin.classList.contains('is-spin')) return;
    setPlay(false);
    box.querySelectorAll('[data-ab]').forEach(b => b.setAttribute('aria-pressed', b === btn));
    const head = Math.random() < .5, pick = btn.dataset.ab;
    coin.classList.remove('is-h', 'is-t'); void coin.offsetWidth; coin.classList.add('is-spin', head ? 'is-h' : 'is-t');
    r.textContent = 'コインを投げています…';
    setTimeout(() => {
      coin.classList.remove('is-spin');
      const got = pick === 'A' ? 100 : (head ? 200 : 0);
      r.innerHTML = `${head ? '表' : '裏'}でした。${pick} をえらんだあなたは <b>${got}</b> チップ。${pick === 'A' ? (head ? 'B なら 200 でした。' : 'B なら 0 でした。') : (head ? 'A より 100 多く。' : 'A なら 100 でした。')}<br><small>平均するとどちらも 100。「確実」か「ふえるかも」か、えらぶ気持ちがリスクの考え方の入口です。</small>`;
    }, reduce ? 50 : 1300);
  };

  // 数字が 0 から数えあがる
  const countUp = s => {
    const b = s.querySelector('.dk-num b'); if (!b || reduce) return;
    const to = +b.dataset.to, t1 = performance.now(), fmt = v => v.toLocaleString('ja-JP');
    const step = t => { const p = Math.min(1, (t - t1) / 1100), e = 1 - Math.pow(1 - p, 3); b.textContent = fmt(Math.round(to * e)); if (p < 1 && s.classList.contains('is-on')) requestAnimationFrame(step); else b.textContent = fmt(to); };
    b.textContent = '0'; requestAnimationFrame(step);
  };
  // 段が変わるところで、大きな印
  const stamp = () => {
    const st = S[i].step;
    if (st === undefined || prevI < 0 || prevI >= i || S[prevI].step === st || reduce) return;
    const sp = el.querySelector('.dk-stamp');
    sp.querySelector('span').textContent = STEPS[st][0];
    sp.querySelector('b').textContent = `${['一', '二', '三'][st]}　${STEPS[st][1]}`;
    sp.classList.remove('is-go'); void sp.offsetWidth; sp.classList.add('is-go');
  };
  const paint = () => {
    el.querySelectorAll('.dk-s').forEach((s, n) => { s.classList.toggle('is-on', n === i); s.classList.toggle('is-past', n < i); s.setAttribute('aria-hidden', n === i ? 'false' : 'true'); });
    bars().forEach((b, n) => { b.style.transition = 'none'; b.style.transform = `scaleX(${n < i ? 1 : 0})`; });
    el.querySelector('.dk-count').textContent = `${i + 1} / ${S.length}`;
    // 上の「親しむ → 知る → つくる」：いまの段に印。全体の話の場面では 3 つとも、表紙としめくくりでは消す
    const st = S[i].step, tr = el.querySelector('.dk-track');
    tr.classList.toggle('is-hide', !!(S[i].cls && /is-cover|is-end/.test(S[i].cls)));
    tr.querySelectorAll('li:not(.dk-arr)').forEach((li, j) => li.classList.toggle('is-on', st === undefined ? true : j === st));
    el.querySelector('.dk-prev').disabled = i === 0;
    el.querySelector('.dk-next').disabled = i === S.length - 1;
    el.querySelector('.dk-note-t').textContent = S[i].n;
    el.querySelector('.dk-nx').textContent = i < S.length - 1 ? `次：${plain(S[i + 1].t)}` : '最後のスライド';
    el.querySelectorAll('.dk-grid [data-go]').forEach((b, n) => b.classList.toggle('is-on', n === i));
    const cur = el.querySelectorAll('.dk-s')[i];
    // コインの遊びは、来るたびに最初から
    const tb = cur.querySelector('.dk-try'); if (tb) { tb.querySelectorAll('[data-ab]').forEach(b => b.removeAttribute('aria-pressed')); tb.querySelector('.dk-coin').className = 'dk-coin'; tb.querySelector('.dk-try-r').textContent = 'A か B を押すと、コインを投げます。'; }
    countUp(cur); stamp(); prevI = i;
    clearPen(); syncPv();
  };
  // 指し棒・ペン（どちらかひとつ）。使っている間は、画面を押してもスライドは進まない
  const setTool = t => {
    tool = t;
    el.classList.toggle('is-laser', t === 'laser');
    el.querySelector('.dk-laser').hidden = t !== 'laser';
    const cv = el.querySelector('.dk-pen');
    cv.hidden = t !== 'pen';
    if (t === 'pen') {
      const r = devicePixelRatio || 1; cv.width = innerWidth * r; cv.height = innerHeight * r;
      const cx = cv.getContext('2d'); cx.setTransform(r, 0, 0, r, 0, 0); cx.strokeStyle = '#e8553b'; cx.lineWidth = 5; cx.lineCap = cx.lineJoin = 'round'; cx.shadowColor = 'rgba(232, 85, 59, .6)'; cx.shadowBlur = 8;
      setPlay(false);
    }
    if (t === 'laser') setPlay(false);
    el.querySelector('.dk-lbtn').setAttribute('aria-pressed', t === 'laser');
    el.querySelector('.dk-dbtn').setAttribute('aria-pressed', t === 'pen');
  };
  const clearPen = () => { const cv = el.querySelector('.dk-pen'); if (!cv.hidden) cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); };

  // 発表者画面：もう 1 つの窓に、台本・経過時間・目標との差・次のスライドを出す（プロジェクターとノートパソコンで分けて使う）
  const presenter = () => {
    if (pv && !pv.closed) { pv.focus(); return; }
    pv = window.open('', 'azk-presenter', 'width=980,height=640');
    if (!pv) { el.querySelector('.dk-pv').textContent = 'ポップアップが止められました（ブラウザで許可してください）'; return; }
    el.querySelector('.dk-pv').textContent = '別の画面で台本を開く';
    pv.document.open();
    pv.document.write(`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>発表者画面｜麻経</title><style>
      body{margin:0;padding:22px 26px;background:#0f0d0b;color:#f3eee4;font-family:'Hiragino Sans','BIZ UDPGothic','Yu Gothic UI',Meiryo,sans-serif;display:grid;grid-template-rows:auto 1fr auto;gap:16px;height:100vh;box-sizing:border-box}
      header{display:flex;flex-wrap:wrap;align-items:center;gap:10px 22px}
      .t{font-family:'Shippori Mincho',serif;font-weight:800;font-size:46px;line-height:1}
      .pace{font-size:15px;font-weight:700;padding:6px 12px;border-radius:999px;background:#1c2b23}.pace.is-late{background:#b5432f}
      label{font-size:13px;color:#bbb}select{font:inherit;padding:4px 6px;border-radius:6px}
      .n{font-size:14px;color:#bbb}.n b{font-size:22px;color:#fff}
      main{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:18px;min-height:0}
      .cur,.nx{padding:20px 22px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);overflow:auto}
      .k{display:flex;align-items:center;gap:10px;margin:0 0 8px;font-weight:700;color:#f3e3bd}.k span{display:inline-grid;place-items:center;width:32px;height:32px;border-radius:6px;background:#b5432f;color:#fff;font-weight:800}
      h1{margin:0 0 14px;font-size:26px;line-height:1.4}.note{margin:0;font-size:22px;line-height:1.9}
      .nx h2{margin:4px 0 0;font-size:18px;line-height:1.5;color:#ddd}.nx p{margin:0;font-size:13px;color:#999}
      footer{display:flex;gap:10px}button{font:inherit;font-weight:800;font-size:18px;padding:12px 26px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;cursor:pointer}button.go{background:#b5432f;border-color:#b5432f;flex:1}
    </style></head><body><header><span class="t" id="tm">0:00</span><span class="pace" id="pace">予定どおり</span><label>目標 <select id="goal"><option value="1">1 分</option><option value="3" selected>3 分</option><option value="5">5 分</option><option value="10">10 分</option></select></label><span class="n"><b id="no"></b></span><button id="rs" style="font-size:13px;padding:6px 14px">時間を 0 に</button></header>
      <main><section class="cur"><p class="k"><span id="sl"></span><span id="sk" style="background:none;width:auto"></span></p><h1 id="st"></h1><p class="note" id="nt"></p></section><section class="nx"><p>次のスライド</p><h2 id="nx"></h2></section></main>
      <footer><button id="pr">← 前へ</button><button class="go" id="ne">次へ →</button></footer></body></html>`);
    pv.document.close();
    const d = pv.document;
    d.getElementById('pr').onclick = () => go(i - 1);
    d.getElementById('ne').onclick = () => go(i + 1);
    d.getElementById('rs').onclick = () => { pvT0 = Date.now(); };
    d.getElementById('goal').onchange = syncPv;
    d.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(i + 1); } if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(i - 1); });
    pvT0 = Date.now(); setPlay(false);
    clearInterval(pvClock); pvClock = setInterval(syncPv, 1000);
    syncPv();
  };
  const syncPv = () => {
    if (!pv || pv.closed) { clearInterval(pvClock); return; }
    const d = pv.document, $ = id => d.getElementById(id); if (!$('tm')) return;
    const s = Math.floor((Date.now() - pvT0) / 1000), mm = v => `${Math.floor(v / 60)}:${String(Math.abs(v) % 60).padStart(2, '0')}`;
    $('tm').textContent = mm(s);
    // 目標の時間を、スライドの枚数で割って「いまごろ何枚目にいるはずか」をくらべる
    const goal = +$('goal').value * 60, plan = goal * i / (S.length - 1), diff = Math.round(s - plan);
    $('pace').textContent = Math.abs(diff) < 10 ? '予定どおり' : diff > 0 ? `予定より ${mm(diff)} おくれ` : `予定より ${mm(-diff)} 早い`;
    $('pace').className = 'pace' + (diff >= 10 ? ' is-late' : '');
    $('no').textContent = `${i + 1} / ${S.length}`;
    $('sl').textContent = label(S[i]); $('sk').textContent = S[i].k;
    $('st').textContent = plain(S[i].t); $('nt').textContent = S[i].n;
    $('nx').textContent = i < S.length - 1 ? plain(S[i + 1].t) : '（最後のスライドです）';
  };
  const run = () => {
    clearTimeout(timer);
    if (!playing || i >= S.length - 1) { if (i >= S.length - 1) setPlay(false, true); return; }
    const b = bars()[i]; void b.offsetWidth;
    b.style.transition = `transform ${left}ms linear`; b.style.transform = 'scaleX(1)';
    startAt = Date.now();
    timer = setTimeout(() => go(i + 1), left);
  };
  const go = n => {
    if (n < 0 || n >= S.length) return;
    i = n; left = dur(i); paint();
    requestAnimationFrame(run);
  };
  const setPlay = (on, ended) => {
    playing = on;
    const btn = el.querySelector('.dk-play');
    btn.textContent = on ? 'II' : '▶'; btn.setAttribute('aria-label', on ? '一時停止' : (ended ? '最初から' : '再生'));
    const b = bars()[i];
    if (!on) {
      clearTimeout(timer);
      if (!ended) { left = Math.max(400, left - (Date.now() - startAt)); const w = b.getBoundingClientRect().width / b.parentElement.getBoundingClientRect().width; b.style.transition = 'none'; b.style.transform = `scaleX(${w})`; }
    } else if (i >= S.length - 1) { go(0); }
    else run();
  };
  // 発表者メモ：自動送りを止め、台本と経過時間を出す
  const setNote = on => {
    note = on;
    el.classList.toggle('is-note', on);
    el.querySelector('.dk-note').hidden = !on;
    el.querySelector('.dk-nbtn').setAttribute('aria-pressed', on);
    clearInterval(clock);
    if (on) {
      setPlay(false); t0 = Date.now();
      const tm = el.querySelector('.dk-time');
      const tick = () => { const s = Math.floor((Date.now() - t0) / 1000); tm.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
      tick(); clock = setInterval(tick, 1000);
    }
  };
  const grid = force => {
    const g = el.querySelector('.dk-grid'), on = force === undefined ? g.hidden : force;
    g.hidden = !on; el.querySelector('.dk-gbtn').setAttribute('aria-pressed', on);
    if (on) { setPlay(false); const c = g.querySelector('.is-on'); if (c) c.focus({ preventScroll: true }); }
  };
  const onKey = e => {
    const gOpen = !el.querySelector('.dk-grid').hidden;
    if (e.key === 'Escape') { gOpen ? grid(false) : tool ? setTool('') : close(); }
    else if (gOpen) return;
    else if (e.key === 'l' || e.key === 'L') setTool(tool === 'laser' ? '' : 'laser');
    else if (e.key === 'd' || e.key === 'D') setTool(tool === 'pen' ? '' : 'pen');
    else if (e.key === 'c' || e.key === 'C') clearPen();
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') go(i + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(i - 1);
    else if (e.key === 'n' || e.key === 'N') setNote(!note);
    else if (e.key === 'g' || e.key === 'G') grid(true);
    else if (e.key === ' ' && !e.target.closest('a, button')) { e.preventDefault(); setPlay(!playing); }
    else if (e.key === 'Tab') { const f = [...el.querySelectorAll('.dk-s.is-on a, .dk-s.is-on button, .dk-ctl button:not(:disabled)')]; if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  };
  const open = (start = 0) => {
    if (!el) build();
    lastFocus = document.activeElement;
    document.documentElement.classList.add('dk-open');
    el.classList.add('is-open');
    prevI = -1;
    i = Math.max(0, Math.min(S.length - 1, start | 0)); left = dur(i); playing = !reduce && !note && i < S.length - 1; paint(); setPlay(playing, !playing && i >= S.length - 1);
    document.addEventListener('keydown', onKey);
    el.querySelector('.dk-x').focus({ preventScroll: true });
    if (!/^#deck(-\d+)?$/.test(location.hash)) history.replaceState(null, '', '#deck');
  };
  function close() {
    clearTimeout(timer); clearInterval(clock); clearInterval(pvClock);
    grid(false); setTool('');
    if (pv && !pv.closed) pv.close();
    el.classList.remove('is-open');
    document.documentElement.classList.remove('dk-open');
    document.removeEventListener('keydown', onKey);
    if (/^#deck(-\d+)?$/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  window.AZAKEI_DECK = { open, close };
})();
