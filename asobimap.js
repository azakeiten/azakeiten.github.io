/* ================================================================
   asobimap.js — あそび場：「あそび場のきっぷ」（このページの 24 の遊びの地図）
   ・きっぷの形のカードで、すべての遊びへ。上に「遊んだ数」の輪と「次はこれ」
   ・なかま（クイズとゲーム／お金のしくみ／くらしと社会／つくる）で絞りこみ
   ・遊んだしるし：記録があるか、その遊びの中でボタンなどを押したら「済」のはんこ（このブラウザの中だけ。azakei_play_tried）
   ・自己ベストの記録がある遊びは、きっぷに記録を出す
   ================================================================ */
(function () {
  const board = document.querySelector('[data-asobimap]');
  if (!board) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_play_tried';
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  let tried = []; try { tried = JSON.parse(get(KEY) || '[]'); } catch (e) {}
  const items = [...board.children];
  const href = li => li.querySelector('a').getAttribute('href');
  const stamp = li => { const a = li.querySelector('a'); if (!a.querySelector('.am-done')) a.insertAdjacentHTML('beforeend', '<span class="am-done" aria-label="遊んだ">済</span>'); li.classList.add('is-done'); };
  items.forEach(li => {
    const a = li.querySelector('a');
    a.insertAdjacentHTML('afterbegin', '<i class="am-perf" aria-hidden="true"></i>');
    if (li.hasAttribute('data-new')) a.insertAdjacentHTML('beforeend', '<em class="am-new">新</em>');
    const s = a.querySelector('small[data-k]');
    if (s) {
      const v = get(s.dataset.k);
      if (v !== null && v !== '' && v !== '0' && v !== '[]') {
        stamp(li);
        if (s.dataset.u) { let n = 0; if ('len' in s.dataset) { try { n = JSON.parse(v).length; } catch (e) {} } else n = +v || 0; if (n) { s.textContent = `自己ベスト ${n.toLocaleString()} ${s.dataset.u}`; s.classList.add('is-rec'); } }
      }
    }
    if (tried.includes(href(li))) stamp(li);
    const sec = document.getElementById(href(li).slice(1));
    if (!sec) return;
    const mark = e => {
      if (e.target.closest('a[href]') || !e.target.closest('button, input, select, textarea, [role="button"], svg, label')) return;
      if (!tried.includes(href(li))) { tried.push(href(li)); try { localStorage.setItem(KEY, JSON.stringify(tried)); } catch (err) {} }
      stamp(li); refresh();
      sec.removeEventListener('click', mark, true); sec.removeEventListener('input', mark, true);
    };
    sec.addEventListener('click', mark, true); sec.addEventListener('input', mark, true);
  });

  const CATS = [['all', 'すべて'], ['game', 'クイズとゲーム'], ['money', 'お金のしくみ'], ['life', 'くらしと社会'], ['make', 'つくる']];
  const cnt = k => k === 'all' ? items.length : items.filter(li => li.dataset.cat === k).length;
  const R = 24, LEN = 2 * Math.PI * R;
  const head = document.createElement('div');
  head.className = 'am-head';
  head.innerHTML = `<div class="am-top"><p class="am-title"><span class="am-ticket" aria-hidden="true">券</span><b>あそび場のきっぷ</b><small>${items.length} の遊び。気になるものから、どうぞ。</small></p>
    <div class="am-prog"><svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="${R}" class="am-ring-bg"/><circle cx="30" cy="30" r="${R}" class="am-ring" style="stroke-dasharray:${LEN.toFixed(1)};stroke-dashoffset:${LEN.toFixed(1)}"/></svg><p><b data-am="n">0</b><small>/ ${items.length} 遊んだ</small></p></div>
    <a class="am-next" href="#" data-am="next"><small>次はこれ</small><span class="am-s" data-am="ns"></span><b data-am="nn"></b><i aria-hidden="true">→</i></a></div>
    <div class="am-chips" role="group" aria-label="遊びのなかま">${CATS.map(([k, t], i) => `<button type="button" data-c="${k}" aria-pressed="${i === 0}">${t}<small>${cnt(k)}</small></button>`).join('')}</div>`;
  board.before(head);
  const H = k => head.querySelector(`[data-am="${k}"]`);
  function refresh() {
    const done = items.filter(li => li.classList.contains('is-done')).length;
    H('n').textContent = done;
    head.querySelector('.am-ring').style.strokeDashoffset = (LEN * (1 - done / items.length)).toFixed(1);
    head.classList.toggle('is-all', done === items.length);
    const nx = items.find(li => li.hasAttribute('data-new') && !li.classList.contains('is-done')) || items.find(li => !li.classList.contains('is-done'));
    const a = H('next'); a.hidden = !nx;
    if (nx) { a.href = href(nx); H('ns').textContent = nx.querySelector('.am-s').textContent; H('nn').textContent = nx.querySelector('b').textContent; a.dataset.cat = nx.dataset.cat; }
  }
  refresh();
  head.addEventListener('click', e => {
    const c = e.target.closest('[data-c]'); if (!c) return;
    head.querySelectorAll('[data-c]').forEach(b => b.setAttribute('aria-pressed', b === c));
    items.forEach((li, i) => {
      const on = c.dataset.c === 'all' || li.dataset.cat === c.dataset.c;
      li.hidden = !on;
      if (on && !reduce) { li.classList.remove('is-in'); void li.offsetWidth; li.style.setProperty('--d', (i % 8) * 35 + 'ms'); li.classList.add('is-in'); }
    });
  });
})();
