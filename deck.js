/* ================================================================
   deck.js — 「1 分でわかる麻経」スライド（画面いっぱいの紹介）
   ・[data-deck] を押したとき、または URL が #deck のときに開く（site.js から読みこむ）
   ・自動で進む。← → キー・スワイプ・画面の左右を押しても動く。Esc で閉じる
   ・段（親しむ → 知る → つくる）が変わるところで、大きな印が出る
   ・「発表」（N キー）：自動送りを止め、話す台本・経過時間・次のスライドを出す（部員が人前で話すとき用）
   ・「ナレーション」（R キー）：台本を、いちばん自然な日本語の声で 1 文ずつ読み、大きな字幕を出す。読み終わると次へ。声はえらべる。静かな BGM つき
   ・「開演」（O キー）：チャイム → 開演の案内（VOICEVOX:冥鳴ひまりの声）→ 3・2・1・0 → ナレーションで発表
   ・「発表」（P キー）：お札マン（仮）が横に出てきて、ふきだしで 1 文ずつ発表する。「声を出す」で読み上げも。言い終わると次へ
   ・「台本」（N キー）：自分で話すときの台本・経過時間
   ・「一覧」（G キー）：全部のスライドを並べて、好きな場面へ
   ・「指し棒」（L キー）：赤い光の点。「ペン」（D キー）：スライドに書きこむ（C で消す。スライドを変えると消える）
   ・発表者メモの「別の画面で台本を開く」：もう 1 つの窓に、台本・経過時間・目標との差・次のスライド
   ・数字は、サイトのほかのページに出ているものだけ
   ================================================================ */
