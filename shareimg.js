/* ================================================================
   shareimg.js — 結果を「縦長の画像」にして保存・シェア（インスタのストーリー向け 1080×1920）
   使い方: AZAKEI_SHARE_IMG({ kicker, art, big, bigUnit, title, subtitle, lines, cta, url, filename, text })
     スマホ：共有メニュー（インスタ・LINE など）を開く ／ パソコン：PNG を保存
   ================================================================ */
(function() {
  const W = 1080, H = 1920;
  const GOLD = '#d9bb7e', GOLD2 = '#f3e3bd', INK = '#121519', WHITE = '#f6f3ea';

  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const svgUrl = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s.includes('xmlns=') ? s : s.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));

  // サイトのロゴマーク（昼の色）を、単体の SVG として取り出す
  function logoSvg() {
    const tmp = document.createElement('div');
    tmp.style.cssText = 'position:absolute;left:-9999px;top:0';
    tmp.innerHTML = '<span data-logomark></span>';
    document.body.appendChild(tmp);
    if (window.AZAKEI_RENDER_MARKS) window.AZAKEI_RENDER_MARKS(tmp);
    const svg = tmp.querySelector('svg');
    let s = '';
    if (svg) {
      svg.querySelectorAll('.lm-night, .lm-sparks').forEach(g => g.remove());
      svg.querySelectorAll('text').forEach(t => t.setAttribute('fill', '#241a10'));
      svg.setAttribute('width', '240'); svg.setAttribute('height', '240');
      s = svg.outerHTML;
    }
    tmp.remove();
    return s;
  }

  // 日本語も折り返せるように、1 文字ずつ幅を測って行を作る
  function wrap(ctx, text, maxW) {
    const out = []; let line = '';
    for (const ch of [...text]) {
      if (ch === '\n') { out.push(line); line = ''; continue; }
      const t = line + ch;
      if (ctx.measureText(t).width > maxW && line) {
        // 句読点は行頭に来ないように前の行へ
        if ('、。，．！？）」』'.includes(ch)) { out.push(t); line = ''; continue; }
        out.push(line); line = ch;
      } else line = t;
    }
    if (line) out.push(line);
    return out;
  }

  async function make(o) {
    try {
      await Promise.all([
        document.fonts.load('800 80px "Shippori Mincho"'), document.fonts.load('500 40px "Shippori Mincho"'),
        document.fonts.load('italic 400 40px "Cormorant Garamond"'), document.fonts.load('400 40px "Cormorant Garamond"'),
        document.fonts.load('500 32px "Zen Kaku Gothic New"')
      ]);
    } catch (e) {}
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');

    // 背景：墨色＋やわらかな光
    g.fillStyle = INK; g.fillRect(0, 0, W, H);
    let rg = g.createRadialGradient(W * 0.5, H * 0.36, 40, W * 0.5, H * 0.36, 900);
    rg.addColorStop(0, 'rgba(217,187,126,0.20)'); rg.addColorStop(1, 'rgba(217,187,126,0)');
    g.fillStyle = rg; g.fillRect(0, 0, W, H);

    // 下のほうに「麻経の大波」
    const wave = await loadImg(svgUrl(`<svg width="96" height="48" viewBox="0 0 48 24"><g fill="none" stroke="#d9bb7e" stroke-width="0.8"><path d="M0 24a24 24 0 0 1 48 0M6 24a18 18 0 0 1 36 0M12 24a12 12 0 0 1 24 0M18 24a6 6 0 0 1 12 0"/><path d="M-24 12a24 24 0 0 1 48 0M-18 12a18 18 0 0 1 36 0M-12 12a12 12 0 0 1 24 0M-6 12a6 6 0 0 1 12 0M24 12a24 24 0 0 1 48 0M30 12a18 18 0 0 1 36 0M36 12a12 12 0 0 1 24 0M42 12a6 6 0 0 1 12 0"/></g></svg>`)).catch(() => null);
    if (wave) {
      // 柄を別の画用紙に描き、上に向かってすうっと消えるようにしてから重ねる
      const off = document.createElement('canvas'); off.width = W; off.height = 560;
      const o2 = off.getContext('2d');
      o2.fillStyle = o2.createPattern(wave, 'repeat'); o2.fillRect(0, 0, W, 560);
      o2.globalCompositeOperation = 'destination-in';
      const fade = o2.createLinearGradient(0, 0, 0, 560); fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(0.6, 'rgba(0,0,0,1)');
      o2.fillStyle = fade; o2.fillRect(0, 0, W, 560);
      g.save(); g.globalAlpha = 0.18; g.drawImage(off, 0, H - 560); g.restore();
    }

    // 金の細い枠
    g.strokeStyle = 'rgba(217,187,126,0.45)'; g.lineWidth = 2; g.strokeRect(44, 44, W - 88, H - 88);

    // ロゴとサイト名
    const lg = logoSvg();
    if (lg) { const li = await loadImg(svgUrl(lg)).catch(() => null); if (li) g.drawImage(li, W / 2 - 60, 110, 120, 120); }
    g.textAlign = 'center'; g.fillStyle = WHITE;
    g.font = '400 46px "Cormorant Garamond", serif'; g.letterSpacing = '14px';
    g.fillText('AZAKEI', W / 2 + 7, 290);
    g.letterSpacing = '6px'; g.fillStyle = GOLD; g.font = '500 26px "Shippori Mincho", serif';
    g.fillText('麻経 · Azabu Economics', W / 2 + 3, 336);
    g.letterSpacing = '0px';

    let y = 450;
    // 見出し（小さな金の文字）
    if (o.kicker) { g.fillStyle = GOLD; g.font = '500 30px "Zen Kaku Gothic New", sans-serif'; g.letterSpacing = '8px'; g.fillText(o.kicker, W / 2 + 4, y); g.letterSpacing = '0px'; y += 50; }

    // 絵（診断の動物）または大きな数字（クイズ）
    if (o.art) {
      const ai = await loadImg(svgUrl(o.art.replace('<svg ', '<svg width="480" height="480" '))).catch(() => null);
      const disc = g.createRadialGradient(W / 2, y + 260, 20, W / 2, y + 260, 300);
      disc.addColorStop(0, 'rgba(246,243,234,0.16)'); disc.addColorStop(1, 'rgba(246,243,234,0)');
      g.fillStyle = disc; g.fillRect(W / 2 - 320, y - 60, 640, 640);
      if (ai) g.drawImage(ai, W / 2 - 240, y + 20, 480, 480);
      y += 580;
    } else if (o.big != null) {
      // 数字はふつうの形（Cormorant の数字は下にはみ出すので明朝で）
      y = Math.max(y, 560);
      const s = String(o.big);
      g.font = '500 230px "Shippori Mincho", serif';
      const bw = g.measureText(s).width;
      g.font = '500 64px "Shippori Mincho", serif';
      const uw = o.bigUnit ? g.measureText(o.bigUnit).width + 18 : 0;
      const x0 = W / 2 - (bw + uw) / 2;
      const base = y + 230;
      g.textAlign = 'left';
      g.fillStyle = GOLD2; g.font = '500 230px "Shippori Mincho", serif'; g.fillText(s, x0, base);
      if (o.bigUnit) { g.fillStyle = WHITE; g.font = '500 64px "Shippori Mincho", serif'; g.fillText(o.bigUnit, x0 + bw + 18, base); }
      g.textAlign = 'center';
      // 数字の下に金の細い線
      g.strokeStyle = 'rgba(217,187,126,0.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - 90, base + 60); g.lineTo(W / 2 + 90, base + 60); g.stroke();
      y = base + 170;
    }

    // タイトル
    if (o.title) {
      g.fillStyle = WHITE; g.font = '800 84px "Shippori Mincho", serif';
      wrap(g, o.title, W - 200).forEach(l => { g.fillText(l, W / 2, y); y += 104; });
    }
    if (o.subtitle) { g.fillStyle = GOLD; g.font = 'italic 400 44px "Cormorant Garamond", serif'; g.fillText(o.subtitle, W / 2, y + 6); y += 80; }

    // 説明の行
    if (o.lines && o.lines.length) {
      y += 20; g.fillStyle = 'rgba(246,243,234,0.78)'; g.font = '500 34px "Zen Kaku Gothic New", sans-serif';
      o.lines.forEach(t => wrap(g, t, W - 240).forEach(l => { if (y < H - 400) { g.fillText(l, W / 2, y); y += 56; } }));
    }

    // 下：呼びかけ・URL・印
    g.fillStyle = GOLD2; g.font = '500 40px "Shippori Mincho", serif';
    g.fillText(o.cta || 'あなたも挑戦してみて', W / 2, H - 250);
    g.fillStyle = 'rgba(246,243,234,0.85)'; g.font = '400 40px "Cormorant Garamond", serif'; g.letterSpacing = '2px';
    g.fillText(o.url || 'azakeiten.github.io', W / 2, H - 186); g.letterSpacing = '0px';
    // 印「麻経」
    g.save(); g.translate(W - 150, H - 200); g.rotate(-0.06);
    const sg = g.createLinearGradient(-40, -70, 40, 70); sg.addColorStop(0, '#c8a96e'); sg.addColorStop(1, '#7d6131');
    g.fillStyle = sg; roundRect(g, -38, -78, 76, 156, 14); g.fill();
    g.fillStyle = '#fff6e2'; g.font = '800 46px "Shippori Mincho", serif'; g.textAlign = 'center';
    g.fillText('麻', 0, -14); g.fillText('経', 0, 46);
    g.restore();

    return new Promise(res => c.toBlob(res, 'image/png'));
  }

  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  window.AZAKEI_SHARE_IMG = async function(o) {
    const blob = await make(o);
    const name = (o.filename || 'azakei') + '.png';
    const file = new File([blob], name, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
      try { await navigator.share({ files: [file], text: o.text || '' }); return 'shared'; }
      catch (e) { if (e && e.name === 'AbortError') return 'cancel'; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return 'saved';
  };
  window.AZAKEI_SHARE_IMG_BLOB = make;   // 確認用
})();
