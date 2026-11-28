/* ================================================================
   voice.js — 案内の声（使うページが、必要になったときだけ読みこむ）
   ・声の素材：AivisSpeech でつくった mp3（AivisSpeech: みちのくあいり＝案内・ナレーション、AivisSpeech: らせつん（喜び）＝お札マン。2026.11.24 までは VOICEVOX）
     voice/＊.mp3＝案内のことば（名前で呼ぶ）、voice/vv/＊.mp3＝1 文ごとの声（m-＝お札マン、n-＝ナレーション。名前は文の FNV-1a）
     つくり方は tools/voicevox/README.txt。クレジットは policy.html#voice-credit
   ・AZAKEI_VOICE.on() / set(true|false)：声を出すかどうか（localStorage azakei_voice。サイト全体で共通）
   ・AZAKEI_VOICE.say(['nisen', 'sanbyaku', ...])：いくつかの声を、前後の無音を切ってすきまなくつなげて流す（Promise）
   ・AZAKEI_VOICE.dur(['countdown1'])：つないだときの長さ（秒）
   ・AZAKEI_VOICE.chime(up)：案内のチャイム（ファイルを使わず、ブラウザでつくる音）
   ・AZAKEI_VOICE.stop()：いま流れている声を止める
   ・声のファイルは、はじめて流すときに読みこむ（ページの重さには入らない）
   ================================================================ */
