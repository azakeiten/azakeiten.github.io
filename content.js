/* ================================================================
   content.js — サイト全体のデータ
   ここを書き換えるだけで、イベント・写真・日常・実績などが更新されます。
   ================================================================ */
window.AZAKEI = {

  /* ---- サイトの最終更新日（フッターに出す。更新したら書きかえる） ---- */
  siteUpdated: '2026-10-31',

  /* ---- トップ「新しく、遊べるもの」（新しい順。date はその遊びを公開した日） ---- */
  newPlay: [
    { date: '2026-10-31', seal: '策', tone: 'shu', href: 'sim.html#nesage', eyebrow: '経済ラボ', title: 'となりのお店と値下げ競争', text: '値段を守る？ 値下げする？ となりのお店と同時に選んで 10 回勝負。相手の作戦は最後にわかる。ゲーム理論の体験。' },
    { date: '2026-10-30', seal: '録', tone: 'green', href: 'mypage.html', eyebrow: 'わたしの記録', title: '経済力レーダー', text: 'ことば・クイズ・実験・計画・探検。遊んだ記録から 5 つの力を五角形に。得意な力と、のびしろの力がわかる。' },
    { date: '2026-10-30', seal: '並', tone: 'shu', href: 'glossary.html#narabe', eyebrow: '用語辞典', title: 'ことばならべかえ', text: '説明を読んで、バラバラのひらがなを正しい順に。1 回 5 問、ヒントなしで正解すると 2 点。称号と自己ベストつき。' },
    { date: '2026-10-29', seal: '銀', tone: 'gold', href: 'sim.html#ginko', eyebrow: '経済ラボ', title: '銀行のふしぎ', text: 'あずけた 1 万円が貸し出されて、また預金に。12 人のお金の旅で、みんなの預金がいくらになるか。信用創造を体験。' },
    { date: '2026-10-28', seal: '双', tone: 'gold', href: 'quiz.html#sugoroku', eyebrow: 'クイズ', title: '経済すごろく', text: 'サイコロ 12 回で、1,000 円をいくらに？ 給料・税金・利息・投資・保険・ハプニングのマスをめぐる。' },
    { date: '2026-10-28', seal: '籤', tone: 'shu', href: 'index.html#omikuji', eyebrow: 'ホーム', title: '経済おみくじ', text: '箱をふると、おみくじがひらく。今日の運勢と、ラッキーことば・ラッキー実験。1 日 1 回。' },
    { date: '2026-10-28', seal: '株', tone: 'green', href: 'sim.html#kabu', eyebrow: '経済ラボ', title: '株式会社をつくろう', text: '3 人でお金を出しあって会社に。株の円グラフ、多数決で決められる人、配当の分け方が、スライダーで動く。' },
    { date: '2026-10-27', seal: '図', tone: 'dark', href: 'glossary.html#wordmap', eyebrow: '用語辞典', title: 'ことばの地図', text: 'まん中の言葉に、つながる言葉が輪になって並ぶ。押すたびに地図が動いて、言葉から言葉へ旅できる。' },
    { date: '2026-10-27', seal: '籤', tone: 'gold', href: 'sim.html#kuji', eyebrow: '経済ラボ', title: 'くじ引きの期待値', text: '300 円のくじ、平均するといくら戻る？ 予想して 100 回引くと、平均が「期待値」の線に近づいていく。' },
    { date: '2026-10-27', seal: '速', tone: 'shu', href: 'glossary.html#rush', eyebrow: '用語辞典', title: 'ことば○×ラッシュ', text: '言葉と説明、合ってる？ 30 秒で答えまくる。コンボで点がふえて、4 段階の称号つき。' },
    { date: '2026-10-27', seal: '税', tone: 'paper', href: 'sim.html#receipt', eyebrow: '経済ラボ', title: 'レシートの中の税金', text: '商品をかごに入れると、レシートが印字される。同じおにぎりでも、店内で食べると税率が変わる。' },
    { date: '2026-10-27', seal: '分', tone: 'green', href: 'sim.html#bungyo', eyebrow: '経済ラボ', title: '分業のふしぎ', text: '何でも速い A さんと、ゆっくりの B さん。ポスター 6 枚とクッキー、どう分けるといちばん得？' },
    { date: '2026-10-26', seal: '運', tone: 'gold', href: 'glossary.html#gacha', eyebrow: '用語辞典', title: '経済ことばガチャ', text: 'レバーを回すとカプセルが転がり出て、209 語のどれかに出会える。' },
    { date: '2026-10-26', seal: '昇', tone: 'shu', href: 'sim.html#infl', eyebrow: '経済ラボ', title: 'インフレのタイムマシン', text: '物価が上がると、1,000 円で買えるおにぎりは何個に？ 年数を動かすと、少しずつ消えていく。' },
    { date: '2026-10-26', seal: '予', tone: 'green', href: 'sim.html#budget', eyebrow: '経済ラボ', title: '国の予算を、100 円にたとえると？', text: 'いちばん多い使いみちを予想してから開くと、100 円玉がグラフに分かれる。' },
    { date: '2026-10-26', seal: '作', tone: 'paper', href: 'quiz.html#make', eyebrow: 'クイズ', title: '問題を、つくってみよう', text: '経済の問題と 4 つの答えを書くと、その場で遊べる。いい問題は AZAKEI に送れます。' },
    { date: '2026-10-24', seal: '億', tone: 'dark', href: 'sim.html#oku', eyebrow: '経済ラボ', title: '1 億円って、どれくらい？', text: '一万円札を積むと、高さと重さは？ 東京タワーや富士山とくらべてみよう。' },
    { date: '2026-10-23', seal: '貨', tone: 'gold', href: 'quiz.html#coins', eyebrow: 'クイズ', title: '世界のお金図鑑', text: 'この国のお金は？ 正解すると、コインがくるっと回って図鑑に入る。' },
    { date: '2026-10-23', seal: '店', tone: 'shu', href: 'sim.html#shop', eyebrow: '経済ラボ', title: '文化祭でお店をひらこう', text: '何個売れたら黒字？ 損益分岐点を、グラフと店長ミッションで。' },
    { date: '2026-10-23', seal: '豆', tone: 'green', href: 'glossary.html', eyebrow: 'お札マン', title: 'お札マンの、お金の豆知識', text: 'お札マンを押すと、1 円玉の重さや新しいお札のひみつを話してくれる。全 12 話。' },
    { date: '2026-10-21', seal: '読', tone: 'paper', href: 'glossary.html#headline', eyebrow: '用語辞典', title: 'ニュースの見出しを、読みとく', text: '「日銀、利上げ」ってどういうこと？ よく見る見出し 6 つを、新聞の切り抜き風に。' },
    { date: '2026-10-21', seal: '為', tone: 'dark', href: 'sim.html#fx', eyebrow: '経済ラボ', title: '円高・円安の両替所', text: '1 ドルが何円かを動かすと、ハンバーガーの値段が変わる。3 問全問正解でバッジ。' },
    { date: '2026-10-20', seal: '歴', tone: 'shu', href: 'glossary.html#nenpyo', eyebrow: '用語辞典', title: '年表ゲーム「どっちが先？」', text: 'バブルとオイルショック、先に起きたのは？ 8 問連続正解で「歴史通」。' },
    { date: '2026-10-20', seal: '録', tone: 'gold', href: 'mypage.html', eyebrow: 'あなたの記録', title: 'わたしの記録', text: '自己ベスト、覚えた言葉、集めたバッジ。5 段階の称号つき。' },
    { date: '2026-10-20', seal: '種', tone: 'green', href: 'contests.html#plan-seed', eyebrow: 'コンテスト', title: 'ビジネスプランのたね', text: '6 つの欄をうめると、自分のビジネスプランが 1 枚のカードに。' }
  ],

  /* ---- SNS ---- */
  sns: [
    { name: 'Instagram', handle: '@azakei_vlog', url: 'https://www.instagram.com/azakei_vlog/', desc: '活動報告・Vlog・お問い合わせ（DM）' },
    { name: 'X', handle: '@azakeiten', url: 'https://x.com/azakeiten', desc: '最新情報をいち早く' }
  ],

  /* ---- お問い合わせ設定 ----
     formEndpoint: FormSubmit の送信先（https://formsubmit.co/ajax/〈メールアドレス or 有効化後の英数字〉）
                   ここに送ると AZAKEI の Gmail にメールが届きます。
     email:        formEndpoint が空のとき、メールソフトを開いて送る宛先
     どちらも空なら、下の instagram アカウントの DM へ案内します。 */
  contact: {
    formEndpoint: 'https://formsubmit.co/ajax/azakeiten@gmail.com',
    email: 'azakeiten@gmail.com',   // フォームが送れないときの予備（メールで送る）
    instagram: { handle: '@azakei_vlog', url: 'https://www.instagram.com/azakei_vlog/' }
  },

  /* ---- 生きている経済の数字（トップ） ----
     年間の名目GDPを1年の秒数で割り、今年1月1日から今までの分を数え上げて表示します。
     新しい年の数字が発表されたら、annualYen・year・source を書き換えるだけ。 */
  liveEconomy: {
    year: '2025年度',
    annualYen: 672.7e12,
    source: '内閣府 経済社会総合研究所「国民経済計算」2025年度 名目GDP 672.7兆円（2026年9月公表）'
  },

  /* ---- 文化祭投票 ----
     firebase に設定（Firebase コンソールの firebaseConfig）を入れると、
     票は Firestore に保存されます（1人1票をサーバー側のルールで保証）。
     firebase が null の間は、仮の保存先（Abacus）を使います。
     年度を変えるときは pollId を 'festival-2028' のように変えると 0 票から始まります。
     ※ 選択肢の key を変えたら firestore.rules の options() も同じに直すこと。 */
  firebase: {
    apiKey: 'AIzaSyBHw0uo7i1aTQ45UI_nNWsN8Ljb_C7C6J4',
    authDomain: 'azakei.firebaseapp.com',
    projectId: 'azakei',
    storageBucket: 'azakei.firebasestorage.app',
    messagingSenderId: '616148078496',
    appId: '1:616148078496:web:216b60254a70665696dec5'
  },
  vote: {
    pollId: 'festival-2027',
    namespace: 'azakei-festival-vote-2027',
    question: '次の麻布経済展、どんな展示が見たい？',
    options: [
      { key: 'same',    label: '去年と同じ',       en: 'Same as 2026', desc: 'チップを増やす体験型展示を、もう一度。' },
      { key: 'econ',    label: 'ガチ経済系',       en: 'Hardcore Economics', desc: '株・金融・マクロ経済を本気で深掘り。' },
      { key: 'fun',     label: '面白系',           en: 'Just for Fun', desc: 'とにかく笑えて、楽しい展示。' },
      { key: 'insta',   label: 'Instagram映え系',  en: 'Photogenic', desc: '思わず写真を撮りたくなる空間。' },
      { key: 'food',    label: '飲食系',           en: 'Food & Drink', desc: '食べて、飲んで、経済を体感。' },
      { key: 'life',    label: '人生系',           en: 'Life & Money', desc: 'お金・キャリア・生き方を考える。' },
      { key: 'society', label: '社会系',           en: 'Society', desc: '社会の課題を、経済で読み解く。' }
    ]
  },

  /* ---- 日程・イベント ----
     date は 'YYYY-MM-DD'。日付未定なら date を空にして when に文字で書く。 */
  // 文化祭の来場者（2026 年）。1〜3 日目
  visitors: { total: 2364, days: [492, 1152, 720] },
  // 日程と活動日誌は、部員用 更新ページ（admin.html）から書きます（Firebase に保存）。
  // ここに直接書くこともできますが、管理ページで直せなくなるので使わないでください。
  events: [],

  /* ---- 活動風景（写真） ----
     src を空にすると「写真準備中」の枠になります。 */
  gallery: [
    { src: 'photos/room-diagnosis.jpg', caption: '展示会場（エコノミスト診断のポスター）', date: '2026.05' },
    { src: 'photos/hallway-wave.jpg', caption: '廊下の飾りつけ「麻経」の大波', date: '2026.05' },
    { src: 'photos/setup.jpg', caption: '準備中。パネルを組み立てる', date: '2026' },
    { src: 'photos/board-millionaire.jpg', caption: '黒板の「本日の億万長者」', date: '2026.05' },
    { src: 'photos/hallway-game.jpg', caption: '廊下の入口。「GAME」の看板', date: '2026.05' },
    { src: 'photos/member-pizza.jpg', caption: 'おつかれさまのピザ', date: '2026.05' },
    { src: 'photos/room-paper.jpg', caption: '「紙展」のパネルとカードゲームの卓', date: '2026.05' },
    { src: 'photos/star-bills.jpg', caption: '入口の六芒星と、オリジナル紙幣', date: '2026.05' },
    { src: 'photos/balloons.jpg', caption: '文化祭のフィナーレ', date: '2026.05' },
    { src: 'members.jpg', caption: 'メンバー集合', date: '2026' },
    { src: 'photos/star-door.jpg', caption: '中3-5 教室の入口', date: '2026.05' },
    { src: 'photos/board-special.jpg', caption: '特別時間の黒板と倍率表', date: '2026.05' }
  ],

  /* ---- 何気ない日常 ---- */
  diary: [],

  /* ---- 実績（いつか） ----
     ここに追加すると、トップと「麻経とは」に表示されます。 */
  achievements: [
    // stat（大きく出す数字）・unit・label・link は書かなくても OK
    { year: '2026', title: '文化祭「麻布経済展」を開催', stat: '2,364', unit: '人', label: '3 日間の来場者', link: 'festival.html' },
    { year: '2026', title: '日経ストックリーグに応募', label: '7 月 20 日に応募。ポートフォリオとレポートに挑戦中', link: 'contests.html#stockleague' },
    { year: '2026', title: '高校生ビジネスコンテストに出場', label: '9 月 24 日、チームでつくった事業計画を提出', link: 'contests.html#business' }
  ]
};
