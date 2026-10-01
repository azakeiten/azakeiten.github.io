/* ================================================================
   brand.js — AZAKEI のロゴマークと紋章（エンブレム）
   ロゴマーク：金の円 × 緑の六芒星 × 白い「経」
   紋章：ロゴマークの周りを AZAKEI · AZABU ECONOMICS · EST. 2025 が回る
   使い方:
     <div data-emblem></div>  … 紋章（文字が回る丸いバッジ）
     <span data-logomark></span> … ロゴマークだけ
   ================================================================ */
(function() {
  let uid = 0;
  const f = n => n.toFixed(2);
  const pt = (deg, r) => { const a = deg * Math.PI / 180; return [r * Math.cos(a), r * Math.sin(a)]; };
  const P = p => `${f(p[0])},${f(p[1])}`;

  // 中心 (0,0)・半径 50 のロゴマーク
  function logomark() {
    const id = 'azk' + (++uid);
    const R = 40, rin = R / Math.sqrt(3), mid = R / 2;
    let facets = '';
    // 星の6つの先端：左右で明暗を変えて立体感を出す
    for (let k = 0; k < 6; k++) {
      const a = -90 + 60 * k;
      const tip = pt(a, R), bl = pt(a - 30, rin), br = pt(a + 30, rin), m = pt(a, mid);
      facets += `<path d="M${P(tip)}L${P(bl)}L${P(m)}Z" fill="#45a852"/>`;
      facets += `<path d="M${P(tip)}L${P(m)}L${P(br)}Z" fill="#1f7a31"/>`;
    }
    // 中央の六角形：6つの三角形を交互の色で
    for (let k = 0; k < 6; k++) {
      const a = pt(-60 + 60 * k, rin), b = pt(60 * k, rin);
      facets += `<path d="M0,0L${P(a)}L${P(b)}Z" fill="${k % 2 ? '#2b8e3c' : '#33994a'}"/>`;
    }
    // 星の輪郭
    const outline = [];
    for (let k = 0; k < 6; k++) { outline.push(pt(-90 + 60 * k, R), pt(-60 + 60 * k, rin)); }
    return `
      <defs>
        <radialGradient id="${id}g" cx="40%" cy="35%" r="70%">
          <stop offset="0" stop-color="#fff2b0"/><stop offset="0.45" stop-color="#f3c63a"/><stop offset="1" stop-color="#c8920f"/>
        </radialGradient>
      </defs>
      <circle r="48" fill="url(#${id}g)" stroke="#9c6f0c" stroke-width="1.4"/>
      <circle r="44.5" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="0.8"/>
      <g stroke="#164d21" stroke-width="0.6" stroke-linejoin="round">${facets}</g>
      <path d="M${outline.map(P).join('L')}Z" fill="none" stroke="#164d21" stroke-width="1.6" stroke-linejoin="round"/>
      <text y="9.5" text-anchor="middle" font-family="'Shippori Mincho', 'Yu Mincho', serif" font-weight="800" font-size="27"
            fill="#fff" stroke="#164d21" stroke-width="1.6" paint-order="stroke" stroke-linejoin="round">経</text>`;
  }

  function emblem() {
    const id = 'emblem-path-' + (++uid);
    return `
      <svg class="emblem" viewBox="0 0 200 200" role="img" aria-label="AZAKEI のエンブレム">
        <defs><path id="${id}" d="M100,100 m-79,0 a79,79 0 1,1 158,0 a79,79 0 1,1 -158,0"/></defs>
        <circle class="em-ring" cx="100" cy="100" r="96"/>
        <circle class="em-ring em-thin" cx="100" cy="100" r="64"/>
        <g class="em-spin">
          <text class="em-text" textLength="492" lengthAdjust="spacing"><textPath href="#${id}">AZAKEI · AZABU ECONOMICS · EST. 2025 ·</textPath></text>
        </g>
        <g class="em-mark" transform="translate(100 100) scale(1.13)">${logomark()}</g>
      </svg>`;
  }

  function markOnly() {
    return `<svg class="logomark" viewBox="-50 -50 100 100" role="img" aria-label="AZAKEI ロゴマーク">${logomark()}</svg>`;
  }

  window.AZAKEI_EMBLEM = emblem;
  document.querySelectorAll('[data-emblem]').forEach(el => { el.innerHTML = emblem(); });
  document.querySelectorAll('[data-logomark]').forEach(el => { el.innerHTML = markOnly(); });
})();
