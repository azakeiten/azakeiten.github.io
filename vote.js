/* ================================================================
   vote.js — 文化祭投票（票数は Abacus カウンターAPIに保存）
   1 端末 1 票。選択肢は content.js の vote.options で編集。
   ================================================================ */
(function() {
  const V    = (window.AZAKEI || {}).vote;
  const list = document.getElementById('voteList');
  if (!V || !list) return;

  const API     = 'https://abacus.jasoncameron.dev';
  const SAVE    = 'azakei_vote_' + V.namespace;
  const status  = document.getElementById('voteStatus');
  const totalEl = document.getElementById('voteTotal');
  const counts  = {};
  let mine = null;
  let busy = false;

  try { mine = localStorage.getItem(SAVE); } catch (e) {}

  list.innerHTML = V.options.map((o, i) => `
    <button type="button" class="vote-option" data-key="${o.key}">
      <span class="vote-fill"></span>
      <span class="vote-idx">${String(i + 1).padStart(2, '0')}</span>
      <span class="vote-body">
        <span class="vote-label">${o.label}</span>
        <span class="vote-desc">${o.desc}</span>
      </span>
      <span class="vote-count"><b>–</b><small>票</small><em></em></span>
      <span class="vote-mine">あなたの1票</span>
    </button>`).join('');

  const buttons = [...list.querySelectorAll('.vote-option')];

  function animateNum(el, to) {
    const from = parseInt(el.textContent, 10) || 0;
    if (from === to) { el.textContent = to; return; }
    const start = performance.now(), dur = 700;
    (function step(t) {
      const p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  function update() {
    const total = V.options.reduce((s, o) => s + (counts[o.key] || 0), 0);
    const max   = Math.max(0, ...V.options.map(o => counts[o.key] || 0));
    buttons.forEach(b => {
      const n   = counts[b.dataset.key] || 0;
      const pct = total ? Math.round(n / total * 100) : 0;
      b.querySelector('.vote-fill').style.width = pct + '%';
      animateNum(b.querySelector('.vote-count b'), n);
      b.querySelector('.vote-count em').textContent = pct + '%';
      b.classList.toggle('is-mine', b.dataset.key === mine);
      b.classList.toggle('is-top', total > 0 && n === max);
      b.setAttribute('aria-pressed', b.dataset.key === mine ? 'true' : 'false');
    });
    list.classList.toggle('has-voted', !!mine);
    if (totalEl) animateNum(totalEl, total);
  }

  async function fetchCounts() {
    await Promise.all(V.options.map(async o => {
      try {
        const res = await fetch(`${API}/get/${V.namespace}/${o.key}`);
        counts[o.key] = res.ok ? ((await res.json()).value || 0) : 0; // 404 = まだ 0 票
      } catch (e) { /* 通信失敗時は前回の値のまま */ }
    }));
    update();
  }

  function say(msg) { if (status) status.textContent = msg; }

  list.addEventListener('click', async e => {
    const b = e.target.closest('.vote-option');
    if (!b || busy) return;
    if (mine) { say('投票は 1 人 1 回までです。ご協力ありがとうございます！'); return; }

    busy = true;
    b.classList.add('is-busy');
    say('投票中…');
    try {
      const res = await fetch(`${API}/hit/${V.namespace}/${b.dataset.key}`);
      if (!res.ok) throw new Error(res.status);
      counts[b.dataset.key] = (await res.json()).value;
      mine = b.dataset.key;
      try { localStorage.setItem(SAVE, mine); } catch (err) {}
      say('投票しました！「' + b.querySelector('.vote-label').textContent + '」に 1 票。');
      update();
      fetchCounts();
    } catch (err) {
      say('投票に失敗しました。時間をおいてもう一度お試しください。');
    } finally {
      busy = false;
      b.classList.remove('is-busy');
    }
  });

  update();
  fetchCounts();
  if (mine) say('投票済みです。結果はリアルタイムで更新されます。');
  setInterval(() => { if (!document.hidden) fetchCounts(); }, 20000);
})();
