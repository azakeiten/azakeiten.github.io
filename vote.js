/* ================================================================
   vote.js — 文化祭投票
   保存先:
     ・content.js の firebase が設定済み → Firestore（推奨・本番）
         匿名ログインで 1 人 1 票。票の正しさは firestore.rules で保証。
         集計はリアルタイムで全員の画面に反映。
     ・未設定 → Abacus（仮の保存先）
   ================================================================ */
(function() {
  const D    = window.AZAKEI || {};
  const V    = D.vote;
  const list = document.getElementById('voteList');
  if (!V || !list) return;

  const status  = document.getElementById('voteStatus');
  const totalEl = document.getElementById('voteTotal');
  const keys    = V.options.map(o => o.key);
  const SAVE    = 'azakei_vote_' + (D.firebase ? V.pollId : V.namespace);
  let counts = {};
  let mine   = null;
  let busy   = false;
  let backend;

  try { mine = localStorage.getItem(SAVE); } catch (e) {}

  /* ---------------- 保存先：Firestore ---------------- */
  function firebaseBackend(cfg) {
    const SDK = 'https://www.gstatic.com/firebasejs/12.19.0/';
    let fs, db, pollRef, uid;
    return {
      async start(onCounts) {
        const [appMod, authMod, fsMod] = await Promise.all([
          import(SDK + 'firebase-app.js'),
          import(SDK + 'firebase-auth.js'),
          import(SDK + 'firebase-firestore.js')
        ]);
        fs = fsMod;
        const app  = appMod.initializeApp(cfg);
        const auth = authMod.getAuth(app);
        await auth.authStateReady();
        if (!auth.currentUser) await authMod.signInAnonymously(auth);
        uid = auth.currentUser.uid;
        db = fs.getFirestore(app);
        pollRef = fs.doc(db, 'polls', V.pollId);

        fs.onSnapshot(pollRef, snap => onCounts(snap.exists() ? snap.data() : {}),
          () => say('集計の読み込みに失敗しました。再読み込みしてください。'));

        const voteSnap = await fs.getDoc(fs.doc(pollRef, 'votes', uid));
        return voteSnap.exists() ? voteSnap.data().choice : null;
      },
      async vote(key) {
        const snap = await fs.getDoc(pollRef);
        if (!snap.exists()) {
          const zero = Object.fromEntries(keys.map(k => [k, 0]));
          try { await fs.setDoc(pollRef, zero); } catch (e) { /* 他の人が先に作成済み */ }
        }
        const batch = fs.writeBatch(db);
        batch.set(fs.doc(pollRef, 'votes', uid), { choice: key, at: fs.serverTimestamp() });
        batch.update(pollRef, { [key]: fs.increment(1) });
        try {
          await batch.commit();
        } catch (e) {
          if (e && e.code === 'permission-denied') {
            const v = await fs.getDoc(fs.doc(pollRef, 'votes', uid));
            if (v.exists()) return { already: v.data().choice };
          }
          throw e;
        }
        return {};
      }
    };
  }

  /* ---------------- 保存先：Abacus（仮） ---------------- */
  function abacusBackend() {
    const API = 'https://abacus.jasoncameron.dev';
    let onCounts;
    async function refresh() {
      const c = {};
      await Promise.all(keys.map(async k => {
        try {
          const res = await fetch(`${API}/get/${V.namespace}/${k}`);
          c[k] = res.ok ? ((await res.json()).value || 0) : 0;
        } catch (e) { c[k] = counts[k] || 0; }
      }));
      onCounts(c);
    }
    return {
      async start(cb) {
        onCounts = cb;
        await refresh();
        setInterval(() => { if (!document.hidden) refresh(); }, 20000);
        return null;
      },
      async vote(key) {
        const res = await fetch(`${API}/hit/${V.namespace}/${key}`);
        if (!res.ok) throw new Error(res.status);
        counts[key] = (await res.json()).value;
        refresh();
        return {};
      }
    };
  }

  /* ---------------- 画面 ---------------- */
  list.innerHTML = V.options.map((o, i) => `
    <button type="button" class="vote-option" data-key="${o.key}" aria-pressed="false">
      <span class="vote-fill"></span>
      <span class="vote-idx">${String(i + 1).padStart(2, '0')}</span>
      <span class="vote-body">
        <span class="vote-label">${o.label}<span class="vote-rank"></span></span>
        <span class="vote-desc">${o.desc}</span>
      </span>
      <span class="vote-count"><b>–</b><small>票</small><em></em></span>
      <span class="vote-mine">あなたの1票</span>
    </button>`).join('');
  const buttons = [...list.querySelectorAll('.vote-option')];
  list.classList.add('is-loading');

  function say(msg) { if (status) status.textContent = msg; }

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
    const total  = keys.reduce((s, k) => s + (counts[k] || 0), 0);
    const sorted = [...new Set(keys.map(k => counts[k] || 0))].sort((a, b) => b - a);
    buttons.forEach(b => {
      const n    = counts[b.dataset.key] || 0;
      const pct  = total ? Math.round(n / total * 100) : 0;
      const rank = total && n > 0 ? sorted.indexOf(n) + 1 : 0;
      b.querySelector('.vote-fill').style.width = pct + '%';
      animateNum(b.querySelector('.vote-count b'), n);
      b.querySelector('.vote-count em').textContent = pct + '%';
      b.querySelector('.vote-rank').textContent = rank && rank <= 3 ? rank + '位' : '';
      b.dataset.rank = rank && rank <= 3 ? rank : '';
      b.classList.toggle('is-mine', b.dataset.key === mine);
      b.classList.toggle('is-top', rank === 1);
      b.setAttribute('aria-pressed', b.dataset.key === mine ? 'true' : 'false');
    });
    list.classList.toggle('has-voted', !!mine);
    if (totalEl) animateNum(totalEl, total);
  }

  // 投票した瞬間の金色の粒
  function burst(btn) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = btn.getBoundingClientRect();
    for (let i = 0; i < 26; i++) {
      const p = document.createElement('span');
      p.className = 'vote-spark';
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 120;
      p.style.left = (r.left + r.width * (0.2 + Math.random() * 0.6)) + 'px';
      p.style.top  = (r.top + r.height / 2) + 'px';
      p.style.setProperty('--dx', Math.cos(a) * d + 'px');
      p.style.setProperty('--dy', Math.sin(a) * d - 40 + 'px');
      p.style.setProperty('--s', (0.5 + Math.random()) + '');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1100);
    }
  }

  function remember(key) {
    mine = key;
    try { localStorage.setItem(SAVE, key); } catch (e) {}
  }

  list.addEventListener('click', async e => {
    const b = e.target.closest('.vote-option');
    if (!b || busy || !backend) return;
    if (mine) { say('投票は 1 人 1 回までです。ご協力ありがとうございます！'); return; }

    busy = true;
    b.classList.add('is-busy');
    say('投票中…');
    try {
      const res = await backend.vote(b.dataset.key);
      if (res.already) {
        remember(res.already);
        say('この端末からは既に投票済みです。');
      } else {
        remember(b.dataset.key);
        say('投票しました！「' + b.querySelector('.vote-label').firstChild.textContent + '」に 1 票。');
        burst(b);
      }
      update();
    } catch (err) {
      console.error(err);
      say('投票に失敗しました。通信環境を確認して、もう一度お試しください。');
    } finally {
      busy = false;
      b.classList.remove('is-busy');
    }
  });

  backend = D.firebase ? firebaseBackend(D.firebase) : abacusBackend();
  say('集計を読み込み中…');
  backend.start(c => { counts = c; list.classList.remove('is-loading'); update(); })
    .then(serverMine => {
      if (serverMine) remember(serverMine);
      update();
      say(mine ? '投票済みです。結果はリアルタイムで更新されます。' : '');
    })
    .catch(err => {
      console.error(err);
      backend = null;
      list.classList.remove('is-loading');
      say('投票システムに接続できませんでした。時間をおいて再読み込みしてください。');
    });
})();
