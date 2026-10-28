/* ================================================================
   omikuji.js — トップ：経済おみくじ（1 日 1 回。箱をふると、おみくじがひらく）
   ・運勢は遊び。「ラッキーことば」は用語辞典へ、「ラッキー実験」は経済ラボへつながる
   ・その日の結果はこのブラウザに残し、同じ日はもう一度見られるだけ（引き直しなし）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-omikuji]');
  if (!box) return;
  const KEY = 'azakei_omikuji';
  const LUCK = [['大吉', '#b5432f'], ['中吉', '#c98a1c'], ['小吉', '#2f6b3a'], ['吉', '#2f6b3a'], ['末吉', '#4a6a8a']];
  // [ラッキーことば(id), ことば, ひとこと, ラッキー実験(href), 実験の名前]
  const W = [
    ['simple-compound', '単利と複利', '小さな積み重ねが、あとで大きくふくらむ日。今日の 10 分を、明日の自分にあげよう。', 'sim.html#double', 'お金が 2 倍になるまで'],
    ['diversify', '分散投資', '予定を 1 つのかごに盛りすぎないで。いくつかに分けると、どれかがうまくいく。', 'sim.html#sim-main', 'チップ配分'],
    ['opportunity-cost', '機会費用', '何かを選ぶと、何かをあきらめている。今日は「選ばなかったほう」も思い出してみて。', 'sim.html#bungyo', '分業のふしぎ'],
    ['supply-demand', '需要と供給', '欲しい人が多いものは値上がりしやすい。人気のパンは、早めに買いにいこう。', 'sim.html#market', '値段の決まり方'],
    ['save-invest', '貯蓄と投資', 'ためる日と、ふやす日。今日はどちらの日にする？', 'sim.html#okozukai', 'おこづかいチャレンジ'],
    ['risk-return', 'リスクとリターン', 'ちょっと勇気を出すと、いいことがあるかも。ただし、無理はしすぎないで。', 'sim.html#kuji', 'くじ引きの期待値'],
    ['fukakachi', '付加価値', 'ひと手間かけると、ぐっと価値が上がる日。ノートの字を、いつもより少しきれいに。', 'sim.html#shop', '文化祭でお店をひらこう'],
    ['comparative-advantage', '比較優位', '得意なことは、人にまかせたほうがいいこともある。今日はチームプレーが吉。', 'sim.html#bungyo', '分業のふしぎ'],
    ['break-even', '損益分岐点', 'あと少しで「黒字」に届く日。最後のひとふんばりが大事。', 'sim.html#shop', '文化祭でお店をひらこう'],
    ['inflation', 'インフレーション（インフレ）', '同じお金で買えるものは、少しずつ変わっていく。今日のおやつの値段を見てみて。', 'sim.html#infl', 'インフレのタイムマシン'],
    ['exchange', '為替（かわせ）', '見る角度を変えると、同じものでも値打ちがちがって見える日。', 'sim.html#fx', '円高・円安の両替所'],
    ['dividend', '配当', 'がんばった分が、少しずつ返ってくる日。友だちにも分けてあげよう。', 'sim.html#kabu', '株式会社をつくろう'],
    ['budget', '予算と家計簿', '使う前に、ちょっとだけ計画を。おこづかい帳をつけると運気アップ。', 'sim.html#receipt', 'レシートの中の税金'],
    ['dca', 'ドルコスト平均法', 'あせらず、毎日コツコツ。同じペースで続けるのが、いちばんの近道。', 'sim.html#double', 'お金が 2 倍になるまで'],
    ['rule72', '72 の法則', '72 を何かで割りたくなる日。暗算が冴えるかも。', 'sim.html#double', 'お金が 2 倍になるまで']
  ];
  const jst = new Date(Date.now() + 9 * 3600e3);
  const day = Math.floor(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()) / 864e5);
  let saved = null; try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  const today = saved && saved.day === day ? saved : null;
  box.innerHTML = `
    <div class="ok-shrine">
      <button type="button" class="ok-box" aria-label="おみくじの箱をふる"><span class="ok-box-face"><b>経済</b><b>みくじ</b></span><span class="ok-stick" aria-hidden="true"></span></button>
      <p class="ok-hint">${today ? '今日はもう引きました。押すと、もう一度見られます' : '箱を押して、ふってみよう（1 日 1 回）'}</p>
    </div>
    <div class="ok-slip" aria-live="polite"></div>`;
  const btn = box.querySelector('.ok-box'), slip = box.querySelector('.ok-slip');
  const show = r => {
    const l = LUCK[r.l], w = W[r.w];
    slip.innerHTML = `<div class="ok-paper" style="--c:${l[1]}">
      <p class="ok-luck"><small>今日の運勢</small><b>${l[0]}</b></p>
      <div class="ok-body">
        <p class="ok-row"><span>ラッキーことば</span><a href="glossary.html#${w[0]}">${w[1]}</a></p>
        <p class="ok-msg">${w[2]}</p>
        <p class="ok-row"><span>ラッキー実験</span><a href="${w[3]}">${w[4]} →</a></p>
        <p class="ok-foot">※ おみくじは遊びです。明日また、新しいおみくじが引けます。</p>
      </div></div>`;
    slip.classList.remove('is-open'); void slip.offsetWidth; slip.classList.add('is-open');
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('is-lite');
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    let r = today || saved && saved.day === day && saved;
    if (!r) {
      // 大吉は少しだけ出やすく（遊びなので、ちょっとサービス）
      const p = Math.random(), li = p < .22 ? 0 : p < .45 ? 1 : p < .68 ? 2 : p < .88 ? 3 : 4;
      r = { day, l: li, w: Math.random() * W.length | 0 };
      saved = r; try { localStorage.setItem(KEY, JSON.stringify(r)); } catch (e) {}
    }
    btn.disabled = true; btn.classList.remove('is-shake'); void btn.offsetWidth; btn.classList.add('is-shake');
    setTimeout(() => { btn.disabled = false; show(r); box.querySelector('.ok-hint').textContent = '明日また、新しいおみくじが引けます'; }, reduce ? 0 : 1300);
  });
})();
