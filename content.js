/* ================================================================
   content.js — サイト全体のデータ
   ここを書き換えるだけで、イベント・写真・日常・実績などが更新されます。
   ================================================================ */
window.AZAKEI = {

  /* ---- SNS ---- */
  sns: [
    { name: 'Instagram', handle: '@azakeichannel', url: 'https://www.instagram.com/azakeichannel/', desc: '活動報告・お知らせ' },
    { name: 'Instagram Vlog', handle: '@azakei_vlog', url: 'https://www.instagram.com/azakei_vlog/', desc: '何気ない日常をVlogで' },
    { name: 'X', handle: '@azakeiten', url: 'https://x.com/azakeiten', desc: '最新情報をいち早く' }
  ],

  /* ---- お問い合わせ設定 ----
     formEndpoint: Formspree などの送信先URL（例: https://formspree.io/f/xxxxxx）
     email:        formEndpoint が空のとき、メールソフトを開いて送る宛先
     どちらも空なら、Instagram の DM へ案内します。 */
  contact: {
    formEndpoint: '',
    email: ''
  },

  /* ---- 日程・イベント ----
     date は 'YYYY-MM-DD'。日付未定なら date を空にして when に文字で書く。 */
  events: [
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
