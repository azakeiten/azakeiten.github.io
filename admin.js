/* ================================================================
   admin.js — 部員用 更新ページ
   ・Google アカウントでログイン → 許可された人だけ「日誌」「日程」を追加・修正・削除できる
   ・保存先: Firestore の posts コレクション
       { kind: 'diary' | 'event', title, body, date, end, place, tag, link, author, updatedAt }
   ・書ける人は firestore.rules でも制限（このファイルの一覧は表示用。本当の鍵はルール側）
   ・部員を増やすときは、EDITORS と firestore.rules の両方にメールアドレスを足す
   ================================================================ */
(function() {
  const root = document.getElementById('admin');
  const cfg = window.AZAKEI && window.AZAKEI.firebase;
  if (!root) return;
  if (!cfg) { root.innerHTML = '<p class="adm-msg">Firebase の設定がありません。</p>'; return; }

  const EDITORS = ['azakeiten@gmail.com'];
  // 日程に付けられる写真（サイトにある写真だけ）
  const PHOTOS = ((window.AZAKEI && window.AZAKEI.gallery) || []).filter(g => /^photos\/[a-z0-9-]+\.jpg$/.test(g.src || ''));
  const SDK = 'https://www.gstatic.com/firebasejs/12.19.0/';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const j = new Date(Date.now() + 9 * 3600e3); return j.toISOString().slice(0, 10); };
  let fb, user, posts = [], editing = null;

  async function boot() {
    const [appMod, authMod, fs] = await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')]);
    const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(cfg);
    const auth = authMod.getAuth(app);
    fb = { authMod, fs, auth, db: fs.getFirestore(app) };
    await authMod.getRedirectResult(auth).catch(() => {});
    authMod.onAuthStateChanged(auth, u => { user = u && !u.isAnonymous ? u : null; view(); });
  }

  function view() {
    if (!user) {
      root.innerHTML = `
        <div class="dg-card adm-card">
          <p class="dg-kicker">ログイン</p>
          <h2>部員の Google アカウントでログイン</h2>
          <p class="adm-msg">登録されている部員のアカウントだけが、内容を書きかえられます。</p>
          <button type="button" class="btn-primary adm-login">Google でログイン</button>
          <p class="adm-err" role="alert"></p>
        </div>`;
      root.querySelector('.adm-login').addEventListener('click', login);
      return;
    }
    const ok = user.emailVerified && EDITORS.includes((user.email || '').toLowerCase());
    if (!ok) {
      root.innerHTML = `
        <div class="dg-card adm-card">
          <h2>このアカウントには、書きこみの許可がありません</h2>
          <p class="adm-msg">${esc(user.email)} でログインしています。部員として登録してほしい場合は、管理者に連絡してください。</p>
          <button type="button" class="btn-ghost adm-logout">ログアウト</button>
        </div>`;
      root.querySelector('.adm-logout').addEventListener('click', () => fb.authMod.signOut(fb.auth));
      return;
    }
    root.innerHTML = `
      <div class="adm-bar"><span>${esc(user.email)} でログイン中</span><button type="button" class="btn-ghost adm-logout">ログアウト</button></div>
      <form class="dg-card adm-card adm-form" novalidate>
        <p class="dg-kicker" id="admMode">新しく書く</p>
        <div class="adm-kind" role="radiogroup" aria-label="種類">
          <label><input type="radio" name="kind" value="diary" checked> 活動日誌・お知らせ</label>
          <label><input type="radio" name="kind" value="event"> 日程・イベント</label>
        </div>
        <label class="adm-f"><span>タイトル <em>必須・40 字まで</em></span><input name="title" maxlength="40" required></label>
        <div class="adm-row">
          <label class="adm-f"><span>日付 <em class="adm-date-hint">必須</em></span><input type="date" name="date"></label>
          <label class="adm-f adm-ev"><span>終わりの日 <em>何日か続くとき</em></span><input type="date" name="end"></label>
        </div>
        <label class="adm-f"><span>本文 <em>300 字まで</em></span><textarea name="body" rows="4" maxlength="300"></textarea><small class="adm-count">0 / 300</small></label>
        <div class="adm-row adm-ev">
          <label class="adm-f"><span>場所</span><input name="place" maxlength="40"></label>
          <label class="adm-f"><span>ラベル <em>例：文化祭、コンテスト</em></span><input name="tag" maxlength="12"></label>
        </div>
        <label class="adm-f adm-ev"><span>リンク <em>例：festival.html や https://…</em></span><input name="link" maxlength="200"></label>
        <label class="adm-f adm-ev"><span>写真 <em>サイトの写真から選ぶ（日程のページに小さく出ます）</em></span><select name="img"><option value="">なし</option>${PHOTOS.map(p => `<option value="${esc(p.src)}">${esc(p.caption)}</option>`).join('')}</select></label>
        <p class="adm-err" role="alert"></p>
        <div class="adm-actions">
          <button type="submit" class="btn-primary">保存する</button>
          <button type="button" class="btn-ghost adm-cancel" hidden>書くのをやめる</button>
        </div>
      </form>
      <div class="adm-import" hidden></div>
      <div class="adm-list-head"><h2>これまでの投稿</h2><small>ここに出るのは、このページから書いたものだけです</small></div>
      <ol class="adm-list"><li class="adm-msg">読みこみ中…</li></ol>`;
    root.querySelector('.adm-logout').addEventListener('click', () => fb.authMod.signOut(fb.auth));
    const f = root.querySelector('.adm-form');
    const sync = () => {
      const ev = f.kind.value === 'event';
      f.querySelectorAll('.adm-ev').forEach(e => { e.hidden = !ev; });
      f.querySelector('.adm-date-hint').textContent = ev ? '未定なら空のまま' : '必須';
      f.querySelector('.adm-count').textContent = `${f.body.value.length} / 300`;
    };
    f.addEventListener('input', sync); f.addEventListener('change', sync);
    if (!f.date.value) f.date.value = today();
    sync();
    f.addEventListener('submit', e => { e.preventDefault(); save(f); });
    f.querySelector('.adm-cancel').addEventListener('click', () => { editing = null; view(); });
    load();
  }

  async function login() {
    const p = new fb.authMod.GoogleAuthProvider();
    p.setCustomParameters({ prompt: 'select_account' });
    const err = root.querySelector('.adm-err');
    try { await fb.authMod.signInWithPopup(fb.auth, p); }
    catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') return fb.authMod.signInWithRedirect(fb.auth, p);
      if (err) err.textContent = e.code === 'auth/popup-closed-by-user' ? 'ログインが取り消されました。' : 'ログインできませんでした（' + (e.code || e.message) + '）';
    }
  }

  async function load() {
    const list = root.querySelector('.adm-list');
    try {
      const snap = await fb.fs.getDocs(fb.fs.query(fb.fs.collection(fb.db, 'posts'), fb.fs.orderBy('updatedAt', 'desc'), fb.fs.limit(100)));
      posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.innerHTML = posts.length ? posts.map(p => `
        <li>
          <span class="adm-k adm-k-${p.kind}">${p.kind === 'event' ? '日程' : '日誌'}</span>
          <div><b>${esc(p.title)}</b><small>${esc(p.date || '日程調整中')}${p.end ? ' – ' + esc(p.end) : ''}</small></div>
          <button type="button" class="btn-ghost" data-edit="${esc(p.id)}">直す</button>
          <button type="button" class="btn-ghost adm-del" data-del="${esc(p.id)}">消す</button>
        </li>`).join('') : '<li class="adm-msg">まだ投稿はありません。</li>';
      list.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => edit(b.dataset.edit)));
      list.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => del(b.dataset.del)));
      importBox();
    } catch (e) { list.innerHTML = `<li class="adm-err">読みこめませんでした（${esc(e.code || e.message)}）</li>`; }
  }

  /* ---- サイトに直接書いてある日誌・日程（content.js）を、管理ページの投稿として取りこむ ---- */
  function legacyItems() {
    const D = window.AZAKEI || {};
    const photo = s => (/^photos\/[a-z0-9-]+\.jpg$/.test(s || '') ? s : '');
    const diary = (D.diary || []).map(d => ({ kind: 'diary', title: d.title, body: d.body || '', date: d.date || '', end: '', place: '', tag: '', link: '', img: '' }));
    const events = (D.events || []).map(e => ({ kind: 'event', title: e.title, body: e.desc || '', date: e.date || '', end: e.end || '', place: e.place || '', tag: e.tag || '', link: e.link || '', img: photo(e.img) }));
    const key = p => p.kind + '|' + p.date + '|' + p.title;
    const have = new Set(posts.map(key));
    return [...diary, ...events].filter(p => !have.has(key(p)));
  }
  function importBox() {
    const box = root.querySelector('.adm-import');
    if (!box) return;
    const items = legacyItems();
    if (!items.length) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = `
      <p><b>サイトに直接書いてある日誌・日程が ${items.length} 件あります。</b><br>取りこむと、ここから直したり消したりできるようになります（サイトの見た目は変わりません）。</p>
      <button type="button" class="btn-primary">${items.length} 件を取りこむ</button>
      <p class="adm-err" role="alert"></p>`;
    const btn = box.querySelector('button'), msg = box.querySelector('.adm-err');
    btn.addEventListener('click', async () => {
      btn.disabled = true; msg.textContent = '取りこんでいます…';
      try {
        for (const it of items) await fb.fs.addDoc(fb.fs.collection(fb.db, 'posts'), { ...it, author: user.email, updatedAt: fb.fs.serverTimestamp() });
        msg.classList.add('is-ok'); msg.textContent = `${items.length} 件を取りこみました。`;
        load();
      } catch (e) {
        btn.disabled = false;
        msg.textContent = '途中で止まりました（' + (e.code || e.message) + '）。もう一度押すと、残りだけ取りこみます。';
        load();
      }
    });
  }

  function edit(id) {
    const p = posts.find(x => x.id === id); if (!p) return;
    editing = id;
    const f = root.querySelector('.adm-form');
    f.kind.value = p.kind; ['title', 'date', 'end', 'body', 'place', 'tag', 'link', 'img'].forEach(k => { f[k].value = p[k] || ''; });
    root.querySelector('#admMode').textContent = '直している投稿';
    f.querySelector('.adm-cancel').hidden = false;
    f.dispatchEvent(new Event('change'));
    f.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function del(id) {
    const p = posts.find(x => x.id === id);
    if (!p || !confirm(`「${p.title}」を消します。よろしいですか？（元に戻せません）`)) return;
    try { await fb.fs.deleteDoc(fb.fs.doc(fb.db, 'posts', id)); load(); }
    catch (e) { alert('消せませんでした（' + (e.code || e.message) + '）'); }
  }

  async function save(f) {
    const err = f.querySelector('.adm-err');
    const kind = f.kind.value;
    const v = k => f[k].value.trim();
    const data = { kind, title: v('title'), body: v('body'), date: v('date'), end: kind === 'event' ? v('end') : '', place: kind === 'event' ? v('place') : '', tag: kind === 'event' ? v('tag') : '', link: kind === 'event' ? v('link') : '', img: kind === 'event' ? f.img.value : '' };
    if (!data.title) { err.textContent = 'タイトルを入れてください。'; f.title.focus(); return; }
    if (kind === 'diary' && !data.date) { err.textContent = '日誌には日付が必要です。'; f.date.focus(); return; }
    if (data.end && data.date && data.end < data.date) { err.textContent = '終わりの日が、はじまりの日より前になっています。'; return; }
    if (data.link && !/^(https:\/\/|[a-z0-9-]+\.html(#[\w-]+)?$)/i.test(data.link)) { err.textContent = 'リンクは「https://」から始まるか、「festival.html」のようなこのサイトのページ名にしてください。'; return; }
    data.author = user.email; data.updatedAt = fb.fs.serverTimestamp();
    const btn = f.querySelector('[type=submit]'); btn.disabled = true; err.textContent = '保存しています…';
    try {
      if (editing) await fb.fs.setDoc(fb.fs.doc(fb.db, 'posts', editing), data);
      else await fb.fs.addDoc(fb.fs.collection(fb.db, 'posts'), data);
      editing = null; view();
      const ok = root.querySelector('.adm-err'); if (ok) { ok.classList.add('is-ok'); ok.textContent = '保存しました。サイトに表示されています。'; }
    } catch (e) {
      btn.disabled = false;
      err.textContent = '保存できませんでした（' + (e.code || e.message) + '）。部員として登録されているか確認してください。';
    }
  }

  boot().catch(e => { root.innerHTML = `<p class="adm-err">読みこめませんでした（${esc(e.message)}）</p>`; });
})();
