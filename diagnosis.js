/* ================================================================
   diagnosis.js — エコノミスト診断（Web版）
   文化祭で展示した手描きポスター「エコノミスト診断」をもとにしたもの。
   YES / NO で道を選び、4 つの投資家タイプ（ライオン・キツネ・カメ・ウサギ）にたどり着く。
   結果は URL の #lion などで共有できる。
   ================================================================ */
(function() {
  // 質問のつながり（ポスターの矢印と同じ形：YES は左の列へ、NO は下へ）
  const N = {
    r1: { q: '投資では一攫千金を狙う',              yes: 'm1', no: 'r2' },
    r2: { q: '毎日ニュースをチェックする',          yes: 'm2', no: 'r3' },
    r3: { q: '仕事（学業）より趣味の方が大事',       yes: 'm3', no: 'r4' },
    r4: { q: '人から影響を受けやすい',              yes: 'm4', no: 'm3' },
    m1: { q: '投資家の勧める株を買う',              yes: 'l1', no: 'm2' },
    m2: { q: 'リスクを冒してでもリターンを得る',     yes: 'l2', no: 'm3' },
    m3: { q: '自分は倹約家だ',                      yes: 'l3', no: 'm4' },
    m4: { q: 'ボランティアをしたことがある',         yes: 'l4', no: 'l3' },
    l1: { q: 'グロース株を積極的に買いたい',         yes: '=lion',   no: 'l2', note: 'グロース株：これから大きく成長しそうな会社の株' },
    l2: { q: 'テクニカル分析をよく使う',             yes: '=fox',    no: '=lion', note: 'テクニカル分析：株価のグラフの形から、値動きを予想する方法' },
    l3: { q: '推しがいない',                        yes: '=turtle', no: 'l4' },
    l4: { q: '今、欲しいものにお金を使う',           yes: '=rabbit', no: '=turtle' }
  };
  const START = 'r1';

  const T = {
    lion: {
      name: 'ライオンタイプ', en: 'The Bold Lion', color: '#c98a1c',
      lead: 'チャンスと見たら大胆に飛び込む、攻めの投資家。これから大きく伸びそうな会社に思い切って投資し、大きなリターンを狙います。',
      good: '決断の速さと度胸。人が迷っているうちに動ける。',
      care: '一度に全部を賭けないこと。いくつかに分けて投資する「分散投資」を味方に。',
      azakei: ['起業家オーディション', 'ビジネスコンテスト'], match: 'turtle'
    },
    fox: {
      name: 'キツネタイプ', en: 'The Clever Fox', color: '#e0702a',
      lead: 'データとグラフを読み解く、頭脳派の投資家。値動きのパターンやニュースから、賢くタイミングを見極めます。',
      good: '情報を集めて冷静に分析する力。',
      care: '毎日の細かい値動きに振り回されすぎないこと。長い目で見ることも大切。',
      azakei: ['日経ストックリーグ', '論文作成'], match: 'rabbit'
    },
    turtle: {
      name: 'カメタイプ', en: 'The Steady Turtle', color: '#3c8a37',
      lead: 'ムダづかいをせず、コツコツ積み上げる長期派。時間を味方につけて、お金をゆっくり育てます。利息が利息を生む「複利」の力をいちばん生かせるタイプです。',
      good: '続ける力と堅実さ。周りからの信頼も厚い。',
      care: '慎重になりすぎて、チャンスを見送ってしまうことも。',
      azakei: ['論文作成', '展示の運営'], match: 'lion'
    },
    rabbit: {
      name: 'ウサギタイプ', en: 'The Joyful Rabbit', color: '#d4688a',
      lead: '「今」を全力で楽しむ、体験重視派。好きなものや体験にお金を使って、毎日を豊かにします。実は、みんなの「消費」こそが経済を回すエンジンです。',
      good: '行動力と、楽しむ力。周りを明るくする。',
      care: '少しずつでも、未来のための貯金を。',
      azakei: ['文化祭の企画', 'SNS 発信'], match: 'fox'
    }
  };

  // ---- 英語版（<html lang="en"> のページでは英語で表示） ----
  const EN = document.documentElement.lang === 'en';
  const S = EN ? {
    kicker: 'Choose YES or NO and find your investor type',
    title: 'What kind of <em>investor</em> are you?',
    intro: 'Our hand-drawn flowchart poster was a hit at the school festival. Now you can try it online: answer YES or NO and follow the arrows.',
    start: 'Start the test', back: '← Back one step',
    resultKicker: 'Your investor type is', strength: 'Strengths', care: 'Watch out for',
    shine: 'Where you would shine at AZAKEI', match: 'Best match', trail: 'The path you took',
    share: 'Share your result', copy: 'Copy link', copied: 'Copied!', copyFail: 'Could not copy',
    retry: 'Take the test again', festival: 'About the festival exhibition →', festivalHref: 'en.html#festival',
    shareText: name => `I'm "${name}"! What kind of investor are you? #AZAKEI`,
    url: 'https://azakeiten.github.io/en-diagnosis.html', sep: ', '
  } : {
    kicker: 'YES か NO の道を選んで、自分の投資家タイプを知ろう',
    title: 'あなたは、どの<em>投資家タイプ</em>？',
    intro: '文化祭で大人気だった手描きポスターの診断を、そのまま Web にしました。質問に YES か NO で答えて、矢印の先へ進んでください。',
    start: '診断をはじめる', back: '← ひとつ前に戻る',
    resultKicker: 'あなたの投資家タイプは', strength: '強み', care: '気をつけたいこと',
    shine: 'AZAKEI で輝ける場所', match: '相性のいいタイプ', trail: 'あなたが通った道',
    share: '結果をシェア', copy: 'リンクをコピー', copied: 'コピーしました！', copyFail: 'コピーできませんでした',
    retry: 'もう一度診断する', festival: '文化祭の展示を見る →', festivalHref: 'festival.html',
    shareText: name => `私は「${name}」の投資家でした！あなたは？ #AZAKEI経済診断`,
    url: 'https://azakeiten.github.io/diagnosis.html', sep: '・'
  };
  if (EN) {
    const q = {
      r1: 'In investing, I go for the big win.',
      r2: 'I check the news every day.',
      r3: 'My hobbies matter more than work (or school).',
      r4: 'I am easily influenced by other people.',
      m1: 'I would buy the stocks an investor recommends.',
      m2: 'I would take risks to get a bigger return.',
      m3: 'I am careful with money.',
      m4: 'I have done volunteer work.',
      l1: 'I want to actively buy growth stocks.',
      l2: 'I often use technical analysis.',
      l3: 'I do not have an "oshi" (a favorite idol, star, or character I support).',
      l4: 'I spend money on what I want right now.'
    };
    Object.keys(q).forEach(k => { N[k].q = q[k]; });
    N.l1.note = 'Growth stocks: shares of companies expected to grow quickly.';
    N.l2.note = 'Technical analysis: predicting prices from the shape of price charts.';
    Object.assign(T.lion, { name: 'Lion', lead: 'A bold investor who jumps at opportunities. You invest boldly in companies that could grow big, aiming for large returns.', good: 'Quick decisions and courage. You move while others are still hesitating.', care: 'Do not bet everything at once. Spreading your money out (diversification) is your friend.', azakei: ['Entrepreneur auditions', 'Business contests'] });
    Object.assign(T.fox, { name: 'Fox', lead: 'A clever investor who reads data and charts. You use price patterns and the news to time your moves wisely.', good: 'Gathering information and analyzing it calmly.', care: 'Do not get swept up by every small price move. Looking at the long term matters too.', azakei: ['Nikkei Stock League', 'Research papers'] });
    Object.assign(T.turtle, { name: 'Turtle', lead: 'A steady, long-term builder who avoids waste. You let time work for you and grow your money slowly. You make the most of compound interest, where interest earns more interest.', good: 'Persistence and reliability. People trust you.', care: 'Being too careful can mean missing good chances.', azakei: ['Research papers', 'Running the exhibition'] });
    Object.assign(T.rabbit, { name: 'Rabbit', lead: 'You live in the moment and value experiences. You spend on things you love and make every day richer. In fact, spending is the engine that keeps the economy moving.', good: 'Energy and the ability to enjoy life. You brighten the people around you.', care: 'Save a little for the future, even a small amount at a time.', azakei: ['Planning the festival', 'Social media'] });
  }

  // ---- 動物の絵（シンプルな SVG） ----
  const ART = {
    lion: `<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="#a5622a">${[...Array(12)].map((_, k) => { const a = k * 30 * Math.PI / 180; return `<circle cx="${60 + 40 * Math.cos(a)}" cy="${62 + 40 * Math.sin(a)}" r="15"/>`; }).join('')}</g><circle cx="60" cy="62" r="36" fill="#a5622a"/><circle cx="60" cy="64" r="28" fill="#f6d34a"/><circle cx="49" cy="58" r="3.4" fill="#2a1f12"/><circle cx="71" cy="58" r="3.4" fill="#2a1f12"/><path d="M54 68h12l-6 6z" fill="#7a4317"/><path d="M60 74q-6 7-12 3M60 74q6 7 12 3" stroke="#7a4317" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="45" cy="76" rx="9" ry="5" fill="#fff" opacity=".9"/><ellipse cx="75" cy="76" rx="9" ry="5" fill="#fff" opacity=".9"/></svg>`,
    fox: `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M22 22l22 22M98 22L76 44" stroke="none"/><path d="M20 18l30 26-18 12zM100 18L70 44l18 12z" fill="#e8742c"/><path d="M26 26l18 16-10 7zM94 26L76 42l10 7z" fill="#fff3e6"/><path d="M14 52q46-26 92 0L60 104z" fill="#ef8a35"/><path d="M14 52q20 6 46 52L28 74zM106 52q-20 6-46 52l32-30z" fill="#fff"/><circle cx="44" cy="62" r="4" fill="#2a1f12"/><circle cx="76" cy="62" r="4" fill="#2a1f12"/><path d="M55 92h10l-5 6z" fill="#2a1f12"/></svg>`,
    turtle: `<svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="96" rx="40" ry="6" fill="#000" opacity=".08"/><circle cx="96" cy="62" r="12" fill="#8fc46a"/><circle cx="100" cy="59" r="2.4" fill="#2a1f12"/><ellipse cx="34" cy="86" rx="9" ry="7" fill="#8fc46a"/><ellipse cx="80" cy="86" rx="9" ry="7" fill="#8fc46a"/><path d="M16 80q4-46 44-46t44 46z" fill="#3c8a37"/><path d="M60 34v46M38 44l8 36M82 44l-8 36M20 64h80" stroke="#245a22" stroke-width="2.4" fill="none"/><path d="M14 80h92" stroke="#245a22" stroke-width="3" stroke-linecap="round"/></svg>`,
    rabbit: `<svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="44" cy="30" rx="10" ry="26" fill="#f2a7bf"/><ellipse cx="76" cy="30" rx="10" ry="26" fill="#f2a7bf"/><ellipse cx="44" cy="32" rx="5" ry="18" fill="#e5658d"/><ellipse cx="76" cy="32" rx="5" ry="18" fill="#e5658d"/><circle cx="60" cy="74" r="34" fill="#f2a7bf"/><circle cx="48" cy="70" r="4" fill="#2a1f12"/><circle cx="72" cy="70" r="4" fill="#2a1f12"/><path d="M56 82h8l-4 4z" fill="#c4426c"/><path d="M60 86v6M60 92q-5 4-9 1M60 92q5 4 9 1" stroke="#c4426c" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="40" cy="84" r="5" fill="#e5658d" opacity=".4"/><circle cx="80" cy="84" r="5" fill="#e5658d" opacity=".4"/></svg>`
  };

  const root = document.getElementById('diag');
  if (!root) return;
  const URL_BASE = S.url;
  const esc = s => encodeURIComponent(s);
  let path = [];   // [{ id, ans }]

  function intro() {
    path = [];
    root.innerHTML = `
      <div class="dg-card dg-intro">
        <p class="dg-kicker">${S.kicker}</p>
        <h2>${S.title}</h2>
        <p>${S.intro}</p>
        <div class="dg-animals">${Object.entries(T).map(([k, t]) => `<figure style="--c:${t.color}">${ART[k]}<figcaption>${t.name}</figcaption></figure>`).join('')}</div>
        <button type="button" class="btn-primary dg-start">${S.start}</button>
      </div>`;
    root.querySelector('.dg-start').addEventListener('click', () => ask(START));
  }

  function ask(id) {
    const node = N[id];
    const step = path.length + 1;
    root.innerHTML = `
      <div class="dg-card dg-q" aria-live="polite">
        <p class="dg-kicker">Q${step}</p>
        <div class="dg-box"><h2>${node.q}</h2>${node.note ? `<p class="dg-hint">${node.note}</p>` : ''}</div>
        <div class="dg-yn">
          <button type="button" class="dg-yes"><span aria-hidden="true">←</span>YES</button>
          <button type="button" class="dg-no"><span aria-hidden="true">↓</span>NO</button>
        </div>
        ${path.length ? `<button type="button" class="dg-back">${S.back}</button>` : ''}
      </div>`;
    const go = ans => {
      path.push({ id, ans });
      const next = ans ? node.yes : node.no;
      if (next.startsWith('=')) { const key = next.slice(1); history.replaceState(null, '', '#' + key); show(key, true); }
      else ask(next);
    };
    root.querySelector('.dg-yes').addEventListener('click', () => go(true));
    root.querySelector('.dg-no').addEventListener('click', () => go(false));
    const back = root.querySelector('.dg-back');
    if (back) back.addEventListener('click', () => { const prev = path.pop(); ask(prev.id); });
    root.querySelector('.dg-yes').focus({ preventScroll: true });
  }

  function show(key, played) {
    const t = T[key], m = T[t.match];
    const shareText = S.shareText(t.name);
    const url = URL_BASE + '#' + key;
    const trail = played && path.length ? `
        <div class="dg-trail"><p class="dg-trail-head">${S.trail}</p><ol>${path.map(p => `<li><span>${N[p.id].q}</span><b class="${p.ans ? 'y' : 'n'}">${p.ans ? 'YES' : 'NO'}</b></li>`).join('')}</ol></div>` : '';
    root.innerHTML = `
      <div class="dg-card dg-result" style="--c:${t.color}">
        <p class="dg-kicker">${S.resultKicker}</p>
        <div class="dg-art">${ART[key]}</div>
        <h2>${t.name}</h2>
        <p class="dg-en">${t.en}</p>
        <p class="dg-lead">${t.lead}</p>
        <dl class="dg-detail">
          <dt>${S.strength}</dt><dd>${t.good}</dd>
          <dt>${S.care}</dt><dd>${t.care}</dd>
          <dt>${S.shine}</dt><dd>${t.azakei.join(S.sep)}</dd>
          <dt>${S.match}</dt><dd><a href="#${t.match}" class="dg-match">${m.name}</a></dd>
        </dl>
        ${trail}
        <div class="share">
          <span class="share-label">${S.share}</span>
          <a href="https://twitter.com/intent/tweet?text=${esc(shareText)}&url=${esc(url)}" target="_blank" rel="noopener">X</a>
          <a href="https://social-plugins.line.me/lineit/share?url=${esc(url)}" target="_blank" rel="noopener">LINE</a>
          <button type="button" class="dg-copy">${S.copy}</button>
        </div>
        <div class="dg-actions">
          <button type="button" class="btn-primary dg-retry">${S.retry}</button>
          <a href="${S.festivalHref}" class="btn-ghost">${S.festival}</a>
        </div>
      </div>`;
    root.querySelector('.dg-retry').addEventListener('click', () => { history.replaceState(null, '', location.pathname); intro(); root.scrollIntoView({ behavior: 'smooth' }); });
    root.querySelector('.dg-copy').addEventListener('click', async function() {
      try { await navigator.clipboard.writeText(url); this.textContent = S.copied; }
      catch (e) { this.textContent = S.copyFail; }
      setTimeout(() => { this.textContent = S.copy; }, 2000);
    });
    root.querySelector('.dg-match').addEventListener('click', e => { e.preventDefault(); path = []; history.replaceState(null, '', '#' + t.match); show(t.match, false); });
  }

  const start = location.hash.slice(1);
  if (T[start]) show(start, false); else intro();
})();
