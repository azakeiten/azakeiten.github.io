/* ================================================================
   quiz.js — 億万長者クイズ（文化祭のクイズを Web で）
   ルールは文化祭の黒板と同じ：
     チップ 5 枚からスタート → 賭ける枚数と難しさを選ぶ → 2 問に挑戦
     正解数 × 難しさで、賭けたチップに倍率がかかる
       2 問正解：かんたん ×2 / 普通 ×3 / 激ムズ ×6
       1 問正解：かんたん ×1 / 普通 ×2 / 激ムズ ×3
       0 問正解：×0
   5 ラウンドで終了（チップが 0 になっても終了）
   ================================================================ */
(function() {
  const root = document.getElementById('quiz');
  if (!root) return;

  const START_CHIPS = 5, ROUNDS = 5;
  const LEVELS = {
    easy:   { name: 'かんたん', rate: [0, 1, 2] },
    normal: { name: '普通',     rate: [0, 2, 3] },
    hard:   { name: '激ムズ',   rate: [0, 3, 6] }
  };
  // 問題：{ q, a: [正解, まちがい, まちがい, まちがい], note }
  const Q = {
    easy: [
      { q: '国内で一定期間に生産されたモノやサービスの付加価値の合計を、アルファベット 3 文字で何という？', a: ['GDP', 'CPI', 'IMF', 'ROE'], note: 'GDP は Gross Domestic Product（国内総生産）の略。文化祭のおためしクイズの問題です。' },
      { q: 'Google・Apple・Meta（旧 Facebook）・Amazon。アメリカの巨大 IT 企業 4 社の頭文字をとった総称は？', a: ['GAFA', 'BRICS', 'FANG', 'OPEC'], note: '文化祭のおためしクイズの問題です。' },
      { q: '日本の中央銀行はどれ？', a: ['日本銀行', 'ゆうちょ銀行', '日本政策金融公庫', '三菱UFJ銀行'], note: 'お札（日本銀行券）を発行し、金融政策を行うのが日本銀行です。' },
      { q: 'モノやサービスの値段（物価）が、全体として上がり続けることを何という？', a: ['インフレーション', 'デフレーション', 'リセッション', 'イノベーション'], note: '反対に、物価が下がり続けることはデフレーションといいます。' },
      { q: '1 ドル 150 円が 1 ドル 120 円になった。これは「円高」「円安」どっち？', a: ['円高', '円安', 'どちらでもない', '為替は変わっていない'], note: '少ない円で 1 ドルが買えるようになった＝円の価値が上がった、なので円高です。' },
      { q: '会社にお金を出して、その会社の株を持っている人を何という？', a: ['株主', '債権者', '経営者', '監査役'], note: '株主は、会社の利益の一部を配当として受け取れることがあります。' }
    ],
    normal: [
      { q: '1971 年、アメリカのニクソン大統領が突然発表した「ドルと金の交換停止」による世界的な経済混乱を何という？', a: ['ニクソン・ショック', 'オイル・ショック', 'リーマン・ショック', 'ブラックマンデー'], note: '文化祭のおためしクイズの問題です。これをきっかけに、世界は変動相場制へ移っていきました。' },
      { q: '日本の消費税の「標準税率」は？', a: ['10％', '8％', '5％', '15％'], note: '2019 年 10 月に 8％ から 10％ に引き上げられました。食料品などには、標準税率とは別に軽減税率があります。' },
      { q: '株価 × 発行済み株式数で計算する、会社の「市場での値段」を何という？', a: ['時価総額', '売上高', '自己資本', '営業利益'], note: '時価総額が大きいほど、市場からの評価が高い会社といえます。' },
      { q: 'ある商品で「欲しい人（需要）」が「売りたい量（供給）」より多いとき、値段はふつうどうなる？', a: ['上がる', '下がる', '変わらない', '必ずゼロになる'], note: '需要と供給のバランスで値段が決まる、市場のいちばん基本のしくみです。' },
      { q: '東京証券取引所に上場する 225 社の株価から計算される、代表的な株価指数は？', a: ['日経平均株価', 'TOPIX', 'ダウ平均', 'S&P500'], note: 'TOPIX も日本の代表的な指数ですが、こちらは東証プライム市場などの幅広い銘柄から計算されます。' },
      { q: '2008 年、アメリカの大手投資銀行の経営破綻をきっかけに広がった世界的な金融危機を何という？', a: ['リーマン・ショック', 'ニクソン・ショック', 'アジア通貨危機', 'ITバブル崩壊'], note: '破綻したのはリーマン・ブラザーズという投資銀行です。' }
    ],
    hard: [
      { q: '著書『国富論』で、市場の「見えざる手」を説いた経済学者は？', a: ['アダム・スミス', 'ケインズ', 'マルクス', 'シュンペーター'], note: '1776 年に『国富論』を出版し、「経済学の父」と呼ばれます。' },
      { q: '1985 年、ドル高を是正するために先進 5 か国（G5）が合意したものは？', a: ['プラザ合意', 'ルーブル合意', 'ブレトン・ウッズ協定', 'パリ協定'], note: 'ニューヨークのプラザホテルで結ばれたことから、この名前があります。' },
      { q: '「悪貨は良貨を駆逐する」という言葉で知られる法則は？', a: ['グレシャムの法則', 'エンゲルの法則', 'ペティ＝クラークの法則', 'パレートの法則'], note: '質の悪いお金が出回ると、質の良いお金はしまい込まれて流通しなくなる、という法則です。' },
      { q: '収入が増えるほど、支出のうち食費の割合が下がる。この法則は？', a: ['エンゲルの法則', 'グレシャムの法則', 'ゴッセンの法則', 'セイの法則'], note: '支出に占める食費の割合を「エンゲル係数」といいます。' },
      { q: '1929 年、ニューヨーク株式市場の大暴落から始まった世界的な不況を何という？', a: ['世界恐慌', 'リーマン・ショック', 'オイル・ショック', 'プラザ合意'], note: 'この不況への対策から、ケインズの経済学が広まりました。' },
      { q: '「創造的破壊」こそが経済を発展させると唱えた経済学者は？', a: ['シュンペーター', 'アダム・スミス', 'リカード', 'フリードマン'], note: '新しい技術や仕組みが古いものを置きかえていく力のことです。' }
    ]
  };

  const BEST_KEY = 'azakei_quiz_best';
  let chips, round, used, cur;
  let best = 0;
  try { best = +localStorage.getItem(BEST_KEY) || 0; } catch (e) {}

  const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]);
  const chipRow = n => `<span class="qz-chips" aria-label="チップ ${n} 枚">${'<i></i>'.repeat(Math.min(n, 30))}${n > 30 ? `<em>+${n - 30}</em>` : ''}</span>`;

  function intro() {
    root.innerHTML = `
      <div class="dg-card qz-intro">
        <p class="dg-kicker">文化祭のクイズを、Web で</p>
        <h2>チップを賭けて、<em>億万長者</em>を目指せ。</h2>
        <p>チップ ${START_CHIPS} 枚からスタート。毎ラウンド、賭ける枚数と難しさを選んで 2 問に挑戦します。全 ${ROUNDS} ラウンド。安全策をとるか、リスクをとるか。</p>
        <table class="fx-table qz-rate">
          <thead><tr><th>正解数</th><th>かんたん</th><th>普通</th><th>激ムズ</th></tr></thead>
          <tbody><tr><th>2 問</th><td>×2</td><td>×3</td><td class="hot">×6</td></tr><tr><th>1 問</th><td>×1</td><td>×2</td><td>×3</td></tr><tr><th>0 問</th><td>×0</td><td>×0</td><td>×0</td></tr></tbody>
        </table>
        <p class="qz-record">文化祭の最高記録は <b>120 枚（24 倍）</b>。${best ? `あなたの最高記録は <b>${best} 枚</b>。` : ''}</p>
        <button type="button" class="btn-primary qz-start">ゲームをはじめる</button>
      </div>`;
    root.querySelector('.qz-start').addEventListener('click', () => {
      chips = START_CHIPS; round = 0; used = { easy: new Set(), normal: new Set(), hard: new Set() };
      bet();
    });
  }

  function bet() {
    round++;
    root.innerHTML = `
      <div class="dg-card qz-bet">
        <div class="qz-status"><span>ラウンド ${round} / ${ROUNDS}</span><span>手持ち <b>${chips}</b> 枚</span></div>
        ${chipRow(chips)}
        <h2>何枚賭ける？</h2>
        <div class="qz-amount">
          <button type="button" class="qz-minus" aria-label="1 枚減らす">−</button>
          <output id="qzBet">${Math.max(1, Math.ceil(chips / 2))}</output>
          <button type="button" class="qz-plus" aria-label="1 枚増やす">＋</button>
          <button type="button" class="qz-all">全部賭ける</button>
        </div>
        <h2>難しさを選ぶ</h2>
        <div class="qz-levels">
          ${Object.entries(LEVELS).map(([k, l]) => `<button type="button" class="qz-level qz-${k}" data-k="${k}"><b>${l.name}</b><small>2 問正解で ×${l.rate[2]}</small></button>`).join('')}
        </div>
      </div>`;
    const out = root.querySelector('#qzBet');
    const set = v => { out.textContent = Math.max(1, Math.min(chips, v)); };
    root.querySelector('.qz-minus').addEventListener('click', () => set(+out.textContent - 1));
    root.querySelector('.qz-plus').addEventListener('click', () => set(+out.textContent + 1));
    root.querySelector('.qz-all').addEventListener('click', () => set(chips));
    root.querySelectorAll('.qz-level').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.k;
      const pool = Q[k].map((q, i) => i).filter(i => !used[k].has(i));
      const pick = shuffle(pool.length >= 2 ? pool : Q[k].map((q, i) => i)).slice(0, 2);
      pick.forEach(i => used[k].add(i));
      cur = { level: k, bet: +out.textContent, qs: pick.map(i => Q[k][i]), idx: 0, correct: 0 };
      ask();
    }));
  }

  function ask() {
    const q = cur.qs[cur.idx];
    const choices = shuffle(q.a.map((t, i) => ({ t, ok: i === 0 })));
    root.innerHTML = `
      <div class="dg-card qz-q">
        <div class="qz-status"><span>ラウンド ${round} · ${LEVELS[cur.level].name}</span><span>賭け <b>${cur.bet}</b> 枚</span></div>
        <p class="dg-kicker">第 ${cur.idx + 1} 問 / 2</p>
        <div class="dg-box"><h2>${q.q}</h2></div>
        <div class="qz-choices">${choices.map((c, i) => `<button type="button" class="qz-choice" data-ok="${c.ok ? 1 : 0}"><span>${'ABCD'[i]}</span>${c.t}</button>`).join('')}</div>
        <div class="qz-feedback" aria-live="polite"></div>
      </div>`;
    const fb = root.querySelector('.qz-feedback');
    root.querySelectorAll('.qz-choice').forEach(b => b.addEventListener('click', () => {
      const ok = b.dataset.ok === '1';
      if (ok) cur.correct++;
      root.querySelectorAll('.qz-choice').forEach(x => { x.disabled = true; if (x.dataset.ok === '1') x.classList.add('is-right'); });
      if (!ok) b.classList.add('is-wrong');
      fb.innerHTML = `<p class="${ok ? 'ok' : 'ng'}">${ok ? '正解！' : '残念……'}</p><p>${q.note}</p><button type="button" class="btn-primary qz-next">${cur.idx === 0 ? '次の問題へ' : '結果を見る'}</button>`;
      fb.querySelector('.qz-next').addEventListener('click', () => { cur.idx++; if (cur.idx < 2) ask(); else settle(); });
      fb.querySelector('.qz-next').focus({ preventScroll: true });
    }));
  }

  function settle() {
    const rate = LEVELS[cur.level].rate[cur.correct];
    const back = cur.bet * rate;
    const before = chips;
    chips = chips - cur.bet + back;
    const diff = chips - before;
    const end = round >= ROUNDS || chips <= 0;
    root.innerHTML = `
      <div class="dg-card qz-settle">
        <p class="dg-kicker">ラウンド ${round} の結果</p>
        <h2>${cur.correct} 問正解 → <em>×${rate}</em></h2>
        <p class="qz-calc">賭けた ${cur.bet} 枚 × ${rate} ＝ ${back} 枚</p>
        <p class="qz-diff ${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}">${diff > 0 ? '+' : ''}${diff} 枚</p>
        <div class="qz-status"><span>手持ち</span><span><b>${chips}</b> 枚</span></div>
        ${chipRow(chips)}
        <button type="button" class="btn-primary qz-go">${end ? '最終結果を見る' : '次のラウンドへ'}</button>
      </div>`;
    root.querySelector('.qz-go').addEventListener('click', () => end ? finish() : bet());
  }

  function finish() {
    const times = Math.round(chips / START_CHIPS * 10) / 10;
    const isBest = chips > best;
    if (isBest) { best = chips; try { localStorage.setItem(BEST_KEY, chips); } catch (e) {} }
    const title = chips >= 120 ? '伝説の億万長者' : chips >= 40 ? '億万長者' : chips > START_CHIPS ? 'やり手の投資家' : chips > 0 ? '堅実な投資家' : '一文なし……';
    const url = 'https://ryoishiyama1-svg.github.io/azakei/quiz.html';
    const text = `AZAKEI の億万長者クイズで、チップ ${START_CHIPS} 枚 → ${chips} 枚（${times} 倍）！ 称号「${title}」 #AZAKEI`;
    root.innerHTML = `
      <div class="dg-card qz-final">
        <p class="dg-kicker">最終結果</p>
        <p class="qz-big">${chips}<small>枚</small></p>
        <p class="qz-times">${START_CHIPS} 枚 → ${chips} 枚（${times} 倍）</p>
        <h2>称号：<em>${title}</em></h2>
        <p>${chips >= 40 ? '文化祭なら、シャーペンをプレゼントしていた成績です！' : '文化祭では、40 枚以上でシャーペンをプレゼントしていました。'}${isBest ? '<br><b>自己ベスト更新！</b>' : ''}</p>
        <p class="qz-record">文化祭の最高記録は 120 枚（24 倍）。</p>
        <div class="share">
          <span class="share-label">結果をシェア</span>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}" target="_blank" rel="noopener">X</a>
          <a href="https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}" target="_blank" rel="noopener">LINE</a>
        </div>
        <div class="dg-actions">
          <button type="button" class="btn-primary qz-retry">もう一度挑戦する</button>
          <a href="festival.html" class="btn-ghost">文化祭の展示を見る →</a>
        </div>
      </div>`;
    root.querySelector('.qz-retry').addEventListener('click', intro);
  }

  intro();
})();
