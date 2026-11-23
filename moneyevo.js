/* ================================================================
   moneyevo.js — あそび場：「お金の進化」（物々交換から、電子のお金まで・近づいてから読みこむ）
   ・ステージ一：5 つの時代の困りごとに、いちばんよい解決を 3 つからえらぶ。正しいと、お金が次の形へ変身する
     （一回で 100 点、まちがえてからなら 40 点）
   ・ステージ二：6 つのお金を、古い順に 30 秒でタップ（年表ならべ）
   ・年代は、和同開珎 708 年・交子 11 世紀ごろ・「円」1871 年・日本銀行券 1885 年。見た目は moneyevo.css（このファイルが読みこむ）
   ・自己ベストはこのブラウザの中だけ（azakei_shinka_best）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-moneyevo]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="moneyevo.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'moneyevo.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const C = 'currentColor';
  const ART = {
    barter: `<svg viewBox="0 0 200 140"><g fill="none" stroke="${C}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M28 70c14-18 38-18 52 0-14 18-38 18-52 0z"/><path d="M80 70l12-10v20z"/><circle cx="44" cy="66" r="3" fill="${C}"/><path d="M132 52h44v42a6 6 0 0 1-6 6h-32a6 6 0 0 1-6-6z"/><path d="M128 52h52M140 52c0-10 28-10 28 0"/><path d="M90 34q20-14 40 0M130 34l-6-6M130 34l-8 3M110 106q-20 14-40 0M70 106l6 6M70 106l8-3"/></g></svg>`,
    shell: `<svg viewBox="0 0 200 140"><g fill="none" stroke="${C}" stroke-width="4" stroke-linecap="round"><ellipse cx="100" cy="70" rx="44" ry="56"/><path d="M100 22c-10 20-10 76 0 96"/><path d="M92 40h-8M92 54h-10M92 68h-10M92 82h-10M92 96h-8M108 40h8M108 54h10M108 68h10M108 82h10M108 96h8"/></g></svg>`,
    coin: `<svg viewBox="0 0 200 140"><g fill="none" stroke="${C}" stroke-width="4"><circle cx="100" cy="70" r="54"/><circle cx="100" cy="70" r="44" stroke-width="2"/><rect x="86" y="56" width="28" height="28"/></g><g fill="${C}" font-family="Shippori Mincho, serif" font-weight="800" font-size="20" text-anchor="middle"><text x="100" y="44">和</text><text x="100" y="112">同</text><text x="68" y="77">珎</text><text x="132" y="77">開</text></g></svg>`,
    paper: `<svg viewBox="0 0 200 140"><g fill="none" stroke="${C}" stroke-width="4"><rect x="62" y="16" width="76" height="108" rx="4"/><rect x="72" y="26" width="56" height="88" stroke-width="2"/></g><g fill="${C}" font-family="Shippori Mincho, serif" font-weight="800" text-anchor="middle"><text x="100" y="62" font-size="22">交</text><text x="100" y="90" font-size="22">子</text></g><circle cx="118" cy="104" r="7" fill="#b5432f"/></svg>`,
    yen: `<svg viewBox="0 0 200 140"><g fill="none" stroke="${C}" stroke-width="4"><rect x="22" y="34" width="156" height="78" rx="6"/><circle cx="62" cy="73" r="22" stroke-width="2"/></g><g fill="${C}" font-family="Shippori Mincho, serif" font-weight="800" text-anchor="middle"><text x="62" y="82" font-size="26">円</text><text x="132" y="68" font-size="15">日本銀行券</text><text x="132" y="96" font-size="13">見本</text></g></svg>`,
    digital: `<svg viewBox="0 0 200 140"><g fill="none" stroke="${C}" stroke-width="4" stroke-linejoin="round"><rect x="40" y="14" width="56" height="112" rx="10"/><rect x="50" y="34" width="36" height="36" stroke-width="3"/><path d="M58 42h8v8h-8zM70 54h8v8h-8z" fill="${C}" stroke="none"/><rect x="112" y="46" width="68" height="44" rx="6"/><path d="M112 58h68" stroke-width="6"/><path d="M58 102h20"/></g><path d="M118 104q12-10 24 0M124 112q6-5 12 0" fill="none" stroke="#b5432f" stroke-width="4" stroke-linecap="round"/></svg>`
  };
  // [絵, 時代, 名前, 説明, 辞典]
  const S = [
    ['barter', 'ずっとむかし', '物々交換', 'ほしい物どうしを、そのまま取りかえる。でも「魚がほしい人」と「米を出せる人」がちょうど出会うのは、なかなかむずかしいことでした。', [['money-roles', 'お金の 3 つの役割']]],
    ['shell', 'むかし', '貝や布、米がお金に', 'みんなが価値を認める物が、交換のなかだちに。「貨」「財」「買」など、お金に関係する漢字に「貝」が入っているのは、そのなごりといわれます。', [['money-roles', 'お金の 3 つの役割']]],
    ['coin', '708 年', '金属のお金', '持ち運びやすく、長もちする金属のお金へ。日本では、708 年に発行された和同開珎が、古い時代のお金の代表です。', [['wadokaichin', '和同開珎'], ['coin', '硬貨']]],
    ['paper', '11 世紀ごろ', '紙のお金', 'たくさんの金属は重すぎる。中国（宋）の「交子」は、世界で早い時期の紙のお金のひとつといわれます。日本でも江戸時代に、藩が出す「藩札」が使われました。', [['bank-note', '日本銀行券']]],
    ['yen', '1871 年・1885 年', '「円」と日本銀行券', '1871 年に、お金の単位が「円」に決まりました。1885 年には、日本銀行がお札（日本銀行券）を出しはじめ、いまのお札につながっています。', [['bank-note', '日本銀行券'], ['central-bank', '中央銀行']]],
    ['digital', 'いま', '電子のお金', 'カードやスマホで払うとき、お金は紙や金属ではなく、数字の記録として動きます。便利になる一方で、使いすぎや、だまされないための注意も大切に。', [['cashless', 'キャッシュレス決済'], ['e-money', '電子マネー'], ['qr-pay', 'QR コード決済'], ['crypto', '暗号資産']]]
  ];
  // 困りごと [場面, 困りごと, [正しい解決, ほか 2 つ], 正しくないときのひとこと]
  const Q = [
    ['魚をとる人', 'あなたは魚を持っていて、米がほしい。でも米を持っている人は「魚はいらない」と言う。', ['みんながほしがる物（貝や布）を、交換のなかだちにする', 'もっとたくさん魚をとってくる', '米をあきらめて、魚を食べる'], '魚をふやしても、相手がいらなければ交換はできません。'],
    ['市場の人', '貝や米は、こわれたり、くさったり、大きさがそろわなかったりする。', ['こわれにくい金属を、同じ形・同じ重さにそろえる', '貝をもっとたくさん集める', '米をよく干して、長もちさせる'], '数をふやしても、大きさがそろわない・長もちしないことは変わりません。'],
    ['旅をする商人', '遠くの町で大きな買い物をしたい。でも金属のお金が重すぎて運べない。', ['金属は店に預けて、「預かり証」の紙で払う', '馬をたくさんやとって運ぶ', '遠くでの買い物はやめる'], '重さの問題は残ったまま。紙なら軽く運べます（交子も、もとは預かり証から広まったといわれます）。'],
    ['明治の役人', '藩ごとにお札がちがい、単位もばらばら。にせものも心配。', ['国全体で単位を「円」にそろえ、ひとつの銀行がお札を出す', '両替をする店をもっとふやす', '紙のお札はやめて、金属のお金だけにもどす'], 'ばらばらのままでは、くらべにくさとにせものの心配は残ります。'],
    ['いまの会社員', '遠くの家族にすぐ送りたい。現金を数えたり運んだりする手間もかかる。', ['お金を「数字の記録」として、カードやスマホで動かす', '速い便で現金を送る', 'もっと大きなお札を出す'], 'それでも運ぶ手間と時間はかかります。記録なら一瞬で動かせます。']
  ];
  const KANJI = ['一', '二', '三', '四', '五', '六'], BK = 'azakei_shinka_best', TT = 30;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let best = 0; try { best = +localStorage.getItem(BK) || 0; } catch (e) {}
  let G = null;

  const gl = i => S[i][4].map(([id, n]) => `<a href="glossary.html#${id}">${n}</a>`).join('') + (i === 0 ? '<a class="me-try" href="#koukan">交換の島で試す</a>' : '');
  const road = st => `<ol class="me-road" aria-label="お金の進化の道">${S.map((s, i) => `<li class="${i < st ? 'is-done' : i === st ? 'is-now' : ''}"><span>${i <= st ? KANJI[i] : '？'}</span><small>${i <= st ? s[2] : 'まだ'}</small></li>`).join('')}</ol>`;

  const intro = () => {
    box.innerHTML = `<div class="me-intro">${road(-1)}<div class="me-ih"><div class="me-art is-big" aria-hidden="true">${ART.barter}</div><div>
      <p class="me-k">2 つのステージ</p><p class="me-t">困りごとを解決して、お金を進化させよう</p>
      <ol class="me-rules"><li><b>進化</b>　5 つの時代の困りごとに、いちばんよい解決をえらぶ。正しいと、お金が次の形へ変身する。</li><li><b>年表ならべ</b>　6 つのお金を、古い順に ${TT} 秒でタップ。</li></ol>
      ${best ? `<p class="me-best">自己ベスト <b>${best}</b> 点</p>` : ''}<button type="button" class="me-go" data-go="start">はじめる</button></div></div></div>`;
  };
  const start = () => { G = { st: 0, score: 0, miss: 0, first: 0 }; scene(); };
  const scene = () => {
    const i = G.st, q = Q[i];
    G.opts = shuffle(q[2].map((t, k) => [t, k === 0])); G.tries = 0;
    box.innerHTML = `${road(i)}<div class="me-stage"><div class="me-now"><div class="me-art" aria-hidden="true">${ART[S[i][0]]}</div><p class="me-era"><span>${KANJI[i]}</span>${S[i][1]}</p><h3>${S[i][2]}</h3></div>
      <div class="me-q"><p class="me-who">${q[0]}の困りごと</p><p class="me-pb">${q[1]}</p><p class="me-ask">どうすれば解決できる？</p>
      <div class="me-ch">${G.opts.map(([t], k) => `<button type="button" data-k="${k}">${t}</button>`).join('')}</div><p class="me-fb" aria-live="polite"></p></div></div>
      <p class="me-score">点 <b>${G.score}</b></p>`;
  };
  const choose = async k => {
    const [, ok] = G.opts[k], b = box.querySelector(`.me-ch [data-k="${k}"]`), fb = box.querySelector('.me-fb');
    if (G.lock || b.disabled) return;
    G.tries++;
    if (!ok) { b.disabled = true; b.classList.add('is-ng'); G.miss++; fb.className = 'me-fb is-ng'; fb.textContent = Q[G.st][3]; return; }
    G.lock = true; b.classList.add('is-ok'); box.querySelectorAll('.me-ch button').forEach(x => x.disabled = true);
    const pts = G.tries === 1 ? 100 : 40; G.score += pts; if (G.tries === 1) G.first++;
    fb.className = 'me-fb is-ok'; fb.textContent = `解決！ +${pts} 点`;
    await sleep(700);
    // 変身：いまのお金が光って、次のお金へ
    const now = box.querySelector('.me-now'); now.classList.add('is-morph');
    await sleep(600);
    const n = G.st + 1;
    box.innerHTML = `${road(n)}<div class="me-evo"><div class="me-flash" aria-hidden="true"></div><div class="me-art is-big" aria-hidden="true">${ART[S[n][0]]}</div>
      <p class="me-era"><span>${KANJI[n]}</span>${S[n][1]}</p><h3>${S[n][2]}</h3><p class="me-x">${S[n][3]}</p><p class="me-gl">${gl(n)}</p>
      <button type="button" class="me-go" data-go="${n < S.length - 1 ? 'next' : 'order'}">${n < S.length - 1 ? '次の時代へ' : '最後のステージ：年表ならべ'}</button></div>`;
    G.st = n; G.lock = false;
  };

  /* 年表ならべ：6 つを古い順にタップ */
  const order = () => {
    G.ord = shuffle(S.map((_, i) => i)); G.next = 0; G.wrong = 0; G.t0 = performance.now();
    box.innerHTML = `<div class="me-ord"><div class="me-oh"><p class="me-k">最後のステージ</p><p class="me-t">古い順にタップ</p><div class="me-bar"><i></i></div><p class="me-score">点 <b>${G.score}</b></p></div>
      <ol class="me-line">${S.map(() => '<li></li>').join('')}</ol>
      <div class="me-pool">${G.ord.map(i => `<button type="button" data-o="${i}"><span class="me-art" aria-hidden="true">${ART[S[i][0]]}</span><b>${S[i][2]}</b></button>`).join('')}</div><p class="me-fb" aria-live="polite"></p></div>`;
    const bar = box.querySelector('.me-bar i'); bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; void bar.offsetWidth; bar.style.transition = `transform ${TT}s linear`; bar.style.transform = 'scaleX(0)';
    clearTimeout(G.tm); G.tm = setTimeout(() => finish(true), TT * 1000);
  };
  const tapOrder = i => {
    const b = box.querySelector(`.me-pool [data-o="${i}"]`), fb = box.querySelector('.me-fb');
    if (!b || b.disabled) return;
    if (i === G.next) {
      b.disabled = true; b.classList.add('is-in');
      const slot = box.querySelectorAll('.me-line li')[G.next]; slot.innerHTML = `<span>${KANJI[i]}</span><b>${S[i][2]}</b><small>${S[i][1]}</small>`; slot.classList.add('is-on');
      G.next++; fb.className = 'me-fb is-ok'; fb.textContent = `${S[i][1]}：${S[i][2]}`;
      if (G.next === S.length) finish(false);
    } else { G.wrong++; b.classList.remove('is-ng'); void b.offsetWidth; b.classList.add('is-ng'); fb.className = 'me-fb is-ng'; fb.textContent = `まだです。${S[i][2]}は ${S[i][1]}。もっと古いものがあります。`; }
  };
  const finish = timeout => {
    clearTimeout(G.tm);
    const sec = Math.min(TT, (performance.now() - G.t0) / 1000);
    const ordPts = timeout ? G.next * 20 : Math.max(0, 200 + Math.round((TT - sec) * 5) - G.wrong * 30);
    G.score += ordPts;
    const nb = G.score > best; if (nb) { best = G.score; try { localStorage.setItem(BK, best); } catch (e) {} }
    const rk = G.score >= 800 ? ['博', 'お金の歴史博士'] : G.score >= 600 ? ['達', 'お金の歴史通'] : G.score >= 400 ? ['進', '進化の見習い'] : ['始', 'はじめの一歩'];
    box.innerHTML = `${road(S.length - 1)}<div class="me-fin"><span class="me-stamp" aria-hidden="true">${rk[0]}</span><p class="me-k">${rk[1]}</p><p class="me-res"><b>${G.score}</b> 点${nb ? '<em>自己ベスト</em>' : ''}</p>
      <p class="me-sum">困りごと：一回で解決 ${G.first} / 5・年表：${timeout ? `時間切れ（${G.next} / 6）` : `${sec.toFixed(1)} 秒・まちがい ${G.wrong} 回`}</p>
      <div class="me-tl">${S.map((s, i) => `<div><div class="me-art" aria-hidden="true">${ART[s[0]]}</div><p><span>${s[1]}</span><b>${s[2]}</b></p></div>`).join('')}</div>
      <p class="me-x">お金は、そのときの人の「困りごと」を解決するために形を変えてきました。どの形でも大事なのは、みんなが「これで払える」と信じていることです。</p>
      <div class="me-fut"><p class="me-k">おまけ：これからのお金は？</p><p class="me-fq">「電子のお金」の先に、新しいデジタルのお金が 2 つあります。<b>国（中央銀行）が発行する</b>のは、どっち？</p>
      <div class="me-fch"><button type="button" data-fut="0"><span aria-hidden="true">暗</span>ビットコインなどの<b>暗号資産</b></button><button type="button" data-fut="1"><span aria-hidden="true">央</span><b>中央銀行デジタル通貨</b></button></div><div class="me-fa" aria-live="polite"></div></div>
      <button type="button" class="me-go" data-go="start">もう一度</button></div>`;
  };

  box.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) { const v = g.dataset.go; if (v === 'start') start(); else if (v === 'next') scene(); else if (v === 'order') order(); const r = box.getBoundingClientRect(); if (r.top < 0) box.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); return; }
    const fu = e.target.closest('[data-fut]');
    if (fu && !fu.disabled) {
      const ok = fu.dataset.fut === '1';
      box.querySelectorAll('[data-fut]').forEach(b => { b.disabled = true; b.classList.add(b.dataset.fut === '1' ? 'is-ok' : 'is-off'); });
      box.querySelector('.me-fa').innerHTML = `<p><b>${ok ? '正解！' : '答えは「中央銀行デジタル通貨」'}</b>中央銀行デジタル通貨は、円などの国のお金そのものをデジタルにしたもの。日本銀行も実験を進めています。ビットコインは 2009 年に動きはじめた暗号資産で、国や中央銀行は発行していません。世界中のコンピューターが同じ台帳を持ちあって記録し、値段は大きく上下します。</p><a class="me-try" href="sim.html#crypto">経済ラボで、ビットコインの台帳を書きかえてみる</a>`;
      return;
    }
    if (!G) return;
    const c = e.target.closest('.me-ch [data-k]'); if (c) { choose(+c.dataset.k); return; }
    const o = e.target.closest('.me-pool [data-o]'); if (o) tapOrder(+o.dataset.o);
  });
  intro();
})();
