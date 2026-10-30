/* ================================================================
   narabe.js — 用語辞典：ことばならべかえ（説明を読んで、バラバラのひらがなを正しい順に）
   ・問題は辞典の言葉のうち、読み（data-yomi）が 1 語だけで 3〜8 文字のもの。説明の中の言葉は「〇〇」でかくす
   ・1 回 5 問。ヒント（先頭の 1 文字）を使うと 1 点、使わずに正解で 2 点。自己ベストはこのブラウザの中にだけ
   ================================================================ */
(function() {
  const box = document.querySelector('[data-narabe]');
  if (!box) return;
  const KEY = 'azakei_narabe_best', Q = 5;
  const pool = [...document.querySelectorAll('.gl-item[data-yomi]')].filter(it => {
    const y = it.dataset.yomi, d = it.querySelector('dt').textContent;
    return !/\s/.test(y) && y.length >= 3 && y.length <= 8 && !/[（と・A-Za-z]/.test(d);
  });
  if (pool.length < Q) return;
  let best = 0; try { best = +localStorage.getItem(KEY) || 0; } catch (e) {}
  const name = it => it.querySelector('dt').textContent.trim();
  const def = it => { const d = it.querySelector('dd').cloneNode(true); d.querySelectorAll('.gl-rel').forEach(x => x.remove()); return d.textContent.trim(); };
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  let set, n, score, cur, hint, locked;
  const intro = () => {
    box.innerHTML = `<div class="nb-intro"><p>説明を読んで、<b>バラバラのひらがな</b>を正しい順に並べよう。<br>1 回 ${Q} 問。ヒントなしで正解すると 2 点。</p>
      <div class="nb-demo" aria-hidden="true">${[...'ぶんぎょう'].map((c, i) => `<i style="--i:${i}">${c}</i>`).join('')}</div>
      <button type="button" class="btn-primary" data-a="start">はじめる</button><p class="nb-best">自己ベスト <b>${best}</b> / ${Q * 2} 点</p></div>`;
  };
  const start = () => { set = shuffle(pool).slice(0, Q); n = 0; score = 0; ask(); };
  const ask = () => {
    const it = set[n], y = it.dataset.yomi;
    let tiles = shuffle([...y]); if (tiles.join('') === y && y.length > 1) tiles = tiles.slice(1).concat(tiles[0]);
    cur = { it, y, tiles: tiles.map((c, i) => ({ c, i, used: false })), got: [] }; hint = false; locked = false;
    box.innerHTML = `
      <div class="nb-top"><span>${n + 1} / ${Q} 問</span><span class="nb-dots">${set.map((_, i) => `<i class="${i < n ? 'is-done' : i === n ? 'is-now' : ''}"></i>`).join('')}</span><span>得点 <b>${score}</b></span></div>
      <p class="nb-def">${def(it).replace(new RegExp(esc(name(it).split(/[（(]/)[0]), 'g'), '〇〇')}</p>
      <div class="nb-slots" data-o="slots" aria-live="polite">${[...y].map((_, i) => `<button type="button" class="nb-slot" data-s="${i}" aria-label="${i + 1} 文字目"></button>`).join('')}</div>
      <div class="nb-tiles" data-o="tiles">${cur.tiles.map(t => `<button type="button" class="nb-tile" data-t="${t.i}" style="--r:${(Math.random() * 10 - 5).toFixed(1)}deg">${t.c}</button>`).join('')}</div>
      <div class="nb-acts"><button type="button" class="nb-sub" data-a="hint">ヒント（先頭の 1 文字）</button><button type="button" class="nb-sub" data-a="pass">わからない</button></div>
      <div class="nb-res" data-o="res" hidden></div>`;
  };
  const paint = () => {
    box.querySelectorAll('.nb-slot').forEach((s, i) => { const t = cur.got[i]; s.textContent = t ? t.c : ''; s.classList.toggle('is-on', !!t); s.classList.toggle('is-hint', !!(t && t.hint)); });
    cur.tiles.forEach(t => box.querySelector(`[data-t="${t.i}"]`).classList.toggle('is-used', t.used));
  };
  const put = t => {
    if (locked || t.used) return;
    t.used = true; cur.got.push(t); paint();
    const s = box.querySelectorAll('.nb-slot')[cur.got.length - 1]; s.classList.remove('is-pop'); void s.offsetWidth; s.classList.add('is-pop');
    if (cur.got.length === cur.y.length) check();
  };
  const back = i => { if (locked || i >= cur.got.length || cur.got[i].hint) return; cur.got.splice(i).forEach(t => t.used = false); paint(); };
  const check = () => {
    if (cur.got.map(t => t.c).join('') === cur.y) return done(true);
    const sl = $('slots'); sl.classList.remove('is-ng'); void sl.offsetWidth; sl.classList.add('is-ng');
    // ヒントで置いた文字はのこし、それ以外をもどす
    setTimeout(() => { if (locked) return; const keep = cur.got.filter(t => t.hint); cur.got.slice(keep.length).forEach(t => t.used = false); cur.got = keep; paint(); }, 650);
  };
  const done = ok => {
    locked = true;
    const pts = ok ? (hint ? 1 : 2) : 0; score += pts;
    if (!ok) { cur.got = [...cur.y].map(c => ({ c })); paint(); }
    $('slots').classList.add(ok ? 'is-ok' : 'is-pass');
    box.querySelectorAll('.nb-tile, .nb-acts button').forEach(b => b.disabled = true);
    const last = n === Q - 1;
    $('res').hidden = false;
    $('res').innerHTML = `<p class="nb-ans">${ok ? `<b class="nb-good">${hint ? 'せいかい！ +1' : 'せいかい！ +2'}</b>` : '<b class="nb-pass">答えは……</b>'}<span>${name(cur.it)}</span><a href="#${cur.it.id}">辞典で読む</a></p>
      <button type="button" class="btn-primary" data-a="next">${last ? '結果を見る' : '次の問題 →'}</button>`;
  };
  const result = () => {
    const nb = score > best; if (nb) { best = score; try { localStorage.setItem(KEY, best); } catch (e) {} }
    const rank = score >= 10 ? 'ことばの名人' : score >= 7 ? 'ことば上手' : score >= 4 ? 'ことばの見習い' : 'これから覚えよう';
    box.innerHTML = `<div class="nb-end"><p class="nb-end-k">けっか</p><p class="nb-end-s"><b>${score}</b> / ${Q * 2} 点</p><p class="nb-rank"><span aria-hidden="true">称</span>${rank}</p>${nb ? '<p class="nb-new">自己ベスト更新！</p>' : `<p class="nb-best">自己ベスト <b>${best}</b> 点</p>`}
      <p class="nb-words">今回のことば：${set.map(it => `<a href="#${it.id}">${name(it)}</a>`).join('')}</p>
      <button type="button" class="btn-primary" data-a="start">もう 1 回</button></div>`;
  };
  box.addEventListener('click', e => {
    const t = e.target.closest('[data-t]'); if (t) return put(cur.tiles[+t.dataset.t]);
    const s = e.target.closest('[data-s]'); if (s) return back(+s.dataset.s);
    const a = e.target.closest('[data-a]'); if (!a) return;
    const k = a.dataset.a;
    if (k === 'start') start();
    else if (k === 'next') { n++; n < Q ? ask() : result(); }
    else if (k === 'pass') done(false);
    else if (k === 'hint' && !hint && !locked) {
      hint = true; a.disabled = true;
      cur.got.forEach(x => x.used = false); cur.got = [];
      const t0 = cur.tiles.find(x => x.c === cur.y[0]); t0.used = true; t0.hint = true; cur.got.push(t0); paint();
    }
  });
  intro();
})();