(function () {
  if (window.AZAKEI_VOICE) return;
  const VER = '4';
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
  // 人の声に近い「新しい声」（Edge の自然な声、Apple の拡張・プレミアム、Google の声）を先に
  const NATURAL = /(Natural|Online|Neural|Enhanced|Premium|拡張|プレミアム|Google)/i;
  const isNatural = v => !!v && NATURAL.test(v.name);
  const rank = v => (/(Natural|Online|Neural|Premium|プレミアム)/i.test(v.name) ? 60 : 0) + (/(Enhanced|拡張)/i.test(v.name) ? 45 : 0) + (/Google/i.test(v.name) ? 35 : 0) + (/(Kyoko|O-Ren|Otoya|Hattori)/i.test(v.name) ? 20 : 0) + (/(Nanami|七海)/i.test(v.name) ? 10 : 0) + (v.localService === false ? 5 : 0);
  const pick = () => { const vs = jaVoices(); return vs.find(v => v.name === ttsName) || vs.slice().sort((a, b) => rank(b) - rank(a))[0] || null; };
  if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', () => document.dispatchEvent(new CustomEvent('azakei-voices'))); }
  // 読みまちがえやすい言葉
  // 読み方の辞書：読みまちがえやすい言葉を、ひらがなにしてから読ませる（字幕はもとの字のまま）
  //   ・かっこの中（よみがな・補足）は読まない ・数字のまわりの空白をつめる（「3 日間」→「3日間」）
  //   ・長い言葉から先に置きかえる。言葉を足すときは、このリストに足す
  const READ = [
    [/（[^）]*）|\([^)]*\)/g, ''],
    [/(\d)\s+(?=[^\s\x00-\x7F])/g, '$1'], [/([^\s\x00-\x7F])\s+(?=\d)/g, '$1'], [/(\d),(\d{3})/g, '$1$2'],
    [/@azakei_vlog/g, 'アットマーク、あざけい ブイログ'], [/azakeiten\.github\.io/g, 'あざけいてん ドット ギットハブ ドット アイオー'],
    [/麻布中学校・高等学校/g, 'あざぶ中学校、高等学校'], [/麻布経済展/g, 'あざぶけいざいてん'], [/麻布生/g, 'あざぶせい'], [/麻経券/g, 'あざけいけん'],
    [/AZAKEI/g, 'あざけい'], [/麻経/g, 'あざけい'], [/麻布/g, 'あざぶ'],
    [/文化祭/g, 'ぶんかさい'], [/同好会/g, 'どうこうかい'], [/部員/g, 'ぶいん'], [/会長/g, 'かいちょう'], [/校長/g, 'こうちょう'], [/合言葉/g, 'あいことば'],
    [/創り出す/g, 'つくりだす'], [/創る/g, 'つくる'], [/自らで/g, 'みずからで'], [/自ら/g, 'みずから'], [/親しむ/g, 'したしむ'], [/親しみ/g, 'したしみ'], [/生みの親/g, 'うみのおや'],
    [/お札マン/g, 'おさつマン'], [/一万円札/g, 'いちまんえんさつ'], [/五千円札/g, 'ごせんえんさつ'], [/千円札/g, 'せんえんさつ'], [/お札/g, 'おさつ'], [/日本銀行券/g, 'にっぽんぎんこうけん'],
    [/日経ストックリーグ/g, 'にっけいストックリーグ'], [/日経平均/g, 'にっけいへいきん'], [/日経/g, 'にっけい'],
    [/中3-5/g, 'ちゅうさんのご'], [/(?<!\d)1日目/g, 'いちにちめ'], [/(?<!\d)2日目/g, 'ふつかめ'], [/(?<!\d)3日目/g, 'みっかめ'], [/(?<!\d)3日間/g, 'みっかかん'], [/(?<!\d)1分/g, 'いっぷん'], [/(?<!\d)1人/g, 'ひとり'], [/一人/g, 'ひとり'], [/(?<!\d)2人/g, 'ふたり'],
    [/(?<!\d)1つ/g, 'ひとつ'], [/(?<!\d)2つ/g, 'ふたつ'], [/(?<!\d)3つ/g, 'みっつ'], [/(?<!\d)4つ/g, 'よっつ'], [/(?<!\d)5つ/g, 'いつつ'], [/(?<!\d)6つ/g, 'むっつ'],
    [/円玉/g, 'えんだま'], [/豆知識/g, 'まめちしき'], [/新貨条例/g, 'しんかじょうれい'], [/入口/g, 'いりぐち'], [/今日/g, 'きょう'], [/上手/g, 'じょうず'],
    [/(?<![一-龯])表(?=なら|が|だ|でした)/g, 'おもて'],
    [/ご清聴/g, 'ごせいちょう'], [/登壇/g, 'とうだん'], [/協賛/g, 'きょうさん'],
    [/Instagram/g, 'インスタグラム'], [/Web/g, 'ウェブ'], [/(?<![A-Za-z])SNS(?![A-Za-z])/g, 'エスエヌエス'], [/(?<![A-Za-z])NISA(?![A-Za-z])/g, 'ニーサ'], [/(?<![A-Za-z])GDP(?![A-Za-z])/g, 'ジーディーピー'], [/(?<![A-Za-z])AI(?![A-Za-z])/g, 'エーアイ'], [/(?<![A-Za-z])OB(?![A-Za-z])/g, 'オービー'], [/(?<![A-Za-z])IR(?![A-Za-z])/g, 'アイアール'],
    [/(^|[^A-Za-z])A(?=[^A-Za-z]|$)/g, '$1エー'], [/(^|[^A-Za-z])B(?=[^A-Za-z]|$)/g, '$1ビー'],
    [/％|%/g, 'パーセント']
  ];
  const fix = t => READ.reduce((s, [a, b]) => s.replace(a, b), String(t));
  const split = t => String(t).replace(/\s+/g, ' ').split(/(?<=[。！？])/).map(s => s.trim()).filter(Boolean);
  // ── 前もってつくった声（VOICEVOX）。voice/vv/ に、役ごと・1 文ごとの mp3 がある（list.json に、ある文の印）
  //    役：m＝お札マン／n＝ナレーション。ない文は、これまでどおりブラウザの読み上げで読む
  //    文の印は、文（字幕と同じ字）の FNV-1a。声をつくるときも、この hash で名前をつける
  const VVV = '24';
  let vvList = null, vvLive = [];
  const vvHash = s => { let x = 0x811c9dc5; for (const ch of String(s)) { x ^= ch.codePointAt(0); x = Math.imul(x, 0x01000193) >>> 0; } return x.toString(36); };
  const vvIndex = () => vvList || (vvList = fetch('voice/vv/list.json?v=' + VVV).then(r => r.ok ? r.json() : {}).catch(() => ({})));
  const vvCache = {};
  const vvBuf = name => vvCache[name] || (vvCache[name] = fetch('voice/vv/' + name + '.mp3?v=' + VVV).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(b => new Promise((ok, ng) => ctx().decodeAudioData(b, ok, ng))).catch(() => { delete vvCache[name]; return null; }));
  const vvStop = () => { vvLive.forEach(x => { try { x.onended = null; x.stop(); } catch (e) {} }); vvLive = []; };
  // 1 文を流す。流せたら true、つくった声がなければ false（そのときはブラウザの読み上げへ）
  const vvPlay = async (role, sentence, rate, my) => {
    const idx = await vvIndex(), name = role + '-' + vvHash(sentence);
    if (!idx[name]) return false;
    let c; try { c = ctx(); if (c.state === 'suspended') await Promise.race([c.resume(), new Promise(r => setTimeout(r, 400))]); } catch (e) { return false; }
    const buf = await vvBuf(name);
    if (!buf || my !== ttsGen) return !!buf;
    return new Promise(res => {
      const src = c.createBufferSource(); src.buffer = buf; src.playbackRate.value = Math.max(.8, Math.min(1.25, rate || 1)); src.connect(c.destination);
      const end = () => { clearTimeout(w); vvLive = vvLive.filter(x => x !== src); res(true); };
      const w = setTimeout(end, (buf.duration / src.playbackRate.value) * 1000 + 600);
      src.onended = end; vvLive.push(src); src.start(c.currentTime + .03);
    });
  };
  const vvHas = async (role, text) => { const idx = await vvIndex(); return split(text).every(p => idx[role + '-' + vvHash(p)]); };
  const ttsStop = () => { ttsGen++; vvStop(); if (window.speechSynthesis) speechSynthesis.cancel(); };
  // o.onPart(文, 何番目, 全部で何文)。終わりの知らせが来ないブラウザのため、長さから見た時間がたったら先へ
  const tts = (text, o = {}) => new Promise(res => {
    if (!window.speechSynthesis && !o.role) { const parts = split(text); let k = 0; const step = () => { if (k >= parts.length) return res(); if (o.onPart) o.onPart(parts[k], k, parts.length); setTimeout(step, 900 + parts[k++].length * 130); }; return step(); }
    ttsStop(); const my = ttsGen, parts = split(text); let k = 0;
    const next = () => {
      if (my !== ttsGen || k >= parts.length) return res();
      const s = parts[k]; if (o.onPart) o.onPart(s, k, parts.length); k++;
      if (o.role) { const mine = my; vvPlay(o.role, s, o.vvRate, mine).then(ok => { if (mine !== ttsGen) return res(); if (ok) return setTimeout(next, o.gap == null ? 160 : o.gap); speakTTS(s); }); return; }
      speakTTS(s);
    };
    const speakTTS = s => {
      if (!window.speechSynthesis) { setTimeout(next, 900 + s.length * 130); return; }
      const u = new SpeechSynthesisUtterance(fix(s)); u.lang = 'ja-JP';
      const v = o.voice || pick(); if (v) u.voice = v;
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
  // ── お札マンの声：男の人の声で、少し低く落ち着いて（かっこよく）。男の声がない機械では、声を低くして近づける
  //    Edge：圭太（Keita・自然な声）／Windows：Ichiro／iPhone・Mac：Otoya・Hattori。えらんだ声は azakei_man_voice に
  //    ふだんは「主人公」らしい、明るく元気な話し方（setStyle で「クール」にもできる）
  const FEMALE = /(Nanami|七海|Haruka|Ayumi|Sayaka|Kyoko|O-Ren|Mizuki|Aoi|葵|Shiori|志織|Mayu|真由|Google)/i;
  const MALE = /(Keita|圭太|Daichi|大智|Naoki|直紀|Ichiro|Otoya|Hattori|Takumi|Kenji)/i;
  const isMale = v => MALE.test(v.name) && !FEMALE.test(v.name);
  let manName = null;
  try { manName = localStorage.getItem('azakei_man_voice'); } catch (e) {}
  const manRank = v => (isMale(v) ? 100 : 0) + (isNatural(v) ? 40 : 0) + (/(Keita|圭太)/i.test(v.name) ? 20 : 0) + (/(Otoya|Hattori)/i.test(v.name) ? 15 : 0);
  const manPick = () => { const vs = jaVoices(); return vs.find(v => v.name === manName) || vs.slice().sort((a, b) => manRank(b) - manRank(a))[0] || null; };
  // 人の声らしさを残すため、音の高さは大きく変えない。自然な男の声はほんの少し低く。古い男の声はそのまま。
  // 男の声がない機械だけ、少し低くして近づける（下げすぎると機械っぽくなる）
  // 話し方：hero＝主人公（明るく元気、まっすぐ。少し高めでテンポよく）／cool＝クール（少し低く、落ち着いて）。azakei_man_style に
  let manStyle = 'hero';
  try { manStyle = localStorage.getItem('azakei_man_style') || 'hero'; } catch (e) {}
  const STYLE = {
    hero: { natural: [1.14, 1.07], male: [1.12, 1.06], other: [.92, 1.05] },
    cool: { natural: [.93, .97], male: [1, .97], other: [.78, .95] }
  };
  const manTone = (v = manPick()) => { const s = STYLE[manStyle] || STYLE.hero, k = !v ? 'other' : isMale(v) ? (isNatural(v) ? 'natural' : 'male') : 'other'; return { voice: v, pitch: s[k][0], rate: s[k][1] }; };
  const setStyle = st => { manStyle = STYLE[st] ? st : 'hero'; try { localStorage.setItem('azakei_man_style', manStyle); } catch (e) {} };
  const getStyle = () => manStyle;
  const setMan = name => { manName = name; try { localStorage.setItem('azakei_man_voice', name); } catch (e) {} };
  const man = (text, o = {}) => { const t = manTone(); return tts(text, { role: 'm', vvRate: o.rate || 1, ...o, voice: t.voice, pitch: t.pitch, rate: (o.rate || 1) * t.rate }); };
  // 声のえらぶ欄に出す名前（男の声には「男性」）
  const label = v => v.name.replace(/^Microsoft\s*/, '').replace(/\s*Online\s*\(Natural\)/, '（自然な声）').replace(/\s*-\s*Japanese.*$|\s*\(Japan\)$/g, '').slice(0, 16) + (isMale(v) ? '・男性' : '');
  // この機械に、人の声に近い声があるか（なければ「Edge だと自然な声」と案内する）
  const hasNatural = () => jaVoices().some(isNatural);
  window.AZAKEI_VOICE = { vvHas, vvHash, on: () => on, set, say, dur, chime, stop, load, tts, ttsStop, jaVoices, pick, setTTS, fix, bgm, man, manPick, manTone, setMan, setStyle, getStyle, isMale, isNatural, hasNatural, label };
})();
