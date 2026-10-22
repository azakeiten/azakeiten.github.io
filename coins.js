/* ================================================================
   coins.js — クイズ：世界のお金図鑑（この国のお金は？ 4 択で、コインを集める）
   ・正解した通貨のコインが、図鑑に金色で入る（記録はこのブラウザの中だけ）
   ・12 枚ぜんぶ集めると、バッジ「世界のお金博士」
   ================================================================ */
(function() {
  const box = document.querySelector('[data-coins]');
  if (!box) return;
  const KEY = 'azakei_coins';
  // [記号, 通貨の名前, 国・地域, ひとこと]
  const C = [
    ['$', '米ドル', 'アメリカ', '世界の貿易や外国為替で、いちばん多く使われているお金。'],
    ['€', 'ユーロ', 'ドイツ・フランスなど', 'EU（ヨーロッパ連合）の多くの国で使われている共通のお金。'],
    ['£', 'ポンド', 'イギリス', '今も使われているお金の中では、とても長い歴史をもつお金。'],
    ['元', '人民元', '中国', 'お札には、毛沢東の肖像が描かれている。'],
    ['₩', 'ウォン', '韓国', 'ケタが大きく、いちばん小さいお札が 1,000 ウォン札。'],
    ['₹', 'ルピー', 'インド', '記号 ₹ は、2010 年に公募で決まった比較的新しい記号。'],
    ['฿', 'バーツ', 'タイ', 'お札には、タイの国王の肖像が描かれている。'],
    ['A$', 'オーストラリア・ドル', 'オーストラリア', 'お札はプラスチック（ポリマー）製で、水にぬれても破れにくい。'],
    ['Fr', 'スイス・フラン', 'スイス', 'スイスは EU に入っておらず、ユーロではなく自分の国のお金を使う。'],
    ['R$', 'レアル', 'ブラジル', '南アメリカでいちばん人口の多い国のお金。'],
    ['₫', 'ドン', 'ベトナム', 'ケタがとても大きく、10 万ドン札や 50 万ドン札もある。'],
    ['¥', '円', '日本', 'お札は日本銀行、硬貨は国（政府）が発行している。']
  ];
  let got = []; try { got = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) {}
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  box.innerHTML = `<div class="cn-play" aria-live="polite"></div><div class="cn-book"><p class="cn-book-h">コイン図鑑<small data-n></small></p><ul class="cn-grid"></ul></div>`;
  const play = box.querySelector('.cn-play'), grid = box.querySelector('.cn-grid');
  const drawBook = fresh => {
    grid.innerHTML = C.map(([s, name, land], i) => {
      const has = got.includes(i);
      return `<li class="${has ? 'is-got' : ''}${fresh === i ? ' is-new' : ''}"><span class="cn-coin" aria-hidden="true">${has ? s : '?'}</span><b>${has ? name : '？？？'}</b><small>${has ? land : 'まだ'}</small></li>`;
    }).join('');
    box.querySelector('[data-n]').textContent = `${got.length} / ${C.length}`;
  };
  let order = [], idx = 0, score = 0;
  const start = () => {
    // まだ集めていないコインを先に出す
    order = shuffle(C.map((_, i) => i).filter(i => !got.includes(i))).concat(shuffle(C.map((_, i) => i).filter(i => got.includes(i)))).slice(0, 6);
    idx = 0; score = 0; ask();
  };
  const ask = () => {
    if (idx >= order.length) {
      play.innerHTML = `<p class="cn-q-h">結果 <b>${score}</b> / ${order.length}</p>${window.AZAKEI_OSATSU ? AZAKEI_OSATSU(got.length >= C.length ? '図鑑がうまった！ 世界のお金博士だね。旅行やニュースで見かけたら、思い出してみて。' : `図鑑はあと ${C.length - got.length} 枚。もう一度やると、まだのコインから出るよ！`, got.length >= C.length ? 'happy' : '') : ''}<button type="button" class="btn-primary cn-again">もう一度</button>`;
      play.querySelector('.cn-again').addEventListener('click', start);
      return;
    }
    const i = order[idx], [, name, land] = C[i];
    const opts = shuffle([i].concat(shuffle(C.map((_, k) => k).filter(k => k !== i)).slice(0, 3)));
    play.innerHTML = `<p class="cn-q-h">第 ${idx + 1} 問 / ${order.length}</p><p class="cn-q"><span>${land}</span>のお金は？</p>
      <div class="cn-opts">${opts.map(k => `<button type="button" data-k="${k}"><span class="cn-coin sm" aria-hidden="true">${C[k][0]}</span>${C[k][1]}</button>`).join('')}</div><div class="cn-fb"></div>`;
    const bs = [...play.querySelectorAll('.cn-opts button')];
    bs.forEach(b => b.addEventListener('click', () => {
      if (bs[0].disabled) return;
      const ok = +b.dataset.k === i;
      bs.forEach(x => { x.disabled = true; if (+x.dataset.k === i) x.classList.add('is-right'); });
      if (!ok) b.classList.add('is-wrong');
      let fresh = null;
      if (ok) { score++; if (!got.includes(i)) { got.push(i); fresh = i; try { localStorage.setItem(KEY, JSON.stringify(got)); } catch (e) {} } }
      drawBook(fresh);
      play.querySelector('.cn-fb').innerHTML = `<p class="${ok ? 'ok' : 'ng'}">${ok ? (fresh !== null ? '正解！ 図鑑に新しいコインが入りました。' : '正解！') : `残念…… ${land}のお金は「${name}」。`}</p><p>${C[i][3]}</p><button type="button" class="cn-next">${idx + 1 < order.length ? '次へ' : '結果を見る'}</button>`;
      play.querySelector('.cn-next').addEventListener('click', () => { idx++; ask(); });
      if (fresh !== null && window.AZAKEI_CHECK_BADGES) setTimeout(AZAKEI_CHECK_BADGES, 500);
    }));
  };
  drawBook();
  start();
})();
