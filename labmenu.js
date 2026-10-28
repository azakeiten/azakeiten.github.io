/* ================================================================
   labmenu.js — 経済ラボ：メニューを「なかま」で絞りこむ＋サイコロで 1 つ選ぶ
   ・絞りこみはメニューの表示だけ（実験そのものは消さない）。「すべて」で元どおり
   ・サイコロ：光がメニューをかけめぐって、1 つに止まる。まだ「済」のない実験を優先
   ================================================================ */
(function() {
  const board = document.querySelector('[data-lab-board]');
  if (!board) return;
  // なかま分け（1 つの実験が 2 つに入ることもある）
  const CAT = {
    money: ['#sim-main', '#double', '#okozukai', '#infl', '#oku', '#kuji'],
    biz: ['#shop', '#kabu', '#bungyo', '#market'],
    world: ['#fx', '#budget', '#receipt', '#infl'],
    game: ['#updown', '#okozukai', '#kuji', '#bungyo']
  };
  const items = [...board.children].filter(li => li.querySelector('a[href^="#"]') && li.querySelector('a').getAttribute('href') !== '#words');
  const href = li => li.querySelector('a').getAttribute('href');
  const count = k => k === 'all' ? items.length : items.filter(li => CAT[k].includes(href(li))).length;
  const bar = document.createElement('div');
  bar.className = 'lm-bar';
  bar.innerHTML = `<div class="lm-chips" role="group" aria-label="実験のなかま">${[['all', 'すべて'], ['money', 'お金をふやす・つかう'], ['biz', 'お店と会社'], ['world', '国と世界'], ['game', 'ゲーム']].map(([k, t], i) => `<button type="button" data-cat="${k}" aria-pressed="${i === 0}">${t}<small>${count(k)}</small></button>`).join('')}</div>
    <button type="button" class="lm-dice"><span class="lm-die" aria-hidden="true">⚀</span>どれにしよう？</button>`;
  board.before(bar);
  bar.addEventListener('click', e => {
    const c = e.target.closest('[data-cat]');
    if (c) {
      const k = c.dataset.cat;
      bar.querySelectorAll('[data-cat]').forEach(b => b.setAttribute('aria-pressed', b === c));
      items.forEach((li, i) => {
        const on = k === 'all' || CAT[k].includes(href(li));
        li.classList.toggle('lm-hide', !on);
        if (on) { li.classList.remove('lm-in'); void li.offsetWidth; li.style.setProperty('--d', (i % 8) * 30 + 'ms'); li.classList.add('lm-in'); }
      });
      return;
    }
    if (e.target.closest('.lm-dice')) roll();
  });
  const FACES = '⚀⚁⚂⚃⚄⚅';
  let rolling = false;
  const roll = () => {
    if (rolling) return; rolling = true;
    const vis = items.filter(li => !li.classList.contains('lm-hide'));
    const fresh = vis.filter(li => !li.querySelector('.lb-done'));
    const pool = fresh.length ? fresh : vis;
    const goal = pool[Math.random() * pool.length | 0];
    const die = bar.querySelector('.lm-die');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // 光がメニューを順にめぐり、だんだんゆっくりになって止まる
    const steps = reduce ? 1 : vis.length * 2 + vis.indexOf(goal) + 1;
    let n = 0;
    const tick = () => {
      const cur = reduce ? goal : vis[n % vis.length];
      vis.forEach(li => li.classList.toggle('lm-lit', li === cur));
      die.textContent = FACES[n % 6];
      n++;
      if (n < steps) { setTimeout(tick, 40 + Math.pow(n / steps, 3) * 260); return; }
      goal.classList.add('lm-win');
      setTimeout(() => {
        vis.forEach(li => li.classList.remove('lm-lit', 'lm-win'));
        rolling = false;
        goal.querySelector('a').click();
      }, 750);
    };
    tick();
  };
})();
