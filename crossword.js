/* ================================================================
   crossword.js — 経済クロスワード（Web 版。文化祭の会場の問題とは別に作った問題）
   ・カギを選んで、ひらがなかカタカナで答える（小さい字は大きい字で入れる）
   ・チップ 10 枚から。正解 +2・まちがい −1・1 文字ヒント −1
   ・14 語をうめたら、二重マスの 3 文字で最後の問題（+5）
   ・記録はこのブラウザの中だけ（azakei_cw / azakei_cw_best）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-cw]');
  if (!box) return;
  const N = 8, START = 10, KEY = 'azakei_cw', BEST = 'azakei_cw_best';
  // [番号, 向き(A=よこ / D=たて), 行, 列, 答え, 漢字, カギ]
  const W = [
    [3, 'A', 0, 5, 'カワセ', '為替', '円をドルにかえるときの比率は「○○レート」。ニュースで毎日のように聞く言葉。'],
    [4, 'A', 1, 1, 'ヨキン', '預金', '銀行にお金をあずけること。また、あずけたお金。'],
    [5, 'A', 3, 3, 'カブシキ', '株式', '会社がお金を集めるために発行するもの。持つと、その会社の持ち主のひとりになる。'],
    [10, 'A', 5, 4, 'サイケン', '債券', '国や会社がお金を借りるときに発行する証書。決まった日に、利子をつけて返す約束。'],
    [11, 'A', 6, 2, 'ヤチン', '家賃', '部屋や家を借りている人が、毎月はらうお金。'],
    [12, 'A', 7, 0, 'リスク', 'リスク', '結果がどうなるか分からないこと。投資では、もうけや損の「ぶれ」の大きさ。'],
    [13, 'A', 7, 5, 'デフレ', 'デフレ', '物の値段が全体として下がり続けること。インフレの反対。'],
    [1, 'D', 0, 1, 'シヨウヒ', '消費', '物やサービスを買って使うこと。「○○税」は買い物のときにかかる税金。'],
    [2, 'D', 0, 3, 'エンダカ', '円高', '円の価値が上がること。1 ドル 150 円が 120 円になるような動き。海外旅行が安くなる。'],
    [3, 'D', 0, 5, 'カブヌシ', '株主', '株式を持っている人。会社のもうけから、配当を受け取れることがある。'],
    [6, 'D', 3, 4, 'ブンサン', '分散', '「卵をひとつのかごに盛るな」。いろいろなものに分けて投資し、リスクをおさえること。'],
    [7, 'D', 4, 2, 'ケイヤク', '契約', '売る・買う・借りるなどの約束を、おたがいに取り決めること。'],
    [8, 'D', 4, 7, 'インフレ', 'インフレ', '物の値段が全体として上がり続け、お金の価値が下がること。'],
    [9, 'D', 5, 0, 'キンリ', '金利', 'お金を借りたときの「借り賃」の割合。日本銀行が決める「政策○○」も。']
  ];
  // 二重マス（A・B・C の順にならべると、最後の答え）
  const YOMI = { シヨウヒ: "しょうひ" };
  const MARK = [[5, 6], [4, 7], [3, 6]], FINAL = 'ケイキ', FINAL_K = '景気';
  const grid = {}; // 'r,c' → { ch, words: [i…], num }
  W.forEach(([n, d, r, c, a], i) => [...a].forEach((ch, k) => {
    const key = d === 'A' ? `${r},${c + k}` : `${r + k},${c}`;
    (grid[key] = grid[key] || { ch, words: [] }).words.push(i);
    if (k === 0) grid[key].num = n;
  }));
  const SMALL = { ァ: 'ア', ィ: 'イ', ゥ: 'ウ', ェ: 'エ', ォ: 'オ', ッ: 'ツ', ャ: 'ヤ', ュ: 'ユ', ョ: 'ヨ', ヮ: 'ワ', ヵ: 'カ', ヶ: 'ケ' };
  const norm = s => (s || '').normalize('NFKC').replace(/[\s・、。]/g, '').replace(/[ぁ-ゖ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60)).replace(/[ァィゥェォッャュョヮヵヶ]/g, ch => SMALL[ch]);
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const fresh = () => ({ solved: [], rev: [], chips: START, miss: 0, fin: false });
  let S = load() || fresh();
  let best = 0; try { best = +localStorage.getItem(BEST) || 0; } catch (e) {}
  let cur = W.findIndex((w, i) => !S.solved.includes(i)); if (cur < 0) cur = 0;
  const cellsOf = i => { const [, d, r, c, a] = W[i]; return [...a].map((_, k) => d === 'A' ? `${r},${c + k}` : `${r + k},${c}`); };
  const known = key => grid[key].words.some(i => S.solved.includes(i)) || S.rev.includes(key);
  const clueLi = (w, i) => `<li data-w="${i}"><button type="button"><b>${w[0]}</b><span>${w[6]}</span><em>${w[4].length} 文字</em><i class="cw-kanji">${w[5]}</i></button></li>`;
  box.innerHTML = `<div class="cw-main">
      <div class="cw-board" role="grid" aria-label="クロスワードの盤面（8 × 8）"></div>
      <div class="cw-side">
        <div class="cw-status"><span class="cn-coin sm" aria-hidden="true">¥</span><p>チップ <b data-chips></b> 枚</p><p class="cw-prog">うめた言葉 <b data-solved></b> / ${W.length}</p></div>
        <form class="cw-ask" autocomplete="off">
          <p class="cw-cur" aria-live="polite"></p>
          <div class="cw-row"><input type="text" lang="ja" enterkeyhint="done" aria-label="答え（ひらがなかカタカナ）" /><button type="submit" class="cw-go">答える</button></div>
          <div class="cw-row2"><button type="button" class="cw-hint">1 文字ヒント（チップ 1 枚）</button><span class="cw-msg" aria-live="polite"></span></div>
        </form>
        <div class="cw-final" hidden>
          <p class="cw-final-h">最後の問題</p>
          <p>二重マスの文字を <b>A・B・C</b> の順にならべると、世の中のお金の勢いをあらわす言葉に。「○○がいい」「○○が悪い」と使います。</p>
          <form class="cw-row cw-final-f" autocomplete="off"><input type="text" lang="ja" enterkeyhint="done" aria-label="最後の答え" placeholder="3 文字" /><button type="submit" class="cw-go">答える</button></form>
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
    html += g ? `<button type="button" class="cw-cell${m >= 0 ? ' is-mark' : ''}" data-k="${r},${c}" style="--d:${(r + c) * 30}ms">${g.num ? `<small>${g.num}</small>` : ''}${m >= 0 ? `<i>${'ABC'[m]}</i>` : ''}<span></span></button>` : '<span class="cw-block" aria-hidden="true"></span>';
  }
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
        <p class="cw-done-w">最後の答えは「${FINAL_K}（けいき）」。ほかの言葉の意味は、<a href="glossary.html">経済用語ミニ辞典</a>でも調べられます。</p>
        <button type="button" class="cn-next cw-again">もう一度、最初から</button>`;
      done.querySelector('.cw-again').onclick = () => { S = fresh(); cur = 0; save(); paint(); say(''); input.value = ''; };
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
      paint({ i: done }); say(`正解！ ${w[5]}${w[5] === w[4] ? "" : `（${YOMI[w[4]] || w[4].replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))}）`}　チップ +2`, "ok");
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
      S.chips += 5; S.fin = true;
      if (S.chips > best) { best = S.chips; try { localStorage.setItem(BEST, best); } catch (er) {} }
      save(); paint();
    } else m.textContent = 'おしい。A・B・C のマスの文字を、もう一度見てみよう';
  });
  paint();
})();
