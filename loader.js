/* ================================================================
   loader.js — ローディング画面のアニメーション制御
   ================================================================ */
(function() {
  const loader   = document.getElementById('loader');
  const brand    = document.getElementById('loader-brand');
  const progress = document.getElementById('loader-progress');

  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    brand.classList.add('show');
    progress.style.width = '100%';
  }, 50);

  setTimeout(() => {
    brand.classList.remove('show');
    brand.classList.add('fade-out');

    setTimeout(() => {
      loader.classList.add('hide');
      setTimeout(() => {
        loader.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    }, 400);
  }, 750);
})();
