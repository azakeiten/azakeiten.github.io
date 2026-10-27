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
  // 経済ラボで「済」がついた実験の数（8 つ）
  const LAB = ['azakei_sim_run', 'azakei_chart_reader', 'azakei_ozk_master', 'azakei_fx_master', 'azakei_oku', 'azakei_budget', 'azakei_bungyo'].filter(k => { try { return !!localStorage.getItem(k); } catch (e) { return false; } }).length + (get('azakei_shop', []).length >= 3 ? 1 : 0);
  const C = [
    ['探', 'サイト探検', visited.length, '/ 14 ページ', visited.length >= 14 ? '全ページ制覇！ すみずみまで見てくれてありがとう' : 'まだ見ていないページを回ってみよう', pct(visited.length, 14), 'index.html', 'サイトを回る', visited.length >= 14],
    ['億', '億万長者クイズ', num('azakei_quiz_best'), '枚', `ニュースモード ${num('azakei_quiz_best_news')} 枚・タイムアタック ${num('azakei_quiz_best_time')} 点`, null, 'quiz.html', '挑戦する', num('azakei_quiz_best') >= 40],
    ['復', 'まちがえた問題', missN, '問', missN ? '復習して、リストを空っぽにしよう' : 'いまは、まちがいリストは空っぽ', null, 'quiz.html', missN ? '復習する' : 'クイズへ', missN === 0 && num('azakei_quiz_best') > 0],
    ['辞', '単語カード', known.length, '/ 209 語', '覚えた言葉には、辞典で 済 の印', pct(known.length, 209), 'glossary.html#glCards', '続きを覚える', known.length >= 150],
    ['歴', '年表ゲーム', num('azakei_np_best'), '問連続', '先に起きたのはどっち？ 自己ベスト', null, 'glossary.html#nenpyo', '挑戦する', num('azakei_np_best') >= 8],
    ['週', '今週の 1 問', wk.streak || 0, '週連続', wk.week !== undefined ? '毎週月曜に新しい問題' : 'まだ挑戦していません', null, 'index.html#weekly', '今週の問題へ', (wk.streak || 0) >= 3],
    ['診', 'エコノミスト診断', dg ? TYPES[dg] || '診断ずみ' : '―', '', dg ? 'もう一度ためすと、タイプが変わるかも' : 'YES と NO で、あなたのタイプがわかる', null, 'diagnosis.html', dg ? 'もう一度' : '診断する', !!dg],
    ['遣', 'おこづかいチャレンジ', get('azakei_ozk_master', null) ? 'やりくり名人' : '―', '', '1 年後に自転車を買えるか', null, 'sim.html#okozukai', '挑戦する', !!get('azakei_ozk_master', null)],
    ['貨', '世界のお金図鑑', get('azakei_coins', []).length, '/ 12 枚', 'この国のお金は？ 4 択でコインを集める', pct(get('azakei_coins', []).length, 12), 'quiz.html#coins', '集める', get('azakei_coins', []).length >= 12],
    ['研', '経済ラボ', LAB, '/ 8 実験', 'クリアした実験には、メニューに「済」の朱印', pct(LAB, 8), 'sim.html', '実験をする', LAB >= 8],
    ['店', '文化祭のお店', get('azakei_shop', []).length, '/ 3 ミッション', '何個売れたら黒字になる？ 損益分岐点', pct(get('azakei_shop', []).length, 3), 'sim.html#shop', '挑戦する', get('azakei_shop', []).length >= 3],
    ['為', '円高・円安の両替所', get('azakei_fx_master', null) ? '為替マスター' : '―', '', '3 問チャレンジで全問正解すると称号', null, 'sim.html#fx', '挑戦する', !!get('azakei_fx_master', null)],
    ['読', 'チャート予想', get('azakei_chart_reader', null) ? 'チャート読み' : '―', '', '7 回中 5 回以上当てると称号', null, 'sim.html#updown', '挑戦する', !!get('azakei_chart_reader', null)],
    ['歩', '3D の会場ツアー', get('azakei_room_tour', null) ? '完走' : '―', '', '文化祭の教室を、順路どおりに', null, 'festival.html#room', 'ツアーへ', !!get('azakei_room_tour', null)],
    ['種', 'ビジネスプランのたね', planN, '/ 6 欄', planN === 6 ? 'プランのカードが完成！' : '6 つの欄をうめて、カードを完成させよう', pct(planN, 6), 'contests.html#plan-seed', planN ? '続きを書く' : '書いてみる', planN === 6]
  ];
  const done = C.filter(c => c[8]).length;
  const B = window.AZAKEI_BADGES || [];
  const got = B.filter(b => b[2]).length;
  // 称号：記録とバッジの合計で、5 段階
  const score = done + got, max = C.length + B.length;
  const RANKS = [[0, '見学者', '見', 'まずは、気になるカードから'], [4, '見習い部員', '習', 'いい調子。いろいろ試してみよう'], [10, '研究員', '研', 'サイトのことが、だいぶわかってきたね'], [16, '主任エコノミスト', '主', 'ここまで来た人は、なかなかいません'], [22, '麻経マスター', '極', 'ぜんぶの遊びを知りつくした人']];
  const ri = RANKS.reduce((a, r, i) => score >= r[0] ? i : a, 0), rank = RANKS[ri], nextR = RANKS[ri + 1];
  const nextC = C.find(c => !c[8]);
  const NUDGE = { 研: '11 の実験のうち、まだ「済」がついていないものから', 貨: '「この国のお金は？」に答えて、コインを図鑑に', 店: '4 つのつまみで、文化祭のお店を黒字にしよう', 為: '1 ドルが何円かを動かして、円高・円安を体験', 歴: '年表のできごとを 2 つ。先に起きたのはどっち？', 探: 'まだ見ていないページに、新しい発見があるかも', 億: 'チップを賭けて答える経済クイズ。まずは 40 枚をめざそう', 復: 'まちがえた問題だけを、もう一度。全問正解でリストが空に', 辞: '1 枚ずつめくって覚える単語カード。まずは 30 語から', 週: '毎週月曜に変わる 1 問。3 週続けて正解しよう', 診: 'YES と NO で答えるだけ。あなたはどの動物タイプ？', 遣: '1 年でおこづかいをやりくり。自転車は買えるかな', 読: '株価のチャートは、上がる？ 下がる？', 歩: '文化祭の教室を、3D で順番に見て回ろう', 種: '6 つの欄をうめると、自分のビジネスプランが完成' };
  box.innerHTML = `<div class="my-rank">
      <span class="my-rank-seal" aria-hidden="true">${rank[2]}</span>
      <div class="my-rank-body"><p class="my-rank-label">いまの称号</p><p class="my-rank-name">${rank[1]}</p><p class="my-rank-msg">${rank[3]}</p>
        <span class="my-rank-bar"><i style="width:${pct(score, max)}%"></i></span>
        <p class="my-rank-meta"><span>達成 <b>${done}</b> / ${C.length}</span><span>バッジ <b>${got}</b> / ${B.length}</span>${nextR ? `<span>「${nextR[1]}」まで あと <b>${nextR[0] - score}</b></span>` : '<span>最高の称号です</span>'}</p>
        ${window.AZAKEI_SHARE_IMG ? '<button type="button" class="my-share">称号を画像で保存・シェア</button>' : ''}</div>
    </div>
    ${nextC ? `<a class="my-next" href="${nextC[6]}"><span class="my-next-k">つぎのおすすめ</span><b>${nextC[1]}</b><small>${NUDGE[nextC[0]] || nextC[4]}</small><span class="my-next-go">${nextC[7]} →</span></a>` : ''}
    <h2 class="my-h">記録</h2>`
    + C.map(([s, name, big, unit, sub, p, href, cta, ok], ci) => `<a class="my-card${ok ? ' is-done' : ''}" href="${href}" style="--i:${ci}">
      <span class="my-seal">${s}</span><p class="my-name">${name}${ok ? '<em>達成</em>' : ''}</p>
      <p class="my-big"><b>${big}</b><small>${unit}</small></p><p class="my-sub">${sub}</p>
      ${p !== null ? `<span class="my-bar"><i style="width:${p}%"></i></span>` : ''}<span class="my-cta">${cta} →</span></a>`).join('')
    + (B.length ? `<h2 class="my-h">バッジ <small>${got} / ${B.length}</small></h2>
      <ul class="my-badges">${B.map(([s, name, ok, how, href], bi) => `<li class="${ok ? 'is-got' : ''}" style="--i:${bi}"><a href="${href}"><span class="my-medal" aria-hidden="true">${ok || !how.startsWith('ひみつ') ? s : '？'}</span><b>${ok || !how.startsWith('ひみつ') ? name : '？？？'}</b><small>${ok ? '獲得ずみ' : how}</small></a></li>`).join('')}</ul>` : '');
  // 称号を、縦長の画像に（インスタのストーリーなどに）
  const shareBtn = box.querySelector('.my-share');
  if (shareBtn) shareBtn.addEventListener('click', async () => {
    const label = shareBtn.textContent; shareBtn.disabled = true; shareBtn.textContent = '…';
    const art = `<svg viewBox="0 0 120 120"><rect x="14" y="14" width="92" height="92" rx="16" fill="#b5432f" transform="rotate(-6 60 60)"/><rect x="22" y="22" width="76" height="76" rx="11" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" transform="rotate(-6 60 60)"/><text x="60" y="80" font-family="Shippori Mincho, serif" font-weight="800" font-size="58" fill="#fff" text-anchor="middle" transform="rotate(-6 60 60)">${rank[2]}</text></svg>`;
    try {
      const r = await window.AZAKEI_SHARE_IMG({ kicker: 'AZAKEI での、わたしの称号', art, title: rank[1], subtitle: `記録の達成 ${done} / ${C.length} ・ バッジ ${got} / ${B.length}`, lines: [rank[3]], cta: 'あなたは、どの称号？', url: 'azakeiten.github.io/mypage.html', filename: 'azakei-rank', text: `AZAKEI のホームページで、称号「${rank[1]}」になりました！ #AZAKEI` });
      shareBtn.textContent = r === 'cancel' ? label : '保存しました！';
    } catch (e) { shareBtn.textContent = '画像を作れませんでした'; }
    setTimeout(() => { shareBtn.textContent = label; shareBtn.disabled = false; }, 2200);
  });
  // 演出：数字を 0 から数えあげる（動きを減らす設定のときは、そのまま）
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('is-lite')) {
    box.querySelectorAll('.my-big b, .my-rank-meta b').forEach(el => {
      const to = +el.textContent;
      if (!(to > 0)) return;
      const t0 = performance.now() + 200, dur = 900;
      setTimeout(() => { el.textContent = to; }, 1400);
      el.textContent = '0';
      const tick = now => { const k = Math.min(1, Math.max(0, (now - t0) / dur)); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
  }
})();
