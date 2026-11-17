/* ================================================================
   curtain.js — ページ移動の「幕」を、いちばん先に用意して上げる
   ・前のページから幕で移動してきたら、本文が読みこまれた直後に幕を上げる
   ・以前は site.js（いちばん最後に読む）で上げていたため、スクリプトの多いページ
     （用語辞典など）では、暗い画面 → 本文が一瞬 → 幕がもう一度出る、という乱れが起きていた
   ・幕のかたちと動き（CSS）は site.css。クリックで幕を下ろすのは site.js
   ================================================================ */
(function () {
  if (document.querySelector('.curtain')) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var c = document.createElement('div');
  c.className = 'curtain';
  c.setAttribute('aria-hidden', 'true');
  c.innerHTML = '<span class="curtain-inner">AZAKEI<span class="curtain-seal">麻経</span></span>';
  document.body.appendChild(c);
  var arrived = false;
  try { arrived = !!sessionStorage.getItem('azakei-curtain'); sessionStorage.removeItem('azakei-curtain'); } catch (e) {}
  if (arrived && !document.getElementById('loader') && !reduce) {
    document.body.classList.add('has-curtain');
    c.classList.add('is-out');
  }
  document.documentElement.classList.remove('curtain-pending');
})();
