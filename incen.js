/* ================================================================
   incen.js — あそび場：ルールで、みんなは動く？（インセンティブと思わぬ動き・近づいてから読みこむ）
   ・町や学校の 4 つのこまりごとに、3 つのルール案からいちばんうまくいくものを選ぶ
   ・選ぶと「こまりごとメーター」が動き、思わぬ動き（ごほうびや罰金が、逆の動きを生む）があればハンコが押される
   ・人はルールのごほうび・罰（インセンティブ）に合わせて動く。お金で「ゆるされる」と、かえって増えることもある
   ・結果はすべて、説明のためのたとえ（よく知られた例をもとにしている）
   ・自己ベストは azakei_incen（4 問中の正解数）。見た目は incen.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-incen]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="incen.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'incen.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const KEY = 'azakei_incen';
  // { 印, こまりごと, 説明, 案: [[ルール, こまりごとの残り（100 が今）, 思わぬ動き or '', 結果の説明]], 正解, まとめ }
  const P = [
    { seal: '輪', t: '駅前の放置自転車', p: '駅前に、毎日 100 台の自転車が放置されています。歩道がせまくなって、こまっています。',
      o: [['放置自転車を 1 台見つけて届けたら、100 円のごほうび', 130, '届けるために、古い自転車をわざと置く人が出てきた', 'ごほうびが「放置自転車を見つけること」についたので、放置自転車をつくると得になってしまいました。'],
          ['駅前に無料の駐輪場をつくり、放置は撤去して 2,000 円で返す', 25, '', '置き場所があり、放置すると損になる。どちらも「ちゃんと止める」ほうへ人を動かしました。'],
          ['「放置しないで」のポスターを駅にはる', 85, '', 'お願いだけでは、少ししか変わりませんでした。止める場所がないままだからです。']], a: 1,
      sum: 'ごほうびをつける場所をまちがえると、こまりごとを「つくる」人が出ます。' },
    { seal: '本', t: '図書館の返却おくれ', p: '返す日をすぎても本を返さない人が多く、次に借りたい人が待っています。',
      o: [['1 日おくれるごとに 10 円の延滞料', 120, '「10 円払えばいいんだ」と、気軽におくれる人が増えた', '「おくれるのは悪いこと」が「お金を払えばいいこと」に変わってしまいました。小さすぎる罰金は、ゆるしのチケットになることがあります。'],
          ['返す日の前の日に、スマホにお知らせが届く', 40, '', 'わすれていた人が、思い出して返しに来ました。多くの人は、悪気なくわすれているだけでした。'],
          ['1 日でもおくれたら、1 か月なにも借りられない', 45, 'おくれは減ったが、図書館に来る人も減ってしまった', 'きびしすぎる罰は、こまりごとは減らしても、ほかの大事なもの（来る人）まで減らしてしまいました。']], a: 1,
      sum: '罰金は「ゆるし」に変わることがある。しかけ（お知らせ）で動く人も多い。' },
    { seal: '電', t: '教室のエアコンの電気代', p: '学校の電気代が高く、だれもいない教室でもエアコンがついたままのことがあります。',
      o: [['クラスごとに電気代を見えるようにして、節約した分は文化祭の予算に', 55, '', '自分たちのクラスの得になるので、出るときに消すクラスが増えました。'],
          ['「28 度に設定しよう」の張り紙をする', 85, '', '張り紙だけでは、あまり変わりませんでした。消しても、自分たちには何も変わらないからです。'],
          ['夏もエアコンの使用は禁止', 10, '電気代は減ったが、暑さで体調をくずす人が出た', '電気代は減っても、もっと大事な健康を守れなくなりました。']], a: 0,
      sum: '節約した分が自分たちにもどると、人は進んで節約します。' },
    { seal: '祭', t: '文化祭のゴミ', p: '文化祭の 2 日間、校庭に飲みものの容器のポイ捨てが目立ちます。',
      o: [['ゴミを 1 袋集めたら、模擬店の券 1 枚', 110, '家からゴミを持ってきて、券をもらう人が出た', '「集めたゴミの量」にごほうびをつけたので、ゴミを持ちこむと得になってしまいました。'],
          ['飲みものに容器代 50 円を足し、容器を返すと 50 円もどる', 20, '', '容器を返すと得なので、ほとんどがもどってきました。落ちている容器を拾う人まで出ました（デポジット）。'],
          ['ゴミ箱を減らして「持ち帰ろう」とよびかける', 140, '捨てる場所がなくて、ポイ捨てが増えた', '捨てたい人の動きは変わらないまま、捨てる場所だけがなくなりました。']], a: 1,
      sum: 'ごほうびは「ちゃんとした動き」そのもの（容器を返す）につけると、うまくいきます。' }
  ];
  let i = 0, ok = 0, got = [], lock = false;
  const best = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const meter = v => `<div class="ic-meter"><span>こまりごと</span><b><i data-k="bar" style="--v:${Math.min(150, v)}"></i><em class="ic-now" aria-hidden="true"></em></b><strong data-k="val">${v}</strong></div>`;
  const intro = () => {
    const b = best();
    box.innerHTML = `<div class="ic-intro">
      <div class="ic-sign" aria-hidden="true"><b>ルール</b><i></i><i></i><i></i></div>
      <div><p class="ic-kicker">4 つのこまりごと</p><h3 class="ic-h">ルールで、みんなは動く？</h3>
      <p class="ic-p">放置自転車、図書館の返却おくれ、エアコンの電気代、文化祭のゴミ。町や学校のこまりごとに、3 つのルール案があります。<b>いちばんうまくいく案</b>はどれ？ ごほうびや罰金は、思わぬ動きを生むこともあります。結果は、よく知られた例をもとにしたたとえです。</p>
      <p class="ic-best">${b ? `自己ベスト <b>${b}</b> / 4 問` : 'はじめてのルールづくり'}</p>
      <button type="button" class="ic-go" data-a="start">ルールを考える</button></div></div>`;
  };
  const show = () => {
    const q = P[i]; lock = false;
    box.innerHTML = `<div class="ic-top"><ol class="ic-dots">${P.map((x, j) => `<li class="${j < i ? (got[j] ? 'is-ok' : 'is-ng') : j === i ? 'is-now' : ''}"><span aria-hidden="true">${x.seal}</span></li>`).join('')}</ol><span class="ic-sc">正解 <b>${ok}</b> / ${P.length}</span></div>
      <div class="ic-case"><p class="ic-n">こまりごと ${i + 1}</p><h3 class="ic-t">${q.t}</h3><p class="ic-d">${q.p}</p>${meter(100)}</div>
      <p class="ic-ask">いちばんうまくいくルールは？</p>
      <div class="ic-opts">${q.o.map((o, j) => `<button type="button" class="ic-o" data-o="${j}"><span aria-hidden="true">${'ABC'[j]}</span><p>${o[0]}</p></button>`).join('')}</div>
      <div class="ic-rv" data-k="rv" hidden></div>`;
  };
  const answer = j => {
    if (lock) return; lock = true;
    const q = P[i], o = q.o[j], hit = j === q.a;
    got[i] = hit; if (hit) ok++;
    box.querySelectorAll('.ic-o').forEach((b, k) => { b.disabled = true; b.classList.add(k === j ? 'is-pick' : 'is-dim'); if (k === q.a) b.classList.add('is-ans'); });
    // こまりごとメーターが動く
    const bar = box.querySelector('[data-k="bar"]'), val = box.querySelector('[data-k="val"]');
    requestAnimationFrame(() => { bar.style.setProperty('--v', Math.min(150, o[1])); bar.classList.add(o[1] > 100 ? 'is-up' : o[1] > 60 ? 'is-mid' : 'is-down'); });
    let n = 100; const step = () => { n += Math.sign(o[1] - n) * Math.max(1, Math.round(Math.abs(o[1] - n) / 6)); val.textContent = n; if (n !== o[1]) setTimeout(step, 30); }; step();
    const c = box.querySelector('.ic-case');
    if (o[2]) c.insertAdjacentHTML('beforeend', '<span class="ic-stamp" aria-hidden="true">思わぬ<br>動き</span>');
    const ans = q.o[q.a];
    const rv = box.querySelector('[data-k="rv"]');
    rv.innerHTML = `<p class="ic-res ${hit ? 'is-ok' : 'is-ng'}">${hit ? '正解！ いちばんうまくいきました' : `いちばんうまくいくのは「${'ABC'[q.a]}」`}</p>
      ${o[2] ? `<p class="ic-side"><b>思わぬ動き</b>${o[2]}</p>` : ''}
      <p>${o[3]}</p>${hit ? '' : `<p class="ic-alt"><b>${'ABC'[q.a]} なら</b>${ans[3]}</p>`}
      <p class="ic-sum">${q.sum}</p>
      <button type="button" class="ic-go" data-a="next">${i + 1 < P.length ? '次のこまりごと' : '結果を見る'}</button>`;
    rv.hidden = false;
    box.querySelector('.ic-sc b').textContent = ok;
    box.querySelectorAll('.ic-dots li')[i].className = hit ? 'is-ok' : 'is-ng';
  };
  const TITLE = [[4, 'ルールづくりの名人', '極'], [3, 'たよれる生徒会長', '良'], [2, 'ルールづくりの見習い', '見'], [0, 'これから見えてくる', '初']];
  const finish = () => {
    const prev = best(); if (ok > prev) try { localStorage.setItem(KEY, String(ok)); } catch (e) {}
    const ti = TITLE.findIndex(t => ok >= t[0]);
    box.innerHTML = `<div class="ic-end">
      <span class="ic-seal" aria-hidden="true">${TITLE[ti][2]}</span>
      <p class="ic-big"><b>${ok}</b> / ${P.length} 問</p>
      <p class="ic-title">${TITLE[ti][1]}${ok > prev && prev ? '<em>自己ベスト更新</em>' : prev && ok <= prev ? `<small>自己ベスト ${prev} 問</small>` : ''}</p>
      <div class="ic-sumgrid">
        <div><span aria-hidden="true">誘</span><p><b>インセンティブ</b>ごほうびや罰（インセンティブ）が変わると、人の動きが変わる。ルールをつくるときは「人はどう動くか」を考える。</p></div>
        <div><span aria-hidden="true">逆</span><p><b>思わぬ動き</b>ごほうびをつける場所をまちがえたり、罰金が「ゆるし」になったりすると、こまりごとがかえって増えることがある。</p></div>
        <div><span aria-hidden="true">押</span><p><b>そっと背中を押す</b>お知らせや、置き場所をつくるなど、選びやすくするしかけで動く人も多い。</p></div>
      </div>
      <button type="button" class="ic-go" data-a="start">もう一度、はじめから</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(box.querySelector('.ic-end'), 'incen', ti, TITLE.length);
  };
  box.addEventListener('click', e => {
    const o = e.target.closest('[data-o]'); if (o) { answer(+o.dataset.o); return; }
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'start') { i = 0; ok = 0; got = []; show(); }
    else if (a.dataset.a === 'next') { i++; if (i < P.length) show(); else finish(); }
  });
  intro();
})();
