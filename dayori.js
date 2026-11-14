/* ================================================================
   dayori.js — 「麻経だより」（月刊）
   ・その月にサイトに加わったもの（content.js の newPlay）、経済の暦（econcal.js）、辞典の言葉から、
     新聞のかたちの 1 枚を自動でつくる。書いてある中身は、どれもサイトのほかのページにあるものだけ
   ・月をえらべる。印刷すると A4 の 1 枚に
   ================================================================ */
(function() {
  const box = document.querySelector('[data-dayori]');
  if (!box) return;
  const A = window.AZAKEI || {}, NP = A.newPlay || [], EC = window.AZAKEI_ECAL || [];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const now = new Date();
  // 号のある月（newPlay に記事がある月）。新しい順
  const months = [...new Set(NP.map(p => p.date.slice(0, 7)))].sort().reverse();
  const cur0 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!months.includes(cur0)) months.unshift(cur0);
  let cur = months[0];
  const fest = new Date(2027, 4, 1);
  const kanjiNum = n => ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'][n] || n;
  let words = null;
  const loadWords = () => words ? Promise.resolve(words) : fetch('glossary.html').then(r => r.text()).then(t => {
    const d = new DOMParser().parseFromString(t, 'text/html');
    words = [...d.querySelectorAll('.gl-group .gl-item')].map(el => {
      const dd = el.querySelector('dd').cloneNode(true); dd.querySelectorAll('.gl-rel, button').forEach(x => x.remove());
      return { id: el.id, t: el.querySelector('dt').textContent.trim(), d: dd.textContent.trim() };
    });
    return words;
  }).catch(() => (words = []));

  const render = () => {
    const [y, m] = cur.split('-').map(Number);
    const arts = NP.filter(p => p.date.startsWith(cur)).sort((a, b) => b.date.localeCompare(a.date));
    const lead = arts[0], rest = arts.slice(1);
    const cal = EC.filter(e => e[0] === m).sort((a, b) => a[1] - b[1]);
    const issue = months.length - months.indexOf(cur);
    const isNow = cur === cur0;
    const left = Math.max(0, Math.ceil((fest - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5));
    box.innerHTML = `<div class="dy-tabs" role="group" aria-label="号をえらぶ">${months.map(k => { const [yy, mm] = k.split('-').map(Number); return `<button type="button" data-k="${k}" aria-pressed="${k === cur}">${yy} 年 ${mm} 月号</button>`; }).join('')}<button type="button" class="dy-print">印刷する（A4）</button></div>
      <article class="dy-paper" aria-label="麻経だより ${y} 年 ${m} 月号">
        <header class="dy-mast">
          <div class="dy-title"><span class="dy-seal" aria-hidden="true">麻経</span><h2>麻経だより</h2></div>
          <div class="dy-meta"><p><b>${y} 年 ${m} 月号</b>（第 ${issue} 号）</p><p>発行　麻布中学校・高等学校 経済系同好会 AZAKEI</p><p>azakeiten.github.io</p></div>
        </header>
        <p class="dy-motto">世の中の仕組みを理解し、自らで仕組みを創り出す。</p>
        <div class="dy-body">
          <div class="dy-main">
            ${lead ? `<section class="dy-lead"><p class="dy-kicker"><span>${esc(lead.seal)}</span>${esc(lead.eyebrow)}</p><h3>${esc(lead.title)}</h3><p>${esc(lead.text)}</p><p class="dy-link">${esc(lead.date.slice(5).replace('-', ' 月 '))} 日　<a href="${esc(lead.href)}">サイトで見る →</a></p></section>` : `<section class="dy-lead"><h3>今月の新しいお知らせは、まだありません。</h3><p>月の途中でも、サイトに新しいものが加わると、この号に記事がふえていきます。</p></section>`}
            ${rest.length ? `<div class="dy-cols">${rest.map(p => `<section class="dy-art"><p class="dy-kicker"><span>${esc(p.seal)}</span>${esc(p.eyebrow)}</p><h4>${esc(p.title)}</h4><p>${esc(p.text)}</p><p class="dy-link">${esc(p.date.slice(5).replace('-', ' 月 '))} 日　<a href="${esc(p.href)}">見る →</a></p></section>`).join('')}</div>` : ''}
          </div>
          <aside class="dy-side">
            <section class="dy-box"><h4><span>暦</span>${kanjiNum(m)}月の、経済の何の日</h4>${cal.length ? `<ol>${cal.map(e => `<li><b>${e[1]} 日</b><span>${e[2]} 年　${esc(e[3])}</span></li>`).join('')}</ol>` : '<p>この月の記録は、まだありません。</p>'}<p class="dy-link"><a href="events.html#koyomi">経済の暦 →</a></p></section>
            <section class="dy-box dy-word"><h4><span>辞</span>今月の言葉</h4><div data-dy-word><p>読みこんでいます…</p></div></section>
            ${isNow ? `<section class="dy-box dy-count"><h4><span>祭</span>次の麻布経済展まで</h4><p class="dy-days"><b>${left}</b>日</p><p class="dy-sm">2027 年 5 月（予定）。準備の流れは<a href="events.html#yearplan">日程とイベント</a>で。</p></section>` : ''}
          </aside>
        </div>
        <footer class="dy-foot">この号の記事は、ホームページ（azakeiten.github.io）の「新しく遊べるもの」と「経済の暦」・用語辞典から、自動でまとめています。</footer>
      </article>`;
    loadWords().then(ws => {
      const el = box.querySelector('[data-dy-word]'); if (!el) return;
      if (!ws.length) { el.innerHTML = '<p>用語辞典で、言葉を引いてみてください。</p>'; return; }
      const w = ws[(y * 12 + m * 7) % ws.length];
      el.innerHTML = `<p class="dy-w-t">${esc(w.t)}</p><p>${esc(w.d.split('。')[0])}。</p><p class="dy-link"><a href="glossary.html#${esc(w.id)}">辞典で読む →</a></p>`;
    });
  };
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (b) { cur = b.dataset.k; render(); return; }
    if (e.target.closest('.dy-print')) {
      const prev = document.documentElement.dataset.theme;
      document.documentElement.dataset.theme = 'light';
      setTimeout(() => { print(); document.documentElement.dataset.theme = prev; }, 60);
    }
  });
  render();
})();
