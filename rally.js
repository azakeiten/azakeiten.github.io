/* ================================================================
   rally.js — 家で回る麻布経済展（Web 版のスタンプラリー）
   ・会場の入口の「入門」から、出口の「修了」まで。5 つの体験に、朱印のスタンプ
   ・スタンプは、それぞれの遊びの記録（このブラウザの中）から自動で押される
   ・5 つそろうと「修了証」を画像で保存できる（名前は画像に描くだけで、どこにも送らない・残さない）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-rally]');
  if (!box) return;
  const has = k => { try { return localStorage.getItem(k) !== null; } catch (e) { return false; } };
  // [印, 名前, ひとこと, リンク, 済んだか]
  const ST = [
    ['歩', '会場を歩く', '3D の教室を、順路どおりに最後まで', 'festival.html#room', () => has('azakei_room_tour')],
    ['億', '億万長者クイズ', 'チップを 1 枚でも残してクリア', 'quiz.html', () => has('azakei_quiz_best') || has('azakei_quiz_best_news') || has('azakei_quiz_best_time')],
    ['札', '経済カード勝負', '5 枚のカードで、相手と 5 回勝負', 'quiz.html#cardgame', () => has('azakei_card_best')],
    ['字', '経済クロスワード', '14 語と、最後の問題まで', 'quiz.html#crossword', () => has('azakei_cw_best')],
    ['診', 'エコノミスト診断', 'YES と NO で、あなたのタイプ', 'diagnosis.html', () => has('azakei_dg_type')]
  ];
  const done = ST.map(s => s[4]());
  const n = done.filter(Boolean).length, all = n === ST.length;
  box.innerHTML = `<div class="rl-path">
      <div class="rl-gate"><b>入門</b><small>入口</small></div>
      <ol class="rl-steps">${ST.map((s, i) => `<li class="${done[i] ? 'is-done' : ''}" style="--i:${i}"><a href="${s[3]}">
        <span class="rl-stamp" aria-hidden="true"><i>${s[0]}</i></span>
        <b>${s[1]}</b><small>${s[2]}</small><em>${done[i] ? '済' : 'まだ'}</em></a></li>`).join('')}</ol>
      <div class="rl-gate${all ? ' is-open' : ''}"><b>修了</b><small>出口</small></div>
    </div>
    <p class="rl-count" aria-live="polite">スタンプ <b>${n}</b> / ${ST.length}${all ? '　すべてそろいました' : `　あと ${ST.length - n} つで修了`}</p>
    ${all ? `<div class="rl-cert">
      <label><span>修了証に入れる名前（なくても大丈夫。どこにも送られません）</span><input type="text" maxlength="12" autocomplete="off" placeholder="例：あざけい" /></label>
      <button type="button" class="rl-save">修了証を画像で保存</button>
    </div>` : `<p class="rl-next">次は <a href="${ST[done.indexOf(false)][3]}">${ST[done.indexOf(false)][1]}</a> へ。スタンプは、遊び終わると自動で押されます。</p>`}`;
  if (!all) return;
  box.querySelector('.rl-save').addEventListener('click', async e => {
    const btn = e.currentTarget, name = box.querySelector('.rl-cert input').value.trim();
    btn.disabled = true; btn.textContent = 'つくっています…';
    try { await document.fonts.load('800 60px "Shippori Mincho"'); } catch (er) {}
    const W = 1600, H = 1130, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    const MIN = '"Shippori Mincho", "Yu Mincho", serif';
    x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#b08a4a'; x.lineWidth = 6; x.strokeRect(50, 50, W - 100, H - 100);
    x.lineWidth = 1.5; x.strokeRect(70, 70, W - 140, H - 140);
    x.textAlign = 'center'; x.fillStyle = '#1d1d1d';
    x.font = `800 110px ${MIN}`; x.fillText('修了証', W / 2, 250);
    x.fillStyle = '#b08a4a'; x.fillRect(W / 2 - 60, 290, 120, 3);
    x.fillStyle = '#1d1d1d'; x.font = `800 64px ${MIN}`;
    x.fillText(name ? `${name} さん` : 'あなた', W / 2, 420);
    x.font = `500 38px ${MIN}`;
    ['Web 版「麻布経済展」の 5 つの体験', '会場を歩く・億万長者クイズ・経済カード勝負・', '経済クロスワード・エコノミスト診断 を終えて、', '経済の門をくぐり、修めたことを、ここに記します。'].forEach((l, i) => x.fillText(l, W / 2, 530 + i * 64));
    const d = new Date();
    x.font = `500 32px ${MIN}`; x.fillStyle = '#555';
    x.fillText(`${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`, W / 2, 850);
    x.fillStyle = '#1d1d1d'; x.font = `800 40px ${MIN}`;
    x.fillText('AZAKEI（麻経）　麻布中学校・高等学校 経済系同好会', W / 2, 930);
    // 入門・修了の札と、朱印
    x.save(); x.translate(W - 220, 790); x.rotate(-0.12);
    x.fillStyle = '#b5432f'; x.fillRect(-80, -80, 160, 160);
    x.strokeStyle = '#fbf6ea'; x.lineWidth = 4; x.strokeRect(-68, -68, 136, 136);
    x.fillStyle = '#fbf6ea'; x.font = `800 60px ${MIN}`; x.textBaseline = 'middle';
    x.fillText('修', 0, -30); x.fillText('了', 0, 34); x.restore();
    x.fillStyle = '#8a6a32'; x.font = `500 24px ${MIN}`; x.textAlign = 'left';
    x.fillText('入門 → 修了　azakeiten.github.io/festival.html', 120, H - 110);
    x.textAlign = 'right'; x.fillText('※ Web で遊べる体験の記念です', W - 120, H - 110);
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    const file = new File([blob], 'azakei-shuryo.png', { type: 'image/png' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer: coarse)').matches) await navigator.share({ files: [file], title: '修了証' });
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
    } catch (er) {}
    btn.disabled = false; btn.textContent = '修了証を画像で保存';
  });
})();
