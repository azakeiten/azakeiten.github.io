/* ================================================================
   koma.js — 用語辞典：お札マンの 3 コマ解説
   ・話題をえらぶと、3 コマ（大きな数字＋ひとこと）と、お札マンのまとめが出る
   ・計画書にあった「中学生にもわかりやすい経済 1 分解説」をもとにしたコーナー
   ================================================================ */
(function() {
  const box = document.querySelector('[data-koma]');
  if (!box) return;
  const T = [
    { k: 'インフレ', id: 'inflation', p: [['去年', '100 円', 'お気に入りのパンが 100 円。'], ['今年', '110 円', '同じパンが 110 円に値上がり。'], ['つまり', '100 円 ＜ パン', '同じ 100 円で、買えるものが減った。']], s: 'モノの値段が上がり続けると、お金の値打ちは下がるんだ。これがインフレだよ。' },
    { k: '円安', id: 'yen', p: [['前は', '1 ドル ＝ 100 円', '1 ドルのお菓子が 100 円で買えた。'], ['いまは', '1 ドル ＝ 150 円', '同じお菓子に 150 円かかる。'], ['すると', '輸入 ↑ ／ 輸出 ◎', '外国の物は高くなるけど、外国に売る会社はうれしい。']], s: '円の値打ちが下がるのが円安。だれが得をして、だれが困るかが変わるんだ。' },
    { k: '株', id: 'stock', p: [['会社', 'お金がほしい', '新しい工場をつくりたい！'], ['あなた', '株を買う', 'お金を出して、会社の持ち主のひとりに。'], ['その後', '配当 ／ 値上がり', 'もうかれば分け前がもらえる。でも、下がることもある。']], s: '株は「会社を応援して、いっしょにもうけを分け合う」しくみ。リスクもセットだよ。' },
    { k: '金利', id: 'interest', p: [['預ける', '100 万円', '銀行にお金を預ける。'], ['1 年後', '+1 万円', '金利 1％ なら、利息が 1 万円つく。'], ['借りると', '−利息', '反対に、借りたときは利息を払う側になる。']], s: '金利は「お金のレンタル料」。貸せばもらえて、借りれば払うんだ。' },
    { k: '複利', id: 'simple-compound', p: [['はじめ', '100 万円', '年 5％ で増やしていく。'], ['1 年後', '105 万円', '次の年は、105 万円に 5％ がつく。'], ['20 年後', '約 265 万円', '利息にも利息がついて、雪だるま式に。']], s: '時間を味方にするのが複利のコツ。早く始めるほど、差が大きくなるよ。' },
    { k: '需要と供給', id: 'supply-demand', p: [['グッズ', '残り 10 個', '文化祭の限定グッズ。'], ['ほしい人', '100 人', '欲しい人のほうが、ずっと多い！'], ['だから', '値段 ↑', '少ないモノを取り合うと、値段は上がる。たくさん作れば下がる。']], s: '欲しい量と、売りたい量のつり合いで値段が決まる。シミュレーターでもためせるよ。' }
  ];
  let cur = 0;
  const draw = () => {
    const t = T[cur];
    box.querySelector('.km-tabs').querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-selected', i === cur ? 'true' : 'false'));
    box.querySelector('.km-panels').innerHTML = t.p.map(([tag, big, txt], i) => `<li class="km-p" style="--i:${i}"><span class="km-no">${i + 1}</span><small>${tag}</small><b>${big}</b><p>${txt}</p></li>`).join('');
    box.querySelector('.km-sum').innerHTML = (window.AZAKEI_OSATSU ? AZAKEI_OSATSU(t.s, 'happy') : `<p>${t.s}</p>`) + `<a class="km-more" href="#${t.id}">「${t.k}」を辞典で読む →</a>`;
  };
  box.innerHTML = `<div class="km-tabs" role="tablist" aria-label="話題をえらぶ">${T.map((t, i) => `<button type="button" role="tab" data-i="${i}">${t.k}</button>`).join('')}</div><ol class="km-panels" aria-live="polite"></ol><div class="km-sum"></div>`;
  box.querySelector('.km-tabs').addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b) return; cur = +b.dataset.i; draw(); });
  draw();
})();
