/* ================================================================
   reveal.js — スクロール時の要素フェードイン（IntersectionObserver）
   ================================================================ */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0, rootMargin: '0px 0px -8% 0px' });   // 背の高い要素でも、少し見えたら出す
revealEls.forEach(el => io.observe(el));
