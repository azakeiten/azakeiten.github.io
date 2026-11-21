/* ================================================================
   qmake.js — あそび場：クイズ工房（問題をつくる → お札マンのアドバイス → 友だちに出す・AZAKEI に送る）
   ・最大 5 問のクイズ集をつくる。1 問ごとに、問題・4 つの答え（いちばん上が正解）・解説・難しさ
   ・書いているそばから、お札マンが「問題のよさ」を星 5 つで見る（正解だけ長い・同じ答え・解説がない など）
   ・「通して遊ぶ」：1 問 15 秒で、自分のクイズ集を遊ぶ
   ・「友だちに出す」：クイズ集をリンク（quiz.html?qz=…#make）にする。リンクの中に問題が入っていて、サーバーには送らない
     リンクを開いた人は、まずそのクイズ集で遊ぶ画面になる
   ・書いている内容は、このタブの中にだけ残す（sessionStorage）。送るまで、どこにも届かない
   ・見た目は qmake.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-qmake]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="qmake.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'qmake.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const KEY = 'azakei-qmake2', MAX = 5, QT = 15;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const blank = () => ({ q: '', a: ['', '', '', ''], note: '', lv: 'ふつう' });
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // リンクに入れる形：UTF-8 → base64url
  const enc = o => { const b = new TextEncoder().encode(JSON.stringify(o)); let s = ''; b.forEach(x => { s += String.fromCharCode(x); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const dec = s => { const t = atob(s.replace(/-/g, '+').replace(/_/g, '/')); return JSON.parse(new TextDecoder().decode(Uint8Array.from(t, c => c.charCodeAt(0)))); };
  const clean = o => { // リンクから来たものは、形と長さを確かめてから使う
    if (!o || !Array.isArray(o.qs)) return null;
    const qs = o.qs.slice(0, MAX).map(x => ({ q: String(x.q || '').slice(0, 80), a: (Array.isArray(x.a) ? x.a : []).slice(0, 4).map(t => String(t || '').slice(0, 24)), note: String(x.note || '').slice(0, 120), lv: ['かんたん', 'ふつう', '激ムズ'].includes(x.lv) ? x.lv : 'ふつう' })).filter(x => x.q && x.a.length === 4 && x.a.every(Boolean));
    return qs.length ? { title: String(o.title || '').slice(0, 24), by: String(o.by || '').slice(0, 12), qs } : null;
  };
  let S = { title: '', by: '', qs: [blank()], cur: 0 };
  try { const v = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (v && Array.isArray(v.qs) && v.qs.length) S = Object.assign(S, v); } catch (e) {}
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  let shared = null;
  try { const m = location.search.match(/[?&]qz=([A-Za-z0-9_-]+)/); if (m) shared = clean(dec(m[1])); } catch (e) { shared = null; }

  /* ── お札マンのアドバイス：1 問の「よさ」を星 5 つで */
  const coach = x => {
    const tips = [], len = t => t.trim().length;
    if (!x.q.trim()) return { ok: false, star: 0, tips: [['ng', '問題文を書こう。']] };
    const empty = x.a.filter(t => !t.trim()).length;
    if (empty) return { ok: false, star: 0, tips: [['ng', `答えが、あと ${empty} つ。いちばん上が正解だよ。`]] };
    let star = 5;
    const A = x.a.map(t => t.trim()), wrong = A.slice(1), avg = wrong.reduce((s, t) => s + t.length, 0) / 3;
    if (new Set(A).size < 4) { star -= 2; tips.push(['ng', '同じ答えが 2 つあるよ。4 つとも、ちがう答えにしよう。']); }
    if (A[0].length > avg * 1.7 && A[0].length - avg >= 4) { star -= 1; tips.push(['hint', '正解だけ長いと、読まなくても当たっちゃうかも。ハズレも同じくらいの長さに。']); }
    if (wrong.some(t => t.length <= 1 || /笑|ｗ|www|わからない/.test(t))) { star -= 1; tips.push(['hint', 'ありえないハズレは、すぐ見やぶられる。本当にまちがえそうな答えにしよう。']); }
    if (/\d/.test(A[0]) && !wrong.some(t => /\d/.test(t))) { star -= 1; tips.push(['hint', '正解が数字なら、ハズレも近い数字にすると、ぐっと考えさせる問題に。']); }
    if (A.some(t => /^(すべて|全部|どれも)/.test(t))) { star -= 1; tips.push(['hint', '「すべて」「どれも」の答えは、問題があいまいになりがち。']); }
    if (!/[？?]$/.test(x.q.trim()) && !/(は|を)[。]?$/.test(x.q.trim())) tips.push(['hint', '問題文は「〜は何？」のように、問いかけの形で終わると読みやすいよ。']);
    if (!x.note.trim()) { star -= 1; tips.push(['hint', '解説があると、まちがえた人も学べるよ。「なぜその答え？」を書こう。']); }
    else if (len(x.note) >= 20) tips.push(['good', '解説がしっかりしているね。']);
    if (!tips.some(t => t[0] !== 'good')) tips.unshift(['good', 'いい問題！ 友だちに出してみよう。']);
    return { ok: true, star: Math.max(1, star), tips };
  };
  const stars = n => `<span class="qm-stars" aria-label="星 ${n}">${'<i class="is-on"></i>'.repeat(n)}${'<i></i>'.repeat(5 - n)}</span>`;

  /* ── つくる画面 */
  const paint = () => {
    const x = S.qs[S.cur], c = coach(x), allOk = S.qs.every(q => coach(q).ok);
    const avg = S.qs.reduce((s, q) => s + coach(q).star, 0) / S.qs.length;
    box.innerHTML = `${shared ? `<div class="qm-from">リンクで届いたクイズ集「${esc(shared.title || '名前のないクイズ集')}」${shared.by ? `（${esc(shared.by)} さんから）` : ''}があります。<button type="button" data-go="playShared">遊ぶ</button></div>` : ''}
      <div class="qm-wrap"><div class="qm-ed">
        <div class="qm-meta"><label><span>クイズ集の名前</span><input data-m="title" maxlength="24" value="${esc(S.title)}" placeholder="例：お金のふしぎクイズ"></label><label><span>つくった人（ニックネーム）</span><input data-m="by" maxlength="12" value="${esc(S.by)}" placeholder="本名は書かないでね"></label></div>
        <div class="qm-tabs" role="tablist">${S.qs.map((q, i) => `<button type="button" role="tab" data-tab="${i}" aria-selected="${i === S.cur}" class="${coach(q).ok ? 'is-ok' : ''}">第 ${i + 1} 問</button>`).join('')}${S.qs.length < MAX ? '<button type="button" class="qm-add" data-go="add">＋ 問題をふやす</button>' : ''}</div>
        <div class="qm-card">
          <label class="qm-f"><span>問題</span><textarea data-k="q" rows="2" maxlength="80" placeholder="例：日本のお札を発行しているのは？">${esc(x.q)}</textarea></label>
          <div class="qm-f"><span>答え（いちばん上が正解）</span>
            ${x.a.map((t, i) => `<label class="qm-a${i === 0 ? ' is-ok' : ''}"><i>${i === 0 ? '正解' : 'ハズレ'}</i><input data-a="${i}" maxlength="24" value="${esc(t)}" placeholder="${['日本銀行', '財務省', '造幣局', '国立印刷局'][i]}"></label>`).join('')}</div>
          <label class="qm-f"><span>解説（なぜその答え？）</span><textarea data-k="note" rows="2" maxlength="120" placeholder="例：お札を発行するのは日本銀行。つくっているのは国立印刷局。">${esc(x.note)}</textarea></label>
          <div class="qm-f"><span>難しさ</span><div class="qm-lv">${['かんたん', 'ふつう', '激ムズ'].map(l => `<button type="button" data-lv="${l}" aria-pressed="${l === x.lv}">${l}</button>`).join('')}</div></div>
          ${S.qs.length > 1 ? '<button type="button" class="qm-del" data-go="del">この問題を消す</button>' : ''}
        </div></div>
        <div class="qm-side">
          <div class="qm-coach"><div class="qm-man" aria-hidden="true">${window.AZAKEI_OSATSU_SVG || ''}</div><div><p class="qm-ch">お札マンのチェック<small>第 ${S.cur + 1} 問</small></p>${stars(c.star)}<ul class="qm-tips">${c.tips.map(([k, t]) => `<li class="is-${k}">${t}</li>`).join('')}</ul></div></div>
          <div class="qm-set"><p>クイズ集 <b>${S.qs.length}</b> 問・できあがり ${S.qs.filter(q => coach(q).ok).length} 問・平均 ${stars(Math.round(avg))}</p>
            <div class="qm-btns"><button type="button" data-go="try" ${c.ok ? '' : 'disabled'}>この問題をためす</button><button type="button" data-go="playAll" ${allOk ? '' : 'disabled'}>通して遊ぶ（1 問 ${QT} 秒）</button></div>
            <div class="qm-btns"><button type="button" class="is-share" data-go="share" ${allOk ? '' : 'disabled'}>友だちに出す（リンク）</button><a class="qm-send${allOk ? '' : ' is-off'}" href="contact.html?type=other" data-go="send">AZAKEI に送る</a></div>
            ${allOk ? '' : '<p class="qm-need">どの問題も、問題文と 4 つの答えがそろうと遊べます。</p>'}</div>
          <div class="qm-play" aria-live="polite"></div>
        </div></div>`;
  };
  // 文字を打っているときは画面を作りなおさず、アドバイスとタブだけ直す（入力の場所がずれないように）
  const soft = () => {
    const x = S.qs[S.cur], c = coach(x), allOk = S.qs.every(q => coach(q).ok);
    const co = box.querySelector('.qm-coach > div:last-child');
    if (co) co.innerHTML = `<p class="qm-ch">お札マンのチェック<small>第 ${S.cur + 1} 問</small></p>${stars(c.star)}<ul class="qm-tips">${c.tips.map(([k, t]) => `<li class="is-${k}">${t}</li>`).join('')}</ul>`;
    box.querySelectorAll('[data-tab]').forEach((b, i) => b.classList.toggle('is-ok', coach(S.qs[i]).ok));
    const avg = S.qs.reduce((s, q) => s + coach(q).star, 0) / S.qs.length;
    const sp = box.querySelector('.qm-set > p'); if (sp) sp.innerHTML = `クイズ集 <b>${S.qs.length}</b> 問・できあがり ${S.qs.filter(q => coach(q).ok).length} 問・平均 ${stars(Math.round(avg))}`;
    const set = (sel, on) => box.querySelectorAll(sel).forEach(b => { if (b.tagName === 'A') b.classList.toggle('is-off', !on); else b.disabled = !on; });
    set('[data-go="try"]', c.ok); set('[data-go="playAll"]', allOk); set('[data-go="share"]', allOk); set('[data-go="send"]', allOk);
    const nd = box.querySelector('.qm-need'); if (nd) nd.hidden = allOk;
  };

  /* ── 遊ぶ（ためす・通して・届いたクイズ集） */
  let P = null;
  const play = (set, mode) => {
    clearTimeout(P && P.tm);
    P = { qs: set.qs, title: set.title, by: set.by, k: 0, ok: 0, mode, t0: 0 };
    if (mode === 'shared') box.innerHTML = `<div class="qm-shared"><div class="qm-sh"><span class="qm-seal" aria-hidden="true">問</span><div><p class="qm-k">とどいたクイズ集</p><p class="qm-title">${esc(set.title || '名前のないクイズ集')}</p><p class="qm-by">${set.by ? `${esc(set.by)} さんがつくった、` : ''}${set.qs.length} 問・1 問 ${QT} 秒</p></div></div><div class="qm-play" aria-live="polite"></div></div>`;
    ask();
  };
  const ask = () => {
    const el = box.querySelector('.qm-play'); if (!el) return;
    if (P.k >= P.qs.length) return result(el);
    const x = P.qs[P.k], ord = shuffle([0, 1, 2, 3]), timed = P.mode !== 'try';
    el.innerHTML = `<div class="qm-q"><p class="qm-qh"><span>${P.mode === 'try' ? 'ためし' : `第 ${P.k + 1} 問 / ${P.qs.length}`}</span><em>${esc(x.lv)}</em></p>${timed ? '<div class="qm-bar"><i></i></div>' : ''}
      <p class="qm-qt">${esc(x.q)}</p><div class="qm-opts">${ord.map((k, i) => `<button type="button" data-ans="${k}"><span>${'ABCD'[i]}</span>${esc(x.a[k])}</button>`).join('')}</div><div class="qm-fb"></div></div>`;
    if (timed) { const b = el.querySelector('.qm-bar i'); b.style.transition = 'none'; b.style.transform = 'scaleX(1)'; void b.offsetWidth; b.style.transition = `transform ${QT}s linear`; b.style.transform = 'scaleX(0)'; P.tm = setTimeout(() => answer(null), QT * 1000); }
  };
  const answer = k => {
    const el = box.querySelector('.qm-play'); if (!el || !P) return;
    const bs = [...el.querySelectorAll('[data-ans]')]; if (!bs.length || bs[0].disabled) return;
    clearTimeout(P.tm); const bi = el.querySelector('.qm-bar i'); if (bi) { const cur = getComputedStyle(bi).transform; bi.style.transition = 'none'; bi.style.transform = cur; }
    const x = P.qs[P.k], ok = k === 0; if (ok) P.ok++;
    bs.forEach(b => { b.disabled = true; if (b.dataset.ans === '0') b.classList.add('is-right'); else if (+b.dataset.ans === k) b.classList.add('is-wrong'); });
    el.querySelector('.qm-fb').innerHTML = `<p class="${ok ? 'ok' : 'ng'}">${ok ? '正解！' : k == null ? '時間切れ……' : '残念……'}</p>${x.note ? `<p>${esc(x.note)}</p>` : ''}<button type="button" data-go="${P.mode === 'try' ? 'tryAgain' : 'next'}">${P.mode === 'try' ? 'もう一度（答えの順番が変わる）' : P.k + 1 < P.qs.length ? '次の問題' : '結果を見る'}</button>`;
  };
  const result = el => {
    const n = P.qs.length, r = P.ok / n;
    el.innerHTML = `<div class="qm-res"><span class="qm-seal" aria-hidden="true">${r === 1 ? '満' : r >= .6 ? '良' : '学'}</span><p><b>${P.ok} / ${n}</b> 問正解</p><p class="qm-rm">${r === 1 ? '全問正解！ つくった人もびっくり。' : r >= .6 ? 'なかなかの成績。解説で、まちがえた問題も確かめよう。' : 'むずかしかった？ 解説を読んで、もう一度。'}</p>
      <div class="qm-btns">${P.mode === 'shared' ? '<button type="button" data-go="replay">もう一度遊ぶ</button><button type="button" class="is-share" data-go="makeOwn">自分もクイズをつくる</button>' : '<button type="button" data-go="replay">もう一度遊ぶ</button><button type="button" data-go="edit">つくる画面にもどる</button>'}</div></div>`;
    try { localStorage.setItem('azakei-qmake', '1'); } catch (e) {}
  };

  /* ── 友だちに出す：リンクをつくる */
  const share = () => {
    const set = { title: S.title.trim(), by: S.by.trim(), qs: S.qs.map(({ q, a, note, lv }) => ({ q: q.trim(), a: a.map(t => t.trim()), note: note.trim(), lv })) };
    const url = location.origin + location.pathname + '?qz=' + enc(set) + '#make';
    const el = box.querySelector('.qm-play');
    el.innerHTML = `<div class="qm-link"><p class="qm-lh">友だちに出すリンクができた</p><p class="qm-lx">このリンクの中に、クイズ集がまるごと入っています（AZAKEI のサーバーには送りません）。本名や連絡先は書かないでね。</p>
      <input class="qm-url" readonly value="${esc(url)}" aria-label="友だちに出すリンク"><div class="qm-btns"><button type="button" data-go="copy">リンクをコピー</button>${navigator.share ? '<button type="button" data-go="webshare">送る</button>' : ''}<a class="qm-open" href="${esc(url)}" target="_blank" rel="noopener">開いてためす</a></div><p class="qm-copied" hidden>コピーしました</p></div>`;
    P = { url };
  };

  box.addEventListener('click', e => {
    const t = e.target.closest('[data-tab]'); if (t) { S.cur = +t.dataset.tab; save(); paint(); return; }
    const lv = e.target.closest('[data-lv]'); if (lv) { S.qs[S.cur].lv = lv.dataset.lv; save(); box.querySelectorAll('[data-lv]').forEach(x => x.setAttribute('aria-pressed', x === lv)); return; }
    const an = e.target.closest('[data-ans]'); if (an) { answer(+an.dataset.ans); return; }
    const g = e.target.closest('[data-go]'); if (!g) return;
    const v = g.dataset.go;
    if (v === 'add' && S.qs.length < MAX) { S.qs.push(blank()); S.cur = S.qs.length - 1; save(); paint(); }
    else if (v === 'del' && S.qs.length > 1) { S.qs.splice(S.cur, 1); S.cur = Math.max(0, S.cur - 1); save(); paint(); }
    else if (v === 'try' || v === 'tryAgain') { play({ qs: [S.qs[S.cur]] }, 'try'); }
    else if (v === 'playAll') play(S, 'all');
    else if (v === 'next') { P.k++; ask(); }
    else if (v === 'replay') { if (P.mode === 'shared') play(shared, 'shared'); else play(S, 'all'); }
    else if (v === 'edit') paint();
    else if (v === 'playShared') play(shared, 'shared');
    else if (v === 'makeOwn') { paint(); box.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); }
    else if (v === 'share') share();
    else if (v === 'copy') { const u = box.querySelector('.qm-url'); const done = () => { const c = box.querySelector('.qm-copied'); if (c) c.hidden = false; }; if (navigator.clipboard) navigator.clipboard.writeText(u.value).then(done, () => { u.select(); }); else { u.select(); } }
    else if (v === 'webshare') { navigator.share({ title: S.title || 'クイズ集', text: '経済のクイズをつくったよ。遊んでみて！', url: P.url }).catch(() => {}); }
    else if (v === 'send') {
      if (!S.qs.every(q => coach(q).ok)) { e.preventDefault(); return; }
      const msg = `【クイズの問題の提案】${S.title ? `\nクイズ集：${S.title}` : ''}\n` + S.qs.map((x, i) => `\n第 ${i + 1} 問（${x.lv}）\n問題：${x.q}\n正解：${x.a[0]}\nハズレ：${x.a.slice(1).join(' ／ ')}\n解説：${x.note || '（なし）'}`).join('\n') + '\n';
      try { const prev = JSON.parse(sessionStorage.getItem('azakei-contact-draft') || '{}'); sessionStorage.setItem('azakei-contact-draft', JSON.stringify(Object.assign(prev, { type: 'other', message: msg }))); } catch (err) {}
    }
  });
  box.addEventListener('input', e => {
    const el = e.target, x = S.qs[S.cur];
    if (el.dataset.k) x[el.dataset.k] = el.value;
    else if (el.dataset.a) x.a[+el.dataset.a] = el.value;
    else if (el.dataset.m) S[el.dataset.m] = el.value;
    else return;
    save(); soft();
  });
  if (shared) play(shared, 'shared'); else paint();
})();
