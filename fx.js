/* ================================================================
   fx.js — 経済ラボ：円高・円安の両替所
   ・レート（1 ドル = 何円）を動かすと、海外のもの・日本のものの値段が変わる
   ・最後に 3 問。全問正解で「為替マスター」（このブラウザの中にだけ記録）
   ================================================================ */
(function() {
  const box = document.querySelector('[data-fx]');
  if (!box) return;
  const KEY = 'azakei_fx_master';
  const BASE = 150;
  // 値段はすべて、しくみを見るための「たとえ」
  const US = [['ハンバーガー', 8, 'アメリカのお店で'], ['ゲームソフト', 60, '海外のネットで'], ['ホテル 1 泊', 200, 'ニューヨーク旅行で']];
  const JP = [['おにぎり', 200, '日本のコンビニで'], ['ラーメン', 1000, '旅行で来た人が'], ['日本の車', 3000000, 'アメリカで売ると']];
  const yen = n => Math.round(n).toLocaleString('ja-JP');
  const usd = n => n >= 1000 ? Math.round(n).toLocaleString('en-US') : (Math.round(n * 100) / 100).toFixed(2);
  box.innerHTML = `
    <div class="fx-board">
      <p class="fx-rate-label">1 ドル ＝</p>
      <p class="fx-rate"><b data-fx-rate>${BASE}</b><small>円</small></p>
      <p class="fx-tag" data-fx-tag></p>
      <input type="range" min="80" max="200" step="1" value="${BASE}" aria-label="1 ドルが何円か" data-fx-range>
      <div class="fx-ends"><span>← 円高<small>1 ドルが安く買える</small></span><span>円安 →<small>1 ドルが高くなる</small></span></div>
    </div>
    <div class="fx-cols">
      <div class="fx-col"><p class="fx-col-h"><span class="fx-flag is-us" aria-hidden="true">$</span>海外のものを、円で買うと</p><ul data-fx-us></ul></div>
      <div class="fx-col"><p class="fx-col-h"><span class="fx-flag is-jp" aria-hidden="true">円</span>日本のものを、ドルで買うと</p><ul data-fx-jp></ul></div>
    </div>
    <p class="fx-note" data-fx-note aria-live="polite"></p>
    <div class="fx-quiz" data-fx-quiz></div>`;
  const range = box.querySelector('[data-fx-range]'), rateEl = box.querySelector('[data-fx-rate]'), tag = box.querySelector('[data-fx-tag]'), note = box.querySelector('[data-fx-note]');
  const usL = box.querySelector('[data-fx-us]'), jpL = box.querySelector('[data-fx-jp]');
  const row = (name, where, val, unit, diff) => `<li><span class="fx-item"><b>${name}</b><small>${where}</small></span><span class="fx-price"><b>${val}</b><small>${unit}</small>${diff ? `<i class="${diff > 0 ? 'up' : 'down'}">${diff > 0 ? '▲ 高く' : '▼ 安く'}</i>` : ''}</span></li>`;
  const draw = () => {
    const r = +range.value, d = r - BASE;
    rateEl.textContent = r;
    tag.textContent = d === 0 ? 'はじめのレート' : d < 0 ? `円高（はじめより ${-d} 円、円の力が強い）` : `円安（はじめより ${d} 円、円の力が弱い）`;
    tag.className = 'fx-tag' + (d < 0 ? ' is-high' : d > 0 ? ' is-low' : '');
    usL.innerHTML = US.map(([n, p, w]) => row(n, `${w} ${p} ドル`, yen(p * r), '円', Math.sign(d))).join('');
    jpL.innerHTML = JP.map(([n, p, w]) => row(n, `${w} ${yen(p)} 円`, usd(p / r), 'ドル', -Math.sign(d))).join('');
    note.innerHTML = d === 0 ? 'つまみを左右に動かしてみよう。' : d < 0
      ? '<b>円高</b>のときは、海外のものが<b>安く</b>買える。そのかわり、日本のものは海外の人から見ると<b>高く</b>なる。'
      : '<b>円安</b>のときは、海外のものが<b>高く</b>なる。そのかわり、日本のものは海外の人から見ると<b>安く</b>なって、売れやすくなる。';
  };
  range.addEventListener('input', draw);
  draw();

  // ---- 3 問チャレンジ ----
  const Q = [
    ['円安のとき、得をしやすいのはどっち？', ['日本に旅行に来る、海外の人', '海外に旅行する、日本の人'], 0, '円安だと、ドルを円に替えたときにたくさんの円になる。だから日本での買い物が、海外の人には安く感じられる。'],
    ['車を海外に売っている日本の会社。うれしいのはどっち？', ['円高', '円安'], 1, '円安だと、同じ車でもドルでの値段が安くなって売れやすい。売れたドルを円に替えると、円も多くなる。'],
    ['海外から小麦を買って、パンを作るお店。うれしいのはどっち？', ['円高', '円安'], 0, '円高だと、海外の小麦を少ない円で買える。材料が安くなるので、パンの値段を上げずにすみやすい。']
  ];
  const qBox = box.querySelector('[data-fx-quiz]');
  let qi = 0, ok = 0;
  const ask = () => {
    if (qi >= Q.length) {
      const all = ok === Q.length;
      if (all) { try { localStorage.setItem(KEY, '1'); } catch (e) {} }
      qBox.innerHTML = `<p class="fx-q-h">結果 <b>${ok}</b> / ${Q.length}</p>${window.AZAKEI_OSATSU ? AZAKEI_OSATSU(all ? '全問正解！「為替マスター」のバッジだよ。ニュースで「円安」と聞いたら、だれが得するか考えてみて。' : 'おしい！ 上のつまみを動かして、もう一度たしかめてみよう。', all ? 'happy' : '') : ''}<button type="button" class="fx-again">もう一度</button>`;
      qBox.querySelector('.fx-again').addEventListener('click', () => { qi = 0; ok = 0; ask(); });
      return;
    }
    const [q, a, right, why] = Q[qi];
    qBox.innerHTML = `<p class="fx-q-h">チャレンジ ${qi + 1} / ${Q.length}</p><p class="fx-q">${q}</p><div class="fx-q-a">${a.map((t, i) => `<button type="button" data-i="${i}">${t}</button>`).join('')}</div><div class="fx-q-fb" aria-live="polite"></div>`;
    const bs = [...qBox.querySelectorAll('.fx-q-a button')];
    bs.forEach(b => b.addEventListener('click', () => {
      if (bs[0].disabled) return;
      const good = +b.dataset.i === right; if (good) ok++;
      bs.forEach((x, i) => { x.disabled = true; if (i === right) x.classList.add('is-right'); });
      if (!good) b.classList.add('is-wrong');
      qBox.querySelector('.fx-q-fb').innerHTML = `<p class="${good ? 'ok' : 'ng'}">${good ? '正解！' : '残念……'}</p><p>${why}</p><button type="button" class="fx-next">${qi + 1 < Q.length ? '次へ' : '結果を見る'}</button>`;
      qBox.querySelector('.fx-next').addEventListener('click', () => { qi++; ask(); });
    }));
  };
  ask();
})();
