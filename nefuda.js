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
/* ================================================================
   v373：「単価くらべ 40 秒」— スーパーの棚で、1 g・1 mL・1 個あたり安いのはどっち？
   ・毎回、たとえの商品と値段を数字から新しくつくる（大きい袋が高いこともある）
   ・L と mL のちがい、「2 割引」「20% 増量」もまざる。計算してからえらぶ
   ・正解で次へ。続けて正解すると倍率アップ。まちがえると 3 秒へる
   ・自己ベストは azakei_tanka_best。見た目は tanka.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-nefuda]');
  if (!box || document.querySelector('.tk2')) return;
  if (!document.querySelector('link[href^="tanka.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'tanka.css?v=20261128e'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_tanka_best', TIME = 40;
  const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const g = document.createElement('div');
  g.className = 'tk2';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="tk2-sub"><span aria-hidden="true">験</span>じっくりためす：7 つのしかけを、ひとつずつ見破る</p>');
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.random() * a.length | 0];
  // [名前, 印, 単位, くらべる量, サイズ候補, 単価(円/単位)の範囲, 形]
  const ITEM = [
    ['緑茶', '茶', 'mL', 100, [500, 650, 1000, 2000], [.12, .3], 'bt'],
    ['ポテトチップス', '芋', 'g', 100, [60, 85, 170], [1.4, 2.2], 'bx'],
    ['たまご', '卵', '個', 1, [6, 10], [22, 34], 'bx'],
    ['お米', '米', 'kg', 1, [2, 5, 10], [380, 560], 'bg'],
    ['ノート', '帳', '冊', 1, [1, 3, 5], [110, 180], 'bx'],
    ['ヨーグルト', '乳', 'g', 100, [100, 400], [.3, .6], 'bx'],
    ['トイレットペーパー', '紙', 'ロール', 1, [4, 12], [45, 80], 'bg'],
    ['オレンジジュース', '果', 'mL', 100, [200, 1000, 1500], [.18, .4], 'bt']
  ];
  const nice = p => Math.max(58, Math.round(p / 10) * 10 - 2); // 〜8 円で終わる値段
  const qtyText = (q, u) => u === 'mL' && q >= 1000 ? `${(q / 1000).toLocaleString()} L` : `${q.toLocaleString()} ${u}`;
  const unitText = it => it[3] === 1 ? `1 ${it[2]}` : `${it[3]} ${it[2]}`;
  const perText = (v, it) => `${unitText(it)}あたり 約 ${v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1)} 円`;
  const make = () => {
    for (let tries = 0; tries < 60; tries++) {
      const it = pick(ITEM), sz = it[4];
      const i1 = R(0, sz.length - 2), i2 = R(i1 + 1, sz.length - 1), s = sz[i1], l = sz[i2];
      const base = it[5][0] + Math.random() * (it[5][1] - it[5][0]);
      const trap = Math.random() < .3; // 大きいほうが、かえって高い
      const A = { q: s, price: nice(base * s) }, B = { q: l, price: nice(base * l * (trap ? 1 + R(6, 18) / 100 : 1 - R(8, 24) / 100)) };
      // ときどき「割引」「20% 増量」をまぜる
      const tw = Math.random();
      if (tw < .2) { const t = Math.random() < .5 ? A : B; t.off = pick([10, 20, 30]); t.price = nice(t.price / (1 - t.off / 100)); }
      else if (tw < .38) { const t = Math.random() < .5 ? A : B; t.plus = 1; t.base = t.q; t.q = Math.round(t.q * 1.2); }
      [A, B].forEach(o => { o.pay = o.off ? Math.round(o.price * (1 - o.off / 100)) : o.price; o.u = o.pay / o.q * it[3]; });
      const d = Math.abs(A.u - B.u) / Math.min(A.u, B.u);
      if (d < .04 || d > .6) continue;
      const pair = Math.random() < .5 ? [A, B] : [B, A];
      return { it, pair, ans: pair[0].u < pair[1].u ? 0 : 1, bigHigh: B.u > A.u };
    }
    return make();
  };
  const card = (o, it, k) => `<button type="button" class="tk2-p" data-v="${k}">
      <span class="tk2-pk is-${it[6]}" style="--s:${(.72 + Math.min(1, o.q / it[4][it[4].length - 1]) * .28).toFixed(2)}" aria-hidden="true"><i>${it[1]}</i>${o.plus ? '<em>20% 増量</em>' : ''}</span>
      <b class="tk2-q">${qtyText(o.q, it[2])}</b>${o.plus ? `<small class="tk2-was">いつもは ${qtyText(o.base, it[2])}</small>` : ''}
      <span class="tk2-tag">${o.off ? `<s>${o.price.toLocaleString()} 円</s><b>レジで ${o.off / 10} 割引</b>` : `<b>${o.price.toLocaleString()}<small> 円</small></b>`}</span>
    </button>`;
  let st = null, tick = 0;
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="tk2-intro">
      <div class="tk2-shelf" aria-hidden="true"><span class="tk2-pk is-bt" style="--s:.8"><i>茶</i></span><span class="tk2-pk is-bx" style="--s:1"><i>芋</i></span><span class="tk2-pk is-bg" style="--s:.9"><i>米</i></span></div>
      <div><p class="tk2-kicker">スピード勝負</p><h3 class="tk2-h">単価くらべ 40 秒</h3>
      <p class="tk2-p0">スーパーの棚に、同じ商品の大きさちがいが 2 つ。<b>1 g・1 mL・1 個あたり安いほう</b>を押そう。大きい袋のほうが高いこともあります。「L」と「mL」、「割引」「20% 増量」もまざるので、計算してからえらぼう。続けて当てると点が上がり、まちがえると 3 秒へります。値段はすべてたとえです。</p>
      <p class="tk2-best">${b ? `自己ベスト <b>${b}</b> 点` : 'はじめての買い物'}</p>
      <button type="button" class="tk2-go" data-tk="start">買い物を始める</button></div></div>`;
  };
  const start = () => {
    st = { score: 0, streak: 0, ok: 0, miss: [], end: performance.now() + TIME * 1000, lock: false };
    g.innerHTML = `<div class="tk2-play">
      <div class="tk2-top"><span class="tk2-t"><b data-tk="t">${TIME}</b> 秒</span><span class="tk2-st" data-tk="st"></span><span class="tk2-sc">得点 <b data-tk="sc">0</b></span></div>
      <div class="tk2-time" aria-hidden="true"><i data-tk="bar"></i></div>
      <p class="tk2-ask" data-tk="ask"></p>
      <div class="tk2-row" data-tk="row"></div>
      <p class="tk2-fb" data-tk="fb" aria-live="polite"></p></div>`;
    show();
    clearInterval(tick);
    tick = setInterval(() => {
      if (!st) return;
      const left = Math.max(0, (st.end - performance.now()) / 1000);
      g.querySelector('[data-tk="t"]').textContent = Math.ceil(left);
      const bar = g.querySelector('[data-tk="bar"]'); bar.style.transform = `scaleX(${(left / TIME).toFixed(3)})`; bar.classList.toggle('is-low', left < 10);
      if (left <= 0) finish();
    }, 100);
  };
  const show = () => {
    const q = make(); st.q = q;
    g.querySelector('[data-tk="ask"]').innerHTML = `<b>${q.it[0]}</b>　${unitText(q.it)}あたり安いのは？`;
    const row = g.querySelector('[data-tk="row"]');
    row.innerHTML = card(q.pair[0], q.it, 0) + '<span class="tk2-vs" aria-hidden="true">か</span>' + card(q.pair[1], q.it, 1);
    row.classList.remove('is-in'); void row.offsetWidth; row.classList.add('is-in');
  };
  const why = q => {
    const [a, b] = q.pair, it = q.it, f = o => `${o.off ? `${o.price} 円の ${o.off / 10} 割引で ${o.pay} 円、` : ''}${qtyText(o.q, it[2])}で ${o.pay} 円 → ${perText(o.u, it)}`;
    return `<span>左：${f(a)}</span><span>右：${f(b)}</span>${q.bigHigh ? '<em>この棚では、大きいほうが高い。</em>' : ''}`;
  };
  const mult = () => 1 + Math.min(st.streak, 8) * 0.25;
  const answer = v => {
    if (!st || st.lock) return;
    const q = st.q, ok = v === q.ans, fb = g.querySelector('[data-tk="fb"]'), btn = g.querySelectorAll('.tk2-p');
    btn[q.ans].classList.add('is-win'); if (!ok) btn[v].classList.add('is-lose');
    if (ok) { st.streak++; st.ok++; const pts = Math.round(10 * mult()); st.score += pts; fb.className = 'tk2-fb is-ok'; fb.innerHTML = `<b>正解 ＋${pts}</b>${why(q)}`; }
    else { st.streak = 0; st.end -= 3000; st.miss.push(q); fb.className = 'tk2-fb is-ng'; fb.innerHTML = `<b>${q.ans ? '右' : '左'}のほうが安い</b>${why(q)}`; }
    g.querySelector('[data-tk="sc"]').textContent = st.score;
    g.querySelector('[data-tk="st"]').textContent = st.streak >= 3 ? `${st.streak} 連続 ×${mult().toFixed(2).replace(/0$/, '')}` : '';
    st.lock = true;
    setTimeout(() => { if (!st) return; st.lock = false; fb.className = 'tk2-fb'; fb.innerHTML = ''; show(); }, ok ? (reduce ? 500 : 1600) : 3200);
  };
  const TITLE = [[200, '単価の名人'], [120, 'かしこい買い物上手'], [50, '買い物係の見習い'], [0, 'これから見る目を育てよう']];
  const finish = () => {
    clearInterval(tick);
    const s = st; st = null;
    const prev = getB(), best = s.score > prev;
    try { if (best) localStorage.setItem(KEY, String(s.score)); } catch (e) {}
    const ti = TITLE.findIndex(x => s.score >= x[0]);
    g.innerHTML = `<div class="tk2-end">
      <p class="tk2-kicker">本日のレシート</p>
      <p class="tk2-big"><b>${s.score}</b> 点<small>正解 ${s.ok}・まちがい ${s.miss.length}</small></p>
      <p class="tk2-title"><span aria-hidden="true">称</span>${TITLE[ti][1]}${best ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${prev} 点</small>` : ''}</p>
      ${s.miss.length ? `<p class="tk2-l">まちがえた棚</p><ul class="tk2-miss">${s.miss.slice(0, 3).map(q => `<li><b>${q.it[0]}</b><p>${why(q)}</p></li>`).join('')}</ul>` : '<p class="tk2-perfect">まちがいゼロ！ 単価を見る目は確かです。</p>'}
      <div class="tk2-rule"><p class="tk2-l">お店でくらべるときは</p><ul><li>単位をそろえる（1 L ＝ 1,000 mL、1 kg ＝ 1,000 g）</li><li>大きい袋が安いとは限らない。値札の「単価」の小さな字も見よう</li><li>割引や増量は、計算してからくらべる</li><li>安くても、使い切れない量なら、むだになることもある</li></ul></div>
      <button type="button" class="tk2-go" data-tk="start">もう一度買い物する</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(g.querySelector('.tk2-end'), 'tanka', ti, TITLE.length);
  };
  g.addEventListener('click', e => {
    const k = e.target.closest('[data-v]'); if (k) { answer(+k.dataset.v); return; }
    if (e.target.closest('[data-tk="start"]')) start();
  });
  intro();
})();
