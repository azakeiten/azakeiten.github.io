/* ================================================================
   pitch.js — コンテスト：ピッチの舞台（発表と質問タイムの練習）
   ・幕が上がると、上の「ビジネスプランのたね」に書いたプランが原稿になる（書いていなければ見本のプラン）
   ・60 秒で発表 → 3 人の審査員から 1 問ずつ質問（各 30 秒）→ 審査員がアドバイスの札をあげる
   ・審査員は練習用の架空の人。質問は、ビジネスコンテストでよく聞かれるたぐいのもの
   ・お札マンに原稿を読んでもらうこともできる（声はこのブラウザの読み上げ機能）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-pitch]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 計時の声（voice.js：効果音ラボの声）。「始め」「残り 10 秒」「タイムアップです」
  const PV = (document.currentScript && document.currentScript.src.split('v=')[1]) || '1';
  let annOn = false; try { annOn = localStorage.getItem('azakei_voice') === '1'; } catch (e) {}
  const VO = () => window.AZAKEI_VOICE ? Promise.resolve(window.AZAKEI_VOICE) : new Promise(r => { const s = document.createElement('script'); s.src = 'voice.js?v=' + PV; s.onload = () => r(window.AZAKEI_VOICE || null); s.onerror = () => r(null); document.head.appendChild(s); });
  const vo = names => { if (annOn) VO().then(v => { if (v && annOn) v.say(names, .03); }); };
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const SAMPLE = {
    problem: '朝の駅で、自転車を止める場所が足りない', idea: '空いている駐輪場を、アプリで予約できるようにする',
    persona: '駅まで自転車で通う、高校生と会社員', model: '1 回 100 円の予約料。駐輪場には広告を出してもらう',
    diff: '前の日の夜から予約できて、雨の日は屋根つきを優先', pitch: '朝の駐輪場を、予約できる時代へ'
  };
  // [印, 見るところ, 質問 3 つ, アドバイス]
  const J = [
    ['新', '新しさ', ['似たサービスは、もうありませんか？', 'いちばん新しいところを、ひと言でいうと？', 'なぜ、いままでだれもやらなかったのでしょう？'],
      'ほかとのちがいを、ひと言で言えるようにしておこう。くらべる相手がいると伝わりやすい。'],
    ['客', 'お客さん', ['お客さんは、本当にお金をはらってくれますか？', '最初の 10 人のお客さんは、どうやって見つけますか？', 'お客さんの困りごとを、実際に聞いてみましたか？'],
      '「だれが、いくらなら、はらうか」を、実際に何人かに聞いてみよう。答えが数字になると強い。'],
    ['続', '続けること', ['始めるのに、どんなお金がかかりますか？', 'お客さんが 10 倍になったら、何が大変になりますか？', 'うまくいかなかったら、どこを直しますか？'],
      'かかるお金と入ってくるお金を、ざっくり表にしてみよう。続けられるかが見えてくる。']
  ];
  const PITCH_S = 60, QA_S = 30;
  let sfxOn = false, voiceOn = false, ac = null, timer = 0, raf = 0, phase = 'idle', qi = 0, qs = [];
  const tone = (f, d, type = 'sine', v = .08, at = 0) => {
    if (!sfxOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + at;
      o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d + .05);
    } catch (e) {}
  };
  const clap = () => {   // 拍手（短い雑音を何度も）
    if (!sfxOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const len = ac.sampleRate * .06, buf = ac.createBuffer(1, len, ac.sampleRate), ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      for (let k = 0; k < 26; k++) {
        const s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
        f.type = 'bandpass'; f.frequency.value = 1200 + Math.random() * 1600; g.gain.value = .25 + Math.random() * .2;
        s.buffer = buf; s.connect(f).connect(g).connect(ac.destination); s.start(ac.currentTime + k * .07 + Math.random() * .05);
      }
    } catch (e) {}
  };
  const plan = () => {
    let d = {}; try { d = JSON.parse(localStorage.getItem('azakei_planseed') || '{}'); } catch (e) {}
    const n = ['problem', 'idea', 'persona', 'model', 'diff', 'pitch'].filter(k => (d[k] || '').trim()).length;
    const mine = n >= 3, p = mine ? d : SAMPLE;
    const c = k => String(p[k] || '').trim().replace(/^[「『]|[」』]$/g, '').replace(/[。．.]+$/, '');
    const S = [];
    if (c('pitch')) S.push(`わたしたちのプランは、「${c('pitch')}」です。`);
    if (c('problem')) S.push(`いま、${c('problem')}、という困りごとがあります。`);
    if (c('idea')) S.push(`そこで、${c('idea')}。`);
    if (c('persona')) S.push(`いちばんのお客さんは、${c('persona')}です。`);
    if (c('model')) S.push(`お金のもらい方は、${c('model')}。`);
    if (c('diff')) S.push(`ほかとのちがいは、${c('diff')}、というところです。`);
    S.push('ご清聴ありがとうございました。');
    return { mine, S };
  };
  const LOOK = [   // 見分けやすいように、めがね・おだんご・ネクタイ
    '<path class="pi-hair" d="M40 36 Q40 16 60 16 Q80 16 80 36 Q74 26 60 26 Q46 26 40 36Z"/><g class="pi-gl"><circle cx="52" cy="40" r="6"/><circle cx="68" cy="40" r="6"/><path d="M58 40 H62"/></g>',
    '<circle class="pi-hair" cx="60" cy="14" r="9"/><path class="pi-hair" d="M40 38 Q38 17 60 17 Q82 17 80 38 Q78 26 60 25 Q42 26 40 38Z"/>',
    '<path class="pi-hair" d="M41 32 Q44 17 60 17 Q76 17 79 32 Q60 22 41 32Z"/><path class="pi-tie" d="M56 66 L64 66 L62 74 L66 96 L60 102 L54 96 L58 74Z"/>'
  ];
  const JUDGE = (k, j) => `<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="pi-jh" cx="60" cy="38" r="20"/><path class="pi-jb" d="M22 104 Q24 66 60 64 Q96 66 98 104 Z"/>${LOOK[j]}<g class="pi-card"><rect x="70" y="2" width="44" height="34" rx="4"/><text x="92" y="26">${k}</text></g></svg>`;
  let P;
  const build = () => {
    P = plan();
    box.innerHTML = `<div class="pi-stage">
      <div class="pi-spot" aria-hidden="true"></div>
      <div class="pi-back" aria-hidden="true"><span>麻</span></div>
      <div class="pi-judges">${J.map(([k, t], j) => `<div class="pi-judge" data-j="${j}"><div class="pi-q" aria-live="polite"></div>${JUDGE(k, j)}<p class="pi-plate"><b>${k}</b>${t}を見る審査員</p></div>`).join('')}</div>
      <div class="pi-screen">
        <p class="pi-head"><span class="pi-step">発表の前</span><span class="pi-time" aria-live="off"></span></p>
        <div class="pi-bar" aria-hidden="true"><i></i></div>
        <ol class="pi-script">${P.S.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
        <p class="pi-src">${P.mine ? '上の「ビジネスプランのたね」に書いた、あなたのプランが原稿です。' : 'まだプランが書かれていないので、見本のプランで練習します。上の欄に書くと、あなたのプランになります。'}</p>
      </div>
      <div class="pi-floor" aria-hidden="true"></div>
      <div class="pi-curtain pi-cl" aria-hidden="true"></div><div class="pi-curtain pi-cr" aria-hidden="true"></div>
      <div class="pi-valance" aria-hidden="true"></div>
      <div class="pi-open"><p>舞台の幕が上がると、発表の練習が始まります。<br>60 秒の発表のあと、3 人の審査員から質問がきます。</p><button type="button" class="pi-go">幕を上げる</button></div>
      <div class="pi-rain" aria-hidden="true"></div>
    </div>
    <div class="pi-ctrl">
      <button type="button" class="pi-next" hidden>次へ</button>
      <label class="pi-tg"><input type="checkbox" class="pi-voice"${'speechSynthesis' in window ? '' : ' disabled'}>お札マンが原稿を読む</label>
      <label class="pi-tg"><input type="checkbox" class="pi-ann">計時の声</label>
      <label class="pi-tg"><input type="checkbox" class="pi-sfx">効果音</label>
      <button type="button" class="pi-reset">はじめから</button>
    </div>
    <div class="pi-host"></div>
    <p class="pi-note">審査員は練習用の架空の人です。質問は、ビジネスコンテストでよく聞かれるたぐいのものを集めました。声に出して答えてみてください（声や答えは、どこにも送られません）。</p>`;
    box.querySelector('.pi-voice').checked = voiceOn;
    box.querySelector('.pi-sfx').checked = sfxOn;
    box.querySelector('.pi-ann').checked = annOn;
    host('発表は、はじめの 10 秒が勝負！ 幕が上がったら、ゆっくり大きな声でね。');
  };
  const $ = s => box.querySelector(s);
  const host = msg => { $('.pi-host').innerHTML = window.AZAKEI_OSATSU ? AZAKEI_OSATSU(msg, phase === 'end' ? 'happy' : '') : `<p>${msg}</p>`; };
  const stopAll = () => { clearInterval(timer); cancelAnimationFrame(raf); if (window.speechSynthesis) speechSynthesis.cancel(); };
  // 残り時間を、上の帯と数字で見せる
  const countdown = (sec, onEnd) => {
    const t0 = performance.now(), bar = $('.pi-bar i'), tm = $('.pi-time');
    let last = -1;
    clearInterval(timer);
    const tick = () => {
      const left = Math.max(0, sec - (performance.now() - t0) / 1000), s = Math.ceil(left);
      bar.style.transform = `scaleX(${left / sec})`;
      if (s !== last) { last = s; tm.textContent = `のこり ${s} 秒`; box.classList.toggle('is-hurry', s <= 10 && s > 0); if (s <= 3 && s > 0) tone(880, .08, 'square', .04); if (s === 10 && sec > 20 && phase === 'pitch' && !voiceOn) vo(['nokori', 'zyuu', 'byou']); }
      if (left <= 0) { clearInterval(timer); box.classList.remove('is-hurry'); onEnd(); }
    };
    tick(); timer = setInterval(tick, 200);
  };
  const lightLine = i => box.querySelectorAll('.pi-script li').forEach((li, k) => { li.classList.toggle('is-now', k === i); li.classList.toggle('is-done', k < i); });
  // 原稿の文を、時間にあわせて 1 つずつ光らせる（読み上げのときは、読み終わりにあわせる）
  const prompter = () => {
    const S = P.S, total = S.reduce((a, s) => a + s.length, 0), budget = (PITCH_S - 8) * 1000;
    let i = 0;
    const next = () => {
      if (phase !== 'pitch') return;
      if (i >= S.length) { lightLine(S.length); return; }
      lightLine(i);
      const li = box.querySelectorAll('.pi-script li')[i];
      // ページ全体は動かさず、原稿の枠の中だけを送る
      const sc = $('.pi-script');
      if (li) sc.scrollTo({ top: Math.max(0, li.offsetTop - sc.offsetTop - 30), behavior: reduce ? 'auto' : 'smooth' });
      const ms = Math.max(1600, budget * S[i].length / total), txt = S[i]; i++;
      if (voiceOn && window.speechSynthesis) {
        let fin = false; const done = () => { if (fin) return; fin = true; clearTimeout(w); setTimeout(next, 250); };
        // お札マンは男の人の声（voice.js の manTone）
        const V = window.AZAKEI_VOICE, mt = V ? V.manTone() : { voice: null, pitch: .7, rate: 1 };
        const u = new SpeechSynthesisUtterance(V ? V.fix(txt) : txt); u.lang = 'ja-JP'; if (mt.voice) u.voice = mt.voice; u.pitch = mt.pitch; u.rate = 1.05 * mt.rate; u.onend = done; u.onerror = done;
        const w = setTimeout(done, 2500 + txt.length * 300);   // 読み終わりの合図が来ないときのため
        setTimeout(() => speechSynthesis.speak(u), 60);
      } else setTimeout(next, ms);
    };
    next();
  };
  const step = t => { $('.pi-step').textContent = t; };
  const startPitch = () => {
    phase = 'pitch';
    box.classList.add('is-open', 'is-pitch');
    tone(523, .15, 'triangle', .07); tone(659, .15, 'triangle', .07, .12); tone(784, .3, 'triangle', .07, .24);
    step('発表　60 秒');
    host(voiceOn ? 'ぼくが原稿を読むね。審査員の顔を見ながら、いっしょに口を動かしてみて。' : '光っている文を、声に出して読んでみよう。時計は気にしすぎずに！');
    const nx = $('.pi-next'); nx.hidden = false; nx.textContent = '発表を終える';
    vo(['hazime']);
    setTimeout(prompter, reduce ? 0 : 900);
    countdown(PITCH_S, () => { vo(['timeupdesu']); toQA(); });
  };
  const toQA = () => {
    if (phase !== 'pitch') return;
    stopAll(); lightLine(P.S.length);
    clap();
    box.classList.remove('is-pitch'); box.classList.add('is-qa');
    qs = J.map(j => j[2][Math.random() * 3 | 0]); qi = -1;
    phase = 'qa';
    host('拍手！ つぎは質問タイム。わからないことは「わからないので、調べます」と正直に言うのも大事だよ。');
    setTimeout(nextQ, reduce ? 0 : 1200);
  };
  const nextQ = () => {
    if (phase !== 'qa') return;
    if (qi >= 0) box.querySelector(`.pi-judge[data-j="${qi}"]`).classList.remove('is-ask');
    qi++;
    if (qi >= J.length) { finish(); return; }
    const jd = box.querySelector(`.pi-judge[data-j="${qi}"]`);
    jd.classList.add('is-ask'); jd.querySelector('.pi-q').textContent = qs[qi];
    box.style.setProperty('--spot', `${[18, 50, 82][qi]}%`);
    tone(392, .12, 'sine', .06);
    step(`質問 ${qi + 1} / 3　「${J[qi][1]}」の審査員`);
    $('.pi-next').textContent = qi < J.length - 1 ? '答えた。次の質問へ' : '答えた。講評へ';
    if (voiceOn && window.speechSynthesis) { const u = new SpeechSynthesisUtterance(qs[qi]); u.lang = 'ja-JP'; u.pitch = [1, .85, 1.1][qi] || 1; const V = window.AZAKEI_VOICE; if (V) { const nv = V.pick(), mv = V.manPick(); const others = V.jaVoices().filter(x => !mv || x.name !== mv.name); const jv = others[qi % Math.max(1, others.length)] || nv; if (jv) u.voice = jv; } speechSynthesis.cancel(); setTimeout(() => speechSynthesis.speak(u), 60); }
    countdown(QA_S, nextQ);
  };
  const finish = () => {
    stopAll();
    phase = 'end';
    box.classList.remove('is-qa'); box.classList.add('is-end');
    box.style.removeProperty('--spot');
    step('講評');
    $('.pi-time').textContent = '';
    $('.pi-bar i').style.transform = 'scaleX(0)';
    box.querySelectorAll('.pi-judge').forEach((jd, j) => { jd.querySelector('.pi-q').textContent = J[j][3]; jd.style.setProperty('--d', `${j * .35}s`); });
    $('.pi-next').hidden = true;
    let n = 0; try { n = (+localStorage.getItem('azakei_pitch') || 0) + 1; localStorage.setItem('azakei_pitch', String(n)); } catch (e) {}
    host(`おつかれさま！ ${n > 1 ? `${n} 回目の舞台だね。` : ''}審査員の札を読んで、プランを直したら、もう一度舞台へ。本番のコンテストでも、きっと役に立つよ。`);
    clap(); tone(659, .2, 'triangle', .06, .4); tone(988, .4, 'triangle', .06, .6);
    if (!reduce) {
      const r = $('.pi-rain');
      r.innerHTML = Array.from({ length: 34 }, (_, k) => `<i style="--x:${Math.random() * 100}%;--t:${2.4 + Math.random() * 2}s;--w:${-Math.random() * 3}s;--r:${Math.random() * 360}deg;--c:${['#b5432f', '#e3b341', '#2f6b3a', '#fffaf0'][k % 4]}"></i>`).join('');
      setTimeout(() => { r.innerHTML = ''; }, 6000);
    }
  };
  box.addEventListener('click', e => {
    if (e.target.closest('.pi-go')) { startPitch(); return; }
    if (e.target.closest('.pi-next')) { if (phase === 'pitch') toQA(); else if (phase === 'qa') nextQ(); return; }
    if (e.target.closest('.pi-reset')) { stopAll(); phase = 'idle'; box.classList.remove('is-open', 'is-pitch', 'is-qa', 'is-end', 'is-hurry'); box.style.removeProperty('--spot'); build(); }
  });
  box.addEventListener('change', e => {
    if (e.target.matches('.pi-ann')) { annOn = e.target.checked; VO().then(v => { if (v) v.set(annOn); }); }
    if (e.target.matches('.pi-voice')) { voiceOn = e.target.checked; if (voiceOn) VO(); if (!voiceOn && window.speechSynthesis) speechSynthesis.cancel(); }
    if (e.target.matches('.pi-sfx')) { sfxOn = e.target.checked; tone(660, .1); }
  });
  // 上の欄に書き足したら、まだ幕が上がる前なら原稿を作りなおす
  const seed = document.querySelector('[data-planseed]');
  if (seed) seed.addEventListener('input', () => { if (phase === 'idle') { clearTimeout(seed._pt); seed._pt = setTimeout(build, 500); } });
  addEventListener('pagehide', stopAll);
  build();
})();
