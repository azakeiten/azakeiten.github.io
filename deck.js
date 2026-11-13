/* ================================================================
   deck.js — 「1 分でわかる麻経」スライド（画面いっぱいの紹介）
   ・[data-deck] を押したとき、または URL が #deck のときに開く（site.js から読みこむ）
   ・自動で進む（1 枚 8 秒）。← → キー・スワイプ・画面の左右を押しても動く。Esc で閉じる
   ・数字は、サイトのほかのページに出ているものだけ
   ================================================================ */
(function() {
  if (window.AZAKEI_DECK) return;
  const S = [
    { k: '表紙', img: 'hero-s.jpg', t: 'AZAKEI<span>麻経</span>', s: '麻布中学校・高等学校の、経済系同好会。<br>2025 年に始まりました。', cls: 'is-cover' },
    { k: '文化祭', img: 'photos/s/star-door.jpg', t: '教室ひとつを、<br>経済の町に。', s: '体験型展示「麻布経済展」。入口でチップを受けとり、6 つのコーナーで遊びながら、お金と経済のしくみにふれます。' },
    { k: '来場者', num: '2,364', u: '人', t: '3 日間で、2,364 人。', s: '2026 年の文化祭。1 日目 492 人、2 日目 1,152 人、3 日目 720 人。', bars: [492, 1152, 720] },
    { k: '会場の記録', img: 'photos/s/board-millionaire.jpg', num: '120', u: '枚', t: '黒板の「本日の億万長者」。', s: '会場のクイズで、チップを 120 枚まで増やした人がいました。上位は黒板に。' },
    { k: '学校の外へ', img: 'photos/s/room-paper.jpg', num: '2', u: '大会', t: 'コンテストにも挑戦。', s: '日経ストックリーグに参加中。高校生ビジネスプラン・グランプリにも応募しました。' },
    { k: 'Web でも', img: 'photos/s/room-diagnosis.jpg', t: '展示は、Web でも続く。', s: '用語辞典 300 語、経済ラボの 16 の実験、クイズやクロスワード。登録なし、無料で。', chips: ['用語辞典 300 語', '経済ラボ 16 の実験', 'クイズ 84 問', '登録なし・無料'] },
    { k: 'いっしょに', t: '協賛・取材・見学の<br>ご相談を、お待ちしています。', s: 'Instagram @azakei_vlog ／ azakeiten.github.io', cls: 'is-end', cta: true }
  ];
  const DUR = 8000;
  let el, i = 0, timer = null, playing = true, startAt = 0, left = DUR, lastFocus = null;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slideHTML = (s, n) => `<section class="dk-s ${s.cls || ''}" data-n="${n}" aria-roledescription="スライド" aria-label="${n + 1} / ${S.length}：${s.k}">
      ${s.img ? `<div class="dk-bg"><img src="${s.img}" alt="" decoding="async"${n > 1 ? ' loading="lazy"' : ''}></div>` : ''}
      <div class="dk-in">
        <p class="dk-k"><span>${['一', '二', '三', '四', '五', '六', '七'][n]}</span>${s.k}</p>
        ${s.num ? `<p class="dk-num"><b>${s.num}</b><small>${s.u}</small></p>` : ''}
        <h2 class="dk-t">${s.t}</h2>
        <p class="dk-sub">${s.s}</p>
        ${s.bars ? `<div class="dk-bars">${s.bars.map((v, j) => `<span style="--h:${Math.round(v / Math.max(...s.bars) * 100)}%"><i>${v.toLocaleString('ja-JP')}</i><em>${j + 1} 日目</em></span>`).join('')}</div>` : ''}
        ${s.chips ? `<ul class="dk-chips">${s.chips.map(c => `<li>${c}</li>`).join('')}</ul>` : ''}
        ${s.cta ? `<div class="dk-cta"><a href="sponsor.html">協賛のご案内</a><a href="contact.html">お問い合わせ</a><a href="https://www.instagram.com/azakei_vlog/" target="_blank" rel="noopener">Instagram</a></div>` : ''}
      </div>
    </section>`;

  const build = () => {
    el = document.createElement('div');
    el.className = 'dk'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', '1 分でわかる麻経（スライド）');
    el.innerHTML = `<div class="dk-stage">${S.map(slideHTML).join('')}</div>
      <div class="dk-bar">${S.map(() => '<span><i></i></span>').join('')}</div>
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
  const open = () => {
    if (!el) build();
    lastFocus = document.activeElement;
    document.documentElement.classList.add('dk-open');
    el.classList.add('is-open');
    i = 0; left = DUR; playing = !reduce; paint(); setPlay(playing);
    document.addEventListener('keydown', onKey);
    el.querySelector('.dk-x').focus({ preventScroll: true });
    if (location.hash !== '#deck') history.replaceState(null, '', '#deck');
  };
  function close() {
    clearTimeout(timer);
    el.classList.remove('is-open');
    document.documentElement.classList.remove('dk-open');
    document.removeEventListener('keydown', onKey);
    if (location.hash === '#deck') history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  window.AZAKEI_DECK = { open, close };
})();
