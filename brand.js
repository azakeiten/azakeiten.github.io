/* ================================================================
   brand.js — AZAKEI のロゴマークと紋章（エンブレム）
   ロゴ：緑の六芒星（先端は2面に分かれる）× 白い六角形 × 緑の「経」
         角には小さな光（キラキラ）。
   2 種類：
     昼（.lm-day）  … 緑の面・濃い輪郭・白い六角形（明るい背景用）
     夜（.lm-night）… 光る緑の線だけ（ダークモード・写真の上用）
   使い方:
     <div data-emblem></div>      … 紋章（文字が回る丸いバッジ）
     <span data-logomark></span>  … ロゴマークだけ
   ================================================================ */
(function() {
  let uid = 0;
  const pt = (deg, r) => { const a = deg * Math.PI / 180; return [r * Math.cos(a), r * Math.sin(a)]; };
  const P = p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  const R = 46, RIN = R / Math.sqrt(3), MID = R / 2;   // 先端・内側の六角形・底辺の中点

  // 星の輪郭（12 点）
  const outline = [];
  for (let k = 0; k < 6; k++) outline.push(pt(-90 + 60 * k, R), pt(-60 + 60 * k, RIN));
  const outlineD = `M${outline.map(P).join('L')}Z`;
  const hexD = `M${[0,1,2,3,4,5].map(k => P(pt(-60 + 60 * k, RIN))).join('L')}Z`;

  // 小さな光（4 方向に伸びる星）
  const spark = (x, y, s, i) =>
    `<path class="lm-spark" style="--i:${i}" d="M${x},${y - s}Q${x},${y} ${x + s},${y}Q${x},${y} ${x},${y + s}Q${x},${y} ${x - s},${y}Q${x},${y} ${x},${y - s}Z"/>`;

  function logomark() {
    const id = 'azk' + (++uid);
    let facets = '', splits = '', sparks = '';
    for (let k = 0; k < 6; k++) {
      const a = -90 + 60 * k;
      const tip = pt(a, R), bl = pt(a - 30, RIN), br = pt(a + 30, RIN), m = pt(a, MID);
      facets += `<path d="M${P(tip)}L${P(bl)}L${P(m)}Z" fill="url(#${id}l)"/><path d="M${P(tip)}L${P(m)}L${P(br)}Z" fill="url(#${id}d)"/>`;
      splits += `M${P(tip)}L${P(m)}`;
    }
    outline.forEach((p, i) => { sparks += spark(p[0], p[1], i % 2 ? 3.2 : 4.2, i); });

    const kei = (cls) => `<text class="${cls}" y="9.6" text-anchor="middle" font-family="'Shippori Mincho', 'Yu Mincho', serif" font-weight="800" font-size="27">経</text>`;

    return `
      <defs>
        <linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#57a64f"/><stop offset="1" stop-color="#3b8a37"/></linearGradient>
        <linearGradient id="${id}d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3f8f3a"/><stop offset="1" stop-color="#2c702b"/></linearGradient>
        <filter id="${id}g" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g class="lm-day">
        ${facets}
        <path d="${splits}" stroke="#241a10" stroke-width="1.1" fill="none"/>
        <path d="${hexD}" fill="#fbf8ee" stroke="#241a10" stroke-width="1.2"/>
        <path d="${outlineD}" fill="none" stroke="#241a10" stroke-width="2.2" stroke-linejoin="miter"/>
        ${kei('lm-kei-day')}
      </g>
      <g class="lm-night" filter="url(#${id}g)">
        <path d="${outlineD}" fill="none" stroke="#6dff7c" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="${hexD}" fill="none" stroke="#6dff7c" stroke-width="0.9" opacity="0.8"/>
        ${kei('lm-kei-night')}
      </g>
      <g class="lm-sparks">${sparks}</g>`;
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
        <g class="em-mark" transform="translate(100 102) scale(1.2)">${logomark()}</g>
      </svg>`;
  }

  function markOnly() {
    return `<svg class="logomark" viewBox="-52 -52 104 104" role="img" aria-label="AZAKEI ロゴマーク">${logomark()}</svg>`;
  }

  window.AZAKEI_EMBLEM = emblem;
  // 後から追加された要素の中のロゴを描く
  window.AZAKEI_RENDER_MARKS = (scope = document) => {
    scope.querySelectorAll('[data-emblem]:empty').forEach(el => { el.innerHTML = emblem(); });
    scope.querySelectorAll('[data-logomark]:empty').forEach(el => { el.innerHTML = markOnly(); });
  };
  document.querySelectorAll('[data-emblem]').forEach(el => { el.innerHTML = emblem(); });
  document.querySelectorAll('[data-logomark]').forEach(el => { el.innerHTML = markOnly(); });
})();
