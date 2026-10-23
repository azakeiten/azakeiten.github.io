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

  // お札マンを押すと、お金の豆知識をひとつ（文字が 1 つずつ出てくる）。ぜんぶ聞くと、ひみつのバッジ
  const MAME = [
    '一万円札の顔は、2024 年から渋沢栄一。日本で最初の銀行づくりにかかわった人だよ。',
    'お札は「日本銀行券」。日本銀行が発行しているんだ。硬貨は、国（政府）が発行しているよ。',
    '1 円玉の重さは、ちょうど 1 グラム。だから、はかりのチェックにも使えるんだって。',
    '日本の硬貨は 1・5・10・50・100・500 円の 6 種類。穴があいているのは、5 円と 50 円だね。',
    '2024 年の新しいお札には、角度を変えると肖像が回って見える 3D ホログラムがついているよ。',
    '「円」が日本のお金の単位になったのは、1871 年の「新貨条例」から。150 年以上前だね。',
    '日経平均は、日本を代表する 225 社の株価をもとにした数字。ニュースで毎日出てくるよ。',
    '消費税は 1989 年に 3％で始まったんだ。いまは 10％（食べものなどは 8％）だね。',
    '「72 の法則」：72 を年利で割ると、お金が 2 倍になるまでの年数の目安になるよ。6％なら 12 年！',
    '世界で最初の株式会社は、1602 年にできたオランダ東インド会社だといわれているよ。',
    'お札は使ううちに傷むから、古くなったものは日本銀行で新しいものに入れかえられているんだ。',
    '「インフレ」は、ものの値段が全体に上がっていくこと。同じ 100 円で買える量が減るんだ。'
  ];
  const KEY = 'azakei_mame';
  const typeIn = (el, text) => {
    clearInterval(el._t);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('is-lite')) { el.textContent = text; return; }
    let i = 0; el.textContent = '';
    el._t = setInterval(() => { i += 1; el.textContent = text.slice(0, i); if (i >= text.length) clearInterval(el._t); }, 28);
  };
  const talk = man => {
    const box = man.closest('.osatsu'), bubble = box && box.querySelector('.os-bubble');
    if (!bubble) return;
    // 仮装している季節は、最初の 1 回だけ季節のあいさつ
    const SEASON = { halloween: 'ハロウィンだから、かぼちゃの帽子をかぶってみたよ。似合う？ もう一度押すと、お金の豆知識を話すね。', xmas: 'メリークリスマス！ サンタの帽子をかぶってみたよ。もう一度押すと、お金の豆知識を話すね。', newyear: 'あけましておめでとう！ 今年もよろしくね。もう一度押すと、お金の豆知識を話すね。' };
    if (ACC && !talk.greeted) { talk.greeted = true; box.classList.remove('is-talk'); void box.offsetWidth; box.classList.add('is-talk'); typeIn(bubble, SEASON[ACC[0]]); return; }
    let seen = []; try { seen = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) {}
    const rest = MAME.map((_, i) => i).filter(i => !seen.includes(i));
    const pick = (rest.length ? rest : MAME.map((_, i) => i))[Math.random() * (rest.length || MAME.length) | 0];
    if (!seen.includes(pick)) seen.push(pick);
    try { localStorage.setItem(KEY, JSON.stringify(seen)); } catch (e) {}
    box.classList.remove('is-talk'); void box.offsetWidth; box.classList.add('is-talk');
    bubble.classList.add('is-mame');
    bubble.setAttribute('data-count', `豆知識 ${Math.min(seen.length, MAME.length)} / ${MAME.length}`);
    typeIn(bubble, MAME[pick]);
  };
  // 季節の仮装（日本時間の日付で自動）：ハロウィンはかぼちゃ帽子、クリスマスはサンタ帽、お正月は「賀」の印
  const jst = new Date(Date.now() + 9 * 3600e3), md = (jst.getUTCMonth() + 1) * 100 + jst.getUTCDate();
  const ACC = md >= 1024 && md <= 1031 ? ['halloween', '<g class="os-acc"><path d="M60 13c-2-4-1-8 3-9" stroke="#2f6b3a" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="60" cy="24" rx="19" ry="12" fill="#e08a2c" stroke="#6b4a22" stroke-width="2"/><path d="M52 14q-4 10 0 20M68 14q4 10 0 20M60 12v24" stroke="#b5662a" stroke-width="1.6" fill="none"/></g>']
    : md >= 1218 && md <= 1225 ? ['xmas', '<g class="os-acc"><path d="M38 31 Q52 2 82 12 L80 31 Z" fill="#c8392b" stroke="#6b4a22" stroke-width="2" stroke-linejoin="round"/><rect x="34" y="27" width="50" height="8" rx="4" fill="#fffaf0" stroke="#6b4a22" stroke-width="1.6"/><circle cx="84" cy="12" r="5" fill="#fffaf0" stroke="#6b4a22" stroke-width="1.6"/></g>']
    : md >= 101 && md <= 107 ? ['newyear', '<g class="os-acc"><circle cx="100" cy="20" r="12" fill="#b5432f" stroke="#fffaf0" stroke-width="2"/><text x="100" y="25" font-family="Shippori Mincho, serif" font-weight="800" font-size="13" fill="#fffaf0" text-anchor="middle">賀</text></g>']
    : null;
  const dress = () => { if (!ACC) return; document.querySelectorAll('.os-svg:not(.is-dressed)').forEach(s => { s.classList.add('is-dressed', 'is-' + ACC[0]); s.insertAdjacentHTML('beforeend', ACC[1]); }); };
  dress();
  const prep = () => document.querySelectorAll('.os-man:not([tabindex])').forEach(m => { dress(); m.setAttribute('role', 'button'); m.setAttribute('tabindex', '0'); m.setAttribute('aria-label', 'お札マンに豆知識を聞く'); m.title = '押すと、お金の豆知識'; });
  prep();
  new MutationObserver(prep).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', e => { const m = e.target.closest('.os-man'); if (m) talk(m); });
  document.addEventListener('keydown', e => { const m = e.target.closest && e.target.closest('.os-man'); if (m && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); talk(m); } });
  window.AZAKEI_MAME_TOTAL = MAME.length;
})();
