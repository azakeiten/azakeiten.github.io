/* ================================================================
   loader.js — ローディング画面（v30：短く。同じ日に 2 回目以降は出さない）
   ================================================================ */
(function() {
  const loader   = document.getElementById('loader');
  const brand    = document.getElementById('loader-brand');
  const progress = document.getElementById('loader-progress');
  if (!loader) return;

  let seen = false;
  try { seen = !!sessionStorage.getItem('azakei-loaded'); sessionStorage.setItem('azakei-loaded', '1'); } catch (e) {}
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    loader.style.display = 'none';
    return;
  }

  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    brand.classList.add('show');
    progress.style.width = '100%';
  }, 30);
  setTimeout(() => {
    brand.classList.remove('show');
    brand.classList.add('fade-out');
    loader.classList.add('hide');
    setTimeout(() => {
      loader.style.display = 'none';
      document.body.style.overflow = '';
    }, 260);
  }, 520);
})();
