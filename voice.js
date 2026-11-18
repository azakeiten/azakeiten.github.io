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
  window.AZAKEI_VOICE = { on: () => on, set, say, dur, chime, stop, load };
})();
