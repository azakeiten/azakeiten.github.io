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
  // 五十音で引く：読みのいちばん最初の文字で、あ・か・さ……の行に分ける
  const ROWS = [['あ', 'あいうえおぁぃぅぇぉゔ'], ['か', 'かきくけこがぎぐげご'], ['さ', 'さしすせそざじずぜぞ'], ['た', 'たちつてとだぢづでどっ'], ['な', 'なにぬねの'], ['は', 'はひふへほばびぶべぼぱぴぷぺぽ'], ['ま', 'まみむめも'], ['や', 'やゆよゃゅょ'], ['ら', 'らりるれろ'], ['わ', 'わをん']];
  const rowOf = items.map(it => {
    const y = norm((YOMI[it.id] || it.dataset.yomi || it.querySelector('dt').textContent).split(/\s/)[0]);
    const r = ROWS.find(([, ks]) => ks.includes(y[0]));
    return r ? r[0] : '';
  });
  let row = '';
  const rowBar = document.createElement('div');
  rowBar.className = 'gl-rows'; rowBar.setAttribute('role', 'group'); rowBar.setAttribute('aria-label', '五十音で引く');
  rowBar.innerHTML = `<span class="gl-rows-label">五十音</span>` + ROWS.map(([r]) => { const n = rowOf.filter(x => x === r).length; return `<button type="button" data-row="${r}" aria-pressed="false"${n ? '' : ' disabled'}>${r}<small>${n}</small></button>`; }).join('');
  count.before(rowBar);
  rowBar.addEventListener('click', e => {
    const b = e.target.closest('[data-row]'); if (!b) return;
    row = row === b.dataset.row ? '' : b.dataset.row;
    rowBar.querySelectorAll('[data-row]').forEach(x => x.setAttribute('aria-pressed', x.dataset.row === row ? 'true' : 'false'));
    if (row) input.value = '';
    run();
  });
  input.addEventListener('input', () => { if (row) { row = ''; rowBar.querySelectorAll('[data-row]').forEach(x => x.setAttribute('aria-pressed', 'false')); } });
  const run = () => {
    const q = norm(input.value);
    let n = 0;
    items.forEach((it, i) => { const hit = (!q || text[i].includes(q)) && (!row || rowOf[i] === row); it.hidden = !hit; if (hit) n++; });
    groups.forEach(g => { g.hidden = !g.querySelector('.gl-item:not([hidden])'); });
    count.textContent = row ? `「${row}」行の言葉 ${n} 語` : q ? `${n} 語みつかりました` : `全 ${total} 語`;
    empty.hidden = n > 0;
    document.body.classList.toggle('gl-filtering', !!(q || row));   // さがしている間は、たたんだ分類もぜんぶ開く
  };
  // スマホでは分類ごとにたたむ（見出しを押すと開く）。#gdp のように飛んできたら、その分類を開く
  groups.forEach(g => {
    const h = g.querySelector('.gl-head'); if (!h) return;
    const n = g.querySelectorAll('.gl-item').length;
    g.classList.add('is-closed');
    h.insertAdjacentHTML('beforeend', `<button type="button" class="gl-fold" aria-expanded="false"><small>${n} 語</small><i aria-hidden="true">▾</i></button>`);
    const b = h.querySelector('.gl-fold');
    h.addEventListener('click', () => { const open = g.classList.toggle('is-closed') === false; b.setAttribute('aria-expanded', open); });
  });
  const openFor = id => { const t = id && document.getElementById(id); const g = t && (t.classList.contains('gl-group') ? t : t.closest('.gl-group')); if (g && g.classList.contains('is-closed')) { g.classList.remove('is-closed'); g.querySelector('.gl-fold')?.setAttribute('aria-expanded', 'true'); } };
  openFor(decodeURIComponent(location.hash.slice(1)));
  addEventListener('hashchange', () => openFor(decodeURIComponent(location.hash.slice(1))));
  document.addEventListener('click', e => { const a = e.target.closest('a[href^="#g-"], a[href^="#"]'); if (a) openFor(decodeURIComponent(a.getAttribute('href').slice(1))); }, true);
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
        <div class="gt-body"><p class="gt-label">${pick === dayNo % items.length ? '今日のことば' : 'もう 1 枚めくると'}</p><h2 class="gt-term">${it.querySelector('dt').innerHTML}</h2><p class="gt-def">${it.querySelector('dd').innerHTML.replace(/<span class="gl-rel">.*$/s, '')}</p>
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
      deck.querySelector('.gc-def').innerHTML = it.querySelector('dd').innerHTML.replace(/<span class="gl-rel">.*$/s, '');
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
  // 関連する言葉：説明文の中に、ほかの見出し語が出てきたら、その言葉へのリンクを下に並べる（最大 4 つ）
  (function() {
    // 見出し語から、さがす言葉をつくる（「インフレーション（インフレ）」→ インフレーション・インフレ、「金利・利息」→ 金利・利息）
    const names = items.map(it => {
      const dt = it.querySelector('dt').textContent;
      // 見出しそのもの（空白なし）と、かっこの中・「・」「と」で区切った部分。ただし、どこにでも出てくる言葉は使わない
      const STOP = ['利益', '投資', '費用', '経済', '会社', 'お金'];
      const main = dt.replace(/（.*?）/g, '').trim(), inner = (dt.match(/（(.*?)）/) || [])[1] || '';
      const words = [main.replace(/\s/g, '')].concat(main.split(/[・と]/), inner.split(/[・、]/)).map(w => w.replace(/\s/g, '')).filter(w => w.length >= 2 && !STOP.includes(w));
      return { id: it.id, label: dt.replace(/（.*?）/g, ''), words: [...new Set(words)] };
    });
    items.forEach(it => {
      const text = it.querySelector('dd').textContent;
      const rel = names.filter(n => n.id !== it.id && n.words.some(w => text.includes(w))).slice(0, 4);
      if (!rel.length) return;
      it.querySelector('dd').insertAdjacentHTML('beforeend', `<span class="gl-rel"><span>関連</span>${rel.map(n => `<a href="#${n.id}">${n.label}</a>`).join('')}</span>`);
    });
  })();
})();
