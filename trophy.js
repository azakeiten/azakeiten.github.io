/* ================================================================
   trophy.js — わたしの記録：「記録のトロフィー棚」（あそび場 26 ＋ 経済ラボ 30 の、すべての遊びの記録）
   ・遊びの一覧（下の T）は、quiz.html と sim.html のカード（data-k ＝ 記録のキー、data-u ＝ 単位）から作ったもの
     遊びを足したら、ここにも 1 行足す
   ・金：自己ベストなどの記録がある ／ 銀：ためした（中のボタンを押した）／ 空：まだ
   ・記録はこのブラウザの中だけ（localStorage を読むだけで、書きかえない）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-trophy]');
  if (!box) return;
  if (!document.querySelector('link[href^="trophy.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'trophy.css?v=20261127b'; document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* [棚, id, 一字, 名前, 記録のキー, 単位, 配列の長さで数える] */
  const T = [
    ['play','quiz','億','億万長者クイズ','azakei_quiz_best','枚',0],
    ['play','crossword','字','経済クロスワード','azakei_cw_best','枚',0],
    ['play','cardgame','札','経済カード勝負','azakei_card_win','勝',0],
    ['play','sugoroku','双','経済すごろく','azakei_sugo_best','円',0],
    ['play','shinka','進','お金の進化','azakei_shinka_best','点',0],
    ['play','koukan','換','交換の島','azakei_koukan','',0],
    ['play','ehon','絵','絵本：千円札の旅','azakei_ehon','',0],
    ['play','coins','貨','世界のお金図鑑','azakei_coins','/ 12 枚',1],
    ['play','himitsu','秘','新しいお札のひみつ','azakei_osatsu_himitsu','',0],
    ['play','otsuri','釣','おつりの達人','azakei_otsuri_best','点',0],
    ['play','imaato','待','いま？ それとも あとで？','azakei_imaato','',0],
    ['play','bakery','麦','麻経ベーカリー 12 か月','azakei_bakery','/ 3',0],
    ['play','kyuyo','給','はじめての給料明細','azakei_kyuyo','',0],
    ['play','cashless','レ','店長のレジ','azakei_cashless','',0],
    ['play','nefuda','札','値札のマジック','azakei_nefuda','/ 7',0],
    ['play','jika','価','チケットの値段は時価','azakei_jika','点',0],
    ['play','kanzei','関','関税のシーソー','azakei_kanzei','',0],
    ['play','subsc','月','サブスクと買い切り','azakei_subsc','点',0],
    ['play','atobarai','払','ゲーム機、どう払う？','azakei_atobarai','',0],
    ['play','nenkin','支','胴上げから肩車へ','azakei_nenkin_best','点',0],
    ['play','lemon','檸','フリマのなぞ','azakei_lemon','',0],
    ['play','zeidan','段','税の階段','azakei_zeidan_best','点',0],
    ['play','kawa','川','川上の工場','azakei_kawa','',0],
    ['play','koen','園','みんなの公園','azakei_koen','',0],
    ['play','taikai','会','みんなでクイズ大会','','',0],
    ['play','make','作','クイズ工房','azakei-qmake','',0],
    ['lab','meguri','巡','お金のめぐり','','',0],
    ['lab','pazuru','嵌','めぐりパズル','azakei_pazuru','',0],
    ['lab','koubou','創','仕組みをつくる工房','azakei_village','',0],
    ['lab','tsuuka','券','お祭りの券の工房','azakei_tsuuka','',0],
    ['lab','sim-main','配','チップ配分','azakei_sim_run','',0],
    ['lab','double','倍','お金が 2 倍になるまで','azakei_dbl_best','点',0],
    ['lab','updown','予','チャート予想','azakei_ud_best','枚',0],
    ['lab','okozukai','遣','おこづかいチャレンジ','azakei_ozk_master','',0],
    ['lab','market','値','値段の決まり方','azakei_market_best','点',0],
    ['lab','seri','競','せりの会場','azakei_seri_best','円',0],
    ['lab','asagohan','旅','朝ごはんの世界旅行','azakei_asagohan_best','点',0],
    ['lab','fx','為','円高・円安の両替所','azakei_fx_best','点',0],
    ['lab','shop','店','文化祭でお店をひらこう','azakei_shop_best','円',0],
    ['lab','oku','億','1 億円って、どれくらい？','azakei_oku_best','点',0],
    ['lab','budget','予','国の予算を 100 円にすると','azakei_budget_best','点',0],
    ['lab','infl','昇','インフレのタイムマシン','azakei_infl_best','点',0],
    ['lab','bungyo','分','分業のふしぎ','azakei_bungyo_total','/ 12 ★',0],
    ['lab','receipt','税','レシートの中の税金','azakei_receipt_best','点',0],
    ['lab','kuji','籤','くじ引きの期待値','azakei_kuji_best','円',0],
    ['lab','kabu','株','株式会社をつくろう','azakei_kabu_best','万円',0],
    ['lab','ginko','銀','銀行のふしぎ','azakei_bank_best','万円',0],
    ['lab','kinri','舵','景気の舵とり','azakei_kinri','点',0],
    ['lab','uchiwake','訳','おにぎり 1 個の値段の中身','azakei_oni_best','万円',0],
    ['lab','robot','機','ロボットがやってきた工場','azakei_robot','',0],
    ['lab','chiiki','巡','めぐる町のお金','azakei_chiiki_game','倍',0],
    ['lab','gurafu','図','グラフのうそを見破れ','azakei_gurafu_best','点',0],
    ['lab','hoken','備','みんなで備える箱','azakei_hoken','',0],
    ['lab','ike','池','みんなの池','azakei_ike_best','匹',0],
    ['lab','crypto','暗','暗号資産とブロックチェーン','azakei_crypto','',0],
    ['lab','nesage','策','となりのお店と値下げ競争','azakei_nesage_best','/ 60',0]
  ];
  const raw = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const arr = k => { try { const v = JSON.parse(raw(k) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const tried = { play: arr('azakei_play_tried'), lab: arr('azakei_lab_tried') };
  const state = t => {
    const [shelf, id, , , k, u, len] = t;
    const v = k ? raw(k) : null;
    let rec = '';
    if (v !== null && v !== '' && v !== '0' && v !== '[]') {
      if (u) { let n = 0; if (len) { try { n = JSON.parse(v).length; } catch (e) {} } else n = +v || 0; rec = n ? `${n.toLocaleString('ja-JP')} ${u}` : ''; }
      if (!rec) rec = '済';
    }
    if (rec) return ['gold', rec];
    if (tried[shelf].includes('#' + id)) return ['silver', 'ためした'];
    return ['', 'まだ'];
  };
  const SHELF = [['play', 'あそび場', 'quiz.html', '遊'], ['lab', '経済ラボ', 'sim.html', '試']];
  const all = T.map(t => [t, state(t)]);
  const gold = all.filter(x => x[1][0] === 'gold').length, any = all.filter(x => x[1][0]).length;
  const R = 34, C = 2 * Math.PI * R;
  const TITLE = [[56, '全制覇の殿堂入り'], [40, 'トロフィーコレクター'], [24, '棚が光ってきた'], [10, 'コレクションのはじまり'], [1, 'はじめの 1 つ'], [0, '棚はまだ空っぽ']];
  const title = TITLE.find(x => gold >= x[0])[1];
  const nextT = all.find(x => !x[1][0]) || all.find(x => x[1][0] === 'silver');
  box.innerHTML = `<div class="tr-head">
      <div class="tr-ring" aria-hidden="true"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="${R}" class="tr-ring-bg"/><circle cx="40" cy="40" r="${R}" class="tr-ring-s" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${(C * (1 - any / T.length)).toFixed(1)}"/><circle cx="40" cy="40" r="${R}" class="tr-ring-g" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${(C * (1 - gold / T.length)).toFixed(1)}"/></svg><p><b>${gold}</b><small>/ ${T.length}</small></p></div>
      <div class="tr-hb"><p class="tr-k">記録のトロフィー棚</p><p class="tr-title">${title}</p>
        <p class="tr-meta"><span><i class="is-g"></i>記録あり <b>${gold}</b></span><span><i class="is-s"></i>ためした <b>${any - gold}</b></span><span><i></i>まだ <b>${T.length - any}</b></span></p>
        ${nextT ? `<a class="tr-next" href="${SHELF.find(s => s[0] === nextT[0][0])[2]}#${nextT[0][1]}"><small>つぎは、これ</small><span class="tr-s" aria-hidden="true">${nextT[0][2]}</span><b>${nextT[0][3]}</b><i aria-hidden="true">→</i></a>` : ''}</div>
    </div>
    ${SHELF.map(([sk, sn, href, seal]) => { const items = all.filter(x => x[0][0] === sk), g = items.filter(x => x[1][0] === 'gold').length; return `<div class="tr-shelf">
      <p class="tr-sh"><span aria-hidden="true">${seal}</span>${sn}<small>記録あり ${g} / ${items.length}</small><a href="${href}">${sn}へ →</a></p>
      <ul class="tr-grid">${items.map(([t, s], i) => `<li class="${s[0] ? 'is-' + s[0] : ''}" style="--i:${i}"><a href="${href}#${t[1]}" title="${t[3]}"><span class="tr-s" aria-hidden="true">${t[2]}</span><b>${t[3]}</b><small>${s[1]}</small></a></li>`).join('')}</ul>
      ${items.length > 8 ? `<button type="button" class="tr-more" aria-expanded="false">すべて見る（${items.length}）</button>` : ''}<div class="tr-board" aria-hidden="true"></div></div>`; }).join('')}`;
  box.addEventListener('click', e => { const b = e.target.closest('.tr-more'); if (!b) return; const sh = b.closest('.tr-shelf'), open = !sh.classList.contains('is-open'); sh.classList.toggle('is-open', open); b.setAttribute('aria-expanded', open); b.textContent = open ? 'たたむ' : `すべて見る（${sh.querySelectorAll('.tr-grid li').length}）`; });
  if (!reduce) {
    const lis = box.querySelectorAll('.tr-grid li');
    box.classList.add('is-anim');
    lis.forEach((li, i) => li.style.animationDelay = (i % 30) * 25 + 'ms');
  }
})();
