/* ================================================================
   live.js — 生きている経済の数字
   「今年1月1日から今までに、日本で生まれた付加価値（名目GDP・概算）」
   = 直近の年間名目GDP ÷ 1年の秒数 × 今年の経過秒数
   数字は content.js の liveEconomy で設定。
   ================================================================ */
(function() {
  const cfg = (window.AZAKEI || {}).liveEconomy;
  const box = document.querySelector('[data-live-econ]');
  if (!cfg || !box) return;

  const valueEl = box.querySelector('[data-live-value]');
  const perSecEl = box.querySelector('[data-live-persec]');
  const noteEl = box.querySelector('[data-live-note]');
  const yearEl = box.querySelector('[data-live-year]');

  const YEAR_SEC = 365 * 24 * 60 * 60;
  const perSec = cfg.annualYen / YEAR_SEC;

  // 日本時間の「今年1月1日 0:00」
  function startOfYearJST() {
    const now = new Date();
    const y = new Date(now.getTime() + 9 * 3600 * 1000).getUTCFullYear();
    return Date.UTC(y, 0, 1) - 9 * 3600 * 1000;
  }
  const start = startOfYearJST();

  perSecEl.textContent = '約' + Math.round(perSec / 10000).toLocaleString('ja-JP') + '万円';
  noteEl.textContent = '※ ' + cfg.source + 'を、1年に均して数えた概算です。';
  if (yearEl) yearEl.textContent = new Date(Date.now() + 9 * 3600 * 1000).getUTCFullYear();

  function tick() {
    const yen = (Date.now() - start) / 1000 * perSec;
    valueEl.firstChild.textContent = '¥' + Math.floor(yen).toLocaleString('ja-JP');
  }
  tick();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setInterval(() => { if (!document.hidden) tick(); }, reduce ? 1000 : 60);
})();
