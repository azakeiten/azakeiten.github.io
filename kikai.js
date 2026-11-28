/* ================================================================
   kikai.js — あそび場：えらばなかった道のねだん（機会費用と埋没費用・近づいてから読みこむ）
   ・6 つの場面で、分かれ道のどちらかを選んだあと「本当のコストは？」に答える
   ・答えると、えらばなかった道のとびらが開いて「見えないねだん」の札が出る
   ・機会費用＝えらばなかった中で、いちばんよかったもの。もう払ったお金（埋没費用）は、これからの判断には入れない
   ・金額や時給はすべてたとえ。見た目は kikai.css（このファイルが読みこむ）
   ・自己ベストは azakei_kikai（6 問中の正解数）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-kikai]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="kikai.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'kikai.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const KEY = 'azakei_kikai';
  // { 印, 場面, 道: [[名前, ねだんの説明, 選んだ道か]], 問い, 選択肢, 正解, 説明, 見えないねだん }
  const S = [
    { seal: '映', t: '土曜日の午後 3 時間',
      p: 'バイトのシフトに入れば、時給 1,100 円で 3 時間。でも友だちに映画にさそわれた。チケットは 1,800 円。あなたは映画を選んだ。',
      road: [['映画を見る', 'チケット 1,800 円', 1], ['バイトに入る', '3 時間で 3,300 円もらえた', 0]],
      q: '映画の「本当のコスト」は？', o: ['1,800 円（チケット代だけ）', '3,300 円（バイト代だけ）', '5,100 円（チケット代＋もらえたはずのバイト代）'], a: 2,
      why: '払ったチケット代 1,800 円に、映画の 3 時間でもらえたはずのバイト代 3,300 円を足して 5,100 円。時間にもねだんがあります。', ghost: '3,300 円' },
    { seal: '麺', t: '手もとに 1,000 円',
      p: '1,000 円で、ラーメン（いちばん食べたい）、マンガ 2 冊（次に読みたい）、貯金（その次）のどれか 1 つ。あなたはラーメンを選んだ。',
      road: [['ラーメン', '満足度 ★★★', 1], ['マンガ 2 冊', '満足度 ★★', 0], ['貯金', '満足度 ★', 0]],
      q: 'ラーメンの機会費用は？', o: ['マンガ 2 冊', 'マンガ 2 冊と貯金の両方', '0（払ったのは 1,000 円だけ）'], a: 0,
      why: '機会費用は、えらばなかった中で「いちばんよかったもの」1 つだけ。マンガと貯金は同時にはできないので、足しません。', ghost: 'マンガ 2 冊' },
    { seal: '並', t: '無料のイベントに 2 時間ならぶ',
      p: '入場無料の人気イベント。でも 2 時間ならぶ。その 2 時間は、時給 1,000 円のバイトに入ることもできた。',
      road: [['2 時間ならぶ', '入場料 0 円', 1], ['バイトに入る', '2 時間で 2,000 円もらえた', 0]],
      q: 'ならんだ人の「本当のコスト」は？', o: ['0 円。無料だから', '2,000 円。ならんだ時間でかせげたはずのお金', '1,000 円。半分は楽しかったから'], a: 1,
      why: '入場料は 0 円でも、ならんだ 2 時間でかせげたはずの 2,000 円をあきらめています。「無料」でも、コストが 0 とは限りません。', ghost: '2,000 円' },
    { seal: '席', t: 'つまらない映画、のこり 1 時間',
      p: '1,500 円のチケットで入った映画が、とてもつまらない。チケット代はもどらない。のこり 1 時間、見つづける？ 出て、カフェで本を読む？',
      road: [['見つづける', 'のこり 1 時間 つまらない', 1], ['出て本を読む', '1 時間 楽しめる', 0]],
      q: 'どうするか決めるとき、考えに入れるべきなのは？', o: ['払った 1,500 円がもったいないこと', 'これから 1 時間、どちらが楽しいか', 'チケットの半券を持ち帰れるか'], a: 1,
      why: '1,500 円は、見つづけても出てももどりません（埋没費用）。決めるときは「これから」をくらべます。「もったいない」で見つづけると、1 時間まで失います。', ghost: '楽しい 1 時間' },
    { seal: '祭', t: '文化祭、教室は 1 つだけ',
      p: '使える教室は 1 部屋。たこ焼き屋（もうけ約 3 万円）、お化け屋敷（約 2 万円）、カフェ（約 1.5 万円）。クラスはたこ焼き屋に決めた。',
      road: [['たこ焼き屋', 'もうけ 約 3 万円', 1], ['お化け屋敷', 'もうけ 約 2 万円', 0], ['カフェ', 'もうけ 約 1.5 万円', 0]],
      q: 'たこ焼き屋の機会費用は？', o: ['約 1.5 万円', '約 2 万円', '約 3.5 万円'], a: 1,
      why: 'えらばなかったお化け屋敷とカフェのうち、よいほうの約 2 万円。教室は 1 つなので、2 つを足した 3.5 万円にはなりません。たこ焼き屋は機会費用より 1 万円多くもうかる、よい選択です。', ghost: '約 2 万円' },
    { seal: '学', t: '高校を出たあとの 4 年間',
      p: '4 年間、大学に通う。学費は 4 年で約 400 万円。そのあいだ働いていたら、給料は 4 年で約 800 万円（どちらもたとえ）。食費は、大学に行っても働いても約 200 万円かかる。',
      road: [['大学に通う', '学費 約 400 万円', 1], ['働く', '給料 約 800 万円', 0]],
      q: '大学に通う機会費用に入るのは？', o: ['学費だけ（約 400 万円）', '学費と、働いたらもらえた給料（約 1,200 万円）', '学費と給料と食費（約 1,400 万円）'], a: 1,
      why: '食費は、どちらを選んでもかかるので入れません。学費に、働けばもらえた給料を足して約 1,200 万円。それでも多くの人が進学を選ぶのは、学んだことで、その後の仕事や給料、やりたいことの幅が広がると考えるからです。', ghost: '約 800 万円' }
  ];
  let i = 0, ok = 0, got = [], locked = false;
  const best = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const frame = () => {
    box.innerHTML = `<div class="kk-top"><ol class="kk-dots">${S.map((s, j) => `<li class="${j < i ? (got[j] ? 'is-ok' : 'is-ng') : j === i ? 'is-now' : ''}"><span aria-hidden="true">${s.seal}</span></li>`).join('')}</ol><span class="kk-sc">正解 <b>${ok}</b> / ${S.length}</span></div><div class="kk-stage" data-kk="stage"></div>`;
  };
  const show = () => {
    frame(); locked = false;
    const s = S[i], st = box.querySelector('[data-kk="stage"]');
    st.innerHTML = `<div class="kk-scene">
        <p class="kk-n">場面 ${i + 1}<span aria-hidden="true">${s.seal}</span></p>
        <h3 class="kk-t">${s.t}</h3><p class="kk-p">${s.p}</p>
      </div>
      <div class="kk-roads" style="--n:${s.road.length}">${s.road.map((r, j) => `<div class="kk-road${r[2] ? ' is-pick' : ''}" style="--d:${j}"><span class="kk-door" aria-hidden="true"><i></i></span><b>${r[0]}</b><small>${r[1]}</small><em>${r[2] ? 'えらんだ道' : 'えらばなかった道'}</em></div>`).join('')}</div>
      <p class="kk-q">${s.q}</p>
      <div class="kk-opts">${s.o.map((o, j) => `<button type="button" class="kk-o" data-o="${j}"><span aria-hidden="true">${'あいう'[j]}</span>${o}</button>`).join('')}</div>
      <div class="kk-rv" hidden></div>`;
    st.classList.remove('is-in'); void st.offsetWidth; st.classList.add('is-in');
  };
  const answer = j => {
    if (locked) return; locked = true;
    const s = S[i], hit = j === s.a, st = box.querySelector('[data-kk="stage"]');
    got[i] = hit; if (hit) ok++;
    st.querySelectorAll('.kk-o').forEach((b, k) => { b.disabled = true; if (k === s.a) b.classList.add('is-ans'); else if (k === j) b.classList.add('is-bad'); });
    // えらばなかった道のうち、いちばんよい道のとびらが開く
    const other = [...st.querySelectorAll('.kk-road:not(.is-pick)')];
    other.forEach((r, k) => r.classList.add(k === 0 ? 'is-ghost' : 'is-dim'));
    if (other[0]) other[0].insertAdjacentHTML('beforeend', `<span class="kk-tag" aria-hidden="true"><small>見えないねだん</small>${s.ghost}</span>`);
    const rv = st.querySelector('.kk-rv');
    rv.innerHTML = `<p class="kk-res ${hit ? 'is-ok' : 'is-ng'}">${hit ? '正解' : `答えは「${'あいう'[s.a]}」`}</p><p>${s.why}</p><button type="button" class="kk-next" data-a="next">${i + 1 < S.length ? '次の場面へ' : '結果を見る'}</button>`;
    rv.hidden = false;
    box.querySelector('.kk-sc b').textContent = ok;
    const d = box.querySelectorAll('.kk-dots li')[i]; d.className = hit ? 'is-ok' : 'is-ng';
  };
  const TITLE = [[6, '見えないねだんの名探偵', '極'], [4, 'えらび上手', '良'], [2, '分かれ道の見習い', '見'], [0, 'これから見えてくる', '初']];
  const finish = () => {
    const prev = best(); if (ok > prev) try { localStorage.setItem(KEY, String(ok)); } catch (e) {}
    const ti = TITLE.findIndex(x => ok >= x[0]);
    frame();
    box.querySelector('[data-kk="stage"]').innerHTML = `<div class="kk-end">
      <span class="kk-seal" aria-hidden="true">${TITLE[ti][2]}</span>
      <p class="kk-big"><b>${ok}</b> / ${S.length} 問</p>
      <p class="kk-title">${TITLE[ti][1]}${ok > prev && prev ? '<em>自己ベスト更新</em>' : prev && ok <= prev ? `<small>自己ベスト ${prev} 問</small>` : ''}</p>
      <div class="kk-sum">
        <div><span aria-hidden="true">択</span><p><b>機会費用</b>何かを選ぶと、ほかの道をあきらめている。えらばなかった中で<b>いちばんよかったもの</b>が、選んだものの見えないねだん。時間にもねだんがある。<a href="glossary.html#opportunity-cost">用語辞典へ</a></p></div>
        <div><span aria-hidden="true">埋</span><p><b>埋没費用</b>もう払って、もどらないお金や時間。「もったいない」と思っても、これからの判断には入れない。<a href="glossary.html#sunk-cost">用語辞典へ</a></p></div>
      </div>
      <button type="button" class="kk-next" data-a="again">もう一度はじめから</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(box.querySelector('.kk-end'), 'kikai', ti, TITLE.length);
  };
  box.addEventListener('click', e => {
    const o = e.target.closest('[data-o]'); if (o) { answer(+o.dataset.o); return; }
    if (e.target.closest('[data-a="next"]')) { i++; if (i < S.length) show(); else finish(); return; }
    if (e.target.closest('[data-a="again"]')) { i = 0; ok = 0; got = []; show(); }
  });
  show();
})();
