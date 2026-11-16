/* ================================================================
   kisekae.js — AZAKEI のページ：お札マン（仮）の着せかえ
   ・帽子・かお・手に持つもの・背景・ふきだしを選んで、自分だけのお札マンに
   ・「おまかせ」で、くるくる変わってから 1 つに決まる
   ・「画像で保存」で PNG にできる（背景「なし」なら、すきとおったシールのような画像）
   ・選んだものは、このブラウザの中にだけ残す（どこにも送らない）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-kisekae]');
  if (!box || box.dataset.ready || !window.AZAKEI_OSATSU_SVG) return;
  box.dataset.ready = '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'azakei_kisekae';
  const INK = '#2a2015', BR = '#6b4a22', SHU = '#b5432f', GOLD = '#e3b341';
  // お札マンの体（もとの絵）。目と口は、かおの選びで入れかえる
  const BASE = AZAKEI_OSATSU_SVG.replace(/^\s*<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const EYES = /<g class="os-eyes"[^>]*>.*?<\/g>/s, MOUTH = /<path d="M57 58 Q63 64 69 58"[^>]*\/>/;
  const eye = (x, ry = 4.2) => `<ellipse cx="${x}" cy="50" rx="3.6" ry="${ry}" fill="${INK}"/>`;
  const line = (d, w = 2.4) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/>`;
  const MOUTH0 = line('M57 58 Q63 64 69 58');
  // [名前, 中身]
  const PARTS = {
    hat: ['帽子', [
      ['なし', ''],
      ['王冠', `<path d="M36 30 L37 7 L49 19 L60 2 L71 19 L83 7 L84 30 Z" fill="${GOLD}" stroke="${BR}" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="22" r="3.5" fill="${SHU}"/><circle cx="45" cy="25" r="2.4" fill="#2f6b3a"/><circle cx="75" cy="25" r="2.4" fill="#2f6b3a"/>`],
      ['学生帽', `<path d="M32 30 Q32 8 60 8 Q88 8 88 30 Z" fill="#1d2330"/><path d="M28 30 Q60 24 92 30 L92 33 Q60 27 28 33 Z" fill="#11151d"/><path d="M30 31 Q46 40 70 31" fill="#11151d"/><circle cx="60" cy="18" r="4" fill="${GOLD}"/>`],
      ['はちまき', `<rect x="18" y="31" width="84" height="9" fill="#fffaf0" stroke="${SHU}" stroke-width="1.4"/><circle cx="60" cy="35.5" r="3.4" fill="${SHU}"/><path d="M101 34 Q110 26 118 24 M101 37 Q110 42 117 47" stroke="#fffaf0" stroke-width="4.5" fill="none" stroke-linecap="round"/>`],
      ['シルクハット', `<rect x="41" y="-4" width="38" height="30" rx="2" fill="${INK}"/><rect x="41" y="17" width="38" height="5" fill="${SHU}"/><rect x="31" y="24" width="58" height="7" rx="3.5" fill="${INK}"/>`],
      ['ベレー帽', `<ellipse cx="55" cy="26" rx="30" ry="9" fill="${SHU}"/><path d="M27 28 Q55 36 84 28" fill="none" stroke="#8a2f20" stroke-width="2"/><circle cx="55" cy="16" r="3" fill="${SHU}"/>`],
      ['花かざり', `<g transform="translate(86 28)">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="5" ry="8" transform="rotate(${a}) translate(0 -7)" fill="#f0a3b4"/>`).join('')}<circle r="4.5" fill="${GOLD}"/></g><g transform="translate(73 24) scale(.6)">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="5" ry="8" transform="rotate(${a}) translate(0 -7)" fill="#fffaf0"/>`).join('')}<circle r="4.5" fill="${GOLD}"/></g>`]
    ]],
    face: ['かお', [
      ['いつもの', null],
      ['にっこり', line('M50 51 Q54 45 58 51') + line('M68 51 Q72 45 76 51') + `<path d="M56 57 Q63 68 70 57 Z" fill="${SHU}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`],
      ['びっくり', eye(54, 5.6) + eye(72, 5.6) + `<circle cx="55.2" cy="48" r="1.4" fill="#fff"/><circle cx="73.2" cy="48" r="1.4" fill="#fff"/><ellipse cx="63" cy="62" rx="3.4" ry="4.4" fill="${INK}"/>`],
      ['ウインク', eye(54) + line('M68 50 Q72 54 76 50') + MOUTH0],
      ['きりっ', line('M48 42 L58 45') + line('M78 42 L68 45') + eye(54) + eye(72) + line('M58 60 H68')],
      ['めがね', eye(54) + eye(72) + MOUTH0 + `<g fill="rgba(255,255,255,.25)" stroke="${INK}" stroke-width="2"><circle cx="54" cy="50" r="7.5"/><circle cx="72" cy="50" r="7.5"/></g>` + line('M61.5 50 H64.5', 2)]
    ]],
    hold: ['手に持つもの', [
      ['なし', ''],
      ['旗', `<path d="M112 38 L112 -2" stroke="${BR}" stroke-width="2.6" stroke-linecap="round"/><path class="ki-wave" d="M112 0 Q124 -4 140 4 Q128 8 112 16 Z" fill="${SHU}"/><text x="120" y="10.5" font-size="7" font-weight="800" fill="#fff" text-anchor="middle" font-family="serif">経</text>`],
      ['虫めがね', `<path d="M112 36 L119 27" stroke="${BR}" stroke-width="4.5" stroke-linecap="round"/><circle cx="126" cy="19" r="10" fill="rgba(190,225,255,.55)" stroke="${BR}" stroke-width="3"/><path d="M121 15 Q124 12 128 13" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`],
      ['コイン', `<circle cx="120" cy="26" r="11" fill="${GOLD}" stroke="#a77b1d" stroke-width="2.4"/><circle cx="120" cy="26" r="7.5" fill="none" stroke="#a77b1d" stroke-width="1"/><text x="120" y="30" font-size="10" font-weight="800" fill="#7a5512" text-anchor="middle" font-family="serif">円</text>`],
      ['グラフの札', `<path d="M112 38 L112 12" stroke="${BR}" stroke-width="2.6" stroke-linecap="round"/><rect x="94" y="-16" width="40" height="28" rx="3" fill="#fffaf0" stroke="${BR}" stroke-width="2"/><path d="M99 6 L108 -1 L115 3 L128 -10" fill="none" stroke="#2f6b3a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M122 -11 L129 -11 L128 -4" fill="none" stroke="#2f6b3a" stroke-width="2.4" stroke-linecap="round"/>`],
      ['そろばん', `<g transform="translate(-16 54)"><rect width="30" height="18" rx="2" fill="#8a5a2b" stroke="${BR}" stroke-width="1.6"/><rect x="2.5" y="2.5" width="25" height="13" fill="#f3e3c3"/><path d="M2.5 7 H27.5" stroke="${BR}" stroke-width="1.2"/>${[6, 11, 16, 21, 26].map(x => `<path d="M${x - 1} 2.5 V15.5" stroke="${BR}" stroke-width=".6"/><ellipse cx="${x - 1}" cy="5" rx="2.2" ry="1.4" fill="${INK}"/><ellipse cx="${x - 1}" cy="${10 + (x % 3)}" rx="2.2" ry="1.4" fill="${INK}"/>`).join('')}</g>`]
    ]],
    bg: ['背景', [
      ['なし', ''],
      ['和紙', `<rect x="-30" y="-36" width="180" height="160" fill="#f6efe0"/>${Array.from({ length: 26 }, (_, k) => `<path d="M${(k * 37) % 180 - 30} ${(k * 53) % 160 - 36} q6 2 10 -1" stroke="#e2d4b6" stroke-width="1.2" fill="none"/>`).join('')}`],
      ['紅白の幕', `<rect x="-30" y="-36" width="180" height="160" fill="#fffaf0"/>${Array.from({ length: 9 }, (_, k) => `<rect x="${-30 + k * 20}" y="-36" width="10" height="160" fill="#c8402c"/>`).join('')}<rect x="-30" y="-36" width="180" height="12" fill="#1d2330"/>`],
      ['夜空', `<rect x="-30" y="-36" width="180" height="160" fill="#1d2240"/>${Array.from({ length: 22 }, (_, k) => `<circle cx="${(k * 47) % 180 - 30}" cy="${(k * 29) % 90 - 34}" r="${k % 3 ? .9 : 1.6}" fill="#fff7d6"/>`).join('')}<circle cx="-6" cy="-12" r="11" fill="#fff1b8"/><circle cx="-1" cy="-15" r="10" fill="#1d2240"/>`],
      ['株のチャート', `<rect x="-30" y="-36" width="180" height="160" fill="#eef6ef"/>${Array.from({ length: 9 }, (_, k) => `<path d="M${-30 + k * 20} -36 V124 M-30 ${-36 + k * 20} H150" stroke="#cfe3d2" stroke-width="1"/>`).join('')}<path d="M-30 110 L0 92 L20 98 L48 70 L70 80 L100 46 L118 56 L150 18" fill="none" stroke="#2f6b3a" stroke-width="3" stroke-linejoin="round"/>`],
      ['たたみ', `<rect x="-30" y="-36" width="180" height="160" fill="#c9c27a"/>${Array.from({ length: 40 }, (_, k) => `<path d="M-30 ${-36 + k * 4} H150" stroke="#b8b066" stroke-width="1"/>`).join('')}<rect x="-30" y="56" width="180" height="7" fill="#3e5a3a"/>`]
    ]]
  };
  const ORDER = ['hat', 'face', 'hold', 'bg'];
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  let st = { hat: 0, face: 0, hold: 0, bg: 1, say: '' };
  try { st = Object.assign(st, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  ORDER.forEach(k => { if (!(st[k] >= 0 && st[k] < PARTS[k][1].length)) st[k] = 0; });
  // 選んだものを、1 枚の絵（SVG の文字）にまとめる。画面にも、保存する画像にも同じものを使う
  const art = (forFile) => {
    const p = k => PARTS[k][1][st[k]][1];
    let body = BASE;
    const f = p('face');
    if (f !== null) body = body.replace(EYES, '').replace(MOUTH, '') + f;
    const say = (st.say || '').trim();
    const w = Math.min(150, 14 + say.length * 9.5);
    const bubble = say ? `<g class="ki-say"><rect x="${-24}" y="-30" width="${w}" height="20" rx="10" fill="#fff" stroke="${INK}" stroke-width="1.6"/><path d="M8 -10.8 L14 -3 L18 -10.8" fill="#fff" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 -11.6 H17.4" stroke="#fff" stroke-width="2.4"/><text x="${-24 + w / 2}" y="-16" font-size="10" font-weight="700" fill="${INK}" text-anchor="middle" font-family="sans-serif">${esc(say)}</text></g>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -36 180 160"${forFile ? ' width="900" height="800"' : ' class="ki-art" role="img" aria-label="着せかえたお札マン"'}>
      <g class="ki-l-bg">${p('bg')}</g>
      <ellipse cx="60" cy="100" rx="34" ry="5" fill="rgba(0,0,0,.14)"/>
      <g class="ki-body${st.hold ? ' ki-holding' : ''}">${body}<g class="ki-l-hold">${p('hold')}</g><g class="ki-l-hat">${p('hat')}</g></g>
      ${bubble}
    </svg>`;
  };
  box.innerHTML = `<div class="ki-wrap">
    <div class="ki-stage"><div class="ki-frame">${art()}</div><div class="ki-flash" aria-hidden="true"></div><p class="ki-cap" aria-live="polite"></p></div>
    <div class="ki-panel">
      <div class="ki-tabs" role="tablist">${ORDER.map((k, j) => `<button type="button" role="tab" class="ki-tab${j ? '' : ' is-on'}" data-tab="${k}" aria-selected="${!j}">${PARTS[k][0]}</button>`).join('')}<button type="button" role="tab" class="ki-tab" data-tab="say" aria-selected="false">ふきだし</button></div>
      ${ORDER.map((k, j) => `<div class="ki-opts" data-pane="${k}"${j ? ' hidden' : ''}>${PARTS[k][1].map(([n], i) => `<button type="button" class="ki-opt${st[k] === i ? ' is-on' : ''}" data-k="${k}" data-i="${i}" aria-pressed="${st[k] === i}"><span class="ki-th">${thumb(k, i)}</span>${n}</button>`).join('')}</div>`).join('')}
      <div class="ki-opts ki-sayp" data-pane="say" hidden><label>ふきだしの言葉（12 文字まで）<input type="text" maxlength="12" value="${esc(st.say)}" placeholder="例：経済っておもしろい" data-say></label><div class="ki-chips">${['よろしくね', 'てっぺんをとる', '文化祭に来てね', '経済っておもしろい', '1 円を大切に'].map(t => `<button type="button" data-chip="${t}">${t}</button>`).join('')}</div></div>
      <div class="ki-btns"><button type="button" class="ki-rand">おまかせ</button><button type="button" class="ki-save">画像で保存</button><button type="button" class="ki-reset">もとにもどす</button></div>
      <p class="ki-note">選んだものは、このブラウザの中にだけ残ります。保存した画像は、背景「なし」だと、まわりがすきとおったシールのような画像になります。</p>
    </div>
  </div>`;
  // 選びの小さな見本（帽子・持ちもの・背景は、その部分だけ。かおは顔だけ）
  function thumb(k, i) {
    const v = PARTS[k][1][i][1];
    if (k === 'bg') return `<svg viewBox="-30 -36 180 160" aria-hidden="true">${v || '<rect x="-30" y="-36" width="180" height="160" fill="none" stroke="#c9b48a" stroke-dasharray="8 6" stroke-width="4"/>'}</svg>`;
    if (k === 'face') return `<svg viewBox="40 36 46 32" aria-hidden="true"><rect x="40" y="36" width="46" height="32" fill="#e6d5b3"/>${v === null ? eye(54) + eye(72) + MOUTH0 : v}</svg>`;
    const vb = k === 'hat' ? '22 -8 100 50' : i === 5 ? '-20 46 38 34' : i ? '86 -20 58 60' : '-20 -20 165 100';
    return `<svg viewBox="${vb}" aria-hidden="true">${v || `<path d="M50 10 L90 30 M90 10 L50 30" stroke="#c9b48a" stroke-width="3" transform="${k === 'hat' ? '' : 'translate(10 10)'}"/>`}</svg>`;
  }
  const frame = box.querySelector('.ki-frame'), cap = box.querySelector('.ki-cap');
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  const caption = () => { cap.textContent = ORDER.map(k => PARTS[k][1][st[k]][0]).filter((n, j) => !(n === 'なし' || (j === 1 && n === 'いつもの'))).join('・') || 'いつものお札マン'; };
  const draw = (changed) => {
    frame.innerHTML = art();
    if (changed && !reduce) { const l = frame.querySelector(`.ki-l-${changed}`) || frame.querySelector('.ki-body'); l.classList.add('is-drop'); frame.querySelector('.ki-body').classList.add('is-hop'); }
    box.querySelectorAll('.ki-opt').forEach(b => { const on = st[b.dataset.k] === +b.dataset.i; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    caption(); save();
  };
  box.addEventListener('click', e => {
    const tab = e.target.closest('.ki-tab');
    if (tab) {
      box.querySelectorAll('.ki-tab').forEach(t => { const on = t === tab; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); });
      box.querySelectorAll('.ki-opts').forEach(p => { p.hidden = p.dataset.pane !== tab.dataset.tab; });
      return;
    }
    const o = e.target.closest('.ki-opt');
    if (o) { st[o.dataset.k] = +o.dataset.i; draw(o.dataset.k === 'face' ? null : o.dataset.k); if (o.dataset.k === 'face') { const b = frame.querySelector('.ki-body'); if (!reduce) b.classList.add('is-hop'); } return; }
    const chip = e.target.closest('[data-chip]');
    if (chip) { st.say = chip.dataset.chip; box.querySelector('[data-say]').value = st.say; draw(); return; }
    if (e.target.closest('.ki-rand')) { roll(); return; }
    if (e.target.closest('.ki-save')) { download(); return; }
    if (e.target.closest('.ki-reset')) { st = { hat: 0, face: 0, hold: 0, bg: 1, say: '' }; box.querySelector('[data-say]').value = ''; draw('body'); }
  });
  box.addEventListener('input', e => { if (e.target.matches('[data-say]')) { st.say = e.target.value.slice(0, 12); draw(); } });
  // おまかせ：くるくる変わってから、だんだんゆっくりになって止まる
  const roll = () => {
    const btn = box.querySelector('.ki-rand'); if (btn.disabled) return;
    const pick = () => ORDER.forEach(k => { st[k] = Math.random() * PARTS[k][1].length | 0; });
    if (reduce) { pick(); draw('body'); return; }
    btn.disabled = true; box.classList.add('is-rolling');
    let n = 0; const steps = 11;
    const go = () => { pick(); draw(); n++; if (n < steps) setTimeout(go, 50 + n * n * 3.5); else { btn.disabled = false; box.classList.remove('is-rolling'); draw('body'); } };
    go();
  };
  // 画像で保存：同じ絵を、大きな PNG にして渡す
  const download = () => {
    const fl = box.querySelector('.ki-flash'); fl.classList.remove('is-go'); void fl.offsetWidth; fl.classList.add('is-go');
    const url = URL.createObjectURL(new Blob([art(true)], { type: 'image/svg+xml' }));
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = 900; c.height = 800;
      c.getContext('2d').drawImage(img, 0, 0, 900, 800); URL.revokeObjectURL(url);
      c.toBlob(b => {
        if (!b) return;
        const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'osatsuman.png';
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        cap.textContent = '画像を保存しました（osatsuman.png）';
      }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); cap.textContent = 'このブラウザでは保存できませんでした。画面を長押しして保存してください。'; };
    img.src = url;
  };
  caption();
})();
