/* ================================================================
   tryout.js — トップの「1 回だけ、賭けてみる」（麻布経済展のおためし版）
   ・チップ 5 枚を、かんたん（×2）・普通（×3）・激ムズ（×6）のどれかに賭けて 1 問に答える
   ・本番は 2 問。おためし版は 1 問正解で、本番の「2 問正解」の倍率にしています
   ・問題は quiz-data.js から選ぶ。記録はどこにも保存しない
   ================================================================ */
(function() {
  const box = document.querySelector('[data-tryout]');
  const Q = window.AZAKEI_QUIZ_Q;
  if (!box || !Q) return;

  const START = 5;
  const LV = [
    { key: 'easy', ja: 'かんたん', x: 2 },
    { key: 'normal', ja: '普通', x: 3 },
    { key: 'hard', ja: '激ムズ', x: 6 }
  ];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
  const chips = n => `<span class="to-chips" aria-hidden="true">${'<i></i>'.repeat(Math.min(n, 12))}</span>`;

  function start() {
    box.innerHTML = `
      <div class="to-head">
        <p class="to-kicker">おためし版</p>
        <h3>1 回だけ、賭けてみる。</h3>
        <p class="to-lead">手もちは、チップ ${START} 枚。どの難しさに賭けますか？</p>
      </div>
      <div class="to-pick">${LV.map((l, i) => `
        <button type="button" class="to-lv to-${l.key}" data-i="${i}">
          <b>×${l.x}</b><span>${l.ja}</span><small>正解で ${START * l.x} 枚</small>
        </button>`).join('')}</div>
      <p class="to-rule hand-note">ハズレたら、賭けたチップはなくなります</p>`;
    box.querySelectorAll('.to-lv').forEach(b => b.addEventListener('click', () => ask(LV[+b.dataset.i])));
  }

  function ask(lv) {
    const list = Q[lv.key] || [];
    const q = list[Math.floor(Math.random() * list.length)];
    if (!q) return start();
    const choices = shuffle(q.a.map((t, i) => ({ t, ok: i === 0 })));
    box.innerHTML = `
      <div class="to-head">
        <p class="to-kicker">${lv.ja}・×${lv.x} に ${START} 枚</p>
        <h3 class="to-q">${esc(q.q)}</h3>
      </div>
      <div class="to-choices">${choices.map((c, i) => `<button type="button" class="to-choice" data-ok="${c.ok ? 1 : 0}"><span>${'ABCD'[i]}</span>${esc(c.t)}</button>`).join('')}</div>`;
    box.querySelectorAll('.to-choice').forEach(b => b.addEventListener('click', () => answer(b, lv, q)));
    box.querySelector('.to-choice').focus({ preventScroll: true });
  }

  function answer(btn, lv, q) {
    const ok = btn.dataset.ok === '1';
    box.querySelectorAll('.to-choice').forEach(b => { b.disabled = true; if (b.dataset.ok === '1') b.classList.add('is-right'); });
    if (!ok) btn.classList.add('is-wrong');
    const after = ok ? START * lv.x : 0;
    setTimeout(() => {
      box.insertAdjacentHTML('beforeend', `
        <div class="to-result ${ok ? 'is-win' : 'is-lose'}" role="status">
          <p class="to-score"><span>${START} 枚</span><i aria-hidden="true">→</i><b>${after} 枚</b></p>
          ${ok ? chips(after) : ''}
          <p class="to-verdict">${ok ? (lv.x >= 6 ? '激ムズ的中！ 会場なら、拍手が起きるところです。' : '正解！ チップが増えました。') : '残念……。でも、本番の展示ではここからが勝負です。'}</p>
          <p class="to-note">${esc(q.note || '')}</p>
          <div class="to-actions">
            <a class="btn-primary" href="quiz.html">本番のクイズに挑戦（全 42 問）</a>
            <button type="button" class="to-again">もう 1 回</button>
          </div>
        </div>`);
      box.querySelector('.to-again').addEventListener('click', start);
    }, 450);
  }

  start();
})();
