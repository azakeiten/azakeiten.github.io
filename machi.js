/* ================================================================
   machi.js — わたしの記録：麻経の町（近づいてから読みこむ）
   ・サイトの 6 つの場所を、夕ぐれの町の建物にした絵。遊んだぶんだけ、窓に明かりがともる
   ・経済ラボ（25 の実験）・あそび場（クイズなど）・用語辞典・文化祭・コンテスト・AZAKEI
   ・ぜんぶの窓がともると、屋根に金色の「済」の旗があがる
   ・建物を押すと、その場所の遊びの一覧（済／まだ）と、そこへのリンク
   ・道をお札マン（仮）が歩く。記録はこのブラウザの中だけ（修了証や経済ラボの「済」と同じもの）
   ・見た目は machi.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-machi]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="machi.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'machi.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raw = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const has = k => { const v = raw(k); return !(v === null || v === '' || v === '0' || v === '[]' || v === '{}'); };
  let tried = []; try { tried = JSON.parse(raw('azakei_lab_tried') || '[]'); } catch (e) {}
  // 経済ラボ：[ページ内の場所, 名前, クリアの記録]
  const LAB = [['meguri', 'お金のめぐり'], ['pazuru', 'めぐりパズル', 'azakei_pazuru'], ['koubou', '仕組みをつくる工房', 'azakei_village'], ['tsuuka', 'お祭りの券の工房', 'azakei_tsuuka'], ['sim-main', 'チップ配分', 'azakei_sim_run'],
    ['double', 'お金が 2 倍になるまで'], ['updown', 'チャート予想', 'azakei_chart_reader'], ['okozukai', 'おこづかいチャレンジ', 'azakei_ozk_master'], ['market', '値段の決まり方'], ['seri', 'せりの会場', 'azakei_seri'],
    ['asagohan', '朝ごはんの世界旅行', 'azakei_asagohan'], ['fx', '円高・円安の両替所', 'azakei_fx_master'], ['shop', '文化祭でお店をひらこう', 'azakei_shop'], ['oku', '1 億円って、どれくらい？', 'azakei_oku'], ['budget', '国の予算を 100 円にすると', 'azakei_budget'],
    ['infl', 'インフレのタイムマシン'], ['bungyo', '分業のふしぎ', 'azakei_bungyo'], ['receipt', 'レシートの中の税金'], ['kuji', 'くじ引きの期待値'], ['kabu', '株式会社をつくろう'],
    ['ginko', '銀行のふしぎ', 'azakei_ginko'], ['kinri', '景気の舵とり', 'azakei_kinri'], ['hoken', 'みんなで備える箱', 'azakei_hoken'], ['ike', 'みんなの池', 'azakei_ike'], ['nesage', 'となりのお店と値下げ競争', 'azakei_nesage']]
    .map(([id, n, k]) => [n, 'sim.html#' + id, tried.includes('#' + id) || (k && has(k))]);
  const K = list => list.map(([k, n, h]) => [n, h, has(k)]);
  // [印, 名前, 形, 中心 x, 遊びの一覧]
  const D = [
    ['研', '経済ラボ', 'lab', 100, LAB],
    ['遊', 'あそび場', 'quiz', 262, K([['azakei_quiz_best', '億万長者クイズ', 'quiz.html#quiz'], ['azakei_cw_best', 'クロスワード', 'quiz.html#crossword'], ['azakei_card_best', 'カード勝負', 'quiz.html#cardgame'], ['azakei_sugo_best', 'すごろく', 'quiz.html#sugoroku'], ['azakei_koukan', '交換の島', 'quiz.html#koukan'], ['azakei_ehon', '絵本', 'quiz.html#ehon'], ['azakei_otsuri_best', 'おつりの達人', 'quiz.html#otsuri'], ['azakei_coins', '世界のお金図鑑', 'quiz.html#coins'], ['azakei_osatsu_himitsu', '新しいお札のひみつ', 'quiz.html#himitsu'], ['azakei-qmake', 'クイズの問題づくり', 'quiz.html#make'], ['azakei_nefuda', '値札のマジック', 'quiz.html#nefuda'], ['azakei_jika', 'チケットの値段は時価', 'quiz.html#jika'], ['azakei_kanzei', '関税のシーソー', 'quiz.html#kanzei'], ['azakei_subsc', 'サブスクと買い切り', 'quiz.html#subsc'], ['azakei_atobarai', 'ゲーム機の払い方', 'quiz.html#atobarai'], ['azakei_nenkin', '胴上げから肩車へ', 'quiz.html#nenkin'], ['azakei_lemon', 'フリマのなぞ', 'quiz.html#lemon'], ['azakei_zeidan', '税の階段', 'quiz.html#zeidan'], ['azakei_imaato', 'いま？ それとも あとで？', 'quiz.html#imaato'], ['azakei_kawa', '川上の工場', 'quiz.html#kawa'], ['azakei_koen', 'みんなの公園', 'quiz.html#koen']])],
    ['辞', '用語辞典', 'lib', 422, K([['azakei_gl_known', '単語カード', 'glossary.html#glCards'], ['azakei_gacha', 'ことばガチャ', 'glossary.html#gacha'], ['azakei_np_best', '年表ゲーム', 'glossary.html#nenpyo'], ['azakei_shiri_best', '経済しりとり', 'glossary.html#shiritori'], ['azakei_karuta', 'ことばかるた', 'glossary.html#karuta'], ['azakei_seiza', 'ことばの星座', 'glossary.html#seiza']])],
    ['祭', '文化祭', 'fest', 588, K([['azakei_room_tour', '3D の会場を歩く', 'festival.html#room'], ['azakei_bill', '麻経券のデザイン', 'festival.html#bill']])],
    ['競', 'コンテスト', 'hall', 752, K([['azakei_planseed', 'ビジネスプランのたね', 'contests.html#plan-seed'], ['azakei_pitch', 'ピッチの舞台', 'contests.html#pitch'], ['azakei_cfund', 'クラウドファンディングに挑戦', 'contests.html#cfund'], ['azakei_bunsan', 'ポートフォリオの 10 年', 'contests.html#bunsan'], ['azakei_rousoku', 'ローソク足をつくろう', 'contests.html#rousoku'], ['azakei_hirogari', 'アプリが広がるとき', 'contests.html#hirogari'], ['azakei_hama', '浜辺のアイス屋さん', 'contests.html#hama'], ['azakei_shimagdp', '島の GDP', 'contests.html#shimagdp'], ['azakei_kessan', 'パン屋さんの決算発表', 'contests.html#kessan']])],
    ['麻', 'AZAKEI', 'home', 908, K([['azakei_kisekae', 'お札マンの着せかえ', 'azakei.html#kisekae'], ['azakei_dg_type', 'エコノミスト診断', 'diagnosis.html']])]
  ];

  // ---- 建物の形と、窓の位置 ----
  const win = (x, y, w, h) => `<rect class="mc-win" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>`;
  const B = {
    lab(c) { let s = `<path class="mc-wall" d="M${c - 80} 310 V172 H${c + 80} V310 Z"/><path class="mc-dome" d="M${c - 42} 172 A42 42 0 0 1 ${c + 42} 172 Z"/><rect class="mc-roofline" x="${c - 86}" y="166" width="172" height="8" rx="3"/><path class="mc-trim" d="M${c - 8} 130 v-12 h16 v12"/>`;
      for (let r = 0; r < 5; r++) for (let q = 0; q < 5; q++) s += win(c - 68 + q * 28, 184 + r * 24, 16, 14); return [s, 120]; },
    quiz(c) { let s = `<path class="mc-wall" d="M${c - 44} 310 V130 H${c + 44} V310 Z"/><path class="mc-roof" d="M${c - 52} 132 L${c} 72 L${c + 52} 132 Z"/><circle class="mc-face" cx="${c}" cy="112" r="15"/><text class="mc-q" x="${c}" y="119">?</text>`;
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) s += win(c - 32 + q * 24, 152 + r * 46, 16, 26); s += win(c - 30, 286, 16, 16) + win(c - 8, 286, 16, 16) + win(c + 14, 286, 16, 16) + win(c - 30, 128, 12, 12) + win(c + 18, 128, 12, 12) + win(c - 6, 128, 12, 12) + win(c + 32, 288, 10, 12) + win(c + 32, 134, 10, 12) + win(c - 42, 134, 10, 12) + win(c - 42, 288, 10, 12) + win(c + 34, 186, 8, 10) + win(c + 34, 232, 8, 10); return [s, 72]; },
    lib(c) { let s = `<path class="mc-wall" d="M${c - 76} 310 V214 H${c + 76} V310 Z"/><path class="mc-roof" d="M${c - 86} 216 L${c} 172 L${c + 86} 216 Z"/><rect class="mc-roofline" x="${c - 84}" y="212" width="168" height="7"/>`;
      for (let i = 0; i < 6; i++) s += `<rect class="mc-col" x="${c - 68 + i * 26}" y="226" width="8" height="80"/>`;
      for (let i = 0; i < 5; i++) s += win(c - 57 + i * 26, 238, 12, 50); s += win(c - 6, 186, 12, 14); return [s, 172]; },
    fest(c) { let s = `<path class="mc-wall" d="M${c - 76} 310 V196 H${c + 76} V310 Z"/><rect class="mc-roofline" x="${c - 82}" y="190" width="164" height="9" rx="3"/><rect class="mc-wall2" x="${c - 18}" y="160" width="36" height="34"/><circle class="mc-face" cx="${c}" cy="176" r="11"/><path class="mc-hand" d="M${c} 176 v-7 M${c} 176 h5"/><path class="mc-bunting" d="M${c - 76} 202 Q${c} 226 ${c + 76} 202"/>${[-56, -34, -12, 12, 34, 56].map((d, i) => `<path class="mc-pen" style="--h:${i * 60}" d="M${c + d - 6} ${208 + 10 * (1 - Math.pow(d / 76, 2))} l6 12 l6 -12 Z"/>`).join('')}<rect class="mc-door" x="${c - 14}" y="276" width="28" height="34"/>`;
      s += win(c - 62, 236, 38, 30) + win(c + 24, 236, 38, 30); return [s, 160]; },
    hall(c) { let s = `<path class="mc-wall" d="M${c - 74} 310 V206 Q${c} 182 ${c + 74} 206 V310 Z"/><path class="mc-star" d="M${c} 168 l5 10 11 1 -8 7 3 11 -11 -6 -11 6 3 -11 -8 -7 11 -1 Z"/><path class="mc-curtain" d="M${c - 30} 310 V264 Q${c} 236 ${c + 30} 264 V310 Z"/>`;
      [-60, -36, 18, 42].forEach(d => s += win(c + d, 220, 18, 24)); s += win(c - 50, 256, 14, 14) + win(c + 36, 256, 14, 14) + win(c - 7, 186, 14, 12) + win(c + 50, 256, 14, 14) + win(c - 7, 220, 14, 14); return [s, 168]; },
    home(c) { let s = `<path class="mc-wall" d="M${c - 56} 310 V238 H${c + 56} V310 Z"/><path class="mc-roof" d="M${c - 68} 240 L${c} 194 L${c + 68} 240 Z"/><rect class="mc-door" x="${c - 10}" y="276" width="20" height="34"/><path class="mc-noren" d="M${c - 18} 260 h36 v16 h-36 Z"/><text class="mc-noren-t" x="${c}" y="272">麻</text>`;
      s += win(c - 46, 254, 22, 18) + win(c + 24, 254, 22, 18); return [s, 194]; }
  };

  const tot = D.reduce((a, d) => a + d[4].length, 0), lit = D.reduce((a, d) => a + d[4].filter(x => x[2]).length, 0);
  const stars = Array.from({ length: 46 }, (_, i) => `<circle class="mc-starry" cx="${(i * 223) % 1000}" cy="${(i * 97) % 150 + 6}" r="${i % 5 ? 1.1 : 1.8}" style="animation-delay:-${(i * .37 % 3).toFixed(2)}s"/>`).join('');
  let osatsu = '';
  if (window.AZAKEI_OSATSU_SVG) { const m = window.AZAKEI_OSATSU_SVG.match(/viewBox="([^"]+)"/); osatsu = window.AZAKEI_OSATSU_SVG.replace(/^<svg[^>]*>/, `<svg x="-28" y="-54" width="56" height="52" viewBox="${m ? m[1] : '0 0 120 112'}">`); }
  const ROAD = 'M-30 356 C 150 334, 300 378, 500 352 S 850 334, 1030 356';

  box.innerHTML = `
    <div class="mc-stage">
      <svg class="mc-svg" viewBox="0 0 1000 400" role="img" aria-label="麻経の町。6 つの建物の窓に、遊んだぶんだけ明かりがともる">
        <defs><linearGradient id="mc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1e3a"/><stop offset=".55" stop-color="#4a3a5e"/><stop offset="1" stop-color="#d98a5a"/></linearGradient>
          <radialGradient id="mc-glow"><stop offset="0" stop-color="#ffd76a" stop-opacity=".7"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient></defs>
        <rect width="1000" height="400" fill="url(#mc-sky)"/>
        ${stars}
        <circle class="mc-moon" cx="860" cy="62" r="24"/><circle cx="870" cy="56" r="22" fill="#2a2a4a" opacity=".55"/>
        <path class="mc-hill" d="M0 270 Q160 210 330 252 T680 240 T1000 250 V400 H0 Z"/>
        <path class="mc-hill2" d="M0 296 Q220 262 460 290 T1000 284 V400 H0 Z"/>
        <rect class="mc-ground" y="308" width="1000" height="92"/>
        <path class="mc-road" d="${ROAD}"/><path class="mc-lane" d="${ROAD}"/>
        ${[60, 330, 500, 670, 840].map(x => `<g class="mc-lamp" transform="translate(${x} 300)"><circle cy="-46" r="26" fill="url(#mc-glow)"/><rect x="-2" y="-44" width="4" height="46"/><circle cy="-46" r="5" class="mc-bulb"/></g>`).join('')}
        ${D.map(([s, n, f, c, items], i) => { const [art, top] = B[f](c); const done = items.filter(x => x[2]).length, all = items.length;
          return `<g class="mc-b${done === all ? ' is-done' : ''}" data-d="${i}" tabindex="0" role="button" aria-label="${n}：${done} / ${all}">
            <ellipse class="mc-shadow" cx="${c}" cy="312" rx="92" ry="8"/>${art}
            <g class="mc-flag" transform="translate(${c} ${top})"><rect x="-1.5" y="-34" width="3" height="34" class="mc-pole"/><g class="mc-cloth"><path d="M1.5 -34 h30 l-6 9 l6 9 h-30 Z"/><text x="14" y="-21">済</text></g></g>
            <g class="mc-sign" transform="translate(${c} 330)"><rect x="-58" y="-11" width="116" height="24" rx="6"/><text class="mc-sign-n" x="-6" y="5">${n}</text><text class="mc-sign-c" x="52" y="5">${done}/${all}</text><circle cx="-46" cy="1" r="8" class="mc-sign-s"/><text class="mc-sign-st" x="-46" y="5">${s}</text></g>
          </g>`; }).join('')}
        ${osatsu ? `<g class="mc-walker"><g class="mc-bob">${osatsu}</g><animateMotion dur="46s" repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="linear" path="M-10 350 C 150 330, 300 372, 500 346 S 850 330, 1010 350"/></g>` : ''}
      </svg>
      <p class="mc-total"><span>町の明かり</span><b data-k="lit">0</b><small>/ ${tot}</small></p>
    </div>
    <div class="mc-card" aria-live="polite"></div>`;

  const card = box.querySelector('.mc-card'), bs = [...box.querySelectorAll('.mc-b')];
  // 窓に、記録のぶんだけ明かりを（1 つずつ、ともしていく）
  const order = [];
  D.forEach(([, , , , items], i) => { const ws = bs[i].querySelectorAll('.mc-win'); const n = items.filter(it => it[2]).length; for (let j = 0; j < n && j < ws.length; j++) order.push(ws[j]); });
  const L = box.querySelector('[data-k="lit"]');
  if (reduce) { order.forEach(w => w.classList.add('is-lit')); L.textContent = lit; }
  else order.forEach((w, n) => setTimeout(() => { w.classList.add('is-lit'); L.textContent = n + 1; }, 600 + n * 70));

  const show = i => {
    const [s, n, , , items] = D[i], done = items.filter(x => x[2]).length;
    bs.forEach((b, j) => b.classList.toggle('is-pick', j === i));
    const next = items.find(x => !x[2]);
    card.innerHTML = `<div class="mc-card-h"><span class="mc-card-s">${s}</span><div><p class="mc-card-n">${n}</p><p class="mc-card-c">${done === items.length ? 'ぜんぶの窓に明かりがともりました。屋根に「済」の旗。' : `${items.length} のうち ${done} の窓に明かり。${next ? `次は「${next[0]}」はどう？` : ''}`}</p></div>${next ? `<a class="mc-go" href="${next[1]}">${next[0]}へ<i aria-hidden="true">→</i></a>` : ''}</div>
      <ul class="mc-list">${items.map(([t, h, d]) => `<li class="${d ? 'is-done' : ''}"><a href="${h}">${d ? '<b>済</b>' : '<i></i>'}${t}</a></li>`).join('')}</ul>`;
    card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
  };
  box.addEventListener('click', e => { const b = e.target.closest('.mc-b'); if (b) show(+b.dataset.d); });
  box.addEventListener('keydown', e => { const b = e.target.closest('.mc-b'); if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(+b.dataset.d); } });
  // はじめは、いちばん明かりの少ない場所を見せる（同じなら左から）
  const ratio = i => D[i][4].filter(x => x[2]).length / D[i][4].length;
  show(D.map((_, i) => i).sort((a, b) => ratio(a) - ratio(b))[0]);
})();
