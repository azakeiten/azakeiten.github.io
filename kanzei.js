/* ================================================================
   kanzei.js — あそび場：関税のシーソー（近づいてから読みこむ）
   ・「麻経島」はトマトを、となりの国から 1 個 100 円で輸入できる。島の農家は 70 円より高ければつくりはじめる
   ・関税（0〜80%）を動かすと、トマトの値段・島でつくる量・輸入・農家の仕事・政府の収入・消費者の負担が動く
   ・国境をこえるトラックの数、税関に落ちるお金、得する人と損する人のシーソー、需要と供給の図（関税収入と「ムダ」の三角）
   ・「となりの国も仕返しの関税」をオンにすると、島の自転車工場の輸出と仕事が減る
   ・数字はすべてたとえ。見た目は kanzei.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-kanzei]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="kanzei.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'kanzei.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  // 市場（たとえ）：買いたい量 D(p) = 1200 − 5p 万個、島でつくる量 S(p) = 5(p − 70) 万個、輸入の値段 100 円
  const PW = 100, AUT = 155;
  const D = p => Math.max(0, 1200 - 5 * p), S = p => Math.max(0, 5 * (p - 70));
  const okane = v => { const a = Math.abs(Math.round(v)); return (v < 0 ? '−' : '') + (a >= 10000 ? (Math.round(a / 1000) / 10).toLocaleString() + ' 億円' : a.toLocaleString() + ' 万円'); };
  const X0 = 400;   // 仕返しがないときの、島の自転車の輸出（万台）
  let t = 0, retal = false, seen = false;
  // ミッション：ちょうどの関税をさがす（仕返しのあり・なしも条件）。達成すると「達」の判
  const MIS = [
    ['農', '農家の仕事を 500 人以上にして、島全体の損を 3,000 万円以内に（仕返しなし）', r => !retal && r.farm >= 500 && r.net >= -3000],
    ['収', '政府の関税収入を 7,500 万円以上に。いちばん多くなる関税をさがそう（仕返しなし）', r => !retal && r.rev >= 7500],
    ['難', '仕返しありで、農家の仕事 450 人以上、島全体の損 5,000 万円以内（ちょうどの関税は 1 つだけ）', r => retal && r.farm >= 450 && r.net >= -5000]
  ];
  let got = [];
  try { got = JSON.parse(localStorage.getItem('azakei_kanzei_m') || '[]'); } catch (e) {}

  box.innerHTML = `
    <div class="kz-stage">
      <svg class="kz-map" viewBox="0 0 520 190" role="img" aria-label="となりの国から麻経島へ、トマトを運ぶトラック">
        <defs><linearGradient id="kzSea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7cc3d8"/><stop offset="1" stop-color="#3b84b0"/></linearGradient></defs>
        <rect width="520" height="190" fill="url(#kzSea)"/>
        <path d="M0 40 Q60 30 150 44 L190 190 L0 190 Z" fill="#d9c79a"/><path d="M330 46 Q430 26 520 38 L520 190 L300 190 Z" fill="#a8cf8e"/>
        <rect x="160" y="112" width="200" height="34" fill="#8a8f86"/><g stroke="#fffaf0" stroke-width="3" stroke-dasharray="14 10"><path d="M160 129 H360"/></g>
        <text x="20" y="70" class="kz-land">となりの国</text><text x="512" y="66" class="kz-land" text-anchor="end">麻経島</text>
        <g class="kz-farm" transform="translate(430 120)"><rect x="-34" y="-8" width="68" height="40" rx="4" fill="#6b9a4f"/><g fill="#e0412b" data-k="farm"></g></g>
        <g class="kz-gate" transform="translate(262 92)"><rect x="-22" y="-30" width="44" height="34" rx="4" fill="#2a2015"/><text y="-8" text-anchor="middle" class="kz-gate-t" data-k="gate">0%</text><rect x="-2" y="4" width="4" height="52" fill="#2a2015"/><rect class="kz-bar" x="2" y="22" width="56" height="6" rx="3" fill="#e0412b"/></g>
        <g data-k="trucks"></g>
        <g class="kz-coins" data-k="coins"></g>
      </svg>
      <div class="kz-saw" aria-hidden="true">
        <div class="kz-beam" data-k="beam"><span class="kz-pan is-gain"><b>得する</b><small data-k="gainw">—</small></span><span class="kz-pan is-loss"><b>損する</b><small data-k="lossw">—</small></span></div>
        <div class="kz-pivot"></div>
      </div>
      <p class="kz-msg" data-k="msg" aria-live="polite">関税を動かしてみよう。いまは関税なし（自由貿易）。</p>
    </div>
    <div class="kz-side">
      <label class="kz-sl"><span>トマトにかける関税</span><output data-k="t">0%</output><input type="range" min="0" max="80" step="5" value="0" data-s="t"></label>
      <label class="kz-sw"><input type="checkbox" data-s="retal"><span></span>となりの国も、島の自転車に同じ関税をかけて仕返しする</label>
      <ul class="kz-cards">
        <li><small>トマト 1 個の値段</small><b data-k="p">100 円</b></li>
        <li><small>島でつくる / 輸入</small><b><span data-k="s">150</span> / <span data-k="m">550</span><i>万個</i></b></li>
        <li class="is-up"><small>農家の仕事</small><b data-k="farmjob">300 人</b></li>
        <li class="is-up"><small>政府の関税収入</small><b data-k="rev">0 万円</b></li>
        <li class="is-down"><small>消費者が多く払う額</small><b data-k="cs">0 万円</b></li>
        <li class="is-down" data-k="factcard" hidden><small>自転車工場の仕事</small><b data-k="factjob">800 人</b></li>
        <li class="is-net"><small>島全体で見た得損</small><b data-k="net">0 万円</b></li>
      </ul>
      <div class="kz-mis"><p class="kz-mis-h">ミッション <small data-k="mcount"></small></p><ol data-k="mis"></ol></div>
      <figure class="kz-chart"><svg viewBox="0 0 360 250" role="img" aria-label="トマトの需要と供給の図" data-k="chart"></svg><figcaption><span class="is-rev"></span>関税収入　<span class="is-dwl"></span>ムダ（だれのものにもならない）</figcaption></figure>
    </div>
    <div class="kz-learn">
      <p><b>関税</b>外国から入ってくる品物にかける税金です。輸入品が高くなるので、国内の農家や工場は売りやすくなり、政府にはお金が入ります（<a href="glossary.html#free-trade">自由貿易</a>）。</p>
      <p><b>払うのは、買う人</b>関税で値段が上がると、トマトを買う人みんなが多く払います。農家と政府が得をした分より、消費者の損のほうが大きく、その差は「ムダ」になります（<a href="glossary.html#supply-demand">需要と供給</a>）。</p>
      <p><b>仕返しの関税</b>相手の国も関税をかけ返すと、こんどは自分の国の輸出が減り、工場の仕事が減ることがあります。関税のかけ合いは「貿易摩擦」とよばれます。</p>
      <p><b>それでも関税をかける理由</b>食べものを国内でつくれるようにしておきたい、急に仕事がなくなる人を守りたい、など。得と損を見くらべて決める、むずかしい問題です。</p>
    </div>
    <p class="kz-note">麻経島・トマトの値段・つくる量・仕事の人数は、しくみを知るための「たとえ」です。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const calc = () => {
    const p = Math.min(PW * (1 + t / 100), AUT), d = D(p), s = S(p), m = Math.max(0, d - s);
    const rev = (p - PW) * m, dcs = (p - PW) * (d + D(PW)) / 2, dps = (p - PW) * (s + S(PW)) / 2;
    const x = retal ? X0 * Math.pow(1 - t / 100, 1.5) : X0, lostX = (X0 - x) * 30;
    return { p, d, s, m, rev, dcs, dps, dwl: dcs - dps - rev, farm: Math.round(s * 2), fact: Math.round(x * 2), x, lostX, net: rev + dps - dcs - lostX };
  };
  // 需要と供給の図
  const X = q => 40 + q / 1200 * 300, Y = p => 225 - p / 240 * 200;
  const chart = r => {
    const pts = (f, a, b) => { const o = []; for (let p = a; p <= b; p += 5) o.push(`${X(f(p)).toFixed(1)},${Y(p).toFixed(1)}`); return o.join(' '); };
    let h = `<line class="kz-ax" x1="40" y1="225" x2="345" y2="225"/><line class="kz-ax" x1="40" y1="20" x2="40" y2="225"/>`;
    h += `<text class="kz-t" x="44" y="16">値段</text><text class="kz-t" x="345" y="240" text-anchor="end">量</text>`;
    const s0 = S(PW), d0 = D(PW), s1 = S(r.p), d1 = D(r.p);
    if (r.p > PW) {
      if (r.m > 0) h += `<rect class="kz-rev" x="${X(s1)}" y="${Y(r.p)}" width="${X(d1) - X(s1)}" height="${Y(PW) - Y(r.p)}"/>`;
      h += `<polygon class="kz-dwl" points="${X(s0)},${Y(PW)} ${X(s1)},${Y(PW)} ${X(s1)},${Y(r.p)}"/><polygon class="kz-dwl" points="${X(d1)},${Y(r.p)} ${X(d1)},${Y(PW)} ${X(d0)},${Y(PW)}"/>`;
    }
    h += `<polyline class="kz-d" points="${pts(D, 0, 240)}"/><polyline class="kz-s" points="${pts(S, 70, 240)}"/>`;
    h += `<line class="kz-pw" x1="40" x2="345" y1="${Y(PW)}" y2="${Y(PW)}"/><text class="kz-t is-pw" x="343" y="${Y(PW) - 4}" text-anchor="end">輸入の値段 100 円</text>`;
    if (r.p > PW) h += `<line class="kz-pt" x1="40" x2="345" y1="${Y(r.p)}" y2="${Y(r.p)}"/><text class="kz-t is-pt" x="343" y="${Y(r.p) - 4}" text-anchor="end">関税こみ ${Math.round(r.p)} 円</text>`;
    h += `<text class="kz-t is-d" x="${X(D(215))}" y="${Y(215)}">買いたい量</text><text class="kz-t is-s" x="${X(S(225)) + 4}" y="${Y(225) + 4}">島でつくる量</text>`;
    K('chart').innerHTML = h;
  };
  const paint = () => {
    const r = calc();
    K('t').textContent = t + '%'; K('gate').textContent = t + '%';
    box.querySelector('.kz-bar').style.transform = `rotate(${t ? -70 : 0}deg)`;
    K('p').textContent = Math.round(r.p) + ' 円';
    K('s').textContent = Math.round(r.s); K('m').textContent = Math.round(r.m);
    K('farmjob').textContent = r.farm.toLocaleString() + ' 人'; K('rev').textContent = okane(r.rev); K('cs').textContent = okane(r.dcs);
    K('factcard').hidden = !retal; K('factjob').textContent = r.fact.toLocaleString() + ' 人';
    K('net').textContent = okane(r.net);
    box.querySelector('.kz-cards .is-net').classList.toggle('is-bad', r.net < -1);
    // トラック（輸入 100 万個で 1 台）と畑のトマト（島でつくる量）
    const n = Math.round(r.m / 100);
    K('trucks').innerHTML = Array.from({ length: n }, (_, i) => `<g class="kz-truck" style="--d:${(i * 0.55).toFixed(2)}s"><rect x="0" y="-12" width="26" height="14" rx="2" fill="#fffaf0" stroke="#2a2015" stroke-width="1.5"/><rect x="26" y="-8" width="10" height="10" rx="2" fill="#b5432f"/><circle cx="7" cy="4" r="3" fill="#2a2015"/><circle cx="30" cy="4" r="3" fill="#2a2015"/><circle cx="13" cy="-5" r="3" fill="#e0412b"/></g>`).join('');
    K('farm').innerHTML = Array.from({ length: Math.min(24, Math.round(r.s / 25)) }, (_, i) => `<circle cx="${-28 + (i % 8) * 8}" cy="${-1 + Math.floor(i / 8) * 10}" r="3.2"/>`).join('');
    K('coins').innerHTML = r.rev > 0 ? Array.from({ length: Math.min(5, Math.ceil(r.rev / 2500)) }, (_, i) => `<circle class="kz-coin" cx="${252 + i * 5}" cy="60" r="4.5" style="--d:${(i * .35).toFixed(2)}s"/>`).join('') : '';
    // シーソー：得する人（農家・政府）と、損する人（消費者・工場）
    const gain = r.dps + r.rev, loss = r.dcs + r.lostX;
    const deg = gain + loss ? Math.max(-16, Math.min(16, (loss - gain) / (gain + loss) * 40)) : 0;
    K('beam').style.transform = `rotate(${deg}deg)`;
    K('gainw').textContent = gain ? `農家・政府 ${okane(gain)}` : '—'; K('lossw').textContent = loss ? `消費者${retal && r.lostX ? '・工場' : ''} ${okane(loss)}` : '—';
    chart(r);
    // ミッションの判定
    MIS.forEach((m, k) => { if (m[2](r) && !got.includes(k)) { got.push(k); try { localStorage.setItem('azakei_kanzei_m', JSON.stringify(got)); } catch (e) {} box.dataset.flash = k; } });
    K('mis').innerHTML = MIS.map((m, k) => `<li class="${got.includes(k) ? 'is-ok' : ''}${m[2](r) ? ' is-now' : ''}${box.dataset.flash == k ? ' is-flash' : ''}"><span aria-hidden="true">${got.includes(k) ? '達' : m[0]}</span>${m[1]}</li>`).join('');
    K('mcount').textContent = `${got.length} / ${MIS.length}`; delete box.dataset.flash;
    if (got.length === MIS.length && window.AZAKEI_TALK && !box.dataset.talked) { box.dataset.talked = '1'; window.AZAKEI_TALK(K('mis').parentElement, 'kanzei', 'top'); }
    K('msg').textContent = !t ? (retal ? '関税なしなら、仕返しもありません。トマトは安く、島の自転車も売れています。' : '関税なし（自由貿易）。トマトは 1 個 100 円。多くを輸入にたよっています。')
      : r.m <= 0 ? `関税 ${t}%：輸入が止まりました。値段は島の中だけで決まり、${Math.round(r.p)} 円に。政府の関税収入もなくなります。`
      : `関税 ${t}%：農家の仕事は +${(r.farm - S(PW) * 2).toLocaleString()} 人、政府に ${okane(r.rev)}。でも、トマトを買う人は ${okane(r.dcs)} 多く払います。${retal ? `仕返しで、自転車工場の仕事は −${(X0 * 2 - r.fact).toLocaleString()} 人。` : ''}`;
    if (t && !seen) { seen = true; try { localStorage.setItem('azakei_kanzei', '1'); } catch (e) {} }
  };
  box.addEventListener('input', e => { const s = e.target.closest('[data-s="t"]'); if (s) { t = +s.value; paint(); } });
  box.addEventListener('change', e => { const s = e.target.closest('[data-s="retal"]'); if (s) { retal = s.checked; paint(); } });
  paint();
})();
