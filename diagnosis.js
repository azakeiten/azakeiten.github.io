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

  // ---- 動物の絵（シンプルな SVG） ----
  const ART = {
    lion: `<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="#a5622a">${[...Array(12)].map((_, k) => { const a = k * 30 * Math.PI / 180; return `<circle cx="${60 + 40 * Math.cos(a)}" cy="${62 + 40 * Math.sin(a)}" r="15"/>`; }).join('')}</g><circle cx="60" cy="62" r="36" fill="#a5622a"/><circle cx="60" cy="64" r="28" fill="#f6d34a"/><circle cx="49" cy="58" r="3.4" fill="#2a1f12"/><circle cx="71" cy="58" r="3.4" fill="#2a1f12"/><path d="M54 68h12l-6 6z" fill="#7a4317"/><path d="M60 74q-6 7-12 3M60 74q6 7 12 3" stroke="#7a4317" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="45" cy="76" rx="9" ry="5" fill="#fff" opacity=".9"/><ellipse cx="75" cy="76" rx="9" ry="5" fill="#fff" opacity=".9"/></svg>`,
    fox: `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M22 22l22 22M98 22L76 44" stroke="none"/><path d="M20 18l30 26-18 12zM100 18L70 44l18 12z" fill="#e8742c"/><path d="M26 26l18 16-10 7zM94 26L76 42l10 7z" fill="#fff3e6"/><path d="M14 52q46-26 92 0L60 104z" fill="#ef8a35"/><path d="M14 52q20 6 46 52L28 74zM106 52q-20 6-46 52l32-30z" fill="#fff"/><circle cx="44" cy="62" r="4" fill="#2a1f12"/><circle cx="76" cy="62" r="4" fill="#2a1f12"/><path d="M55 92h10l-5 6z" fill="#2a1f12"/></svg>`,
    turtle: `<svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="96" rx="40" ry="6" fill="#000" opacity=".08"/><circle cx="96" cy="62" r="12" fill="#8fc46a"/><circle cx="100" cy="59" r="2.4" fill="#2a1f12"/><ellipse cx="34" cy="86" rx="9" ry="7" fill="#8fc46a"/><ellipse cx="80" cy="86" rx="9" ry="7" fill="#8fc46a"/><path d="M16 80q4-46 44-46t44 46z" fill="#3c8a37"/><path d="M60 34v46M38 44l8 36M82 44l-8 36M20 64h80" stroke="#245a22" stroke-width="2.4" fill="none"/><path d="M14 80h92" stroke="#245a22" stroke-width="3" stroke-linecap="round"/></svg>`,
    rabbit: `<svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="44" cy="30" rx="10" ry="26" fill="#f2a7bf"/><ellipse cx="76" cy="30" rx="10" ry="26" fill="#f2a7bf"/><ellipse cx="44" cy="32" rx="5" ry="18" fill="#e5658d"/><ellipse cx="76" cy="32" rx="5" ry="18" fill="#e5658d"/><circle cx="60" cy="74" r="34" fill="#f2a7bf"/><circle cx="48" cy="70" r="4" fill="#2a1f12"/><circle cx="72" cy="70" r="4" fill="#2a1f12"/><path d="M56 82h8l-4 4z" fill="#c4426c"/><path d="M60 86v6M60 92q-5 4-9 1M60 92q5 4 9 1" stroke="#c4426c" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="40" cy="84" r="5" fill="#e5658d" opacity=".4"/><circle cx="80" cy="84" r="5" fill="#e5658d" opacity=".4"/></svg>`
  };

  const root = document.getElementById('diag');
  if (!root) return;
  const URL_BASE = 'https://ryoishiyama1-svg.github.io/azakei/diagnosis.html';
  const esc = s => encodeURIComponent(s);
  let path = [];   // [{ id, ans }]

  function intro() {
    path = [];
    root.innerHTML = `
      <div class="dg-card dg-intro">
        <p class="dg-kicker">YES か NO の道を選んで、自分の投資家タイプを知ろう</p>
        <h2>あなたは、どの<em>投資家タイプ</em>？</h2>
        <p>文化祭で大人気だった手描きポスターの診断を、そのまま Web にしました。質問に YES か NO で答えて、矢印の先へ進んでください。</p>
        <div class="dg-animals">${Object.entries(T).map(([k, t]) => `<figure style="--c:${t.color}">${ART[k]}<figcaption>${t.name}</figcaption></figure>`).join('')}</div>
        <button type="button" class="btn-primary dg-start">診断をはじめる</button>
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
        ${path.length ? '<button type="button" class="dg-back">← ひとつ前に戻る</button>' : ''}
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
    const shareText = `私は「${t.name}」の投資家でした！あなたは？ #AZAKEI経済診断`;
    const url = URL_BASE + '#' + key;
    const trail = played && path.length ? `
        <div class="dg-trail"><p class="dg-trail-head">あなたが通った道</p><ol>${path.map(p => `<li><span>${N[p.id].q}</span><b class="${p.ans ? 'y' : 'n'}">${p.ans ? 'YES' : 'NO'}</b></li>`).join('')}</ol></div>` : '';
    root.innerHTML = `
      <div class="dg-card dg-result" style="--c:${t.color}">
        <p class="dg-kicker">あなたの投資家タイプは</p>
        <div class="dg-art">${ART[key]}</div>
        <h2>${t.name}</h2>
        <p class="dg-en">${t.en}</p>
        <p class="dg-lead">${t.lead}</p>
        <dl class="dg-detail">
          <dt>強み</dt><dd>${t.good}</dd>
          <dt>気をつけたいこと</dt><dd>${t.care}</dd>
          <dt>AZAKEI で輝ける場所</dt><dd>${t.azakei.join('・')}</dd>
          <dt>相性のいいタイプ</dt><dd><a href="#${t.match}" class="dg-match">${m.name}</a></dd>
        </dl>
        ${trail}
        <div class="share">
          <span class="share-label">結果をシェア</span>
          <a href="https://twitter.com/intent/tweet?text=${esc(shareText)}&url=${esc(url)}" target="_blank" rel="noopener">X</a>
          <a href="https://social-plugins.line.me/lineit/share?url=${esc(url)}" target="_blank" rel="noopener">LINE</a>
          <button type="button" class="dg-copy">リンクをコピー</button>
        </div>
        <div class="dg-actions">
          <button type="button" class="btn-primary dg-retry">もう一度診断する</button>
          <a href="festival.html" class="btn-ghost">文化祭の展示を見る →</a>
        </div>
      </div>`;
    root.querySelector('.dg-retry').addEventListener('click', () => { history.replaceState(null, '', location.pathname); intro(); root.scrollIntoView({ behavior: 'smooth' }); });
    root.querySelector('.dg-copy').addEventListener('click', async function() {
      try { await navigator.clipboard.writeText(url); this.textContent = 'コピーしました！'; }
      catch (e) { this.textContent = 'コピーできませんでした'; }
      setTimeout(() => { this.textContent = 'リンクをコピー'; }, 2000);
    });
    root.querySelector('.dg-match').addEventListener('click', e => { e.preventDefault(); path = []; history.replaceState(null, '', '#' + t.match); show(t.match, false); });
  }

  const start = location.hash.slice(1);
  if (T[start]) show(start, false); else intro();
})();
