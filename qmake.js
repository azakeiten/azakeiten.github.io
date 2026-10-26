/* ================================================================
   qmake.js — クイズ：問題を、つくってみよう（書く → その場で遊べる見本 → お問い合わせで送れる）
   ・書いている内容は、このタブの中にだけ残す（送るまでは、どこにも届かない）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-qmake]');
  if (!box) return;
  const KEY = 'azakei-qmake';
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  let d = { q: '', a: ['', '', '', ''], note: '', lv: '普通' };
  try { d = Object.assign(d, JSON.parse(sessionStorage.getItem(KEY) || '{}')); } catch (e) {}
  box.innerHTML = `
    <div class="qm-form">
      <label class="qm-f"><span>問題</span><textarea data-k="q" rows="2" maxlength="80" placeholder="例：日本のお札を発行しているのは？">${esc(d.q)}</textarea></label>
      <div class="qm-f"><span>答え（いちばん上が正解）</span>
        ${d.a.map((t, i) => `<label class="qm-a${i === 0 ? ' is-ok' : ''}"><i>${i === 0 ? '正解' : 'ハズレ'}</i><input data-a="${i}" maxlength="24" value="${esc(t)}" placeholder="${['日本銀行', '財務省', '造幣局', '国立印刷局'][i]}"></label>`).join('')}
      </div>
      <label class="qm-f"><span>解説（なぜその答え？）</span><textarea data-k="note" rows="2" maxlength="120" placeholder="例：お札を刷るのは国立印刷局、発行するのは日本銀行。">${esc(d.note)}</textarea></label>
      <div class="qm-f"><span>難しさ</span><div class="qm-lv">${['かんたん', '普通', '激ムズ'].map(l => `<button type="button" data-lv="${l}" aria-pressed="${l === d.lv}">${l}</button>`).join('')}</div></div>
    </div>
    <div class="qm-side">
      <p class="qm-side-h">見本で遊んでみる</p>
      <div class="qm-card" aria-live="polite"></div>
      <div class="qm-send">
        <a class="btn-primary qm-go" href="contact.html?type=other">この問題を AZAKEI に送る</a>
        <p>お問い合わせフォームに、問題が書きこまれた状態で開きます。送ってくれた問題は、AZAKEI のメンバーが読みます。</p>
      </div>
    </div>`;
  const card = box.querySelector('.qm-card');
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
  const ready = () => d.q.trim() && d.a.every(t => t.trim());
  const draw = () => {
    if (!ready()) { card.innerHTML = `<p class="qm-empty">問題と 4 つの答えを書くと、ここでクイズとして遊べます。<small>あと ${(d.q.trim() ? 0 : 1) + d.a.filter(t => !t.trim()).length} か所</small></p>`; box.querySelector('.qm-go').classList.add('is-off'); return; }
    box.querySelector('.qm-go').classList.remove('is-off');
    const order = [0, 1, 2, 3].sort(() => Math.random() - .5);
    card.innerHTML = `<p class="qm-lvtag">${esc(d.lv)}</p><p class="qm-q">${esc(d.q)}</p><div class="qm-opts">${order.map((k, i) => `<button type="button" data-k="${k}"><span>${'ABCD'[i]}</span>${esc(d.a[k])}</button>`).join('')}</div><div class="qm-fb"></div>`;
    const bs = [...card.querySelectorAll('.qm-opts button')];
    bs.forEach(b => b.addEventListener('click', () => {
      if (bs[0].disabled) return;
      const ok = b.dataset.k === '0';
      bs.forEach(x => { x.disabled = true; if (x.dataset.k === '0') x.classList.add('is-right'); });
      if (!ok) b.classList.add('is-wrong');
      card.querySelector('.qm-fb').innerHTML = `<p class="${ok ? 'ok' : 'ng'}">${ok ? '正解！' : '残念……'}</p>${d.note.trim() ? `<p>${esc(d.note)}</p>` : '<p class="qm-hint">解説を書くと、ここに出ます。</p>'}<button type="button" class="qm-again">もう一度（答えの順番が変わります）</button>`;
      card.querySelector('.qm-again').addEventListener('click', draw);
    }));
  };
  let t;
  box.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.k) d[el.dataset.k] = el.value;
    if (el.dataset.a) d.a[+el.dataset.a] = el.value;
    save(); clearTimeout(t); t = setTimeout(draw, 350);
  });
  box.querySelector('.qm-lv').addEventListener('click', e => {
    const b = e.target.closest('[data-lv]'); if (!b) return;
    d.lv = b.dataset.lv; save();
    box.querySelectorAll('[data-lv]').forEach(x => x.setAttribute('aria-pressed', x === b));
    draw();
  });
  // 送る：お問い合わせの「書きかけ」に問題を入れてから開く（フォームが自動で読みこむ）
  box.querySelector('.qm-go').addEventListener('click', e => {
    if (!ready()) { e.preventDefault(); box.querySelector(d.q.trim() ? '[data-a]' : '[data-k="q"]').focus(); return; }
    const msg = `【クイズの問題の提案】\n難しさ：${d.lv}\n問題：${d.q}\n正解：${d.a[0]}\nハズレ：${d.a.slice(1).join(' ／ ')}\n解説：${d.note || '（なし）'}\n`;
    try {
      const prev = JSON.parse(sessionStorage.getItem('azakei-contact-draft') || '{}');
      sessionStorage.setItem('azakei-contact-draft', JSON.stringify(Object.assign(prev, { type: 'other', message: msg })));
    } catch (err) {}
  });
  draw();
})();
