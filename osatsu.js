/* ================================================================
   osatsu.js — 案内役「お札マン」（文化祭の飾りつけ計画書に出てくる公式キャラクター）
   ・<div data-osatsu="ふきだしの言葉"></div> を置くと、お札マンと、ふきだしが出る
   ・data-osatsu-side="right" で、お札マンを右に
   ・イラストはサイト用に描いたもの（まばたき・手をふる）
   ================================================================ */
(function() {
  const SVG = `<svg class="os-svg" viewBox="0 0 120 112" aria-hidden="true">
    <g class="os-legs" stroke="#6b4a22" stroke-width="3.5" stroke-linecap="round"><path d="M50 76 L46 96"/><path d="M70 76 L74 96"/></g>
    <ellipse cx="44" cy="98" rx="7" ry="3.5" fill="#6b4a22"/><ellipse cx="76" cy="98" rx="7" ry="3.5" fill="#6b4a22"/>
    <g class="os-arm-l"><path d="M22 54 L8 62" stroke="#6b4a22" stroke-width="3.5" stroke-linecap="round"/><circle cx="7" cy="63" r="4.5" fill="#fffaf0" stroke="#6b4a22" stroke-width="2"/></g>
    <g class="os-arm-r"><path d="M98 52 L111 38" stroke="#6b4a22" stroke-width="3.5" stroke-linecap="round"/><circle cx="112" cy="36" r="4.5" fill="#fffaf0" stroke="#6b4a22" stroke-width="2"/></g>
    <rect x="20" y="28" width="80" height="50" rx="7" fill="#e6d5b3" stroke="#6b4a22" stroke-width="3"/>
    <rect x="26" y="34" width="68" height="38" rx="3" fill="none" stroke="#6b4a22" stroke-width="1.4" opacity=".6"/>
    <g fill="#2f6b3a"><polygon points="35,37 41,47 29,47"/><polygon points="35,50 29,40 41,40"/></g>
    <g class="os-eyes" fill="#2a2015"><ellipse cx="54" cy="50" rx="3.6" ry="4.2"/><ellipse cx="72" cy="50" rx="3.6" ry="4.2"/></g>
    <circle cx="48" cy="59" r="4.2" fill="#f0957c" opacity=".55"/><circle cx="78" cy="59" r="4.2" fill="#f0957c" opacity=".55"/>
    <path d="M57 58 Q63 64 69 58" fill="none" stroke="#2a2015" stroke-width="2.4" stroke-linecap="round"/>
    <text x="88" y="70" font-family="Shippori Mincho, serif" font-weight="800" font-size="9" fill="#b5432f" text-anchor="middle">経</text>
  </svg>`;
  // ほかのスクリプトからも呼べるように（気分：happy＝はねる／sad＝しょんぼり）
  window.AZAKEI_OSATSU = (msg, mood) => `<div class="osatsu${mood ? ' is-' + mood : ''}"><span class="os-man" title="お札マン">${SVG}<small>お札マン</small></span><p class="os-bubble">${msg}</p></div>`;
  document.querySelectorAll('[data-osatsu]').forEach(el => {
    const msg = el.getAttribute('data-osatsu');
    el.classList.add('osatsu');
    if (el.dataset.osatsuSide === 'right') el.classList.add('is-right');
    el.innerHTML = `<span class="os-man" title="お札マン">${SVG}<small>お札マン</small></span><p class="os-bubble">${msg}</p>`;
  });
})();
