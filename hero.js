/* ================================================================
   hero.js — ヒーロースクロールシーケンス（2行タイトル対応）
   ================================================================ */
(function() {
  const heroWrap    = document.querySelector('.hero-sticky-wrap');
  const heroBg      = document.getElementById('heroBg');
  const heroLabel   = document.getElementById('heroLabel');
  const heroLines   = [
    document.getElementById('heroLine0'),
    document.getElementById('heroLine1')
  ];
  const heroSub     = document.getElementById('heroSub');
  const heroActions = document.getElementById('heroActions');
  const progressFill= document.getElementById('heroProgressFill');

  function trigger(el)      { if (el) el.classList.add('in'); }
  function triggerLine(idx) { if (heroLines[idx]) heroLines[idx].classList.add('in'); }

  function onHeroScroll() {
    if (!heroWrap) return;
    const rect     = heroWrap.getBoundingClientRect();
    const wrapH    = heroWrap.offsetHeight;
    const viewH    = window.innerHeight;
    const scrolled = -rect.top;
    const total    = wrapH - viewH;
    
    // 進捗率 0.0 ～ 1.0
    const progress = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : Math.max(0, Math.min(1, scrolled / viewH));

    // 進捗バー更新
    if (progressFill) progressFill.style.height = (progress * 100) + '%';
    
    // 背景パララックス
    if (heroBg) {
      heroBg.style.transform = `scale(1.04) translateY(${progress * viewH * 0.18}px)`;
    }

  }

  // v30：スクロールを待たずに、開いてすぐ順番に表示（ローダーが出るときはその後）
  window.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const wait = loader && loader.style.display !== 'none' ? 700 : 80;
    [() => trigger(heroLabel), () => triggerLine(0), () => triggerLine(1), () => trigger(heroSub), () => trigger(heroActions)]
      .forEach((fn, i) => setTimeout(fn, wait + i * 110));
    onHeroScroll();
  });
  
  window.addEventListener('scroll', onHeroScroll, { passive: true });
})();