/* ================================================================
   ranking.js — 億万長者クイズのランキング（Firestore）
   保存先: quizRanking/{匿名ログインの uid}  { name, score, at }
     ・1 つのブラウザにつき 1 件（自己ベスト）。前より高い点のときだけ上書き。
     ・名前は 1〜12 文字。点数は 1〜38880 枚。ルールは firestore.rules で保証。
   使い方: AZAKEI_RANK.top(10) / AZAKEI_RANK.mine() / AZAKEI_RANK.submit(name, score)
   ================================================================ */
(function() {
  const cfg = window.AZAKEI && window.AZAKEI.firebase;
  const SDK = 'https://www.gstatic.com/firebasejs/12.19.0/';
  const MAX = 38880;
  let ready = null;

  function boot() {
    if (!cfg) return Promise.reject(new Error('no-firebase'));
    if (ready) return ready;
    ready = (async () => {
      const [appMod, authMod, fs] = await Promise.all([
        import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')
      ]);
      const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(cfg);
      const auth = authMod.getAuth(app);
      await auth.authStateReady();
      if (!auth.currentUser) await authMod.signInAnonymously(auth);
      return { fs, db: fs.getFirestore(app), uid: auth.currentUser.uid };
    })();
    ready.catch(() => { ready = null; });
    return ready;
  }

  // ランキングに載せたくない言葉（かんたんなチェック）
  const NG = ['死ね', 'しね', '殺', 'ころす', 'ちんこ', 'まんこ', 'うんこ', 'セックス', 'fuck', 'shit', 'sex', 'dick', 'bitch', 'nigg'];
  function cleanName(s) {
    const name = String(s || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim();
    if (!name) return { error: '名前を入れてください。' };
    if ([...name].length > 12) return { error: '名前は 12 文字までです。' };
    const low = name.toLowerCase();
    if (NG.some(w => low.includes(w))) return { error: 'その名前は使えません。' };
    return { name };
  }

  window.AZAKEI_RANK = {
    available: !!cfg,
    cleanName,
    async top(n = 10) {
      const { fs, db } = await boot();
      const snap = await fs.getDocs(fs.query(fs.collection(db, 'quizRanking'), fs.orderBy('score', 'desc'), fs.limit(n)));
      // 同点は、先に登録した人を上に
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.score - a.score || ((a.at && a.at.toMillis()) || 0) - ((b.at && b.at.toMillis()) || 0));
    },
    async mine() {
      const { fs, db, uid } = await boot();
      const s = await fs.getDoc(fs.doc(db, 'quizRanking', uid));
      return s.exists() ? { id: uid, ...s.data() } : null;
    },
    async uid() { return (await boot()).uid; },
    async submit(rawName, score) {
      const c = cleanName(rawName);
      if (c.error) throw new Error(c.error);
      if (!Number.isInteger(score) || score < 1 || score > MAX) throw new Error('この点数は登録できません。');
      const { fs, db, uid } = await boot();
      const ref = fs.doc(db, 'quizRanking', uid);
      const prev = await fs.getDoc(ref);
      if (prev.exists() && prev.data().score >= score) return { kept: true, best: prev.data().score };
      await fs.setDoc(ref, { name: c.name, score, at: fs.serverTimestamp() });
      return { kept: false };
    },
    // 自分より上の人数 + 1 ＝ 順位
    async rankOf(score) {
      const { fs, db } = await boot();
      const agg = await fs.getCountFromServer(fs.query(fs.collection(db, 'quizRanking'), fs.where('score', '>', score)));
      return agg.data().count + 1;
    }
  };
})();

/* トップページなど：[data-rank-leader] に「いまの 1 位」を出す（見えたときだけ読みこむ） */
(function() {
  const el = document.querySelector('[data-rank-leader]');
  if (!el || !window.AZAKEI_RANK || !window.AZAKEI_RANK.available) return;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const load = () => window.AZAKEI_RANK.top(1).then(([r]) => {
    if (!r) return;
    el.innerHTML = `<span class="qz-leader-crown" aria-hidden="true">♛</span>Web 版 1 位：<b>${esc(r.name)}</b> さん　${Number(r.score).toLocaleString('ja-JP')} 枚`;
    el.hidden = false;
  }).catch(() => {});
  if (!('IntersectionObserver' in window)) return load();
  new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { io.disconnect(); load(); } }), { rootMargin: '200px' }).observe(el.closest('a, section') || el);
})();
