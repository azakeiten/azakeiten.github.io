/* ================================================================
   newplay.js — トップ：新しく、遊べるもの（content.js の newPlay を横に並べる）
   ・前にトップへ来た日より新しいものに NEW。2 週間より古いものは「新しい」と言わない
   ================================================================ */
(function() {
  const box = document.querySelector('[data-newplay]');
  const list = window.AZAKEI && AZAKEI.newPlay;
  if (!box || !list || !list.length) return;
  let prev = 0; try { prev = +JSON.parse(localStorage.getItem('azakei-last-visit') || '0') || 0; } catch (e) {}
  const at = d => Date.parse(d + 'T00:00:00+09:00');
  const fresh = list.filter(p => Date.now() - at(p.date) < 14 * 864e5);
  if (!fresh.length) { box.closest('section').hidden = true; return; }
  const md = d => { const [, m, dd] = d.split('-'); return `${+m}/${+dd}`; };
  box.innerHTML = fresh.map(p => `<li><a class="npl-card is-${p.tone}" href="${p.href}">
      <span class="npl-seal" aria-hidden="true">${p.seal}</span>
      <span class="npl-meta"><span>${p.eyebrow}</span><time datetime="${p.date}">${md(p.date)}</time>${prev && at(p.date) > prev ? '<em>NEW</em>' : ''}</span>
      <b class="npl-title">${p.title}</b><span class="npl-text">${p.text}</span><span class="npl-go">遊んでみる</span></a></li>`).join('');
})();
