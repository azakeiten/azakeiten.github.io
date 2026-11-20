/* ================================================================
   asobimap.js — あそび場：「あそび場のきっぷ」（このページの 26 の遊びの地図）
   ・きっぷの形のカードで、すべての遊びへ。上に「遊んだ数」の輪と「次はこれ」
   ・なかま（クイズとゲーム／お金のしくみ／くらしと社会／つくる）で絞りこみ
   ・遊んだしるし：記録があるか、その遊びの中でボタンなどを押したら「済」のはんこ（このブラウザの中だけ。azakei_play_tried）
   ・自己ベストの記録がある遊びは、きっぷに記録を出す
   ================================================================ */
(function () {
  const board = document.querySelector('[data-asobimap]');
  if (!board) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_play_tried';
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  let tried = []; try { tried = JSON.parse(get(KEY) || '[]'); } catch (e) {}
  const items = [...board.children];
  const href = li => li.querySelector('a').getAttribute('href');
  const stamp = li => { const a = li.querySelector('a'); if (!a.querySelector('.am-done')) a.insertAdjacentHTML('beforeend', '<span class="am-done" aria-label="遊んだ">済</span>'); li.classList.add('is-done'); };
  items.forEach(li => {
    const a = li.querySelector('a');
    a.insertAdjacentHTML('afterbegin', '<i class="am-perf" aria-hidden="true"></i>');
    if (li.hasAttribute('data-new')) a.insertAdjacentHTML('beforeend', '<em class="am-new">新</em>');
    const s = a.querySelector('small[data-k]');
    if (s) {
      const v = get(s.dataset.k);
      if (v !== null && v !== '' && v !== '0' && v !== '[]') {
        stamp(li);
        if (s.dataset.u) { let n = 0; if ('len' in s.dataset) { try { n = JSON.parse(v).length; } catch (e) {} } else n = +v || 0; if (n) { s.textContent = `自己ベスト ${n.toLocaleString()} ${s.dataset.u}`; s.classList.add('is-rec'); } }
      }
    }
    if (tried.includes(href(li))) stamp(li);
    const sec = document.getElementById(href(li).slice(1));
    if (!sec) return;
    const mark = e => {
      if (e.target.closest('a[href]') || !e.target.closest('button, input, select, textarea, [role="button"], svg, label')) return;
      if (!tried.includes(href(li))) { tried.push(href(li)); try { localStorage.setItem(KEY, JSON.stringify(tried)); } catch (err) {} }
      stamp(li); refresh();
      sec.removeEventListener('click', mark, true); sec.removeEventListener('input', mark, true);
    };
    sec.addEventListener('click', mark, true); sec.addEventListener('input', mark, true);
  });

  const CATS = [['all', 'すべて'], ['game', 'クイズとゲーム'], ['money', 'お金のしくみ'], ['life', 'くらしと社会'], ['make', 'つくる']];
  const cnt = k => k === 'all' ? items.length : items.filter(li => li.dataset.cat === k).length;
  const R = 24, LEN = 2 * Math.PI * R;
  const head = document.createElement('div');
  head.className = 'am-head';
  head.innerHTML = `<div class="am-top"><p class="am-title"><span class="am-ticket" aria-hidden="true">券</span><b>あそび場のきっぷ</b><small>${items.length} の遊び。気になるものから、どうぞ。</small></p>
    <div class="am-prog"><svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="${R}" class="am-ring-bg"/><circle cx="30" cy="30" r="${R}" class="am-ring" style="stroke-dasharray:${LEN.toFixed(1)};stroke-dashoffset:${LEN.toFixed(1)}"/></svg><p><b data-am="n">0</b><small>/ ${items.length} 遊んだ</small></p></div>
    <a class="am-next" href="#" data-am="next"><small>次はこれ</small><span class="am-s" data-am="ns"></span><b data-am="nn"></b><i aria-hidden="true">→</i></a></div>
    <div class="am-chips" role="group" aria-label="遊びのなかま">${CATS.map(([k, t], i) => `<button type="button" data-c="${k}" aria-pressed="${i === 0}">${t}<small>${cnt(k)}</small></button>`).join('')}</div>`;
  board.before(head);
  const H = k => head.querySelector(`[data-am="${k}"]`);
  function refresh() {
    const done = items.filter(li => li.classList.contains('is-done')).length;
    H('n').textContent = done;
    head.querySelector('.am-ring').style.strokeDashoffset = (LEN * (1 - done / items.length)).toFixed(1);
    head.classList.toggle('is-all', done === items.length);
    const nx = items.find(li => li.hasAttribute('data-new') && !li.classList.contains('is-done')) || items.find(li => !li.classList.contains('is-done'));
    const a = H('next'); a.hidden = !nx;
    if (nx) { a.href = href(nx); H('ns').textContent = nx.querySelector('.am-s').textContent; H('nn').textContent = nx.querySelector('b').textContent; a.dataset.cat = nx.dataset.cat; }
  }
  refresh();
  head.addEventListener('click', e => {
    const c = e.target.closest('[data-c]'); if (!c) return;
    head.querySelectorAll('[data-c]').forEach(b => b.setAttribute('aria-pressed', b === c));
    items.forEach((li, i) => {
      const on = c.dataset.c === 'all' || li.dataset.cat === c.dataset.c;
      li.hidden = !on;
      if (on && !reduce) { li.classList.remove('is-in'); void li.offsetWidth; li.style.setProperty('--d', (i % 8) * 35 + 'ms'); li.classList.add('is-in'); }
    });
  });

  /* ================================================================
     v318：遊びの「カタログ」と「1 つずつ遊ぶ」画面
     ・きっぷを、内容の説明・かかる時間・人数・学べることつきのカードにする
     ・「はじめる」を押すと、その遊びだけを開く（ほかの遊びはかくし、読みこみもしない）
     ・上の帯で「一覧へもどる」「前の遊び」「次の遊び」。ブラウザの「戻る」でも一覧へ
     ・quiz.html#jika のように、ほかのページからも直接その遊びへ
     ================================================================ */
  const INFO = {
    quiz: ['約 5 分', '1 人', 'ふつう', 'ニュースの読み方・リスクとリターン'],
    crossword: ['約 10 分', '1 人', 'じっくり', '経済の言葉 14 語'],
    cardgame: ['約 5 分', '1 人', 'ふつう', '預金・債券・株・外貨・起業'],
    sugoroku: ['約 4 分', '1 人', 'やさしい', '給料・税金・利息・保険'],
    shinka: ['約 3 分', '1 人', 'やさしい', '物々交換から電子マネーまで'],
    koukan: ['約 5 分', '1 人', 'ふつう', 'お金の 3 つの働き'],
    ehon: ['約 4 分', '1 人', 'やさしい', 'お金が町をめぐるしくみ'],
    coins: ['約 5 分', '1 人', 'やさしい', '世界の通貨'],
    himitsu: ['約 4 分', '1 人', 'やさしい', '新しいお札・にせもの防止'],
    otsuri: ['60 秒', '1 人', 'ふつう', 'おつりの計算・硬貨の組み合わせ'],
    imaato: ['約 3 分', '1 人', 'やさしい', '待つことの価値・利息'],
    bakery: ['約 15 分', '1 人', 'じっくり', '原価・利益・在庫・値決め'],
    kyuyo: ['約 8 分', '1 人', 'ふつう', '税金・社会保険・手取り・明細の計算'],
    cashless: ['約 5 分', '1 人', 'ふつう', 'キャッシュレス・手数料'],
    nefuda: ['約 6 分', '1 人', 'ふつう', '値段のしかけ・行動経済学'],
    jika: ['約 2 分', '1 人', 'ふつう', 'ダイナミックプライシング・需要'],
    kanzei: ['約 5 分', '1 人', 'ふつう', '関税・貿易・得する人と損する人'],
    subsc: ['約 5 分', '1 人', 'ふつう', 'サブスク・固定費・損益分岐点'],
    atobarai: ['約 4 分', '1 人', 'やさしい', '分割払い・リボ払い・利息'],
    nenkin: ['約 4 分', '1 人', 'やさしい', '年金・少子高齢化'],
    lemon: ['約 5 分', '1 人', 'ふつう', '情報のかたより（レモン市場）'],
    zeidan: ['約 4 分', '1 人', 'ふつう', '累進課税・所得税'],
    kawa: ['約 5 分', '1 人', 'ふつう', '外部不経済・環境税'],
    koen: ['約 5 分', '1 人〜', 'ふつう', '公共財・ただ乗り'],
    taikai: ['授業 1 コマ', '班で', 'やさしい', 'クラスで経済クイズ'],
    make: ['約 10 分', '1 人', 'じっくり', '問題をつくる側の目']
  };
  const ids = items.map(li => href(li).slice(1));
  const secOf = id => { const el = document.getElementById(id); return el ? (el.tagName === 'SECTION' ? el : el.closest('section')) : null; };
  const secs = ids.map(secOf);
  const leadOf = sec => { const p = sec && sec.querySelector('.section-head .lead'); return p ? p.textContent.trim() : ''; };
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  board.classList.add('am-rich');
  items.forEach((li, i) => {
    const a = li.querySelector('a'), inf = INFO[ids[i]] || ['', '1 人', '', ''], lead = leadOf(secs[i]) || (ids[i] === 'quiz' ? 'チップ 5 枚から 5 ラウンド。毎回、賭ける枚数とむずかしさ（かんたん・普通・激ムズ）を決めて 2 問に答え、正解の数で倍率がかかります。おたすけは「50:50」と「問題チェンジ」。新聞の記事を読んでから賭けるニュースモードも。' : '');
    a.insertAdjacentHTML('beforeend', `<p class="am-d">${esc(lead)}</p><p class="am-meta">${inf[0] ? `<span>${inf[0]}</span>` : ''}<span>${inf[1]}</span>${inf[2] ? `<span class="is-lv">${inf[2]}</span>` : ''}</p>${inf[3] ? `<p class="am-learn"><b>学べること</b>${esc(inf[3])}</p>` : ''}<span class="am-go">はじめる<i aria-hidden="true">→</i></span>`);
    a.setAttribute('aria-label', `${a.querySelector('b').textContent}をはじめる`);
  });
  const hero = document.querySelector('.page-hero'), wrap = board.closest('.am-wrap');
  secs.forEach(s => s && s.classList.add('asb-game'));
  document.body.classList.add('asb-on');
  const bar = document.createElement('div'); bar.className = 'asb-bar'; bar.setAttribute('role', 'navigation'); bar.setAttribute('aria-label', '遊びの切りかえ');
  const end = document.createElement('div'); end.className = 'asb-end';
  let cur = -1, fromList = false;
  const cardOf = i => items[i];
  const show = (i, how) => {
    if (cur === i) return;
    cur = i;
    const li = items[i], s = secs[i], inf = INFO[ids[i]] || [];
    secs.forEach((x, j) => x && x.classList.toggle('is-playing', j === i));
    document.body.classList.add('asb-play');
    const prev = (i + items.length - 1) % items.length, next = (i + 1) % items.length;
    const nm = j => items[j].querySelector('b').textContent, sl = j => items[j].querySelector('.am-s').textContent;
    bar.innerHTML = `<button type="button" class="asb-back" data-asb="list"><i aria-hidden="true">←</i>遊びの一覧</button>
      <p class="asb-now"><span class="am-s" data-cat="${li.dataset.cat}">${sl(i)}</span><span><small>${i + 1} / ${items.length}${inf[0] ? '・' + inf[0] : ''}</small><b>${nm(i)}</b></span></p>
      <span class="asb-pn"><a href="#${ids[prev]}" title="${nm(prev)}"><i aria-hidden="true">‹</i>前</a><a href="#${ids[next]}" title="${nm(next)}">次<i aria-hidden="true">›</i></a></span>`;
    const pick = [1, 2, 3].map(k => (i + k) % items.length);
    end.innerHTML = `<p class="asb-end-h">つぎは、どれで遊ぶ？</p><ul>${pick.map(j => `<li data-cat="${items[j].dataset.cat}"><a href="#${ids[j]}"><span class="am-s">${sl(j)}</span><b>${nm(j)}</b><small>${(INFO[ids[j]] || [''])[0]}</small></a></li>`).join('')}</ul><button type="button" class="asb-back" data-asb="list"><i aria-hidden="true">←</i>遊びの一覧へもどる</button>`;
    s.before(bar); s.after(end);
    if (!reduce) { s.classList.remove('asb-in'); void s.offsetWidth; s.classList.add('asb-in'); }
    requestAnimationFrame(() => bar.scrollIntoView({ behavior: 'auto', block: 'start' }));
    if (how !== 'load') { try { s.querySelector('button, a[href], input, [tabindex]')?.focus({ preventScroll: true }); } catch (e) {} }
  };
  const list = () => {
    if (cur < 0) return;
    const was = cur; cur = -1;
    secs.forEach(x => x && x.classList.remove('is-playing'));
    document.body.classList.remove('asb-play'); bar.remove(); end.remove();
    const card = cardOf(was);
    requestAnimationFrame(() => { const r = card.getBoundingClientRect(); scrollTo({ top: Math.max(0, scrollY + r.top - innerHeight / 3), behavior: 'auto' }); try { card.querySelector('a').focus({ preventScroll: true }); } catch (e) {} });
  };
  const route = how => {
    const id = decodeURIComponent(location.hash.slice(1)), i = ids.indexOf(id);
    if (i >= 0) show(i, how); else if (!id || how === 'pop') list();
  };
  /* カードを押したら、その遊びへ（ページ内の #〇〇 リンクはぜんぶ同じ道を通る） */
  addEventListener('hashchange', () => route('hash'));
  board.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) fromList = true; });
  head.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) fromList = true; });
  /* 前・次・「つぎは、どれで遊ぶ？」は、履歴をふやさずに切りかえる（「戻る」1 回で一覧へ） */
  const swap = e => { const a = e.target.closest('a[href^="#"]'); if (!a || e.metaKey || e.ctrlKey) return; e.preventDefault(); location.replace(a.getAttribute('href')); };
  bar.addEventListener('click', swap); end.addEventListener('click', swap);
  /* 遊んでいる途中に、目次などで「経済のあそび場」（このページ）を押したら、一覧へもどる */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a || cur < 0) return;
    const u = new URL(a.href, location.href);
    if (u.pathname === location.pathname && !u.hash) { history.pushState(null, '', location.pathname + location.search); list(); }
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-asb="list"]'); if (!b) return;
    if (fromList && history.length > 1) { fromList = false; history.back(); return; }
    history.pushState(null, '', location.pathname + location.search); list();
  });
  addEventListener('popstate', () => { if (!location.hash) list(); });
  route('load');
  document.documentElement.classList.remove('asb-pre-play');
})();
