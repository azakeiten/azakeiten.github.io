/* ================================================================
   content.js — サイト全体のデータ
   ここを書き換えるだけで、イベント・写真・日常・実績などが更新されます。
   ================================================================ */
window.AZAKEI = {

  /* ---- SNS ---- */
  sns: [
    { name: 'Instagram', handle: '@azakeichannel', url: 'https://www.instagram.com/azakeichannel/', desc: '活動報告・お知らせ' },
    { name: 'Instagram Vlog', handle: '@azakei_vlog', url: 'https://www.instagram.com/azakei_vlog/', desc: 'Vlog・お問い合わせ（DM）' },
    { name: 'X', handle: '@azakeiten', url: 'https://x.com/azakeiten', desc: '最新情報をいち早く' }
  ],

  /* ---- お問い合わせ設定 ----
     formEndpoint: Formspree などの送信先URL（例: https://formspree.io/f/xxxxxx）
     email:        formEndpoint が空のとき、メールソフトを開いて送る宛先
     どちらも空なら、下の instagram アカウントの DM へ案内します。 */
  contact: {
    formEndpoint: '',
    email: '',
    instagram: { handle: '@azakei_vlog', url: 'https://www.instagram.com/azakei_vlog/' }
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
  events: [
    { date: '', when: '受付中', title: '文化祭投票「来年どんな展示が見たい？」', tag: '投票', place: 'このサイト', desc: '次の麻布経済展のテーマを、みなさんの投票で決めます。', link: 'vote.html' },
    { date: '2027-05-01', end: '2027-05-03', title: '文化祭「麻布経済展」2027', tag: '文化祭', place: '麻布中学校・高等学校', desc: '経済とエンタメが交差する、体験型展示。今年も開催予定です。', link: 'festival.html' },
    { date: '', when: '日程調整中', title: '日経ストックリーグ 参加', tag: 'コンテスト', place: 'オンライン', desc: 'チームでポートフォリオを組み、レポートを作成します。', link: 'contests.html#stockleague' },
    { date: '', when: '日程調整中', title: 'ビジネスコンテスト 挑戦', tag: 'コンテスト', place: '—', desc: '高校生向けビジネスコンテストへの出場を準備中。', link: 'contests.html#business' },
    { date: '2026-05-01', end: '2026-05-03', title: '文化祭「麻布経済展」2026', tag: '文化祭', place: '麻布中学校・高等学校 中3-5教室', desc: '3日間で合計2,364人にご来場いただきました。', link: 'festival.html' }
  ],

  /* ---- 活動風景（写真） ----
     src を空にすると「写真準備中」の枠になります。 */
  gallery: [
    { src: 'S__36020261.jpg', caption: 'メンバー集合', date: '2026' },
    { src: 'IMG_6150.jpg', caption: '文化祭の展示', date: '2026.05' },
    { src: 'tokyo.jpg', caption: '世の中の仕組みを見渡す', date: '' },
    { src: '', caption: 'ミーティング風景', date: '' },
    { src: '', caption: 'コンテスト準備', date: '' },
    { src: '', caption: '文化祭の準備', date: '' }
  ],

  /* ---- 何気ない日常 ---- */
  diary: [
    { date: '2026-10-01', title: 'ホームページを AZAKEI にリニューアル', body: '黒板にサイトの構成を書き出して、みんなで新しいホームページを考えました。' },
    { date: '2026-05-03', title: '文化祭、3日間おつかれさま', body: '3日間で2,364人。たくさんのご来場、ありがとうございました。' }
  ],

  /* ---- 実績（いつか） ----
     ここに追加すると、トップと「麻経とは」に表示されます。 */
  achievements: [
    { year: '2026', title: '文化祭「麻布経済展」 来場者 2,364人' }
  ]
};
