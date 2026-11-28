/* ================================================================
   sagi.js — あそび場：そのメッセージ、あやしい？（詐欺・悪質な勧誘の見分け方・近づいてから読みこむ）
   ・スマホに 8 通のメッセージがとどく。「あやしい」か「だいじょうぶ」かを決める
   ・あやしいメッセージでは、文の中の「赤信号」（あやしいところ）を押してさがす
   ・メッセージはすべて、この遊びのためにつくったたとえ。実在の会社・サービスの名前は使わない
   ・相談先：消費者ホットライン 188、警察相談専用電話 #9110
   ・自己ベストは azakei_sagi（8 通のうち、見分けられた数）。見た目は sagi.css
   ================================================================ */
(function () {
  const box = document.querySelector('[data-sagi]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="sagi.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'sagi.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const KEY = 'azakei_sagi';
  // { 種類, 差出人, 時刻, 文（文字列か [文, 赤信号の説明]）, あやしい？, まとめ }
  const M = [
    { k: 'SMS', from: '090-XXXX-XXXX', time: '10:12', bad: 1,
      t: ['お荷物をお届けにあがりましたが、不在のため持ち帰りました。', ['こちらから再配達の手続きをしてください', '知らない番号からの「再配達」のリンクは、にせのサイトにつながることがあります。'], ' ', ['http://xx-takuhai.example/', 'リンクを押さず、自分で知っている公式アプリやサイトから確かめよう。']],
      sum: '宅配便の「不在通知」をよそおうメッセージ。押すと、にせのサイトでパスワードやカードの番号を入力させられることがあります。' },
    { k: 'SNS', from: 'お仕事紹介', time: '21:40', bad: 1,
      t: [['1 日 3 時間で日給 5 万円！', 'かんたんな仕事で、高すぎるお金。ありえない話には、うらがあります。'], ' ', ['荷物を受け取って運ぶだけ', '中身を知らされない荷物運びは、犯罪の手伝いをさせられる「闇バイト」かもしれません。'], 'のかんたんなお仕事です。応募は、', ['身分証の写真を送るだけ', '身分証や住所を送ると、それをたてに、やめたくてもやめられなくされることがあります。'], '。'],
      sum: 'いわゆる「闇バイト」の募集。最初はかんたんに見えても、犯罪の実行役にされることがあります。応募せず、すぐ家の人に相談を。' },
    { k: 'SNS', from: 'もうかる投資の先生', time: '19:05', bad: 1,
      t: [['元本保証', '投資で「元本保証」と「高いもうけ」は、ふつうは両立しません。'], 'で、', ['毎月 10% ずつ増える', '毎月 10% は、1 年で約 3 倍。そんなにもうかるなら、知らない人に教えません。'], '投資があります。', ['今だけ、あなただけ', '「今だけ」「あなただけ」は、考える時間をうばう決まり文句です。'], 'にご案内しています。'],
      sum: 'もうけ話の投資詐欺。「必ずもうかる」「元本保証で高利回り」は、まずうたがいましょう。' },
    { k: 'メール', from: 'キャンペーン事務局', time: '08:30', bad: 1,
      t: [['おめでとうございます！ 抽選で 10 万円が当たりました。', '応募した覚えがないのに「当選」は、あやしい合図です。'], '受け取りには、', ['手数料 3,000 円', '当選したのに、先にお金を払わせるのはおかしな話です。'], 'を', ['ギフトカードで', 'ギフトカードの番号を送らせるのは、詐欺によくある払わせ方です。'], 'お支払いください。'],
      sum: '「当選しました」と先にお金を払わせる詐欺。ギフトカードで払って、と言われたら、ほぼまちがいなく詐欺です。' },
    { k: 'SNS', from: 'クラスの友だち', time: '17:22', bad: 1,
      t: ['すごい話があるの！ ', ['友だちを 2 人さそうと、あなたにも報酬が入る', '人をさそうほどもうかる仕組みは、さそう人がいなくなると成り立ちません。'], 'んだって。', ['最初に 5 万円の商品を買うだけ', '始めるのに高いお金がいるのは、悪質な「マルチ商法」によくある形です。'], 'で、すぐ元がとれるよ。'],
      sum: '友だちから来ることもある、悪質なマルチ商法のさそい。人間関係もこわれやすいので、その場で返事をしないで。' },
    { k: 'アプリ', from: '市立図書館', time: '15:00', bad: 0,
      t: ['予約していた本「くらしと経済」が用意できました。2 週間以内に、カウンターで受け取ってください。'],
      sum: '自分で予約した本の、ふつうの連絡です。リンクもなく、お金や個人情報も求めていません。' },
    { k: 'SMS', from: '090-XXXX-XXXX', time: '23:58', bad: 1,
      t: [['あなたの口座が不正に使われました。', 'こわがらせて、あわてさせるのが手口です。'], ' ', ['至急', '「至急」「今日中」とせかすのは、考えさせないためです。'], '、', ['こちらからパスワードを確認してください', '銀行がメッセージのリンクから、パスワードを入力させることはありません。'], '。'],
      sum: '銀行をよそおって、パスワードをぬすむメッセージ（フィッシング）。心配なら、自分で銀行の公式アプリや窓口に確かめよう。' },
    { k: 'メール', from: '文化祭実行委員', time: '18:10', bad: 0,
      t: ['明日の文化祭の準備は、9 時に体育館集合です。持ち物は軍手と水筒。雨のときは、教室に集まります。'],
      sum: '知っている相手からの、ふつうの連絡です。お金やパスワード、急な判断を求めていません。' },
    { k: 'サイト', from: '動画サイト', time: '22:31', bad: 1,
      t: [['「再生」を押しただけで「ご登録ありがとうございます」', '押しただけで契約が決まることは、ふつうありません。'], '。会員料金 98,000 円を、', ['3 日以内にお支払いください。払わないと法的手続きに進みます', '期限やことばでおどして、あわてて払わせるのが手口です。'], '。'],
      sum: '「ワンクリック詐欺」。押しただけで払う必要はありません。連絡もせず、こわければ家の人や消費者ホットライン 188 へ。' }
  ];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let Q = [], i = 0, ok = 0, flags = 0, flagsAll = 0, mode = 'judge';
  const best = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const start = () => {
    // あやしい 6 通・だいじょうぶ 2 通を、順番をまぜて出す
    Q = shuffle([...shuffle(M.filter(m => m.bad)).slice(0, 6), ...M.filter(m => !m.bad)]);
    i = 0; ok = 0; flags = 0; flagsAll = 0;
    box.innerHTML = `<div class="sg-wrap">
      <div class="sg-phone"><div class="sg-notch" aria-hidden="true"></div>
        <div class="sg-bar"><span data-k="time">--:--</span><span class="sg-sig" aria-hidden="true"><i></i><i></i><i></i></span></div>
        <div class="sg-head"><span class="sg-av" data-k="av" aria-hidden="true"></span><div><b data-k="from"></b><small data-k="kind"></small></div><span class="sg-cnt" data-k="cnt"></span></div>
        <div class="sg-chat" data-k="chat"></div>
      </div>
      <div class="sg-side">
        <ol class="sg-dots">${Q.map(() => '<li></li>').join('')}</ol>
        <p class="sg-ask" data-k="ask"></p>
        <div class="sg-btns" data-k="btns"></div>
        <div class="sg-rv" data-k="rv" hidden></div>
        <p class="sg-score">見分けた数 <b data-k="ok">0</b> ／ 見つけた赤信号 <b data-k="fl">0</b></p>
      </div></div>`;
    show();
  };
  const K = k => box.querySelector(`[data-k="${k}"]`);
  const show = () => {
    const m = Q[i]; mode = 'judge';
    K('time').textContent = m.time; K('from').textContent = m.from; K('kind').textContent = m.k; K('av').textContent = m.from.slice(0, 1).replace(/[0-9]/, '?'); K('cnt').textContent = `${i + 1} / ${Q.length}`;
    const chat = K('chat');
    chat.innerHTML = `<div class="sg-msg">${m.t.map((s, j) => typeof s === 'string' ? `<span>${s}</span>` : `<span class="sg-f" data-f="${j}">${s[0]}</span>`).join('')}</div><p class="sg-read">既読</p>`;
    chat.classList.remove('is-in'); void chat.offsetWidth; chat.classList.add('is-in');
    box.querySelectorAll('.sg-dots li').forEach((d, j) => d.classList.toggle('is-now', j === i));
    K('ask').innerHTML = 'このメッセージ、どう思う？';
    K('btns').innerHTML = '<button type="button" class="sg-b is-bad" data-a="bad"><b>あやしい</b><small>返事をしない・押さない</small></button><button type="button" class="sg-b is-ok" data-a="ok"><b>だいじょうぶ</b><small>ふつうの連絡</small></button>';
    K('rv').hidden = true; K('rv').innerHTML = '';
  };
  const judge = bad => {
    if (mode !== 'judge') return;
    const m = Q[i], hit = bad === !!m.bad;
    if (hit) ok++;
    K('ok').textContent = ok;
    box.querySelectorAll('.sg-dots li')[i].className = hit ? 'is-ok' : 'is-ng';
    K('btns').innerHTML = '';
    const head = `<p class="sg-res ${hit ? 'is-ok' : 'is-ng'}">${hit ? '見分けた！' : 'おしい'}${m.bad ? '　これは、あやしいメッセージ' : '　これは、ふつうの連絡'}</p>`;
    if (m.bad) {
      mode = 'hunt'; flagsAll += box.querySelectorAll('.sg-f').length;
      K('chat').classList.add('is-hunt');
      K('ask').innerHTML = '<b>赤信号さがし</b>　文の中の、あやしいところを押そう';
      K('rv').innerHTML = `${head}<ul class="sg-notes" data-k="notes"></ul><button type="button" class="sg-next is-sub" data-a="all">のこりの赤信号を見る</button>`;
    } else {
      mode = 'done';
      K('ask').innerHTML = '';
      K('rv').innerHTML = `${head}<p>${m.sum}</p><button type="button" class="sg-next" data-a="next">${i + 1 < Q.length ? '次のメッセージ' : '結果を見る'}</button>`;
    }
    K('rv').hidden = false;
  };
  const flag = (el, mine) => {
    if (el.classList.contains('is-on')) return;
    const m = Q[i], s = m.t[+el.dataset.f];
    el.classList.add('is-on'); if (!mine) el.classList.add('is-shown');
    if (mine) { flags++; K('fl').textContent = flags; }
    K('notes').insertAdjacentHTML('beforeend', `<li class="${mine ? '' : 'is-shown'}"><b>${s[0]}</b>${s[1]}</li>`);
    if (!box.querySelector('.sg-f:not(.is-on)')) done();
  };
  const done = () => {
    if (mode !== 'hunt') return; mode = 'done';
    const m = Q[i];
    K('chat').classList.remove('is-hunt');
    K('ask').innerHTML = '';
    const b = K('rv').querySelector('[data-a="all"]'); if (b) b.remove();
    K('rv').insertAdjacentHTML('beforeend', `<p class="sg-sum">${m.sum}</p><button type="button" class="sg-next" data-a="next">${i + 1 < Q.length ? '次のメッセージ' : '結果を見る'}</button>`);
  };
  const TITLE = [[8, '見破りの名人', '極'], [6, 'しっかり者', '良'], [4, '気づける人', '見'], [0, 'これから守れる', '初']];
  const finish = () => {
    const prev = best(); if (ok > prev) try { localStorage.setItem(KEY, String(ok)); } catch (e) {}
    const ti = TITLE.findIndex(x => ok >= x[0]);
    box.innerHTML = `<div class="sg-end">
      <span class="sg-seal" aria-hidden="true">${TITLE[ti][2]}</span>
      <p class="sg-big"><b>${ok}</b> / ${Q.length} 通を見分けた<small>見つけた赤信号 ${flags} / ${flagsAll}</small></p>
      <p class="sg-title">${TITLE[ti][1]}${ok > prev && prev ? '<em>自己ベスト更新</em>' : prev && ok <= prev ? `<small>自己ベスト ${prev} 通</small>` : ''}</p>
      <div class="sg-rules">
        <div><span aria-hidden="true">止</span><p><b>「もうかる」「当たった」「急いで」は、立ち止まる</b>うまい話や、こわがらせる話は、考える時間をうばうためのことばです。</p></div>
        <div><span aria-hidden="true">押</span><p><b>メッセージのリンクは押さない</b>確かめたいときは、自分で知っている公式アプリやサイトから。</p></div>
        <div><span aria-hidden="true">守</span><p><b>パスワード・身分証・カードの番号は送らない</b>先にお金を払わせる話も、ことわってだいじょうぶ。</p></div>
        <div><span aria-hidden="true">話</span><p><b>こまったら、ひとりで決めない</b>家の人や先生に相談を。消費者ホットライン <b>188</b>、警察の相談は <b>#9110</b>。</p></div>
      </div>
      <p class="sg-note">メッセージは、この遊びのためにつくったたとえです。実際の手口は、これからも形を変えて出てきます。</p>
      <button type="button" class="sg-next" data-a="again">もう一度、別の順番で</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(box.querySelector('.sg-end'), 'sagi', ti, TITLE.length);
  };
  const intro = () => {
    const b = best();
    box.innerHTML = `<div class="sg-intro">
      <div class="sg-mini" aria-hidden="true"><i>8</i></div>
      <div><p class="sg-kicker">スマホに 8 通</p><h3 class="sg-h">そのメッセージ、あやしい？</h3>
      <p class="sg-p">宅配便の不在通知、高い日給のバイト、もうかる投資、当選のお知らせ。スマホにとどいた 8 通を読んで、<b>あやしい</b>か<b>だいじょうぶ</b>かを決めよう。あやしいメッセージでは、文の中の<b>赤信号</b>を押してさがします。メッセージは、この遊びのためにつくったたとえです。</p>
      <p class="sg-best">${b ? `自己ベスト <b>${b}</b> / 8 通` : 'はじめての挑戦'}</p>
      <button type="button" class="sg-next" data-a="start">スマホを見る</button></div></div>`;
  };
  box.addEventListener('click', e => {
    const a = e.target.closest('[data-a]');
    if (a) {
      const v = a.dataset.a;
      if (v === 'bad' || v === 'ok') judge(v === 'bad');
      else if (v === 'all') box.querySelectorAll('.sg-f:not(.is-on)').forEach(f => flag(f, false));
      else if (v === 'next') { i++; if (i < Q.length) show(); else finish(); }
      else if (v === 'start' || v === 'again') start();
      return;
    }
    const f = e.target.closest('.sg-f');
    if (f && mode === 'hunt') { flag(f, true); return; }
    const sp = e.target.closest('.sg-msg span');
    if (sp && mode === 'hunt') { sp.classList.remove('is-miss'); void sp.offsetWidth; sp.classList.add('is-miss'); }
  });
  intro();
})();
