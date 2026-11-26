/* ================================================================
   nefuda.js — あそび場：値札のマジック（近づいてから読みこむ）
   ・お店の棚に、しかけのある値札が並ぶ。7 つの場面で「どっちが得？」「どう考える？」をえらぶ
   ・答えると、虫めがねで値札のしかけ（アンカリング・おとり・送料無料・まとめ買い・端数・残りわずか・ポイント）があばかれる
   ・最後に「見破り度」と、集めたしかけの図鑑。行動経済学・ポイント還元の用語辞典へ
   ・商品と値段はすべてたとえ。見た目は nefuda.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-nefuda]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="nefuda.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'nefuda.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 場面：店の名前・問い・値札（tags：表示する HTML）・えらぶもの（[文, 正解か]）・しかけの名前・印・説明・見破るコツ
  const BASIC = [
    { shop: '家電の店', q: '同じヘッドホン。安いのはどっち？', tags: [['A 店', '<s>定価 12,000 円</s><b>6,000 円</b><em>50% OFF！</em>'], ['B 店', '<b>5,800 円</b>']],
      opts: [['A 店（半額で大きくお得！）', 0], ['B 店', 1]], seal: '錨', name: 'アンカリング', how: '先に見た「12,000 円」が、心の中の基準（いかり）になります。そこから下がった 6,000 円は、とても安く感じます。でも、くらべるべきなのは今の値段どうしです。', tip: '線で消された「定価」より、ほかの店の今の値段とくらべよう。' },
    { shop: '映画館の売店', q: 'ポップコーンが 3 つ。M サイズは、何のためにありそう？', tags: [['S', '<b>300 円</b>'], ['M', '<b>650 円</b>'], ['L', '<b>700 円</b>']],
      opts: [['M がいちばん売れるから', 0], ['L を「たった 50 円高いだけ」と思わせるため', 1], ['S を売るため', 0]], seal: '囮', name: 'おとり効果', how: 'あまり選ばれない M があると、L が「M より少し高いだけでずっと多い」と、お得に見えます。M は、L を売るための「おとり」かもしれません。', tip: 'まず「本当にほしい量」を決めてから、値段を見よう。' },
    { shop: 'ネットのお店', q: '同じ本。払う合計が安いのはどっち？', tags: [['A', '<b>2,500 円</b><em>送料無料！</em>'], ['B', '<b>2,000 円</b><i>＋ 送料 400 円</i>']],
      opts: [['A（送料無料）', 0], ['B', 1]], seal: '零', name: '「無料」の力', how: '「無料」という言葉には、とても強い力があります。B の合計は 2,400 円で A より安いのに、「送料を払うのは損」と感じてしまいがちです。', tip: '「無料」の字を見たら、払う合計の金額でくらべよう。' },
    { shop: 'スーパー', q: 'ジュースを 1 本だけ飲みたい。どうする？', tags: [['1 本', '<b>350 円</b>'], ['3 本セット', '<b>1,000 円</b><em>1 本あたり 333 円！</em>']],
      opts: [['3 本セット（1 本あたりが安い）', 0], ['1 本 350 円', 1]], seal: '束', name: 'まとめ買いのわな', how: '1 本あたりは安くても、いらない分まで買えば、払うお金は多くなります。あまって捨てたら、もっと損です。', tip: '「1 つあたり」より、「自分はいくつ使うか」を先に考えよう。' },
    { shop: '洋服の店', q: '1,980 円と 2,000 円。ちがいはいくら？', tags: [['T シャツ', '<b>1,980 円</b>'], ['T シャツ', '<b>2,000 円</b>']],
      opts: [['1,000 円くらいちがう気がする', 0], ['20 円', 1]], seal: '端', name: '端数価格', how: '人は、いちばん左の数字を強く見ます。1,980 円は「千円台」、2,000 円は「二千円台」に見えて、20 円の差が大きく感じられます。', tip: '頭の中で、きりのいい数に直してくらべよう。' },
    { shop: 'ネットのセール', q: '「残り 2 個！ あと 10 分でセール終了」。まず何をする？', tags: [['ゲームのソフト', '<b>4,800 円</b><em>残り 2 個！</em><i>あと 10:00</i>']],
      opts: [['なくなる前に、すぐ買う', 0], ['本当にほしいか考え、ほかのお店も見る', 1]], seal: '急', name: '残りわずか・時間切れ', how: '「なくなる」「終わる」と言われると、あせって考える時間を飛ばしてしまいます。数や時間は、お店が決めた演出のこともあります。', tip: 'あせったら、いったん深呼吸。ほしい理由を言えるか確かめよう。' },
    { shop: '家電の店', q: 'A はポイント 20% 還元、B は値引き。得なのは？', tags: [['A', '<b>10,000 円</b><em>2,000 ポイントもどる</em>'], ['B', '<b>8,500 円</b>']],
      opts: [['いつでも A', 0], ['いつでも B', 0], ['ポイントを必ず使うなら A、使わないかもしれないなら B', 1]], seal: '点', name: 'ポイント還元', how: 'A は、もどった 2,000 ポイントを使えば実質 8,000 円。でも、ポイントはそのお店でしか使えなかったり、期限があったりします。使わなければ 10,000 円のままです。', tip: 'ポイントは「お金と同じ」ではない。いつ・どこで使うかまで考えよう。' }
  ];
  // 上級編：もっと見えにくいしかけ（商品・値段はたとえ）
  const ADV = [
    { shop: 'お菓子の店', q: '1 個 300 円のお菓子が「2 個目半額！」。2 個買うと、1 個あたり何 % 引き？', tags: [['1 個目', '<b>300 円</b>'], ['2 個目', '<s>300 円</s><b>150 円</b><em>半額！</em>']],
      opts: [['50% 引き', 0], ['25% 引き', 1], ['33% 引き', 0]], seal: '半', name: '「2 個目半額」の割引率', how: '2 個で 450 円。もとの 600 円とくらべると、引かれたのは 150 円で 25%。「半額」という言葉ほどは安くなっていません。しかも、2 個目がいらなければ得ではありません。', tip: '「全部でいくら払うか」と「いくつ必要か」で考えよう。' },
    { shop: 'デパートのセール', q: '「最大 70% OFF」のセール。お店の商品はどうなっている？', tags: [['セール', '<b>最大 70% OFF</b><i>※一部商品</i>']],
      opts: [['お店の商品が、だいたい 70% 引き', 0], ['70% 引きは一部だけ。10% 引きのものも多いかも', 1]], seal: '最', name: '「最大」の言葉', how: '「最大」は「いちばん多くて」という意味。70% 引きは、ごく一部の商品だけのこともあります。大きな数字が目に入ると、全部が安いように感じます。', tip: '「最大」「〜から」「一部」の小さな言葉を読もう。' },
    { shop: 'スマホの店', q: '「実質 0 円！」のスマホ。本当に 0 円？', tags: [['スマホ', '<b>実質 0 円</b><i>※48 回払い・2 年後に返却</i>']],
      opts: [['0 円でもらえる', 0], ['条件つき。2 年後に返す・ほかの料金がかかることも', 1]], seal: '実', name: '「実質」の言葉', how: '「実質 0 円」は、決められた条件（何年か使う・あとで返す・ほかの契約をする など）を守ったときに、払うお金が 0 円になる、という意味のことが多いです。条件を守れないと、残りのお金を払います。', tip: '「実質」を見たら、条件と、全部でいくら払うかを確かめよう。' },
    { shop: 'スーパー', q: 'ポテトチップスが 85 g → 70 g に。値段は同じ 150 円。1 g あたりの値段は？', tags: [['去年', '<b>150 円</b><i>85 g</i>'], ['今年', '<b>150 円</b><i>70 g</i>']],
      opts: [['同じ値段だから、変わらない', 0], ['約 21% の値上げと同じ', 1]], seal: '量', name: '内容量へらし（ステルス値上げ）', how: '値段を変えずに中身をへらすと、1 g あたりは 1.76 円 → 2.14 円で、約 21% の値上げと同じです。値札を見るだけでは気づきにくい値上げです。', tip: '「1 g あたり」「1 個あたり」の値段（単価）を見くらべよう。' },
    { shop: 'ネットの広告', q: '「お客さま満足度 No.1」の小さな字に「※当社調べ・50 人」。どう考える？', tags: [['広告', '<b>満足度 No.1</b><i>※当社調べ・2025 年 3 月・50 人</i>']],
      opts: [['日本一人気の商品だ', 0], ['調べ方しだいで No.1 はつくれる。条件を読む', 1]], seal: '一', name: '小さな注意書きの No.1', how: 'だれが、いつ、何人に、何とくらべて調べたかで、「No.1」の重みは大きく変わります。自分の会社が 50 人に聞いただけ、ということもあります。', tip: '「No.1」「人気」を見たら、※の小さな字まで読もう。' },
    { shop: 'テレビの通販', q: '「初回 500 円！」の健康食品。小さな字に「4 回以上の購入が条件・2 回目から 4,980 円」。4 回で、全部でいくら？', tags: [['初回', '<b>500 円</b><em>お試し</em>'], ['2 回目から', '<b>4,980 円</b><i>※4 回以上の購入が条件</i>']],
      opts: [['500 円で試せる', 0], ['4 回で 15,440 円', 1]], seal: '定', name: '定期購入のわな', how: '500 円 ＋ 4,980 円 × 3 回 ＝ 15,440 円。「お試し」のつもりが、何回も買う約束（定期購入）になっていることがあります。こまったら、消費者ホットライン 188 に相談できます。', tip: '「初回」「お試し」を見たら、何回目からいくらになるかを読もう。' }
  ];
  let R = BASIC, mode = 'basic';

  let i = 0, ok = 0, found = [], busy = false;
  box.innerHTML = `
    <div class="nd-shop">
      <div class="nd-awn" aria-hidden="true"></div>
      <div class="nd-top"><p class="nd-name" data-k="shop"></p><p class="nd-step"><b data-k="n">1</b> / <span data-k="tot">${R.length}</span></p></div>
      <p class="nd-q" data-k="q"></p>
      <div class="nd-shelf" data-k="shelf"></div>
      <div class="nd-opts" data-k="opts" role="group" aria-label="こたえ"></div>
      <div class="nd-reveal" data-k="rev" hidden></div>
    </div>
    <div class="nd-side">
      <div class="nd-mode" role="radiogroup" aria-label="レベル"><button type="button" role="radio" data-mode="basic" aria-checked="true"><b>ふつう編</b><small>7 つのしかけ</small></button><button type="button" role="radio" data-mode="adv" aria-checked="false"><b>上級編</b><small>6 つの、見えにくいしかけ</small></button></div>
      <p class="nd-h">しかけ図鑑 <small><b data-k="got">0</b> / <span data-k="tot2">${R.length}</span></small></p>
      <ol class="nd-book">${R.map(r => `<li><span aria-hidden="true">${r.seal}</span><b>？？？</b></li>`).join('')}</ol>
      <div class="nd-res" hidden></div>
    </div>
    <div class="nd-learn">
      <p><b>人は、いつも計算どおりには選ばない</b>見え方や言い方で、同じものでも高く・安く感じます。こうした心のくせを調べるのが行動経済学です（<a href="glossary.html#behavioral">行動経済学</a>）。</p>
      <p><b>お店は、くせを知っている</b>値札のしかけは、うそではありません。でも、知らないと「お得に見えるだけ」のものを買ってしまうことも（<a href="glossary.html#point-reward">ポイント還元</a>）。</p>
    </div>
    <p class="nd-note">商品・お店・値段は、しくみを知るための「たとえ」です。</p>`;
  const K = k => box.querySelector(`[data-k="${k}"]`);
  const show = () => {
    const r = R[i]; busy = false;
    K('shop').textContent = r.shop; K('n').textContent = i + 1; K('q').textContent = r.q;
    K('shelf').innerHTML = r.tags.map(([n, h], j) => `<div class="nd-item" style="--d:${j * .12}s"><p class="nd-goods">${n}</p><div class="nd-tag">${h}</div></div>`).join('');
    K('opts').innerHTML = r.opts.map(([t], j) => `<button type="button" data-o="${j}">${t}</button>`).join('');
    K('rev').hidden = true; box.querySelector('.nd-shop').classList.remove('is-open');
  };
  const answer = j => {
    if (busy) return; busy = true;
    const r = R[i], good = !!r.opts[j][1];
    if (good) ok++;
    found.push(r.seal);
    box.querySelectorAll('[data-o]').forEach((b, k) => { b.disabled = true; b.classList.toggle('is-right', !!r.opts[k][1]); b.classList.toggle('is-wrong', k === j && !good); });
    const li = box.querySelectorAll('.nd-book li')[i]; li.classList.add('is-got'); li.querySelector('b').textContent = r.name;
    K('got').textContent = found.length;
    box.querySelector('.nd-shop').classList.add('is-open');
    const rv = K('rev');
    rv.innerHTML = `<div class="nd-lens" aria-hidden="true"><span>${r.seal}</span></div><div><p class="nd-r-h">${good ? '見破った！' : 'しかけにかかった…'}<small>しかけ：${r.name}</small></p><p>${r.how}</p><p class="nd-tip"><b>見破るコツ</b>${r.tip}</p><button type="button" class="nd-next" data-a="next">${i < R.length - 1 ? '次の場面へ' : '結果を見る'}</button></div>`;
    rv.hidden = false;
  };
  const finish = () => {
    const rt = ok / R.length, adv = mode === 'adv';
    const title = rt >= 1 ? ['眼', adv ? '値札の大名探偵' : '値札の名探偵'] : rt >= .7 ? ['鋭', adv ? '上級の買い物名人' : 'かしこい買い物名人'] : rt >= .4 ? ['見', '見習い探偵'] : ['初', 'これから見破れる'];
    const res = box.querySelector('.nd-res');
    res.innerHTML = `<span class="nd-r-seal" aria-hidden="true">${title[0]}</span><p class="nd-r-t">${title[1]}</p><p class="nd-r-s">見破り度 <b>${ok}</b> / ${R.length}</p><button type="button" class="nd-again" data-a="again">もう一度</button>`;
    res.hidden = false;
    K('q').textContent = `おつかれさま！ 右の図鑑で、${R.length} つのしかけをふり返ろう。${mode === 'basic' && rt >= .7 ? ' つぎは「上級編」にも挑戦してみよう。' : ''}`;
    K('shelf').innerHTML = ''; K('opts').innerHTML = ''; K('rev').hidden = true;
    try { const key = mode === 'adv' ? 'azakei_nefuda_adv' : 'azakei_nefuda', b = +localStorage.getItem(key) || 0; localStorage.setItem(key, String(Math.max(ok, b))); } catch (e) {}
    window.AZAKEI_TALK && window.AZAKEI_TALK(res, 'nefuda', rt >= 1 ? 'top' : rt >= .4 ? 'mid' : 'low');
  };
  box.addEventListener('click', e => {
    const o = e.target.closest('[data-o]'); if (o) { answer(+o.dataset.o); return; }
    if (e.target.closest('[data-a="next"]')) { i++; if (i < R.length) show(); else finish(); return; }
    const md = e.target.closest('[data-mode]'); if (md) { setMode(md.dataset.mode); return; }
    if (e.target.closest('[data-a="again"]')) setMode(mode);
  });
  // ふつう編 ⇄ 上級編：図鑑をつくりなおして、はじめから
  const setMode = m => {
    mode = m; R = m === 'adv' ? ADV : BASIC; i = 0; ok = 0; found = [];
    box.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-checked', b.dataset.mode === m));
    box.querySelector('.nd-book').innerHTML = R.map(r => `<li><span aria-hidden="true">${r.seal}</span><b>？？？</b></li>`).join('');
    K('got').textContent = 0; K('tot').textContent = R.length; K('tot2').textContent = R.length; box.querySelector('.nd-res').hidden = true;
    box.classList.toggle('is-adv', m === 'adv');
    show();
  };
  show();
})();
