/* ================================================================
   namevote.js — 投票：お札マンの名前を決めよう（近づいてから読みこむ）
   ・4 つの候補から 1 人 1 票（匿名ログイン）。票の正しさは firestore.rules の mascot/name で守る
   ・候補を押すと、お札マンが「ぼくの名前は○○！」と名札をつけて見せる → 「この名前に 1 票」
   ・結果は全員の画面にリアルタイムで反映。最後は、結果を見て部員が正式な名前を決める
   ・ルールがまだ公開されていないときは「準備中」と出して、名札のお試しだけできる
   ・見た目は namevote.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-namevote]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  const ver = (document.currentScript && document.currentScript.src.split('v=')[1]) || '1';
  if (!document.querySelector('link[href^="namevote.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'namevote.css?v=' + ver; document.head.appendChild(l); }
  const D = window.AZAKEI || {};
  const POLL = 'name', SAVE = 'azakei_namevote';
  // ※ 候補を変えるときは、firestore.rules の mascotOptions() も同じに直すこと
  const C = [
    { key: 'osatsuman', name: 'お札マン', kana: 'おさつまん', why: 'いまの呼び名。ひと目でお札のキャラクターだとわかる。' },
    { key: 'osatsukun', name: 'おさつくん', kana: 'おさつくん', why: '「お札」と、さつまいもの「おさつ」をかけて。やわらかい響き。' },
    { key: 'asafuda', name: 'あさふだ', kana: 'あさふだ', why: '麻布の「麻」と、お札の「札（ふだ）」。麻経らしさを名前に。' },
    { key: 'fudamaru', name: 'ふだまる', kana: 'ふだまる', why: '札（ふだ）に「まる」。まるく、だれとでもなかよく。' }
  ];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  let counts = {}, mine = null, pick = 0, busy = false, api = null, ready = false;
  try { mine = localStorage.getItem(SAVE); } catch (e) {}

  box.innerHTML = `
    <div class="nv-stage">
      <div class="nv-man" aria-hidden="true"><div class="nv-fig"></div><p class="nv-tag"><small>ぼくの名前は</small><b data-k="tag">お札マン</b></p></div>
      <p class="nv-say" data-k="say" aria-live="polite">候補を押すと、名札をつけてみせるよ。</p>
    </div>
    <div class="nv-side">
      <ol class="nv-list" role="group" aria-label="名前の候補">${C.map((c, i) => `
        <li><button type="button" class="nv-c" data-i="${i}" aria-pressed="${!i}">
          <span class="nv-n"><b>${esc(c.name)}</b><small>${esc(c.kana)}</small></span>
          <span class="nv-why">${esc(c.why)}</span>
          <span class="nv-bar"><i></i></span><span class="nv-cnt"><b>–</b> 票</span><span class="nv-mine">あなたの 1 票</span>
        </button></li>`).join('')}
      </ol>
      <button type="button" class="nv-go" data-a="vote" disabled>「お札マン」に 1 票</button>
      <p class="nv-status" data-k="status" role="status" aria-live="polite">投票の準備をしています…</p>
      <p class="nv-total"><b data-k="total">0</b> 票　<small>1 人 1 回。結果を見て、部員が正式な名前を決めます。</small></p>
    </div>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const btns = [...box.querySelectorAll('.nv-c')], go = box.querySelector('.nv-go');
  const say = t => { K('status').textContent = t; };

  // お札マンの絵（osatsu.js と同じ）。このページで読みこまれていなければ、ここで読む
  const fig = () => { if (window.AZAKEI_OSATSU_SVG) box.querySelector('.nv-fig').innerHTML = AZAKEI_OSATSU_SVG; };
  if (window.AZAKEI_OSATSU_SVG) fig(); else { const s = document.createElement('script'); s.src = 'osatsu.js?v=' + ver; s.onload = fig; document.head.appendChild(s); }

  const paint = () => {
    const total = C.reduce((a, c) => a + (counts[c.key] || 0), 0), top = Math.max(0, ...C.map(c => counts[c.key] || 0));
    K('total').textContent = total.toLocaleString();
    btns.forEach((b, i) => {
      const n = counts[C[i].key] || 0;
      b.querySelector('.nv-cnt b').textContent = ready ? n.toLocaleString() : '–';
      b.querySelector('.nv-bar i').style.width = (total ? n / total * 100 : 0) + '%';
      b.classList.toggle('is-top', ready && total > 0 && n === top);
      b.classList.toggle('is-mine', mine === C[i].key);
    });
    box.classList.toggle('is-voted', !!mine);
    const c = C[pick];
    go.textContent = mine ? `投票ずみ（${(C.find(x => x.key === mine) || {}).name || ''}）` : `「${c.name}」に 1 票`;
    go.disabled = !!mine || !ready || busy;
  };
  const choose = i => {
    pick = i;
    btns.forEach((b, j) => b.setAttribute('aria-pressed', j === i));
    const c = C[i], tag = K('tag');
    tag.textContent = c.name;
    const man = box.querySelector('.nv-man'); man.classList.remove('is-hop'); void man.offsetWidth; man.classList.add('is-hop');
    K('say').textContent = `ぼくの名前は「${c.name}」！ ${c.why}`;
    paint();
  };

  // ── Firestore（vote.js と同じしくみ。アプリは別の名前で起動して、ぶつからないようにする）
  async function start() {
    if (!D.firebase) { say('投票は準備中です。名札のお試しはできます。'); return; }
    try {
      const SDK = 'https://www.gstatic.com/firebasejs/12.19.0/';
      const [appMod, authMod, fs] = await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')]);
      const app = appMod.initializeApp(D.firebase, 'namevote');
      const auth = authMod.getAuth(app);
      await auth.authStateReady();
      if (!auth.currentUser) await authMod.signInAnonymously(auth);
      const uid = auth.currentUser.uid, db = fs.getFirestore(app), ref = fs.doc(db, 'mascot', POLL);
      fs.onSnapshot(ref, snap => { counts = snap.exists() ? snap.data() : {}; ready = true; if (!busy) say(mine ? '投票ありがとう！ 結果は、このままリアルタイムで変わります。' : '候補をえらんで「1 票」を押そう。'); paint(); },
        e => { ready = false; say(e && e.code === 'permission-denied' ? '投票は準備中です（もうすぐはじまります）。名札のお試しはできます。' : '結果の読みこみに失敗しました。再読み込みしてください。'); paint(); });
      try { const v = await fs.getDoc(fs.doc(ref, 'votes', uid)); if (v.exists()) { mine = v.data().choice; try { localStorage.setItem(SAVE, mine); } catch (e) {} paint(); } } catch (e) {}
      api = async key => {
        const snap = await fs.getDoc(ref);
        if (!snap.exists()) { try { await fs.setDoc(ref, Object.fromEntries(C.map(c => [c.key, 0]))); } catch (e) {} }
        const b = fs.writeBatch(db);
        b.set(fs.doc(ref, 'votes', uid), { choice: key, at: fs.serverTimestamp() });
        b.update(ref, { [key]: fs.increment(1) });
        try { await b.commit(); } catch (e) {
          if (e && e.code === 'permission-denied') { const v = await fs.getDoc(fs.doc(ref, 'votes', uid)); if (v.exists()) return v.data().choice; }
          throw e;
        }
        return key;
      };
    } catch (e) { say('投票の準備ができませんでした。通信のよいところで、再読み込みしてください。'); }
  }

  box.addEventListener('click', async e => {
    const c = e.target.closest('.nv-c'); if (c) { choose(+c.dataset.i); return; }
    if (!e.target.closest('[data-a="vote"]') || !api || mine || busy) return;
    busy = true; paint(); say('投票しています…');
    try {
      mine = await api(C[pick].key);
      try { localStorage.setItem(SAVE, mine); } catch (e2) {}
      say('投票ありがとう！ 結果は、このままリアルタイムで変わります。');
      const man = box.querySelector('.nv-man'); man.classList.remove('is-yay'); void man.offsetWidth; man.classList.add('is-yay');
    } catch (err) { say('投票できませんでした。少し時間をおいて、もう一度おためしください。'); }
    busy = false; paint();
  });
  choose(0);
  start();
})();
