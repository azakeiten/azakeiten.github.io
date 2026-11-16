/* ================================================================
   karuta.js — 用語辞典：経済ことばかるた（近づいてから読みこむ）
   ・場に 12 枚の取り札（辞典の言葉）。お札マンが説明（読み札）を読むので、合う言葉の札をとる
   ・10 枚読んだら終わり。とった枚数・お手つき・かかった時間。自己ベストはこのブラウザの中だけ
   ・説明の中の、その言葉そのものは「○○」にかくす。「声で読む」でブラウザの読み上げも
   ================================================================ */
(function() {
  const box = document.querySelector('[data-karuta]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const YOMI = window.AZAKEI_YOMI || {};
  const BK = 'azakei_karuta_best', ROUNDS = 10, FIELD = 12;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const groups = [...document.querySelectorAll('.gl-group')].map(g => ({ id: g.id, name: [...(g.querySelector('.gl-head') || { childNodes: [] }).childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(), items: [...g.querySelectorAll('.gl-item')] })).filter(g => g.items.length >= FIELD);
  const word = it => it.querySelector('dt').textContent.trim();
  const yomi = it => (it.dataset.yomi || YOMI[it.id] || '').trim().split(/\s+/)[0];
  // 説明のはじめの 1 文。その言葉そのもの（と、かっこの中の読み）は ○○ にかくす
  const def = it => {
    const d = it.querySelector('dd').cloneNode(true); d.querySelectorAll('.gl-rel, button').forEach(x => x.remove());
    let t = d.textContent.trim().split('。')[0] + '。';
    const w = word(it).replace(/（.*?）|\(.*?\)/g, '').trim();
    const inner = ((word(it).match(/（(.*?)）|\((.*?)\)/) || []).slice(1).find(Boolean) || '').trim();
    // 「A と B」「人名『本』」のような言葉は、それぞれの部分もかくす（長いものから）
    [w, inner, ...w.split(/[・／\/と『』]/), ...inner.split(/[・、／\/と]/)].map(x => x.trim()).filter(x => x.length >= 2).sort((a, b) => b.length - a.length).forEach(x => { t = t.split(x).join('○○'); });
    return t;
  };
  let best = null; try { best = JSON.parse(localStorage.getItem(BK) || 'null'); } catch (e) {}
  let g = 'all', field, reads, ri, got, miss, t0, voice = false, busy = false;

  const intro = () => {
    box.innerHTML = `<div class="kt-intro">
      <p class="kt-rule">お札マンが、言葉の説明を読みます。場にならんだ 12 枚の札から、合う言葉をとってください。<b>${ROUNDS} 枚</b>読んだら終わり。まちがえるとお手つきです。</p>
      <div class="kt-seg" role="group" aria-label="分野">${[['all', 'ぜんぶ'], ...groups.map(x => [x.id, x.name])].map(([v, n]) => `<button type="button" data-g="${v}" aria-pressed="${g === v}">${esc(n)}</button>`).join('')}</div>
      ${best ? `<p class="kt-best">これまでの記録　${best.got} 枚・お手つき ${best.miss}・${best.sec} 秒</p>` : ''}
      <button type="button" class="kt-start">札をならべる</button></div>`;
  };
  const start = () => {
    const pool = g === 'all' ? groups.flatMap(x => x.items) : (groups.find(x => x.id === g) || groups[0]).items;
    field = shuffle(pool.slice()).slice(0, FIELD);
    reads = shuffle(field.slice()).slice(0, ROUNDS);
    ri = 0; got = 0; miss = 0; t0 = Date.now(); busy = false;
    box.innerHTML = `<div class="kt-top"><div class="kt-yomi"><span class="kt-os" aria-hidden="true">札</span><div><p class="kt-yh">読み札　<b data-o="n">1</b> / ${ROUNDS}${'speechSynthesis' in window ? `<button type="button" class="kt-v" aria-pressed="${voice}">${voice ? '声：あり' : '声で読む'}</button>` : ''}</p><p class="kt-def" aria-live="polite"></p></div></div>
      <p class="kt-score">とった札 <b data-o="got">0</b>　お手つき <b data-o="miss">0</b></p></div>
      <ul class="kt-field">${field.map((it, j) => { const y = yomi(it); return `<li><button type="button" class="kt-c" data-i="${j}" style="--j:${j};--r:${((j * 37) % 7) - 3}deg"><i aria-hidden="true">${esc((y || word(it))[0])}</i><b>${esc(word(it).replace(/（.*?）/g, ''))}</b></button></li>`; }).join('')}</ul>`;
    read();
  };
  let typeT = null;
  const read = () => {
    const it = reads[ri], t = def(it), el = box.querySelector('.kt-def');
    box.querySelector('[data-o="n"]').textContent = ri + 1;
    clearTimeout(typeT); el.textContent = '';
    if (voice && window.speechSynthesis) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t.split('○○').join('まるまる')); u.lang = 'ja-JP'; u.rate = 1.05; speechSynthesis.speak(u); }
    let k = 0;
    const step = () => { k = reduce ? t.length : k + 2; el.textContent = t.slice(0, k); if (k < t.length) typeT = setTimeout(step, 40); };
    step();
  };
  const finish = () => {
    clearTimeout(typeT); if (window.speechSynthesis) speechSynthesis.cancel();
    const sec = Math.round((Date.now() - t0) / 1000);
    const nb = !best || got > best.got || (got === best.got && (miss < best.miss || (miss === best.miss && sec < best.sec)));
    if (nb) { best = { got, miss, sec }; try { localStorage.setItem(BK, JSON.stringify(best)); } catch (e) {} }
    const rank = got === ROUNDS && miss === 0 ? ['名', '名人です。お手つきなしで、ぜんぶとりました。'] : got >= 8 ? ['達', 'かるたの達人。もう少しで名人です。'] : got >= 5 ? ['良', 'いい調子。辞典で読み返すと、もっと速くなります。'] : ['札', 'まずは「経済の基本」から、ためしてみてください。'];
    const missed = reads.filter(it => !it.dataset.ktGot);
    box.innerHTML = `<div class="kt-end"><p class="kt-seal" aria-hidden="true">${rank[0]}</p>
      <p class="kt-res"><b>${got}</b> 枚<span>お手つき ${miss}・${sec} 秒</span>${nb ? '<em>記録更新</em>' : ''}</p><p class="kt-word">${rank[1]}</p>
      ${missed.length ? `<p class="kt-miss">とれなかった言葉：${missed.map(it => `<a href="#${it.id}">${esc(word(it))}</a>`).join('')}</p>` : ''}
      <button type="button" class="kt-start">もう一度</button><button type="button" class="kt-back">分野をえらぶ</button></div>`;
    reads.forEach(it => delete it.dataset.ktGot);
    try { localStorage.setItem('azakei_karuta', '1'); } catch (e) {}
  };
  const take = btn => {
    if (busy) return;
    const it = field[+btn.dataset.i], ans = reads[ri];
    if (it !== ans) {
      miss++; box.querySelector('[data-o="miss"]').textContent = miss;
      btn.classList.remove('is-ng'); void btn.offsetWidth; btn.classList.add('is-ng');
      return;
    }
    busy = true; got++; ans.dataset.ktGot = '1';
    box.querySelector('[data-o="got"]').textContent = got;
    btn.classList.add('is-got'); btn.disabled = true;
    setTimeout(() => { busy = false; ri++; if (ri >= ROUNDS) finish(); else read(); }, reduce ? 50 : 700);
  };
  box.addEventListener('click', e => {
    const gb = e.target.closest('[data-g]'); if (gb) { g = gb.dataset.g; box.querySelectorAll('[data-g]').forEach(x => x.setAttribute('aria-pressed', x === gb)); return; }
    if (e.target.closest('.kt-start')) { start(); return; }
    if (e.target.closest('.kt-back')) { intro(); return; }
    const v = e.target.closest('.kt-v'); if (v) { voice = !voice; v.setAttribute('aria-pressed', voice); v.textContent = voice ? '声：あり' : '声で読む'; if (voice) read(); else speechSynthesis.cancel(); return; }
    const c = e.target.closest('.kt-c'); if (c && !c.disabled) take(c);
  });
  intro();
})();
