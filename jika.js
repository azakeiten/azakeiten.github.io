/* ================================================================
   jika.js — あそび場：チケットの値段は時価（ライブ営業ゲーム。近づいてから読みこむ）
   ・遊園地の 1 週間を、1 日 約 12 秒の「ライブ」で営業する。お客さんの列が、本当に門へ歩いてくる
   ・値段は ＋／− ボタン（キーボードの ← → も）で、その場でいつでも変えられる
   ・お客さん 1 人ひとりに「ここまでなら払う」値段がある。値札がそれ以下なら入園、高ければ「高い…」と帰る
   ・園の中は 1,000 人まで。満員になると、来た人は「満員…」で入れない
   ・明日の天気と混み具合の予報を見て、作戦を立てる。1 週間の売上を、いちばんうまくやったときの目安とくらべる
   ・お客さんの数・値段はすべてたとえ。見た目は jika.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-jika]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="jika.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'jika.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const yen = n => Math.round(n).toLocaleString() + ' 円';
  const man = n => (Math.round(n / 1000) / 10).toLocaleString() + ' 万円';
  const CAP = 1000, PER = 20, STEP = 500, MIN = 1000, MAX = 9000;   // 点 1 つ ＝ 20 人
  // 曜日・天気・来たい人の数・この値段なら誰も来ない、の目安（すべてたとえ）
  const DAYS = [['月', '晴', 700, 5000], ['火', '晴', 650, 5000], ['水', '雨', 420, 4500], ['木', '曇', 800, 5500], ['金', '晴', 1300, 7000], ['土', '晴', 2600, 9000], ['日', '晴', 2200, 8500]];
  const SKY = { 晴: 'sun', 雨: 'rain', 曇: 'cloud' };
  // 「いちばんうまくやったとき」の目安（その日にいちばん売上が多くなる 1 つの値段）
  const best = DAYS.map(([, , n, pm]) => { let b = 0; for (let p = MIN; p <= MAX; p += STEP) b = Math.max(b, Math.min(CAP, n * (1 - p / pm)) * p); return b; });
  const BEST = best.reduce((a, b) => a + b, 0);
  const stars = n => n >= 2000 ? '★★★' : n >= 1000 ? '★★☆' : n >= 600 ? '★☆☆' : '☆☆☆';
  let price = 4000, d = 0, run = false, raf = 0, last = 0, t = 0, vis = [], inside = 0, today = 0, total = 0, cnt = { in: 0, high: 0, full: 0 }, log = [], sound = false, ac = null;

  box.innerHTML = `
    <div class="jk-hud">
      <div class="jk-dayb"><span class="jk-sky" data-k="sky">晴</span><div><p class="jk-dname" data-k="dname">月曜日</p><p class="jk-fc" data-k="fc">来たい人 ★☆☆</p></div></div>
      <div class="jk-pricebox"><button type="button" class="jk-pm" data-a="down" aria-label="値段を 500 円下げる">−</button><div class="jk-tag"><small>きょうの入園料</small><b data-k="price">4,000 円</b></div><button type="button" class="jk-pm" data-a="up" aria-label="値段を 500 円上げる">＋</button></div>
      <div class="jk-money"><p><small>きょうの売上</small><b data-k="today">0 円</b></p><p><small>1 週間の売上</small><b data-k="total">0 円</b></p></div>
    </div>
    <div class="jk-stage">
      <div class="jk-timebar"><i data-k="time"></i></div>
      <div class="jk-field" data-k="field">
        <div class="jk-path"></div>
        <div class="jk-gate"><span class="jk-gate-t">あさぶ遊園地</span><span class="jk-gate-p" data-k="gatep">4,000 円</span></div>
        <div class="jk-park"><svg viewBox="0 0 160 140" class="jk-wheel" aria-hidden="true"><g class="jk-wheel-r"><circle cx="80" cy="64" r="50" fill="none" stroke="#2f6fb0" stroke-width="4"/>${Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4; return `<line x1="80" y1="64" x2="${80 + 50 * Math.cos(a)}" y2="${64 + 50 * Math.sin(a)}" stroke="#2f6fb0" stroke-width="2"/><circle cx="${80 + 50 * Math.cos(a)}" cy="${64 + 50 * Math.sin(a)}" r="7" fill="${['#e0412b', '#f2b632', '#4f9a5a', '#7b5fb0'][k % 4]}"/>`; }).join('')}</g><path d="M80 64 L60 136 M80 64 L100 136" stroke="#2a2015" stroke-width="4"/></svg>
          <div class="jk-gauge"><i data-k="gauge"></i><span data-k="inside">0 / 1,000 人</span></div></div>
      </div>
      <div class="jk-card" data-k="card"></div>
      <p class="jk-legend"><span><i class="is-walk"></i>来た人（点 1 つで 20 人）</span><span><i class="is-in"></i>入園</span><span><i class="is-high"></i>高くて帰った</span><span><i class="is-full"></i>満員で入れない</span></p>
    </div>
    <div class="jk-learn">
      <p><b>ダイナミックプライシング</b>混みそうな日は高く、すいていそうな日は安く。来たい人の数に合わせて値段を変えるやり方です。ホテルや飛行機、テーマパーク、スポーツ観戦のチケットなどで使われています。</p>
      <p><b>安すぎても、高すぎても損</b>土曜に安すぎると、満員で入れない人があふれ、もっと払ってもいい人の分を取りのがします。平日に高すぎると、園の中がすいたままです（<a href="glossary.html#supply-demand">需要と供給</a>）。</p>
      <p><b>1 人ひとり、払える額がちがう</b>同じ値段でも、「安い！」と思う人と「高い…」と思う人がいます。値段を下げると来る人がふえ、上げるとへる。この関係を表したのが需要曲線です。</p>
      <p><b>空いた席は、取りもどせない</b>きょう空いていた分は、あしたに回せません。売れなかった分だけ、得られたはずのお金を失っています（<a href="glossary.html#opportunity-cost">機会費用</a>）。</p>
    </div>
    <p class="jk-note">お客さんの数・払ってもいい額・天気は、しくみを知るための「たとえ」です。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const field = K('field');
  const blip = (f, len = .06, v = .04) => { if (!sound) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.setValueAtTime(v, ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + len); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + len + .02); } catch (e) {} };
  const setPrice = p => { price = Math.max(MIN, Math.min(MAX, p)); K('price').textContent = yen(price); K('gatep').textContent = yen(price); const tag = box.querySelector('.jk-tag'); tag.classList.remove('is-bump'); void tag.offsetWidth; tag.classList.add('is-bump'); blip(600 + price / 20, .05, .03); };
  const hud = () => { K('today').textContent = yen(today); K('total').textContent = yen(total); K('inside').textContent = `${(inside * PER).toLocaleString()} / 1,000 人`; K('gauge').style.width = (inside * PER / CAP * 100) + '%'; box.querySelector('.jk-gauge').classList.toggle('is-full', inside * PER >= CAP); };
  const dayLabel = i => { const [w, sky, n] = DAYS[i]; K('sky').textContent = sky; K('sky').className = 'jk-sky is-' + SKY[sky]; K('dname').textContent = w + '曜日'; K('fc').textContent = `来たい人 ${stars(n)}`; };
  const card = (html, ms) => new Promise(r => { const c = K('card'); c.innerHTML = html; c.classList.add('is-on'); setTimeout(() => { c.classList.remove('is-on'); r(); }, reduce ? 300 : ms); });
  // 1 日分のお客さんをつくる（来る時刻と「ここまでなら払う」値段）
  const makeDay = i => { const [, , n, pm] = DAYS[i], k = Math.round(n / PER); return Array.from({ length: k }, () => ({ at: Math.random() * 9.5, will: Math.random() * pm, x: -4, st: 'wait', el: null, y: 8 + Math.random() * 72 })); };
  const step = now => {
    const dt = Math.min(.25, (now - last) / 1000); last = now; t += dt;
    K('time').style.width = Math.min(100, t / 12.5 * 100) + '%';
    for (const v of vis) {
      if (v.st === 'wait' && t >= v.at) { v.st = 'walk'; v.el = document.createElement('i'); v.el.className = 'jk-v'; v.el.style.top = v.y + '%'; field.appendChild(v.el); }
      if (v.st === 'walk') {
        v.x += dt * 16;
        if (v.x >= 44) {
          if (inside * PER >= CAP) { v.st = 'full'; v.el.className = 'jk-v is-full'; v.el.dataset.say = '満員…'; cnt.full++; blip(180, .08, .03); }
          else if (v.will >= price) { v.st = 'in'; v.el.className = 'jk-v is-in'; inside++; today += price * PER; total += price * PER; cnt.in++; if (cnt.in % 3 === 0) blip(1320, .05, .025); hud(); }
          else { v.st = 'high'; v.el.className = 'jk-v is-high'; v.el.dataset.say = '高い…'; cnt.high++; }
        }
      } else if (v.st === 'in') v.x += dt * 22;
      else if (v.st === 'high' || v.st === 'full') v.x -= dt * 14;
      if (v.el) { v.el.style.left = v.x + '%'; if ((v.st === 'in' && v.x > 92) || ((v.st === 'high' || v.st === 'full') && v.x < -6)) { v.el.remove(); v.el = null; v.st = 'gone'; } }
    }
    if (t > 12.5 && vis.every(v => v.st === 'gone' || v.st === 'wait')) { endDay(); return; }
    raf = requestAnimationFrame(step);
  };
  const startDay = async () => {
    dayLabel(d); inside = 0; today = 0; t = 0; hud();
    field.querySelectorAll('.jk-v').forEach(e => e.remove());
    const [w, sky, n] = DAYS[d];
    await card(`<p class="jk-c-k">${d + 1} 日目</p><p class="jk-c-t">${w}曜日・<span class="jk-sky is-${SKY[sky]}">${sky}</span></p><p class="jk-c-s">来たい人 ${stars(n)}${sky === '雨' ? '　雨で、出かける人が少なそう' : d === 5 ? '　週末！ 大行列の予感' : ''}</p>`, 1500);
    vis = makeDay(d); run = true; last = performance.now(); raf = requestAnimationFrame(step);
  };
  const endDay = async () => {
    run = false; cancelAnimationFrame(raf);
    log.push({ sales: today, best: best[d], inside: inside * PER });
    const full = inside * PER >= CAP, pct = Math.round(today / best[d] * 100);
    const msg = full && cnt.full ? '満員！ でも、入れなかった人も。もっと高くてもよかったかも' : inside * PER < 400 ? 'すいていた… もう少し安くしてもよかったかも' : pct >= 95 ? 'みごとな値段！' : 'まずまず';
    blip(pct >= 95 ? 1568 : 880, .25, .05);
    d++;
    const next = DAYS[d];
    await card(`<p class="jk-c-k">${DAYS[d - 1][0]}曜日の結果</p><p class="jk-c-t">${yen(today)}<small>（目安の ${pct}%）</small></p><p class="jk-c-s">${msg}</p>${next ? `<p class="jk-c-n">あしたの予報：${next[0]}曜日・${next[1]}・来たい人 ${stars(next[2])}</p>` : ''}`, 2600);
    if (d < DAYS.length) startDay(); else finish();
  };
  const finish = () => {
    const pct = Math.round(total / BEST * 100);
    const rank = pct >= 95 ? ['極', '名支配人'] : pct >= 85 ? ['上', 'やり手の支配人'] : pct >= 70 ? ['中', '見習い支配人'] : ['初', 'これから'];
    const mx = Math.max(...log.map(l => Math.max(l.sales, l.best)));
    K('card').innerHTML = `<div class="jk-end"><div class="jk-e-top"><span class="jk-e-seal" aria-hidden="true">${rank[0]}</span><div><p class="jk-e-t">${rank[1]}<small>${pct} 点</small></p><p class="jk-e-s">1 週間の売上 ${man(total)}（いちばんうまくやったときの目安 ${man(BEST)}）</p></div></div>
      <div class="jk-e-bars">${log.map((l, i) => `<div><span class="jk-e-b is-best" style="height:${l.best / mx * 100}%"></span><span class="jk-e-b" style="height:${l.sales / mx * 100}%"></span><small>${DAYS[i][0]}</small></div>`).join('')}</div>
      <p class="jk-e-cnt">入園 ${(cnt.in * PER).toLocaleString()} 人・高くて帰った ${(cnt.high * PER).toLocaleString()} 人・満員で入れない ${(cnt.full * PER).toLocaleString()} 人</p>
      <p class="jk-e-tip">${cnt.full * PER > 600 ? '週末に満員で入れない人がたくさん。混む日は、もっと強気の値段でも大丈夫です。' : cnt.high > cnt.in ? '「高い…」で帰った人が多め。すいている日は、思い切って下げてみよう。' : pct >= 95 ? 'みごと！ 曜日と天気に合わせて、うまく値段を変えられました。' : '予報を見て、混む日は上げ、すく日は下げてみよう。'}</p>
      <button type="button" class="jk-again" data-a="again">もう一度、1 週間</button></div>`;
    K('card').classList.add('is-on', 'is-final');
    try { const b = +localStorage.getItem('azakei_jika') || 0; if (pct > b) localStorage.setItem('azakei_jika', String(pct)); } catch (e) {}
  };
  const begin = () => { d = 0; total = 0; cnt = { in: 0, high: 0, full: 0 }; log = []; K('card').classList.remove('is-final'); hud(); startDay(); };
  // はじめの画面
  K('card').innerHTML = `<div class="jk-intro"><p class="jk-c-t">ライブ営業、1 週間</p><p class="jk-c-s">お客さんが門へ歩いてきます。値段を ＋／− で動かして、1 日の売上をできるだけ多くしよう。<br>高すぎると「高い…」と帰り、安すぎると満員であふれます。</p><label class="jk-snd"><input type="checkbox" data-a="snd">効果音</label><button type="button" class="jk-start" data-a="start">開園する</button><p class="jk-keys">キーボードの ← → でも値段を変えられます</p></div>`;
  K('card').classList.add('is-on'); dayLabel(0); hud();
  box.addEventListener('click', e => {
    if (e.target.closest('[data-a="up"]')) { setPrice(price + STEP); return; }
    if (e.target.closest('[data-a="down"]')) { setPrice(price - STEP); return; }
    if (e.target.closest('[data-a="start"]')) { K('card').classList.remove('is-on'); begin(); return; }
    if (e.target.closest('[data-a="again"]')) { K('card').classList.remove('is-on'); begin(); }
  });
  box.addEventListener('change', e => { if (e.target.closest('[data-a="snd"]')) sound = e.target.checked; });
  document.addEventListener('keydown', e => { if (!run) return; const r = box.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setPrice(price + STEP); } if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setPrice(price - STEP); } });
  setPrice(4000);
})();
