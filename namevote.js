/* ================================================================
   namevote.js — 投票：お札マンの名前を決めよう（近づいてから読みこむ）
   ・はじめの 4 つの候補に、お客さんが名前の案を足せる（1 人 1 案。ひらがな・カタカナ・漢字で 2〜8 字）
   ・どの案にも 1 人 1 票（匿名ログイン）。票と案の正しさは firestore.rules の mascotNames / mascotVotes で守る
   ・候補を押す・案を打つと、お札マンが名札をつけて見せる。ほかの人の新しい案がとどくと、知らせが出る
   ・不適切な案は、部員が管理ページ（admin.html）で「かくす」（消さずに残る）
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
  const SAVE = 'azakei_namevote2', SHOW = 8;
  // はじめの 4 つ（※ 変えるときは firestore.rules の baseNames() も同じに）
  const BASE = [
    { id: 'osatsuman', name: 'お札マン', why: 'いまの呼び名。ひと目でお札のキャラクターだとわかる。' },
    { id: 'osatsukun', name: 'おさつくん', why: '「お札」と、さつまいもの「おさつ」をかけて。やわらかい響き。' },
    { id: 'asafuda', name: 'あさふだ', why: '麻布の「麻」と、お札の「札（ふだ）」。麻経らしさを名前に。' },
    { id: 'fudamaru', name: 'ふだまる', why: '札（ふだ）に「まる」。まるく、だれとでもなかよく。' }
  ];
  const OK = /^[ぁ-ゖァ-ヺー一-龯々]{2,8}$/;
  // 名前にふさわしくない言葉（ひらがなにそろえてくらべる）。部員の「かくす」とあわせて使う
  const NG = ['しね', 'ころす', 'ころせ', 'うんこ', 'うんち', 'ちんこ', 'ちんちん', 'まんこ', 'きもい', 'きしょ', 'ばか', 'あほ', 'くそ', 'ぶす', 'でぶ', 'ごみ', 'かす', 'くず', 'はげ', 'ちび', 'のろい', 'ころし', 'ざこ', 'いじめ', 'えろ', 'せっくす', 'しっこ', 'おしり', 'ぱんつ', '死', '殺', '糞', '屑', '馬鹿', '阿呆'];
  const hira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  let list = BASE.map(b => ({ ...b, votes: 0, base: true, at: 0 })), mine = null, myIdea = null, pickId = 'osatsuman', busy = false, api = null, ready = false, more = false, seen = null, uid = null;
  try { mine = localStorage.getItem(SAVE); } catch (e) {}

  box.innerHTML = `
    <div class="nv-stage">
      <div class="nv-man" aria-hidden="true"><div class="nv-fig"></div><p class="nv-tag"><small>ぼくの名前は</small><b data-k="tag">お札マン</b></p></div>
      <p class="nv-say" data-k="say" aria-live="polite">候補を押すと、名札をつけてみせるよ。</p>
      <div class="nv-toast" data-k="toast" aria-live="polite" hidden></div>
    </div>
    <div class="nv-side">
      <div class="nv-head"><p><b data-k="total">0</b> 票　<small><span data-k="ideas">4</span> の候補</small></p><p class="nv-live" data-k="live">準備中</p></div>
      <ol class="nv-list" role="group" aria-label="名前の候補"></ol>
      <button type="button" class="nv-more" data-a="more" hidden></button>
      <button type="button" class="nv-go" data-a="vote" disabled>「お札マン」に 1 票</button>
      <p class="nv-status" data-k="status" role="status" aria-live="polite">投票の準備をしています…</p>
      <form class="nv-idea" novalidate>
        <p class="nv-idea-h"><span aria-hidden="true">案</span>あなたも名前を考えて、候補に足そう</p>
        <div class="nv-idea-row"><input name="n" maxlength="8" autocomplete="off" placeholder="例：さつまる" aria-label="名前の案（ひらがな・カタカナ・漢字で 2〜8 字）"><button type="submit">候補に足す</button></div>
        <p class="nv-idea-note" data-k="ideanote">ひらがな・カタカナ・漢字で 2〜8 字。1 人 1 案。打つと、お札マンが名札をつけてみせます。</p>
      </form>
      <p class="nv-rule">足した案は、すぐにみんなの画面に出ます。ふさわしくない案は、部員がかくすことがあります。結果を見て、部員が正式な名前を決めます。</p>
    </div>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const ol = box.querySelector('.nv-list'), go = box.querySelector('.nv-go'), form = box.querySelector('.nv-idea'), inp = form.n;
  const say = t => { K('status').textContent = t; };
  const fig = () => { if (window.AZAKEI_OSATSU_SVG) box.querySelector('.nv-fig').innerHTML = AZAKEI_OSATSU_SVG; };
  if (window.AZAKEI_OSATSU_SVG) fig(); else { const s = document.createElement('script'); s.src = 'osatsu.js?v=' + ver; s.onload = fig; document.head.appendChild(s); }
  const hop = cls => { const m = box.querySelector('.nv-man'); m.classList.remove(cls); void m.offsetWidth; m.classList.add(cls); };
  const tag = (name, line) => { K('tag').textContent = name; K('say').textContent = line; hop('is-hop'); };

  const sorted = () => list.filter(c => !c.hidden).sort((a, b) => b.votes - a.votes || (b.base - a.base) || a.at - b.at);
  const paint = () => {
    const all = sorted(), total = all.reduce((a, c) => a + c.votes, 0), top = Math.max(0, ...all.map(c => c.votes));
    const shown = more ? all : all.slice(0, SHOW);
    if (!shown.find(c => c.id === pickId) && all.find(c => c.id === pickId)) shown.push(all.find(c => c.id === pickId));
    const now = Date.now();
    ol.innerHTML = shown.map(c => `
      <li><button type="button" class="nv-c${c.id === mine ? ' is-mine' : ''}${ready && total && c.votes === top ? ' is-top' : ''}${c.fresh ? ' is-fresh' : ''}" data-id="${esc(c.id)}" aria-pressed="${c.id === pickId}">
        <span class="nv-n"><b>${esc(c.name)}</b>${c.base ? '' : `<small class="nv-who">お客さんの案</small>`}${!c.base && c.at && now - c.at < 864e5 ? '<small class="nv-new">新</small>' : ''}${c.id === uid ? '<small class="nv-you">あなたの案</small>' : ''}</span>
        ${c.why ? `<span class="nv-why">${esc(c.why)}</span>` : ''}
        <span class="nv-bar"><i style="width:${total ? c.votes / total * 100 : 0}%"></i></span><span class="nv-cnt"><b>${ready ? c.votes.toLocaleString() : '–'}</b> 票</span><span class="nv-mine">あなたの 1 票</span>
      </button></li>`).join('');
    const mb = box.querySelector('.nv-more'); mb.hidden = all.length <= SHOW; mb.textContent = more ? '上位だけにする' : `ほかの案も見る（あと ${all.length - SHOW}）`;
    K('total').textContent = total.toLocaleString(); K('ideas').textContent = all.length;
    box.classList.toggle('is-voted', !!mine);
    const p = list.find(c => c.id === pickId) || all[0];
    go.textContent = mine ? `投票ずみ（${esc((list.find(c => c.id === mine) || {}).name || '')}）` : `「${p ? p.name : ''}」に 1 票`;
    go.disabled = !!mine || !ready || busy;
    form.hidden = !!myIdea;
    list.forEach(c => { c.fresh = false; });
  };
  const choose = id => {
    const c = list.find(x => x.id === id); if (!c) return;
    pickId = id;
    tag(c.name, c.base ? `ぼくの名前は「${c.name}」！ ${c.why}` : `ぼくの名前は「${c.name}」！ お客さんが考えてくれた名前だよ。`);
    paint();
  };
  const toast = t => { const el = K('toast'); el.textContent = t; el.hidden = false; el.classList.remove('is-in'); void el.offsetWidth; el.classList.add('is-in'); clearTimeout(el._t); el._t = setTimeout(() => { el.hidden = true; }, 4200); };
  const check = raw => {
    const n = raw.trim();
    if (!n) return '名前を入れてください。';
    if (!OK.test(n)) return 'ひらがな・カタカナ・漢字で 2〜8 字にしてください（英字・数字・記号・空白は使えません）。';
    const h = hira(n);
    if (NG.some(w => h.includes(w))) return 'その名前は、候補に足せません。ちがう名前を考えてみてください。';
    if (list.some(c => hira(c.name) === h)) return 'その名前は、もう候補にあります。投票してみよう！';
    return '';
  };
  // 打っているあいだ、お札マンが名札をつけてみせる
  inp.addEventListener('input', () => {
    const n = inp.value.trim(), err = n ? check(n) : '';
    K('ideanote').textContent = err || (n ? `「${n}」で候補に足せます。` : 'ひらがな・カタカナ・漢字で 2〜8 字。1 人 1 案。');
    K('ideanote').classList.toggle('is-err', !!err);
    if (n && !err) tag(n, `「${n}」かあ……。いい響き！`);
  });

  // ── Firestore（アプリは別の名前で起動して、文化祭投票とぶつからないようにする）
  async function start() {
    if (!D.firebase) { say('投票は準備中です。名札のお試しはできます。'); return; }
    try {
      const SDK = 'https://www.gstatic.com/firebasejs/12.19.0/';
      const [appMod, authMod, fs] = await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')]);
      const app = appMod.initializeApp(D.firebase, 'namevote');
      const auth = authMod.getAuth(app);
      await auth.authStateReady();
      if (!auth.currentUser) await authMod.signInAnonymously(auth);
      uid = auth.currentUser.uid;
      const db = fs.getFirestore(app), col = fs.collection(db, 'mascotNames');
      fs.onSnapshot(col, snap => {
        const got = snap.docs.map(d => { const x = d.data(); const b = BASE.find(y => y.id === d.id); return { id: d.id, name: x.name, votes: x.votes || 0, base: !!x.base, hidden: !!x.hidden, at: x.at && x.at.toMillis ? x.at.toMillis() : Date.now(), why: b ? b.why : '' }; });
        // まだ作られていない、はじめの候補は 0 票として出す（だれかが最初に開いたときに作る）
        BASE.forEach(b => { if (!got.find(g => g.id === b.id)) got.push({ ...b, votes: 0, base: true, at: 0 }); });
        if (seen) got.forEach(g => { if (!seen.has(g.id) && !g.hidden && !g.base && g.id !== uid) { g.fresh = true; toast(`新しい案「${g.name}」がとどきました`); } });
        seen = new Set(got.map(g => g.id));
        list = got; myIdea = got.find(g => g.id === uid) || null;
        ready = true; K('live').textContent = 'リアルタイム';
        box.classList.add('is-live');
        if (!busy) say(mine ? '投票ありがとう！ 結果は、このままリアルタイムで変わります。' : '候補をえらんで「1 票」を押そう。');
        if (myIdea) K('ideanote').textContent = `あなたの案「${myIdea.name}」は、候補に入っています。`;
        paint();
      }, e => {
        ready = false; K('live').textContent = '準備中';
        say(e && e.code === 'permission-denied' ? '投票は準備中です（もうすぐはじまります）。名札のお試しはできます。' : '結果の読みこみに失敗しました。再読み込みしてください。');
        paint();
      });
      // はじめの 4 つがなければ作る（ほかの人が先に作っていたら、何もしない）
      BASE.forEach(async b => { try { const s = await fs.getDoc(fs.doc(col, b.id)); if (!s.exists()) await fs.setDoc(fs.doc(col, b.id), { name: b.name, votes: 0, at: fs.serverTimestamp(), base: true, hidden: false }); } catch (e) {} });
      try { const v = await fs.getDoc(fs.doc(db, 'mascotVotes', uid)); if (v.exists()) { mine = v.data().choice; try { localStorage.setItem(SAVE, mine); } catch (e) {} paint(); } } catch (e) {}
      api = {
        async vote(id) {
          const b = fs.writeBatch(db);
          b.set(fs.doc(db, 'mascotVotes', uid), { choice: id, at: fs.serverTimestamp() });
          b.update(fs.doc(col, id), { votes: fs.increment(1) });
          try { await b.commit(); } catch (e) {
            if (e && e.code === 'permission-denied') { const v = await fs.getDoc(fs.doc(db, 'mascotVotes', uid)); if (v.exists()) return v.data().choice; }
            throw e;
          }
          return id;
        },
        async idea(name) { await fs.setDoc(fs.doc(col, uid), { name, votes: 0, at: fs.serverTimestamp(), base: false, hidden: false }); }
      };
    } catch (e) { say('投票の準備ができませんでした。通信のよいところで、再読み込みしてください。'); }
  }

  box.addEventListener('click', async e => {
    const c = e.target.closest('.nv-c'); if (c) { choose(c.dataset.id); return; }
    if (e.target.closest('[data-a="more"]')) { more = !more; paint(); return; }
    if (!e.target.closest('[data-a="vote"]') || !api || mine || busy) return;
    busy = true; paint(); say('投票しています…');
    try {
      mine = await api.vote(pickId);
      try { localStorage.setItem(SAVE, mine); } catch (e2) {}
      say('投票ありがとう！ 結果は、このままリアルタイムで変わります。');
      hop('is-yay');
    } catch (err) { say('投票できませんでした。少し時間をおいて、もう一度おためしください。'); }
    busy = false; paint();
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const n = inp.value.trim(), err = check(n);
    if (err) { K('ideanote').textContent = err; K('ideanote').classList.add('is-err'); return; }
    if (!api) { K('ideanote').textContent = '投票の準備ができてから足せます（いまは名札のお試しだけ）。'; return; }
    if (busy) return;
    busy = true; form.classList.add('is-busy');
    try {
      await api.idea(n);
      pickId = uid; inp.value = '';
      tag(n, `「${n}」が候補に入ったよ！ 気に入ったら、1 票入れてね。`); hop('is-yay');
      K('ideanote').textContent = `あなたの案「${n}」を候補に足しました。`;
    } catch (er) { K('ideanote').textContent = er && er.code === 'permission-denied' ? '足せませんでした。1 人 1 案までです（または、使えない文字がふくまれています）。' : '足せませんでした。少し時間をおいて、もう一度おためしください。'; K('ideanote').classList.add('is-err'); }
    busy = false; form.classList.remove('is-busy'); paint();
  });
  choose('osatsuman');
  start();
})();
