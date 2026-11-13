/* ================================================================
   billmaker.js — 文化祭：「麻経券」をつくる
   ・会場のオリジナル紙幣にならって、自分だけの遊び券を絵にする
   ・本物のお金に似せない：円の記号・人の顔は使わず、単位は「チップ」、大きく「見本」
   ・名前や言葉は絵に描くだけで、どこにも送らず、残さない
   ================================================================ */
(function() {
  const box = document.querySelector('[data-billmaker]');
  if (!box) return;
  const W = 1200, H = 560;
  const COLORS = { green: ['#1f4a37', '#cfe0cf', '#2f6b4f'], shu: ['#6e2418', '#f1d6c8', '#b5432f'], ai: ['#1d3150', '#d3dbea', '#2d4f80'], kin: ['#5a4214', '#efe2bf', '#a8812f'] };
  const CNAME = { green: '若竹', shu: '朱', ai: '藍', kin: '金茶' };
  const VALS = [1, 5, 10, 50, 100, 1000];
  const MOTIF = { star: '六芒星', wave: '大波', seal: '一字の印' };
  const st = { v: 100, c: 'green', m: 'star', k: '経', name: '', msg: '経済を、自分たちの手に。' };
  const serial = 'AZ' + String(Math.floor(Math.random() * 900000) + 100000) + 'K';

  box.innerHTML = `<div class="bm-grid">
      <div class="bm-view"><canvas width="${W}" height="${H}" role="img" aria-label="つくった麻経券の絵"></canvas>
        <p class="bm-note">「麻経券」は、この遊びのための券です。本物のお金ではなく、お金として使うことはできません。</p></div>
      <div class="bm-form">
        <fieldset><legend>金額</legend><div class="bm-chips" data-k="v">${VALS.map(v => `<button type="button" data-v="${v}" aria-pressed="${v === st.v}">${v.toLocaleString('ja-JP')}</button>`).join('')}</div></fieldset>
        <fieldset><legend>色</legend><div class="bm-chips" data-k="c">${Object.keys(COLORS).map(c => `<button type="button" data-v="${c}" aria-pressed="${c === st.c}" class="bm-sw" style="--sw:${COLORS[c][2]}">${CNAME[c]}</button>`).join('')}</div></fieldset>
        <fieldset><legend>まん中の絵</legend><div class="bm-chips" data-k="m">${Object.keys(MOTIF).map(m => `<button type="button" data-v="${m}" aria-pressed="${m === st.m}">${MOTIF[m]}</button>`).join('')}</div>
          <label class="bm-k" hidden>印の字（1 字）<input type="text" maxlength="1" value="${st.k}" data-f="k" autocomplete="off"></label></fieldset>
        <label>発行する人の名前（ニックネームでも）<input type="text" maxlength="10" placeholder="例：けいざい太郎" data-f="name" autocomplete="off"></label>
        <label>ひとこと<input type="text" maxlength="16" value="${st.msg}" data-f="msg" autocomplete="off"></label>
        <div class="bm-act"><button type="button" class="bm-save">画像を保存する</button><button type="button" class="bm-share" hidden>送る・共有する</button></div>
        <p class="bm-priv">名前とひとことは、この画面の絵に描くだけです。どこにも送らず、残しません。</p>
      </div>
    </div>`;
  const cv = box.querySelector('canvas'), g = cv.getContext('2d');
  const SERIF = '"Shippori Mincho", "Yu Mincho", "Hiragino Mincho ProN", serif';
  const SANS = '"DM Sans", "Hiragino Sans", "BIZ UDPGothic", "Yu Gothic UI", Meiryo, sans-serif';

  const star = (cx, cy, r, col, line) => {
    g.save(); g.translate(cx, cy);
    for (const rot of [0, Math.PI]) {
      g.beginPath();
      for (let i = 0; i < 3; i++) { const a = rot - Math.PI / 2 + i * 2 * Math.PI / 3; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = line; g.lineWidth = 3; g.stroke();
    }
    g.restore();
  };
  const draw = () => {
    const [dark, light, mid] = COLORS[st.c];
    // 地の色と、細い曲線の模様（地紋）
    g.fillStyle = light; g.fillRect(0, 0, W, H);
    g.save(); g.globalAlpha = .22; g.strokeStyle = mid; g.lineWidth = 1;
    for (let k = 0; k < 26; k++) { g.beginPath(); for (let x = 0; x <= W; x += 8) { const y = 40 + k * 19 + Math.sin(x / 46 + k * .7) * 9 + Math.sin(x / 13 + k) * 2; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    g.restore();
    // 外わくと内わく
    g.strokeStyle = dark; g.lineWidth = 14; g.strokeRect(14, 14, W - 28, H - 28);
    g.lineWidth = 2; g.strokeRect(36, 36, W - 72, H - 72);
    g.setLineDash([2, 6]); g.strokeRect(46, 46, W - 92, H - 92); g.setLineDash([]);
    // まん中のメダル
    const cx = W / 2, cy = 262, R = 150;
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.55)'; g.fill();
    g.lineWidth = 4; g.strokeStyle = dark; g.stroke();
    g.beginPath(); g.arc(cx, cy, R - 14, 0, Math.PI * 2); g.lineWidth = 1.5; g.stroke();
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R - 6), cy + Math.sin(a) * (R - 6)); g.lineTo(cx + Math.cos(a) * (R - 12), cy + Math.sin(a) * (R - 12)); g.stroke(); }
    if (st.m === 'star') {
      star(cx, cy, 104, dark, light);
      g.beginPath(); g.arc(cx, cy, 44, 0, Math.PI * 2); g.fillStyle = light; g.fill();
      g.fillStyle = mid; g.font = `800 58px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('経', cx, cy + 3);
    } else if (st.m === 'wave') {
      g.save(); g.beginPath(); g.arc(cx, cy, R - 18, 0, Math.PI * 2); g.clip();
      for (let row = 0; row < 7; row++) for (let col = -1; col < 6; col++) {
        const x = cx - 150 + col * 64 + (row % 2) * 32, y = cy - 120 + row * 34;
        for (let r = 30; r > 4; r -= 8) { g.beginPath(); g.arc(x, y + 30, r, Math.PI, 0); g.strokeStyle = dark; g.lineWidth = 3; g.stroke(); }
      }
      g.restore();
    } else {
      g.save(); g.translate(cx, cy); g.rotate(-.06);
      g.fillStyle = mid; g.fillRect(-82, -82, 164, 164);
      g.strokeStyle = light; g.lineWidth = 4; g.strokeRect(-70, -70, 140, 140);
      g.fillStyle = '#fff'; g.font = `800 112px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText((st.k || '経').slice(0, 1), 0, 6);
      g.restore();
    }
    // 名前と単位（円ではなく「チップ」）
    g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = dark;
    g.font = `800 60px ${SERIF}`; g.fillText('麻 経 券', cx, 458);
    g.font = `700 18px ${SANS}`; g.fillText('AZAKEI  PLAY  NOTE', cx, 486);
    // 左右の金額
    const val = st.v.toLocaleString('ja-JP');
    g.textAlign = 'left'; g.font = `800 ${val.length > 3 ? 104 : 132}px ${SERIF}`; g.fillText(val, 86, 200);
    g.font = `800 34px ${SERIF}`; g.fillText('チップ', 92, 250);
    g.textAlign = 'right'; g.font = `800 ${val.length > 3 ? 72 : 90}px ${SERIF}`; g.fillText(val, W - 86, 470);
    g.font = `800 26px ${SERIF}`; g.fillText('チップ', W - 90, 505);
    // 番号・発行する人・ひとこと
    g.font = `700 24px ${SANS}`; g.textAlign = 'right'; g.fillStyle = '#9a2a1c'; g.fillText(serial, W - 86, 96);
    g.textAlign = 'left'; g.fillText(serial, 86, 470);
    g.fillStyle = dark; g.font = `700 20px ${SANS}`; g.textAlign = 'left';
    g.fillText(st.name ? `発行　${st.name}` : '発行　麻経（AZAKEI）', 86, 300 + 14);
    g.textAlign = 'right'; g.font = `800 22px ${SERIF}`;
    if (st.msg) g.fillText(st.msg, W - 86, 150);
    // 「見本」と、本物ではないことの表示
    g.save(); g.translate(cx + 300, 330); g.rotate(-.18);
    g.strokeStyle = 'rgba(181,67,47,.85)'; g.lineWidth = 5; g.strokeRect(-70, -38, 140, 76);
    g.fillStyle = 'rgba(181,67,47,.85)'; g.font = `800 52px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('見本', 0, 3);
    g.restore();
    g.fillStyle = dark; g.font = `700 14px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillText('この券は本物のお金ではありません　麻経の遊び券　azakeiten.github.io', cx, 510);
  };
  const redraw = () => { if (document.fonts && document.fonts.load) Promise.all([document.fonts.load(`800 64px "Shippori Mincho"`), document.fonts.load(`700 20px "DM Sans"`)]).then(draw, draw); else draw(); };

  box.addEventListener('click', e => {
    const b = e.target.closest('.bm-chips button'); if (!b) return;
    const k = b.parentElement.dataset.k;
    st[k] = k === 'v' ? +b.dataset.v : b.dataset.v;
    b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    box.querySelector('.bm-k').hidden = st.m !== 'seal';
    draw();
  });
  box.addEventListener('input', e => {
    const f = e.target.dataset.f; if (!f) return;
    st[f] = e.target.value.replace(/[<>]/g, '').trim();
    draw();
  });
  const fileName = () => `azakei-note-${st.v}.png`;
  box.querySelector('.bm-save').addEventListener('click', () => {
    cv.toBlob(b => { if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = fileName(); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, 'image/png');
  });
  const sh = box.querySelector('.bm-share');
  if (navigator.canShare && window.File) {
    try { if (navigator.canShare({ files: [new File([''], 'a.png', { type: 'image/png' })] })) sh.hidden = false; } catch (e) {}
  }
  sh.addEventListener('click', () => cv.toBlob(b => { if (!b) return; navigator.share({ files: [new File([b], fileName(), { type: 'image/png' })], title: '麻経券をつくりました' }).catch(() => {}); }, 'image/png'));
  // 近づいてから描く（書体を待つため）
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); redraw(); } }, { rootMargin: '400px' }); io.observe(box); draw(); } else redraw();
})();
