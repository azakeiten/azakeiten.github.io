/* ================================================================
   crossword.js — 経済クロスワード（Web 版。文化祭の会場の問題とは別に作った問題）
   ・遊ぶたびに盤が変わる：約 50 語の経済のことばから、10〜12 語を組み合わせて、その場で盤をつくる
     「今日の問題」は日付から決まる（同じ日なら、だれでも同じ盤）。「新しい問題」は毎回ちがう盤
   ・カギを選んで、ひらがなかカタカナで答える（小さい字は大きい字で入れる）
   ・チップ 10 枚から。正解 +2・まちがい −1・1 文字ヒント −1
   ・全部うめたら、二重マスの文字をならべて最後の問題（+5）。答えは盤ごとにちがう
   ・記録はこのブラウザの中だけ（とちゅう azakei_cw2・自己ベスト azakei_cw_best・解いた日 azakei_cw_days）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-cw]');
  if (!box) return;
  const START = 10, KEY = 'azakei_cw2', BEST = 'azakei_cw_best', DAYS = 'azakei_cw_days';
  // ── ことばの山（答えは大きいカタカナ。小さい字は大きい字で）[答え, 漢字, カギ, 読み（小さい字のあるものだけ）]
  const POOL = [
    ['カワセ', '為替', '円をドルにかえるときの比率は「○○レート」。ニュースで毎日のように聞く言葉。'],
    ['ヨキン', '預金', '銀行にお金をあずけること。また、あずけたお金。'],
    ['カブシキ', '株式', '会社がお金を集めるために発行するもの。持つと、その会社の持ち主のひとりになる。'],
    ['サイケン', '債券', '国や会社がお金を借りるときに発行する証書。決まった日に、利子をつけて返す約束。'],
    ['ヤチン', '家賃', '部屋や家を借りている人が、毎月はらうお金。'],
    ['リスク', 'リスク', '結果がどうなるか分からないこと。投資では、もうけや損の「ぶれ」の大きさ。'],
    ['デフレ', 'デフレ', '物の値段が全体として下がり続けること。インフレの反対。'],
    ['シヨウヒ', '消費', '物やサービスを買って使うこと。「○○税」は買い物のときにかかる税金。', 'しょうひ'],
    ['エンダカ', '円高', '円の価値が上がること。1 ドル 150 円が 120 円になるような動き。海外旅行が安くなる。'],
    ['エンヤス', '円安', '円の価値が下がること。1 ドル 120 円が 150 円になるような動き。輸入品が高くなる。'],
    ['カブヌシ', '株主', '株式を持っている人。会社のもうけから、配当を受け取れることがある。'],
    ['ブンサン', '分散', '「卵をひとつのかごに盛るな」。いろいろなものに分けて投資し、リスクをおさえること。'],
    ['ケイヤク', '契約', '売る・買う・借りるなどの約束を、おたがいに取り決めること。'],
    ['インフレ', 'インフレ', '物の値段が全体として上がり続け、お金の価値が下がること。'],
    ['キンリ', '金利', 'お金を借りたときの「借り賃」の割合。日本銀行が決める「政策○○」も。'],
    ['ゼイキン', '税金', '国や市などが、道路や学校などのために集めるお金。'],
    ['ヨサン', '予算', 'これからの収入と支出の計画。国の「○○」は国会で決める。'],
    ['リソク', '利息', '預金や借金で、元のお金とは別に受け取ったりはらったりするお金。'],
    ['ハイトウ', '配当', '会社がもうけの一部を、株主に分けて配ること。'],
    ['カケイ', '家計', '家庭のお金のやりくり。「○○簿」に収入と支出を書く。'],
    ['キギヨウ', '企業', '物やサービスをつくって売り、もうけを出そうとする組織。会社など。', 'きぎょう'],
    ['ギンコウ', '銀行', 'お金をあずかったり、貸したりする金融機関。'],
    ['ネダン', '値段', '物やサービスを買うときに、はらうお金の額。'],
    ['ウリアゲ', '売上', '商品やサービスを売って入ってきたお金の合計。'],
    ['リエキ', '利益', '売上から、かかった費用を引いた「もうけ」。'],
    ['ボウエキ', '貿易', '国と国とのあいだで、物やサービスを売り買いすること。'],
    ['ユシユツ', '輸出', '自分の国の物を、外国に売ること。', 'ゆしゅつ'],
    ['ユニユウ', '輸入', '外国の物を、自分の国に買い入れること。', 'ゆにゅう'],
    ['カンゼイ', '関税', '外国から入ってくる品物にかける税金。'],
    ['ネンキン', '年金', '年をとったときなどに、毎年（毎月）受け取れるお金。'],
    ['ホケン', '保険', 'みんなで少しずつお金を出し合い、事故や病気にあった人を助けるしくみ。'],
    ['トウシ', '投資', 'お金をふやすために、株や事業などにお金を出すこと。'],
    ['チヨキン', '貯金', 'お金をためること。また、ためたお金。', 'ちょきん'],
    ['シヨトク', '所得', '働いたり、商売をしたりして得たお金。税金を決めるもとになる。', 'しょとく'],
    ['ケイキ', '景気', '世の中のお金の勢い。「○○がいい」「○○が悪い」と使う。'],
    ['ジユヨウ', '需要', 'ある値段で、物を買いたいと思う量。', 'じゅよう'],
    ['キヨウキユウ', '供給', 'ある値段で、物を売りたいと思う量。', 'きょうきゅう'],
    ['シジヨウ', '市場', '物やサービスが売り買いされる場。「株式○○」。', 'しじょう'],
    ['ブツカ', '物価', 'いろいろな物の値段を、全体としてみたもの。'],
    ['ゲンカ', '原価', '商品をつくったり仕入れたりするのに、かかったお金。'],
    ['シサン', '資産', '持っている財産。お金や土地、株など。'],
    ['フサイ', '負債', '借りていて、これから返さなければならないお金。'],
    ['カブカ', '株価', '株式の値段。人気があると上がり、なくなると下がる。'],
    ['ツウカ', '通貨', 'その国で使われているお金。円やドル、ユーロなど。'],
    ['シヘイ', '紙幣', '紙でできたお金。お札。日本では日本銀行が発行する。'],
    ['コウカ', '硬貨', '金属でできたお金。日本では国（政府）が発行する。'],
    ['ザイセイ', '財政', '国や市などが、税金を集めて使うお金のやりくり。'],
    ['キンユウ', '金融', 'お金が足りない人と、余っている人のあいだで、お金を融通すること。'],
    ['サイフ', '財布', 'お金を入れて持ち歩くもの。「○○のひもをしめる」は節約すること。'],
    ['ヒヨウ', '費用', '何かをするのにかかるお金。', 'ひよう'],
    ['テスウリヨウ', '手数料', 'お金をおろしたり、送ったりするときにはらう料金。', 'てすうりょう'],
    ['シヤツキン', '借金', 'お金を借りること。また、借りたお金。', 'しゃっきん']
  ];
  // 最後の問題（二重マスの文字をならべる）。盤の中に文字がそろうものから 1 つ
  const FINALS = [['ケイキ', '景気', '世の中のお金の勢いをあらわす言葉に。「○○がいい」「○○が悪い」と使います。'], ['ツウカ', '通貨', 'その国で使われているお金をあらわす言葉に。円もドルもこれです。'], ['ブツカ', '物価', 'いろいろな物の値段を全体としてみた言葉に。「○○が上がる」と使います。'], ['リシ', '利子', 'お金を借りたときの「借り賃」をあらわす言葉に。'], ['カネ', '金', 'これがないと、ふつうは買い物ができません。'], ['ゼイ', '税', '国や市が集めるお金をあらわす、1 字の言葉に。']];
  // 種から決まる乱数（同じ日なら、だれでも同じ問題）
  const rng = seed => { let x = seed >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; };
  const build = seed => {
    for (let tryN = 0; tryN < 40; tryN++) {
      const R = rng(seed * 101 + tryN * 7919 + 1), SZ = 15, g = {}, words = [];
      const pool = POOL.map((p, i) => [p, R()]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
      const at = (r, c) => g[r + ',' + c];
      const fits = (a, r, c, d) => {
        const dr = d === 'D' ? 1 : 0, dc = d === 'A' ? 1 : 0, L = [...a].length; let cross = 0;
        if (r < 0 || c < 0 || r + dr * (L - 1) >= SZ || c + dc * (L - 1) >= SZ) return -1;
        if (at(r - dr, c - dc) || at(r + dr * L, c + dc * L)) return -1;
        for (let k = 0; k < L; k++) {
          const rr = r + dr * k, cc = c + dc * k, cell = at(rr, cc), ch = [...a][k];
          if (cell) { if (cell.ch !== ch || cell[d]) return -1; cross++; }
          else if (at(rr + dc, cc + dr) || at(rr - dc, cc - dr)) return -1;
        }
        return cross;
      };
      const put = (w, r, c, d) => { const dr = d === 'D' ? 1 : 0, dc = d === 'A' ? 1 : 0; [...w[0]].forEach((ch, k) => { const key = (r + dr * k) + ',' + (c + dc * k); g[key] = g[key] || { ch }; g[key][d] = true; }); words.push({ w, r, c, d }); };
      const first = pool.shift(); put(first, 7, Math.max(0, 7 - (first[0].length >> 1)), 'A');
      for (const w of pool) {
        if (words.length >= 12) break;
        let bestP = null;
        for (const key of Object.keys(g)) {
          const [r0, c0] = key.split(',').map(Number), chs = [...w[0]];
          chs.forEach((ch, k) => {
            if (g[key].ch !== ch) return;
            for (const d of ['A', 'D']) {
              const r = d === 'D' ? r0 - k : r0, c = d === 'A' ? c0 - k : c0, x = fits(w[0], r, c, d);
              if (x > 0) { const sc = x * 10 + R(); if (!bestP || sc > bestP.sc) bestP = { r, c, d, sc }; }
            }
          });
        }
        if (bestP) put(w, bestP.r, bestP.c, bestP.d);
      }
      if (words.length < 10) continue;
      const ks = Object.keys(g).map(k => k.split(',').map(Number));
      const r1 = Math.min(...ks.map(k => k[0])), r2 = Math.max(...ks.map(k => k[0])), c1 = Math.min(...ks.map(k => k[1])), c2 = Math.max(...ks.map(k => k[1]));
      const n = Math.max(r2 - r1, c2 - c1) + 1;
      if (n > 10) continue;
      // 番号：左上から順に
      const starts = words.map(x => [x.r - r1, x.c - c1]).map(([r, c]) => r * 100 + c);
      const nums = [...new Set(starts)].sort((a, b) => a - b);
      const W2 = words.map((x, i) => [nums.indexOf(starts[i]) + 1, x.d, x.r - r1, x.c - c1, x.w[0], x.w[1], x.w[2], x.w[3]]).sort((a, b) => (a[1] === b[1] ? a[0] - b[0] : a[1] === 'A' ? -1 : 1));
      // 最後の問題：文字が別々のマスにそろうもの
      const cells = Object.entries(g).map(([k, v]) => { const [r, c] = k.split(',').map(Number); return [r - r1, c - c1, v.ch]; });
      let fin = null, marks = null;
      for (const f of FINALS.map(x => [x, R()]).sort((a, b) => a[1] - b[1]).map(x => x[0])) {
        const used = [], ok = [...f[0]].every(ch => { const cand = cells.filter(([r, c, h]) => h === ch && !used.some(u => u[0] === r && u[1] === c)); if (!cand.length) return false; used.push(cand[Math.floor(R() * cand.length)]); return true; });
        if (ok) { fin = f; marks = used.map(([r, c]) => [r, c]); break; }
      }
      if (!fin) continue;
      return { W: W2, N: n, FINAL: fin[0], FINAL_K: fin[1], FINAL_T: fin[2], MARK: marks };
    }
    return null;
  };
  const SMALL = { ァ: 'ア', ィ: 'イ', ゥ: 'ウ', ェ: 'エ', ォ: 'オ', ッ: 'ツ', ャ: 'ヤ', ュ: 'ユ', ョ: 'ヨ', ヮ: 'ワ', ヵ: 'カ', ヶ: 'ケ' };
  const norm = s => (s || '').normalize('NFKC').replace(/[\s・、。]/g, '').replace(/[ぁ-ゖ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60)).replace(/[ァィゥェォッャュョヮヵヶ]/g, ch => SMALL[ch]);
  const jst = new Date(Date.now() + 9 * 3600e3), today = jst.getUTCFullYear() * 10000 + (jst.getUTCMonth() + 1) * 100 + jst.getUTCDate();
  const kana = s => s.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
  const init = seed => {
  const P = build(seed); if (!P) return;
  const W = P.W, N = P.N, MARK = P.MARK, FINAL = P.FINAL, FINAL_K = P.FINAL_K, ABC = 'ABCDE'.slice(0, MARK.length);
  const label = seed === today ? `${Math.floor(today / 100) % 100} 月 ${today % 100} 日の問題` : `新しい問題 No.${seed % 10000}`;
  const grid = {}; // 'r,c' → { ch, words: [i…], num }
  W.forEach(([n, d, r, c, a], i) => [...a].forEach((ch, k) => {
    const key = d === 'A' ? `${r},${c + k}` : `${r + k},${c}`;
    (grid[key] = grid[key] || { ch, words: [] }).words.push(i);
    if (k === 0) grid[key].num = n;
  }));
  const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && v.seed === seed ? v : null; } catch (e) { return null; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const fresh = () => ({ seed, solved: [], rev: [], chips: START, miss: 0, fin: false });
  let S = load() || fresh();
  let best = 0; try { best = +localStorage.getItem(BEST) || 0; } catch (e) {}
  let cur = W.findIndex((w, i) => !S.solved.includes(i)); if (cur < 0) cur = 0;
  const cellsOf = i => { const [, d, r, c, a] = W[i]; return [...a].map((_, k) => d === 'A' ? `${r},${c + k}` : `${r + k},${c}`); };
  const known = key => grid[key].words.some(i => S.solved.includes(i)) || S.rev.includes(key);
  const clueLi = (w, i) => `<li data-w="${i}"><button type="button"><b>${w[0]}</b><span>${w[6]}</span><em>${w[4].length} 文字</em><i class="cw-kanji">${w[5]}</i></button></li>`;
  box.innerHTML = `<div class="cw-main">
      <div class="cw-board" role="grid" aria-label="クロスワードの盤面（${N} × ${N}）"></div>
      <div class="cw-side">
        <div class="cw-pick"><p class="cw-label">${label}</p><button type="button" class="cw-today"${seed === today ? ' aria-pressed="true"' : ''}>今日の問題</button><button type="button" class="cw-new">新しい問題</button></div>
        <div class="cw-status"><span class="cn-coin sm" aria-hidden="true">¥</span><p>チップ <b data-chips></b> 枚</p><p class="cw-prog">うめた言葉 <b data-solved></b> / ${W.length}</p></div>
        <form class="cw-ask" autocomplete="off">
          <p class="cw-cur" aria-live="polite"></p>
          <div class="cw-row"><input type="text" lang="ja" enterkeyhint="done" aria-label="答え（ひらがなかカタカナ）" /><button type="submit" class="cw-go">答える</button></div>
          <div class="cw-row2"><button type="button" class="cw-hint">1 文字ヒント（チップ 1 枚）</button><span class="cw-msg" aria-live="polite"></span></div>
        </form>
        <div class="cw-final" hidden>
          <p class="cw-final-h">最後の問題</p>
          <p>二重マスの文字を <b>${[...ABC].join('・')}</b> の順にならべると、${P.FINAL_T}</p>
          <form class="cw-row cw-final-f" autocomplete="off"><input type="text" lang="ja" enterkeyhint="done" aria-label="最後の答え" placeholder="${FINAL.length} 文字" /><button type="submit" class="cw-go">答える</button></form>
          <p class="cw-msg2" aria-live="polite"></p>
        </div>
        <div class="cw-done" hidden aria-live="polite"></div>
      </div>
    </div>
    <div class="cw-clues">
      <div><p class="cw-clues-h">よこのカギ</p><ol>${W.map((w, i) => w[1] === 'A' ? clueLi(w, i) : '').join('')}</ol></div>
      <div><p class="cw-clues-h">たてのカギ</p><ol>${W.map((w, i) => w[1] === 'D' ? clueLi(w, i) : '').join('')}</ol></div>
    </div>`;
  const board = box.querySelector('.cw-board');
  let html = '';
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const g = grid[`${r},${c}`];
    const m = MARK.findIndex(([mr, mc]) => mr === r && mc === c);
    html += g ? `<button type="button" class="cw-cell${m >= 0 ? ' is-mark' : ''}" data-k="${r},${c}" style="--d:${(r + c) * 30}ms">${g.num ? `<small>${g.num}</small>` : ''}${m >= 0 ? `<i>${ABC[m]}</i>` : ''}<span></span></button>` : '<span class="cw-block" aria-hidden="true"></span>';
  }
  board.style.gridTemplateColumns = `repeat(${N}, minmax(0, 1fr))`;
  board.innerHTML = html;
  const $ = s => box.querySelector(s);
  const input = $('.cw-ask input'), msg = $('.cw-msg');
  const say = (t, cls) => { msg.textContent = t; msg.className = 'cw-msg' + (cls ? ' ' + cls : ''); };
  function paint(flash) {
    board.querySelectorAll('.cw-cell').forEach(b => {
      const k = b.dataset.k, g = grid[k];
      b.querySelector('span').textContent = known(k) ? g.ch : '';
      b.classList.toggle('is-ok', g.words.some(i => S.solved.includes(i)));
      b.classList.toggle('is-rev', !g.words.some(i => S.solved.includes(i)) && S.rev.includes(k));
      b.classList.toggle('is-sel', cellsOf(cur).includes(k));
      b.classList.toggle('is-flash', !!flash && cellsOf(flash.i).includes(k));
      b.setAttribute('aria-label', `${b.querySelector('small') ? b.querySelector('small').textContent + ' 番 ' : ''}${known(k) ? g.ch : '空欄'}`);
    });
    box.querySelectorAll('.cw-clues li').forEach(li => {
      const i = +li.dataset.w;
      li.classList.toggle('is-ok', S.solved.includes(i));
      li.classList.toggle('is-sel', i === cur);
    });
    $('[data-chips]').textContent = S.chips;
    $('[data-solved]').textContent = S.solved.length;
    const w = W[cur], all = S.solved.length === W.length;
    $('.cw-ask').hidden = all;
    if (!all) {
      const pattern = cellsOf(cur).map(k => known(k) ? grid[k].ch : '□').join('');
      $('.cw-cur').innerHTML = `<b>${w[0]} ${w[1] === 'A' ? 'よこ' : 'たて'}</b><span class="cw-pat">${pattern}</span><br>${w[6]}`;
      input.placeholder = `ひらがなで ${w[4].length} 文字`;
      $('.cw-hint').disabled = S.solved.includes(cur) || S.chips < 1;
    }
    $('.cw-final').hidden = !all || S.fin;
    const done = $('.cw-done');
    done.hidden = !S.fin;
    if (S.fin) {
      done.innerHTML = `<p class="cw-done-k">全問クリア</p><p class="cw-done-n"><b>${S.chips}</b> 枚</p>
        <p class="cw-done-s">まちがい ${S.miss} 回・ヒント ${S.rev.length} 文字${best ? `　自己ベスト ${best} 枚` : ''}</p>
        <p class="cw-done-w">最後の答えは「${FINAL_K}（${kana(FINAL)}）」。ほかの言葉の意味は、<a href="glossary.html">経済用語ミニ辞典</a>でも調べられます。</p>
        <button type="button" class="cn-next cw-again">新しい問題で、もう一度</button>`;
      done.querySelector('.cw-again').onclick = () => init(Math.floor(Math.random() * 1e9) + 1);
    }
  }
  function pick(i, focus) {
    cur = i; paint(); say('');
    if (focus !== false && !S.solved.includes(i) && matchMedia('(hover: hover)').matches) input.focus({ preventScroll: true });
  }
  board.addEventListener('click', e => {
    const b = e.target.closest('.cw-cell'); if (!b) return;
    const ws = grid[b.dataset.k].words;
    // 同じマスをもう一度押すと、たて・よこを切りかえる
    const i = ws.length > 1 && ws.includes(cur) ? ws.find(x => x !== cur) : ws.find(x => !S.solved.includes(x)) ?? ws[0];
    pick(i);
  });
  box.querySelectorAll('.cw-clues li').forEach(li => li.addEventListener('click', () => {
    pick(+li.dataset.w);
    if (!matchMedia('(min-width: 900px)').matches) $('.cw-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  $('.cw-ask').addEventListener('submit', e => {
    e.preventDefault();
    if (S.solved.includes(cur)) return;
    const w = W[cur], v = norm(input.value);
    if (!v) return say('答えを入れてください');
    if ([...v].length !== w[4].length) return say(`${w[4].length} 文字で答えてね`);
    if (v === w[4]) {
      S.solved.push(cur); S.chips += 2; save();
      const done = cur; input.value = '';
      const next = W.findIndex((x, i) => i > done && !S.solved.includes(i));
      const nxt = next >= 0 ? next : W.findIndex((x, i) => !S.solved.includes(i));
      if (nxt >= 0) cur = nxt;
      paint({ i: done }); say(`正解！ ${w[5]}${w[5] === w[4] ? "" : `（${w[7] || kana(w[4])}）`}　チップ +2`, "ok");
      if (S.solved.length === W.length) setTimeout(() => $('.cw-final input').focus({ preventScroll: true }), 300);
    } else {
      S.chips = Math.max(0, S.chips - 1); S.miss++; save(); paint();
      say('ちがうみたい。チップ −1', 'ng');
      const f = $('.cw-ask'); f.classList.remove('is-shake'); void f.offsetWidth; f.classList.add('is-shake');
    }
  });
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && e.isComposing) e.stopPropagation(); });
  $('.cw-hint').addEventListener('click', () => {
    if (S.chips < 1 || S.solved.includes(cur)) return;
    const k = cellsOf(cur).find(x => !known(x)); if (!k) return say('もう全部の文字が見えています');
    S.rev.push(k); S.chips--; save(); paint(); say('1 文字あけました。チップ −1');
  });
  $('.cw-final-f').addEventListener('submit', e => {
    e.preventDefault();
    const v = norm($('.cw-final input').value), m = $('.cw-msg2');
    if (v === FINAL || v === FINAL_K) {
      S.chips += 5; S.fin = true; if (seed === today) { try { const d = JSON.parse(localStorage.getItem(DAYS) || '[]'); if (!d.includes(today)) { d.push(today); localStorage.setItem(DAYS, JSON.stringify(d.slice(-60))); } } catch (er) {} }
      if (S.chips > best) { best = S.chips; try { localStorage.setItem(BEST, best); } catch (er) {} }
      save(); paint();
    } else m.textContent = `おしい。${[...ABC].join('・')} のマスの文字を、もう一度見てみよう`;
  });
  paint();
  box.querySelector('.cw-today').onclick = () => init(today);
  box.querySelector('.cw-new').onclick = () => init(Math.floor(Math.random() * 1e9) + 1);
  };
  let saved = null; try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  init(saved && saved.seed && !saved.fin ? saved.seed : today);
})();
