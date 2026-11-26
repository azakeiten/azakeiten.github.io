/* ================================================================
   rosen.js — 経済の路線図（rosen.html）
   ・経済ラボ・経済のあそび場・コンテストの体験を、5 つの路線の「駅」にした地図
   ・まん中の「麻経駅」で全部の路線が乗りかえ。線の上を電車が走る
   ・ためした駅（このブラウザの記録：azakei_lab_tried・azakei_play_tried・各体験の記録）には「済」
   ・駅を押すと切符のカード（どんな体験か・次の駅・その駅へ行くボタン）。路線ごとの「何駅まわったか」
   ・地図の下に、同じ内容の一覧（スマホや読み上げでも使える）
   ・見た目は rosen.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-rosen]');
  if (!box) return;
  if (!document.querySelector('link[href^="rosen.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'rosen.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const PAGE = { sim: ['sim.html', '経済ラボ'], quiz: ['quiz.html', '経済のあそび場'], con: ['contests.html', 'コンテスト'] };
  // 路線：[キー, 名前, 色, 印, 駅の並び（左の 6 駅 → 麻経駅 → 右の 6 駅）]
  // 駅：[id, ページ, 短い名前, 名前, ひとこと]
  const L = [
    ['kurashi', 'お金とくらし線', '#d6453a', '暮', [
      ['okozukai', 'sim', 'おこづかい', 'おこづかいチャレンジ', '12 か月、やりくりして自転車を買えるか'], ['kyuyo', 'quiz', '給料明細', 'はじめての給料明細', '2 年目に手取りが減るなぞ'], ['subsc', 'quiz', 'サブスク', 'サブスクと買い切り', '1 年で、払ったお金をくらべる'],
      ['atobarai', 'quiz', 'どう払う', 'ゲーム機、どう払う？', '1 回払い・分割・リボ払い'], ['nefuda', 'quiz', '値札', '値札のマジック', '7 つのしかけを見破る'], ['cashless', 'quiz', '店長のレジ', '店長のレジ', '現金とキャッシュレス'],
      ['imaato', 'quiz', 'いまか後か', 'いま？ それとも あとで？', '待てる力をはかる'], ['otsuri', 'quiz', 'おつり', 'おつりの達人', 'レジの 90 秒'], ['receipt', 'sim', 'レシート', 'レシートの中の税金', '税率レジ 45 秒'],
      ['zeidan', 'quiz', '税の階段', '税の階段', '所得税の 7 段'], ['nenkin', 'quiz', '年金', '胴上げから肩車へ', '年金の村 100 年'], ['hoken', 'sim', '備える箱', 'みんなで備える箱', '保険のしくみを 10 年']]],
    ['shijo', '市場とお店線', '#2f6fb0', '市', [
      ['market', 'sim', '値段', '値段の決まり方', '需要と供給ニュースデスク'], ['seri', 'sim', 'せり', 'せりの会場', 'いちばん高い値をつけた人へ'], ['jika', 'quiz', '時価', 'チケットの値段は時価', '遊園地の 1 週間'],
      ['lemon', 'quiz', 'フリマ', 'フリマのなぞ', '良品が消える市場'], ['koukan', 'quiz', '交換の島', '交換の島', 'お金がない島で取引'], ['cardgame', 'quiz', 'カード勝負', '経済カード勝負', '5 回勝負'],
      ['shop', 'sim', 'お店', '文化祭でお店をひらこう', '模擬店の当日 3 時間'], ['nesage', 'sim', '値下げ競争', 'となりのお店と値下げ競争', '相手を読んで 10 回勝負'], ['uchiwake', 'sim', 'おにぎり', 'おにぎり 1 個の値段の中身', '140 円は、だれのところへ'],
      ['hama', 'con', 'アイス屋', '浜辺のアイス屋さん', 'どこに店を出す？'], ['kessan', 'con', '決算発表', 'パン屋さんの決算発表', '1 年の数字を読む'], ['crossword', 'quiz', 'クロスワード', '経済クロスワード', '14 のカギ']]],
    ['fuyasu', 'お金をふやす線', '#2f8a4a', '殖', [
      ['double', 'sim', '2 倍まで', 'お金が 2 倍になるまで', '72 の法則の早解き 8 問'], ['kuji', 'sim', 'くじ引き', 'くじ引きの期待値', 'くじ屋の店主になって 3 回出店'], ['sim-main', 'sim', 'チップ配分', 'チップ配分', '株・債券・預金に分けて 10 年'],
      ['updown', 'sim', 'チャート', 'チャート予想', '上がる？ 下がる？'], ['quiz', 'quiz', '億万長者', '億万長者クイズ', 'チップを賭けて 2 問'], ['sugoroku', 'quiz', 'すごろく', '経済すごろく', '人生のお金の 12 マス'],
      ['rousoku', 'con', 'ローソク足', 'ローソク足をつくろう', '1 日の値動きを 1 本に'], ['bunsan', 'con', '分散投資', 'ポートフォリオの 10 年', '分けて持つと、どうなる'], ['kabu', 'sim', '株式会社', '株式会社をつくろう', 'クレープ会社の社長を 5 年'],
      ['ginko', 'sim', '銀行', '銀行のふしぎ', '町の銀行の店長を 6 年'], ['cfund', 'con', 'クラファン', 'クラウドファンディングに挑戦', '30 日間の募集'], ['plan-seed', 'con', 'プラン', 'ビジネスプランのたね', '6 つの欄でプランのカード']]],
    ['sekai', '国と世界線', '#c9922e', '国', [
      ['meguri', 'sim', 'めぐり図', 'お金のめぐり', '家計・会社・国・銀行'], ['pazuru', 'sim', 'パズル', 'めぐりパズル', '6 本の矢印に札をはめる'], ['budget', 'sim', '国の予算', '国の予算を 100 円にすると', '5 円玉で予想して予算会議'],
      ['oku', 'sim', '1 億円', '1 億円って、どれくらい？', 'ケタの感覚テスト 6 問'], ['infl', 'sim', 'インフレ', 'インフレのタイムマシン', '実質ジャッジ 40 秒'], ['kinri', 'sim', '景気の舵', '景気の舵とり', '金利で景気をととのえる'],
      ['fx', 'sim', '円高・円安', '円高・円安の両替所', '為替ニュース速報 40 秒'], ['kanzei', 'quiz', '関税', '関税のシーソー', '得する人と損する人'], ['asagohan', 'sim', '朝ごはん', '朝ごはんの世界旅行', '食べものはどこから'],
      ['bungyo', 'sim', '分業', '分業のふしぎ', '文化祭の分担パズル'], ['shimagdp', 'con', '島の GDP', '島の GDP', '島の 1 年をかぞえる'], ['coins', 'quiz', 'お金図鑑', '世界のお金図鑑', '12 の国のお金']]],
    ['rule', 'みんなとルール線', '#7b5fb0', '和', [
      ['koubou', 'sim', '村の税', '仕組みをつくる工房', '10 人の村の税を決める'], ['tsuuka', 'sim', '券の工房', 'お祭りの券の工房', '券のルールを決める'], ['ike', 'sim', 'みんなの池', 'みんなの池', 'とりすぎると……'],
      ['koen', 'quiz', '公園', 'みんなの公園', '出さない人も使える'], ['kawa', 'quiz', '川上の工場', '川上の工場', '環境税をさがす'], ['chiiki', 'sim', 'めぐる町', 'めぐる町のお金', '地域通貨'],
      ['robot', 'sim', 'ロボット', 'ロボットがやってきた工場', '機械化と学び直し'], ['gurafu', 'sim', 'グラフ', 'グラフのうそを見破れ', '5 つのしかけ'], ['hirogari', 'con', 'アプリ', 'アプリが広がるとき', 'つながりで広がる'],
      ['himitsu', 'quiz', '新お札', '新しいお札のひみつ', 'にせもの防止の 6 つ'], ['shinka', 'quiz', 'お金の進化', 'お金の進化', '物々交換から電子マネー'], ['crypto', 'sim', '暗号資産', '暗号資産とブロックチェーン', '台帳を書きかえたら？']]]
  ];
  const PLAZA = [['bakery', 'quiz', '麻経ベーカリー 12 か月（本格経営ゲーム）'], ['taikai', 'quiz', 'みんなでクイズ大会'], ['make', 'quiz', '問題をつくってみよう'], ['pitch', 'con', 'ピッチの舞台'], ['ehon', 'quiz', '絵本：千円札の旅'], ['words', 'sim', '出てきたことば']];
  // ためした印
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const list = k => { try { const v = JSON.parse(get(k) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const labT = list('azakei_lab_tried'), playT = list('azakei_play_tried');
  const KEYS = { quiz: 'azakei_quiz_best', crossword: 'azakei_cw_best', cardgame: 'azakei_card_best', sugoroku: 'azakei_sugo_best', 'sim-main': 'azakei_sim_run', koubou: 'azakei_village', updown: 'azakei_chart_reader', okozukai: 'azakei_ozk_master', fx: 'azakei_fx_master', otsuri: 'azakei_otsuri_best', 'plan-seed': 'azakei_planseed', himitsu: 'azakei_osatsu_himitsu' };
  const tried = (id, pg) => (pg === 'sim' && labT.includes('#' + id)) || (pg === 'quiz' && playT.includes('#' + id)) || !!get(KEYS[id] || 'azakei_' + id);
  const all = L.flatMap(l => l[4].map(s => ({ s, l })));
  const doneN = all.filter(x => tried(x.s[0], x.s[1])).length;

  // 地図の形
  const W = 1240, H = 640, CX = 620, CY = 320, YS = [92, 196, 320, 444, 548];
  const xs = i => i < 6 ? 70 + i * 80 : 790 + (i - 6) * 80;
  const path = y => `M 30 ${y} H 480 C 545 ${y} 545 ${CY} ${CX} ${CY} C 695 ${CY} 695 ${y} 760 ${y} H ${W - 30}`;
  const lineSvg = L.map(([k, n, c], li) => `<path id="rs-p-${k}" class="rs-case" d="${path(YS[li])}"/><path class="rs-line" data-li="${li}" d="${path(YS[li])}" stroke="${c}"/>`).join('');
  const trains = L.map(([k, , c], li) => `<g class="rs-train" data-li="${li}"><rect x="-15" y="-6" width="30" height="12" rx="5" fill="${c}" stroke="#fff" stroke-width="2"/><rect x="5" y="-3" width="6" height="5" rx="1" fill="#fff" opacity=".85"/><animateMotion dur="${16 + li * 2.5}s" repeatCount="indefinite" rotate="auto" begin="${-li * 3}s"><mpath href="#rs-p-${k}"/></animateMotion></g>`).join('');
  const stations = L.map(([k, n, c], li) => L[li][4].map(([id, pg, short], i) => {
    const x = xs(i), y = YS[li], t = tried(id, pg);
    return `<g class="rs-st${t ? ' is-done' : ''}" data-l="${li}" data-i="${i}" tabindex="0" role="button" aria-label="${esc(L[li][4][i][3])}（${n}）${t ? '・ためした' : ''}" transform="translate(${x} ${y})"><circle r="11" fill="${t ? c : '#fff'}" stroke="${c}" stroke-width="4"/>${t ? '<text class="rs-done" y="4">済</text>' : ''}<text class="rs-lb" y="${li % 2 ? -20 : 28}">${esc(short)}</text></g>`;
  }).join('')).join('');
  const hub = `<g class="rs-hub" transform="translate(${CX} ${CY})"><circle r="34" fill="#fffaf0" stroke="#2a2015" stroke-width="5"/><circle r="26" fill="none" stroke="#2a2015" stroke-width="1.5"/><text y="-2" class="rs-hub-t">麻経</text><text y="15" class="rs-hub-s">乗りかえ</text></g>`;

  box.innerHTML = `
    <div class="rs-top">
      <div class="rs-ring" style="--p:${(doneN / all.length * 100).toFixed(1)}"><b>${doneN}</b><small>/ ${all.length} 駅</small></div>
      <div class="rs-top-t"><p class="rs-top-h">ためした駅</p><p class="rs-top-s">${doneN === all.length ? '全線制覇！ すべての駅をまわりました。' : doneN ? `あと ${all.length - doneN} 駅。路線ごとに、まわった駅がわかります。` : 'どの駅からでも乗れます。気になる駅を押してみよう。'}</p></div>
      <div class="rs-next" data-k="next"></div>
    </div>
    <ul class="rs-legend">${L.map(([k, n, c, s], li) => { const d = L[li][4].filter(x => tried(x[0], x[1])).length; return `<li style="--c:${c}"><button type="button" data-line="${li}"><span class="rs-ls" aria-hidden="true">${s}</span><b>${n}</b><small>${d} / ${L[li][4].length}</small><i style="--w:${(d / L[li][4].length * 100).toFixed(0)}%"></i></button></li>`; }).join('')}</ul>
    <div class="rs-mapwrap" data-k="wrap"><svg class="rs-map" viewBox="0 0 ${W} ${H}" role="group" aria-label="経済の路線図"><defs><pattern id="rs-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(42,32,21,.06)"/></pattern></defs><rect width="${W}" height="${H}" fill="url(#rs-grid)"/>${lineSvg}${trains}${hub}${stations}</svg></div>
    <p class="rs-hint">駅を押すと、きっぷが出ます。スマホでは、地図を横にすべらせて見られます。</p>
    <div class="rs-ticket" data-k="ticket" hidden></div>
    <div class="rs-lists">${L.map(([k, n, c, s], li) => `<section class="rs-list" style="--c:${c}"><h2><span aria-hidden="true">${s}</span>${n}</h2><ol>${L[li][4].map(([id, pg, , name, d]) => `<li class="${tried(id, pg) ? 'is-done' : ''}"><a href="${PAGE[pg][0]}#${id}"><b>${esc(name)}</b><small>${esc(d)}・${PAGE[pg][1]}</small></a></li>`).join('')}</ol></section>`).join('')}
      <section class="rs-list is-plaza"><h2><span aria-hidden="true">広</span>駅前広場（どの路線からも）</h2><ol>${PLAZA.map(([id, pg, name]) => `<li><a href="${PAGE[pg][0]}#${id}"><b>${esc(name)}</b><small>${PAGE[pg][1]}</small></a></li>`).join('')}</ol></section>
    </div>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  // おすすめの次の駅：いちばん多くまわった路線の、まだの駅
  const nextOf = li => L[li][4].findIndex(x => !tried(x[0], x[1]));
  const best = L.map((l, li) => [l[4].filter(x => tried(x[0], x[1])).length, li]).filter(([d, li]) => nextOf(li) >= 0).sort((a, b) => b[0] - a[0])[0];
  if (best) { const li = best[1], i = nextOf(li), s = L[li][4][i]; K('next').innerHTML = `<small>次はこの駅</small><button type="button" data-go="${li}-${i}" style="--c:${L[li][2]}"><span aria-hidden="true">${L[li][3]}</span>${esc(s[3])}</button>`; }
  const show = (li, i) => {
    const [k, n, c, sym, st] = L[li], [id, pg, , name, d] = st[i], t = tried(id, pg);
    const ni = st.findIndex((x, j) => j > i && !tried(x[0], x[1]));
    box.querySelectorAll('.rs-st').forEach(g => g.classList.toggle('is-sel', +g.dataset.l === li && +g.dataset.i === i));
    const tk = K('ticket');
    tk.innerHTML = `<div class="rs-tk" style="--c:${c}"><p class="rs-tk-line"><span aria-hidden="true">${sym}</span>${n}<em>${i + 1} 番目の駅</em></p><p class="rs-tk-name">${esc(name)}</p><p class="rs-tk-d">${esc(d)}（${PAGE[pg][1]}）</p><p class="rs-tk-st">${t ? '<b class="is-done">済</b>ためした駅' : '<b>未</b>まだの駅'}</p>
      <div class="rs-tk-btns"><a class="rs-go" href="${PAGE[pg][0]}#${id}">この駅へ行く</a>${ni >= 0 ? `<button type="button" data-go="${li}-${ni}">次のまだの駅：${esc(st[ni][2])}</button>` : ''}<button type="button" data-a="close">とじる</button></div></div>`;
    tk.hidden = false; tk.classList.remove('is-in'); void tk.offsetWidth; tk.classList.add('is-in');
  };
  box.addEventListener('click', e => {
    const st = e.target.closest('.rs-st'); if (st) { show(+st.dataset.l, +st.dataset.i); return; }
    const g = e.target.closest('[data-go]'); if (g) { const [li, i] = g.dataset.go.split('-').map(Number); show(li, i); const s = box.querySelector(`.rs-st[data-l="${li}"][data-i="${i}"]`); if (s && s.scrollIntoView) { const w = K('wrap'); const r = s.getBoundingClientRect(), wr = w.getBoundingClientRect(); w.scrollBy({ left: r.left - wr.left - wr.width / 2, behavior: 'smooth' }); } return; }
    // 凡例を押すと、その路線だけを強調（もう一度押すともどる）
    const ln = e.target.closest('[data-line]'); if (ln) { const li = ln.dataset.line, on = ln.getAttribute('aria-pressed') !== 'true'; box.querySelectorAll('[data-line]').forEach(b => b.setAttribute('aria-pressed', on && b === ln)); box.querySelectorAll('.rs-line, .rs-train, .rs-st').forEach(x => x.classList.toggle('is-dim', on && (x.dataset.li || x.dataset.l) !== li)); return; }
    if (e.target.closest('[data-a="close"]')) { K('ticket').hidden = true; box.querySelectorAll('.rs-st.is-sel').forEach(g => g.classList.remove('is-sel')); }
  });
  box.addEventListener('keydown', e => { const st = e.target.closest('.rs-st'); if (st && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(+st.dataset.l, +st.dataset.i); } });
  try { localStorage.setItem('azakei_rosen', '1'); } catch (e) {}
})();
