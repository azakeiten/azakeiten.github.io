/* ================================================================
   content.js — サイト全体のデータ
   ここを書き換えるだけで、イベント・写真・日常・実績などが更新されます。
   ================================================================ */
window.AZAKEI = {

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
    question: '来年の麻布経済展、どんな展示が見たい？',
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
    { year: '2026', title: '高校生ビジネスコンテストに出場', label: 'チームで事業計画をつくり、挑戦しました', link: 'contests.html#business' }
  ]
};
