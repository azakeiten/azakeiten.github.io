/* ================================================================
   myrecord.js — わたしの記録（このブラウザに残っている記録を、1 ページにまとめて見せる）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-myrecord]');
  if (!box) return;
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { try { return localStorage.getItem(k) ?? d; } catch (e2) { return d; } } };
  const num = k => +(get(k, 0)) || 0;
  const visited = get('azakei-visited', []);
  const known = get('azakei_gl_known', []);
  const missN = get('azakei_quiz_miss', []).length;
  const wk = get('azakei_weekly', {});
  const dg = get('azakei_dg_type', '');
  const plan = get('azakei_planseed', {});
  const planN = ['problem', 'idea', 'persona', 'model', 'diff', 'pitch'].filter(k => (plan[k] || '').trim()).length;
  const TYPES = { lion: 'ライオンタイプ', fox: 'キツネタイプ', turtle: 'カメタイプ', rabbit: 'ウサギタイプ' };
  const pct = (a, b) => Math.min(100, Math.round(a / b * 100));
  // [印, 名前, 大きな数字, 単位, 説明, 進み具合(0〜100 か null), リンク, リンクの文字, 済み？]
  const C = [
    ['探', 'サイト探検', visited.length, '/ 14 ページ', visited.length >= 14 ? '全ページ制覇！ すみずみまで見てくれてありがとう' : 'まだ見ていないページを回ってみよう', pct(visited.length, 14), 'index.html', 'サイトを回る', visited.length >= 14],
    ['億', '億万長者クイズ', num('azakei_quiz_best'), '枚', `ニュースモード ${num('azakei_quiz_best_news')} 枚・タイムアタック ${num('azakei_quiz_best_time')} 点`, null, 'quiz.html', '挑戦する', num('azakei_quiz_best') >= 40],
    ['復', 'まちがえた問題', missN, '問', missN ? '復習して、リストを空っぽにしよう' : 'いまは、まちがいリストは空っぽ', null, 'quiz.html', missN ? '復習する' : 'クイズへ', missN === 0 && num('azakei_quiz_best') > 0],
    ['辞', '単語カード', known.length, '/ 195 語', '覚えた言葉には、辞典で 済 の印', pct(known.length, 195), 'glossary.html#glCards', '続きを覚える', known.length >= 150],
    ['週', '今週の 1 問', wk.streak || 0, '週連続', wk.week !== undefined ? '毎週月曜に新しい問題' : 'まだ挑戦していません', null, 'index.html#weekly', '今週の問題へ', (wk.streak || 0) >= 3],
    ['診', 'エコノミスト診断', dg ? TYPES[dg] || '診断ずみ' : '―', '', dg ? 'もう一度ためすと、タイプが変わるかも' : 'YES と NO で、あなたのタイプがわかる', null, 'diagnosis.html', dg ? 'もう一度' : '診断する', !!dg],
    ['遣', 'おこづかいチャレンジ', get('azakei_ozk_master', null) ? 'やりくり名人' : '―', '', '1 年後に自転車を買えるか', null, 'sim.html#okozukai', '挑戦する', !!get('azakei_ozk_master', null)],
    ['読', 'チャート予想', get('azakei_chart_reader', null) ? 'チャート読み' : '―', '', '7 回中 5 回以上当てると称号', null, 'sim.html#updown', '挑戦する', !!get('azakei_chart_reader', null)],
    ['歩', '3D の会場ツアー', get('azakei_room_tour', null) ? '完走' : '―', '', '文化祭の教室を、順路どおりに', null, 'festival.html#room', 'ツアーへ', !!get('azakei_room_tour', null)],
    ['種', 'ビジネスプランのたね', planN, '/ 6 欄', planN === 6 ? 'プランのカードが完成！' : '6 つの欄をうめて、カードを完成させよう', pct(planN, 6), 'contests.html#plan-seed', planN ? '続きを書く' : '書いてみる', planN === 6]
  ];
  const done = C.filter(c => c[8]).length;
  box.innerHTML = `<div class="my-summary"><b>${done}</b><span>/ ${C.length} の記録が「達成」</span><i style="--p:${pct(done, C.length)}%"></i></div>`
    + C.map(([s, name, big, unit, sub, p, href, cta, ok]) => `<a class="my-card${ok ? ' is-done' : ''}" href="${href}">
      <span class="my-seal">${s}</span><p class="my-name">${name}${ok ? '<em>達成</em>' : ''}</p>
      <p class="my-big"><b>${big}</b><small>${unit}</small></p><p class="my-sub">${sub}</p>
      ${p !== null ? `<span class="my-bar"><i style="width:${p}%"></i></span>` : ''}<span class="my-cta">${cta} →</span></a>`).join('');
})();
