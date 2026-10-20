/* ================================================================
   npgame.js — 用語辞典：年表ゲーム「どっちが先？」
   ・上の年表（.np-line）のできごとを 2 つずつ出して、先に起きたほうを選ぶ
   ・連続正解の自己ベストは、このブラウザの中にだけ残す
   ================================================================ */
(function() {
  const box = document.querySelector('[data-npgame]');
  if (!box) return;
  const KEY = 'azakei_np_best';
  const EV = [...document.querySelectorAll('.np-line li a')].map(a => ({ y: +a.querySelector('b').textContent, t: a.querySelector('span').textContent, href: a.getAttribute('href') }));
  if (EV.length < 4) return;
  let best = 0; try { best = +localStorage.getItem(KEY) || 0; } catch (e) {}
  let streak = 0, last = '';
  const pair = () => {
    for (;;) {
      const a = EV[Math.random() * EV.length | 0], b = EV[Math.random() * EV.length | 0];
      const k = [a.t, b.t].sort().join('|');
      if (a.y !== b.y && k !== last) { last = k; return [a, b]; }
    }
  };
  const draw = () => {
    const [a, b] = pair();
    box.innerHTML = `<div class="npg-head"><span class="npg-q">どっちが <b>先</b> に起きた？</span><span class="npg-score">連続 <b>${streak}</b><small>自己ベスト ${best}</small></span></div>
      <div class="npg-pair">${[a, b].map((e, i) => `<button type="button" class="npg-card" data-i="${i}"><span class="npg-year" aria-hidden="true">????</span><span class="npg-t">${e.t}</span></button>`).join('<span class="npg-vs" aria-hidden="true">or</span>')}</div>
      <div class="npg-fb" aria-live="polite"></div>`;
    const btns = [...box.querySelectorAll('.npg-card')], ev = [a, b], fb = box.querySelector('.npg-fb');
    btns.forEach(btn => btn.addEventListener('click', () => {
      if (btns[0].disabled) return;
      const i = +btn.dataset.i, ok = ev[i].y < ev[1 - i].y;
      btns.forEach((x, j) => { x.disabled = true; x.querySelector('.npg-year').textContent = ev[j].y; x.classList.add(ev[j].y < ev[1 - j].y ? 'is-first' : 'is-later'); });
      btn.classList.add(ok ? 'is-right' : 'is-wrong');
      const gap = Math.abs(a.y - b.y);
      if (ok) { streak++; if (streak > best) { best = streak; try { localStorage.setItem(KEY, best); } catch (e) {} } }
      const first = ev[0].y < ev[1].y ? ev[0] : ev[1];
      fb.innerHTML = `<p class="${ok ? 'ok' : 'ng'}">${ok ? `正解！ ${gap} 年の差でした。` : `残念…… 先なのは「${first.t}」（${first.y} 年）。${streak ? `連続記録は ${streak} でストップ。` : ""}`}</p>
        ${!ok && window.AZAKEI_OSATSU ? AZAKEI_OSATSU(streak >= 5 ? `${streak} 連続はすごい！ 年表をながめてから、もう一度どうぞ。` : '年表を横にたどると、流れがつかめるよ。', streak >= 5 ? 'happy' : '') : ''}
        <div class="npg-actions"><button type="button" class="btn-primary npg-next">${ok ? '次の問題' : 'もう一度はじめから'}</button><a class="npg-link" href="${first.href}">言葉の説明を読む →</a></div>`;
      if (!ok) streak = 0;
      fb.querySelector('.npg-next').addEventListener('click', draw);
      fb.querySelector('.npg-next').focus({ preventScroll: true });
    }));
  };
  draw();
})();