(function() {
  if (window.AZAKEI_DECK) return;
  const DV = (document.currentScript && document.currentScript.src.split('v=')[1]) || '1';
  // 麻経のめざすこと：経済に「親しむ」→ 仕組みを「知る」→ 自分たちで仕組みを「つくる」。step は 0・1・2（なしは全体の話）
  const STEPS = [['親', '親しむ'], ['知', '知る'], ['創', 'つくる']];
  const S = [
    { k: '表紙', seal: '麻', img: 'hero-s.jpg', t: 'AZAKEI<span>麻経</span>', s: '世の中の仕組みを理解し、<br>自らで仕組みを創り出す。<small>麻布中学校・高等学校の経済系同好会（2025 年〜）</small>', cls: 'is-cover',
      n: '麻布中学校・高等学校の経済系同好会、麻経（AZAKEI）です。合言葉は「世の中の仕組みを理解し、自らで仕組みを創り出す」。1 分ほどで、わたしたちの活動を紹介します。' },
    { k: '麻経のめざすこと', seal: '志', t: '経済を、<br>勉強から体験へ。', s: '経済は、教科書の中だけのものではありません。まず遊んで親しみ、その仕組みを知り、こんどは自分たちで仕組みをつくる。この 3 つを、ぐるぐる回しています。', cls: 'is-purpose', steps: true,
      n: 'わたしたちがやっていることは、3 つの段に分けられます。親しむ、知る、つくる。この順に、紹介していきます。' },
    { k: '親しむ', step: 0, img: 'photos/s/star-door.jpg', t: '教室ひとつを、<br>経済の町に。', s: '文化祭の体験型展示「麻布経済展」。入口でチップを受けとり、6 つのコーナーで遊びながら、チップが増える・減るを体で感じます。',
      n: 'まず「親しむ」。文化祭では、教室ひとつを経済の町にした「麻布経済展」を開いています。入口でチップを受けとって、6 つのコーナーで遊びます。' },
    { k: '親しむ', step: 0, num: '2,364', u: '人', t: '3 日間で、2,364 人が<br>経済で遊んだ。', s: '2026 年の文化祭。1 日目 492 人、2 日目 1,152 人、3 日目 720 人。', bars: [492, 1152, 720], vo: [['nisen', 'sanbyaku', 'rokuzyuu', 'yo', 'nin'], '2,364 人'],
      n: '2026 年の文化祭では、3 日間で 2,364 人が来てくれました。いちばん多かったのは 2 日目の 1,152 人です。' },
    { k: '親しむ', step: 0, seal: '試', t: 'この場で、<br>ひとつ選んでください。', s: 'A：かならず 100 チップもらえる。　B：コインを投げて、表なら 200 チップ、裏なら 0。', cls: 'is-try', tryit: true, dur: 12000, vo: [['sentakushite'], '選択してください。'],
      n: '会場のみなさんに、ひとつ質問です。A は、かならず 100 チップ。B は、コインの表なら 200、裏なら 0。どちらを選びますか。手をあげてもらってから、コインを投げます。どちらが正しい、ということはありません。「確実」と「ふえるかも」をくらべる気持ちが、経済のリスクの考え方の入口です。' },
    { k: '知る', step: 1, img: 'photos/s/room-diagnosis.jpg', t: '遊んだあとに、<br>仕組みを知る。', s: 'なぜチップが増えたのか、減ったのか。お金は、家計・企業・銀行・政府のあいだを、どうめぐっているのか。Web でも、図や辞典で確かめられます。', chips: ['用語辞典 300 語', 'お金のめぐりの図', '経済ラボ 29 の実験', 'クイズ 84 問'],
      n: '次に「知る」。遊んだあとで、なぜチップが増えたのか、減ったのかを考えます。ホームページには、用語辞典 300 語、経済ラボの 29 の実験、クイズ 84 問があります。' },
    { k: '知る', step: 1, seal: '巡', t: 'お金は、<br>めぐっている。', s: '給料をもらい、買い物をし、預けたお金は貸し出され、税金は道路や学校になる。一人の 1 万円も、町の中をぐるりと回っています。', cls: 'is-flow', flow: true,
      n: 'たとえば、お金のめぐり。家計は働いて給料をもらい、企業から物を買います。預けたお金は銀行から企業に貸し出され、税金は道路や学校になって返ってきます。こうした仕組みを、図や実験で知ることができます。' },
    { k: 'つくる', step: 2, img: 'photos/s/room-paper.jpg', t: '仕組みを、<br>自分たちの手で。', s: '展示のゲームとルール、会場で使う券（チップ）、会場の飾り。どれも部員が考えて、つくりました。遊ぶ側から、仕組みをつくる側へ。',
      n: '最後に「つくる」。展示のゲームやルール、会場で使う券（チップ）、会場の飾りは、部員が考えてつくりました。遊ぶ側から、仕組みをつくる側にまわります。' },
    { k: 'つくる', step: 2, seal: '設', t: 'ルールひとつにも、<br>経済がある。', s: '会場で使う券を、何枚用意するか。1 枚で何回遊べるか。どうやって増え、どこで使えるか。遊びのルールを 1 つ決めることは、小さな経済の仕組みを 1 つ設計することです。', cls: 'is-bill', bill: true,
      n: 'たとえば、会場で使う券のルールを決めるだけでも、何枚用意するか、1 枚で何回遊べるか、どこで使えるかを考えなければいけません。遊びのルールを決めることは、経済の仕組みを設計することでもあります。' },
    { k: 'つくる', step: 2, num: '2', u: '大会', t: '学校の外でも、<br>仕組みを考える。', s: '日経ストックリーグでは、企業を調べてポートフォリオを組んでいます。高校生ビジネスプラン・グランプリには、事業のプランをつくって応募しました。',
      n: '学校の外でも挑戦しています。日経ストックリーグでは企業を調べてポートフォリオを組み、高校生ビジネスプラン・グランプリには事業のプランをつくって応募しました。' },
    { k: 'めぐる', seal: '環', t: 'つくった仕組みで、<br>次の人が経済に親しむ。', s: 'つくった展示で、また誰かが経済を身近に感じる。親しむ → 知る → つくる の輪を、麻経は少しずつ大きくしていきます。', cls: 'is-cycle', cycle: true,
      n: 'そして、わたしたちがつくった展示で、また次の人が経済に親しみます。親しむ、知る、つくるの輪を、少しずつ大きくしていきたいと考えています。' },
    { k: 'まとめ', seal: '要', t: '今日、お伝えしたこと。', s: 'ご質問があれば、どうぞ。', cls: 'is-sum', sum: [['親', '親しむ', '教室ひとつを経済の町に。3 日間で 2,364 人が遊んだ。'], ['知', '知る', '遊んだあとに、お金のめぐりと仕組みを知る。'], ['創', 'つくる', 'お金やルールを、自分たちの手で設計する。']], dur: 8000,
      n: 'まとめます。親しむ：教室ひとつを経済の町にして、3 日間で 2,364 人が遊びました。知る：遊んだあとに、お金のめぐりと仕組みを知ります。つくる：お金やルールを、自分たちの手で設計します。ご質問があれば、どうぞ。（質問の間は、この画面のままにしておけます）' },
    { k: 'いっしょに', seal: '結', t: '一緒に、<br>仕組みをつくりませんか。', s: '協賛・取材・見学のご相談を、お待ちしています。<br>Instagram @azakei_vlog ／ azakeiten.github.io', cls: 'is-end', cta: true,
      n: '協賛や取材、見学のご相談をお待ちしています。Instagram は @azakei_vlog、ホームページは azakeiten.github.io です。ありがとうございました。' }
  ];
  // お札マンが発表するときの言葉（スライドと同じ順）。中身はスライドとサイトにあることだけ
  // 文字列か { t: せりふ, hl: 話している間に光らせる場所, m: 顔（happy・wow・think・sad） }。'@flip' はコインを投げる合図
  const CL = [
    [{ t: 'こんにちは！ ぼくはお札マン。名前は、まだ「仮」なんだ。', m: 'happy' }, 'AZAKEI の会長が、ぼくの生みの親だよ。', { t: '今日は、ぼくが麻経を紹介するね。', m: 'happy' }],
    ['麻経がめざしているのは、経済を「勉強」から「体験」にすること。', { t: 'まずは、遊んで親しむ。', hl: '.dk-3 li:nth-child(1)' }, { t: 'つぎに、仕組みを知る。', hl: '.dk-3 li:nth-child(2)' }, { t: 'そして、自分たちで仕組みをつくる。', hl: '.dk-3 li:nth-child(3)', m: 'happy' }],
    ['まずは「親しむ」。', '文化祭では、教室ひとつを経済の町にしたんだ。', '入口でチップを受けとって、6 つのコーナーで遊ぶよ。'],
    [{ t: '3 日間で、2,364 人が来てくれたよ！', hl: '.dk-num', m: 'wow' }, { t: 'いちばん多かったのは、2 日目の 1,152 人。', hl: '.dk-bars span:nth-child(2)' }],
    [{ t: 'ここでクイズ。A は、かならず 100 チップ。', hl: '[data-ab="A"]' }, { t: 'B は、コインの表なら 200、裏なら 0。', hl: '[data-ab="B"]' }, { t: 'みんなはどっち？ ……うーん。', m: 'think' }, { t: 'ぼくは、B にしてみる！', hl: '[data-ab="B"]', m: 'happy' }, '@flip', { t: '平均すると、どっちも 100。「確実」をとるか、「ふえるかも」をとるか。それが、リスクの考え方の入口だよ。', hl: '.dk-try-r' }],
    ['つぎは「知る」。', { t: 'なぜチップが増えたのか、減ったのかを考えるんだ。', m: 'think' }, { t: 'サイトには、用語辞典 300 語や、経済ラボの 29 の実験があるよ。', hl: '.dk-chips li:nth-child(-n+3)' }],
    [{ t: 'お金は、町の中をめぐっているよ。小さなお札に、図の上を回ってもらうね。', m: 'happy' }, { t: '家計は企業で働いて給料をもらい、企業から物を買う。', hl: '[data-k="家計"], [data-k="企業"]', ride: [1, 0] }, { t: '預けたお金は、銀行から企業へ貸し出される。', hl: '[data-k="銀行"]', ride: [2, 3] }, { t: '税金は政府に集まって、道路や学校になるんだ。', hl: '[data-k="政府"]', ride: [4, 5] }],
    ['さいごは「つくる」。', '展示のゲームやルール、会場で使う券、会場の飾りは、部員が考えてつくったんだ。'],
    [{ t: '会場で使う券ひとつにも、決めることがたくさんあるよ。', m: 'think' }, { t: '何枚用意する？ 1 枚で何回遊べる？', hl: '.dk-b-q li:nth-child(-n+2)' }, { t: 'どう増える？ どこで使える？', hl: '.dk-b-q li:nth-child(n+3)' }, { t: 'ちなみに、ぼくの体はお札の形なんだ。', m: 'happy' }],
    ['学校の外でも、挑戦しているよ。', '日経ストックリーグと、高校生ビジネスプラン・グランプリ。'],
    [{ t: 'つくった展示で、また次の人が経済に親しむ。', hl: '.dk-ring' }, { t: 'この輪を、少しずつ大きくしていくよ。', m: 'happy' }],
    [{ t: 'まとめるね。遊んで、親しむ。', hl: '.dk-sum li:nth-child(1)' }, { t: '仕組みを、知る。', hl: '.dk-sum li:nth-child(2)' }, { t: '自分たちで、つくる。', hl: '.dk-sum li:nth-child(3)' }, { t: '質問があったら、部員のみんなに聞いてね！', m: 'happy' }],
    [{ t: '協賛や取材、見学のご相談を、待ってるよ。', hl: '.dk-cta' }, { t: '聞いてくれて、ありがとう！', m: 'happy' }]
  ];
  // お札マン（osatsu.js と同じ絵。口がぱくぱく動く版）
  const MAN = `<svg viewBox="0 0 120 112" aria-hidden="true">
    <g stroke="#6b4a22" stroke-width="3.5" stroke-linecap="round"><path d="M50 76 L46 96"/><path d="M70 76 L74 96"/></g>
    <ellipse cx="44" cy="98" rx="7" ry="3.5" fill="#6b4a22"/><ellipse cx="76" cy="98" rx="7" ry="3.5" fill="#6b4a22"/>
    <g class="dk-ch-arm"><path d="M22 54 L8 62" stroke="#6b4a22" stroke-width="3.5" stroke-linecap="round"/><circle cx="7" cy="63" r="4.5" fill="#fffaf0" stroke="#6b4a22" stroke-width="2"/></g>
    <g class="dk-ch-arm2"><path d="M98 52 L111 38" stroke="#6b4a22" stroke-width="3.5" stroke-linecap="round"/><circle cx="112" cy="36" r="4.5" fill="#fffaf0" stroke="#6b4a22" stroke-width="2"/></g>
    <rect x="20" y="28" width="80" height="50" rx="7" fill="#e6d5b3" stroke="#6b4a22" stroke-width="3"/>
    <rect x="26" y="34" width="68" height="38" rx="3" fill="none" stroke="#6b4a22" stroke-width="1.4" opacity=".6"/>
    <g fill="#2f6b3a"><polygon points="35,37 41,47 29,47"/><polygon points="35,50 29,40 41,40"/></g>
    <g class="dk-ch-eyes dk-e-n" fill="#2a2015"><ellipse cx="54" cy="50" rx="3.6" ry="4.2"/><ellipse cx="72" cy="50" rx="3.6" ry="4.2"/></g>
    <g class="dk-e-h" fill="none" stroke="#2a2015" stroke-width="2.6" stroke-linecap="round"><path d="M50 52 Q54 46 58 52"/><path d="M68 52 Q72 46 76 52"/></g>
    <g class="dk-e-w"><circle cx="54" cy="49" r="5.2" fill="#fff" stroke="#2a2015" stroke-width="1.8"/><circle cx="72" cy="49" r="5.2" fill="#fff" stroke="#2a2015" stroke-width="1.8"/><circle cx="54" cy="49.5" r="2.6" fill="#2a2015"/><circle cx="72" cy="49.5" r="2.6" fill="#2a2015"/></g>
    <g class="dk-e-t" fill="#2a2015"><ellipse cx="56" cy="47" rx="3.2" ry="3.8"/><ellipse cx="74" cy="47" rx="3.2" ry="3.8"/><path d="M49 41 L58 43 M67 43 L76 40" stroke="#2a2015" stroke-width="2" stroke-linecap="round"/></g>
    <g class="dk-e-s" fill="none" stroke="#2a2015" stroke-width="2.4" stroke-linecap="round"><path d="M50 49 L58 52"/><path d="M68 52 L76 49"/><path d="M83 40 q2 5 0 7 q-2 -2 0 -7" fill="#9cc9e8" stroke="#5a8fb3" stroke-width="1.2"/></g>
    <circle cx="48" cy="59" r="4.2" fill="#f0957c" opacity=".55"/><circle cx="78" cy="59" r="4.2" fill="#f0957c" opacity=".55"/>
    <path class="dk-m0" d="M57 58 Q63 64 69 58" fill="none" stroke="#2a2015" stroke-width="2.4" stroke-linecap="round"/>
    <path class="dk-m2" d="M57 63 Q63 58 69 63" fill="none" stroke="#2a2015" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse class="dk-m1" cx="63" cy="60" rx="5" ry="4" fill="#7a2b1c" stroke="#2a2015" stroke-width="1.6"/>
    <text x="88" y="70" font-family="Shippori Mincho, serif" font-weight="800" font-size="9" fill="#b5432f" text-anchor="middle">経</text>
  </svg>`;
  const DUR = 5500;
  const dur = n => S[n].dur || DUR;
  let el, i = 0, timer = null, playing = true, startAt = 0, left = DUR, lastFocus = null, note = false, t0 = 0, clock = null, prevI = -1, tool = '', pv = null, pvT0 = 0, pvClock = null, chara = false, voice = false, li = 0, tTok = 0, tt = null;
  // お札マンの話す速さ（文字の出る速さと、間の長さにかける）
  const SPD = [['ゆっくり', 1.5], ['ふつう', 1], ['はやい', .6]]; let spd = 1;
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
      ${Object.values(N).map(([x, y, t], j) => `<g class="dk-f-n" data-k="${t}" style="--j:${j}" transform="translate(${x},${y})"><rect x="-40" y="-22" width="80" height="44" rx="10"/><text y="7">${t}</text></g>`).join('')}
      <g class="dk-rider"><animateMotion dur="1.5s" begin="indefinite" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".4 0 .2 1"><mpath href="#dkf0"/></animateMotion>
        <g transform="translate(-15,-24)"><rect width="30" height="19" rx="3" fill="#e6d5b3" stroke="#6b4a22" stroke-width="2"/><circle cx="12" cy="9" r="1.7" fill="#2a2015"/><circle cx="19" cy="9" r="1.7" fill="#2a2015"/><path d="M12.5 13 Q15.5 15.5 18.5 13" fill="none" stroke="#2a2015" stroke-width="1.3" stroke-linecap="round"/><polygon points="5,4 7.5,8 2.5,8" fill="#2f6b3a"/></g></g>
    </svg><p class="dk-f-leg">${E.map(e => `<span>${N[e[0]][2]} → ${N[e[1]][2]}<b>${e[3]}</b></span>`).join('')}</p></div>`;
  };
  // つくる：会場で使う遊び用の券を 1 枚、線で描いていく（見本）
  const BILL = () => `<div class="dk-bill" aria-hidden="true"><svg viewBox="0 0 360 190">
      <rect x="6" y="6" width="348" height="178" rx="12" class="dk-b-o"/><rect x="20" y="20" width="320" height="150" rx="6" class="dk-b-i"/>
      <circle cx="96" cy="95" r="44" class="dk-b-i"/><path d="M70 95h52M96 69v52M78 77l36 36M114 77l-36 36" class="dk-b-i"/>
      <path d="M170 60h140M170 132h140" class="dk-b-i"/>
      <text x="240" y="106" class="dk-b-t">麻経券</text><text x="240" y="124" class="dk-b-s">遊び用の券</text><text x="320" y="160" class="dk-b-s">見本</text><text x="40" y="44" class="dk-b-n">100</text>
    </svg><ul class="dk-b-q">${['何枚用意する？', '1 枚で何回？', 'どう増える？', 'どこで使える？'].map((q, j) => `<li style="--j:${j}">${q}</li>`).join('')}</ul><a class="dk-b-go" href="sim.html#tsuuka">工房で、券のルールを決めてみる</a></div>`;
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
      <div class="dk-chara" hidden><div class="dk-ch-b"><p class="dk-ch-n">お札マン<small>（仮）</small><button type="button" class="dk-ch-sp">速さ：ふつう</button><button type="button" class="dk-ch-s" aria-pressed="false">効果音</button>${'speechSynthesis' in window ? '<button type="button" class="dk-ch-v" aria-pressed="false">声を出す</button><select class="dk-ch-vsel" aria-label="お札マンの声" hidden></select><button type="button" class="dk-ch-st" hidden>話し方：主人公</button>' : ''}</p><p class="dk-ch-t" aria-live="polite"></p><button type="button" class="dk-ch-go">止まっています。つづける ▶</button></div><div class="dk-ch-man">${MAN}</div></div>
      <div class="dk-jimaku" hidden aria-live="polite"><p></p></div>
      <div class="dk-cap" hidden aria-live="polite"><b>案内</b><span></span></div>
      <canvas class="dk-pen" hidden></canvas><div class="dk-laser" hidden aria-hidden="true"></div>
      <div class="dk-ctl">
        <button type="button" class="dk-prev" aria-label="前のスライド">←</button>
        <button type="button" class="dk-play" aria-label="一時停止">II</button>
        <button type="button" class="dk-next" aria-label="次のスライド">→</button>
        <span class="dk-count" aria-live="polite"></span>
        <button type="button" class="dk-lbtn" aria-pressed="false" title="指し棒（L）">指し棒</button>
        <button type="button" class="dk-dbtn" aria-pressed="false" title="ペンで書きこむ（D）。スライドを変えると消えます">ペン</button>
        <button type="button" class="dk-hbtn" title="配る資料を印刷（A4）">資料</button>
        <button type="button" class="dk-gbtn" aria-pressed="false" title="一覧（G）">一覧</button>
        <button type="button" class="dk-nbtn" aria-pressed="false" title="自分で話すときの台本（N）">台本</button>
        <button type="button" class="dk-obtn" title="開演の案内からはじめる（O）">開演</button>
        <button type="button" class="dk-abtn" aria-pressed="false" title="案内の声（V）">案内の声</button>
        <button type="button" class="dk-rbtn" aria-pressed="false" title="ナレーションで発表（R）。台本を声で読み、字幕を出します">ナレーション</button>
        <select class="dk-vsel" aria-label="ナレーションの声"></select>
        <button type="button" class="dk-bbtn" aria-pressed="false" title="ナレーションの下に静かな音楽">BGM</button>
        <button type="button" class="dk-cbtn" aria-pressed="false" title="お札マンが発表（P）">発表</button>
        <button type="button" class="dk-x" aria-label="閉じる">閉じる</button>
      </div>`;
    document.body.appendChild(el);
    el.querySelector('.dk-prev').onclick = () => go(i - 1);
    el.querySelector('.dk-next').onclick = () => go(i + 1);
    el.querySelector('.dk-x').onclick = close;
    el.querySelector('.dk-play').onclick = () => setPlay(!playing);
    el.querySelector('.dk-gbtn').onclick = () => grid();
    el.querySelector('.dk-hbtn').onclick = handout;
    el.querySelector('.dk-nbtn').onclick = () => setNote(!note);
    el.querySelector('.dk-cbtn').onclick = () => setChara(!chara);
    const sp = el.querySelector('.dk-ch-sp');
    sp.onclick = () => { spd = (spd + 1) % SPD.length; sp.textContent = '速さ：' + SPD[spd][0]; };
    el.querySelector('.dk-ch-go').onclick = () => setPlay(true);
    const sb = el.querySelector('.dk-ch-s');
    sb.onclick = () => { sfxOn = !sfxOn; sb.setAttribute('aria-pressed', sfxOn); sb.textContent = sfxOn ? '効果音：あり' : '効果音'; sfx('coin'); };
    const vb = el.querySelector('.dk-ch-v');
    if (vb) vb.onclick = () => { voice = !voice; if (voice) VO().then(manList); else { el.querySelector('.dk-ch-vsel').hidden = true; el.querySelector('.dk-ch-st').hidden = true; } vb.setAttribute('aria-pressed', voice); vb.textContent = voice ? '声：あり' : '声を出す'; if (!voice) speechSynthesis.cancel(); };
    el.querySelector('.dk-lbtn').onclick = () => setTool(tool === 'laser' ? '' : 'laser');
    el.querySelector('.dk-dbtn').onclick = () => setTool(tool === 'pen' ? '' : 'pen');
    el.querySelector('.dk-pv').onclick = presenter;
    // 指し棒：赤い光の点がマウスについてくる
    el.querySelector('.dk-obtn').onclick = opening;
    // 話し方（主人公 ⇄ クール）。押すと、その話し方でひとこと
    el.querySelector('.dk-ch-st').onclick = () => { const V = window.AZAKEI_VOICE; if (!V) return; V.setStyle(V.getStyle() === 'hero' ? 'cool' : 'hero'); stLabel(); stopTalk(); speechSynthesis.cancel(); const line = V.getStyle() === 'hero' ? 'よーし、まかせて！ ぼくがお札マンだ！' : '……お札マンだ。よろしく。'; const u = new SpeechSynthesisUtterance(V.fix(line)); const mt = V.manTone(); if (mt.voice) u.voice = mt.voice; u.lang = 'ja-JP'; u.pitch = mt.pitch; u.rate = mt.rate; speechSynthesis.speak(u); if (chara && playing) setTimeout(run, 2200); };
    el.querySelector('.dk-ch-vsel').onchange = e => { if (window.AZAKEI_VOICE) { AZAKEI_VOICE.setMan(e.target.value); stopTalk(); speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance('この声で話すよ。よろしく。'); const mt = AZAKEI_VOICE.manTone(); if (mt.voice) u.voice = mt.voice; u.lang = 'ja-JP'; u.pitch = mt.pitch; u.rate = mt.rate; speechSynthesis.speak(u); if (chara && playing) setTimeout(run, 1800); } };
    el.querySelector('.dk-rbtn').onclick = () => setNarr(!narr);
    el.querySelector('.dk-bbtn').onclick = () => setBgm(!bgmOn);
    setBgm(bgmOn);
    el.querySelector('.dk-vsel').onchange = e => { if (window.AZAKEI_VOICE) { AZAKEI_VOICE.setTTS(e.target.value); if (narr && playing) run(); } };
    document.addEventListener('azakei-voices', () => { if (el) { voiceList(); manList(); } });
    el.querySelector('.dk-abtn').onclick = () => setAnn(!ann);
    setAnn(ann, true);
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
  const flip = (btn, auto) => {
    const box = btn.closest('.dk-try'), coin = box.querySelector('.dk-coin'), r = box.querySelector('.dk-try-r');
    if (coin.classList.contains('is-spin')) return;
    // ふつうの発表では、押したら自動送りを止める。お札マンの発表中は止めない（あとでお札マンが結果を話す）
    if (!auto && !chara) setPlay(false);
    box.querySelectorAll('[data-ab]').forEach(b => b.setAttribute('aria-pressed', b === btn));
    const head = Math.random() < .5, pick = btn.dataset.ab;
    coin.classList.remove('is-h', 'is-t'); void coin.offsetWidth; coin.classList.add('is-spin', head ? 'is-h' : 'is-t');
    r.textContent = 'コインを投げています…';
    setTimeout(() => {
      coin.classList.remove('is-spin');
      sfx('coin');
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
    clearTimeout(sp._t); sp._t = setTimeout(() => sp.classList.remove('is-go'), 1400);
    sfx('stamp');
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
    annTok++; annP = null; flipAsked = false; capHide(); if (window.AZAKEI_VOICE) AZAKEI_VOICE.stop();
    if (ann && S[i].vo && !opBusy) annP = annSay(S[i].vo[0], S[i].vo[1]);
    if (narr) { stopTalk(); subHide(); }
    if (ann && !chara && !narr && S[i].cls === 'is-end') { const k = annTok; setTimeout(() => { if (k === annTok) annSay(['goseichouarigatou'], 'ご清聴ありがとうございました。', true); }, 1600); }
    clearPen(); syncPv();
    hideQA();
    if (S[i].cls === 'is-end') setTimeout(() => { if (S[i].cls === 'is-end') rain(); }, 500);
    if (chara) { li = 0; stopTalk(); const c = el.querySelector('.dk-chara'); c.classList.remove('is-hop'); void c.offsetWidth; c.classList.add('is-hop'); setTimeout(() => c.classList.remove('is-hop'), 600); }
  };

  // 配る資料：全部のスライドの見出しと説明を、A4 にならべて印刷する（聞いている人に配る用）
  const handout = () => {
    setPlay(false);
    let h = document.querySelector('.dk-hand');
    if (!h) { h = document.createElement('div'); h.className = 'dk-hand'; document.body.appendChild(h); }
    const sub = s => s.s.replace(/<small>.*?<\/small>/g, '').replace(/<br>/g, ' ');
    h.innerHTML = `<header class="dk-h-top"><p class="dk-h-t"><span>麻経</span>AZAKEI 紹介資料</p><p class="dk-h-m">麻布中学校・高等学校 経済系同好会　azakeiten.github.io　Instagram @azakei_vlog</p></header>
      <ol class="dk-h-list">${S.map((s, n) => `<li><p class="dk-h-k"><span>${label(s)}</span>${n + 1}　${s.k}</p><h3>${plain(s.t)}</h3><p class="dk-h-s">${sub(s)}</p></li>`).join('')}</ol>
      <p class="dk-h-motto">世の中の仕組みを理解し、自らで仕組みを創り出す。</p>`;
    document.documentElement.classList.add('dk-printing');
    const done = () => { document.documentElement.classList.remove('dk-printing'); removeEventListener('afterprint', done); };
    addEventListener('afterprint', done);
    setTimeout(() => { print(); setTimeout(done, 1500); }, 60);
  };

  // ── 効果音（ファイルは使わず、ブラウザの中で音をつくる）。「効果音」を押したときだけ鳴る
  let sfxOn = false, ac = null;
  const sfx = kind => {
    if (!sfxOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = ac.currentTime;
      const tone = (f, at, len, type = 'sine', vol = .12) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f, t0 + at);
        g.gain.setValueAtTime(vol, t0 + at); g.gain.exponentialRampToValueAtTime(.0001, t0 + at + len);
        o.connect(g).connect(ac.destination); o.start(t0 + at); o.stop(t0 + at + len + .02);
      };
      if (kind === 'blip') tone(520 + Math.random() * 160, 0, .045, 'square', .025);
      else if (kind === 'stamp') { tone(110, 0, .35, 'sine', .3); tone(70, .02, .4, 'triangle', .2); }
      else if (kind === 'coin') { tone(1320, 0, .25, 'sine', .1); tone(1760, .08, .35, 'sine', .08); }
      else if (kind === 'ride') tone(880, 0, .12, 'triangle', .06);
      else if (kind === 'end') [523, 659, 784, 1047].forEach((f, j) => tone(f, j * .12, .4, 'triangle', .09));
    } catch (e) {}
  };

  // ── 案内の声（voice.js：VOICEVOX:冥鳴ひまりの声）。「案内の声」を押したとき・「開演」のときだけ流れる。流れている文は字幕にも出す
  let ann = false, annP = null, annTok = 0, flipAsked = false, opTok = 0, opBusy = false;
  try { ann = localStorage.getItem('azakei_voice') === '1'; } catch (e) {}
  const VO = () => window.AZAKEI_VOICE ? Promise.resolve(window.AZAKEI_VOICE) : new Promise(r => { const s = document.createElement('script'); s.src = 'voice.js?v=' + DV; s.onload = () => r(window.AZAKEI_VOICE || null); s.onerror = () => r(null); document.head.appendChild(s); });
  const capShow = t => { const c = el.querySelector('.dk-cap'); c.querySelector('span').textContent = t; c.hidden = false; c.classList.remove('is-in'); void c.offsetWidth; c.classList.add('is-in'); };
  const capHide = () => { const c = el && el.querySelector('.dk-cap'); if (c) c.hidden = true; };
  const annSay = async (names, cap, chime) => {
    if (!ann) return;
    const k = annTok, v = await VO();
    if (!v || !ann || k !== annTok) return;
    if (chime) { await v.chime(false); if (k !== annTok) return; }
    capShow(cap); await v.say(names, .03);
    if (k === annTok) capHide();
  };
  const setAnn = (on, quiet) => {
    ann = on;
    const b = el.querySelector('.dk-abtn'); b.setAttribute('aria-pressed', on); b.textContent = on ? '案内の声：あり' : '案内の声';
    if (quiet) return;
    if (!on) { annTok++; capHide(); }
    VO().then(v => { if (!v) return; v.set(on); if (on && !opBusy) { annTok++; annSay(['youkoso'], 'ようこそ。'); } });
  };
  // 開演：チャイム →「お客様にご案内申し上げます」「間もなく開演となります…」→ 3・2・1・0 → お札マンが発表をはじめる
  const opening = async () => {
    if (opBusy) return;
    opBusy = true; const k = ++opTok;
    grid(false); setTool(''); if (note) setNote(false); if (chara) setChara(false); if (narr) setNarr(false);
    go(0); setPlay(false);
    if (!ann) setAnn(true);
    const v = await VO();
    if (v && !v.on()) v.set(true);
    const oc = document.createElement('div'); oc.className = 'dk-op'; oc.setAttribute('role', 'status');
    oc.innerHTML = '<p class="dk-op-k"><span>麻経</span>開演のご案内</p><p class="dk-op-t"></p><p class="dk-op-n" aria-hidden="true"></p><button type="button" class="dk-op-x">とばす</button>';
    el.appendChild(oc);
    const alive = () => k === opTok && el.classList.contains('is-open');
    let skip = false;
    oc.querySelector('.dk-op-x').onclick = () => { skip = true; if (v) v.stop(); };
    const pause = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 400) : ms));
    const line = async (t, names, least) => {
      if (!alive() || skip) return;
      const p = oc.querySelector('.dk-op-t'); p.textContent = t; p.classList.remove('is-in'); void p.offsetWidth; p.classList.add('is-in');
      const t0 = Date.now();
      if (v && v.on()) await v.say(names, .03);
      const rest = least - (Date.now() - t0); if (rest > 0 && alive() && !skip) await pause(rest);
    };
    if (v) await v.chime(true);
    await line('お客様にご案内申し上げます。', ['okyakusamanionegai'], 2200);
    await line('間もなく開演となりますので、今しばらくお待ちください。', ['mamonakukaien'], 3400);
    if (alive() && !skip) {
      oc.classList.add('is-count'); oc.querySelector('.dk-op-t').textContent = '';
      const sound = v && v.on(), total = sound ? await v.dur(['countdown']) : 3.2, n = oc.querySelector('.dk-op-n');
      const p = sound ? v.say(['countdown']) : null;
      for (const d of ['3', '2', '1', '0']) {
        if (!alive() || skip) break;
        n.textContent = d; n.classList.remove('is-pop'); void n.offsetWidth; n.classList.add('is-pop');
        await pause(total * 1000 / 4);
      }
      if (p && alive() && !skip) await p;
    }
    oc.classList.add('is-out'); setTimeout(() => oc.remove(), reduce ? 0 : 600);
    opBusy = false;
    if (alive()) setNarr(true);
  };

  // ── ナレーション：台本（S[i].n）を、いちばん自然な日本語の声で 1 文ずつ読み、大きな字幕を出す。読み終わると次へ
  let narr = false, bgmOn = true;
  try { bgmOn = localStorage.getItem('azakei_bgm') !== '0'; } catch (e) {}
  const subShow = t => { const s = el.querySelector('.dk-jimaku'); s.querySelector('p').textContent = t; s.hidden = false; s.classList.remove('is-in'); void s.offsetWidth; s.classList.add('is-in'); };
  const subHide = () => { const s = el && el.querySelector('.dk-jimaku'); if (s) s.hidden = true; };
  const narrate = () => {
    stopTalk();
    if (!playing || !narr) return;
    const tok = tTok, bar = bars()[i];
    bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)';
    Promise.all([VO(), annP || Promise.resolve()]).then(([v]) => {
      if (tok !== tTok || !v) return;
      v.tts(S[i].n, {
        role: "n", vvRate: 1 / SPD[spd][1],
        rate: 1.02 / SPD[spd][1],
        onPart: (s, k, n) => { if (tok !== tTok) return; subShow(s); bar.style.transition = 'transform .5s'; bar.style.transform = `scaleX(${(k + 1) / n})`; }
      }).then(() => {
        if (tok !== tTok) return;
        subHide();
        // コインの場面：読み終わったら、コインを投げて結果を見せる
        const tb = S[i].tryit && el.querySelector('.dk-s.is-on [data-ab="B"]');
        if (tb && !el.querySelector('.dk-s.is-on [data-ab][aria-pressed="true"]')) { flip(tb, true); tt = setTimeout(() => { if (tok === tTok) go(i + 1); }, reduce ? 300 : 3600); return; }
        if (i < S.length - 1) tt = setTimeout(() => { if (tok === tTok) go(i + 1); }, 700);
        else { setPlay(false, true); if (window.AZAKEI_VOICE) AZAKEI_VOICE.bgm(false); annSay(['goseichouarigatou'], 'ご清聴ありがとうございました。', true); }
      });
    });
  };
  const stLabel = () => { const b = el && el.querySelector('.dk-ch-st'); if (!b) return; b.hidden = !voice || !window.AZAKEI_VOICE; if (window.AZAKEI_VOICE) b.textContent = '話し方：' + (AZAKEI_VOICE.getStyle() === 'hero' ? '主人公' : 'クール'); };
  // お札マンの声をえらぶ欄（男の声を上に）
  const manList = () => {
    const sel = el.querySelector('.dk-ch-vsel'); if (!sel || !window.AZAKEI_VOICE) return;
    const V = AZAKEI_VOICE, vs = V.jaVoices().sort((a, b) => V.isMale(b) - V.isMale(a)), cur = V.manPick();
    sel.innerHTML = vs.map(v => `<option value="${v.name.replace(/"/g, '&quot;')}"${cur && cur.name === v.name ? ' selected' : ''}>${V.label(v)}</option>`).join('');
    if (!V.hasNatural()) sel.insertAdjacentHTML('beforeend', '<option disabled>Edge だと人の声に近い声</option>');
    sel.hidden = !voice || !vs.length;
    stLabel();
  };
  const voiceList = () => {
    const sel = el.querySelector('.dk-vsel'); if (!sel || !window.AZAKEI_VOICE) return;
    const vs = AZAKEI_VOICE.jaVoices(), cur = AZAKEI_VOICE.pick();
    sel.innerHTML = vs.length ? vs.map(v => `<option value="${v.name.replace(/"/g, '&quot;')}"${cur && cur.name === v.name ? ' selected' : ''}>声：${AZAKEI_VOICE.label(v)}</option>`).join('') : '<option>日本語の声がありません</option>';
    if (vs.length && !AZAKEI_VOICE.hasNatural()) sel.insertAdjacentHTML('beforeend', '<option disabled>Edge だと人の声に近い声</option>');
    sel.disabled = !vs.length;
  };
  const setNarr = on => {
    narr = on;
    el.classList.toggle('is-narr', on);
    el.querySelector('.dk-rbtn').setAttribute('aria-pressed', on);
    if (on) {
      if (chara) setChara(false); if (note) setNote(false); setTool('');
      VO().then(v => { if (!v || !narr) return; voiceList(); if (bgmOn) v.bgm(true); setTimeout(() => { if (narr && v.jaVoices().length && !v.hasNatural() && !setNarr.tipped) { setNarr.tipped = true; capShow('人の声に近いナレーションは、Microsoft Edge で開くと聞けます。'); setTimeout(capHide, 5000); } }, 1500); });
      clearTimeout(timer); playing = true;
      const b = el.querySelector('.dk-play'); b.textContent = 'II'; b.setAttribute('aria-label', '一時停止');
      run();
    } else { stopTalk(); subHide(); if (window.AZAKEI_VOICE) AZAKEI_VOICE.bgm(false); setPlay(false); }
  };
  const setBgm = on => {
    bgmOn = on; try { localStorage.setItem('azakei_bgm', on ? '1' : '0'); } catch (e) {}
    const b = el.querySelector('.dk-bbtn'); b.setAttribute('aria-pressed', on); b.textContent = on ? 'BGM：あり' : 'BGM';
    VO().then(v => { if (v) v.bgm(on && narr); });
  };

  // 知る：小さなお札が、お金のめぐりの図の矢印の上を走る（[0〜5] の順に）
  const ride = list => {
    const s = el.querySelector('.dk-s.is-on'), r = s && s.querySelector('.dk-rider'); if (!r || reduce) return;
    const am = r.querySelector('animateMotion'), mp = am.querySelector('mpath');
    const tok = tTok;
    list.forEach((j, k) => setTimeout(() => {
      if (tok !== tTok) return;
      mp.setAttribute('href', '#dkf' + j);
      r.classList.add('is-go'); sfx('ride');
      try { am.beginElement(); } catch (e) {}
    }, k * 1700));
  };

  // まとめ：お札マンへの質問タイム（答えは、スライドとサイトにあることだけ）
  const QA = [
    ['麻経って、いつできたの？', { t: '2025 年にできた、麻布中学校・高等学校の経済系同好会だよ。', m: 'happy' }],
    ['文化祭には、何人来たの？', { t: '3 日間で 2,364 人。いちばん多かったのは、2 日目の 1,152 人だよ！', m: 'wow' }],
    ['Web では、何ができるの？', { t: 'クイズ 84 問、経済ラボの 29 の実験、用語辞典 300 語。お祭りの券のルールを決める工房もあるよ。' }],
    ['次の文化祭は、いつ？', { t: '2027 年 5 月の予定だよ。準備の流れは「日程とイベント」のページで見られるよ。' }],
    ['協賛するには？', { t: '「協賛のご案内」のページを見てね。お問い合わせからも相談できるよ。', m: 'happy' }]
  ];
  const showQA = () => {
    const b = el.querySelector('.dk-ch-b');
    let q = b.querySelector('.dk-qa');
    if (!q) {
      q = document.createElement('div'); q.className = 'dk-qa';
      q.innerHTML = `${QA.map(([k], j) => `<button type="button" data-qa="${j}">${k}</button>`).join('')}<button type="button" class="dk-qa-go" data-qa="go">次へ進む →</button>`;
      b.appendChild(q);
      q.addEventListener('click', e => {
        const x = e.target.closest('[data-qa]'); if (!x) return;
        if (x.dataset.qa === 'go') { hideQA(); go(i + 1); return; }
        stopTalk(); q.classList.add('is-busy');
        x.classList.add('is-asked');
        say(QA[+x.dataset.qa][1], () => { q.classList.remove('is-busy'); el.querySelector('.dk-chara').classList.remove(...MOODS); });
      });
    }
    q.querySelectorAll('.is-asked').forEach(x => x.classList.remove('is-asked'));
    q.hidden = false;
    el.querySelector('.dk-ch-t').textContent = '質問があったら、下から選んでね。ぼくが答えるよ！';
  };
  const hideQA = () => { const q = el && el.querySelector('.dk-qa'); if (q) q.hidden = true; };

  // しめくくり：麻経券が上から舞い落ちる
  const rain = () => {
    if (reduce) return;
    const s = el.querySelector('.dk-s.is-on'); if (!s || s.querySelector('.dk-rain')) return;
    const r = document.createElement('div'); r.className = 'dk-rain'; r.setAttribute('aria-hidden', 'true');
    r.innerHTML = Array.from({ length: 18 }, (_, j) => `<i style="--x:${(j * 53) % 100}%;--d:${(j % 6) * .35}s;--t:${3.2 + (j % 5) * .5}s;--r:${(j % 2 ? 1 : -1) * (180 + j * 20)}deg"><b>麻経券</b></i>`).join('');
    s.appendChild(r); sfx('end');
    setTimeout(() => r.remove(), 7000);
  };

  // ── お札マンが発表：ふきだしに 1 文ずつ（文字が順に出る）。声を出すこともできる。言い終わると次のスライドへ
  const stopTalk = () => {
    tTok++; clearTimeout(tt);
    if (window.AZAKEI_VOICE) AZAKEI_VOICE.ttsStop(); else if (window.speechSynthesis) speechSynthesis.cancel();
    if (el) { el.querySelector('.dk-chara').classList.remove('is-talk'); el.classList.remove('is-spot'); }
  };
  // 顔（happy・wow・think・sad）と、話している間に光らせる場所
  const MOODS = ['is-happy', 'is-wow', 'is-think', 'is-sad'];
  const unHl = () => el.querySelectorAll('.dk-hl').forEach(x => x.classList.remove('dk-hl'));
  const say = (line, done) => {
    const o = typeof line === 'string' ? { t: line } : line, txt = o.t;
    const tok = tTok, t = el.querySelector('.dk-ch-t'), c = el.querySelector('.dk-chara');
    let k = 0, typed = false, spoke = !voice;
    c.classList.remove(...MOODS); if (o.m) c.classList.add('is-' + o.m);
    unHl(); if (o.hl) el.querySelectorAll('.dk-s.is-on ' + o.hl.split(',').join(', .dk-s.is-on ')).forEach(x => x.classList.add('dk-hl'));
    if (o.ride) ride(o.ride);
    c.classList.add('is-talk');
    let done1 = false;
    const fin = () => {
      if (tok !== tTok || !typed || !spoke || done1) return;
      done1 = true;
      c.classList.remove('is-talk');
      tt = setTimeout(() => { if (tok === tTok) done(); }, voice ? 350 * SPD[spd][1] : (650 + txt.length * 22) * SPD[spd][1]);
    };
    if (voice) {
      // お札マンの声（voice.js の man：前もってつくった VOICEVOX の声。なければブラウザの読み上げ）。終わりの知らせが来なくても、長さから見て遅すぎたら先へ
      const go2 = () => { if (tok === tTok && !spoke) { spoke = true; fin(); } };
      setTimeout(() => { if (tok !== tTok) return; if (window.AZAKEI_VOICE) AZAKEI_VOICE.man(txt, { rate: 1 / SPD[spd][1] }).then(go2); else go2(); }, 80);
      setTimeout(go2, 4000 + txt.length * 300 * SPD[spd][1]);
    }
    const type = () => {
      if (tok !== tTok) return;
      k = reduce ? txt.length : k + 1;
      t.textContent = txt.slice(0, k);
      if (!voice && k % 2) sfx('blip');
      if (k < txt.length) tt = setTimeout(type, (/[、。！？]/.test(txt[k - 1]) ? 220 : 52) * SPD[spd][1]); else { typed = true; fin(); }
    };
    type();
  };
  const talk = () => {
    stopTalk();
    if (!playing || !chara) return;
    const tok = tTok, lines = CL[i] || [];
    const bar = bars()[i];
    const step = () => {
      if (tok !== tTok) return;
      bar.style.transition = 'transform .4s'; bar.style.transform = `scaleX(${li / Math.max(1, lines.length)})`;
      // 最初の 1 文は、スライドを暗くして、お札マンを大きく（あいさつ）
      el.classList.toggle('is-spot', i === 0 && li === 0);
      if (li >= lines.length) {
        unHl();
        if (S[i].cls === 'is-sum') { showQA(); return; }
        if (i < S.length - 1) tt = setTimeout(() => { if (tok === tTok) go(i + 1); }, 700);
        else { el.querySelector('.dk-chara').classList.add('is-bye'); setPlay(false, true); annSay(['goseichouarigatou'], 'ご清聴ありがとうございました。', true); }
        return;
      }
      const ln = lines[li];
      if (ln === '@flip' && ann && !flipAsked) { flipAsked = true; unHl(); el.querySelector('.dk-ch-t').textContent = '……'; annSay(['zyunbihaiidesuka'], '準備はいいですか？').then(() => { if (tok === tTok) step(); }); return; }
      if (ln === '@flip') {
        flipAsked = false;
        unHl();
        // 会場の人がもう A か B を押していたら、その結果について話す。まだなら、お札マンが B をえらんでコインを投げる
        const mine = el.querySelector('.dk-s.is-on [data-ab][aria-pressed="true"]');
        if (!mine) { const b = el.querySelector('.dk-s.is-on [data-ab="B"]'); if (b) flip(b, true); el.querySelector('.dk-ch-t').textContent = 'えいっ！'; }
        tt = setTimeout(() => {
          if (tok !== tTok) return;
          const head = el.querySelector('.dk-s.is-on .dk-coin').classList.contains('is-h');
          say(mine
            ? (head ? { t: '表が出たね！ B を選んだ人は 200 チップ。', m: 'wow', hl: '.dk-coin' } : { t: '裏が出たね。B を選んだ人は 0 チップ、A なら 100 だった。', m: 'think', hl: '.dk-coin' })
            : (head ? { t: '表だ！ 200 チップ、もらえた！', m: 'wow', hl: '.dk-coin' } : { t: '裏……0 チップだった。ざんねん。', m: 'sad', hl: '.dk-coin' }), () => { li++; step(); });
        }, reduce ? 100 : 1500);
        return;
      }
      say(ln, () => { li++; step(); });
    };
    // 案内の声が流れているあいだは、お札マンは話しはじめない
    const wait = annP;
    if (wait) el.querySelector('.dk-ch-t').textContent = '';
    wait ? wait.then(() => { if (tok === tTok) step(); }) : step();
  };
  const setChara = on => {
    chara = on;
    const c = el.querySelector('.dk-chara');
    el.classList.toggle('is-chara', on);
    c.hidden = !on; c.classList.remove('is-bye');
    el.querySelector('.dk-cbtn').setAttribute('aria-pressed', on);
    if (on) {
      if (narr) setNarr(false);
      if (note) setNote(false);
      setTool(''); li = 0;
      el.querySelector('.dk-ch-t').textContent = '';
      // 入ってくる動きは 1 回だけ（クラスを残すと、顔が変わるたびにもう一度入ってきてしまう）
      c.classList.remove('is-in'); void c.offsetWidth; c.classList.add('is-in');
      setTimeout(() => c.classList.remove('is-in'), 900);
      // 最後のスライドから始めても最初に戻らないよう、setPlay を通さずに話しはじめる
      clearTimeout(timer); playing = false;
      setTimeout(() => { if (!chara) return; playing = true; c.classList.remove('is-paused'); const b = el.querySelector('.dk-play'); b.textContent = 'II'; b.setAttribute('aria-label', '一時停止'); run(); }, reduce ? 0 : 600);
    } else { stopTalk(); setPlay(false); unHl(); el.classList.remove('is-spot'); c.classList.remove(...MOODS); }
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
    if (chara) { talk(); return; }
    if (narr) { narrate(); return; }
    if (!playing || i >= S.length - 1) { if (i >= S.length - 1) setPlay(false, true); return; }
    const b = bars()[i]; void b.offsetWidth;
    b.style.transition = `transform ${left}ms linear`; b.style.transform = 'scaleX(1)';
    startAt = Date.now();
    timer = setTimeout(() => go(i + 1), left);
  };
  const go = n => {
    if (n < 0 || n >= S.length) return;
    i = n; left = dur(i); paint();
    if (chara) setTimeout(run, 0); else requestAnimationFrame(run);
  };
  const setPlay = (on, ended) => {
    playing = on;
    const btn = el.querySelector('.dk-play');
    btn.textContent = on ? 'II' : '▶'; btn.setAttribute('aria-label', on ? '一時停止' : (ended ? '最初から' : '再生'));
    // お札マンの発表が止まっているときは、ふきだしに「つづける」を出す
    el.querySelector('.dk-chara').classList.toggle('is-paused', chara && !on && !ended);
    const b = bars()[i];
    if (!on) {
      clearTimeout(timer);
      if (chara || narr) stopTalk();
      if (narr) subHide();
      if (!ended && !chara && !narr) { left = Math.max(400, left - (Date.now() - startAt)); const w = b.getBoundingClientRect().width / b.parentElement.getBoundingClientRect().width; b.style.transition = 'none'; b.style.transform = `scaleX(${w})`; }
    } else if (i >= S.length - 1) { go(0); }
    else run();
  };
  // 発表者メモ：自動送りを止め、台本と経過時間を出す
  const setNote = on => {
    if (on && chara) setChara(false);
    if (on && narr) setNarr(false);
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
    else if (e.key === 'p' || e.key === 'P') setChara(!chara);
    else if (e.key === 'o' || e.key === 'O') opening();
    else if (e.key === 'r' || e.key === 'R') setNarr(!narr);
    else if (e.key === 'v' || e.key === 'V') setAnn(!ann);
    else if (e.key === 'g' || e.key === 'G') grid(true);
    else if (e.key === ' ' && !e.target.closest('a, button')) { e.preventDefault(); setPlay(!playing); }
    else if (e.key === 'Tab') { const f = [...el.querySelectorAll('.dk-s.is-on a, .dk-s.is-on button, .dk-ctl button:not(:disabled)')]; if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  };
  const open = (start = 0, withChara = false) => {
    if (!el) build();
    if (chara && !withChara) setChara(false);
    lastFocus = document.activeElement;
    document.documentElement.classList.add('dk-open');
    el.classList.add('is-open');
    prevI = -1;
    i = Math.max(0, Math.min(S.length - 1, start | 0)); left = dur(i); playing = !reduce && !note && i < S.length - 1; paint(); setPlay(playing, !playing && i >= S.length - 1);
    document.addEventListener('keydown', onKey);
    if (withChara) setChara(true);
    el.querySelector('.dk-x').focus({ preventScroll: true });
    if (!/^#deck(-\d+)?$/.test(location.hash)) history.replaceState(null, '', '#deck');
  };
  function close() {
    clearTimeout(timer); clearInterval(clock); clearInterval(pvClock);
    if (narr) setNarr(false);
    opTok++; annTok++; annP = null; if (window.AZAKEI_VOICE) AZAKEI_VOICE.stop(); const oc = el.querySelector('.dk-op'); if (oc) oc.remove(); capHide();
    grid(false); setTool(''); stopTalk();
    if (pv && !pv.closed) pv.close();
    el.classList.remove('is-open');
    document.documentElement.classList.remove('dk-open');
    document.removeEventListener('keydown', onKey);
    if (/^#deck(-\d+)?$/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  window.AZAKEI_DECK = { open, close, show: () => { open(0); opening(); } };
})();
