/* ================================================================
   kuji.js — 経済ラボ：くじ引きの期待値（1 回 300 円のくじ。平均すると、いくら戻ってくる？）
   ・予想してから 100 回引くと、1 回あたりの平均がだんだん「期待値」に近づいていく（大数の法則）
   ・賞金と確率は「たとえ」。期待値 = 3,000×1% + 1,000×5% + 300×20% = 140 円
   ================================================================ */
(function() {
  const box = document.querySelector('[data-kuji]');
  if (!box) return;
  const PRICE = 300, N = 100;
  // [名前, 賞金, 確率(%), 色]
  const P = [['1 等', 3000, 1, '#d49a2a'], ['2 等', 1000, 5, '#b5432f'], ['3 等', 300, 20, '#2f6b3a'], ['はずれ', 0, 74, '#8a8172']];
  const EV = P.reduce((s, p) => s + p[1] * p[2] / 100, 0);
  const yen = n => Math.round(n).toLocaleString('ja-JP') + ' 円';
  const W = 720, H = 170, MAX = 600;
  const y = v => H - Math.min(v, MAX) / MAX * H;
  box.innerHTML = `
    <div class="kj-board">
      <p class="kj-k">文化祭のくじ　1 回 <b>${PRICE} 円</b></p>
      <table class="kj-table"><tbody>${P.map(p => `<tr><th><i style="background:${p[3]}"></i>${p[0]}</th><td>${p[1] ? yen(p[1]) : '—'}</td><td>${p[2]}%</td></tr>`).join('')}</tbody></table>
    </div>
    <div class="kj-guess" data-o="guess">
      <p class="kj-q">1 回引くと、<b>平均でいくら</b>戻ってくると思う？</p>
      <div class="kj-opts">${[80, 140, 300, 450].map(v => `<button type="button" data-g="${v}">${yen(v)}</button>`).join('')}</div>
    </div>
    <div class="kj-run" data-o="run" hidden>
      <div class="kj-balls" data-o="balls" aria-hidden="true"></div>
      <svg class="kj-chart" viewBox="0 0 ${W} ${H + 16}" role="img" aria-label="1 回あたりの平均のうつりかわり">
        <line x1="0" x2="${W}" y1="${y(PRICE)}" y2="${y(PRICE)}" class="kj-price"/><text x="${W - 2}" y="${y(PRICE) - 4}" text-anchor="end" class="kj-lb">くじの値段 300 円</text>
        <line x1="0" x2="${W}" y1="${y(EV)}" y2="${y(EV)}" class="kj-ev" data-o="evline"/><text x="${W - 2}" y="${y(EV) + 13}" text-anchor="end" class="kj-lb kj-evt" data-o="evtext">期待値 ${yen(EV)}</text>
        <polyline class="kj-avg" data-o="line" points=""/>
      </svg>
      <div class="kj-stats"><p><span>引いた回数</span><b data-o="n">0</b></p><p><span>1 回あたりの平均</span><b data-o="avg">—</b></p><p><span>使ったお金と、戻ったお金の差</span><b data-o="diff">—</b></p></div>
      <p class="kj-note" data-o="note"></p>
      <button type="button" class="btn-primary kj-again" hidden>もう 100 回</button>
    </div>
    <p class="in-foot">※ 賞金と確率は、しくみを見るための「たとえ」です。</p>`;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('is-lite');
  let guess = 0, timer;
  const draw1 = () => { let r = Math.random() * 100; for (const p of P) { if ((r -= p[2]) < 0) return p; } return P[3]; };
  const run = () => {
    clearInterval(timer);
    let n = 0, got = 0; const pts = [];
    $('balls').innerHTML = ''; box.querySelector('.kj-again').hidden = true; $('note').innerHTML = '';
    box.classList.remove('is-shown');
    const step = () => {
      const p = draw1(); n++; got += p[1];
      const b = document.createElement('i'); b.style.background = p[3]; b.title = p[0]; if (p[1] >= 1000) b.className = 'is-big'; $('balls').appendChild(b);
      pts.push(`${(n / N * W).toFixed(1)},${y(got / n).toFixed(1)}`);
      $('line').setAttribute('points', pts.join(' '));
      $('n').textContent = n; $('avg').textContent = yen(got / n);
      const d = got - PRICE * n; $('diff').textContent = (d >= 0 ? '+' : '−') + yen(Math.abs(d)); $('diff').className = d >= 0 ? 'is-up' : 'is-down';
      if (n >= N) {
        clearInterval(timer);
        box.classList.add('is-shown');
        const near = Math.abs(guess - EV) < 1;
        $('note').innerHTML = `${near ? '<b>予想ぴったり！</b> ' : `予想は ${yen(guess)}。`}賞金 × 確率 を足すと、<b>期待値は ${yen(EV)}</b>（3,000×1% ＋ 1,000×5% ＋ 300×20%）。引くほど、平均はこの線に近づいていきます（大数の法則）。<br>300 円のくじで平均 140 円しか戻らないので、<b>1 回あたり平均 160 円</b>はお店の取り分。たまに大当たりしても、たくさん引くほど、くじを売る側がもうかるしくみです。`;
        box.querySelector('.kj-again').hidden = false;
      }
    };
    if (reduce) { for (let i = 0; i < N; i++) step(); } else timer = setInterval(step, 40);
  };
  box.addEventListener('click', e => {
    const g = e.target.closest('[data-g]');
    if (g) {
      guess = +g.dataset.g;
      box.querySelectorAll('[data-g]').forEach(x => x.classList.toggle('is-on', x === g));
      $('run').hidden = false; run();
      return;
    }
    if (e.target.closest('.kj-again')) run();
  });
})();
