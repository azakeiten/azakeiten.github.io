/* ================================================================
   quiz.js — 億万長者クイズ（文化祭のクイズを Web で）
   ルールは文化祭の黒板と同じ：
     チップ 5 枚からスタート → 賭ける枚数と難しさを選ぶ → 2 問に挑戦
     正解数 × 難しさで、賭けたチップに倍率がかかる
       2 問正解：かんたん ×2 / 普通 ×3 / 激ムズ ×6
       1 問正解：かんたん ×1 / 普通 ×2 / 激ムズ ×3
       0 問正解：×0
   5 ラウンドで終了（チップが 0 になっても終了）
   Web 版だけのおたすけ：1 ゲームに 1 回ずつ「50:50」と「問題チェンジ」
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
  const Q = window.AZAKEI_QUIZ_Q;   // 問題は quiz-data.js

  const BEST_KEY = 'azakei_quiz_best';
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let chips, round, used, cur, life, history, log;
  let best = 0;
  try { best = +localStorage.getItem(BEST_KEY) || 0; } catch (e) {}

  const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]);
  const chipRow = n => `<span class="qz-chips" aria-label="チップ ${n} 枚">${'<i></i>'.repeat(Math.min(n, 30))}${n > 30 ? `<em>+${n - 30}</em>` : ''}</span>`;
  const dots = () => `<span class="qz-dots" aria-hidden="true">${Array.from({ length: ROUNDS }, (_, i) => `<i class="${i < round - 1 ? 'done' : i === round - 1 ? 'now' : ''}"></i>`).join('')}</span>`;

  // 画面を切りかえたら、カードの頭が見えるようにする（スマホで下に取り残されないように）
  let first = true;
  function show(html) {
    root.innerHTML = html;
    if (first) { first = false; return; }
    const top = root.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * 0.6) root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  // 数字をパラパラと数え上げる
  function countUp(el, from, to) {
    if (reduce || from === to) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 900;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // 紙ふぶき（チップの色）
  function confetti() {
    if (reduce) return;
    const c = document.createElement('canvas');
    c.className = 'qz-confetti'; c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    const dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    const g = c.getContext('2d'); g.scale(dpr, dpr);
    const colors = ['#c8a96e', '#e6cf96', '#3c8a37', '#7d6131', '#f4ead2'];
    const ps = Array.from({ length: 110 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.35,
      vx: (Math.random() - 0.5) * 11, vy: -Math.random() * 12 - 4,
      r: Math.random() * 6 + 4, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3,
      col: colors[(Math.random() * colors.length) | 0], disc: Math.random() < 0.45
    }));
    const t0 = performance.now();
    const tick = now => {
      g.clearRect(0, 0, W, H);
      ps.forEach(p => {
        p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.col;
        if (p.disc) { g.beginPath(); g.ellipse(0, 0, p.r, p.r * 0.45 * Math.abs(Math.cos(p.a * 2)) + 1, 0, 0, Math.PI * 2); g.fill(); }
        else g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        g.restore();
      });
      if (now - t0 < 3200) requestAnimationFrame(tick); else c.remove();
    };
    requestAnimationFrame(tick);
  }

  /* ---- ランキング（ranking.js があるときだけ） ---- */
  const RANK = window.AZAKEI_RANK && window.AZAKEI_RANK.available ? window.AZAKEI_RANK : null;
  const NAME_KEY = 'azakei_quiz_name';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function rankTable(list, myId) {
    if (!list.length) return '<p class="qz-small">まだ誰も載っていません。最初の億万長者になろう。</p>';
    return `<ol class="qz-rank-list">${list.map((r, i) => `
      <li class="${r.id === myId ? 'is-me' : ''}${i < 3 ? ' top' + (i + 1) : ''}">
        <span class="qz-rank-no">${i + 1}</span>
        <span class="qz-rank-name">${esc(r.name)}${r.id === myId ? '<em>あなた</em>' : ''}</span>
        <span class="qz-rank-score">${Number(r.score).toLocaleString('ja-JP')}<small>枚</small></span>
      </li>`).join('')}</ol>`;
  }
  async function loadRank(box, n, myId) {
    if (!box) return;
    try {
      const [list, me] = await Promise.all([RANK.top(n), myId === undefined ? RANK.uid().catch(() => null) : myId]);
      box.querySelector('.qz-small, .qz-rank-list') && box.querySelectorAll('.qz-small, .qz-rank-list').forEach(e => e.remove());
      box.insertAdjacentHTML('beforeend', rankTable(list, me));
    } catch (e) {
      // 読めないとき（通信やルールの準備中）は、枠ごと隠す
      if (box.matches('.qz-intro [data-rank-box]')) { box.remove(); return; }
      box.querySelectorAll('.qz-small, .qz-rank-list').forEach(e => e.remove());
      box.insertAdjacentHTML('beforeend', '<p class="qz-small">ランキングを読み込めませんでした。時間をおいて、もう一度開いてください。</p>');
    }
  }
  function rankForm(score) {
    if (!RANK || score < 1) return '';
    let saved = '';
    try { saved = localStorage.getItem(NAME_KEY) || ''; } catch (e) {}
    return `
      <form class="qz-rank qz-rank-form" data-rank-box novalidate>
        <p class="qz-rank-head">ランキングに名前を載せる</p>
        <p class="qz-small">ニックネームで OK（12 文字まで）。本名や、人が嫌な気持ちになる名前はやめてね。</p>
        <div class="qz-rank-input">
          <label class="sr-only" for="qzName">名前</label>
          <input id="qzName" name="name" type="text" maxlength="12" autocomplete="nickname" placeholder="例：麻布の投資家" value="${esc(saved)}" required>
          <button type="submit" class="btn-primary">${score.toLocaleString('ja-JP')} 枚で登録</button>
        </div>
        <p class="qz-rank-msg" aria-live="polite"></p>
      </form>`;
  }
  function bindRankForm(score) {
    const form = root.querySelector('.qz-rank-form');
    if (!form) return;
    const msg = form.querySelector('.qz-rank-msg');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button');
      const c = RANK.cleanName(form.name.value);
      if (c.error) { msg.textContent = c.error; form.name.focus(); return; }
      btn.disabled = true; msg.textContent = '登録しています…';
      try {
        const res = await RANK.submit(c.name, score);
        try { localStorage.setItem(NAME_KEY, c.name); } catch (err) {}
        const myId = await RANK.uid();
        const shown = res.kept ? res.best : score;
        const place = await RANK.rankOf(shown).catch(() => null);
        form.outerHTML = `
          <div class="qz-rank" data-rank-box>
            <p class="qz-rank-head">Web 版ランキング <small>上位 10 人</small></p>
            <p class="qz-rank-done">${res.kept
              ? `自己ベストの <b>${shown.toLocaleString('ja-JP')} 枚</b> のほうが高いので、ランキングはそのままです。`
              : `<b>${esc(c.name)}</b> さん、登録しました！`}${place ? ` いま <b>${place} 位</b> です。` : ''}</p>
          </div>`;
        loadRank(root.querySelector('[data-rank-box]'), 10, myId);
      } catch (err) {
        btn.disabled = false;
        msg.textContent = /この点数|名前|使えません/.test(err.message) ? err.message : '登録できませんでした。通信状況を確かめて、もう一度押してください。';
      }
    });
  }

  // チップの推移グラフ
  function chart() {
    const w = 320, h = 130, pad = 18, max = Math.max(...history, 10);
    const x = i => pad + i * (w - pad * 2) / ROUNDS;
    const y = v => h - pad - (v / max) * (h - pad * 2.4);
    const pts = history.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    return `<figure class="qz-chart">
        <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="チップの推移：${history.join(' → ')} 枚">
          <line x1="${pad}" x2="${w - pad}" y1="${y(START_CHIPS)}" y2="${y(START_CHIPS)}" class="qz-chart-base" />
          <polyline points="${pts}" class="qz-chart-line" />
          ${history.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" /><text x="${x(i)}" y="${y(v) - 9}">${v}</text>`).join('')}
        </svg>
        <figcaption>チップの推移（点線はスタートの ${START_CHIPS} 枚）</figcaption>
      </figure>`;
  }

  function intro() {
    show(`
      <div class="dg-card qz-intro">
        <p class="dg-kicker">文化祭のクイズを、Web で</p>
        <h2>チップを賭けて、<em>億万長者</em>を目指せ。</h2>
        <p>チップ ${START_CHIPS} 枚からスタート。毎ラウンド、賭ける枚数と難しさを選んで 2 問に挑戦します。全 ${ROUNDS} ラウンド。安全策をとるか、リスクをとるか。</p>
        <table class="fx-table qz-rate">
          <thead><tr><th>正解数</th><th>かんたん</th><th>普通</th><th>激ムズ</th></tr></thead>
          <tbody><tr><th>2 問</th><td>×2</td><td>×3</td><td class="hot">×6</td></tr><tr><th>1 問</th><td>×1</td><td>×2</td><td>×3</td></tr><tr><th>0 問</th><td>×0</td><td>×0</td><td>×0</td></tr></tbody>
        </table>
        <ul class="qz-life-intro">
          <li><b>50:50</b>まちがいの選択肢を 2 つ消す</li>
          <li><b>問題チェンジ</b>別の問題に取りかえる</li>
        </ul>
        <p class="qz-small">おたすけは Web 版だけのルール。どちらも 1 ゲームに 1 回だけ使えます。問題は全 ${Q.easy.length + Q.normal.length + Q.hard.length} 問から毎回ランダムに出題。</p>
        <p class="qz-record">文化祭の最高記録は <b>120 枚（24 倍）</b>。${best ? `あなたの最高記録は <b>${best} 枚</b>。` : ''}</p>
        <button type="button" class="btn-primary qz-start">ゲームをはじめる</button>
        ${RANK ? '<div class="qz-rank" data-rank-box><p class="qz-rank-head">Web 版ランキング <small>上位 5 人</small></p><p class="qz-small">読み込み中…</p></div>' : ''}
      </div>`);
    if (RANK) loadRank(root.querySelector('[data-rank-box]'), 5);
    root.querySelector('.qz-start').addEventListener('click', () => {
      chips = START_CHIPS; round = 0; used = { easy: new Set(), normal: new Set(), hard: new Set() };
      life = { half: true, swap: true }; history = [START_CHIPS]; log = [];
      bet();
    });
  }

  function bet() {
    round++;
    show(`
      <div class="dg-card qz-bet">
        <div class="qz-status"><span>ラウンド ${round} / ${ROUNDS} ${dots()}</span><span>手持ち <b>${chips}</b> 枚</span></div>
        ${chipRow(chips)}
        <h2>何枚賭ける？</h2>
        <div class="qz-amount">
          <button type="button" class="qz-minus" aria-label="1 枚減らす">−</button>
          <output id="qzBet" aria-live="polite">${Math.max(1, Math.ceil(chips / 2))}</output>
          <button type="button" class="qz-plus" aria-label="1 枚増やす">＋</button>
          <button type="button" class="qz-all">全部賭ける</button>
        </div>
        <p class="qz-preview"></p>
        <h2>難しさを選ぶ</h2>
        <div class="qz-levels">
          ${Object.entries(LEVELS).map(([k, l]) => `<button type="button" class="qz-level qz-${k}" data-k="${k}"><b>${l.name}</b><small>2 問正解で ×${l.rate[2]}</small><span class="qz-max" data-r="${l.rate[2]}"></span></button>`).join('')}
        </div>
      </div>`);
    const out = root.querySelector('#qzBet');
    const preview = () => {
      const b = +out.textContent;
      root.querySelectorAll('.qz-max').forEach(s => { s.textContent = `最大 ${chips - b + b * +s.dataset.r} 枚`; });
      root.querySelector('.qz-preview').textContent = b === chips ? '全額勝負！ 0 問正解だと、ここでゲームオーバー。' : `残しておくチップ：${chips - b} 枚`;
    };
    const set = v => { out.textContent = Math.max(1, Math.min(chips, v)); preview(); };
    root.querySelector('.qz-minus').addEventListener('click', () => set(+out.textContent - 1));
    root.querySelector('.qz-plus').addEventListener('click', () => set(+out.textContent + 1));
    root.querySelector('.qz-all').addEventListener('click', () => set(chips));
    preview();
    root.querySelectorAll('.qz-level').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.k;
      cur = { level: k, bet: +out.textContent, qs: [draw(k), draw(k)], idx: 0, correct: 0 };
      ask();
    }));
  }

  // まだ出ていない問題から 1 問ひく
  function draw(k) {
    let pool = Q[k].map((q, i) => i).filter(i => !used[k].has(i));
    if (!pool.length) { used[k].clear(); pool = Q[k].map((q, i) => i); }
    const i = pool[(Math.random() * pool.length) | 0];
    used[k].add(i);
    return Q[k][i];
  }

  let onKey = null;
  function ask() {
    if (onKey) document.removeEventListener('keydown', onKey);
    const q = cur.qs[cur.idx];
    const choices = shuffle(q.a.map((t, i) => ({ t, ok: i === 0 })));
    show(`
      <div class="dg-card qz-q">
        <div class="qz-status"><span>ラウンド ${round} · ${LEVELS[cur.level].name} ${dots()}</span><span>賭け <b>${cur.bet}</b> 枚</span></div>
        <p class="dg-kicker">第 ${cur.idx + 1} 問 / 2${cur.idx === 1 ? `<span class="qz-sofar">1 問目：${cur.correct ? '正解' : '不正解'}</span>` : ''}</p>
        <div class="dg-box"><h2>${q.q}</h2></div>
        <div class="qz-choices">${choices.map((c, i) => `<button type="button" class="qz-choice" data-ok="${c.ok ? 1 : 0}"><span>${'ABCD'[i]}</span>${c.t}</button>`).join('')}</div>
        <div class="qz-life" role="group" aria-label="おたすけ">
          <button type="button" class="qz-half" ${life.half ? '' : 'disabled'}><b>50:50</b><small>${life.half ? '残り 1 回' : '使用済み'}</small></button>
          <button type="button" class="qz-swap" ${life.swap ? '' : 'disabled'}><b>問題チェンジ</b><small>${life.swap ? '残り 1 回' : '使用済み'}</small></button>
        </div>
        <div class="qz-feedback" aria-live="polite"></div>
      </div>`);
    const card = root.querySelector('.qz-q');
    const fb = root.querySelector('.qz-feedback');
    const btns = [...root.querySelectorAll('.qz-choice')];
    let answered = false;
    const answer = b => {
      if (answered || b.disabled) return;
      answered = true;
      document.removeEventListener('keydown', onKey);
      const ok = b.dataset.ok === '1';
      if (ok) cur.correct++;
      log.push({ q: q.q, right: q.a[0], ok, level: cur.level });
      btns.forEach(x => { x.disabled = true; if (x.dataset.ok === '1') x.classList.add('is-right'); });
      root.querySelectorAll('.qz-life button').forEach(x => { x.disabled = true; });
      if (!ok) { b.classList.add('is-wrong'); card.classList.add('qz-shake'); }
      fb.innerHTML = `<p class="${ok ? 'ok' : 'ng'}">${ok ? "正解！" : "残念……"}</p>${ok ? "" : `<p class="qz-answer">正解は「<b>${q.a[0]}</b>」</p>`}<p>${q.note}</p><button type="button" class="btn-primary qz-next">${cur.idx === 0 ? '次の問題へ' : '結果を見る'}</button>`;
      const next = fb.querySelector('.qz-next');
      next.addEventListener('click', () => { cur.idx++; if (cur.idx < 2) ask(); else settle(); });
      next.focus({ preventScroll: true });
      fb.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    };
    btns.forEach(b => b.addEventListener('click', () => answer(b)));
    // キーボード：1〜4 / A〜D で回答
    onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey || /input|textarea/i.test(e.target.tagName)) return;
      let i = '1234'.indexOf(e.key);
      if (i < 0 && e.key.length === 1) i = 'abcd'.indexOf(e.key.toLowerCase());
      if (i >= 0 && btns[i]) { e.preventDefault(); answer(btns[i]); }
    };
    document.addEventListener('keydown', onKey);
    root.querySelector('.qz-half').addEventListener('click', e => {
      if (!life.half) return;
      life.half = false;
      shuffle(btns.filter(b => b.dataset.ok !== '1')).slice(0, 2).forEach(b => { b.disabled = true; b.classList.add('is-gone'); });
      e.currentTarget.disabled = true; e.currentTarget.querySelector('small').textContent = '使用済み';
    });
    root.querySelector('.qz-swap').addEventListener('click', () => {
      if (!life.swap) return;
      life.swap = false;
      cur.qs[cur.idx] = draw(cur.level);
      ask();
    });
  }

  function settle() {
    const rate = LEVELS[cur.level].rate[cur.correct];
    const back = cur.bet * rate;
    const before = chips;
    chips = chips - cur.bet + back;
    history.push(chips);
    const diff = chips - before;
    const end = round >= ROUNDS || chips <= 0;
    show(`
      <div class="dg-card qz-settle">
        <p class="dg-kicker">ラウンド ${round} の結果</p>
        <h2>${cur.correct} 問正解 → <em>×${rate}</em></h2>
        <p class="qz-calc">賭けた ${cur.bet} 枚 × ${rate} ＝ ${back} 枚</p>
        <p class="qz-diff ${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}">${diff > 0 ? '+' : ''}${diff} 枚</p>
        <div class="qz-status"><span>手持ち</span><span><b class="qz-count">${before}</b> 枚</span></div>
        ${chipRow(chips)}
        ${chips <= 0 ? '<p class="qz-small">チップがなくなりました。ここでゲームオーバー。</p>' : ''}
        <button type="button" class="btn-primary qz-go">${end ? '最終結果を見る' : '次のラウンドへ'}</button>
      </div>`);
    countUp(root.querySelector('.qz-count'), before, chips);
    if (diff > 0) root.querySelectorAll('.qz-chips i').forEach((c, i) => { if (i >= before) { c.classList.add('is-new'); c.style.animationDelay = `${Math.min(i - before, 25) * 30}ms`; } });
    root.querySelector('.qz-go').addEventListener('click', () => end ? finish() : bet());
  }

  function finish() {
    const times = Math.round(chips / START_CHIPS * 10) / 10;
    const isBest = chips > best;
    if (isBest) { best = chips; try { localStorage.setItem(BEST_KEY, chips); } catch (e) {} }
    const title = chips >= 120 ? '伝説の億万長者' : chips >= 40 ? '億万長者' : chips > START_CHIPS ? 'やり手の投資家' : chips > 0 ? '堅実な投資家' : '一文なし……';
    const okCount = log.filter(l => l.ok).length;
    const url = 'https://azakeiten.github.io/quiz.html';
    const text = `AZAKEI の億万長者クイズで、チップ ${START_CHIPS} 枚 → ${chips} 枚（${times} 倍）！ 称号「${title}」 #AZAKEI`;
    show(`
      <div class="dg-card qz-final">
        <p class="dg-kicker">最終結果</p>
        <p class="qz-big"><span class="qz-count">0</span><small>枚</small></p>
        <p class="qz-times">${START_CHIPS} 枚 → ${chips} 枚（${times} 倍）</p>
        <h2>称号：<em>${title}</em></h2>
        <p>${chips >= 40 ? '文化祭なら、シャーペンをプレゼントしていた成績です！' : '文化祭では、40 枚以上でシャーペンをプレゼントしていました。'}${isBest ? '<br><b>自己ベスト更新！</b>' : ''}</p>
        <p class="qz-record">文化祭の最高記録は 120 枚（24 倍）。${chips > 120 ? '<b>記録を超えました！</b>' : `あと ${121 - chips} 枚で記録更新。`}</p>
        ${rankForm(chips)}
        ${chart()}
        <details class="qz-review">
          <summary>出題された問題をふり返る（${log.length} 問中 ${okCount} 問正解）</summary>
          <ol>${log.map(l => `<li class="${l.ok ? 'ok' : 'ng'}"><span>${l.ok ? '○' : '×'}</span><div>${l.q}<small>正解：${l.right}（${LEVELS[l.level].name}）</small></div></li>`).join('')}</ol>
        </details>
        <div class="share">
          <span class="share-label">結果をシェア</span>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}" target="_blank" rel="noopener">X</a>
          <a href="https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}" target="_blank" rel="noopener">LINE</a>
          ${window.AZAKEI_SHARE_IMG ? '<button type="button" class="qz-img">画像で保存</button>' : ''}
        </div>
        <div class="dg-actions">
          <button type="button" class="btn-primary qz-retry">もう一度挑戦する</button>
          <a href="festival.html" class="btn-ghost">文化祭の展示を見る →</a>
        </div>
      </div>`);
    countUp(root.querySelector('.qz-count'), 0, chips);
    bindRankForm(chips);
    const imgBtn = root.querySelector('.qz-img');
    if (imgBtn) imgBtn.addEventListener('click', async () => {
      imgBtn.disabled = true; imgBtn.textContent = '…';
      try {
        const r = await window.AZAKEI_SHARE_IMG({
          kicker: '億万長者クイズの結果', big: chips.toLocaleString('ja-JP'), bigUnit: '枚',
          title: `称号「${title}」`, subtitle: `5 chips → ${chips.toLocaleString('en-US')} chips (×${times})`,
          lines: [`チップ ${START_CHIPS} 枚から ${times} 倍に。文化祭の最高記録は 120 枚。`],
          cta: 'あなたは何枚まで増やせる？', url: 'azakeiten.github.io/quiz.html', filename: 'azakei-quiz-' + chips, text
        });
        imgBtn.textContent = r === 'cancel' ? '画像で保存' : '保存しました！';
      } catch (e) { imgBtn.textContent = '画像を作れませんでした'; }
      setTimeout(() => { imgBtn.textContent = '画像で保存'; imgBtn.disabled = false; }, 2200);
    });
    if (chips >= 40) setTimeout(confetti, 300);
    root.querySelector('.qz-retry').addEventListener('click', intro);
  }

  intro();
})();
