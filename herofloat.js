/* ================================================================
   herofloat.js — トップの一番最初の画面：奥行きのあるチップと紙幣が浮かぶ（CSS 3D・ライブラリなし）
   ・文字にかからないよう、画面の右側と上のすみに置く。マウスやスクロールで、奥行きに合わせてずれる
   ・動きを減らす設定のときは、止まった絵にする
   ================================================================ */
(function() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const small = innerWidth < 760;
  // [左 %, 上 %, 大きさ px, 奥行き 0〜1, 色, 模様, 傾き X, 傾き Y]
  const CHIPS = small ? [
    [70, 13, 54, 0.9, '#b5432f', '#fffaf0', 64, -20], [86, 25, 36, 0.5, '#b08a4a', '#fffaf0', 40, 30], [58, 6, 28, 0.3, '#2f6b3a', '#fffaf0', 70, 10]
  ] : [
    [70, 15, 92, 1.0, '#b5432f', '#fffaf0', 62, -22], [89, 24, 66, 0.7, '#b08a4a', '#fffaf0', 38, 28], [72, 68, 58, 0.55, '#2f6b3a', '#fffaf0', 70, -8],
    [92, 74, 40, 0.35, '#1c2b23', '#e3c68e', 55, 40], [60, 82, 34, 0.3, '#b08a4a', '#fffaf0', 30, -35], [95, 13, 30, 0.25, '#2f6b3a', '#fffaf0', 72, 18]
  ];
  const chip = ([l, t, s, d, c, sp, rx, ry], i) => {
    let layers = ''; for (let k = 0; k < 6; k++) layers += `<i style="transform:translateZ(${k * s * 0.018}px)"></i>`;
    return `<span class="hf-item hf-chip" style="left:${l}%;top:${t}%;--s:${s}px;--d:${d};--c:${c};--sp:${sp};--rx:${rx}deg;--ry:${ry}deg;--dl:${-i * 1.3}s;--dur:${7 + i * 1.7}s"><span class="hf-spin">${layers}<b style="transform:translateZ(${6 * s * 0.018}px)"><em>経</em></b></span></span>`;
  };
  const bill = small ? '' : `<span class="hf-item hf-bill" style="left:78%;top:44%;--s:150px;--d:0.8;--rx:24deg;--ry:-30deg;--dl:-2s;--dur:11s"><span class="hf-spin"><b><span class="hf-b-w">Welcome</span><span class="hf-b-star">経</span><span class="hf-b-t">麻経展</span><span class="hf-b-m">AZA<br>KEI</span></b></span></span>`;
  const layer = document.createElement('div');
  layer.className = 'hf'; layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = CHIPS.map(chip).join('') + bill;
  const bg = hero.querySelector('.hero-bg');
  bg ? bg.after(layer) : hero.prepend(layer);

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { layer.classList.add('is-still'); return; }
  const items = [...layer.querySelectorAll('.hf-item')];
  let mx = 0, my = 0, cx = 0, cy = 0, sy = 0, raf = 0;
  const loop = () => {
    cx += (mx - cx) * 0.06; cy += (my - cy) * 0.06;
    items.forEach(el => { const d = +getComputedStyle(el).getPropertyValue('--d'); el.style.translate = `${cx * d * 28}px ${cy * d * 20 - sy * d * 0.35}px`; });
    raf = Math.abs(mx - cx) + Math.abs(my - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; kick(); }, { passive: true });
  addEventListener('scroll', () => { sy = Math.min(scrollY, innerHeight); kick(); cx += 0.0031; }, { passive: true });
})();
