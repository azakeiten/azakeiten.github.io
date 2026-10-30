/* ================================================================
   radar.js — わたしの記録：経済力レーダー（このブラウザの記録から、5 つの力を 0〜100 で五角形に）
   ・数字はサイトで遊んだ記録だけから計算する「遊びの目安」。テストの点数ではない
   ・いちばん低い力には、のばせる場所へのリンクをつける
   ================================================================ */
(function() {
  const host = document.querySelector('[data-myrecord]');
  if (!host) return;
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const num = k => +get(k, 0) || 0;
  const len = k => { const v = get(k, []); return Array.isArray(v) ? v.length : 0; };
  const has = k => { try { return localStorage.getItem(k) !== null; } catch (e) { return false; } };
  const cap = (v, m) => Math.min(1, v / m);
  const plan = get('azakei_planseed', {}) || {};
  const planN = ['problem', 'idea', 'persona', 'model', 'diff', 'pitch'].filter(k => (plan[k] || '').trim()).length;
  const lab = ['azakei_sim_run', 'azakei_chart_reader', 'azakei_ozk_master', 'azakei_fx_master', 'azakei_oku', 'azakei_budget', 'azakei_bungyo', 'azakei_ginko'].filter(has).length + (len('azakei_shop') >= 3 ? 1 : 0);
  const ms = get('azakei_mission', {}) || {}, wk = get('azakei_weekly', {}) || {};
  // [名前, 0〜100, のばせる場所, その場所の名前]
  const A = [
    ['ことば', cap(len('azakei_gl_known'), 209) * 40 + cap(len('azakei_gacha'), 209) * 30 + cap(num('azakei_narabe_best'), 10) * 15 + cap(num('azakei_rush_best'), 20) * 15, 'glossary.html#narabe', 'ことばならべかえ'],
    ['クイズ', cap(num('azakei_quiz_best'), 120) * 50 + cap(wk.streak || 0, 3) * 25 + cap(len('azakei_coins'), 12) * 25, 'quiz.html', '億万長者クイズ'],
    ['実験', cap(lab, 9) * 80 + cap(num('azakei_sugo_best'), 1800) * 20, 'sim.html', '経済ラボ'],
    ['計画', cap(len('azakei_shop'), 3) * 35 + (has('azakei_ozk_master') ? 25 : 0) + cap(planN, 6) * 40, 'contests.html#plan-seed', 'ビジネスプランのたね'],
    ['探検', cap(len('azakei-visited'), 14) * 50 + (has('azakei_room_tour') ? 15 : 0) + cap(ms.streak || 0, 7) * 20 + (has('azakei_omikuji') ? 15 : 0), 'index.html#omikuji', '経済おみくじ']
  ].map(a => [a[0], Math.round(a[1]), a[2], a[3]]);
  const C = 120, R = 86;
  const pt = (i, r) => { const t = -Math.PI / 2 + i * 2 * Math.PI / 5; return [C + r * Math.cos(t), C + r * Math.sin(t)]; };
  const poly = f => A.map((a, i) => pt(i, f(a)).map(v => v.toFixed(1)).join(',')).join(' ');
  const total = Math.round(A.reduce((s, a) => s + a[1], 0) / 5);
  const top = A.reduce((a, b) => b[1] > a[1] ? b : a), low = A.reduce((a, b) => b[1] < a[1] ? b : a);
  const el = document.createElement('section');
  el.className = 'rd';
  el.innerHTML = `
    <div class="rd-chart">
      <svg viewBox="0 0 240 240" role="img" aria-label="経済力レーダー：${A.map(a => `${a[0]} ${a[1]}`).join('、')}">
        ${[1, .66, .33].map(f => `<polygon points="${poly(() => R * f)}" class="rd-grid"/>`).join('')}
        ${A.map((a, i) => { const [x, y] = pt(i, R); return `<line x1="${C}" y1="${C}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="rd-axis"/>`; }).join('')}
        <polygon points="${poly(a => Math.max(4, R * a[1] / 100))}" class="rd-shape"/>
        ${A.map((a, i) => { const [x, y] = pt(i, Math.max(4, R * a[1] / 100)); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" class="rd-dot" style="--i:${i}"/>`; }).join('')}
        ${A.map((a, i) => { const [x, y] = pt(i, R + 20); return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" class="rd-lb">${a[0]}<tspan class="rd-v" dx="3">${a[1]}</tspan></text>`; }).join('')}
      </svg>
    </div>
    <div class="rd-body">
      <p class="rd-k">経済力レーダー</p>
      <p class="rd-total"><b data-to="${total}">0</b><small>/ 100</small></p>
      ${total ? `<p class="rd-line"><span>いちばんの得意</span><b>${top[0]}力</b></p>
      <a class="rd-grow" href="${low[2]}"><span>のびしろ</span><b>${low[0]}力</b><small>${low[3]}で、のばしてみよう →</small></a>`
      : '<p class="rd-line">まだ記録がありません。クイズや実験で遊ぶと、五角形が大きくなります。</p>'}
      <p class="rd-note">※ このブラウザに残っている遊びの記録から計算した、遊びの目安です。</p>
    </div>`;
  const rank = host.querySelector('.my-rank');
  if (rank) rank.after(el); else host.prepend(el);
  // 見えたら、五角形が広がり、数字が数え上がる
  const play = () => {
    el.classList.add('is-in');
    const b = el.querySelector('[data-to]'), to = +b.dataset.to, t0 = performance.now();
    const tick = now => { const k = Math.min(1, (now - t0) / 900); b.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); play(); } }, { threshold: .3 }); io.observe(el); }
  else play();
})();
