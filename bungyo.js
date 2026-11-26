/* ================================================================
   bungyo.js — 経済ラボ：分業のふしぎ（比較優位）
   ・文化祭の準備。A さんは何でも速い、B さんはどちらもゆっくり。それでも分けると得をする
   ・1 時間でつくれる数（A：クッキー 10 枚 / ポスター 2 枚、B：クッキー 4 枚 / ポスター 1 枚）は「たとえ」
   ・ポスター 6 枚をそろえて、クッキーがいちばん多くなる分け方（60 枚）を見つけたら「済」
   ================================================================ */
(function() {
  const box = document.querySelector('[data-bungyo]');
  if (!box) return;
  const KEY = 'azakei_bungyo', H = 6, NEED = 6, BEST = 60;
  const P = { a: { c: 10, p: 2, name: 'A さん', tag: '何でも速い' }, b: { c: 4, p: 1, name: 'B さん', tag: 'どちらもゆっくり' } };
  const COOKIE = '<i class="bg-c"></i>', POSTER = '<i class="bg-p"></i>';
  const person = k => `
    <div class="bg-person" data-who="${k}">
      <p class="bg-name"><span class="bg-seal" aria-hidden="true">${k.toUpperCase()}</span><b>${P[k].name}</b><small>${P[k].tag}</small></p>
      <p class="bg-rate">1 時間で　クッキー <b>${P[k].c}</b> 枚　または　ポスター <b>${P[k].p}</b> 枚</p>
      <label class="bg-slide"><span>ポスターにつかう時間 <b><i data-v="${k}">0</i> / ${H} 時間</b></span><input type="range" min="0" max="${H}" step="0.5" value="0" data-k="${k}"></label>
      <div class="bg-bar" aria-hidden="true"><span class="bg-bar-p" data-bar="${k}"></span></div>
      <p class="bg-made" data-made="${k}"></p>
    </div>`;
  box.innerHTML = `
    <p class="bg-mission"><span>お題</span>文化祭までに、<b>ポスターを ${NEED} 枚</b>。残りの時間でクッキーを焼く。2 人とも ${H} 時間ずつ。<b>クッキーがいちばん多くなる分け方</b>は？</p>
    <div class="bg-people">${person('a')}${person('b')}</div>
    <div class="bg-total">
      <p><span>ポスター</span><b data-o="p"></b><small data-o="pmsg"></small></p>
      <p><span>クッキー</span><b data-o="c"></b><small data-o="cmsg"></small></p>
    </div>
    <div class="bg-icons" aria-hidden="true"><div data-o="pi"></div><div data-o="ci"></div></div>
    <div class="bg-presets"><span>ためしに：</span>
      <button type="button" data-set="3,0">A がポスター全部</button>
      <button type="button" data-set="1.5,3">半分ずつ</button>
    </div>
    <details class="bg-why"><summary>なぜ、そうなるの？（ヒント）</summary>
      <p>ポスター 1 枚をつくると、そのあいだに焼けたはずのクッキーをあきらめることになります。これが<a href="glossary.html#opportunity-cost">機会費用</a>。</p>
      <p>A さんがポスター 1 枚 ＝ クッキー <b>5 枚</b>をあきらめる。B さんがポスター 1 枚 ＝ クッキー <b>4 枚</b>をあきらめる。</p>
      <p>A さんは両方とも速いけれど、「あきらめるもの」が少ないのは B さん。だから、ポスターは B さんに、クッキーは A さんにまかせると、2 人の合計がいちばん多くなります。これを<a href="glossary.html#comparative-advantage">比較優位</a>といい、国どうしの貿易が得になる理由にもなっています。</p>
    </details>
    <p class="in-foot">※ 1 時間でつくれる数は、しくみを見るための「たとえ」です。</p>`;
  const $ = s => box.querySelector(s);
  let done = false; try { done = !!localStorage.getItem(KEY); } catch (e) {}
  const draw = () => {
    const h = { a: +$('[data-k="a"]').value, b: +$('[data-k="b"]').value };
    let tp = 0, tc = 0;
    ['a', 'b'].forEach(k => {
      const p = h[k] * P[k].p, c = (H - h[k]) * P[k].c;
      tp += p; tc += c;
      $(`[data-v="${k}"]`).textContent = h[k];
      $(`[data-bar="${k}"]`).style.width = (h[k] / H * 100) + '%';
      $(`[data-made="${k}"]`).innerHTML = `ポスター <b>${p}</b> 枚 ＋ クッキー <b>${c}</b> 枚`;
    });
    const ok = tp >= NEED;
    $('[data-o="p"]').innerHTML = `${tp}<small> / ${NEED} 枚</small>`;
    $('[data-o="p"]').className = ok ? 'is-ok' : 'is-ng';
    $('[data-o="pmsg"]').textContent = ok ? 'そろった！' : `あと ${NEED - tp} 枚`;
    $('[data-o="c"]').innerHTML = `${tc}<small> 枚</small>`;
    $('[data-o="cmsg"]').textContent = !ok ? 'まずポスターを' : tc >= BEST ? 'これが最高！' : `最高は、もっと上`;
    $('[data-o="pi"]').innerHTML = POSTER.repeat(Math.floor(tp));
    $('[data-o="ci"]').innerHTML = COOKIE.repeat(Math.floor(tc / 2));
    const win = ok && tc >= BEST;
    box.classList.toggle('is-win', win);
    if (win && !done) {
      done = true;
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      const t = document.createElement('p');
      t.className = 'bg-win'; t.setAttribute('role', 'status');
      t.innerHTML = '<span aria-hidden="true">済</span>正解！ ゆっくりの B さんにポスターを任せるのが、いちばん得。「比較優位」を見つけました。';
      $('.bg-total').after(t);
      const w = box.querySelector('.bg-why'); if (w) w.open = true;
    }
  };
  box.addEventListener('input', e => { if (e.target.matches('input[type=range]')) draw(); });
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-set]'); if (!b) return;
    const [a, bb] = b.dataset.set.split(',');
    $('[data-k="a"]').value = a; $('[data-k="b"]').value = bb; draw();
  });
  draw();
})();

