/* ================================================================
   talkbook.js — マイページ：お札マンのことば帳
   ・ゲームの結果で出たお札マンのひとこと（labtalk.js が azakei_talk_seen に記録）を、ゲームごとに 3 まい（top・mid・low）のカードで集める
   ・まだ出ていないカードは「？」。出たカードは文が読めて、押すと声（voice.js）で聞ける
   ・せりふは labtalk.js の LINES を読む（window.AZAKEI_TALK.lines）。見た目は talkbook.css
   ================================================================ */
(function () {
  const box = document.querySelector('[data-talkbook]');
  if (!box) return;
  const ver = (document.currentScript && document.currentScript.src.split('v=')[1]) || '1';
  if (!document.querySelector('link[href^="talkbook.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'talkbook.css?v=' + ver; document.head.appendChild(l); }
  // [せりふのキー, 名前, ページ, 印]
  const G = [
    ['otsuri', 'おつりの達人', 'quiz.html#otsuri', '釣'], ['zeidan', '税の階段', 'quiz.html#zeidan', '段'], ['sugoroku', '経済すごろく', 'quiz.html#sugoroku', '双'],
    ['cardgame', '経済カード勝負', 'quiz.html#cardgame', '札'], ['koukan', '交換の島', 'quiz.html#koukan', '換'], ['shinka', 'お金の進化', 'quiz.html#shinka', '進'],
    ['coins', '世界のお金図鑑', 'quiz.html#coins', '貨'], ['nenkin', '胴上げから肩車へ', 'quiz.html#nenkin', '支'], ['bakery', '麻経ベーカリー 12 か月', 'quiz.html#bakery', '麦'],
    ['jika', 'チケットの値段は時価', 'quiz.html#jika', '価'], ['subsc', 'サブスクと買い切り', 'quiz.html#subsc', '月'], ['nefuda', '値札のマジック', 'quiz.html#nefuda', '値'], ['tanka', '単価くらべ 40 秒', 'quiz.html#nefuda', '単'], ['atobarai', 'ゲーム機、どう払う？', 'quiz.html#atobarai', '払'],
    ['imaato', 'いま？ それとも あとで？', 'quiz.html#imaato', '待'], ['cashless', '店長のレジ', 'quiz.html#cashless', '銭'], ['kyuyo', 'はじめての給料明細', 'quiz.html#kyuyo', '給'],
    ['kanzei', '関税のシーソー', 'quiz.html#kanzei', '関'], ['kawa', '川上の工場', 'quiz.html#kawa', '川'], ['koen', 'みんなの公園', 'quiz.html#koen', '園'],
    ['lemon', 'フリマのなぞ', 'quiz.html#lemon', '檸'], ['cw', '経済クロスワード', 'quiz.html#crossword', '字'], ['kikai', 'えらばなかった道のねだん', 'quiz.html#kikai', '択'], ['sagi', 'そのメッセージ、あやしい？', 'quiz.html#sagi', '守'], ['himitsu', '新しいお札のひみつ', 'quiz.html#himitsu', '秘'],
    ['meguri', 'お金のめぐり', 'sim.html#meguri', '巡'], ['dbl', 'お金が 2 倍になるまで', 'sim.html#double', '倍'], ['updown', 'チャート予想', 'sim.html#updown', '線'], ['market', '値段の決まり方', 'sim.html#market', '需'],
    ['seri', 'せりの会場', 'sim.html#seri', '競'], ['pazuru', 'めぐりパズル', 'sim.html#pazuru', '嵌'], ['asagohan', '朝ごはんの世界旅行', 'sim.html#asagohan', '旅'],
    ['fx', '円高・円安の両替所', 'sim.html#fx', '為'], ['shop', '文化祭でお店をひらこう', 'sim.html#shop', '店'], ['oku', '1 億円って、どれくらい？', 'sim.html#oku', '億'],
    ['budget', '国の予算を 100 円にすると', 'sim.html#budget', '予'], ['infl', 'インフレのタイムマシン', 'sim.html#infl', '昇'], ['bungyo', '分業のふしぎ', 'sim.html#bungyo', '分'],
    ['receipt', 'レシートの中の税金', 'sim.html#receipt', '税'], ['kuji', 'くじ引きの期待値', 'sim.html#kuji', '籤'], ['kabu', '株式会社をつくろう', 'sim.html#kabu', '株'],
    ['ginko', '銀行のふしぎ', 'sim.html#ginko', '銀'], ['kinri', '景気の舵とり', 'sim.html#kinri', '舵'], ['oni', 'おにぎり屋の値上げ会議', 'sim.html#uchiwake', '訳'],
    ['chiiki', 'めぐる町のお金', 'sim.html#chiiki', '巡'], ['gurafu', 'グラフのうそを見破れ', 'sim.html#gurafu', '図'], ['ike', 'みんなの池', 'sim.html#ike', '池'],
    ['crypto', '暗号資産とブロックチェーン', 'sim.html#crypto', '暗'], ['nesage', 'となりのお店と値下げ競争', 'sim.html#nesage', '策'],
    ['tsuuka', 'お祭りの券の工房', 'sim.html#tsuuka', '券'], ['hoken', 'みんなで備える箱', 'sim.html#hoken', '備'], ['robot', 'ロボットがやってきた工場', 'sim.html#robot', '機']
  ];
  const TIER0 = [['top', 'ほめる', '極'], ['mid', 'あと少し', '中'], ['low', 'ここから', '初']];
  // 決まった場面で 1 回だけ話す遊びは、カード 1 まい
  const ONE = { kawa: 1, kanzei: 1, tsuuka: 1, lemon: 1, himitsu: 1 };
  const TIER_OF = k => ONE[k] ? [['top', 'クリア', '極']] : TIER0;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  let seen = {};
  try { seen = JSON.parse(localStorage.getItem('azakei_talk_seen') || '{}') || {}; } catch (e) {}
  const render = lines => {
    const list = G.filter(g => lines[g[0]]);
    const total = list.reduce((a, g) => a + TIER_OF(g[0]).length, 0), got = list.reduce((a, g) => a + TIER_OF(g[0]).filter(t => (seen[g[0]] || []).includes(t[0])).length, 0);
    const games = list.filter(g => (seen[g[0]] || []).length).length;
    const nextG = list.find(g => !(seen[g[0]] || []).length);
    box.innerHTML = `<div class="tb-head">
        <span class="tb-face" aria-hidden="true">札</span>
        <div><h2 class="tb-h">お札マンのことば帳</h2>
        <p class="tb-s">ゲームが終わると、お札マンが結果に合わせてひとこと。よい結果・あと少し・ここから、の 3 まいずつ（決まった場面で話す遊びは 1 まい）、全部で ${total} まい。集めたカードを押すと、声で聞けます。</p></div>
        <div class="tb-ring" style="--p:${total ? (got / total * 100).toFixed(1) : 0}"><b>${got}</b><small>/ ${total}</small></div>
      </div>
      <p class="tb-meta">${games} / ${list.length} の遊びで、ひとことを聞きました。${nextG ? `<a href="${nextG[2]}">まだの「${esc(nextG[1])}」で遊んでみる →</a>` : 'すべての遊びで聞きました！'}</p>
      <ol class="tb-list">${list.filter(g => (seen[g[0]] || []).length).map(([k, name, href, seal]) => {
        const TIER = TIER_OF(k), s = seen[k] || [], n = TIER.filter(t => s.includes(t[0])).length;
        return `<li class="tb-g${n === TIER.length ? ' is-full' : n ? ' is-some' : ''}"><a class="tb-gn" href="${href}"><span class="tb-seal" aria-hidden="true">${seal}</span><b>${esc(name)}</b><small>${n} / ${TIER.length}</small></a>
          <div class="tb-cards${TIER.length === 1 ? ' is-one' : ''}">${TIER.map(([t, lb, ts]) => s.includes(t)
            ? `<button type="button" class="tb-c is-${t}" data-k="${k}" data-t="${t}"><span class="tb-ct" aria-hidden="true">${ts}</span><small>${lb}</small><span class="tb-txt">${esc(lines[k][t])}</span><i class="tb-play">声で聞く</i></button>`
            : `<div class="tb-c is-lock"><span class="tb-ct" aria-hidden="true">？</span><small>${lb}</small><span class="tb-txt">まだ聞いていないひとこと</span></div>`).join('')}</div></li>`;
      }).join('')}</ol>
      ${games ? '' : '<p class="tb-empty">まだ 1 まいもありません。下の遊びのどれかで最後まで遊ぶと、お札マンがひとこと話してくれます。</p>'}
      ${list.length > games ? `<details class="tb-rest"${games ? '' : ' open'}><summary>まだひとことを聞いていない遊び（${list.length - games}）</summary><ul>${list.filter(g => !(seen[g[0]] || []).length).map(([k, name, href, seal]) => `<li><a href="${href}"><span class="tb-seal" aria-hidden="true">${seal}</span>${esc(name)}</a></li>`).join('')}</ul></details>` : ''}
      <p class="tb-note">記録は、このブラウザの中だけにあります（サーバーには送りません）。</p>`;
  };
  box.addEventListener('click', async e => {
    const b = e.target.closest('button.tb-c');
    if (!b || !window.AZAKEI_TALK || !window.AZAKEI_TALK.say) return;
    const lines = window.AZAKEI_TALK.lines, text = lines[b.dataset.k][b.dataset.t];
    box.querySelectorAll('.tb-c.is-on').forEach(x => x.classList.remove('is-on'));
    b.classList.add('is-on'); b.querySelector('.tb-play').textContent = '再生中…';
    try { await window.AZAKEI_TALK.say(text); } catch (err) { b.querySelector('.tb-play').textContent = '声を出せませんでした'; b.classList.remove('is-on'); return; }
    b.classList.remove('is-on'); b.querySelector('.tb-play').textContent = 'もう一度聞く';
  });
  // せりふは labtalk.js から（まだ読みこまれていなければ読みこむ）
  const ready = () => window.AZAKEI_TALK && window.AZAKEI_TALK.lines;
  if (ready()) { render(window.AZAKEI_TALK.lines); return; }
  box.innerHTML = '<p class="tb-s">ことば帳を開いています…</p>';
  const s = document.createElement('script');
  s.src = 'labtalk.js?v=' + ver;
  s.onload = () => { if (ready()) render(window.AZAKEI_TALK.lines); };
  document.head.appendChild(s);
})();
