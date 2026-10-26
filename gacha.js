/* ================================================================
   gacha.js — 用語辞典：経済ことばガチャ（レバーを回すとカプセルが出て、言葉のカードが開く）
   ・辞典の言葉（.gl-item）から 1 つ。出会った言葉の数は、このブラウザの中にだけ残す
   ================================================================ */
(function() {
  const box = document.querySelector('[data-gacha]');
  const items = [...document.querySelectorAll('.gl-item')];
  if (!box || !items.length) return;
  const KEY = 'azakei_gacha';
  let met = []; try { met = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) {}
  // 分類ごとの色（カプセルの色）
  const COLOR = { 'g-basic': '#b08a4a', 'g-money': '#b5432f', 'g-company': '#2f6b3a', 'g-society': '#4a6a8a', 'g-history': '#6b4a22', 'g-life': '#d49a2a', 'g-biz': '#7a5aa0', 'g-world': '#2f7a8a', 'g-tech': '#555' };
  box.innerHTML = `
    <div class="ga-machine" aria-hidden="true">
      <div class="ga-dome">${Array.from({ length: 9 }, (_, i) => `<i style="--c:${Object.values(COLOR)[i]};--x:${(i % 3) * 30 + 8}%;--y:${Math.floor(i / 3) * 26 + 18}%"></i>`).join('')}</div>
      <div class="ga-body"><span class="ga-slot"></span><span class="ga-lever"></span></div>
      <span class="ga-cap"></span>
    </div>
    <div class="ga-side">
      <button type="button" class="btn-primary ga-turn">ガチャを回す</button>
      <p class="ga-count">出会った言葉 <b data-n>${met.length}</b> / ${items.length}</p>
      <div class="ga-card" aria-live="polite"></div>
    </div>`;
  const mach = box.querySelector('.ga-machine'), cap = box.querySelector('.ga-cap'), card = box.querySelector('.ga-card'), btn = box.querySelector('.ga-turn');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('is-lite');
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    btn.disabled = true;
    // まだ出会っていない言葉を優先
    const fresh = items.filter(it => !met.includes(it.id));
    const pool = fresh.length ? fresh : items;
    const it = pool[Math.random() * pool.length | 0];
    const grp = it.closest('.gl-group'), col = COLOR[grp && grp.id] || '#b08a4a';
    const isNew = !met.includes(it.id);
    cap.style.setProperty('--c', col);
    mach.classList.remove('is-turn'); void mach.offsetWidth; mach.classList.add('is-turn');
    card.innerHTML = '';
    setTimeout(() => {
      if (isNew) { met.push(it.id); try { localStorage.setItem(KEY, JSON.stringify(met)); } catch (e) {} }
      box.querySelector('[data-n]').textContent = met.length;
      const cat = grp ? grp.querySelector('.gl-head').firstChild.nextSibling.textContent.trim() : '';
      card.innerHTML = `<div class="ga-open" style="--c:${col}"><p class="ga-meta"><span>${cat}</span>${isNew ? '<em>NEW</em>' : '<small>もう出会った言葉</small>'}</p><p class="ga-word">${it.querySelector('dt').innerHTML}</p><p class="ga-def">${it.querySelector('dd').textContent.trim()}</p><a href="#${it.id}" class="ga-link">辞典で読む →</a></div>`;
      btn.disabled = false; btn.textContent = 'もう 1 回';
    }, reduce ? 0 : 1100);
  });
})();
