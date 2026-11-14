/* ================================================================
   steps3.js — トップ「親しんで、知って、つくる。」
   ・このブラウザに残っている記録から、それぞれの段で何かしたかを見て「済」の印をつける
   ================================================================ */
(function() {
  const box = document.querySelector('[data-steps3]');
  if (!box) return;
  const raw = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const has = k => { const v = raw(k); if (v === null || v === '' || v === '0' || v === '[]' || v === '{}') return false; return true; };
  const DONE = [
    ['azakei_quiz_best', 'azakei_card_best', 'azakei_cw_best', 'azakei_shiri_best', 'azakei_otsuri_best', 'azakei_room_tour'],
    ['azakei_gl_known', 'azakei_sim_run', 'azakei_np_best', 'azakei_gacha'],
    ['azakei_planseed', 'azakei_village']
  ];
  const MSG = ['遊んだ記録があります', '仕組みにふれた記録があります', 'つくった記録があります'];
  let last = -1;
  box.querySelectorAll(':scope > li').forEach((li, i) => {
    const ok = DONE[i].some(has);
    if (ok) { li.classList.add('is-done'); const p = li.querySelector('.st3-me'); p.textContent = MSG[i]; p.hidden = false; last = i; }
  });
  // つぎにおすすめの段（まだの段のうち、いちばん前）
  const next = [...box.querySelectorAll(':scope > li')].find(li => !li.classList.contains('is-done'));
  if (next && last >= 0) next.classList.add('is-next');
})();
