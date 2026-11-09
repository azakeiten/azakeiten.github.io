/* ================================================================
   wordsheet.js — 授業で使える「経済ことばプリント」
   ・辞典の言葉（.gl-item）から、説明 → 言葉 を答える問題を作る
   ・分類と問題の数を選べる。語群（選択肢）つき／なし
   ・印刷すると、1 枚目が問題、2 枚目が答え（A4）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-ws]');
  if (!box) return;
  const items = [...document.querySelectorAll('.gl-item')];
  const groups = [...document.querySelectorAll('.gl-group')];
  if (!items.length) return;
  const KANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ';
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // 説明の中に答えの言葉が出てきたら、○○ でかくす
  const namesOf = it => {
    const dt = it.querySelector('dt').textContent;
    const main = dt.replace(/（.*?）/g, '').trim(), inner = (dt.match(/（(.*?)）/) || [])[1] || '';
    return [...new Set([main, main.replace(/\s/g, '')].concat(main.split(/[・と\s『』]/), inner.split(/[・、と\s]/)).map(w => w.trim()).filter(w => w.length >= 2))].sort((a, b) => b.length - a.length);
  };
  const defOf = it => {
    const dd = it.querySelector('dd').cloneNode(true);
    dd.querySelectorAll('.gl-rel').forEach(x => x.remove());
    let t = dd.textContent.trim();
    namesOf(it).forEach(n => { t = t.split(n).join('○○'); });
    return t;
  };
  const termOf = it => it.querySelector('dt').textContent.trim();
  const catName = g => g.querySelector('.gl-head').textContent.replace(/^\d+/, '').replace(/\d+ 語.*$/s, '').trim();
  box.innerHTML = `<div class="ws-ctrl">
      <label><span>分類</span><select data-k="cat"><option value="">すべての分類</option>${groups.map(g => `<option value="${g.id}">${esc(catName(g))}</option>`).join('')}</select></label>
      <label><span>問題の数</span><select data-k="n"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></label>
      <label><span>答え方</span><select data-k="bank"><option value="1" selected>語群から選ぶ</option><option value="0">言葉を書く</option></select></label>
      <div class="ws-btns"><button type="button" class="ws-re">問題を作り直す</button><button type="button" class="ws-print">印刷・PDF で保存</button></div>
    </div>
    <div class="ws-paper" aria-live="polite"></div>
    <p class="ws-note">印刷すると、1 枚目が問題、2 枚目が答えになります（A4）。授業で使うときは、プリントの下にある出典をそのまま残してください。</p>`;
  const paper = box.querySelector('.ws-paper');
  const val = k => box.querySelector(`[data-k="${k}"]`).value;
  let sheet = '';
  function make() {
    const cat = val('cat'), n = +val('n'), bank = val('bank') === '1';
    const src = items.filter(it => !cat || it.closest('.gl-group').id === cat);
    const qs = shuffle(src).slice(0, Math.min(n, src.length));
    const order = shuffle(qs);
    const letter = it => KANA[order.indexOf(it)];
    const catLabel = cat ? catName(document.getElementById(cat)) : 'すべての分類';
    const head = (sub) => `<header class="ws-h"><p class="ws-h-k">経済ことばプリント<small>${sub}</small></p><p class="ws-h-meta">分類：${esc(catLabel)}　｜　${qs.length} 問</p><p class="ws-name">組　　　番　　名前</p></header>`;
    const foot = `<footer class="ws-f">出典：麻経 AZAKEI ホームページ「経済用語ミニ辞典」 https://azakeiten.github.io/glossary.html</footer>`;
    const lead = bank ? '次の説明にあてはまる言葉を、下の語群から選んで、記号で答えましょう。説明の中の ○○ には、答えの言葉が入ります。' : '次の説明にあてはまる言葉を書きましょう。説明の中の ○○ には、答えの言葉が入ります。';
    const q = qs.map((it, i) => `<li><span class="ws-no">${i + 1}</span><p>${esc(defOf(it))}</p><span class="ws-ans" aria-hidden="true"></span></li>`).join('');
    const bk = bank ? `<div class="ws-bank"><p>語群</p><ul>${order.map(it => `<li><b>${letter(it)}</b>${esc(termOf(it))}</li>`).join('')}</ul></div>` : '';
    const a = qs.map((it, i) => `<li><span class="ws-no">${i + 1}</span><b>${bank ? letter(it) + '　' : ''}${esc(termOf(it))}</b><a href="glossary.html#${it.id}">辞典で見る</a></li>`).join('');
    sheet = `<section class="ws-page">${head('問題')}<p class="ws-lead">${lead}</p><ol class="ws-q">${q}</ol>${bk}${foot}</section>
      <section class="ws-page ws-key">${head('答え')}<ol class="ws-a">${a}</ol>${foot}</section>`;
    paper.innerHTML = sheet;
  }
  box.querySelectorAll('select').forEach(s => s.addEventListener('change', make));
  box.querySelector('.ws-re').addEventListener('click', make);
  // 印刷：プリントだけをページのいちばん外に写して、ほかはかくす
  let holder = null; let prevTheme = null;
  const before = () => {
    if (!document.body.classList.contains('ws-printing')) return;
    prevTheme = document.documentElement.dataset.theme; document.documentElement.dataset.theme = 'light'; holder = document.createElement('div'); holder.id = 'wsPrint'; holder.innerHTML = sheet; document.body.appendChild(holder);
  };
  const after = () => { document.body.classList.remove('ws-printing'); if (prevTheme) { document.documentElement.dataset.theme = prevTheme; prevTheme = null; } if (holder) { holder.remove(); holder = null; } };
  addEventListener('afterprint', after);
  box.querySelector('.ws-print').addEventListener('click', () => {
    document.body.classList.add('ws-printing'); before();
    window.print();
    setTimeout(() => { if (!matchMedia('print').matches) after(); }, 1000);
  });
  make();
})();
