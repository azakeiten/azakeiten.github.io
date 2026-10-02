/* ================================================================
   daily.js — トップの「今日の 1 問」
   ・quiz-data.js の全問題から、日本時間の日付で 1 問を自動で選ぶ（部員の手間なし）
   ・その日は、だれが開いても同じ問題・同じ選択肢の並び
   ・答えた結果と「連続正解」は、その人のブラウザにだけ保存
   ================================================================ */
(function() {
  const box = document.querySelector('[data-daily-q]');
  const Q = window.AZAKEI_QUIZ_Q;
  if (!box || !Q) return;

  const LV = { easy: 'かんたん', normal: '普通', hard: '激ムズ' };
  const all = Object.entries(Q).flatMap(([lv, list]) => list.map(q => ({ ...q, lv })));
  // 日本時間の「今日」
  const jst = new Date(Date.now() + 9 * 3600e3);
  const today = jst.toISOString().slice(0, 10);
  const dayNo = Math.floor(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()) / 864e5);
  // 毎日ちがう問題を、順番がわかりにくいように選ぶ（17 と問題数は互いに素になるよう調整）
  let step = 17; while (gcd(step, all.length) !== 1) step++;
  const q = all[(dayNo * step) % all.length];
  // 選択肢の並びも日付で決める
  let seed = dayNo;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const choices = q.a.map((t, i) => ({ t, ok: i === 0 })).map(c => [rand(), c]).sort((a, b) => a[0] - b[0]).map(c => c[1]);

  const KEY = 'azakei_daily';
  let save = {};
  try { save = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  const label = `${+today.slice(5, 7)} 月 ${+today.slice(8, 10)} 日`;

  box.innerHTML = `
    <div class="dq-head">
      <p class="dq-kicker">Today's Question · ${label}</p>
      <span class="dq-level dq-${q.lv}">${LV[q.lv]}</span>
    </div>
    <h2 class="dq-q">${q.q}</h2>
    <div class="dq-choices">${choices.map((c, i) => `<button type="button" class="dq-choice" data-ok="${c.ok ? 1 : 0}"><span>${'ABCD'[i]}</span>${c.t}</button>`).join('')}</div>
    <div class="dq-result" aria-live="polite"></div>`;
  const result = box.querySelector('.dq-result');
  const btns = [...box.querySelectorAll('.dq-choice')];

  function reveal(pickedIdx, fresh) {
    const ok = btns[pickedIdx] && btns[pickedIdx].dataset.ok === '1';
    btns.forEach((b, i) => { b.disabled = true; if (b.dataset.ok === '1') b.classList.add('is-right'); if (i === pickedIdx && !ok) b.classList.add('is-wrong'); });
    const streak = save.streak || 0;
    result.innerHTML = `
      <p class="dq-verdict ${ok ? 'ok' : 'ng'}">${ok ? '正解！' : '残念……'}${ok && streak > 1 ? `<small>${streak} 日連続正解中</small>` : ''}</p>
      <p class="dq-note">${q.note}</p>
      <p class="dq-next">明日はまた別の問題が出ます。<a href="quiz.html">億万長者クイズで、チップを賭けて挑戦する →</a></p>`;
    if (fresh && ok && !matchMedia('(prefers-reduced-motion: reduce)').matches) box.classList.add('is-correct');
  }

  if (save.date === today && Number.isInteger(save.pick)) reveal(save.pick, false);

  btns.forEach((b, i) => b.addEventListener('click', () => {
    const ok = b.dataset.ok === '1';
    // 連続正解：昨日も正解していたら +1
    const y = new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()) - 864e5).toISOString().slice(0, 10);
    const streak = ok ? ((save.lastOk === y ? save.streak || 0 : 0) + 1) : 0;
    save = { date: today, pick: i, streak, lastOk: ok ? today : save.lastOk };
    try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {}
    reveal(i, true);
  }));

  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
})();
