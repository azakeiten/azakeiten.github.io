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
    const progress = Math.max(0, Math.min(1, scrolled / total));

    // 進捗バー更新
    if (progressFill) progressFill.style.height = (progress * 100) + '%';
    
    // 背景パララックス
    if (heroBg) {
      heroBg.style.transform = `scale(1.04) translateY(${progress * viewH * 0.18}px)`;
    }

    // スクロール進捗に合わせたテキスト表示タイミング（2行版）
    if (progress >= 0.00) trigger(heroLabel);
    if (progress >= 0.15) triggerLine(0); // 1行目：経済とエンタメが
    if (progress >= 0.35) triggerLine(1); // 2行目：交差する。
    if (progress >= 0.60) trigger(heroSub);
    if (progress >= 0.80) trigger(heroActions);
  }

  // 初期ロード時
  window.addEventListener('DOMContentLoaded', () => { 
    trigger(heroLabel); 
    onHeroScroll();
  });
  
  window.addEventListener('scroll', onHeroScroll, { passive: true });
})();