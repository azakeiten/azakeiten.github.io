/* ================================================================
   imaato.js — あそび場：いま？ それとも あとで？（お金の時間の価値・近づいてから読みこむ）
   ・「いまもらう」と「あとでもらう（少し多い）」を 8 回えらぶ
   ・それぞれの問題を「1 年あたり何 % ふえるか（年率）」に直して、どこから待てるかを見つける
   ・タイプ（いま派・バランス派・あとで派）と、えらんだ点を年率のグラフにならべる
   ・どれが正解ということはない。金額はたとえ。見た目は imaato.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-imaato]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="imaato.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'imaato.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const yen = n => n.toLocaleString() + ' 円';
  // [いま, あとで, 何か月後, 待つ時間の言い方]
  const QS = [
    [1000, 1010, 1, '1 か月後'], [1000, 1100, 1, '1 か月後'], [10000, 10300, 12, '1 年後'], [1000, 1500, 12, '1 年後'],
    [500, 1000, .25, '1 週間後'], [10000, 12000, 12, '1 年後'], [5000, 5500, 6, '半年後'], [10000, 11000, 12, '1 年後']
  ];
  const rate = ([a, b, m]) => (Math.pow(b / a, 12 / m) - 1) * 100;
  const fmtRate = r => r >= 1000 ? '1,000% 以上' : r >= 100 ? Math.round(r) + '%' : (Math.round(r * 10) / 10) + '%';
  const coins = n => { const k = Math.max(1, Math.min(14, Math.round(Math.log10(n) * 3.2 - 6))); return Array.from({ length: k }, (_, i) => `<i style="--i:${i}"></i>`).join(''); };

  box.innerHTML = `
    <div class="im-stage">
      <p class="im-q"><span data-k="qn">1</span> / ${QS.length}</p>
      <div class="im-dots">${QS.map((_, i) => `<i data-d="${i}"></i>`).join('')}</div>
      <p class="im-ask">あなたなら、どっちをえらぶ？</p>
      <div class="im-pick">
        <button type="button" class="im-card is-now" data-c="now"><span class="im-when">いま</span><span class="im-stack" data-k="sn"></span><b data-k="an">—</b><small>すぐに受けとる</small></button>
        <span class="im-or">または</span>
        <button type="button" class="im-card is-later" data-c="later"><span class="im-when" data-k="wl">—</span><span class="im-cal" aria-hidden="true"><span class="im-cal-top"></span><span class="im-cal-n" data-k="cal">—</span></span><span class="im-stack" data-k="sl"></span><b data-k="al">—</b><small data-k="plus">—</small></button>
      </div>
      <p class="im-hint">正解はありません。直感でえらんでみよう。</p>
    </div>
    <div class="im-result" hidden></div>
    <div class="im-learn">
      <p><b>お金には「時間の価値」がある</b>同じ 1 万円でも、いまの 1 万円は、1 年後の 1 万円より価値が高いと考えます。いま受けとれば、そのあいだに使うことも、あずけてふやすこともできるからです。</p>
      <p><b>金利で「いまの値打ち」に直す</b>年 5% でふやせるなら、1 年後の 10,500 円は、いまの 10,000 円と同じ値打ち。これを「割引現在価値」といいます（<a href="glossary.html#interest">金利</a>・<a href="glossary.html#yield">利回り</a>）。</p>
      <p><b>待つのがむずかしい理由</b>目の前のものは、とても魅力的に見えます。子どもが「マシュマロをすぐ 1 個食べるか、少し待って 2 個もらうか」をえらぶ実験は、とても有名です（<a href="glossary.html#behavioral">行動経済学</a>）。</p>
      <p><b>待たない理由もある</b>約束が守られるか心配なとき、物の値段が上がりそうなとき、いますぐ必要なとき。いまをえらぶのも、まちがいではありません。あとで払う「後払い」とも、つながっている考え方です。</p>
    </div>
    <p class="im-note">金額は、しくみを知るための「たとえ」です。年率は「その割合で 1 年ふえつづけたら」として計算しています。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const result = box.querySelector('.im-result'), stage = box.querySelector('.im-stage'), dots = [...box.querySelectorAll('[data-d]')];
  let qi = 0, ans = [], busy = false;
  const show = () => {
    const [a, b, , w] = QS[qi];
    K('qn').textContent = qi + 1; K('an').textContent = yen(a); K('al').textContent = yen(b); K('wl').textContent = w; K('cal').textContent = w.replace(/後$/, '');
    K('plus').textContent = `${yen(b - a)} 多い`; K('sn').innerHTML = coins(a); K('sl').innerHTML = coins(b);
    dots.forEach((d, i) => { d.className = i < qi ? (ans[i] ? 'is-b' : 'is-a') : i === qi ? 'is-cur' : ''; });
    stage.classList.remove('is-in'); void stage.offsetWidth; stage.classList.add('is-in');
  };
  const choose = async later => {
    if (busy) return; busy = true;
    ans[qi] = later;
    const card = box.querySelector(later ? '.is-later' : '.is-now');
    card.classList.add('is-chosen'); await sleep(550); card.classList.remove('is-chosen');
    qi++; busy = false;
    if (qi < QS.length) show(); else finish();
  };
  const finish = () => {
    stage.hidden = true;
    const n = ans.filter(Boolean).length;
    const rs = QS.map(rate);
    // 待てるようになる年率：それ以上の年率では、ほとんど「あとで」をえらんだ境目
    const sorted = QS.map((q, i) => [rs[i], ans[i]]).sort((x, y) => x[0] - y[0]);
    let th = null; for (let k = 0; k < sorted.length; k++) { const rest = sorted.slice(k); if (rest.every(x => x[1])) { th = sorted[k][0]; break; } }
    const [type, seal, desc] = n <= 2 ? ['いま派', '今', 'いまのお金を大切にするタイプ。すぐに使いたいことがあるときや、先の約束が心配なときは、いまをえらぶのも自然なことです。'] : n <= 5 ? ['バランス派', '衡', 'ふえ方が大きいときだけ待つタイプ。「どれくらいふえるなら待てるか」を考えてえらんでいます。'] : ['あとで派', '待', 'たくさんふえるなら、じっくり待てるタイプ。貯金や投資では、この「待てる力」が大きな味方になります。'];
    const X = r => 30 + Math.min(1, Math.log10(Math.max(1, r)) / 4) * 270, chart = `<svg class="im-chart" viewBox="0 0 320 120" role="img" aria-label="それぞれの問題の年率と、あなたのえらんだ答え"><line class="im-c-ax" x1="30" x2="300" y1="80" y2="80"/>${[1, 10, 100, 1000, 10000].map(v => `<line class="im-c-g" x1="${X(v)}" x2="${X(v)}" y1="20" y2="80"/><text class="im-c-t" x="${X(v)}" y="96">${v >= 10000 ? '1万' : v >= 1000 ? '1千' : v}%</text>`).join('')}${th !== null ? `<line class="im-c-th" x1="${X(th)}" x2="${X(th)}" y1="12" y2="84"/><text class="im-c-tl" x="${X(th) + 4}" y="18">ここから待てる</text>` : ''}${QS.map((q, i) => `<circle class="im-c-p ${ans[i] ? 'is-later' : 'is-now'}" cx="${X(rs[i]).toFixed(1)}" cy="${ans[i] ? 40 : 64}" r="6"/>`).join('')}<text class="im-c-k" x="6" y="44">あとで</text><text class="im-c-k" x="6" y="68">いま</text><text class="im-c-t" x="300" y="112" style="text-anchor:end">1 年あたりのふえ方（年率）→</text></svg>`;
    result.innerHTML = `<div class="im-r-top"><span class="im-r-seal" aria-hidden="true">${seal}</span><div><p class="im-r-k">あなたは</p><p class="im-r-h">${type}<small>8 回のうち「あとで」が ${n} 回</small></p></div></div>
      <p>${desc}</p>
      ${th !== null ? `<p class="im-r-th">あなたは、<b>年 ${fmtRate(th)}</b> くらいふえるなら待てるようです。銀行の預金の金利は、ふつうこれよりずっと低いので、「ふやしてから使う」には時間がかかります。</p>` : '<p class="im-r-th">どの問題でも、いまをえらびました。どれくらいふえたら待てるか、考えてみよう。</p>'}
      ${chart}
      <ul class="im-r-list">${QS.map((q, i) => `<li class="${ans[i] ? 'is-later' : 'is-now'}"><span>${yen(q[0])} ／ ${q[3]} ${yen(q[1])}</span><small>年 ${fmtRate(rs[i])}</small><b>${ans[i] ? 'あとで' : 'いま'}</b></li>`).join('')}</ul>
      <button type="button" class="im-again" data-a="again">もう一度えらぶ</button>`;
    result.hidden = false;
    try { localStorage.setItem('azakei_imaato', type); } catch (e) {}
    window.AZAKEI_TALK && window.AZAKEI_TALK(result, 'imaato', n >= 6 ? 'top' : n >= 3 ? 'mid' : 'low');
  };
  box.addEventListener('click', e => {
    const c = e.target.closest('[data-c]'); if (c) { choose(c.dataset.c === 'later'); return; }
    if (e.target.closest('[data-a="again"]')) { qi = 0; ans = []; result.hidden = true; stage.hidden = false; show(); }
  });
  show();
})();