/* ================================================================
   v353：「文化祭の分担パズル」— 4 ステージ。だれに、どの仕事を、何時間？
   ・1 人 6 時間。決められた数（ポスター・看板）をそろえて、のこりの時間でクッキーをできるだけ多く
   ・ステージ 1・2 は 2 人、3 は 3 人、4 は 3 人で 3 つの仕事。いちばんよい分け方は、0.5 時間きざみで全部ためして求める
   ・いちばんよい分け方の 100% で ★3、90% 以上で ★2、数がそろえば ★1
   ・「ヒント」で、それぞれの人の「ポスター 1 枚のために、あきらめるクッキー」（機会費用）が出る
   ・1 時間でつくれる数は「たとえ」。記録は azakei_bungyo_stars（★の合計・最大 12）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-bungyo]');
  if (!box) return;
  if (!document.querySelector('link[href^="bzgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'bzgame.css?v=20261126g'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_bungyo_stars', H = 6;
  const JOB = { p: ['ポスター', '貼'], s: ['看板', '看'], c: ['クッキー', '焼'] };
  /* ステージ：人 [名前, ひとこと, { 仕事: 1 時間の数 }]、そろえる数、最後にふやす仕事は c */
  const ST = [
    { title: '何でも速い A さん', people: [['A さん', '何でも速い', { p: 2, c: 10 }], ['B さん', 'どちらもゆっくり', { p: 1, c: 4 }]], need: { p: 6 } },
    { title: '看板が得意なのは？', people: [['C さん', '力持ち', { s: 3, c: 6 }], ['D さん', '手先が器用', { s: 2, c: 2 }]], need: { s: 12 } },
    { title: '3 人になった', people: [['E さん', 'お菓子づくり部', { p: 4, c: 8 }], ['F さん', '美術部', { p: 3, c: 3 }], ['G さん', 'のんびり', { p: 1, c: 4 }]], need: { p: 18 } },
    { title: '3 つの仕事', people: [['H さん', '何でもこなす', { p: 3, s: 2, c: 6 }], ['I さん', '大工の家の子', { p: 1, s: 2, c: 4 }], ['J さん', '絵が好き', { p: 2, s: 1, c: 2 }]], need: { p: 12, s: 8 } }
  ];
  const jobsOf = st => [...new Set(st.people.flatMap(p => Object.keys(p[2])))].sort((a, b) => 'psc'.indexOf(a) - 'psc'.indexOf(b));
  const out = (st, hrs) => { const o = {}; jobsOf(st).forEach(j => { o[j] = 0; }); st.people.forEach((p, i) => Object.keys(p[2]).forEach(j => { o[j] += p[2][j] * (hrs[i][j] || 0); })); return o; };
  const ok = (st, o) => Object.keys(st.need).every(j => o[j] >= st.need[j] - 1e-9);
  /* いちばんよい分け方（0.5 時間きざみで全部ためす） */
  const best = st => {
    const js = jobsOf(st), splits = p => { const keys = Object.keys(p[2]); const res = []; const rec = (k, left, cur) => { if (k === keys.length - 1) { res.push({ ...cur, [keys[k]]: left }); return; } for (let h = 0; h <= left + 1e-9; h += 0.5) rec(k + 1, left - h, { ...cur, [keys[k]]: h }); }; rec(0, H, {}); return res; };
    const S = st.people.map(splits); let b = -1, bh = null;
    const rec = (i, acc) => { if (i === S.length) { const o = out(st, acc); if (ok(st, o) && o.c > b) { b = o.c; bh = acc.map(x => ({ ...x })); } return; } S[i].forEach(sp => { acc[i] = sp; rec(i + 1, acc); }); };
    rec(0, []); return { c: b, hrs: bh, js };
  };
  const getStars = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  const g = document.createElement('div');
  g.className = 'bz';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="bz-sub"><span aria-hidden="true">験</span>じっくりためす：2 人の時間の分け方を、つまみで動かす</p>');
  let cur = null;
  const total = () => getStars().reduce((a, b) => a + (b || 0), 0);
  const menu = () => {
    const stars = getStars();
    g.innerHTML = `<div class="bz-menu">
      <div class="bz-hd"><div><p class="bz-kicker">分担パズル</p><h3 class="bz-h">文化祭の分担パズル</h3>
      <p class="bz-p">準備の時間は、1 人 6 時間。決められた数のポスターや看板をそろえて、のこりの時間でクッキーをできるだけ多く焼こう。何でも速い人に全部まかせるのが、いちばんとは限りません。</p></div>
      <p class="bz-total"><b>${total()}</b><small>/ ${ST.length * 3} ★</small></p></div>
      <ol class="bz-stages">${ST.map((st, i) => { const s = stars[i] || 0, open = i === 0 || stars[i - 1]; return `<li><button type="button" data-stage="${i}"${open ? '' : ' disabled'}><span class="bz-no">${i + 1}</span><b>${st.title}</b><small>${st.people.length} 人・${jobsOf(st).length} つの仕事</small><span class="bz-st" aria-label="★ ${s}">${'★'.repeat(s)}<i>${'★'.repeat(3 - s)}</i></span>${open ? '' : '<em>前のステージをクリアすると</em>'}</button></li>`; }).join('')}</ol></div>`;
  };
  const open = i => {
    const st = ST[i];
    cur = { i, st, hrs: st.people.map(p => { const o = {}; Object.keys(p[2]).forEach(j => { o[j] = 0; }); return o; }), opt: null, hint: false };
    draw();
  };
  const draw = (msg) => {
    const { st, hrs, i } = cur, js = jobsOf(st), o = out(st, hrs), done = ok(st, o);
    g.innerHTML = `<div class="bz-play">
      <div class="bz-top"><button type="button" class="bz-back" data-bz="menu">← ステージ</button><span class="bz-n">ステージ ${i + 1}</span><b>${st.title}</b></div>
      <div class="bz-goal">${js.map(j => { const need = st.need[j], v = o[j]; return `<div class="${j === 'c' ? 'is-max' : v >= need ? 'is-ok' : ''}"><span aria-hidden="true">${JOB[j][1]}</span><p><small>${JOB[j][0]}</small><b>${Math.round(v * 10) / 10}</b>${j === 'c' ? '<em>できるだけ多く</em>' : `<em>${need} こ そろえる</em>`}</p>${j === 'c' ? '' : `<i style="width:${Math.min(100, v / need * 100)}%"></i>`}</div>`; }).join('')}</div>
      <div class="bz-people">${st.people.map((p, pi) => { const used = Object.values(hrs[pi]).reduce((a, b) => a + b, 0); return `<div class="bz-person">
        <p class="bz-who"><b>${p[0]}</b><small>${p[1]}</small><span class="bz-left ${used >= H ? 'is-full' : ''}">のこり ${H - used} 時間</span></p>
        <div class="bz-clock" aria-hidden="true">${Array.from({ length: H * 2 }, (_, k) => { let acc = 0, cls = ''; for (const j of Object.keys(p[2])) { acc += hrs[pi][j] * 2; if (k < acc) { cls = 'is-' + j; break; } } return `<i class="${cls}"></i>`; }).join('')}</div>
        ${Object.keys(p[2]).map(j => `<div class="bz-row"><span class="bz-j is-${j}" aria-hidden="true">${JOB[j][1]}</span><span class="bz-rate">${JOB[j][0]}<small>1 時間に ${p[2][j]} こ</small></span><button type="button" data-h="${pi}:${j}:-0.5" aria-label="${p[0]}の${JOB[j][0]}を 30 分へらす"${hrs[pi][j] <= 0 ? ' disabled' : ''}>−</button><b>${hrs[pi][j]}<small>時間</small></b><button type="button" data-h="${pi}:${j}:0.5" aria-label="${p[0]}の${JOB[j][0]}を 30 分ふやす"${used >= H ? ' disabled' : ''}>＋</button></div>`).join('')}
        ${cur.hint ? `<p class="bz-hint">${Object.keys(p[2]).filter(j => j !== 'c').map(j => `${JOB[j][0]} 1 こ ＝ クッキー <b>${Math.round(p[2].c / p[2][j] * 10) / 10}</b> こをあきらめる`).join('<br>')}</p>` : ''}
      </div>`; }).join('')}</div>
      <p class="bz-msg" aria-live="polite">${msg || (done ? 'そろった！ 「これで提出」で、いちばんよい分け方とくらべよう。' : 'まだそろっていない数があります。')}</p>
      <div class="bz-btns"><button type="button" class="bz-go" data-bz="submit"${done ? '' : ' disabled'}>これで提出</button><button type="button" class="bz-sec" data-bz="hint">${cur.hint ? 'ヒントをかくす' : 'ヒント（あきらめる数）'}</button><button type="button" class="bz-sec" data-bz="reset">やりなおす</button></div>
    </div>`;
  };
  const submit = () => {
    if (!cur.opt) cur.opt = best(cur.st);
    const { st, hrs, i, opt } = cur, o = out(st, hrs), r = o.c / opt.c;
    const s = r >= 0.999 ? 3 : r >= 0.9 ? 2 : 1;
    const stars = getStars(); if ((stars[i] || 0) < s) { stars[i] = s; try { localStorage.setItem(KEY, JSON.stringify(stars)); localStorage.setItem('azakei_bungyo_total', String(stars.reduce((a, b) => a + (b || 0), 0))); localStorage.setItem('azakei_bungyo', '1'); } catch (e) {} }
    const js = opt.js;
    g.innerHTML = `<div class="bz-res">
      <p class="bz-kicker">ステージ ${i + 1} の結果</p>
      <p class="bz-big"><span class="bz-st is-big" aria-label="★ ${s}">${'★'.repeat(s)}<i>${'★'.repeat(3 - s)}</i></span></p>
      <p class="bz-cmp">あなたのクッキー <b>${Math.round(o.c * 10) / 10}</b> こ ／ いちばんよい分け方 <b>${opt.c}</b> こ</p>
      <div class="bz-opt"><p class="bz-l">いちばんよい分け方の一つ</p>${st.people.map((p, pi) => `<p><b>${p[0]}</b>${js.filter(j => opt.hrs[pi][j]).map(j => `<span class="bz-j is-${j}">${JOB[j][1]}</span>${JOB[j][0]} ${opt.hrs[pi][j]} 時間`).join('・') || 'なし'}</p>`).join('')}</div>
      <div class="bz-learn"><p><b>くらべるのは「速さ」ではなく「あきらめる数」。</b>ポスターを 1 こつくるあいだに、その人がクッキーを何こ焼けたか（機会費用）がいちばん少ない人が、ポスターを担当すると全体が多くなります。これを「比較優位」といいます。何でも速い人も、いちばん得意な仕事に集中するのがよいのです。</p></div>
      <div class="bz-btns">${i + 1 < ST.length ? `<button type="button" class="bz-go" data-stage="${i + 1}">次のステージへ</button>` : ''}<button type="button" class="bz-sec" data-stage="${i}">もう一度</button><button type="button" class="bz-sec" data-bz="menu">ステージ一覧</button></div></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(g.querySelector('.bz-res'), 'bungyo', s === 3 ? 'top' : s === 2 ? 'mid' : 'low');
  };
  g.addEventListener('click', e => {
    const h = e.target.closest('[data-h]');
    if (h && !h.disabled) { const [pi, j, d] = h.dataset.h.split(':'); const used = Object.values(cur.hrs[+pi]).reduce((a, b) => a + b, 0); const v = cur.hrs[+pi][j] + +d; if (v >= 0 && (used + +d) <= H + 1e-9) cur.hrs[+pi][j] = v; draw(); g.querySelector(`[data-h="${h.dataset.h}"]`)?.focus({ preventScroll: true }); return; }
    const s = e.target.closest('[data-stage]'); if (s && !s.disabled) { open(+s.dataset.stage); return; }
    const a = e.target.closest('[data-bz]'); if (!a || a.disabled) return;
    const k = a.dataset.bz;
    if (k === 'menu') menu(); else if (k === 'submit') submit(); else if (k === 'hint') { cur.hint = !cur.hint; draw(); } else if (k === 'reset') open(cur.i);
  });
  menu();
})();
