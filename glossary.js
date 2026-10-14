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
  const text = items.map(it => norm(it.textContent + ' ' + (YOMI[it.id] || '') + ' ' + (it.dataset.yomi || '')));
  const total = items.length;
  const run = () => {
    const q = norm(input.value);
    let n = 0;
    items.forEach((it, i) => { const hit = !q || text[i].includes(q); it.hidden = !hit; if (hit) n++; });
    groups.forEach(g => { g.hidden = !g.querySelector('.gl-item:not([hidden])'); });
    count.textContent = q ? `${n} 語みつかりました` : `全 ${total} 語`;
    empty.hidden = n > 0;
  };
  const q0 = new URLSearchParams(location.search).get('q'); if (q0) input.value = q0;
  input.addEventListener('input', run);
  run();
  // 「#gdp」のように言葉の場所へ飛んできたら、そこを光らせる
  const hl = () => { const t = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t && t.classList.contains('gl-item')) { t.classList.remove('is-hl'); void t.offsetWidth; t.classList.add('is-hl'); } };
  addEventListener('hashchange', hl); hl();
  // 今日のことば：日付で 1 語えらぶ（同じ日はだれが見ても同じ言葉）
  const today = document.getElementById('glToday');
  if (today && items.length) {
    const d = new Date(), wd = '日月火水木金土'[d.getDay()];
    const dayNo = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5));
    let pick = dayNo % items.length;
    const draw = () => {
      const it = items[pick];
      today.innerHTML = `<div class="gt-cal" aria-hidden="true"><span class="gt-m">${d.getMonth() + 1}月</span><b class="gt-d">${d.getDate()}</b><span class="gt-w">${wd}曜日</span></div>
        <div class="gt-body"><p class="gt-label">${pick === dayNo % items.length ? '今日のことば' : 'もう 1 枚めくると'}</p><h2 class="gt-term">${it.querySelector('dt').innerHTML}</h2><p class="gt-def">${it.querySelector('dd').innerHTML}</p>
        <div class="gt-actions"><a href="#${it.id}">辞典で見る</a><button type="button" class="gt-next">ほかのことばをめくる</button></div></div>`;
      today.querySelector('.gt-next').addEventListener('click', () => { pick = (pick + 1 + Math.floor(Math.random() * (items.length - 1))) % items.length; draw(); today.querySelector('.gt-next').focus(); });
    };
    draw(); today.hidden = false;
  }
  // 単語カード：表に言葉、押すと 3D でめくれて説明。「覚えた」はこのブラウザにだけ残す
  const deck = document.getElementById('glCards');
  if (deck && items.length) {
    const KEY = 'azakei_gl_known';
    let known = new Set();
    try { known = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) {}
    const saveKnown = () => { try { localStorage.setItem(KEY, JSON.stringify([...known])); } catch (e) {} };
    const mark = () => items.forEach(it => it.classList.toggle('is-known', known.has(it.id)));
    const groupsOf = [{ id: '', name: 'すべて' }].concat(groups.map(g => ({ id: g.id, name: g.querySelector('.gl-head').textContent.replace(/^\d+/, '') })));
    let pool = [], idx = 0, cat = '';
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const makePool = () => {
      const src = items.filter(it => !cat || it.closest('.gl-group').id === cat);
      const rest = src.filter(it => !known.has(it.id));
      pool = shuffle(rest.length ? rest : src.slice()); idx = 0;
    };
    deck.innerHTML = `
      <div class="gc-head">
        <p class="gc-title"><span class="gc-seal" aria-hidden="true">覚</span>単語カードで覚える</p>
        <p class="gc-progress"><b class="gc-n">0</b> / ${items.length} 語 覚えた<span class="gc-bar"><i></i></span></p>
      </div>
      <div class="gc-cats" role="group" aria-label="分類をえらぶ">${groupsOf.map(g => `<button type="button" data-cat="${g.id}" aria-pressed="${g.id === '' ? 'true' : 'false'}">${g.name}</button>`).join('')}</div>
      <button type="button" class="gc-card" aria-live="polite"><span class="gc-inner"><span class="gc-face gc-front"><small class="gc-cat"></small><b class="gc-term"></b><em>押すと、うらへ</em></span><span class="gc-face gc-back"><b class="gc-term2"></b><span class="gc-def"></span></span></span></button>
      <div class="gc-actions"><button type="button" class="gc-again">もう一回</button><button type="button" class="gc-ok">覚えた</button></div>
      <p class="gc-done" hidden></p>`;
    const card = deck.querySelector('.gc-card'), nEl = deck.querySelector('.gc-n'), bar = deck.querySelector('.gc-bar i'), done = deck.querySelector('.gc-done');
    const progress = () => { nEl.textContent = known.size; bar.style.width = (known.size / items.length * 100) + '%'; mark(); };
    const show = () => {
      card.classList.remove('is-flipped');
      if (idx >= pool.length) makePool();
      const it = pool[idx];
      const allKnown = items.filter(x => !cat || x.closest('.gl-group').id === cat).every(x => known.has(x.id));
      done.hidden = !allKnown; done.textContent = allKnown ? 'この分類の言葉は、ぜんぶ覚えました！ もう一度、復習してみよう。' : '';
      deck.querySelector('.gc-cat').textContent = it.closest('.gl-group').querySelector('.gl-head').textContent.replace(/^\d+/, '');
      deck.querySelector('.gc-term').innerHTML = deck.querySelector('.gc-term2').innerHTML = it.querySelector('dt').innerHTML;
      deck.querySelector('.gc-def').innerHTML = it.querySelector('dd').innerHTML;
    };
    card.addEventListener('click', () => card.classList.toggle('is-flipped'));
    deck.querySelector('.gc-ok').addEventListener('click', () => { known.add(pool[idx].id); saveKnown(); progress(); idx++; show(); });
    deck.querySelector('.gc-again').addEventListener('click', () => { idx++; show(); });
    deck.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => {
      cat = b.dataset.cat; deck.querySelectorAll('[data-cat]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      makePool(); show();
    }));
    makePool(); progress(); show(); deck.hidden = false;
  }
})();
