/* ================================================================
   newsfind.js — 用語辞典：ニュースの言葉さがし
   ・貼りつけた文章の中から、この辞典にある言葉を見つけて印をつける
   ・文章はこのブラウザの中だけで調べる（どこにも送らない・残さない）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-nf]');
  if (!box) return;
  const items = [...document.querySelectorAll('.gl-group .gl-item')];
  if (!items.length) return;
  const KANA = /^[぀-ゟー]+$/, HAS_KJ = /[一-鿿]/;
  // 意味が広すぎて、ほかの言葉の説明に飛ぶと誤解をまねく形
  const SKIP = new Set(['仕事']);
  const ddText = el => { const c = el.querySelector('dd').cloneNode(true); c.querySelectorAll('.gl-rel, button, .gl-tools').forEach(x => x.remove()); return c.textContent.trim(); };
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // 見出しから、文章の中で探す形を作る（「インフレーション（インフレ）」→ 2 つ。読みがなのかっこは使わない）
  const T = items.map(el => {
    const dt = el.querySelector('dt').textContent.trim(), dd = ddText(el);
    const forms = new Set();
    let main = dt.replace(/（[^）]*）/g, '').trim();
    const add = f => { f = f.trim(); if (f.length >= 2 && !SKIP.has(f)) forms.add(f); };
    // 『国富論』のような本の名前は、別の形として
    (main.match(/『[^』]+』/g) || []).forEach(b => add(b.slice(1, -1)));
    main = main.replace(/『[^』]*』/g, '').trim();
    main.split(/[・／/]/).length > 1 && !/^[゠-ヿ・]+$/.test(main) ? main.split(/[・／/]/).forEach(add) : add(main);
    add(main.replace(/・/g, ''));
    (dt.match(/（([^）]*)）/g) || []).forEach(p => {
      p = p.slice(1, -1);
      if (KANA.test(p) && HAS_KJ.test(main)) return; // 読みがな
      if (/\d/.test(p)) return; // 「18 歳」のような数字は使わない
      p.split(/[、,・]|または|ともいう/).forEach(add);
    });
    const m = main.match(/^(.{2,})と(.{2,})$/);
    if (m && !KANA.test(m[1]) && !KANA.test(m[2])) { add(m[1]); add(m[2]); }
    return { id: el.id, dt, dd: dd.split('。')[0] + '。', forms: [...forms] };
  });
  // 長い形から先に当てる（「政策金利」を「金利」より先に）
  const F = [];
  T.forEach((t, i) => t.forms.forEach(f => F.push([f, i])));
  F.sort((a, b) => b[0].length - a[0].length);
  const byHead = new Map();
  F.forEach(x => { const h = x[0][0]; if (!byHead.has(h)) byHead.set(h, []); byHead.get(h).push(x); });

  const scan = text => {
    const out = [], hit = new Map();
    let i = 0, buf = '';
    while (i < text.length) {
      const cand = byHead.get(text[i]);
      let m = null;
      if (cand) for (const x of cand) if (text.startsWith(x[0], i)) { m = x; break; }
      if (m) {
        if (buf) { out.push(esc(buf)); buf = ''; }
        const t = T[m[1]];
        hit.set(m[1], (hit.get(m[1]) || 0) + 1);
        out.push(`<a class="nf-hit" href="#${t.id}" data-t="${m[1]}">${esc(m[0])}</a>`);
        i += m[0].length;
      } else { buf += text[i++]; }
    }
    if (buf) out.push(esc(buf));
    return { html: out.join('').replace(/\n/g, '<br>'), hit };
  };

  const EX = [
    ['金融', '日本銀行は、政策金利を引き上げることを決めました。円安が続き、輸入品の値段が上がっているため、物価の動きが注目されています。住宅ローンの金利にも影響が出そうです。'],
    ['会社', 'ある会社の株価が大きく上がりました。決算で売上高と利益がふえたことが発表され、配当もふやすと伝えられたためです。株主からは、さらに成長を期待する声が出ています。'],
    ['くらし', '最低賃金が引き上げられます。人手不足で働く人を集めにくくなっている会社も多く、給料を上げる動きが広がっています。一方で、物価の上昇に給料が追いついていないという声もあります。']
  ];

  box.innerHTML = `<div class="nf-in">
      <label class="nf-lbl" for="nfText">記事の文章を、ここに貼りつける</label>
      <textarea id="nfText" class="nf-ta" rows="6" maxlength="6000" placeholder="新聞やニュースサイトの記事を、コピーして貼りつけます。"></textarea>
      <div class="nf-row">
        <button type="button" class="nf-go">言葉をさがす</button>
        <span class="nf-ex"><small>例文で試す</small>${EX.map((e, i) => `<button type="button" data-ex="${i}">${e[0]}</button>`).join('')}</span>
      </div>
      <p class="nf-note">例文は、このページのために書いた文章で、実際のニュースではありません。貼りつけた文章は、このブラウザの中だけで調べ、どこにも送りません。</p>
    </div>
    <div class="nf-out" aria-live="polite" hidden>
      <div class="nf-text"></div>
      <div class="nf-side"><p class="nf-count"></p><ol class="nf-list"></ol></div>
    </div>`;
  const ta = box.querySelector('.nf-ta'), outBox = box.querySelector('.nf-out'), txt = box.querySelector('.nf-text'), cnt = box.querySelector('.nf-count'), list = box.querySelector('.nf-list');

  const run = () => {
    const v = ta.value.trim();
    if (!v) { outBox.hidden = true; ta.focus(); return; }
    const { html, hit } = scan(v);
    txt.innerHTML = html;
    const hits = [...hit.entries()].sort((a, b) => b[1] - a[1]);
    cnt.innerHTML = hits.length ? `辞典にある言葉が <b>${hits.length}</b> 語 見つかりました` : '辞典にある言葉は、見つかりませんでした。<small>別の記事でも試してみてください。</small>';
    list.innerHTML = hits.map(([i, n], k) => { const t = T[i]; return `<li style="--i:${Math.min(k, 10)}"><a href="#${t.id}" data-t="${i}"><b>${esc(t.dt)}</b>${n > 1 ? `<span>${n} 回</span>` : ''}</a><p>${esc(t.dd)}</p></li>`; }).join('');
    outBox.hidden = false;
    outBox.classList.remove('is-shown'); void outBox.offsetWidth; outBox.classList.add('is-shown');
  };
  box.querySelector('.nf-go').addEventListener('click', run);
  box.querySelector('.nf-ex').addEventListener('click', e => { const b = e.target.closest('[data-ex]'); if (!b) return; ta.value = EX[+b.dataset.ex][1]; run(); });
  // 文中の言葉を押すと、記事を読む場所はそのままで、すぐ下に意味が開く
  const pop = document.createElement('div');
  pop.className = 'nf-pop'; pop.hidden = true; pop.setAttribute('role', 'dialog');
  const closePop = () => { pop.hidden = true; txt.querySelectorAll('.nf-hit.is-on').forEach(a => a.classList.remove('is-on')); };
  txt.addEventListener('click', e => {
    const a = e.target.closest('.nf-hit'); if (!a) return;
    e.preventDefault();
    if (a.classList.contains('is-on')) { closePop(); return; }
    closePop();
    const t = T[+a.dataset.t], full = ddText(document.getElementById(t.id));
    pop.innerHTML = `<p class="nf-pop-h"><b>${esc(t.dt)}</b><button type="button" class="nf-pop-x" aria-label="閉じる">×</button></p><p>${esc(full)}</p><a href="#${t.id}">辞典で見る</a>`;
    pop.setAttribute('aria-label', t.dt);
    txt.appendChild(pop); pop.hidden = false; a.classList.add('is-on');
    const W = txt.clientWidth, pw = Math.min(340, W - 24);
    pop.style.width = pw + 'px';
    pop.style.left = Math.max(12, Math.min(a.offsetLeft, W - pw - 12)) + 'px';
    pop.style.top = (a.offsetTop + a.offsetHeight + 8) + 'px';
  });
  pop.addEventListener('click', e => { if (e.target.closest('.nf-pop-x')) closePop(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) closePop(); });
  // 文中の言葉に触れると、右の一覧の同じ言葉が光る
  const lit = (i, on) => list.querySelectorAll(`[data-t="${i}"]`).forEach(a => a.closest('li').classList.toggle('is-lit', on));
  txt.addEventListener('mouseover', e => { const a = e.target.closest('.nf-hit'); if (a) lit(a.dataset.t, true); });
  txt.addEventListener('mouseout', e => { const a = e.target.closest('.nf-hit'); if (a) lit(a.dataset.t, false); });
})();
