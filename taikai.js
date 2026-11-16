/* ================================================================
   taikai.js — クイズ：「みんなでクイズ大会」（教室や文化祭で、プロジェクターに映して遊ぶ）
   ・班の数・難しさ・問題の数・考える時間を決めて、画面いっぱいの大会モードへ
   ・問題を大きく出し、時間の輪が減っていく → 「答えを見る」で正解と解説 → 正解した班に +1 → 次の問題
   ・最後に表彰台。問題は億万長者クイズと同じ 84 問（quiz-data.js）。記録はどこにも送らない
   ・キー：Enter／スペース＝次へ進む、1〜6＝その班に +1、Esc＝やめる
   ================================================================ */
(function() {
  const box = document.querySelector('[data-taikai]');
  if (!box) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TEAM = ['一', '二', '三', '四', '五', '六'];
  const COLOR = ['#b5432f', '#2f6b3a', '#2f5a8a', '#b08a4a', '#7a4a8a', '#3a7a7a'];
  const MARK = ['ア', 'イ', 'ウ', 'エ'];
  const st = { teams: 4, lv: 'mix', n: 10, sec: 20 };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const seg = (k, opts) => `<div class="tk-seg" role="group">${opts.map(([v, t]) => `<button type="button" data-k="${k}" data-v="${v}" aria-pressed="${String(st[k]) === String(v)}">${t}</button>`).join('')}</div>`;
  const setup = () => {
    box.innerHTML = `<div class="tk-set">
      <div class="tk-row"><p>班の数</p>${seg('teams', [2, 3, 4, 5, 6].map(n => [n, n + ' 班']))}</div>
      <div class="tk-row"><p>難しさ</p>${seg('lv', [['easy', 'やさしい'], ['normal', 'ふつう'], ['hard', 'むずかしい'], ['mix', 'まぜる']])}</div>
      <div class="tk-row"><p>問題の数</p>${seg('n', [[5, '5 問'], [10, '10 問'], [15, '15 問']])}</div>
      <div class="tk-row"><p>考える時間</p>${seg('sec', [[15, '15 秒'], [20, '20 秒'], [30, '30 秒'], [0, 'なし']])}</div>
      <button type="button" class="tk-go">大会をはじめる<small>画面いっぱいに広がります</small></button>
      <p class="tk-note">教室のプロジェクターや、文化祭の会場で使えます。答えは口で言うか、紙に書いて出してください。先生や司会の人が「答えを見る」を押し、正解した班の「+1」を押します。記録はどこにも送られません。</p>
    </div>`;
  };
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-k]');
    if (b) { st[b.dataset.k] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v; b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); return; }
    if (e.target.closest('.tk-go')) start();
  });
  setup();

  // ── 大会モード（画面いっぱい）
  let ov, qs, qi, score, timer, left, phase, lastFocus;
  const pool = () => {
    const D = window.AZAKEI_QUIZ_Q || {};
    const all = st.lv === 'mix' ? [...(D.easy || []), ...(D.normal || []), ...(D.hard || [])] : [...(D[st.lv] || [])];
    return shuffle(all).slice(0, st.n);
  };
  const start = () => {
    qs = pool(); if (!qs.length) return;
    qi = 0; score = Array(st.teams).fill(0);
    lastFocus = document.activeElement;
    ov = document.createElement('div'); ov.className = 'tk-full'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'みんなでクイズ大会');
    document.body.appendChild(ov); document.documentElement.classList.add('tk-open');
    ov.addEventListener('click', onClick); document.addEventListener('keydown', onKey);
    if (ov.requestFullscreen && !reduce) ov.requestFullscreen().catch(() => {});
    intro();
  };
  const stop = () => {
    clearInterval(timer);
    document.removeEventListener('keydown', onKey);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (ov) ov.remove(); ov = null;
    document.documentElement.classList.remove('tk-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };
  const board = () => `<div class="tk-board">${score.map((s, j) => `<button type="button" class="tk-team" data-team="${j}" style="--c:${COLOR[j]}"><span>${TEAM[j]}</span><b>${s}</b><i>+1</i></button>`).join('')}</div>`;
  const top = () => `<div class="tk-top"><p class="tk-ttl"><span>大</span>みんなでクイズ大会</p><p class="tk-cnt">${phase === 'end' ? '結果' : `第 <b>${qi + 1}</b> 問 ／ ${qs.length}`}</p><button type="button" class="tk-x">やめる</button></div>`;
  const intro = () => {
    phase = 'intro';
    ov.innerHTML = `${top()}<div class="tk-stage tk-intro"><p class="tk-big">${st.teams} 班で、${qs.length} 問。</p><p class="tk-sub">${st.sec ? `1 問 ${st.sec} 秒。` : ''}相談して、答えを決めてください。</p><button type="button" class="tk-next">第 1 問へ</button></div>${board()}`;
    ov.querySelector('.tk-next').focus();
  };
  const ask = () => {
    phase = 'ask'; clearInterval(timer);
    const q = qs[qi];
    q._c = q._c || shuffle(q.a.map((t, j) => ({ t, ok: j === 0 })));
    ov.innerHTML = `${top()}<div class="tk-stage">
      ${st.sec ? `<div class="tk-ring" aria-hidden="true"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" class="tk-r0"/><circle cx="50" cy="50" r="44" class="tk-r1"/></svg><b>${st.sec}</b></div>` : ''}
      <p class="tk-q">${esc(q.q)}</p>
      <ol class="tk-ch">${q._c.map((c, j) => `<li style="--j:${j}"><span>${MARK[j]}</span>${esc(c.t)}</li>`).join('')}</ol>
      <button type="button" class="tk-next">答えを見る</button>
    </div>${board()}`;
    if (st.sec) {
      left = st.sec;
      const r1 = ov.querySelector('.tk-r1'), num = ov.querySelector('.tk-ring b'), L = 2 * Math.PI * 44;
      r1.style.strokeDasharray = L; r1.style.strokeDashoffset = 0;
      timer = setInterval(() => {
        left--; num.textContent = Math.max(0, left);
        r1.style.strokeDashoffset = L * (1 - left / st.sec);
        ov.querySelector('.tk-ring').classList.toggle('is-low', left <= 5);
        if (left <= 0) { clearInterval(timer); ov.querySelector('.tk-ring').classList.add('is-up'); }
      }, 1000);
    }
  };
  const reveal = () => {
    phase = 'reveal'; clearInterval(timer);
    ov.querySelector('.tk-stage').classList.add('is-rev');
    const q = qs[qi];
    ov.querySelectorAll('.tk-ch li').forEach((li, j) => li.classList.add(q._c[j].ok ? 'is-ok' : 'is-ng'));
    const nb = ov.querySelector('.tk-next');
    nb.insertAdjacentHTML('beforebegin', `<p class="tk-note-a"><b>正解は ${MARK[q._c.findIndex(c => c.ok)]}</b>${q.note ? esc(q.note) : ''}</p>`);
    nb.textContent = qi < qs.length - 1 ? '次の問題へ' : '結果を見る';
    ov.querySelector('.tk-board').classList.add('is-open');
  };
  const end = () => {
    phase = 'end'; clearInterval(timer);
    const order = score.map((s, j) => [s, j]).sort((a, b) => b[0] - a[0]);
    const top1 = order[0][0], winners = order.filter(o => o[0] === top1).map(o => TEAM[o[1]] + '班');
    const pod = [order[1], order[0], order[2]].filter(Boolean);
    const rankOf = s => order.findIndex(o => o[0] === s) + 1;
    const os = window.AZAKEI_OSATSU ? window.AZAKEI_OSATSU(top1 ? `優勝は、${winners.join('と')}！ みんな、おつかれさま。` : 'みんな、おつかれさま。また挑戦してね。', 'happy') : '';
    ov.innerHTML = `${top()}<div class="tk-stage tk-end">
      <div class="tk-pod">${pod.map(([s, j]) => { const r = rankOf(s); return `<div class="tk-p r${r}" style="--c:${COLOR[j]}"><span class="tk-p-t">${TEAM[j]}班</span><b>${s} 点</b><i>${r} 位</i></div>`; }).join('')}</div>
      ${order.length > 3 ? `<p class="tk-rest">${order.slice(3).map(([s, j]) => `${TEAM[j]}班 ${s} 点`).join('　')}</p>` : ''}
      <div class="tk-os">${os}</div>
      <div class="tk-btns"><button type="button" class="tk-again">もう一度（同じ設定）</button><button type="button" class="tk-x2">おわる</button></div>
    </div>`;
    if (!reduce) {
      const r = document.createElement('div'); r.className = 'tk-rain'; r.setAttribute('aria-hidden', 'true');
      r.innerHTML = Array.from({ length: 16 }, (_, j) => `<i style="--x:${(j * 61) % 100}%;--d:${(j % 5) * .3}s;--t:${3 + (j % 4) * .6}s;--r:${(j % 2 ? 1 : -1) * (160 + j * 25)}deg">麻経券</i>`).join('');
      ov.appendChild(r);
    }
  };
  const next = () => {
    if (!ov) return;
    if (phase === 'intro') ask();
    else if (phase === 'ask') reveal();
    else if (phase === 'reveal') { if (qi < qs.length - 1) { qi++; ask(); } else end(); }
  };
  const plus = j => {
    if (j >= score.length || phase === 'end') return;
    score[j]++;
    const b = ov.querySelector(`[data-team="${j}"]`);
    if (b) { b.querySelector('b').textContent = score[j]; b.classList.remove('is-up'); void b.offsetWidth; b.classList.add('is-up'); }
  };
  function onClick(e) {
    if (e.target.closest('.tk-x, .tk-x2')) { stop(); return; }
    if (e.target.closest('.tk-again')) { stop(); start(); return; }
    const t = e.target.closest('[data-team]'); if (t) { plus(+t.dataset.team); return; }
    if (e.target.closest('.tk-next')) next();
  }
  function onKey(e) {
    if (!ov) return;
    if (e.key === 'Escape') { stop(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && !(e.target.closest && e.target.closest('[data-team], .tk-x, .tk-again, .tk-x2'))) { e.preventDefault(); next(); return; }
    if (/^[1-6]$/.test(e.key)) plus(+e.key - 1);
  }
})();
