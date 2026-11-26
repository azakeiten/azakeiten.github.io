/* ================================================================
   fx.js — 経済ラボ：円高・円安の両替所
   ・レート（1 ドル = 何円）を動かすと、海外のもの・日本のものの値段が変わる
   ・最後に 3 問。全問正解で「為替マスター」（このブラウザの中にだけ記録）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-fx]');
  if (!box) return;
  const KEY = 'azakei_fx_master';
  const BASE = 150;
  // 値段はすべて、しくみを見るための「たとえ」
  const US = [['ハンバーガー', 8, 'アメリカのお店で'], ['ゲームソフト', 60, '海外のネットで'], ['ホテル 1 泊', 200, 'ニューヨーク旅行で']];
  const JP = [['おにぎり', 200, '日本のコンビニで'], ['ラーメン', 1000, '旅行で来た人が'], ['日本の車', 3000000, 'アメリカで売ると']];
  const yen = n => Math.round(n).toLocaleString('ja-JP');
  const usd = n => n >= 1000 ? Math.round(n).toLocaleString('en-US') : (Math.round(n * 100) / 100).toFixed(2);
  box.innerHTML = `
    <div class="fx-board">
      <p class="fx-rate-label">1 ドル ＝</p>
      <p class="fx-rate"><b data-fx-rate>${BASE}</b><small>円</small></p>
      <p class="fx-tag" data-fx-tag></p>
      <input type="range" min="80" max="200" step="1" value="${BASE}" aria-label="1 ドルが何円か" data-fx-range>
      <div class="fx-ends"><span>← 円高<small>1 ドルが安く買える</small></span><span>円安 →<small>1 ドルが高くなる</small></span></div>
    </div>
    <div class="fx-cols">
      <div class="fx-col"><p class="fx-col-h"><span class="fx-flag is-us" aria-hidden="true">$</span>海外のものを、円で買うと</p><ul data-fx-us></ul></div>
      <div class="fx-col"><p class="fx-col-h"><span class="fx-flag is-jp" aria-hidden="true">円</span>日本のものを、ドルで買うと</p><ul data-fx-jp></ul></div>
    </div>
    <p class="fx-note" data-fx-note aria-live="polite"></p>
    <div class="fx-quiz" data-fx-quiz></div>`;
  const range = box.querySelector('[data-fx-range]'), rateEl = box.querySelector('[data-fx-rate]'), tag = box.querySelector('[data-fx-tag]'), note = box.querySelector('[data-fx-note]');
  const usL = box.querySelector('[data-fx-us]'), jpL = box.querySelector('[data-fx-jp]');
  const row = (name, where, val, unit, diff) => `<li><span class="fx-item"><b>${name}</b><small>${where}</small></span><span class="fx-price"><b>${val}</b><small>${unit}</small>${diff ? `<i class="${diff > 0 ? 'up' : 'down'}">${diff > 0 ? '▲ 高く' : '▼ 安く'}</i>` : ''}</span></li>`;
  const draw = () => {
    const r = +range.value, d = r - BASE;
    rateEl.textContent = r;
    tag.textContent = d === 0 ? 'はじめのレート' : d < 0 ? `円高（はじめより ${-d} 円、円の力が強い）` : `円安（はじめより ${d} 円、円の力が弱い）`;
    tag.className = 'fx-tag' + (d < 0 ? ' is-high' : d > 0 ? ' is-low' : '');
    usL.innerHTML = US.map(([n, p, w]) => row(n, `${w} ${p} ドル`, yen(p * r), '円', Math.sign(d))).join('');
    jpL.innerHTML = JP.map(([n, p, w]) => row(n, `${w} ${yen(p)} 円`, usd(p / r), 'ドル', -Math.sign(d))).join('');
    note.innerHTML = d === 0 ? 'つまみを左右に動かしてみよう。' : d < 0
      ? '<b>円高</b>のときは、海外のものが<b>安く</b>買える。そのかわり、日本のものは海外の人から見ると<b>高く</b>なる。'
      : '<b>円安</b>のときは、海外のものが<b>高く</b>なる。そのかわり、日本のものは海外の人から見ると<b>安く</b>なって、売れやすくなる。';
  };
  range.addEventListener('input', draw);
  draw();

  // ---- 3 問チャレンジ ----
  const Q = [
    ['円安のとき、得をしやすいのはどっち？', ['日本に旅行に来る、海外の人', '海外に旅行する、日本の人'], 0, '円安だと、ドルを円に替えたときにたくさんの円になる。だから日本での買い物が、海外の人には安く感じられる。'],
    ['車を海外に売っている日本の会社。うれしいのはどっち？', ['円高', '円安'], 1, '円安だと、同じ車でもドルでの値段が安くなって売れやすい。売れたドルを円に替えると、円も多くなる。'],
    ['海外から小麦を買って、パンを作るお店。うれしいのはどっち？', ['円高', '円安'], 0, '円高だと、海外の小麦を少ない円で買える。材料が安くなるので、パンの値段を上げずにすみやすい。']
  ];
  const qBox = box.querySelector('[data-fx-quiz]');
  let qi = 0, ok = 0;
  const ask = () => {
    if (qi >= Q.length) {
      const all = ok === Q.length;
      if (all) { try { localStorage.setItem(KEY, '1'); } catch (e) {} }
      qBox.innerHTML = `<p class="fx-q-h">結果 <b>${ok}</b> / ${Q.length}</p>${window.AZAKEI_OSATSU ? AZAKEI_OSATSU(all ? '全問正解！「為替マスター」のバッジだよ。ニュースで「円安」と聞いたら、だれが得するか考えてみて。' : 'おしい！ 上のつまみを動かして、もう一度たしかめてみよう。', all ? 'happy' : '') : ''}<button type="button" class="fx-again">もう一度</button>`;
      qBox.querySelector('.fx-again').addEventListener('click', () => { qi = 0; ok = 0; ask(); });
      return;
    }
    const [q, a, right, why] = Q[qi];
    qBox.innerHTML = `<p class="fx-q-h">チャレンジ ${qi + 1} / ${Q.length}</p><p class="fx-q">${q}</p><div class="fx-q-a">${a.map((t, i) => `<button type="button" data-i="${i}">${t}</button>`).join('')}</div><div class="fx-q-fb" aria-live="polite"></div>`;
    const bs = [...qBox.querySelectorAll('.fx-q-a button')];
    bs.forEach(b => b.addEventListener('click', () => {
      if (bs[0].disabled) return;
      const good = +b.dataset.i === right; if (good) ok++;
      bs.forEach((x, i) => { x.disabled = true; if (i === right) x.classList.add('is-right'); });
      if (!good) b.classList.add('is-wrong');
      qBox.querySelector('.fx-q-fb').innerHTML = `<p class="${good ? 'ok' : 'ng'}">${good ? '正解！' : '残念……'}</p><p>${why}</p><button type="button" class="fx-next">${qi + 1 < Q.length ? '次へ' : '結果を見る'}</button>`;
      qBox.querySelector('.fx-next').addEventListener('click', () => { qi++; ask(); });
    }));
  };
  ask();
})();

/* ================================================================
   v349：「為替ニュース速報 40 秒」— レートが動いた！ この人にとって、うれしい？ こまる？
   ・ニュースは「1 ドル＝140 円 → 160 円」のように数字だけ。円安か円高かは、自分で読む
   ・出てくる人（12 人）に、うれしい／こまるを答える。続けて正解すると倍率アップ。まちがえると 3 秒へる
   ・終わったら、まちがえた人と理由、「円安で得する人・困る人」の表
   ・レートと人は、しくみを見るための「たとえ」。自己ベストは azakei_fx_best
   ================================================================ */
