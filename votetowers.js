/* ================================================================
   votetowers.js — 文化祭投票：いまの票を「チップの塔」で（いちばん多い選択肢が 16 枚）
   ・vote.js が出す azakei:votes（本物の票数）を受けて描く。票の集め方には手を出さない
   ================================================================ */
(function() {
  const box = document.querySelector('[data-vote-towers]');
  if (!box) return;
  const COL = [['#b5432f', '#fffaf0'], ['#2f6b3a', '#fffaf0'], ['#b08a4a', '#fffaf0'], ['#1c2b23', '#e3c68e'], ['#c98a1c', '#fffaf0'], ['#35557a', '#fffaf0'], ['#7a5a24', '#fffaf0']];
  let last = '';
  document.addEventListener('azakei:votes', e => {
    const { total, items } = e.detail || {};
    if (!items || !total) { box.hidden = true; return; }
    const key = items.map(i => i.n).join(',');
    if (key === last) return; last = key;
    const max = Math.max(...items.map(i => i.n));
    const tower = (it, i) => {
      const cnt = it.n ? Math.max(1, Math.round(it.n / max * 16)) : 0;
      let h = '';
      for (let c = 0; c < cnt; c++) h += `<span class="vt-chip" style="--z:${c * 7}px;--d:${(c * 0.04).toFixed(3)}s;--c:${COL[i % COL.length][0]};--s:${COL[i % COL.length][1]}"><i></i><i></i><i></i><b></b></span>`;
      return `<div class="vt-col${it.n === max ? ' is-top' : ''}"><div class="vt-stage"><div class="vt-stack">${h}</div></div><p><b>${it.n}</b> 票<small>${it.label}</small></p></div>`;
    };
    box.innerHTML = `<p class="section-label">Live</p><h3>いまの票を、チップで積むと。</h3>
      <div class="vt-towers vote-vt" aria-hidden="true">${items.map(tower).join('')}</div>
      <p class="vz-note">いちばん多い選択肢を 16 枚にして、ほかは票の数に合わせて積んでいます。票が入ると、その場で積み直します。</p>`;
    box.hidden = false;
  });
})();
