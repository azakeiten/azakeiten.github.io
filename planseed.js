/* ================================================================
   planseed.js — コンテスト：ビジネスプランのたね（6 つの欄に書くと、プランのカードになる）
   ・書いた内容は、このブラウザの中にだけ残す（送信はしない）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-planseed]');
  if (!box) return;
  const KEY = 'azakei_planseed';
  const F = [
    ['problem', '01', 'だれの、どんな困りごと？', '例：朝の駅で、自転車を止める場所が足りない', 'business-plan', '課題'],
    ['idea', '02', 'どうやって解決する？', '例：空いている駐輪場を、アプリで予約できるようにする', 'startup', 'アイデア'],
    ['persona', '03', 'いちばんのお客さんは、どんな人？', '例：駅まで自転車で通う、高校生と会社員', 'persona', 'ペルソナ'],
    ['model', '04', 'どうやってお金をもらう？', '例：1 回 100 円の予約料。駐輪場には広告を出してもらう', 'business-model', 'ビジネスモデル'],
    ['diff', '05', 'ライバルとのちがいは？', '例：前の日の夜から予約できて、雨の日は屋根つきを優先', 'differentiation', '差別化'],
    ['pitch', '06', 'ひとことで言うと？', '例：「朝の駐輪場を、予約できる時代へ。」', 'pitch', 'ピッチ']
  ];
  let data = {};
  try { data = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  box.innerHTML = `
    <ol class="ps-steps">${F.map(([k, n, q, ph, gl, tag]) => `<li><label><span class="ps-no">${n}</span><b>${q}</b><a class="ps-gl" href="glossary.html#${gl}">${tag}とは？</a><textarea data-k="${k}" rows="2" maxlength="120" placeholder="${ph}">${esc(data[k])}</textarea></label></li>`).join('')}</ol>
    <div class="ps-card" aria-live="polite"></div>
    <div class="ps-actions"><button type="button" class="ps-copy">プランを文字でコピー</button><button type="button" class="ps-clear">書いたものを消す</button></div>
    <p class="ps-note">書いた内容は、このブラウザの中にだけ残ります。どこにも送られません。</p>`;
  const card = box.querySelector('.ps-card');
  const filled = () => F.filter(([k]) => (data[k] || '').trim()).length;
  const draw = () => {
    const n = filled();
    card.innerHTML = `<p class="ps-card-head"><span>わたしのビジネスプラン</span><small>${n} / 6</small></p>
      <p class="ps-pitch">${esc(data.pitch) || '<i>（06 のひとことが、ここに入ります）</i>'}</p>
      <dl>${F.slice(0, 5).map(([k, , , , , tag]) => `<div><dt>${tag}</dt><dd>${esc(data[k]) || '―'}</dd></div>`).join('')}</dl>
      ${n === 6 && window.AZAKEI_OSATSU ? AZAKEI_OSATSU('6 つそろったね！ これがビジネスコンテストの第一歩。だれかに話して、意見をもらってみよう。', 'happy') : ''}`;
  };
  box.addEventListener('input', e => {
    const t = e.target.closest('textarea[data-k]'); if (!t) return;
    data[t.dataset.k] = t.value;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (err) {}
    draw();
  });
  box.querySelector('.ps-copy').addEventListener('click', async e => {
    const text = `【わたしのビジネスプラン】\n${data.pitch || ''}\n` + F.slice(0, 5).map(([k, , , , , tag]) => `・${tag}：${data[k] || ''}`).join('\n');
    try { await navigator.clipboard.writeText(text); e.target.textContent = 'コピーしました！'; } catch (err) { e.target.textContent = 'コピーできませんでした'; }
    setTimeout(() => { e.target.textContent = 'プランを文字でコピー'; }, 2000);
  });
  box.querySelector('.ps-clear').addEventListener('click', () => {
    if (!confirm('書いたものを、ぜんぶ消しますか？')) return;
    data = {}; try { localStorage.removeItem(KEY); } catch (e) {}
    box.querySelectorAll('textarea').forEach(t => { t.value = ''; }); draw();
  });
  draw();
})();
