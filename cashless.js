/* ================================================================
   cashless.js — あそび場：店長のレジ（キャッシュレス）（近づいてから読みこむ）
   ・あなたは 1 つ 1,000 円のお弁当屋さんの店長。1 日に 100 人が来る
   ・現金・カード・QR コードのどれを受け付けるかを決めて、1 日営業する
   ・お客さんが 1 人ずつレジに並び、払い方の色の点になる。受け付けていない払い方の人は、現金にかえるか、帰ってしまう
   ・売上・手数料・現金の手間・手元に残るお金・逃したお客さん・「今日入るお金」と「あとで入るお金」を見る
   ・割合・手数料・入金日はすべてたとえ。見た目は cashless.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-cashless]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="cashless.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'cashless.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const yen = n => Math.round(n).toLocaleString() + ' 円';
  const PRICE = 1000, N = 100;
  // 払い方：[キー, 名前, 印, 使いたい人の割合, お店が払う手数料, お金が入る日, 説明]（すべてたとえ）
  const PAY = [['cash', '現金', '現', .35, 0, '今日', 'お札と小銭。手数料はないけれど、数える・両替する・守る手間がかかる'],
               ['card', 'カード', 'カ', .30, .032, '来月', 'クレジットカード。お店は手数料を払い、お金はあとでまとめて入る'],
               ['qr', 'QR コード', 'Q', .35, .025, '数日後', 'スマホで読みとる。お店は手数料を払い、お金は数日後に入る']];
  const CASH_COST = 1500;   // 現金を受け付ける日の手間（レジ締め・両替・銀行へ行く時間。たとえ）
  const SWITCH = .55;        // 使いたい払い方がないとき、現金にかえて買う人の割合（たとえ）
  let acc = { cash: true, card: false, qr: false }, busy = false;

  box.innerHTML = `
    <div class="cl-shop">
      <div class="cl-sign"><span class="cl-seal" aria-hidden="true">弁</span><div><p class="cl-name">麻経べんとう</p><p class="cl-sub">お弁当 1 つ <b>1,000 円</b>・1 日 <b>100 人</b>が来る</p></div><div class="cl-stick" data-k="stick" aria-hidden="true"></div></div>
      <div class="cl-floor">
        <div class="cl-line" data-k="line" aria-hidden="true"></div>
        <div class="cl-register"><span class="cl-reg-t">レジ</span><b data-k="reg">0 円</b></div>
      </div>
      <div class="cl-grid" data-k="grid" aria-hidden="true">${'<i></i>'.repeat(N)}</div>
      <p class="cl-legend">${PAY.map(([k, n]) => `<span><i class="is-${k}"></i>${n}</span>`).join('')}<span><i class="is-lost"></i>帰ってしまった人</span></p>
      <p class="cl-msg" data-k="msg" aria-live="polite">受け付ける払い方をえらんで、「1 日 営業する」を押そう。</p>
    </div>
    <div class="cl-side">
      <p class="cl-h">受け付ける払い方</p>
      <div class="cl-pays">${PAY.map(([k, n, s, share, fee, when, d]) => `
        <label class="cl-pay is-${k}"><input type="checkbox" data-p="${k}"${acc[k] ? ' checked' : ''}><span class="cl-ps" aria-hidden="true">${s}</span><span class="cl-pt"><b>${n}</b><small>使いたい人 ${Math.round(share * 100)}%・手数料 ${fee ? (fee * 100).toFixed(1) + '%' : 'なし'}・入金 ${when}</small><small class="cl-pd">${d}</small></span></label>`).join('')}</div>
      <button type="button" class="cl-go" data-a="go">1 日 営業する</button>
      <div class="cl-res" hidden></div>
    </div>
    <div class="cl-learn">
      <p><b>手数料は、お店が払う</b>カードや QR コードで払うと、お店は売上の数 % を手数料として会社に払います。そのかわり、現金を数えたり守ったりする手間がへり、現金を持たないお客さんも来てくれます（<a href="glossary.html#cashless">キャッシュレス決済</a>・<a href="glossary.html#fee">手数料</a>）。</p>
      <p><b>お金が入るのは、あとから</b>キャッシュレスの売上は、すぐには手元に来ません。仕入れやアルバイト代を払うお金が、その日に足りるかどうかも大切です（<a href="glossary.html#cash-flow">キャッシュフロー</a>）。</p>
      <p><b>ポイントはどこから？</b>お客さんがもらうポイントの多くは、決済の会社が、お店から受けとる手数料などを使って配っています。</p>
      <p><b>正解はひとつではない</b>お客さんの多い駅前と、お年寄りの多い商店街では、えらぶ払い方がちがいます。だれが来るお店かを考えて決めよう。</p>
    </div>
    <p class="cl-note">払い方ごとの割合・手数料・入金日・現金の手間は、しくみを知るための「たとえ」です。実際の条件は、会社やお店によってちがいます。</p>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const dots = [...box.querySelectorAll('.cl-grid i')];
  const sticker = () => { K('stick').innerHTML = PAY.filter(p => acc[p[0]]).map(([k, n]) => `<span class="is-${k}">${n} OK</span>`).join('') || '<span class="is-none">払い方なし</span>'; };
  const clear = () => { dots.forEach(d => { d.className = ''; }); K('reg').textContent = '0 円'; K('line').innerHTML = ''; box.querySelector('.cl-res').hidden = true; };
  // 100 人の「使いたい払い方」を決める（毎回同じ並びで、くらべやすく）
  const crowd = (() => { const a = []; PAY.forEach(([k, , , share]) => { for (let j = 0; j < Math.round(share * N); j++) a.push(k); }); let s = 7; for (let j = a.length - 1; j > 0; j--) { s = (s * 9301 + 49297) % 233280; const r = Math.floor(s / 233280 * (j + 1)); [a[j], a[r]] = [a[r], a[j]]; } return a.slice(0, N); })();
  const run = async () => {
    if (busy) return; busy = true; box.classList.add('is-busy'); clear();
    if (!PAY.some(p => acc[p[0]])) { K('msg').textContent = 'どの払い方も受け付けていないと、だれも買えません。1 つ以上えらぼう。'; busy = false; box.classList.remove('is-busy'); return; }
    const got = { cash: 0, card: 0, qr: 0 }; let lost = 0, sw = 0, swAcc = 0, reg = 0;
    for (let j = 0; j < N; j++) {
      const want = crowd[j]; let use = null;
      if (acc[want]) use = want;
      else { swAcc += SWITCH; if (acc.cash && swAcc >= 1) { swAcc -= 1; use = 'cash'; sw++; } else if (!acc.cash && acc.qr && want === 'card' && swAcc >= 1) { swAcc -= 1; use = 'qr'; sw++; } else if (!acc.cash && acc.card && want === 'qr' && swAcc >= 1) { swAcc -= 1; use = 'card'; sw++; } }
      const d = dots[j];
      if (use) { got[use]++; reg += PRICE; d.className = 'is-' + use + (use !== want ? ' is-switch' : ''); }
      else { lost++; d.className = 'is-lost'; }
      if (j % 4 === 3 || j === N - 1) {
        K('reg').textContent = yen(reg);
        K('line').innerHTML = crowd.slice(j + 1, j + 9).map(k => `<i class="is-${k}"></i>`).join('');
        K('msg').textContent = use ? `${j + 1} 人目：${PAY.find(p => p[0] === use)[1]}で 1,000 円。${use !== want ? `（${PAY.find(p => p[0] === want)[1]}が使えないので、${PAY.find(p => p[0] === use)[1]}にかえた）` : ''}` : `${j + 1} 人目：${PAY.find(p => p[0] === want)[1]}が使えないので、帰ってしまった……`;
        await sleep(70);
      }
    }
    const sales = reg, fee = PAY.reduce((a, [k, , , , f]) => a + got[k] * PRICE * f, 0), cashCost = acc.cash ? CASH_COST : 0, keep = sales - fee - cashCost;
    const today = got.cash * PRICE - cashCost, later = got.card * PRICE * (1 - PAY[1][4]) + got.qr * PRICE * (1 - PAY[2][4]);
    // いちばんよい組み合わせ（手元に残るお金）
    const combos = []; for (let m = 1; m < 8; m++) combos.push({ cash: !!(m & 1), card: !!(m & 2), qr: !!(m & 4) });
    const sim = a => { const g = { cash: 0, card: 0, qr: 0 }; let s = 0; crowd.forEach(w => { let u = a[w] ? w : null; if (!u) { s += SWITCH; if (a.cash && s >= 1) { s -= 1; u = 'cash'; } else if (!a.cash && a.qr && w === 'card' && s >= 1) { s -= 1; u = 'qr'; } else if (!a.cash && a.card && w === 'qr' && s >= 1) { s -= 1; u = 'card'; } } if (u) g[u]++; }); const sl = (g.cash + g.card + g.qr) * PRICE; return sl - PAY.reduce((x, [k, , , , f]) => x + g[k] * PRICE * f, 0) - (a.cash ? CASH_COST : 0); };
    const best = combos.reduce((b, c) => { const v = sim(c); return v > b.v ? { c, v } : b; }, { c: null, v: -1 });
    const name = c => PAY.filter(p => c[p[0]]).map(p => p[1]).join('・');
    K('msg').textContent = `1 日のおわり。売れたのは ${(N - lost)} 個、帰ってしまったお客さんは ${lost} 人でした。`;
    const res = box.querySelector('.cl-res');
    res.innerHTML = `<ul class="cl-r">
        <li><small>売上</small><b>${yen(sales)}</b></li>
        <li class="is-minus"><small>手数料</small><b>− ${yen(fee)}</b></li>
        <li class="is-minus"><small>現金の手間</small><b>− ${yen(cashCost)}</b></li>
        <li class="is-keep"><small>手元に残るお金</small><b>${yen(keep)}</b></li>
      </ul>
      <div class="cl-when"><p><small>今日入るお金</small><b>${yen(Math.max(0, today))}</b></p><p><small>あとで入るお金</small><b>${yen(later)}</b></p></div>
      <p class="cl-r-lost">帰ってしまったお客さん <b>${lost} 人</b>（${yen(lost * PRICE)} 分）${sw ? `／払い方をかえてくれた人 ${sw} 人` : ''}</p>
      <p class="cl-r-best">${best.v <= keep + 1 ? '<b>いちばん多く残る組み合わせです！</b>' : `いちばん多く残るのは「${name(best.c)}」で ${yen(best.v)}。`}${later > today ? '<br>ただし、お金の多くは「あとで」入ります。今日の仕入れ代が払えるかも考えよう。' : ''}</p>`;
    res.hidden = false;
    busy = false; box.classList.remove('is-busy');
    try { localStorage.setItem('azakei_cashless', '1'); } catch (e) {}
    window.AZAKEI_TALK && window.AZAKEI_TALK(res, 'cashless', best.v <= keep + 1 ? 'top' : lost ? 'low' : 'mid');
  };
  box.addEventListener('change', e => { const p = e.target.closest('[data-p]'); if (p && !busy) { acc[p.dataset.p] = p.checked; sticker(); clear(); } });
  box.addEventListener('click', e => { if (e.target.closest('[data-a="go"]')) run(); });
  sticker();
})();
