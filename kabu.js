/* ================================================================
   kabu.js — 経済ラボ：株式会社をつくろう（出したお金のぶんだけ株をもち、配当と「決める力」が分かれる）
   ・1 株 = 1,000 円。出資額・利益・配当にまわす割合は、しくみを見るための「たとえ」
   ・株の割合 → 円グラフ。半分をこえる人がいると「1 人で決められる」（過半数）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-kabu]');
  if (!box) return;
  const ONE = 1000;
  const P = [{ k: 'a', name: 'A さん', c: '#b5432f', v: 30000 }, { k: 'b', name: 'B さん', c: '#2f6b3a', v: 15000 }, { k: 'c', name: 'C さん', c: '#d49a2a', v: 5000 }];
  const yen = n => Math.round(n).toLocaleString('ja-JP') + ' 円';
  const R = 15.9155; // 円周がちょうど 100 になる半径
  box.innerHTML = `
    <div class="kb-step"><p class="kb-k"><span>1</span>3 人で、お金を出しあって会社をつくる（1 株 = ${ONE.toLocaleString('ja-JP')} 円）</p>
      <div class="kb-people">${P.map(p => `
        <label class="kb-p" style="--c:${p.c}"><span class="kb-name"><i></i>${p.name}</span>
          <b data-o="v-${p.k}"></b><small data-o="s-${p.k}"></small>
          <input type="range" min="1000" max="50000" step="1000" value="${p.v}" data-k="${p.k}" aria-label="${p.name}が出すお金"></label>`).join('')}</div>
    </div>
    <div class="kb-mid">
      <div class="kb-pie">
        <svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="${R}" class="kb-bg"/>${P.map(p => `<circle cx="21" cy="21" r="${R}" class="kb-seg" data-seg="${p.k}" style="stroke:${p.c}"/>`).join('')}<line x1="21" y1="0.5" x2="21" y2="41.5" class="kb-half"/></svg>
        <p class="kb-pie-c"><small>株の合計</small><b data-o="total"></b></p>
      </div>
      <div class="kb-vote" data-o="vote" aria-live="polite"></div>
    </div>
    <div class="kb-step"><p class="kb-k"><span>2</span>1 年後。もうけ（利益）を、どう分ける？</p>
      <div class="kb-ctrl">
        <label><span>今年の利益 <b data-o="profit"></b></span><input type="range" min="0" max="100000" step="5000" value="40000" data-k="profit"></label>
        <label><span>配当にまわす割合 <b data-o="ratio"></b></span><input type="range" min="0" max="100" step="10" value="50" data-k="ratio"></label>
      </div>
      <div class="kb-split"><span class="kb-div" data-o="divbar"></span><span class="kb-keep" data-o="keepbar"></span></div>
      <p class="kb-split-l"><span><i class="is-div"></i>株主に配当 <b data-o="div"></b></span><span><i class="is-keep"></i>会社に残す（次の年の準備に） <b data-o="keep"></b></span></p>
      <div class="kb-pay" data-o="pay"></div>
    </div>
    <p class="kb-note" data-o="note"></p>
    <p class="in-foot">※ 金額や割合は、しくみを見るための「たとえ」です。実際の会社では、配当や大事なことは株主総会などで決めます。</p>`;
  const $ = k => box.querySelector(`[data-o="${k}"]`);
  const val = k => +box.querySelector(`[data-k="${k}"]`).value;
  const draw = () => {
    const sh = P.map(p => val(p.k) / ONE), tot = sh.reduce((a, b) => a + b, 0);
    let off = 0;
    P.forEach((p, i) => {
      const pct = sh[i] / tot * 100;
      $(`v-${p.k}`).textContent = yen(val(p.k));
      $(`s-${p.k}`).textContent = `${sh[i]} 株（${Math.round(pct)}%）`;
      const seg = box.querySelector(`[data-seg="${p.k}"]`);
      seg.style.strokeDasharray = `${pct} ${100 - pct}`; seg.style.strokeDashoffset = `${25 - off}`;
      off += pct;
    });
    $('total').textContent = `${tot} 株`;
    const top = sh.indexOf(Math.max(...sh)), topPct = sh[top] / tot * 100;
    $('vote').innerHTML = topPct > 50
      ? `<p class="kb-v-k">新しいメニューを出す？ 多数決をすると……</p><p class="kb-v-t"><b style="color:${P[top].c}">${P[top].name}</b>だけで、半分をこえる <b>${Math.round(topPct)}%</b>。<br>1 人で決められます（過半数）。</p>`
      : `<p class="kb-v-k">新しいメニューを出す？ 多数決をすると……</p><p class="kb-v-t">だれも半分をこえていません（いちばん多い人で <b>${Math.round(topPct)}%</b>）。<br><b>2 人以上が賛成</b>しないと決まりません。</p>`;
    const profit = val('profit'), ratio = val('ratio') / 100, div = Math.floor(profit * ratio), keep = profit - div;
    $('profit').textContent = yen(profit); $('ratio').textContent = `${val('ratio')}%`;
    $('div').textContent = yen(div); $('keep').textContent = yen(keep);
    $('divbar').style.width = profit ? (div / profit * 100) + '%' : '0%'; $('keepbar').style.width = profit ? (keep / profit * 100) + '%' : '0%';
    const per = tot ? div / tot : 0, max = Math.max(...sh) * per || 1;
    $('pay').innerHTML = `<p class="kb-per">1 株あたりの配当 <b>${yen(per)}</b></p>` + P.map((p, i) => `
      <div class="kb-row" style="--c:${p.c}"><span>${p.name}</span><span class="kb-track"><i style="width:${sh[i] * per / max * 100}%"></i></span><b>${yen(sh[i] * per)}</b></div>`).join('');
    $('note').innerHTML = `出したお金が多い人ほど株を多くもち、<b>配当</b>も<b>決める力</b>も大きくなります。もうけを全部配らずに会社に残すと、そのお金で次の年に新しい道具を買ったり、お店を広げたりできます。これが<b>株式会社</b>の基本のしくみです。`;
  };
  box.addEventListener('input', e => { if (e.target.matches('input[type=range]')) draw(); });
  draw();
})();

/* ================================================================
   v348：「クレープ会社の社長 5 年」— 株で集める？ 借りる？ 配当は？ 株主総会は？
   ・あなたは 60 株、友だちが 40 株（1 株 1 万円から）。毎年 1 つ、会社を大きくするチャンスが来る
   ・お金の集め方：新しい株を売る（会社のお金はふえるが、あなたの持ち分の割合がへる）／銀行から借りる（利子 6%）／見送る
   ・1 年の利益が出たら、配当にまわす割合を決める（株主はよろこぶが、会社に残るお金はへる）
   ・3 年目と 5 年目は株主総会。あなたの持ち分が半分より少なく、株主の満足が低いと、社長を交代させられる
   ・最後に「あなたの財産」＝ 持ち分 × 会社の価値 ＋ 受け取った配当（会社の価値は、手元のお金 − 借金 ＋ 利益の 5 年分、というたとえ）
   ・自己ベストは azakei_kabu_best（万円）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-kabu]');
  if (!box) return;
  if (!document.querySelector('link[href^="kbgame.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'kbgame.css?v=20261126h'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_kabu_best', YEARS = 5;
  const getB = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const man = n => `${Math.round(n).toLocaleString('ja-JP')} 万円`;
  /* チャンス [一字, 名前, 必要なお金, うまくいくと毎年ふえる利益, うまくいく確率 %, ひとこと] */
  const CH = [
    ['餅', '新メニュー「いちご大福クレープ」', 40, 15, 75, '試食会の評判はよい。材料と道具に少しお金がかかる'],
    ['宣', 'SNS で広告を出す', 60, 22, 70, 'フォロワーがふえれば、遠くからもお客さんが来る'],
    ['車', 'キッチンカーを買う', 120, 40, 80, 'イベントや公園に出かけて売れる'],
    ['店', '駅前に 2 号店を出す', 250, 90, 65, '人通りは多いが、家賃も高い'],
    ['冷', '冷凍クレープを全国のスーパーへ', 300, 140, 50, '当たれば大きい。でも工場づくりは初めて']
  ];
  const g = document.createElement('div');
  g.className = 'kg2';
  box.before(g);
  box.insertAdjacentHTML('beforebegin', '<p class="kg2-sub"><span aria-hidden="true">験</span>じっくりためす：3 人で出しあうと、配当と決める力は？</p>');
  let S = null;
  const value = () => Math.max(1, S.cash - S.debt + S.profit * 5);
  const pct = () => S.mine / S.shares;
  const intro = () => {
    const b = getB();
    g.innerHTML = `<div class="kg2-intro">
      <div class="kg2-art" aria-hidden="true"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#f3d27a" stroke-width="20" stroke-dasharray="150.8 251.3" transform="rotate(-90 50 50)"/><circle cx="50" cy="50" r="40" fill="none" stroke="#5aa7c7" stroke-width="20" stroke-dasharray="100.5 251.3" stroke-dashoffset="-150.8" transform="rotate(-90 50 50)"/></svg><b>株</b></div>
      <div><p class="kg2-kicker">経営ゲーム</p><h3 class="kg2-h">クレープ会社の社長 5 年</h3>
      <p class="kg2-p">文化祭で人気だったクレープ屋さんを、株式会社にしました。あなたは 60 株、友だちが 40 株を持っています。毎年 1 つ、会社を大きくするチャンスが来ます。お金は、新しい株を売って集める？ 銀行から借りる？ もうけは配当で配る？ 会社に残す？ 持ち分が半分を切ると、株主総会で社長を交代させられるかもしれません。</p>
      <p class="kg2-best">${b ? `自己ベスト（あなたの財産）<b>${man(b)}</b>` : 'はじめての経営'}</p>
      <button type="button" class="kg2-go" data-kg2="start">会社をはじめる</button></div></div>`;
  };
  const pie = () => {
    const C = 2 * Math.PI * 40, m = C * pct();
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="#5aa7c7" stroke-width="20"/><circle cx="50" cy="50" r="40" fill="none" stroke="#f3d27a" stroke-width="20" stroke-dasharray="${m.toFixed(1)} ${(C - m).toFixed(1)}" transform="rotate(-90 50 50)" style="transition:stroke-dasharray .8s"/><line x1="50" y1="2" x2="50" y2="18" stroke="#fff" stroke-width="2"/><line x1="50" y1="82" x2="50" y2="98" stroke="#fff" stroke-width="2" stroke-dasharray="3 2"/></svg><p><b>${Math.round(pct() * 100)}%</b><small>あなた</small></p>`;
  };
  const board = () => `<div class="kg2-board">
      <div class="kg2-pie">${pie()}</div>
      <div class="kg2-nums">
        <div><small>会社の手元</small><b>${man(S.cash)}</b></div>
        <div><small>借金</small><b class="${S.debt ? 'is-ng' : ''}">${man(S.debt)}</b></div>
        <div><small>1 年の利益</small><b>${man(S.profit)}</b></div>
        <div><small>株主の満足</small><b class="${S.happy < 50 ? 'is-ng' : 'is-ok'}">${Math.round(S.happy)}</b></div>
        <div><small>株 あなた/全部</small><b>${Math.round(S.mine)} / ${Math.round(S.shares)}</b></div>
        <div><small>受け取った配当</small><b>${man(S.div)}</b></div>
      </div></div>`;
  const start = () => { S = { y: 0, cash: 100, debt: 0, base: 20, profit: 20, mine: 60, shares: 100, happy: 60, div: 0, log: [], out: false }; chance(); };
  const chance = () => {
    if (S.y >= YEARS) return finish();
    const c = CH[S.y], price = value() / S.shares, newSh = c[2] / price, after = S.mine / (S.shares + newSh);
    S.c = c;
    g.innerHTML = `<div class="kg2-play">
      <div class="kg2-top"><span class="kg2-n">${S.y + 1} 年目 / ${YEARS}</span>${S.y === 2 || S.y === 4 ? '<span class="kg2-meet">この年の終わりに株主総会</span>' : ''}</div>
      ${board()}
      <div class="kg2-card">
        <span class="kg2-seal" aria-hidden="true">${c[0]}</span>
        <div><p class="kg2-ct">チャンス：${c[1]}</p><p class="kg2-cd">${c[5]}</p>
        <p class="kg2-cn">必要なお金 <b>${man(c[2])}</b>・うまくいくと毎年の利益 <b>＋${man(c[3])}</b>・うまくいく見こみ <b>${c[4] >= 75 ? '高い' : c[4] >= 60 ? 'ふつう' : '五分五分'}</b></p></div>
      </div>
      <p class="kg2-ask">お金は、どうする？</p>
      <div class="kg2-opts">
        <button type="button" data-fund="stock"><b>新しい株を売って集める</b><small>1 株 ${man(price)} で ${Math.round(newSh)} 株を投資家に売る。返さなくてよいが、あなたの持ち分は ${Math.round(pct() * 100)}% → ${Math.round(after * 100)}% に</small></button>
        <button type="button" data-fund="loan"><b>銀行から借りる</b><small>持ち分はそのまま。毎年 6%（${man(c[2] * 0.06)}）の利子がかかり、借金は最後に返す</small></button>
        <button type="button" data-fund="cash"${S.cash >= c[2] ? '' : ' disabled'}><b>会社の手元のお金で払う</b><small>${S.cash >= c[2] ? `手元のお金 ${man(S.cash)} から出す` : `手元のお金（${man(S.cash)}）が足りない`}</small></button>
        <button type="button" data-fund="skip"><b>今年は見送る</b><small>お金は使わない。チャンスもなし</small></button>
      </div></div>`;
  };
  const fund = how => {
    const c = S.c, lines = [];
    let did = how !== 'skip';
    if (how === 'stock') { const price = value() / S.shares, n = c[2] / price; S.shares += n; S.cash += c[2]; S.happy -= 4; lines.push(['株', `新しい株を ${Math.round(n)} 株売って、${man(c[2])} を集めた。あなたの持ち分は ${Math.round(pct() * 100)}% に`]); }
    if (how === 'loan') { S.debt += c[2]; S.cash += c[2]; lines.push(['借', `銀行から ${man(c[2])} を借りた`]); }
    if (did) {
      S.cash -= c[2];
      if (Math.random() * 100 < c[4]) { S.base += c[3]; lines.push(['成', `「${c[1]}」は大成功！ 毎年の利益が ${man(c[3])} ふえた`, 1]); }
      else { lines.push(['失', `「${c[1]}」は、うまくいかなかった。使ったお金はもどらない`, -1]); S.happy -= 6; }
    } else lines.push(['見', '今年は見送った']);
    const interest = Math.round(S.debt * 0.06);
    S.profit = Math.round(S.base * (0.85 + Math.random() * 0.3)) - interest;
    lines.push(['利', `今年の利益は ${man(S.profit)}${interest ? `（借金の利子 ${man(interest)} を引いたあと）` : ''}`, S.profit >= 0 ? 1 : -1]);
    S.cash += S.profit;
    S.lines = lines; S.how = how;
    divide();
  };
  const divide = () => {
    const p = Math.max(0, S.profit);
    g.innerHTML = `<div class="kg2-play">
      <div class="kg2-top"><span class="kg2-n">${S.y + 1} 年目の終わり</span></div>
      <ol class="kg2-lines">${S.lines.map((x, i) => `<li class="${x[2] > 0 ? 'is-ok' : x[2] < 0 ? 'is-ng' : ''}" style="--d:${i * (reduce ? 0 : .3)}s"><span aria-hidden="true">${x[0]}</span><p>${x[1]}</p></li>`).join('')}</ol>
      ${board()}
      <p class="kg2-ask">${p ? `利益 ${man(p)} のうち、いくらを配当で株主に配る？` : '今年は利益がないので、配当は出せません。'}</p>
      <div class="kg2-opts is-3">${p ? [0, 0.5, 1].map(r => `<button type="button" data-div="${r}"><b>${r === 0 ? '配らない' : r === 0.5 ? '半分配る' : '全部配る'}</b><small>${r === 0 ? '全部を会社に残して、次に使う' : `${man(p * r)} を配る（あなたには ${man(p * r * pct())}）`}</small></button>`).join('') : '<button type="button" data-div="0"><b>次へ</b><small>株主は少しがっかり</small></button>'}</div></div>`;
  };
  const meeting = () => {
    const mine = pct(), keep = mine >= 0.5 || S.happy >= 50;
    const lines = [`あなたの持ち分 ${Math.round(mine * 100)}%・株主の満足 ${Math.round(S.happy)}`];
    lines.push(mine >= 0.5 ? '持ち分が半分以上なので、あなたの賛成だけで決められます。' : S.happy >= 50 ? '持ち分は半分を切っていますが、株主はあなたの経営に満足しています。' : '持ち分が半分を切り、株主の満足も低い……');
    lines.push(keep ? '株主総会は、あなたが社長を続けることに賛成しました。' : '株主総会で「社長を交代させよう」という案が、賛成多数で決まりました。');
    return { keep, html: `<div class="kg2-meet-box ${keep ? 'is-ok' : 'is-ng'}"><p class="kg2-mh"><span aria-hidden="true">総</span>株主総会</p>${lines.map(l => `<p>${l}</p>`).join('')}</div>` };
  };
  const afterDiv = r => {
    const p = Math.max(0, S.profit), d = p * r;
    S.cash -= d; S.div += d * pct();
    S.happy += r === 0 ? (S.how !== 'skip' ? 2 : -6) : r === 0.5 ? 6 : 10;
    if (S.profit > 0 && S.how === 'skip') S.happy -= 2;
    S.happy = Math.max(0, Math.min(100, S.happy));
    S.log.push({ y: S.y + 1, c: S.c[1], how: { stock: '株', loan: '借金', cash: '手元', skip: '見送り' }[S.how], profit: S.profit, pct: pct() });
    let mt = '';
    if (S.y === 2 || S.y === 4) { const m = meeting(); mt = m.html; if (!m.keep) S.out = true; }
    S.y++;
    if (S.out || mt) {
      g.innerHTML = `<div class="kg2-play">${mt}<button type="button" class="kg2-go" data-kg2="${S.out ? 'end' : 'next'}">${S.out ? '結果を見る' : `${S.y + 1} 年目へ`}</button></div>`;
    } else chance();
  };
  const TITLE = [[700, '名社長'], [450, 'たよれる社長'], [250, '一人前の社長'], [-1e9, '見習い社長']];
  const finish = () => {
    if (S.debt) { S.cash -= S.debt; }
    const v = Math.max(0, S.cash + S.profit * 5), mineV = v * pct(), total = Math.round(mineV + S.div);
    const prev = getB(), best = !S.out && total > prev;
    if (best) { try { localStorage.setItem(KEY, String(total)); localStorage.setItem('azakei_kabu', '1'); } catch (e) {} }
    g.innerHTML = `<div class="kg2-end">
      <p class="kg2-kicker">${S.out ? '社長交代' : '5 年の決算'}</p>
      <p class="kg2-big"><small>あなたの財産</small><b>${man(total)}</b></p>
      <p class="kg2-title"><span aria-hidden="true">称</span>${S.out ? '株主に交代させられた社長' : TITLE.find(x => total >= x[0])[1]}${best && prev ? '<em>自己ベスト更新</em>' : prev ? `<small>自己ベスト ${man(prev)}</small>` : ''}</p>
      <p class="kg2-eq">会社の価値 ${man(v)} × あなたの持ち分 ${Math.round(pct() * 100)}% ＝ ${man(mineV)}、受け取った配当 ${man(S.div)}${S.debt ? `（借金 ${man(S.debt)} は最後に返した）` : ''}</p>
      <table class="kg2-tab"><thead><tr><th>年</th><th>チャンス</th><th>集め方</th><th>利益</th><th>持ち分</th></tr></thead><tbody>${S.log.map(x => `<tr><th>${x.y}</th><td>${x.c}</td><td>${x.how}</td><td>${man(x.profit)}</td><td>${Math.round(x.pct * 100)}%</td></tr>`).join('')}</tbody></table>
      <div class="kg2-learn"><p><b>株で集めたお金は返さなくてよいけれど、会社を持つ人がふえて、あなたの割合はへります。</b>借金なら割合はそのままですが、利子がかかり、うまくいかなくても返さなければなりません。</p>
      <p>株主総会では、ふつう 1 株 1 票で決めます。半分より多くの株を持っていれば、自分の賛成だけで決められることがふえます。配当をたくさん配ると株主はよろこびますが、会社に残るお金はへります。どれにも、よい面と心配な面があります。</p></div>
      <button type="button" class="kg2-go" data-kg2="start">もう一度会社をはじめる</button></div>`;
    window.AZAKEI_TALK && window.AZAKEI_TALK(g, 'kabu', S.out ? TITLE.length - 1 : TITLE.findIndex(x => total >= x[0]), TITLE.length);
  };
  g.addEventListener('click', e => {
    const f = e.target.closest('[data-fund]'); if (f && !f.disabled) { fund(f.dataset.fund); return; }
    const d = e.target.closest('[data-div]'); if (d) { afterDiv(+d.dataset.div); return; }
    const a = e.target.closest('[data-kg2]'); if (!a) return;
    const k = a.dataset.kg2;
    if (k === 'start') start(); else if (k === 'next') chance(); else if (k === 'end') finish();
    if (k !== 'start' && g.getBoundingClientRect().top < 0) g.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  });
  intro();
})();
