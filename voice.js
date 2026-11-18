/* ================================================================
   voice.js — 案内の声（使うページが、必要になったときだけ読みこむ）
   ・声の素材：効果音ラボ「アプリ・音声案内（落ち着いた女性）」（声：音枝優日）。voice/ に置いたものを使う
     （効果音ラボの利用規約：商用・非商用とも無料、クレジットは任意、素材そのものの再配布と直リンクは禁止）
   ・AZAKEI_VOICE.on() / set(true|false)：声を出すかどうか（localStorage azakei_voice。サイト全体で共通）
   ・AZAKEI_VOICE.say(['nisen', 'sanbyaku', ...])：いくつかの声を、前後の無音を切ってすきまなくつなげて流す（Promise）
   ・AZAKEI_VOICE.dur(['countdown1'])：つないだときの長さ（秒）
   ・AZAKEI_VOICE.chime(up)：案内のチャイム（ファイルを使わず、ブラウザでつくる音）
   ・AZAKEI_VOICE.stop()：いま流れている声を止める
   ・声のファイルは、はじめて流すときに読みこむ（ページの重さには入らない）
   ================================================================ */
(function () {
  if (window.AZAKEI_VOICE) return;
  const VER = '1';
  let ac = null, on = false, gen = 0, live = [], wake = null;
  try { on = localStorage.getItem('azakei_voice') === '1'; } catch (e) {}
  const ctx = () => ac || (ac = new (window.AudioContext || window.webkitAudioContext)());
  // 前後の無音を切る（つないだときに、間がのびないように）
  const trim = buf => {
    const d = buf.getChannelData(0), sr = buf.sampleRate, th = .015;
    let a = 0, z = d.length - 1;
    while (a < z && Math.abs(d[a]) < th) a++;
    while (z > a && Math.abs(d[z]) < th) z--;
    a = Math.max(0, a - (sr * .015 | 0)); z = Math.min(d.length - 1, z + (sr * .05 | 0));
    return { buf, at: a / sr, len: Math.max(.05, (z - a) / sr) };
  };
  const cache = {};
  const load = n => cache[n] || (cache[n] = fetch('voice/' + n + '.mp3?v=' + VER)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(b => new Promise((ok, ng) => ctx().decodeAudioData(b, ok, ng)))
    .then(trim)
    .catch(() => { delete cache[n]; return null; }));
  const stop = () => {
    gen++;
    live.forEach(s => { try { s.stop(); } catch (e) {} }); live = [];
    if (wake) { const w = wake; wake = null; w(); }
  };
  // gap：声と声のあいだ（秒）。数字をつなぐときは 0 に近く、文と文のあいだは長め
  const say = async (names, gap = .02) => {
    if (!on || !names || !names.length) return;
    stop(); const my = gen;
    let c;
    // まだ画面にふれていないと、ブラウザが音を止めていることがある。そのときは待たずに先へ（発表が止まらないように）
    try {
      c = ctx();
      if (c.state === 'suspended') { await Promise.race([c.resume(), new Promise(r => setTimeout(r, 500))]); if (c.state !== 'running') return; }
    } catch (e) { return; }
    const parts = await Promise.all(names.map(load));
    if (my !== gen) return;
    let t = c.currentTime + .04;
    parts.forEach(p => {
      if (!p) return;
      const s = c.createBufferSource(); s.buffer = p.buf; s.connect(c.destination);
      s.start(t, p.at, p.len); live.push(s); t += p.len + gap;
    });
    const ms = Math.max(0, (t - c.currentTime) * 1000);
    return new Promise(res => {
      const tm = setTimeout(() => { if (wake === done) wake = null; res(); }, ms);
      const done = () => { clearTimeout(tm); res(); };
      wake = done;
    });
  };
  const dur = async (names, gap = .02) => {
    const parts = await Promise.all(names.map(load));
    return parts.reduce((a, p) => a + (p ? p.len + gap : 0), 0);
  };
  const chime = (up = true) => {
    if (!on) return Promise.resolve();
    try {
      const c = ctx(); if (c.state === 'suspended') c.resume();
      const t0 = c.currentTime + .03, notes = up ? [698, 880, 1047, 1397] : [1397, 1047, 880, 698];
      notes.forEach((f, j) => {
        const o = c.createOscillator(), g = c.createGain(), at = t0 + j * .32;
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(.16, at + .02); g.gain.exponentialRampToValueAtTime(.0001, at + .9);
        o.connect(g).connect(c.destination); o.start(at); o.stop(at + .95);
      });
    } catch (e) {}
    return new Promise(r => setTimeout(r, 1500));
  };
  const set = v => {
    on = !!v;
    try { localStorage.setItem('azakei_voice', on ? '1' : '0'); } catch (e) {}
    if (!on) stop(); else try { ctx().resume(); } catch (e) {}
    document.dispatchEvent(new CustomEvent('azakei-voice', { detail: on }));
  };
  // ── ナレーション（ブラウザの読み上げ）。いちばん自然な日本語の声をえらび、読みまちがえやすい言葉を直して、1 文ずつ読む
  let ttsName = null, ttsGen = 0;
  try { ttsName = localStorage.getItem('azakei_tts'); } catch (e) {}
  const jaVoices = () => (window.speechSynthesis ? speechSynthesis.getVoices() : []).filter(v => /^ja/i.test(v.lang));
  const rank = v => (/(Natural|Online|Neural)/i.test(v.name) ? 50 : 0) + (/Google/i.test(v.name) ? 30 : 0) + (/(Kyoko|O-Ren|Otoya|Hattori)/i.test(v.name) ? 25 : 0) + (/Nanami/i.test(v.name) ? 10 : 0);
  const pick = () => { const vs = jaVoices(); return vs.find(v => v.name === ttsName) || vs.slice().sort((a, b) => rank(b) - rank(a))[0] || null; };
  if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', () => document.dispatchEvent(new CustomEvent('azakei-voices'))); }
  // 読みまちがえやすい言葉
  const READ = [[/@azakei_vlog/g, 'アットマーク、アザケイ ブイログ'], [/azakeiten\.github\.io/g, 'アザケイテン ドット ギットハブ ドット アイオー'], [/AZAKEI/g, 'アザケイ'], [/麻経/g, 'あざけい'], [/麻布/g, 'あざぶ'], [/Instagram/g, 'インスタグラム'], [/Web/g, 'ウェブ'], [/ホームページ/g, 'ホームページ'], [/(\d),(\d{3})/g, '$1$2'], [/（[^）]*）/g, '']];
  const fix = t => READ.reduce((s, [a, b]) => s.replace(a, b), String(t));
  const split = t => String(t).replace(/\s+/g, ' ').split(/(?<=[。！？])/).map(s => s.trim()).filter(Boolean);
  const ttsStop = () => { ttsGen++; if (window.speechSynthesis) speechSynthesis.cancel(); };
  // o.onPart(文, 何番目, 全部で何文)。終わりの知らせが来ないブラウザのため、長さから見た時間がたったら先へ
  const tts = (text, o = {}) => new Promise(res => {
    if (!window.speechSynthesis) { const parts = split(text); let k = 0; const step = () => { if (k >= parts.length) return res(); if (o.onPart) o.onPart(parts[k], k, parts.length); setTimeout(step, 900 + parts[k++].length * 130); }; return step(); }
    ttsStop(); const my = ttsGen, parts = split(text); let k = 0;
    const next = () => {
      if (my !== ttsGen || k >= parts.length) return res();
      const s = parts[k]; if (o.onPart) o.onPart(s, k, parts.length); k++;
      const u = new SpeechSynthesisUtterance(fix(s)); u.lang = 'ja-JP';
      const v = pick(); if (v) u.voice = v;
      u.rate = o.rate || 1; u.pitch = o.pitch || 1; u.volume = 1;
      let fin = false; const done = () => { if (fin) return; fin = true; clearTimeout(w); setTimeout(next, o.gap == null ? 220 : o.gap); };
      const t0 = Date.now();
      u.onend = done;
      // 声がない・失敗したときも、字幕は読める長さだけ出しておく
      u.onerror = () => setTimeout(done, Math.max(0, 600 + s.length * 120 - (Date.now() - t0)));
      const w = setTimeout(done, 2400 + s.length * 240 / u.rate);
      speechSynthesis.speak(u);
    };
    setTimeout(next, 80);
  });
  const setTTS = name => { ttsName = name; try { localStorage.setItem('azakei_tts', name); } catch (e) {} };

  // ── BGM：ナレーションの下に流す、静かな和音（ファイルを使わず、ブラウザでつくる）
  let bg = null;
  const bgm = want => {
    try {
      const c = ctx();
      if (!want) { if (!bg) return; const b = bg; bg = null; clearInterval(b.iv); b.g.gain.setTargetAtTime(0, c.currentTime, .5); setTimeout(() => b.osc.forEach(x => { try { x.stop(); } catch (e) {} }), 2500); return; }
      if (bg) return;
      if (c.state === 'suspended') c.resume();
      const CH = [[261.6, 329.6, 392, 493.9], [220, 261.6, 329.6, 392], [174.6, 220, 261.6, 349.2], [196, 246.9, 293.7, 392]];
      const g = c.createGain(); g.gain.value = 0;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.connect(g).connect(c.destination);
      const osc = [];
      CH[0].forEach(f => [-5, 5].forEach(det => { const x = c.createOscillator(); x.type = det < 0 ? 'sine' : 'triangle'; x.frequency.value = f; x.detune.value = det; const xg = c.createGain(); xg.gain.value = det < 0 ? 1 : .35; x.connect(xg).connect(lp); x.start(); osc.push(x); }));
      g.gain.setTargetAtTime(.03, c.currentTime, 1.5);
      let k = 0;
      const iv = setInterval(() => { k = (k + 1) % CH.length; osc.forEach((x, n) => x.frequency.setTargetAtTime(CH[k][n >> 1], c.currentTime, .9)); }, 7000);
      bg = { g, osc, iv };
    } catch (e) {}
  };
  window.AZAKEI_VOICE = { on: () => on, set, say, dur, chime, stop, load, tts, ttsStop, jaVoices, pick, setTTS, fix, bgm };
})();
