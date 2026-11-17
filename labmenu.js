/* ================================================================
   labmenu.js — 経済ラボ：実験の地図（メニュー）
   ・上に「ためした数」の輪と、「次はこれ」のおすすめ
   ・なかま（data-cat）で絞りこみ。絞りこみはメニューの表示だけ（実験そのものは消さない）
   ・サイコロ：光がメニューをかけめぐって、1 つに止まる。まだ「済」のない実験を優先
   ・ためした印：実験の中で何か操作したら、その実験に「済」（このブラウザの中だけ。azakei_lab_tried）
     ※ クリアの条件がある実験は、site.js でも「済」がつく
   ================================================================ */
(function() {
  const board = document.querySelector('[data-lab-board]');
  if (!board) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_lab_tried';
  const items = [...board.children].filter(li => li.querySelector('a[href^="#"]') && li.querySelector('a').getAttribute('href') !== '#words');
  const href = li => li.querySelector('a').getAttribute('href');
  const cats = li => (li.dataset.cat || '').split(' ');
  const CATS = [['all', 'すべて'], ['money', 'お金をふやす・つかう'], ['biz', 'お店と会社'], ['world', '国と世界'], ['rule', 'みんなとルール'], ['game', 'ゲーム']];
  const count = k => k === 'all' ? items.length : items.filter(li => cats(li).includes(k)).length;

  // ---- ためした印 ----
  let tried = [];
  try { tried = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) {}
  const stamp = a => { if (!a.querySelector('.lb-done')) a.insertAdjacentHTML('beforeend', '<span class="lb-done" title="ためした">済</span>'); };
  items.forEach(li => {
    if (li.hasAttribute('data-new')) li.querySelector('a').insertAdjacentHTML('beforeend', '<em class="lb-new">新</em>');
    if (tried.includes(href(li))) stamp(li.querySelector('a'));
    const sec = document.getElementById(href(li).slice(1));
    if (!sec) return;
    const mark = e => {
      if (e.target.closest('a[href]')) return;            // ことばのリンクなどは数えない
      if (!e.target.closest('button, input, select, textarea, [role="button"], svg, label')) return;
      if (!tried.includes(href(li))) { tried.push(href(li)); try { localStorage.setItem(KEY, JSON.stringify(tried)); } catch (err) {} }
      stamp(li.querySelector('a'));
      sec.removeEventListener('click', mark, true); sec.removeEventListener('input', mark, true);
    };
    sec.addEventListener('click', mark, true); sec.addEventListener('input', mark, true);
  });

  // ---- 上の帯：ためした数・次はこれ・なかま・サイコロ ----
  const bar = document.createElement('div');
  bar.className = 'lm-bar';
  const R = 26, LEN = 2 * Math.PI * R;
  bar.innerHTML = `<div class="lm-head">
      <div class="lm-ring" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="${R}" class="lm-ring-bg"/><circle cx="32" cy="32" r="${R}" class="lm-ring-fg" style="stroke-dasharray:${LEN.toFixed(1)};stroke-dashoffset:${LEN.toFixed(1)}"/></svg><b data-lm="n">0</b></div>
      <p class="lm-count"><b data-lm="txt"></b><small data-lm="sub"></small></p>
      <a class="lm-next" href="#" data-lm="next"><small>次はこれ</small><span class="lb-seal" data-lm="nseal"></span><b data-lm="nname"></b><i aria-hidden="true">→</i></a>
    </div>
    <div class="lm-tools"><div class="lm-chips" role="group" aria-label="実験のなかま">${CATS.map(([k, t], i) => `<button type="button" data-cat="${k}" aria-pressed="${i === 0}">${t}<small>${count(k)}</small></button>`).join('')}</div>
    <button type="button" class="lm-dice"><span class="lm-die" aria-hidden="true">⚀</span>どれにしよう？</button></div>`;
  board.before(bar);
  const L = k => bar.querySelector(`[data-lm="${k}"]`);
  const refresh = () => {
    const done = items.filter(li => li.querySelector('.lb-done')).length, all = items.length;
    L('n').textContent = done;
    L('txt').textContent = done === all ? `${all} の実験を、ぜんぶためしました` : `${all} の実験のうち、${done} つをためしました`;
    L('sub').textContent = done === all ? '経済ラボ、制覇です。修了証もたしかめてみよう。' : done ? `のこり ${all - done} つ。` : 'どれからでも大丈夫。気になるものから押してみよう。';
    bar.querySelector('.lm-ring-fg').style.strokeDashoffset = (LEN * (1 - done / all)).toFixed(1);
    bar.classList.toggle('is-all', done === all);
    const nx = items.find(li => li.hasAttribute('data-new') && !li.querySelector('.lb-done')) || items.find(li => !li.querySelector('.lb-done'));
    const a = L('next');
    a.hidden = !nx;
    if (nx) { const s = nx.querySelector('.lb-seal'); a.href = href(nx); L('nseal').textContent = s.textContent; L('nseal').className = s.className; L('nname').textContent = nx.querySelector('b').textContent; }
  };
  refresh();
  new MutationObserver(refresh).observe(board, { childList: true, subtree: true });

  bar.addEventListener('click', e => {
    const c = e.target.closest('[data-cat]');
    if (c) {
      const k = c.dataset.cat;
      bar.querySelectorAll('[data-cat]').forEach(b => b.setAttribute('aria-pressed', b === c));
      items.forEach((li, i) => {
        const on = k === 'all' || cats(li).includes(k);
        li.classList.toggle('lm-hide', !on);
        if (on && !reduce) { li.classList.remove('lm-in'); void li.offsetWidth; li.style.setProperty('--d', (i % 8) * 30 + 'ms'); li.classList.add('lm-in'); }
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
    // 光がメニューを順にめぐり、だんだんゆっくりになって止まる
    const steps = reduce ? 1 : vis.length * 2 + vis.indexOf(goal) + 1;
    let n = 0;
    const tick = () => {
      const cur = reduce ? goal : vis[n % vis.length];
      vis.forEach(li => li.classList.toggle('lm-lit', li === cur));
      die.textContent = FACES[n % 6];
      n++;
      if (n < steps) { setTimeout(tick, 30 + Math.pow(n / steps, 3) * 260); return; }
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