(function () {
  const box = document.querySelector('[data-fx]');
  if (!box) return;
  if (!document.querySelector('link[href^="fxgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'fxgame.css?v=20261126f'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_fx_best', TIME = 40;
  const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  /* [一字, だれ, 円安のとき（+1 うれしい / -1 こまる）, 円安のときの理由, 円高のときの理由] */
  const W = [
    ['旅', 'アメリカへ家族旅行に行く人', -1, 'ドルが高くなるので、ホテルや食事の代金を円にすると高くなる。', 'ドルが安くなるので、旅行の代金を円にすると安くなる。'],
    ['観', '日本に来る外国人の観光客', 1, '自分の国のお金を円に換えると、たくさんの円になる。日本での買い物が割安に。', '自分の国のお金を円に換えると少ない円にしかならず、日本での買い物が割高に。'],
    ['車', '車をアメリカに輸出する会社', 1, '同じ 1 台をドルで売っても、円に直すと多くのお金が入る。', '同じ 1 台をドルで売っても、円に直すと入るお金がへる。'],
    ['麦', '輸入した小麦でパンを作るパン屋さん', -1, '小麦はドルで買うので、円で払う仕入れ代が上がる。', '小麦はドルで買うので、円で払う仕入れ代が下がる。'],
    ['遊', '海外のゲームをダウンロードで買う人', -1, 'ドルで値段が決まっているので、円で払う金額が上がる。', 'ドルで決まった値段を円で払うと、金額が下がる。'],
    ['宿', '外国からのお客さんが多い温泉旅館', 1, '外国人観光客がふえやすく、予約がふえる。', '外国人観光客にとって日本が割高になり、お客さんがへりやすい。'],
    ['油', 'トラックで荷物を運ぶ運送会社', -1, 'ガソリンのもとになる原油は輸入。燃料代が上がる。', '原油の輸入代が下がり、燃料代が下がる。'],
    ['株', 'アメリカの会社の株を持っている人', 1, 'ドルの値打ちが上がるので、円に直すと金額がふえる。', 'ドルの値打ちが下がるので、円に直すと金額がへる。'],
    ['葡', '外国のワインを輸入して売るお店', -1, 'ドルで仕入れるので、仕入れ代が上がる。', 'ドルで仕入れるので、仕入れ代が下がる。'],
    ['画', '日本のアニメを海外に売る会社', 1, '海外で受け取ったドルを円に換えると、多くのお金になる。', '海外で受け取ったドルを円に換えると、少ないお金になる。'],
    ['学', '日本から仕送りを受けてアメリカに留学している学生', -1, '同じ円の仕送りをドルに換えると、少ないドルにしかならない。', '同じ円の仕送りをドルに換えると、多いドルになる。'],
    ['部', '海外から部品を買って組み立てる会社', -1, '部品をドルで買うので、作るのにかかるお金が上がる。', '部品をドルで買うので、作るのにかかるお金が下がる。']
  ];
  const g = document.createElement('div');
  g.className = 'fxg';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="fxg-sub"><span aria-hidden="true">験</span>じっくりためす：レートを動かして、値段の変わり方を見る</p>');
  let st = null, tick = 0;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="fxg-intro">
      <div class="fxg-tv" aria-hidden="true"><small>速報</small><b>$1 = <i>¥150</i></b></div>
      <div><p class="fxg-kicker">スピード勝負</p><h3 class="fxg-h">為替ニュース速報 40 秒</h3>
      <p class="fxg-p">「1 ドル＝140 円 → 160 円」。ニュースはレートの数字だけ。これは円安？ 円高？ そのあと出てくる人にとって、<b>うれしい</b>か<b>こまる</b>かを、40 秒で何人答えられるか。続けて正解すると点が上がり、まちがえると 3 秒へります。</p>
      <p class="fxg-best">${b ? `自己ベスト <b>${b}</b> 点` : 'はじめての挑戦'}</p>
      <button type="button" class="fxg-go" data-fxg="start">速報をはじめる</button></div></div>`;
  };
  const news = () => {
    const a = 120 + Math.floor(Math.random() * 9) * 5;   // 120〜160
    let b; do { b = 120 + Math.floor(Math.random() * 9) * 5; } while (Math.abs(b - a) < 10);
    return { a, b, weak: b > a };   // 1 ドルに払う円がふえる＝円の値打ちが下がる＝円安
  };
  const start = () => {
    st = { q: shuffle(W.map((_, i) => i)), at: 0, n: news(), score: 0, streak: 0, ok: 0, miss: [], end: performance.now() + TIME * 1000, lock: false };
    g.innerHTML = `<div class="fxg-play">
      <div class="fxg-top"><span class="fxg-t"><b data-fxg="t">${TIME}</b> 秒</span><span class="fxg-st" data-fxg="st"></span><span class="fxg-sc">得点 <b data-fxg="sc">0</b></span></div>
      <div class="fxg-time" aria-hidden="true"><i data-fxg="bar"></i></div>
      <div class="fxg-news" data-fxg="news"></div>
      <div class="fxg-who" data-fxg="who"></div>
      <div class="fxg-keys"><button type="button" data-ans="1"><b>うれしい</b><small>得をする</small></button><button type="button" data-ans="-1"><b>こまる</b><small>損をする</small></button></div>
      <p class="fxg-fb" data-fxg="fb" aria-live="polite"></p></div>`;
    show();
    clearInterval(tick);
    tick = setInterval(() => {
      const left = Math.max(0, (st.end - performance.now()) / 1000);
      g.querySelector('[data-fxg="t"]').textContent = Math.ceil(left);
      const bar = g.querySelector('[data-fxg="bar"]'); bar.style.transform = `scaleX(${(left / TIME).toFixed(3)})`; bar.classList.toggle('is-low', left < 10);
      if (left <= 0) finish();
    }, 100);
  };
  const show = () => {
    if (st.at >= st.q.length) st.q = st.q.concat(shuffle(W.map((_, i) => i)));
    if (st.at % 3 === 0) st.n = news();   // 3 人ごとに、新しいニュース
    const n = st.n, w = W[st.q[st.at]];
    const nw = g.querySelector('[data-fxg="news"]');
    nw.innerHTML = `<small>為替速報</small><p>1 ドル ＝ <s>${n.a} 円</s> <i aria-hidden="true">→</i> <b>${n.b} 円</b></p>`;
    if (st.at % 3 === 0) { nw.classList.remove('is-in'); void nw.offsetWidth; nw.classList.add('is-in'); }
    const el = g.querySelector('[data-fxg="who"]');
    el.innerHTML = `<span class="fxg-seal" aria-hidden="true">${w[0]}</span><b>${w[1]}</b>`;
    el.classList.remove('is-in', 'is-ok', 'is-ng'); void el.offsetWidth; el.classList.add('is-in');
  };
  const mult = () => 1 + Math.min(st.streak, 8) * 0.25;
  const answer = v => {
    if (!st || st.lock) return;
    const w = W[st.q[st.at]], n = st.n, right = w[2] * (n.weak ? 1 : -1), ok = v === right;
    const kind = n.weak ? '円安' : '円高';
    const why = n.weak ? w[3] : w[4];
    const fb = g.querySelector('[data-fxg="fb"]'), el = g.querySelector('[data-fxg="who"]');
    if (ok) { st.streak++; st.ok++; const p = Math.round(10 * mult()); st.score += p; fb.className = 'fxg-fb is-ok'; fb.textContent = `正解 ＋${p}（${kind}）`; el.classList.add('is-ok'); }
    else { st.streak = 0; st.end -= 3000; st.miss.push([st.q[st.at], n.weak]); fb.className = 'fxg-fb is-ng'; fb.textContent = `これは${kind}。${right > 0 ? 'うれしい' : 'こまる'}。${why}`; el.classList.add('is-ng'); }
    g.querySelector('[data-fxg="sc"]').textContent = st.score;
    g.querySelector('[data-fxg="st"]').textContent = st.streak >= 3 ? `${st.streak} 連続` : '';
    st.lock = true;
    setTimeout(() => { if (!st) return; st.lock = false; st.at++; show(); }, ok ? (reduce ? 0 : 250) : 1600);
  };
  const TITLE = [[380, '為替の名解説者'], [240, 'ニュースが読める人'], [110, '為替の見習い'], [0, 'これから覚えよう']];
  const finish = () => {
    clearInterval(tick);
    const s = st; st = null;
    const prev = getB(), best = s.score > prev;
    if (best) { try { localStorage.setItem(KEY, String(s.score)); localStorage.setItem('azakei_fx_master', '1'); } catch (e) {} }
    const seen = new Set(), miss = s.miss.filter(m => { const k = m[0] + ':' + m[1]; if (seen.has(k)) return false; seen.add(k); return true; });
    g.innerHTML = `<div class="fxg-end">
      <p class="fxg-kicker">放送終了</p>
      <p class="fxg-big"><b>${s.score}</b> 点<small>正解 ${s.ok} 人・まちがい ${s.miss.length} 人</small></p>
      <p class="fxg-title"><span aria-hidden="true">称</span>${TITLE.find(x => s.score >= x[0])[1]}${best ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${prev} 点</small>` : ''}</p>
      ${miss.length ? `<p class="fxg-l">まちがえた人</p><ul class="fxg-miss">${miss.map(([i, weak]) => { const w = W[i], r = w[2] * (weak ? 1 : -1); return `<li><span class="fxg-tag ${r > 0 ? 'is-up' : 'is-dn'}">${weak ? '円安' : '円高'}で${r > 0 ? 'うれしい' : 'こまる'}</span><p><b>${w[1]}</b>${weak ? w[3] : w[4]}</p></li>`; }).join('')}</ul>` : '<p class="fxg-perfect">まちがいなし！ 為替のニュースが、しっかり読めています。</p>'}
      <div class="fxg-rule"><p class="fxg-l">円安のとき</p>
        <div class="fxg-two"><div><b>うれしい人</b><p>${W.filter(w => w[2] > 0).map(w => w[1]).join('、')}</p></div><div><b>こまる人</b><p>${W.filter(w => w[2] < 0).map(w => w[1]).join('、')}</p></div></div>
        <p>1 ドルに払う円がふえる（140 円 → 160 円）のは、円の値打ちが下がったということ。だから「円安」。円高のときは、うれしい人とこまる人が入れかわります。同じニュースでも、立場によって、よい知らせにも悪い知らせにもなります。</p></div>
      <button type="button" class="fxg-go" data-fxg="start">もう一度速報を読む</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(g, 'fx', TITLE.findIndex(x => s.score >= x[0]), TITLE.length);
  };
  g.addEventListener('click', e => {
    const k = e.target.closest('[data-ans]'); if (k) { answer(+k.dataset.ans); return; }
    if (e.target.closest('[data-fxg="start"]')) start();
  });
  intro();
})();
