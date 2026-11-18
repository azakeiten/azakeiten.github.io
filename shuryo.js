/* ================================================================
   shuryo.js — わたしの記録「麻経の修了証」
   ・麻経のめざすこと「親しむ → 知る → つくる」の 3 つの段に、このブラウザの記録から判を押す
   ・3 つそろうと、修了証が出る。なまえを書いて印刷できる（なまえはこのブラウザの中だけ。どこにも送らない）
   ・はじめて判がそろったところは、判を押す動きで見せる
   ================================================================ */
(function() {
  const box = document.querySelector('[data-shuryo]');
  if (!box) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raw = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const save = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const has = k => { const v = raw(k); return !(v === null || v === '' || v === '0' || v === '[]' || v === '{}'); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // [印, 段, ひとこと, [記録のキー, 名前, 場所]...]
  const STEPS = [
    ['親', '親しむ', '遊んで、経済を身近に感じる', [
      ['azakei_quiz_best', '億万長者クイズ', 'quiz.html#quiz'], ['azakei_cw_best', 'クロスワード', 'quiz.html#crossword'], ['azakei_card_best', 'カード勝負', 'quiz.html#cardgame'],
      ['azakei_sugo_best', 'すごろく', 'quiz.html#sugoroku'], ['azakei_koukan', '交換の島', 'quiz.html#koukan'],
      ['azakei_ehon', '絵本', 'quiz.html#ehon'], ['azakei_otsuri_best', 'おつりの達人', 'quiz.html#otsuri'],
      ['azakei_coins', '世界のお金図鑑', 'quiz.html#coins'], ['azakei_osatsu_himitsu', '新しいお札のひみつ', 'quiz.html#himitsu'], ['azakei_shiri_best', '経済しりとり', 'glossary.html#shiritori'], ['azakei_karuta', 'ことばかるた', 'glossary.html#karuta'], ['azakei_room_tour', '3D の会場', 'festival.html#room']]],
    ['知', '知る', 'お金の流れと、その仕組みを知る', [
      ['azakei_gl_known', '単語カード', 'glossary.html#glCards'], ['azakei_gacha', 'ことばガチャ', 'glossary.html#gacha'], ['azakei_np_best', '年表ゲーム', 'glossary.html#nenpyo'], ['azakei_seiza', 'ことばの星座', 'glossary.html#seiza'],
      ['azakei_pazuru', 'めぐりパズル', 'sim.html#pazuru'], ['azakei_asagohan', '朝ごはんの世界旅行', 'sim.html#asagohan'], ['azakei_hoken', 'みんなで備える箱', 'sim.html#hoken'], ['azakei_seri', 'せりの会場', 'sim.html#seri'], ['azakei_kinri', '景気の舵とり', 'sim.html#kinri'], ['azakei_ike', 'みんなの池', 'sim.html#ike'], ['azakei_bunsan', 'ポートフォリオの 10 年', 'contests.html#bunsan'], ['azakei_rousoku', 'ローソク足', 'contests.html#rousoku'], ['azakei_hirogari', 'アプリが広がるとき', 'contests.html#hirogari'], ['azakei_hama', '浜辺のアイス屋さん', 'contests.html#hama'], ['azakei_shimagdp', '島の GDP', 'contests.html#shimagdp'], ['azakei_kessan', 'パン屋さんの決算発表', 'contests.html#kessan'], ['azakei_nefuda', '値札のマジック', 'quiz.html#nefuda'], ['azakei_jika', 'チケットの値段は時価', 'quiz.html#jika'], ['azakei_kanzei', '関税のシーソー', 'quiz.html#kanzei'], ['azakei_subsc', 'サブスクと買い切り', 'quiz.html#subsc'], ['azakei_atobarai', 'ゲーム機の払い方', 'quiz.html#atobarai'], ['azakei_nenkin', '胴上げから肩車へ', 'quiz.html#nenkin'], ['azakei_lemon', 'フリマのなぞ', 'quiz.html#lemon'], ['azakei_zeidan', '税の階段', 'quiz.html#zeidan'], ['azakei_imaato', 'いま？ それとも あとで？', 'quiz.html#imaato'], ['azakei_kawa', '川上の工場', 'quiz.html#kawa'], ['azakei_koen', 'みんなの公園', 'quiz.html#koen'], ['azakei_sim_run', 'チップ配分', 'sim.html#sim-main'], ['azakei_chart_reader', 'チャート予想', 'sim.html#updown'], ['azakei_ozk_master', 'おこづかい', 'sim.html#okozukai'],
      ['azakei_fx_master', '円高・円安の両替所', 'sim.html#fx'], ['azakei_shop', '文化祭でお店', 'sim.html#shop'], ['azakei_oku', '1 億円', 'sim.html#oku'], ['azakei_budget', '国の予算', 'sim.html#budget']]],
    ['創', 'つくる', '自分たちで、仕組みを創り出す', [
      ['azakei_village', '村の税の工房', 'sim.html#koubou'], ['azakei_tsuuka', 'お祭りの券の工房', 'sim.html#tsuuka'], ['azakei-qmake', 'クイズの問題づくり', 'quiz.html#make'],
      ['azakei_planseed', 'ビジネスプランのたね', 'contests.html#plan-seed'], ['azakei_pitch', 'ピッチの舞台', 'contests.html#pitch'], ['azakei_cfund', 'クラウドファンディング', 'contests.html#cfund'], ['azakei_kisekae', 'お札マンの着せかえ', 'azakei.html#kisekae'], ['azakei_bill', '麻経券のデザイン', 'festival.html#bill']]]
  ];
  const done = STEPS.map(s => s[3].filter(([k]) => has(k)));
  const ok = done.map(d => d.length > 0);
  const all = ok.every(Boolean);
  let seen = []; try { seen = JSON.parse(raw('azakei_cert_seen') || '[]'); } catch (e) {}
  const fresh = ok.map((o, j) => o && !seen.includes(j));
  if (all && !raw('azakei_cert_date')) { const d = new Date(); save('azakei_cert_date', `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`); }
  const [cy, cm, cd] = (raw('azakei_cert_date') || '').split('-');
  const name = raw('azakei_cert_name') || '';

  box.innerHTML = `<ol class="sy-steps">${STEPS.map(([k, t, x, list], j) => `<li class="${ok[j] ? 'is-ok' : ''}${fresh[j] && !reduce ? ' is-fresh' : ''}" style="--j:${j}">
      <div class="sy-seal" aria-hidden="true"><span class="sy-ring"></span><b>${k}</b></div>
      <p class="sy-t">${['一', '二', '三'][j]}　${t}</p><p class="sy-x">${x}</p>
      <p class="sy-n">${ok[j] ? `<b>${done[j].length}</b> / ${list.length} の遊びで判` : 'まだ判がありません'}</p>
      <ul class="sy-list">${list.map(([key, n, href]) => `<li${has(key) ? ' class="is-ok"' : ''}><a href="${href}">${n}</a></li>`).join('')}</ul></li>`).join('')}</ol>
    ${all ? `<div class="sy-cert-wrap">
      <div class="sy-cert" role="img" aria-label="修了証">
        <p class="sy-c-h">修了証</p>
        <p class="sy-c-name"><span data-name>${esc(name) || 'あなた'}</span>　さん</p>
        <p class="sy-c-body">あなたは、麻経のホームページで、遊んで経済に親しみ、その仕組みを知り、自分で仕組みをつくりました。よって、ここに修了を証します。</p>
        <p class="sy-c-date">${cy ? `${cy} 年 ${cm} 月 ${cd} 日` : ''}</p>
        <div class="sy-c-foot"><p class="sy-c-by">麻布中学校・高等学校 経済系同好会<br><b>麻経 AZAKEI</b>（Web 版）</p><div class="sy-c-seals" aria-hidden="true">${STEPS.map(([k]) => `<span>${k}</span>`).join('')}</div></div>
        <p class="sy-c-note">このホームページの遊びの記録から、自動でつくる修了証です。</p>
      </div>
      <div class="sy-tools"><label>なまえ<input type="text" maxlength="16" value="${esc(name)}" placeholder="なまえ（このブラウザの中だけ）" data-name-in></label><button type="button" class="sy-print">修了証を印刷する</button></div>
    </div>` : `<p class="sy-lock"><span aria-hidden="true">証</span>${ok.filter(Boolean).length} / 3 の段に判があります。3 つそろうと、ここに修了証が出ます。${STEPS.filter((s, j) => !ok[j]).map(s => `「${s[1]}」`).join('')}の段の遊びを、ひとつためしてみてください。</p>`}`;

  // はじめて判がついた段を、覚えておく
  save('azakei_cert_seen', JSON.stringify(ok.map((o, j) => o ? j : -1).filter(j => j >= 0)));
  box.addEventListener('input', e => {
    if (!e.target.matches('[data-name-in]')) return;
    const v = e.target.value.replace(/[<>]/g, '').slice(0, 16);
    save('azakei_cert_name', v);
    box.querySelector('[data-name]').textContent = v || 'あなた';
  });
  box.addEventListener('click', e => {
    if (!e.target.closest('.sy-print')) return;
    const prev = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = 'light';
    // 修了証だけを、ページのいちばん外側に写して印刷する
    let pw = document.querySelector('.sy-pw');
    if (!pw) { pw = document.createElement('div'); pw.className = 'sy-pw'; document.body.appendChild(pw); }
    pw.innerHTML = ''; pw.appendChild(box.querySelector('.sy-cert').cloneNode(true));
    document.documentElement.classList.add('sy-printing');
    const end = () => { document.documentElement.classList.remove('sy-printing'); document.documentElement.dataset.theme = prev || ''; if (!prev) delete document.documentElement.dataset.theme; removeEventListener('afterprint', end); };
    addEventListener('afterprint', end);
    setTimeout(() => { print(); setTimeout(end, 1500); }, 60);
  });
})();
