/* ================================================================
   shiri.js — 用語辞典：「経済しりとり」
   ・辞典の言葉だけで、コンピューターとしりとり。読みの最後の字から始まる言葉を、15 秒以内に選ぶ
   ・「ん」で終わる言葉を選んだら負け。濁点・半濁点（が→か）と小さい字（ゃ→や）、のばす音（ー）は気にしない
   ・自己ベスト（何語つなげたか）は、このブラウザの中だけ
   ================================================================ */
(function() {
  const box = document.querySelector('[data-shiri]');
  if (!box) return;
  const Y = window.AZAKEI_YOMI || {};
  const HIRA = /^[ぁ-ゖー]+$/;
  // 見出しの中のかな（カタカナはひらがなにして）が、読みの中に順番どおり全部あるか（読みが言葉の一部だけ、を外す）
  const fits = w => {
    const kana = [...w.t].filter(c => /[ぁ-ゖァ-ヶー]/.test(c)).map(c => /[ァ-ヶ]/.test(c) ? String.fromCharCode(c.charCodeAt(0) - 0x60) : c);
    let i = 0;
    for (const c of w.y) if (c === kana[i]) i++;
    return i === kana.length;
  };
  // 言葉ごとの読み：見出しにかっこや英字があるものは使わない（読みとのずれを避ける）
  const W = [...document.querySelectorAll('.gl-group .gl-item')].map(el => {
    const t = el.querySelector('dt').textContent.trim();
    const y = ((Y[el.id] || el.dataset.yomi || '').split(/\s+/)[0] || '').trim();
    return { id: el.id, t, y };
  }).filter(w => w.y && HIRA.test(w.y) && !/[（(A-Za-zＡ-Ｚ0-9０-９『』・]/.test(w.t) && w.y.length >= 2 && fits(w));
  const SMALL = { 'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お', 'っ': 'つ', 'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'ゎ': 'わ' };
  const base = c => (SMALL[c] || c).normalize('NFD').replace(/[゙゚]/g, '').normalize('NFC');
  const head = w => base(w.y[0]);
  const tail = w => { const s = w.y.replace(/ー+$/, ''); return base(s[s.length - 1]); };
  const endsN = w => tail(w) === 'ん';
  const BK = 'azakei_shiri_best';
  let best = 0; try { best = +localStorage.getItem(BK) || 0; } catch (e) {}
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TIME = 15;
  const canFollow = w => W.some(x => x !== w && !(used && used.has(x.id)) && head(x) === tail(w) && !endsN(x));
  let used, chain, need, timer, left, lock;

  const intro = () => {
    clearInterval(timer);
    box.innerHTML = `<div class="sh-intro"><p class="sh-rule">辞典の ${W.length} 語だけで、コンピューターとしりとり。<br>読みの最後の字から始まる言葉を、<b>${TIME} 秒</b>以内に選んでください。「ん」で終わる言葉を選ぶと負けです。</p>
      ${best ? `<p class="sh-best">これまでの最高 <b>${best}</b> 語</p>` : ''}<button type="button" class="sh-start">はじめる</button></div>`;
  };
  const trail = () => `<ol class="sh-trail">${chain.slice(-6).map(c => `<li class="${c.me ? 'is-me' : ''}"><b>${esc(c.w.t)}</b><small>${c.w.y}</small></li>`).join('')}</ol>`;
  const options = () => {
    const ok = shuffle(W.filter(w => !used.has(w.id) && head(w) === need && !endsN(w)));
    const trap = shuffle(W.filter(w => !used.has(w.id) && head(w) === need && endsN(w)));
    const other = shuffle(W.filter(w => !used.has(w.id) && head(w) !== need));
    const pick = ok.slice(0, Math.min(ok.length, 1 + (Math.random() * 2 | 0)));
    const t = trap.slice(0, 1);
    return shuffle(pick.concat(t, other.slice(0, 6 - pick.length - t.length)));
  };
  const turn = () => {
    lock = false;
    const opts = options();
    if (!opts.some(w => head(w) === need && !endsN(w))) { end('none'); return; }
    box.innerHTML = `${trail()}
      <div class="sh-top"><p class="sh-need"><span>つぎは</span><b>${need}</b><span>から</span></p>
        <div class="sh-time" aria-hidden="true"><i></i></div><p class="sh-score">つないだ <b>${chain.filter(c => c.me).length}</b> 語</p></div>
      <div class="sh-opts">${opts.map(w => `<button type="button" data-id="${w.id}"><b>${esc(w.t)}</b><small>${w.y}</small></button>`).join('')}</div>
      <p class="sh-msg" aria-live="polite"></p>`;
    box._opts = opts;
    left = TIME;
    const bar = box.querySelector('.sh-time i');
    bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; void bar.offsetWidth;
    bar.style.transition = `transform ${TIME}s linear`; bar.style.transform = 'scaleX(0)';
    clearInterval(timer);
    timer = setInterval(() => { left--; if (left <= 0) { clearInterval(timer); end('time'); } }, 1000);
  };
  const cpu = () => {
    const all = shuffle(W.filter(w => !used.has(w.id) && head(w) === need && !endsN(w)));
    // あなたが続けられる言葉を、なるべく選ぶ（行き止まりにしない）
    const c = all.filter(canFollow).concat(all.filter(w => !canFollow(w)));
    if (!c.length) { end('cpu'); return; }
    const w = c[0]; used.add(w.id); chain.push({ w, me: false }); need = tail(w);
    turn();
  };
  const end = why => {
    clearInterval(timer); lock = true;
    const n = chain.filter(c => c.me).length;
    const nb = n > best; if (nb) { best = n; try { localStorage.setItem(BK, best); } catch (e) {} }
    const MSG = { time: '時間切れ。', n: '「ん」で終わってしまいました。', wrong: `「${need}」から始まる言葉ではありませんでした。`, cpu: 'コンピューターが、続く言葉を見つけられませんでした。あなたの勝ち。', none: `辞典に、「${need}」から始まる言葉が、もう残っていません。引き分けです。` };
    box.innerHTML = `${trail()}<div class="sh-end"><p class="sh-seal" aria-hidden="true">${why === 'cpu' ? '勝' : '終'}</p>
      <p class="sh-why">${MSG[why] || ''}</p><p class="sh-res"><b>${n}</b> 語つなげました${nb && n ? '<em>最高記録</em>' : ''}</p>
      <div class="sh-btns"><button type="button" class="sh-start">もう一度</button>${box._last ? `<a href="#${box._last}">最後の言葉を辞典で見る</a>` : ''}</div></div>`;
  };
  box.addEventListener('click', e => {
    if (e.target.closest('.sh-start')) {
      used = new Set(); chain = [];
      const first = shuffle(W.filter(w => !endsN(w) && canFollow(w)))[0];
      used.add(first.id); chain.push({ w: first, me: false }); need = tail(first); box._last = first.id;
      turn(); return;
    }
    const b = e.target.closest('.sh-opts button'); if (!b || lock) return;
    lock = true; clearInterval(timer);
    const w = box._opts.find(x => x.id === b.dataset.id);
    box._last = w.id;
    if (head(w) !== need) { b.classList.add('is-ng'); setTimeout(() => end('wrong'), 700); return; }
    used.add(w.id); chain.push({ w, me: true });
    if (endsN(w)) { b.classList.add('is-ng'); setTimeout(() => end('n'), 700); return; }
    b.classList.add('is-ok');
    need = tail(w);
    box.querySelector('.sh-msg').textContent = `つぎは コンピューターの番。「${need}」から……`;
    setTimeout(cpu, 900);
  });
  intro();
})();
