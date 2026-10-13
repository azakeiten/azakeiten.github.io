/* ================================================================
   chip3d.js — トップの入口に「立体のチップの山」（CSS 3D・ライブラリなし）
   ・ゆっくり回る山の上で、いちばん上の 1 枚がときどき跳ねて回る（賭けるイメージ）
   ・マウスや指の位置で、山が少し傾く
   ================================================================ */
(function() {
  const host = document.querySelector('[data-chip3d]');
  if (!host) return;
  // 下から順に：黒板・金・緑・朱・金・朱（いちばん上は跳ねる 1 枚）
  const COLORS = [['#1c2b23', '#e3c68e'], ['#b08a4a', '#fffaf0'], ['#2f6b3a', '#fffaf0'], ['#b5432f', '#fffaf0'], ['#b08a4a', '#fffaf0'], ['#b5432f', '#fffaf0']];
  const LAYERS = 8, GAP = 13;   // 1 枚の厚み（層の数）と、山の 1 段の高さ
  const chip = ([c, spot], i, top) => {
    let layers = '';
    for (let k = 0; k < LAYERS; k++) layers += `<i class="c3-l" style="transform: translateZ(${k * 1.4}px)"></i>`;
    return `<div class="c3-chip${top ? ' c3-top' : ''}" style="--c:${c};--s:${spot};--z:${i * GAP}px;--r:${(i * 37) % 360}deg">${layers}<b class="c3-face c3-back"></b><b class="c3-face c3-front"><span>経</span></b></div>`;
  };
  host.innerHTML = `<div class="c3-stage"><div class="c3-tilt"><div class="c3-stack">${COLORS.map((c, i) => chip(c, i, i === COLORS.length - 1)).join('')}</div></div></div><div class="c3-shadow"></div>`;

  // 傾き：マウス／指の位置（動きを減らす設定のときは、しない）
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const tilt = host.querySelector('.c3-tilt');
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const loop = () => {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    tilt.style.transform = `rotateX(${58 - cy * 14}deg) rotateY(${cx * 16}deg)`;
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
  };
  const aim = (x, y) => { tx = Math.max(-1, Math.min(1, x)); ty = Math.max(-1, Math.min(1, y)); if (!raf) raf = requestAnimationFrame(loop); };
  addEventListener('pointermove', e => aim(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1), { passive: true });
  // スマホ：スクロールに合わせて少し起き上がる
  addEventListener('scroll', () => { const r = host.getBoundingClientRect(); aim(tx, Math.max(-1, Math.min(1, (r.top / innerHeight - 0.3) * 2))); }, { passive: true });
})();
