/* ================================================================
   bill3d.js — 文化祭ページ：3D で少し回る「オリジナル紙幣」（CSS 3D・ライブラリなし）
   ・ゆらゆら回り、押すと裏返る。マウスや指の位置で少し傾く
   ・実物をもとにしたイメージ（肖像の位置には AZAKEI の印）
   ================================================================ */
(function() {
  const host = document.querySelector('[data-bill3d]');
  if (!host) return;
  const star = `<svg class="b3-star" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 L90 73 L10 73 Z M50 96 L10 27 L90 27 Z" fill="#2f6b3a"/><circle cx="50" cy="50" r="21" fill="#f6efdc"/><text x="50" y="59" text-anchor="middle" font-family="Shippori Mincho, serif" font-weight="800" font-size="26" fill="#2f6b3a">経</text></svg>`;
  host.innerHTML = `
    <button type="button" class="b3-stage" aria-label="オリジナル紙幣を裏返す">
      <span class="b3-tilt"><span class="b3-bill">
        <span class="b3-face b3-front">
          <span class="b3-frame"></span>
          <span class="b3-welcome">Welcome</span>
          ${star}
          <span class="b3-title">麻経展</span>
          <span class="b3-medal"><b>AZA</b><b>KEI</b></span>
          <span class="b3-corner b3-tl">麻経</span><span class="b3-corner b3-br">麻経</span>
          <span class="b3-serial">No. 2026 · AZB</span>
        </span>
        <span class="b3-face b3-back">
          <span class="b3-frame"></span>
          <span class="b3-wave"></span>
          <span class="b3-back-title">AZABU ECONOMIC<br>EXHIBITION</span>
          <span class="b3-back-year">2026</span>
        </span>
      </span></span>
    </button>`;
  const stage = host.querySelector('.b3-stage'), bill = host.querySelector('.b3-bill'), tilt = host.querySelector('.b3-tilt');
  stage.addEventListener('click', () => bill.classList.toggle('is-flipped'));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const loop = () => {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    tilt.style.transform = `rotateX(${-cy * 12}deg) rotateY(${cx * 18}deg)`;
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
  };
  host.addEventListener('pointermove', e => { const r = host.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width) * 2 - 1; ty = ((e.clientY - r.top) / r.height) * 2 - 1; if (!raf) raf = requestAnimationFrame(loop); });
  host.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
})();
