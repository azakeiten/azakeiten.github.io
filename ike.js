/* ================================================================
   ike.js — 経済ラボ：みんなの池（共有地の悲劇・近づいてから読みこむ）
   ・あなたと 3 人の釣り人が、1 つの池で 10 年魚をとる。毎年、何匹とるかを決める
   ・魚は、池に残った数に応じてふえる（多すぎても少なすぎてもふえにくい）。とりすぎると池は空っぽに
   ・3 人の性格：まじめ（いつも少なめ）／まねっこ（あなたの前の年と同じ）／よくばり（いつも多め）
   ・「漁獲枠」のルールを入れると、1 人 3 匹まで。10 年の合計と池のようすをくらべる
   ・数字はすべて「たとえ」。見た目は ike.css（このファイルが読みこむ）
   ================================================================ */
(function () {
  const box = document.querySelector('[data-ike]');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  if (!document.querySelector('link[href^="ike.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'ike.css?v=' + ((document.currentScript && document.currentScript.src.split('v=')[1]) || '1'); document.head.appendChild(l); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const YEARS = 10, K = 120, R = .45, START = 100, CAP = 3;
  const grow = f => f + R * f * (1 - f / K);
  // 釣り人：名前・色・場所（池のまわり）
  const WHO = [['あなた', '#b5432f', [330, 330]], ['まじめさん', '#3b5a78', [92, 190]], ['まねっこさん', '#5f7f4e', [330, 52]], ['よくばりさん', '#7a4a8a', [568, 190]]];
  const plan = (i, st) => {
    const low = st.fish < 40;
    if (i === 1) return low ? 2 : 3;
    if (i === 2) return Math.max(1, Math.min(8, st.last[0] || 4));
    return low ? 8 : 6;
  };

  box.innerHTML = `
    <div class="ik-stage">
      <svg class="ik-pond" viewBox="0 0 660 380" role="img" aria-label="池と、まわりの 4 人の釣り人">
        <defs><radialGradient id="ik-water" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#7cc3d8"/><stop offset="1" stop-color="#2f7f98"/></radialGradient></defs>
        <rect width="660" height="380" class="ik-grass"/>
        ${Array.from({ length: 26 }, (_, i) => `<path class="ik-tuft" d="M${(i * 97) % 640 + 10} ${(i * 53) % 360 + 12} l3 -8 l3 8 l3 -6"/>`).join('')}
        <ellipse cx="330" cy="190" rx="215" ry="118" class="ik-shore"/>
        <ellipse cx="330" cy="190" rx="200" ry="105" class="ik-water"/>
        <g class="ik-ripples">${[0, 1, 2].map(i => `<ellipse cx="${250 + i * 70}" cy="${170 + (i % 2) * 40}" rx="20" ry="7" style="animation-delay:${-i * 1.1}s"/>`).join('')}</g>
        <g class="ik-fish"></g>
        <g class="ik-catch"></g>
        ${WHO.map(([n, c, [x, y]], i) => `<g class="ik-man" data-m="${i}" transform="translate(${x} ${y})"><ellipse cy="26" rx="22" ry="6" class="ik-shadow"/><path d="M-12 24 Q-12 2 0 0 Q12 2 12 24 Z" fill="${c}"/><circle cy="-10" r="10" class="ik-head"/><path class="ik-rod" d="M8 4 L${x < 330 ? 60 : x > 330 ? -60 : 0} ${y < 190 ? 40 : y > 190 ? -50 : 0}"/><g class="ik-basket" transform="translate(${i === 0 ? 38 : i === 2 ? 38 : x < 330 ? -30 : 30} 18)"><rect x="-14" y="-4" width="28" height="16" rx="4"/><text y="9" data-b="${i}">0</text></g><text class="ik-name" y="${i === 2 ? -26 : 48}">${n}</text><g class="ik-say" transform="translate(0 ${i === 2 ? 60 : -34})"><rect x="-30" y="-13" width="60" height="22" rx="11"/><text y="3"></text></g></g>`).join('')}
        <g class="ik-dead"><text x="330" y="196">魚が、いなくなった</text></g>
      </svg>
      <div class="ik-hud"><p class="ik-year"><b data-k="year">1</b> 年目 / ${YEARS}</p><p class="ik-count"><span>池の魚</span><b data-k="fish">${START}</b><small>匹</small></p></div>
      <p class="ik-msg" aria-live="polite">今年、あなたは何匹とりますか？ ほかの 3 人も、それぞれ決めます。</p>
    </div>
    <div class="ik-side">
      <div class="ik-rule"><label class="ik-sw"><input type="checkbox" data-rule><span></span>漁獲枠のルールを入れる（1 人 1 年 ${CAP} 匹まで）</label><p>ルールを変えると、1 年目からやり直します。</p></div>
      <div class="ik-pick"><p class="ik-pick-h">今年、あなたがとる魚</p><div class="ik-step"><button type="button" data-d="-1" aria-label="1 匹へらす">−</button><output data-k="take">4</output><button type="button" data-d="1" aria-label="1 匹ふやす">+</button></div><button type="button" class="ik-go" data-a="go">釣りに行く</button></div>
      <table class="ik-tbl"><thead><tr><th>釣り人</th><th>今年</th><th>合計</th></tr></thead><tbody>${WHO.map(([n, c], i) => `<tr><td><i style="background:${c}"></i>${n}<small>${['', 'いつも少なめ', 'あなたの前の年をまねる', 'いつも多め'][i]}</small></td><td data-y="${i}">—</td><td data-t="${i}">0</td></tr>`).join('')}</tbody></table>
      <svg class="ik-chart" viewBox="0 0 300 120" role="img" aria-label="池の魚の数の移りかわり"></svg>
    </div>
    <div class="ik-result" hidden></div>
    <div class="ik-learn">
      <p><b>共有地の悲劇</b>みんなで使うものは、「自分だけ少し多めに」が重なると、あっという間になくなってしまいます。1 人ひとりは得をしたつもりでも、全員が損をする。これを「共有地の悲劇」といいます。</p>
      <p><b>魚は、ふえる資源</b>とりすぎなければ、魚は毎年ふえて、ずっととり続けられます。池にどれだけ残すかが、来年の魚の数を決めます。</p>
      <p><b>ルールで守る</b>日本でも、サンマやスルメイカなど一部の魚には、1 年にとってよい量を決める「漁獲可能量（TAC）」の制度があります。SDGs の目標 14「海の豊かさを守ろう」もこの考え方です（<a href="glossary.html#sdgs">SDGs</a>）。</p>
      <p><b>自分の行動が、ほかの人に</b>自分がとった魚のぶんだけ、ほかの人がとれる魚が減ります。こうした「ほかの人へのえいきょう」を<a href="glossary.html#externality">外部性</a>といいます。となりの「値下げ競争」のゲームとも似ています。</p>
    </div>
    <p class="ik-note">魚のふえ方や 3 人の性格は、しくみを知るための「たとえ」です。実際の池や漁業の数字ではありません。</p>`;

  const Kq = k => box.querySelector(`[data-k="${k}"]`);
  const svg = box.querySelector('.ik-pond'), fishG = svg.querySelector('.ik-fish'), catchG = svg.querySelector('.ik-catch'), stage = box.querySelector('.ik-stage');
  const msg = box.querySelector('.ik-msg'), result = box.querySelector('.ik-result'), chart = box.querySelector('.ik-chart');
  const men = [...svg.querySelectorAll('.ik-man')];
  let st, take = 4, rule = false, busy = false;

  const drawFish = () => {
    const n = Math.round(st.fish / 4);
    if (fishG.children.length === n) return;
    fishG.innerHTML = Array.from({ length: n }, (_, i) => {
      const a = (i * 137.5) % 360, rr = .25 + ((i * 53) % 60) / 100, x = 330 + Math.cos(a * Math.PI / 180) * 170 * rr, y = 190 + Math.sin(a * Math.PI / 180) * 85 * rr;
      return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><g class="ik-f" style="--d:${(5 + i % 5).toFixed(0)}s;--del:-${(i * .7 % 5).toFixed(1)}s;--sx:${i % 2 ? -1 : 1}"><path d="M-9 0 Q-2 -6 7 0 Q-2 6 -9 0 Z M7 0 L13 -5 L13 5 Z"/></g></g>`;
    }).join('');
  };
  const drawChart = () => {
    const h = st.hist, X = i => 22 + i / YEARS * 270, Y = v => 104 - v / K * 92;
    let s = `<line class="ik-c-ax" x1="22" x2="292" y1="104" y2="104"/><text class="ik-c-t" x="18" y="${Y(K) + 3}">${K}</text><text class="ik-c-t" x="18" y="107">0</text>`;
    s += `<rect class="ik-c-band" x="22" y="${Y(90)}" width="270" height="${Y(40) - Y(90)}"/>`;
    h.forEach((p, i) => { if (i) s += `<rect class="ik-c-bar" x="${X(i) - 6}" y="${Y(p.catch)}" width="12" height="${104 - Y(p.catch)}" rx="2"/>`; });
    s += `<polyline class="ik-c-line" points="${h.map((p, i) => `${X(i)},${Y(p.fish)}`).join(' ')}"/>`;
    h.forEach((p, i) => { s += `<circle class="ik-c-pt" cx="${X(i)}" cy="${Y(p.fish)}" r="${i === h.length - 1 ? 4 : 2.5}"/>`; });
    s += `<text class="ik-c-l" x="292" y="12">— 池の魚　■ 4 人がとった数</text>`;
    chart.innerHTML = s;
  };
  const showTake = () => { Kq('take').textContent = take; };
  const reset = () => {
    st = { y: 1, fish: START, tot: [0, 0, 0, 0], last: [0, 0, 0, 0], hist: [{ fish: START, catch: 0 }], dead: false };
    take = rule ? Math.min(take, CAP) : take; showTake();
    Kq('year').textContent = 1; Kq('fish').textContent = START;
    box.querySelectorAll('[data-y]').forEach(t => t.textContent = '—'); box.querySelectorAll('[data-t]').forEach(t => t.textContent = 0);
    svg.querySelectorAll('[data-b]').forEach(t => t.textContent = 0);
    stage.classList.remove('is-dead', 'is-done'); box.classList.remove('is-done');
    result.hidden = true; result.innerHTML = '';
    box.querySelector('[data-a="go"]').textContent = '釣りに行く';
    msg.textContent = rule ? `漁獲枠のルールあり。1 人 ${CAP} 匹まで。今年は何匹とりますか？` : '今年、あなたは何匹とりますか？ ほかの 3 人も、それぞれ決めます。';
    drawFish(); drawChart();
  };
  const say = (i, t) => { const g = men[i].querySelector('.ik-say'); g.querySelector('text').textContent = t; g.classList.remove('is-on'); void g.getBBox(); g.classList.add('is-on'); };

  const year = async () => {
    if (busy) return;
    if (st.y > YEARS || st.dead) { reset(); return; }
    busy = true; box.classList.add('is-busy');
    let want = [take, plan(1, st), plan(2, st), plan(3, st)];
    if (rule) want = want.map(v => Math.min(CAP, v));
    want.forEach((v, i) => { if (i) say(i, `${v} 匹`); });
    men.forEach(m => m.classList.add('is-cast'));
    await sleep(900);
    // 池にいる数より多くはとれない（順番はばらばら）
    const got = [0, 0, 0, 0]; let left = Math.floor(st.fish);
    const order = [0, 1, 2, 3].sort(() => Math.random() - .5);
    for (let r = 0; r < 12 && left > 0; r++) order.forEach(i => { if (got[i] < want[i] && left > 0) { got[i]++; left--; } });
    // 魚が池からかごへ飛ぶ
    if (!reduce) {
      catchG.innerHTML = got.map((g, i) => Array.from({ length: g }, (_, j) => { const [x, y] = WHO[i][2]; return `<g class="ik-jump" style="--tx:${x}px;--ty:${y}px;--sx:${(240 + (j * 37) % 180)}px;--sy:${(150 + (j * 23) % 80)}px;--del:${(j * .12 + i * .05).toFixed(2)}s"><path d="M-8 0 Q-2 -5 6 0 Q-2 5 -8 0 Z M6 0 L11 -4 L11 4 Z"/></g>`; }).join('')).join('');
    }
    await sleep(1300);
    catchG.innerHTML = ''; men.forEach(m => m.classList.remove('is-cast'));
    const sum = got.reduce((a, b) => a + b, 0);
    st.fish = left; st.last = got.slice();
    got.forEach((g, i) => { st.tot[i] += g; box.querySelector(`[data-y="${i}"]`).textContent = g + (g < want[i] ? `（${want[i]} のはず）` : ''); box.querySelector(`[data-t="${i}"]`).textContent = st.tot[i]; svg.querySelector(`[data-b="${i}"]`).textContent = st.tot[i]; });
    Kq('fish').textContent = Math.round(st.fish); drawFish();
    msg.textContent = `4 人で ${sum} 匹とりました。池に残ったのは ${Math.round(st.fish)} 匹。`;
    await sleep(900);
    // 冬のあいだに魚がふえる
    const before = st.fish; st.fish = st.fish < 2 ? 0 : Math.min(K, grow(st.fish));
    st.hist.push({ fish: st.fish, catch: sum });
    Kq('fish').textContent = Math.round(st.fish); drawFish(); drawChart();
    const plus = Math.round(st.fish - before);
    msg.textContent = st.fish < 2 ? '池の魚がいなくなりました。もう、だれもとれません。' : `冬のあいだに、魚が ${plus} 匹ふえて ${Math.round(st.fish)} 匹に。${st.fish < 40 ? '池の魚が少なくなっています。' : ''}`;
    if (st.fish < 2) { st.dead = true; stage.classList.add('is-dead'); }
    st.y++;
    busy = false; box.classList.remove('is-busy');
    if (st.y > YEARS || st.dead) finish(); else Kq('year').textContent = st.y;
  };

  const finish = () => {
    stage.classList.add('is-done'); box.classList.add('is-done');
    const total = st.tot.reduce((a, b) => a + b, 0), you = st.tot[0];
    // くらべる：みんなが 3 匹ずつなら
    let f = START, fair = 0; for (let y = 0; y < YEARS; y++) { const c = Math.min(12, Math.floor(f)); fair += c; f = grow(f - c); }
    const head = st.dead ? `${st.y - 1} 年目で、池が空っぽに` : st.fish >= 60 ? '池は、豊かなまま' : '池は、なんとか残った';
    let body = `${st.dead ? st.y - 1 : 10} 年で、あなたは ${you} 匹、4 人では ${total} 匹とりました。池に残った魚は ${Math.round(st.fish)} 匹です。`;
    body += ` もし 4 人とも毎年 3 匹ずつにしていたら、合計 ${fair} 匹（1 人 ${fair / 4} 匹）とれて、池には ${Math.round(f)} 匹残っていました。`;
    if (st.dead) body += ' とりすぎた年のつけが、あとの年に回ってきました。池が空っぽになったので、この先はだれも 1 匹もとれません。3 匹ずつなら、この先もずっと、毎年 4 人で 12 匹ずつとり続けられます。';
    if (rule && !st.dead) body += ' ルールがあると、よくばりさんも 3 匹まで。池が守られました。';
    if (!rule) body += ' 「漁獲枠のルールを入れる」にして、もう一度くらべてみよう。';
    result.innerHTML = `<span class="ik-r-seal" aria-hidden="true">${st.dead ? '涸' : '池'}</span><div><p class="ik-r-h">${head}</p><p>${body}</p><ul class="ik-r-nums"><li><small>あなた</small><b>${you} 匹</b></li><li><small>4 人の合計</small><b>${total} 匹</b></li><li><small>3 匹ずつなら（合計）</small><b>${fair} 匹</b></li><li><small>池に残った魚</small><b>${Math.round(st.fish)} 匹</b></li></ul></div>`;
    result.hidden = false;
    box.querySelector('[data-a="go"]').textContent = 'もう一度（1 年目から）';
    try { localStorage.setItem('azakei_ike', String((+localStorage.getItem('azakei_ike') || 0) + 1)); if (!st.dead && total > (+localStorage.getItem('azakei_ike_best') || 0)) localStorage.setItem('azakei_ike_best', String(total)); } catch (e) {}
    window.AZAKEI_TALK && window.AZAKEI_TALK(result.querySelector(':scope > div') || result, 'ike', st.dead ? 'low' : total >= fair ? 'top' : 'mid');
  };

  box.addEventListener('click', e => {
    const d = e.target.closest('[data-d]');
    if (d && !busy) { take = Math.max(0, Math.min(rule ? CAP : 10, take + +d.dataset.d)); showTake(); return; }
    if (e.target.closest('[data-a="go"]')) year();
  });
  box.querySelector('[data-rule]').addEventListener('change', e => { rule = e.target.checked; reset(); });
  reset();
})();
