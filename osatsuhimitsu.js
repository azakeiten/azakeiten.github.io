/* ================================================================
   osatsuhimitsu.js — あそび場：新しいお札のひみつ（偽造防止のくふう・近づいてから読みこむ）
   ・2024 年 7 月に発行された一万円・五千円・千円札の、にせものを防ぐくふうを、説明用の図でさがす
   ・かたむける（3D ホログラム・潜像模様・パールインキ）／光にすかす（すかし）／虫めがね（マイクロ文字）／さわる（識別マーク）
   ・図は実物をまねたものではない（肖像はかかず、「見本」の説明図）。見た目は osatsuhimitsu.css
   ================================================================ */
(function () {
  const box = document.querySelector('[data-osatsuhimitsu]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="osatsuhimitsu.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'osatsuhimitsu.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const H = [
    ['holo', '輝', '3D ホログラム', 'かたむけると、肖像が立体的にくるりと回って見えます。銀行券に使われたのは、新しいお札が世界ではじめてです（一万円札・五千円札は帯の形、千円札は丸い形）。', 'かたむける'],
    ['sukashi', '透', 'すかし', '光にすかすと、肖像が浮かびます。新しいお札では、そのまわりに細かい模様（高精細すき入れ模様）も入りました。', '光にすかす'],
    ['sengo', '潜', '潜像模様', 'お札を大きくかたむけると、かくれていた数字（券の金額）が浮かびあがります。', 'かたむける'],
    ['pearl', '珠', 'パールインキ', 'かたむけると、お札のはしに、ピンク色の光る模様が見えます。', 'かたむける'],
    ['micro', '微', 'マイクロ文字', 'とても小さな「NIPPONGINKO」の文字が入っています。コピー機ではつぶれてしまいます。', '虫めがね'],
    ['touch', '触', '識別マーク', '指でさわると、ざらざらした印があります。目の不自由な人にもわかるように、券の種類ごとに場所がちがいます（形はそろえてあります）。', 'さわる']
  ];
  box.innerHTML = `
    <div class="bz-stage">
      <div class="bz-tools" role="group" aria-label="しらべかた">
        <button type="button" data-t="light" aria-pressed="false"><span>透</span>光にすかす</button>
        <button type="button" data-t="lens" aria-pressed="false"><span>微</span>虫めがね</button>
        <button type="button" data-t="touch" aria-pressed="false"><span>触</span>指でさわる</button>
      </div>
      <div class="bz-scene">
        <div class="bz-note" style="--tilt:0">
          <svg viewBox="0 0 640 320" class="bz-svg" role="img" aria-label="新しいお札のしくみを説明する図（見本）">
            <defs><linearGradient id="bz-paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efe6cf"/><stop offset="1" stop-color="#ddd0ae"/></linearGradient>
              <linearGradient id="bz-holo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="bz-h1"/><stop offset=".5" class="bz-h2"/><stop offset="1" class="bz-h3"/></linearGradient>
              <radialGradient id="bz-light" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#fffbe8" stop-opacity="0"/></radialGradient></defs>
            <rect x="6" y="6" width="628" height="308" rx="14" fill="url(#bz-paper)" class="bz-paper"/>
            <rect x="20" y="20" width="600" height="280" rx="8" class="bz-frame"/>
            ${Array.from({ length: 14 }, (_, i) => `<path class="bz-guilloche" d="M30 ${60 + i * 16} Q 200 ${40 + i * 16}, 330 ${60 + i * 16} T 610 ${60 + i * 16}"/>`).join('')}
            <text x="320" y="62" class="bz-bank">日本銀行券（説明用の図）</text>
            <text x="530" y="104" class="bz-num">10000</text>
            <text x="100" y="286" class="bz-num is-s">10000</text>
            <g class="bz-mihon" transform="translate(320 168) rotate(-12)"><rect x="-70" y="-24" width="140" height="48" rx="6"/><text y="12">見本</text></g>
            <g class="bz-wm" transform="translate(470 182)"><circle r="56" class="bz-wm-c"/><g class="bz-wm-in"><circle cy="-12" r="18"/><path d="M-34 40 Q-34 6 0 4 Q34 6 34 40 Z"/>${Array.from({ length: 9 }, (_, i) => `<path class="bz-fine" d="M-50 ${-40 + i * 10} h100"/>`).join('')}</g></g>
            <g class="bz-holo" transform="translate(110 160)"><rect x="-34" y="-110" width="68" height="220" rx="6" fill="url(#bz-holo)" class="bz-holo-b"/><g class="bz-holo-face"><circle cy="-6" r="14"/><path d="M-24 34 Q-24 8 0 6 Q24 8 24 34 Z"/></g><text y="88" class="bz-holo-t">HOLO</text></g>
            <g class="bz-sengo" transform="translate(470 270)"><rect x="-60" y="-16" width="120" height="30" rx="4" class="bz-sengo-b"/><text y="7" class="bz-sengo-t">10000</text>${Array.from({ length: 12 }, (_, i) => `<path class="bz-sengo-l" d="M${-58 + i * 10} -14 v26"/>`).join('')}</g>
            <rect x="8" y="40" width="10" height="240" rx="5" class="bz-pearl"/><rect x="622" y="40" width="10" height="240" rx="5" class="bz-pearl"/>
            <text x="320" y="252" class="bz-micro">NIPPONGINKO NIPPONGINKO NIPPONGINKO NIPPONGINKO NIPPONGINKO</text>
            <g class="bz-tact"><g transform="translate(36 120)">${[0, 1, 2].map(i => `<rect x="0" y="${i * 14}" width="12" height="8" rx="3"/>`).join('')}</g><g transform="translate(592 120)">${[0, 1, 2].map(i => `<rect x="0" y="${i * 14}" width="12" height="8" rx="3"/>`).join('')}</g></g>
            <rect width="640" height="320" rx="14" fill="url(#bz-light)" class="bz-glow"/>
          </svg>
          <div class="bz-lens" aria-hidden="true"></div>
        </div>
      </div>
      <label class="bz-tilt"><span>左にかたむける</span><input type="range" min="-35" max="35" value="0" aria-label="お札のかたむき"><span>右にかたむける</span></label>
      <p class="bz-msg" data-k="msg" aria-live="polite">お札をかたむけたり、光にすかしたりして、にせものを防ぐ 6 つのひみつをさがそう。</p>
    </div>
    <div class="bz-side">
      <p class="bz-score"><b data-k="n">0</b> / 6 のひみつを発見</p>
      <ol class="bz-list">${H.map(([k, s, t, d, how]) => `<li data-h="${k}"><span class="bz-s">${s}</span><div><b>${t}</b><small class="bz-how">${how}と見つかる</small><p>${d}</p></div></li>`).join('')}</ol>
    </div>
    <div class="bz-learn">
      <p><b>なぜ、こんなにくふうするの？</b>お札は、ただの紙に「この金額の価値がある」とみんなが信じることで、お金として使えます。にせものがあふれると、その信用がくずれてしまいます。</p>
      <p><b>新しいお札</b>2024 年 7 月、一万円・五千円・千円の新しいお札が発行されました。肖像は渋沢栄一・津田梅子・北里柴三郎。数字も大きくなり、だれにでも見やすくなりました（<a href="glossary.html#bank-note">日本銀行券</a>）。</p>
      <p><b>つくるのはだれ？</b>お札を発行するのは日本銀行、印刷するのは国立印刷局です。お札をコピーしたり、まぎらわしい物をつくったりすることは、法律で禁止されています。</p>
      <p><b>この図について</b>ここにあるのは、しくみを知るための「説明用の図」で、実物とはちがいます。くわしくは、日本銀行や国立印刷局の説明を見てみよう。</p>
    </div>`;

  const K = k => box.querySelector(`[data-k="${k}"]`);
  const note = box.querySelector('.bz-note'), range = box.querySelector('.bz-tilt input'), lens = box.querySelector('.bz-lens');
  const found = new Set();
  const find = k => {
    if (found.has(k)) return;
    found.add(k);
    const li = box.querySelector(`[data-h="${k}"]`); li.classList.add('is-found');
    const h = H.find(x => x[0] === k);
    K('n').textContent = found.size;
    K('msg').textContent = found.size === 6 ? '6 つのひみつを、ぜんぶ見つけました！ これだけのくふうで、お札の信用が守られています。' : `「${h[2]}」を見つけた！ ${h[3]}`;
    if (found.size === 6) { box.classList.add('is-all'); try { localStorage.setItem('azakei_osatsu_himitsu', '6'); } catch (e) {} if (window.AZAKEI_TALK && !box.dataset.talked) { box.dataset.talked = '1'; const w = document.createElement('div'); K('msg').after(w); window.AZAKEI_TALK(w, 'himitsu', 'top'); } }
    else try { localStorage.setItem('azakei_osatsu_himitsu', String(found.size)); } catch (e) {}
  };
  const tilt = v => {
    note.style.setProperty('--tilt', v);
    note.style.setProperty('--hh', (180 + v * 6) % 360);
    const a = Math.abs(v);
    note.classList.toggle('is-tilt', a > 6); note.classList.toggle('is-big', a > 22);
    if (a > 10) find('holo');
    if (a > 22) { find('sengo'); find('pearl'); }
  };
  range.addEventListener('input', () => tilt(+range.value));
  // 指やマウスでお札を動かすと、かたむく
  let drag = null;
  note.addEventListener("pointerdown", e => { if (box.dataset.tool === "lens") { note.dispatchEvent(new PointerEvent("pointermove", { clientX: e.clientX, clientY: e.clientY })); return; } drag = { x: e.clientX, v: +range.value }; note.setPointerCapture(e.pointerId); });
  note.addEventListener('pointermove', e => {
    if (box.dataset.tool === 'lens') { const r = note.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; lens.style.left = x + 'px'; lens.style.top = y + 'px'; const z = y / r.height > .72 && y / r.height < .86; box.classList.toggle("lens-micro", z); if (z) find("micro"); return; }
    if (!drag) return; const v = Math.max(-35, Math.min(35, drag.v + (e.clientX - drag.x) * .25)); range.value = v; tilt(v);
  });
  const end = () => { drag = null; }; note.addEventListener('pointerup', end); note.addEventListener('pointercancel', end);
  box.addEventListener('click', e => {
    const t = e.target.closest('[data-t]'); if (!t) return;
    const on = t.getAttribute('aria-pressed') !== 'true';
    box.querySelectorAll('[data-t]').forEach(b => b.setAttribute('aria-pressed', b === t && on));
    box.dataset.tool = on ? t.dataset.t : '';
    if (on && t.dataset.t === 'light') find('sukashi');
    if (on && t.dataset.t === 'touch') find('touch');
    if (on && t.dataset.t === 'lens') K('msg').textContent = '虫めがねを、お札の上で動かしてみよう。下のほうに、なにかありそう……。';
  });
  // 自動で少しゆらして、かたむけられることを伝える
  let touched = false; ["pointerdown", "input"].forEach(ev => box.addEventListener(ev, () => { touched = true; }, { once: true }));
  if (!reduce) { let k = 0; const wob = setInterval(() => { k += .25; const v = touched ? 0 : Math.round(Math.sin(k) * 4); note.style.setProperty("--tilt", v); if (touched || k > 6.3) { clearInterval(wob); if (!touched) note.style.setProperty("--tilt", 0); } }, 60); }
})();
