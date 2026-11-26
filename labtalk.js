/* ================================================================
   labtalk.js — 経済ラボ：ゲームの結果に、お札マンがひとこと（声つき）
   ・各ゲームの結果画面から window.AZAKEI_TALK(結果の箱, ゲーム名, 段階, 段階の数) を呼ぶ
     段階 0 がいちばんよい結果。いちばん上は「top」、いちばん下は「low」、あいだは「mid」のせりふ
   ・「声で聞く」を押すと、voice.js（AivisSpeech でつくったお札マンの声）で読む。自動では鳴らさない
   ・せりふを変えたら、声もつくりなおす（tools/voicevox/README.txt。vv-extract.pl がここの LINES を集める）
   ================================================================ */
(function () {
  if (window.AZAKEI_TALK) return;
  const LINES = {
    dbl: {
      top: '72 を割るだけで、未来が見えるね。きみはもう、複利の時計職人だよ！',
      mid: 'いい調子！ 年利が 2 倍になると、2 倍になる年数は半分。これを覚えておくと速いよ。',
      low: 'まずは「72 わる 年利」。6 パーセントなら 12 年。ここからはじめよう！'
    },
    kuji: {
      top: 'お客さんにも喜ばれて、ちゃんともうかる。くじ屋の名店主だね！',
      mid: '当たりを減らしすぎると、うわさが広がるんだ。ちょうどいい割合を探してみて。',
      low: 'くじは、売る側が平均ではもうかるしくみ。でも、当たらないと誰も来ないよ。'
    },
    oku: {
      top: 'ケタの感覚はばっちり！ 1 兆円の重さまでわかるなんて、すごいね。',
      mid: 'おしい！ 1 ケタ上がると 10 倍。億と兆は、1 万倍ちがうんだ。',
      low: '1 億円は、一万円札を積むと約 1 メートル。ここを目じるしにしてみて！'
    },
    budget: {
      top: '国の予算、よく知ってるね！ いちばん多いのは社会保障だよ。',
      mid: 'だいたい合ってる！ 2 番目に多いのが、借金の返済と利子なんだ。',
      low: '100 円のうち 3 分の 1 は社会保障。お年寄りが増えると、もっと増えていくよ。'
    },
    crypto: {
      top: 'お札、電子マネー、暗号資産。ちがいがしっかりわかってるね！',
      mid: 'あと少し！ 国が発行しているかどうかが、見分けるポイントだよ。',
      low: '暗号資産は、国が発行していないお金。値段が大きく上下するから、気をつけてね。'
    },
    receipt: {
      top: '税率の打ち分け、プロのレジ係みたい！ イートインも見のがさなかったね。',
      mid: 'いい調子！ 迷ったら、お酒と外食と薬は 10 パーセント、と思い出してね。',
      low: '食べものの持ち帰りは 8 パーセント。お店の席で食べると 10 パーセントだよ。'
    },
    ginko: {
      top: '貸す相手をよく見て、ちゃんともうけた。町いちばんの銀行家だね！',
      mid: '利子が高い相手は、返せない心配も大きいんだ。じっくり選んでみて。',
      low: '「必ずもうかる」と言う相手ほど、気をつけて。次は相手をよく調べよう！'
    },
    kabu: {
      top: '株と借金を上手に使い分けたね。会社がぐんと大きくなったよ！',
      mid: '株で集めると返さなくていいけど、きみの持ち分は減るんだ。バランスが大事！',
      low: '持ち分が半分を切ると、株主総会で負けることもある。次は作戦を変えてみよう！'
    },
    fx: {
      top: '為替のニュース、すらすら読めてるね！ 立場で、うれしいかどうかが変わるんだ。',
      mid: '1 ドルに払う円が増えたら、円の値打ちが下がった、つまり円安だよ。',
      low: '円安は、輸出する会社にはうれしくて、輸入するお店にはこまる。ここから覚えよう！'
    },
    shop: {
      top: '損益分岐点を軽々こえた！ 行列のできるお店だね。',
      mid: '黒字になったね！ 作る数と値段を変えると、もっともうかるかも。',
      low: '費用の合計を値段で割ると、損益分岐点。まずは、そこをこえるのが目標だよ！'
    },
    market: {
      top: 'ニュースを読んで、線の動きがぴたりとわかったね。名編集長だ！',
      mid: 'ほしい人の話なら需要、作る側の話なら供給。そう考えると、わかりやすいよ。',
      low: '台風で野菜がとれないと、供給が減って、値段が上がる。ここからはじめよう！'
    },
    infl: {
      top: '名目と実質、しっかり見ぬけてるね！ 物価のことなら、もう安心だ。',
      mid: '給料が上がっても、物価がもっと上がると、買えるものは減るんだよ。',
      low: '実質は、お金の上がり方から、物価の上がり方を引いたもの。これだけ覚えてね！'
    }
  };
  const ver = (document.currentScript && document.currentScript.src.split('v=')[1]) || '1';
  const VO = () => window.AZAKEI_VOICE ? Promise.resolve(window.AZAKEI_VOICE) : new Promise(r => { const s = document.createElement('script'); s.src = 'voice.js?v=' + ver; s.onload = () => r(window.AZAKEI_VOICE || null); s.onerror = () => r(null); document.head.appendChild(s); });
  window.AZAKEI_TALK = (box, key, idx, n) => {
    const set = LINES[key]; if (!box || !set) return;
    const tier = idx <= 0 ? 'top' : idx >= n - 1 ? 'low' : 'mid', text = set[tier];
    const el = document.createElement('div');
    el.className = 'lt';
    el.innerHTML = `<span class="lt-face" aria-hidden="true">札</span><div class="lt-b"><p class="lt-who">お札マンのひとこと</p><p class="lt-t">${text}</p><button type="button" class="lt-say">声で聞く</button></div>`;
    const parent = box.firstElementChild && box.children.length === 1 ? box.firstElementChild : box;
    const last = [...parent.children].reverse().find(c => c.tagName === 'BUTTON');
    if (last) last.before(el); else parent.appendChild(el);
    el.querySelector('.lt-say').addEventListener('click', async e => {
      const b = e.currentTarget; b.classList.add('is-on'); b.textContent = '再生中…';
      const v = await VO();
      if (!v || !v.man) { b.textContent = '声を出せませんでした'; return; }
      try { await v.man(text); } catch (err) {}
      b.classList.remove('is-on'); b.textContent = 'もう一度聞く';
    });
  };
  if (!document.querySelector('link[href^="labtalk.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'labtalk.css?v=' + ver; document.head.appendChild(l); }
})();
