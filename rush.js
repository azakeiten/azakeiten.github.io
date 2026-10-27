/* ================================================================
   rush.js — 用語辞典：ことば○×ラッシュ（30 秒で、言葉と説明が合っているかを ○× で答える）
   ・問題は辞典の言葉（.gl-item）から。半分は正しい説明、半分は同じ分類の別の言葉の説明
   ・説明の中に出てくる言葉そのものは「〇〇」でかくす。自己ベストはこのブラウザの中にだけ残す
   ================================================================ */
(function() {
  const box = document.querySelector('[data-rush]');
  const items = [...document.querySelectorAll('.gl-item')];
  if (!box || items.length < 10) return;
  const KEY = 'azakei_rush_best', SEC = 30;
  let best = 0; try { best = +localStorage.getItem(KEY) || 0; } catch (e) {}
  const name = it => it.querySelector('dt').textContent.trim();
  const short = it => name(it).split(/[（(]/)[0].trim();
  // 説明だけ（あとから付く「関連」のリンクはのぞく）
  const def = it => { const d = it.querySelector('dd').cloneNode(true); d.querySelectorAll('.gl-rel').forEach(x => x.remove()); return d.textContent.trim(); };
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hide = (text, it) => text.replace(new RegExp(esc(short(it)), 'g'), '〇〇');
  const pick = a => a[Math.random() * a.length | 0];
  box.innerHTML = `
    <div class="ru-top"><span class="ru-score">得点 <b data-o="score">0</b></span><span class="ru-combo" data-o="combo"></span><span class="ru-time"><b data-o="time">${SEC}</b> 秒</span></div>
    <div class="ru-bar" aria-hidden="true"><span data-o="bar"></span></div>
    <div class="ru-stage" data-o="stage">
      <p class="ru-intro">言葉と説明が<b>合っていたら ○</b>、<b>ちがっていたら ×</b>。<br>${SEC} 秒で、何問答えられる？<small>キーボードなら ← が ○、→ が ×</small></p>
      <button type="button" class="btn-primary ru-start">スタート</button>
      <p class="ru-best">自己ベスト <b data-o="best">${best}</b> 点</p>
    </div>`;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  let q, score, combo, miss, timer, end, playing = false;
  const next = () => {
    const it = pick(items), ok = Math.random() < .5;
    let shown = it;
    if (!ok) { const g = it.closest('.gl-group'); const same = [...g.querySelectorAll('.gl-item')].filter(x => x !== it); shown = pick(same.length ? same : items.filter(x => x !== it)); }
    q = { it, ok };
    // 説明では、出題の言葉も、説明のもとの言葉も「〇〇」にする
    $('stage').innerHTML = `<div class="ru-q"><p class="ru-word">${name(it)}</p><p class="ru-def">${hide(hide(def(shown), shown), it)}</p></div>
      <div class="ru-btns"><button type="button" class="ru-o" data-a="1" aria-label="合っている">○</button><button type="button" class="ru-x" data-a="0" aria-label="ちがう">×</button></div>`;
  };
  const answer = a => {
    if (!playing) return;
    const right = (a === 1) === q.ok;
    if (right) { combo++; score += 10 + Math.min(combo - 1, 5) * 2; }
    else { combo = 0; if (!miss.includes(q.it)) miss.push(q.it); }
    $('score').textContent = score;
    $('combo').textContent = combo >= 2 ? `${combo} COMBO` : '';
    $('combo').classList.remove('is-pop'); void box.offsetWidth; if (combo >= 2) $('combo').classList.add('is-pop');
    box.classList.remove('is-right', 'is-wrong'); void box.offsetWidth; box.classList.add(right ? 'is-right' : 'is-wrong');
    next();
  };
  const finish = () => {
    playing = false; clearInterval(timer); box.classList.remove('is-hurry');
    const nb = score > best; if (nb) { best = score; try { localStorage.setItem(KEY, best); } catch (e) {} }
    const rank = score >= 200 ? ['辞', '歩く経済辞典'] : score >= 120 ? ['博', 'ことば博士'] : score >= 60 ? ['研', 'ことばの研究員'] : ['芽', 'ことばの芽'];
    $('stage').innerHTML = `<div class="ru-end"><span class="ru-seal" aria-hidden="true">${rank[0]}</span><p class="ru-rank">${rank[1]}</p>
      <p class="ru-final"><b>${score}</b> 点${nb ? '<em>自己ベスト更新！</em>' : `<small>（自己ベスト ${best} 点）</small>`}</p>
      ${miss.length ? `<p class="ru-miss">まちがえた言葉：${miss.slice(0, 6).map(it => `<a href="#${it.id}">${short(it)}</a>`).join('・')}</p>` : '<p class="ru-miss">まちがいなし！</p>'}
      <button type="button" class="btn-primary ru-start">もう 1 回</button></div>`;
    $('combo').textContent = '';
  };
  box.addEventListener('click', e => {
    if (e.target.closest('.ru-start')) {
      score = 0; combo = 0; miss = []; playing = true; end = Date.now() + SEC * 1000;
      $('score').textContent = 0; next();
      clearInterval(timer);
      timer = setInterval(() => {
        const left = Math.max(0, end - Date.now());
        $('time').textContent = Math.ceil(left / 1000);
        $('bar').style.width = (left / SEC / 10) + '%';
        box.classList.toggle('is-hurry', left < 5000);
        if (!left) finish();
      }, 100);
      return;
    }
    const b = e.target.closest('[data-a]'); if (b) answer(+b.dataset.a);
  });
  document.addEventListener('keydown', e => {
    if (!playing || e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); answer(1); } else if (e.key === 'ArrowRight') { e.preventDefault(); answer(0); }
  });
})();
