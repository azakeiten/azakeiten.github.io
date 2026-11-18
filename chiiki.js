/* ================================================================
   chiiki.js — 経済ラボ：めぐる町のお金（地域通貨）（近づいてから読みこむ）
   ・町の人が 1 万円を使う。受けとったお店は、そのお金の一部を町のお店で使い、残りは町の外（大きなチェーン・通販・仕入れ）へ
   ・「町のお店で使う割合」と「地域通貨（町の中だけで使える券。1 万円で 1 万 1 千円分）」を決めて、お金をめぐらせる
   ・コインがお店からお店へ跳び、町の外へ出ていく分は小さなコインになって門から出ていく
   ・町の中で生まれた売上の合計・めぐった回数・町の外へ出たお金をくらべる（地域の中でお金が回る「乗数」のしくみ）
   ・数字はすべてたとえ。見た目は chiiki.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-chiiki]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="chiiki.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'chiiki.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const yen = n => Math.round(n).toLocaleString() + ' 円';
  const SHOPS = [['パ', 'パン屋'], ['八', '八百屋'], ['床', '床屋'], ['本', '本屋'], ['工', '工務店'], ['喫', 'カフェ']];
  const CX = 260, CY = 170, RAD = 118;
  const pos = i => { const a = -Math.PI / 2 + i * Math.PI * 2 / SHOPS.length; return [CX + Math.cos(a) * RAD, CY + Math.sin(a) * RAD * .78]; };
  // 地域通貨：町の中でしか使えないので、最初の 3 回は 9 割が町に残る。そのあと円にかえる（手数料 3%）
  const CUR_KEEP = .9, CUR_HOPS = 3, FEE = .03;
  let local = 30, cur = false, busy = false, best = 0;
  try { best = +localStorage.getItem('azakei_chiiki') || 0; } catch (e) {}

  box.innerHTML = `
    <div class="mg-town">
      <svg class="mg-map" viewBox="0 0 520 340" role="img" aria-label="町のお店のあいだを、お金がめぐるようす">
        <defs><radialGradient id="mgPlaza"><stop offset="0" stop-color="#fff6dc"/><stop offset="1" stop-color="#efe0b8"/></radialGradient></defs>
        <rect width="520" height="340" fill="#cfe5c4"/>
        <ellipse cx="${CX}" cy="${CY}" rx="${RAD + 34}" ry="${RAD * .78 + 34}" fill="url(#mgPlaza)" stroke="#c9b48a" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>
        <g class="mg-gate" transform="translate(486 170)"><rect x="-20" y="-46" width="40" height="92" rx="8" fill="#5a6470"/><text y="-54" text-anchor="middle" class="mg-out-t">町の外</text><text y="6" text-anchor="middle" class="mg-gate-t">門</text></g>
        <g data-k="trail"></g>
        ${SHOPS.map(([s, n], i) => { const [x, y] = pos(i); return `<g class="mg-shop" data-i="${i}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><path d="M-30 -10 L0 -34 L30 -10 Z" class="mg-roof"/><rect x="-26" y="-10" width="52" height="38" rx="4" class="mg-wall"/><text y="16" text-anchor="middle" class="mg-seal">${s}</text><text y="44" text-anchor="middle" class="mg-name">${n}</text>${i === 0 || i === 3 ? `<text y="-40" text-anchor="middle" class="mg-sale" data-k="s${i}"></text>` : `<text x="${i < 3 ? 34 : -34}" y="4" text-anchor="${i < 3 ? 'start' : 'end'}" class="mg-sale" data-k="s${i}"></text>`}</g>`; }).join('')}
        <g class="mg-center" transform="translate(${CX} ${CY})"><text y="-8" text-anchor="middle" class="mg-c-h">町の売上</text><text y="18" text-anchor="middle" class="mg-c-n" data-k="sum">0 円</text></g>
        <g data-k="fly"></g>
      </svg>
      <div class="mg-stats"><p><small>めぐった回数</small><b data-k="hops">0</b></p><p><small>町の中の売上</small><b data-k="sum2">0 円</b></p><p class="is-out"><small>町の外へ出たお金</small><b data-k="out">0 円</b></p><p><small>1 万円の何倍？</small><b data-k="mul">—</b></p></div>
      <p class="mg-msg" data-k="msg" aria-live="polite">町のお店で使う割合を決めて、「1 万円を使う」を押そう。</p>
    </div>
    <div class="mg-side">
      <label class="mg-sl"><span>受けとったお金のうち、町のお店で使う割合</span><output data-k="local">30%</output><input type="range" min="10" max="90" step="10" value="30" data-s="local"></label>
      <p class="mg-hint">のこりは、町の外の大きなチェーンやネット通販、町の外からの仕入れに使われます。</p>
      <label class="mg-sw"><input type="checkbox" data-s="cur"><span></span><b>地域通貨で配る</b><small>1 万円で 1 万 1 千円分。町の中のお店でしか使えない</small></label>
      <button type="button" class="mg-go" data-a="go">1 万円を使う</button>
      <div class="mg-res" hidden></div>
    </div>
    <div class="mg-learn">
      <p><b>お金は、めぐるほど町をうるおす</b>同じ 1 万円でも、受けとった人がまた町で使えば、パン屋の売上が八百屋の売上に、八百屋の売上が床屋の売上に……と、何回も売上を生みます。町の外で使われた分は、そこで町からぬけていきます。</p>
      <p><b>何倍になる？</b>町に残る割合が 3 割なら、売上の合計は 1 万円のおよそ 1.4 倍。7 割なら、およそ 3.3 倍。残る割合が大きいほど、合計は大きくなります。お金がめぐって何倍にもなるしくみを「乗数効果」とよびます。</p>
      <p><b>地域通貨</b>その地域の中でしか使えないお金や券です。町の外へぬけにくいので、町の中でめぐりやすくなります。お祭りやプレミアム付き商品券などで、多くの町が取り入れています。</p>
      <p><b>よいことばかり？</b>使えるお店がかぎられる、円にかえるときに手数料がかかる、配るためのお金（税金）が必要、などの面もあります。麻布経済展の「券」も、会場の中だけでめぐるお金のしくみです。</p>
    </div>
    <p class="mg-note">お店・割合・地域通貨のしくみは、しくみを知るための「たとえ」です。実際の地域通貨のルールは、町ごとにちがいます。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const shops = [...box.querySelectorAll('.mg-shop')];
  const clear = () => {
    K('trail').innerHTML = ''; K('fly').innerHTML = ''; shops.forEach((s, i) => { s.classList.remove('is-hit'); K('s' + i).textContent = ''; });
    ['hops', 'sum', 'sum2', 'out'].forEach(k => { K(k).textContent = k === 'hops' ? '0' : '0 円'; }); K('mul').textContent = '—';
    box.querySelector('.mg-res').hidden = true;
  };
  const coin = (from, to, cls, ms) => new Promise(res => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('r', cls === 'is-leak' ? 5 : 9); c.setAttribute('class', 'mg-coin ' + cls);
    c.style.setProperty('--fx', from[0] + 'px'); c.style.setProperty('--fy', from[1] + 'px'); c.style.setProperty('--tx', to[0] + 'px'); c.style.setProperty('--ty', to[1] + 'px');
    c.style.animationDuration = (reduce ? 0 : ms) + 'ms';
    K('fly').appendChild(c);
    setTimeout(() => { c.remove(); res(); }, reduce ? 0 : ms);
  });
  const run = async () => {
    if (busy) return; busy = true; box.classList.add('is-busy'); clear();
    const r = local / 100, start = cur ? 11000 : 10000;
    let amt = start, sum = 0, out = 0, hops = 0, at = [CX, 330], last = -1;
    const sales = SHOPS.map(() => 0);
    K('msg').textContent = cur ? '町の人が、1 万円で 1 万 1 千円分の地域通貨を使います。' : '町の人が、町のお店で 1 万円を使います。';
    while (amt >= 100 && hops < 24) {
      let i; do { i = Math.random() * SHOPS.length | 0; } while (i === last); last = i;
      const to = pos(i);
      await coin(at, to, cur && hops < CUR_HOPS ? 'is-cur' : '', hops < 8 ? 520 : 240);
      hops++; sum += amt; sales[i] += amt;
      shops[i].classList.remove('is-hit'); void shops[i].getBoundingClientRect(); shops[i].classList.add('is-hit');
      K('s' + i).textContent = '+' + yen(sales[i]);
      K('trail').insertAdjacentHTML('beforeend', `<line x1="${at[0]}" y1="${at[1]}" x2="${to[0]}" y2="${to[1]}" class="mg-path${cur && hops <= CUR_HOPS ? ' is-cur' : ''}"/>`);
      K('hops').textContent = hops; K('sum').textContent = yen(sum); K('sum2').textContent = yen(sum); K('mul').textContent = (sum / 10000).toFixed(1) + ' 倍';
      const keep = cur && hops <= CUR_HOPS ? CUR_KEEP : r;
      let next = amt * keep, leak = amt - next;
      if (cur && hops === CUR_HOPS) { const fee = next * FEE; leak += fee; next -= fee; }
      out += leak; K('out').textContent = yen(out);
      K('msg').textContent = `${hops} 回目：${SHOPS[i][1]}が ${yen(amt)} を受けとり、${yen(next)} を町で使い、${yen(leak)} が町の外へ。${cur && hops === CUR_HOPS ? '（ここで地域通貨を円にかえました）' : ''}`;
      coin(to, [486, 170], 'is-leak', 700);
      amt = next; at = to;
      await sleep(hops < 8 ? 260 : 90);
    }
    // まだ 100 円以上残っていたら、このあともめぐり続ける分をまとめて足す
    let more = false;
    if (amt >= 100) { more = true; sum += amt / (1 - r); K('sum').textContent = yen(sum); K('sum2').textContent = yen(sum); K('mul').textContent = (sum / 10000).toFixed(1) + ' 倍'; }
    out = start; K('out').textContent = yen(out);
    const mul = sum / 10000;
    K('msg').textContent = `お金は町を ${hops} 回${more ? '以上' : ''}めぐり、町の中で ${yen(sum)} の売上が生まれました。1 万円の ${mul.toFixed(1)} 倍です。`;
    const res = box.querySelector('.mg-res');
    const isBest = mul > best;
    if (isBest) { best = mul; try { localStorage.setItem('azakei_chiiki', mul.toFixed(1)); } catch (e) {} }
    res.innerHTML = `<p class="mg-r-h"><span aria-hidden="true">巡</span>${mul.toFixed(1)} 倍<small>${isBest ? 'この実験での最高記録！' : `最高は ${best.toFixed(1)} 倍`}</small></p>
      <ul class="mg-r-list"><li><small>町に残る割合 ${local}% で、地域通貨なしなら</small><b>${(1 / (1 - r)).toFixed(1)} 倍</b></li><li><small>同じ割合で、地域通貨ありなら</small><b>${(() => { let a = 11000, s = 0; for (let h = 1; a >= 1 && h < 60; h++) { s += a; let n = a * (h <= CUR_HOPS ? CUR_KEEP : r); if (h === CUR_HOPS) n *= 1 - FEE; a = n; } return (s / 10000).toFixed(1); })()} 倍</b></li></ul>
      <p class="mg-r-tip">${local <= 30 ? '町のお店で使う割合を上げると、めぐる回数がふえます。' : cur ? '地域通貨の分、最初の何回かは町に残りやすくなりました。' : '「地域通貨で配る」もためしてみよう。'}</p>`;
    res.hidden = false;
    busy = false; box.classList.remove('is-busy');
  };
  box.addEventListener('input', e => { const s = e.target.closest('[data-s="local"]'); if (s && !busy) { local = +s.value; K('local').textContent = local + '%'; clear(); } });
  box.addEventListener('change', e => { const s = e.target.closest('[data-s="cur"]'); if (s && !busy) { cur = s.checked; clear(); } });
  box.addEventListener('click', e => { if (e.target.closest('[data-a="go"]')) run(); });
})();
