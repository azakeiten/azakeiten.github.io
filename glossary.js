/* ================================================================
   glossary.js — 経済用語ミニ辞典：その場で絞りこむ検索
   ・ひらがな／カタカナのちがい、全角／半角のちがいは気にせずさがせる
   ================================================================ */
(function() {
  const input = document.getElementById('glSearch');
  if (!input) return;
  const items = [...document.querySelectorAll('.gl-item')];
  const groups = [...document.querySelectorAll('.gl-group')];
  const count = document.getElementById('glCount');
  const empty = document.getElementById('glEmpty');
  // カタカナ→ひらがな、全角英数→半角、小文字に
  const norm = s => s.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/\s+/g, '');
  // 読み（ひらがなでもさがせるように）
  const YOMI = {
    gdp: 'こくないそうせいさん じーでぃーぴー', fukakachi: 'ふかかち', inflation: 'いんふれ', deflation: 'でふれ', keiki: 'けいき',
    'supply-demand': 'じゅようときょうきゅう じゅよう きょうきゅう', market: 'しじょう いちば', 'opportunity-cost': 'きかいひよう', scale: 'きぼのけいざい',
    'central-bank': 'ちゅうおうぎんこう にほんぎんこう にちぎん', interest: 'きんり りそく がんぽん', 'monetary-policy': 'きんゆうせいさく', 'negative-rate': 'まいなすきんり',
    exchange: 'かわせ', yen: 'えんだか えんやす', bond: 'さいけん こくさい しゃさい', deposit: 'よきん',
    stock: 'かぶしき かぶ', shareholder: 'かぶぬし', dividend: 'はいとう', 'market-cap': 'じかそうがく', 'sales-profit': 'うりあげだか りえき',
    listing: 'じょうじょう とうしょう', index: 'かぶかしすう にっけいへいきん とぴっくす', 'risk-return': 'りすくとりたーん', diversify: 'ぶんさんとうし', portfolio: 'ぽーとふぉりお',
    'fiscal-policy': 'ざいせいせいさく', tax: 'ぜいきん しょうひぜい しょとくぜい ほうじんぜい', 'comparative-advantage': 'ひかくゆうい', 'free-trade': 'じゆうぼうえき かんぜい',
    gini: 'じにけいすう かくさ', engel: 'えんげるけいすう', unemployment: 'しつぎょうりつ',
    'invisible-hand': 'みえざるて あだむすみす', 'creative-destruction': 'そうぞうてきはかい', 'great-depression': 'せかいきょうこう', 'nixon-shock': 'にくそんしょっく',
    'plaza-accord': 'ぷらざごうい', lehman: 'りーまんしょっく', 'prisoners-dilemma': 'しゅうじんのじれんま', 'fallacy-composition': 'ごうせいのごびゅう せつやくのぱらどっくす'
  };
  const text = items.map(it => norm(it.textContent + ' ' + (YOMI[it.id] || '')));
  const total = items.length;
  const run = () => {
    const q = norm(input.value);
    let n = 0;
    items.forEach((it, i) => { const hit = !q || text[i].includes(q); it.hidden = !hit; if (hit) n++; });
    groups.forEach(g => { g.hidden = !g.querySelector('.gl-item:not([hidden])'); });
    count.textContent = q ? `${n} 語みつかりました` : `全 ${total} 語`;
    empty.hidden = n > 0;
  };
  input.addEventListener('input', run);
  run();
  // 「#gdp」のように言葉の場所へ飛んできたら、そこを光らせる
  const hl = () => { const t = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t && t.classList.contains('gl-item')) { t.classList.remove('is-hl'); void t.offsetWidth; t.classList.add('is-hl'); } };
  addEventListener('hashchange', hl); hl();
})();
