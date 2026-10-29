/* ================================================================
   ginko.js — 経済ラボ：銀行のふしぎ（あずけたお金が貸し出され、また預金になる＝信用創造）
   ・最初の預金 10,000 円。銀行は「準備率」のぶんを手元に残し、のこりを次の人に貸す
   ・借りた人がお店で使い、お店がそのお金を銀行にあずける……をくり返す
   ・預金の合計は 10,000 ÷ 準備率 に近づいていく。準備率や流れは、しくみを見るための「たとえ」
   ================================================================ */
(function() {
  const box = document.querySelector('[data-ginko]');
  if (!box) return;
  const KEY = 'azakei_ginko', FIRST = 10000, N = 12;
  const WHO = ['あなた', 'パン屋さん', '文房具店', '本屋さん', '花屋さん', '八百屋さん', 'カフェ', '自転車店', '電器店', 'くつ屋さん', 'おもちゃ屋さん', '魚屋さん', '時計店'];
  const yen = n => Math.round(n).toLocaleString('ja-JP') + ' 円';
  const narrow = innerWidth < 560, W = narrow ? 420 : 720, H = narrow ? 230 : 190, BW = W / N;
  box.innerHTML = `
    <div class="gk-top">
      <div class="gk-rates" role="group" aria-label="銀行が手元に残す割合（準備率）"><span>銀行が手元に残す割合<small>（準備率）</small></span>
        ${[10, 20, 50].map(v => `<button type="button" data-r="${v}" aria-pressed="${v === 10}">${v}%</button>`).join('')}</div>
      <div class="gk-total"><small>みんなの預金の合計</small><b data-o="total">${yen(0)}</b><span data-o="times">最初の 0 倍</span></div>
    </div>
    <div class="gk-meter" aria-hidden="true"><i data-o="fill"></i></div>
    <p class="gk-cap" data-o="cap"></p>
    <svg class="gk-chart" viewBox="0 -24 ${W} ${H + 50}" role="img" aria-label="人ごとの預金と、貸し出しの流れ">
      <g data-o="bars"></g>
    </svg>
    <p class="gk-legend"><span><i class="is-keep"></i>銀行が手元に残す</span><span><i class="is-lend"></i>次の人に貸す</span></p>
    <p class="gk-say" data-o="say" aria-live="polite">まずは、あなたが <b>10,000 円</b>を銀行にあずけます。ボタンを押して、お金の旅をはじめよう。</p>
    <div class="gk-btns"><button type="button" class="btn-primary" data-a="step">あずける →</button><button type="button" class="gk-sub" data-a="all">最後まで一気に</button><button type="button" class="gk-sub" data-a="reset">はじめから</button></div>
    <p class="gk-note" data-o="note" hidden></p>
    <p class="in-foot">※ 準備率やお金の流れは、しくみを見るための「たとえ」です。実際には、借りたお金がぜんぶ銀行にもどるとはかぎりません。</p>`;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('is-lite');
  let r = .1, k = 0, total = 0, shown = 0, raf, timer;
  const dep = i => FIRST * Math.pow(1 - r, i);
  const countTo = to => {
    cancelAnimationFrame(raf);
    const from = shown, t0 = performance.now(), dur = reduce ? 0 : 500;
    const f = now => {
      const p = dur ? Math.min(1, (now - t0) / dur) : 1;
      shown = from + (to - from) * (1 - Math.pow(1 - p, 3));
      $('total').textContent = yen(shown);
      $('times').textContent = `最初の ${(shown / FIRST).toFixed(1)} 倍`;
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
  };
  const bar = i => {
    const d = dep(i), keep = d * r, h = d / FIRST * H, hk = keep / FIRST * H, x = i * BW + 6, w = BW - 12;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'gk-bar'); g.style.setProperty('--d', '0ms');
    g.innerHTML = `<rect x="${x}" y="${H - h}" width="${w}" height="${h - hk}" rx="4" class="gk-lend"/><rect x="${x}" y="${H - hk}" width="${w}" height="${hk}" class="gk-keep"/>`
      + (i < N - 1 ? `<path d="M${x + w - 4} ${H - h + 4} q ${BW * .3} -16 ${BW * .55} ${(d - dep(i + 1)) / FIRST * H}" class="gk-arrow"/>` : '')
      + `<text x="${x + w / 2}" y="${H + 16}" text-anchor="middle" class="gk-who">${i + 1}</text>`
      + `<text x="${x + w / 2}" y="${H - h - 5}" text-anchor="middle" class="gk-amt">${d >= 9950 ? "1万" : d >= 1000 ? (d / 1000).toFixed(1) + '千' : Math.round(d)}</text>`;
    $('bars').appendChild(g);
  };
  const paintCap = () => {
    const cap = FIRST / r;
    $('cap').textContent = `どこまで続けても、${yen(FIRST)} ÷ ${Math.round(r * 100)}% ＝ ${yen(cap)} まで`;
    $('fill').style.width = (total / cap * 100) + '%';
  };
  const reset = () => {
    clearTimeout(timer); k = 0; total = 0; $('bars').innerHTML = ''; countTo(0); paintCap();
    $('say').innerHTML = 'まずは、あなたが <b>10,000 円</b>を銀行にあずけます。ボタンを押して、お金の旅をはじめよう。';
    $('note').hidden = true; box.querySelector('[data-a="step"]').textContent = 'あずける →'; box.querySelector('[data-a="step"]').disabled = false;
    box.classList.remove('is-done');
  };
  const step = () => {
    if (k >= N) return;
    const d = dep(k), lend = d * (1 - r);
    bar(k); total += d; countTo(total); paintCap();
    $('say').innerHTML = k === 0
      ? `あなたが <b>${yen(d)}</b> をあずけた。銀行は <b>${yen(d * r)}</b> を手元に残し、<b>${yen(lend)}</b> を${WHO[1]}に貸します。`
      : `${WHO[k]}が借りたお金でお店から買い物 → お店が <b>${yen(d)}</b> を銀行にあずけた。銀行はまた <b>${yen(lend)}</b> を貸します。`;
    k++;
    box.querySelector('[data-a="step"]').textContent = '次の人へ →';
    if (k >= N) finish();
  };
  const finish = () => {
    const cap = FIRST / r;
    box.querySelector('[data-a="step"]').disabled = true;
    box.classList.add('is-done');
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    $('note').hidden = false;
    $('note').innerHTML = `お札は最初の <b>${yen(FIRST)}</b> しかないのに、<b>預金の数字</b>は ${N} 人で <b>${yen(total)}</b>（${(total / FIRST).toFixed(1)} 倍）に。ずっと続けると <b>${yen(cap)}</b> に近づきます。銀行が貸し出しをくり返すことで、世の中の預金が何倍にもふえる。これが<b>信用創造</b>です。<br>手元に残す割合を大きくすると、どうなる？ 上の「${r === .5 ? '10' : '50'}%」でためしてみよう。`;
  };
  box.addEventListener('click', e => {
    const rb = e.target.closest('[data-r]');
    if (rb) { r = rb.dataset.r / 100; box.querySelectorAll('[data-r]').forEach(b => b.setAttribute('aria-pressed', b === rb)); reset(); return; }
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'step') step();
    else if (a.dataset.a === 'reset') reset();
    else if (a.dataset.a === 'all') {
      clearTimeout(timer);
      const go = () => { if (k < N) { step(); timer = setTimeout(go, reduce ? 0 : 160); } };
      go();
    }
  });
  reset();
})();
