/* ================================================================
   daily.js — トップの「今週の 1 問」
   ・quiz-data.js の全問題から、日本時間の「週」（月曜はじまり）で 1 問を自動で選ぶ（部員の手間なし）
   ・その週は、だれが開いても同じ問題・同じ選択肢の並び。毎週月曜に切りかわる
   ・答えた結果と「◯週連続正解」は、その人のブラウザにだけ保存
   ================================================================ */
(function() {
  const box = document.querySelector('[data-daily-q]');
  const Q = window.AZAKEI_QUIZ_Q;
  if (!box || !Q) return;

  const LV = { easy: 'かんたん', normal: '普通', hard: '激ムズ' };
  const all = Object.entries(Q).flatMap(([lv, list]) => list.map(q => ({ ...q, lv })));
  // 日本時間の「今日」と「今週」（1970-01-05 が月曜なので、そこから 7 日ごとに数える）
  const jst = new Date(Date.now() + 9 * 3600e3);
  const dayNo = Math.floor(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()) / 864e5);
  const weekNo = Math.floor((dayNo - 4) / 7);
  const monday = new Date((weekNo * 7 + 4) * 864e5), sunday = new Date((weekNo * 7 + 10) * 864e5);
  const md = d => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  const daysLeft = (weekNo * 7 + 11) - dayNo;   // 次の月曜まで
  // 毎週ちがう問題を、順番がわかりにくいように選ぶ（17 と問題数は互いに素になるよう調整）
  let step = 17; while (gcd(step, all.length) !== 1) step++;
  const q = all[((weekNo * step) % all.length + all.length) % all.length];
  // 選択肢の並びも週で決める
  let seed = Math.abs(weekNo) + 1;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  rand(); rand();
  const choices = q.a.map((t, i) => ({ t, ok: i === 0 })).map(c => [rand(), c]).sort((a, b) => a[0] - b[0]).map(c => c[1]);

  const KEY = 'azakei_weekly';
  let save = {};
  try { save = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}

  box.innerHTML = `
    <div class="dq-head">
      <p class="dq-kicker">This Week's Question · ${md(monday)}〜${md(sunday)}</p>
      <span class="dq-level dq-${q.lv}">${LV[q.lv]}</span>
    </div>
    <h2 class="dq-q">${q.q}</h2>
    <div class="dq-choices">${choices.map((c, i) => `<button type="button" class="dq-choice" data-ok="${c.ok ? 1 : 0}"><span>${'ABCD'[i]}</span>${c.t}</button>`).join('')}</div>
    <div class="dq-result" aria-live="polite"></div>
    <p class="dq-week">毎週月曜に新しい問題。次の問題まで、あと ${daysLeft} 日。</p>`;
  const result = box.querySelector('.dq-result');
  const btns = [...box.querySelectorAll('.dq-choice')];

  function reveal(pickedIdx, fresh) {
    const ok = btns[pickedIdx] && btns[pickedIdx].dataset.ok === '1';
    btns.forEach((b, i) => { b.disabled = true; if (b.dataset.ok === '1') b.classList.add('is-right'); if (i === pickedIdx && !ok) b.classList.add('is-wrong'); });
    const streak = save.streak || 0;
    result.innerHTML = `
      <p class="dq-verdict ${ok ? 'ok' : 'ng'}">${ok ? '正解！' : '残念……'}${ok && streak > 1 ? `<small>${streak} 週連続正解中</small>` : ''}</p>
      <p class="dq-note">${q.note}</p>
      <p class="dq-next">来週の月曜に、また新しい問題が出ます。<a href="quiz.html">待ちきれない人は、億万長者クイズで →</a></p>`;
    if (fresh && ok && !matchMedia('(prefers-reduced-motion: reduce)').matches) box.classList.add('is-correct');
  }

  if (save.week === weekNo && Number.isInteger(save.pick)) { reveal(save.pick, false); stats(null); }

  btns.forEach((b, i) => b.addEventListener('click', () => {
    const ok = b.dataset.ok === '1';
    // 連続正解：先週も正解していたら +1
    const streak = ok ? ((save.lastOk === weekNo - 1 ? save.streak || 0 : 0) + 1) : 0;
    save = { week: weekNo, pick: i, streak, lastOk: ok ? weekNo : save.lastOk };
    try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {}
    reveal(i, true);
    stats(ok);
  }));

  /* ---- みんなの正解率（Firestore: weekly/{週の番号}、1 人 1 回だけ数える） ---- */
  async function stats(myAnswer) {
    const cfg = window.AZAKEI && window.AZAKEI.firebase;
    if (!cfg) return;
    const line = document.createElement('p');
    line.className = 'dq-rate';
    result.appendChild(line);
    try {
      const SDK = 'https://www.gstatic.com/firebasejs/12.19.0/';
      const [appMod, authMod, fs] = await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')]);
      const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(cfg);
      const auth = authMod.getAuth(app);
      await auth.authStateReady();
      if (!auth.currentUser) await authMod.signInAnonymously(auth);
      const db = fs.getFirestore(app);
      const ref = fs.doc(db, 'weekly', String(weekNo));
      // 今回はじめて答えたなら、集計に 1 票ぶん足す（すでに数えられていたら足さない）
      if (myAnswer !== null) {
        const mine = fs.doc(ref, 'answers', auth.currentUser.uid);
        const already = await fs.getDoc(mine).then(s => s.exists()).catch(() => true);
        if (!already) {
          const cur = await fs.getDoc(ref);
          if (!cur.exists()) { try { await fs.setDoc(ref, { n: 0, ok: 0 }); } catch (e) { /* ほかの人が先に作った */ } }
          const batch = fs.writeBatch(db);
          batch.set(mine, { ok: !!myAnswer, at: fs.serverTimestamp() });
          batch.update(ref, { n: fs.increment(1), ok: fs.increment(myAnswer ? 1 : 0) });
          await batch.commit();
        }
      }
      const s = await fs.getDoc(ref);
      if (!s.exists() || !s.data().n) { line.remove(); return; }
      const { n, ok } = s.data();
      const pct = Math.round(ok / n * 100);
      line.innerHTML = `<span class="dq-rate-bar"><i style="width:${pct}%"></i></span><span>みんなの正解率 <b>${pct}%</b>（${n.toLocaleString('ja-JP')} 人中）</span>`;
    } catch (e) { line.remove(); }
  }

  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
})();
