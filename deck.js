/* ================================================================
   deck.js — 「1 分でわかる麻経」スライド（画面いっぱいの紹介）
   ・[data-deck] を押したとき、または URL が #deck のときに開く（site.js から読みこむ）
   ・自動で進む（1 枚 8 秒）。← → キー・スワイプ・画面の左右を押しても動く。Esc で閉じる
   ・数字は、サイトのほかのページに出ているものだけ
   ================================================================ */
(function() {
  if (window.AZAKEI_DECK) return;
  // 麻経のめざすこと：経済に「親しむ」→ 仕組みを「知る」→ 自分たちで仕組みを「つくる」。step は 0・1・2（なしは全体の話）
  const STEPS = [['親', '親しむ'], ['知', '知る'], ['創', 'つくる']];
  const S = [
    { k: '表紙', seal: '麻', img: 'hero-s.jpg', t: 'AZAKEI<span>麻経</span>', s: '世の中の仕組みを理解し、<br>自らで仕組みを創り出す。<small>麻布中学校・高等学校の経済系同好会（2025 年〜）</small>', cls: 'is-cover' },
    { k: '麻経のめざすこと', seal: '志', t: '経済を、<br>勉強から体験へ。', s: '経済は、教科書の中だけのものではありません。まず遊んで親しみ、その仕組みを知り、こんどは自分たちで仕組みをつくる。この 3 つを、ぐるぐる回しています。', cls: 'is-purpose', steps: true },
    { k: '親しむ', step: 0, img: 'photos/s/star-door.jpg', t: '教室ひとつを、<br>経済の町に。', s: '文化祭の体験型展示「麻布経済展」。入口でチップを受けとり、6 つのコーナーで遊びながら、チップが増える・減るを体で感じます。' },
    { k: '親しむ', step: 0, num: '2,364', u: '人', t: '3 日間で、2,364 人が<br>経済で遊んだ。', s: '2026 年の文化祭。1 日目 492 人、2 日目 1,152 人、3 日目 720 人。', bars: [492, 1152, 720] },
    { k: '知る', step: 1, img: 'photos/s/room-diagnosis.jpg', t: '遊んだあとに、<br>仕組みを知る。', s: 'なぜチップが増えたのか、減ったのか。お金は、家計・企業・銀行・政府のあいだを、どうめぐっているのか。Web でも、図や辞典で確かめられます。', chips: ['用語辞典 300 語', 'お金のめぐりの図', '経済ラボ 16 の実験', 'クイズ 84 問'] },
    { k: 'つくる', step: 2, img: 'photos/s/room-paper.jpg', t: '仕組みを、<br>自分たちの手で。', s: '展示のゲームとルール、オリジナルの紙幣、会場の飾り。どれも部員が考えて、つくりました。遊ぶ側から、仕組みをつくる側へ。' },
    { k: 'つくる', step: 2, num: '2', u: '大会', t: '学校の外でも、<br>仕組みを考える。', s: '日経ストックリーグでは、企業を調べてポートフォリオを組んでいます。高校生ビジネスプラン・グランプリには、事業のプランをつくって応募しました。' },
    { k: 'めぐる', seal: '環', t: 'つくった仕組みで、<br>次の人が経済に親しむ。', s: 'つくった展示で、また誰かが経済を身近に感じる。親しむ → 知る → つくる の輪を、麻経は少しずつ大きくしていきます。', cls: 'is-cycle', cycle: true },
    { k: 'いっしょに', seal: '結', t: '一緒に、<br>仕組みをつくりませんか。', s: '協賛・取材・見学のご相談を、お待ちしています。<br>Instagram @azakei_vlog ／ azakeiten.github.io', cls: 'is-end', cta: true }
  ];
  const DUR = 7000;
  let el, i = 0, timer = null, playing = true, startAt = 0, left = DUR, lastFocus = null;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slideHTML = (s, n) => `<section class="dk-s ${s.cls || ''}" data-n="${n}" aria-roledescription="スライド" aria-label="${n + 1} / ${S.length}：${s.k}">
      ${s.img ? `<div class="dk-bg"><img src="${s.img}" alt="" decoding="async"${n > 1 ? ' loading="lazy"' : ''}></div>` : ''}
      <div class="dk-in">
        <p class="dk-k"><span>${s.step !== undefined ? STEPS[s.step][0] : s.seal}</span>${s.step !== undefined ? `${['一', '二', '三'][s.step]}　${s.k}` : s.k}</p>
        ${s.num ? `<p class="dk-num"><b>${s.num}</b><small>${s.u}</small></p>` : ''}
        <h2 class="dk-t">${s.t}</h2>
        <p class="dk-sub">${s.s}</p>
        ${s.bars ? `<div class="dk-bars">${s.bars.map((v, j) => `<span style="--h:${Math.round(v / Math.max(...s.bars) * 100)}%"><i>${v.toLocaleString('ja-JP')}</i><em>${j + 1} 日目</em></span>`).join('')}</div>` : ''}
        ${s.chips ? `<ul class="dk-chips">${s.chips.map(c => `<li>${c}</li>`).join('')}</ul>` : ''}
        ${s.steps ? `<ol class="dk-3">${STEPS.map(([k, t], j) => `<li style="--j:${j}"><span>${k}</span><b>${t}</b><small>${['遊んで、経済を身近に感じる', 'お金の流れと、その仕組みを知る', '自分たちで、仕組みを創り出す'][j]}</small></li>`).join('')}</ol>` : ''}
        ${s.cycle ? `<div class="dk-ring" aria-hidden="true"><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="110" class="dk-ring-c"/><circle cx="150" cy="150" r="110" class="dk-ring-run"/>${STEPS.map(([k], j) => { const a = -Math.PI / 2 + j * 2 * Math.PI / 3; return `<g transform="translate(${150 + Math.cos(a) * 110},${150 + Math.sin(a) * 110})"><rect x="-30" y="-30" width="60" height="60" rx="8" class="dk-ring-s"/><text y="11">${k}</text></g>`; }).join('')}</svg></div>` : ''}
        ${s.cta ? `<div class="dk-cta"><a href="sponsor.html">協賛のご案内</a><a href="contact.html">お問い合わせ</a><a href="https://www.instagram.com/azakei_vlog/" target="_blank" rel="noopener">Instagram</a></div>` : ''}
      </div>
    </section>`;

  const build = () => {
    el = document.createElement('div');
    el.className = 'dk'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', '1 分でわかる麻経（スライド）');
    el.innerHTML = `<div class="dk-stage">${S.map(slideHTML).join('')}</div>
      <div class="dk-bar">${S.map(() => '<span><i></i></span>').join('')}</div>
      <ol class="dk-track" aria-hidden="true">${STEPS.map(([k, t]) => `<li><span>${k}</span>${t}</li>`).join('<li class="dk-arr">→</li>')}</ol>
      <div class="dk-ctl">
        <button type="button" class="dk-prev" aria-label="前のスライド">←</button>
        <button type="button" class="dk-play" aria-label="一時停止">II</button>
        <button type="button" class="dk-next" aria-label="次のスライド">→</button>
        <span class="dk-count" aria-live="polite"></span>
        <button type="button" class="dk-x" aria-label="閉じる">閉じる</button>
      </div>`;
    document.body.appendChild(el);
    el.querySelector('.dk-prev').onclick = () => go(i - 1);
    el.querySelector('.dk-next').onclick = () => go(i + 1);
    el.querySelector('.dk-x').onclick = close;
    el.querySelector('.dk-play').onclick = () => setPlay(!playing);
    // 画面の左 3 分の 1 で戻る、それ以外で進む（ボタンやリンクの上は除く）
    el.querySelector('.dk-stage').addEventListener('click', e => { if (e.target.closest('a, button')) return; (e.clientX < innerWidth / 3) ? go(i - 1) : go(i + 1); });
    let sx = null;
    el.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) { dx < 0 ? go(i + 1) : go(i - 1); } }, { passive: true });
  };
  const bars = () => el.querySelectorAll('.dk-bar i');
  const paint = () => {
    el.querySelectorAll('.dk-s').forEach((s, n) => { s.classList.toggle('is-on', n === i); s.classList.toggle('is-past', n < i); s.setAttribute('aria-hidden', n === i ? 'false' : 'true'); });
    bars().forEach((b, n) => { b.style.transition = 'none'; b.style.transform = `scaleX(${n < i ? 1 : 0})`; });
    el.querySelector('.dk-count').textContent = `${i + 1} / ${S.length}`;
    // 上の「親しむ → 知る → つくる」：いまの段に印。全体の話の場面では 3 つとも、表紙としめくくりでは消す
    const st = S[i].step, tr = el.querySelector('.dk-track');
    tr.classList.toggle('is-hide', !!(S[i].cls && /is-cover|is-end/.test(S[i].cls)));
    tr.querySelectorAll('li:not(.dk-arr)').forEach((li, j) => li.classList.toggle('is-on', st === undefined ? true : j === st));
    el.querySelector('.dk-prev').disabled = i === 0;
  };
  const run = () => {
    clearTimeout(timer);
    if (!playing || i >= S.length - 1) { if (i >= S.length - 1) setPlay(false, true); return; }
    const b = bars()[i]; void b.offsetWidth;
    b.style.transition = `transform ${left}ms linear`; b.style.transform = 'scaleX(1)';
    startAt = Date.now();
    timer = setTimeout(() => go(i + 1), left);
  };
  const go = n => {
    if (n < 0 || n >= S.length) return;
    i = n; left = DUR; paint();
    requestAnimationFrame(run);
  };
  const setPlay = (on, ended) => {
    playing = on;
    const btn = el.querySelector('.dk-play');
    btn.textContent = on ? 'II' : '▶'; btn.setAttribute('aria-label', on ? '一時停止' : (ended ? '最初から' : '再生'));
    const b = bars()[i];
    if (!on) {
      clearTimeout(timer);
      if (!ended) { left = Math.max(400, left - (Date.now() - startAt)); const w = b.getBoundingClientRect().width / b.parentElement.getBoundingClientRect().width; b.style.transition = 'none'; b.style.transform = `scaleX(${w})`; }
    } else if (i >= S.length - 1) { go(0); }
    else run();
  };
  const onKey = e => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') go(i + 1);
    else if (e.key === 'ArrowLeft') go(i - 1);
    else if (e.key === ' ' && !e.target.closest('a, button')) { e.preventDefault(); setPlay(!playing); }
    else if (e.key === 'Tab') { const f = [...el.querySelectorAll('.dk-s.is-on a, .dk-ctl button:not(:disabled)')]; if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  };
  const open = (start = 0) => {
    if (!el) build();
    lastFocus = document.activeElement;
    document.documentElement.classList.add('dk-open');
    el.classList.add('is-open');
    i = Math.max(0, Math.min(S.length - 1, start | 0)); left = DUR; playing = !reduce && i < S.length - 1; paint(); setPlay(playing, !playing && i >= S.length - 1);
    document.addEventListener('keydown', onKey);
    el.querySelector('.dk-x').focus({ preventScroll: true });
    if (!/^#deck(-\d+)?$/.test(location.hash)) history.replaceState(null, '', '#deck');
  };
  function close() {
    clearTimeout(timer);
    el.classList.remove('is-open');
    document.documentElement.classList.remove('dk-open');
    document.removeEventListener('keydown', onKey);
    if (/^#deck(-\d+)?$/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  window.AZAKEI_DECK = { open, close };
})();
