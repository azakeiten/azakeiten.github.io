/* ================================================================
   okozukai.js — シミュレーター：おこづかい 12 か月チャレンジ
   ・毎月 3,000 円のおこづかい（1 月はお年玉も）。毎月のできごとに「使う／見送る」をえらぶ
   ・目標は、12 か月後に 30,000 円の自転車を買うこと。でも、楽しむこと（満足度）も大切
   ================================================================ */
(function() {
  const box = document.querySelector('[data-okozukai]');
  if (!box) return;
  const ALLOW = 3000, GOAL = 30000;
  // [月, できごと, 使うお金, 満足度, 必ず払う？]
  const EV = [
    ['4 月', '新学期。ちょっといいペンとノートをそろえる？', 1500, 1],
    ['5 月', '友だちにカラオケにさそわれた！', 1200, 2],
    ['6 月', 'かわいい傘を見つけた。梅雨だし、買う？', 2000, 1],
    ['7 月', '夏祭り。屋台を回りたい！', 2500, 3],
    ['8 月', '夏休み、友だちと少し遠くまでおでかけ。', 3500, 3],
    ['9 月', 'ずっと待っていたゲームの新作が発売！', 6000, 4],
    ['10 月', '文化祭の打ち上げに行く？', 1500, 2],
    ['11 月', '好きなマンガの新刊が 3 冊まとめて出た。', 1500, 1],
    ['12 月', '友だちの誕生日。プレゼントを買う？', 2000, 2],
    ['1 月', 'お年玉で 10,000 円もらった！ 半分使って遊ぶ？', 5000, 3, 'bonus'],
    ['2 月', 'スマホを落として、ケースが割れた……。', 2500, 0, 'must'],
    ['3 月', '春休み。友だちと旅行の計画が！', 4000, 3]
  ];
  const yen = n => n.toLocaleString('ja-JP') + ' 円';
  let m, money, joy, log;
  const say = (msg, mood) => window.AZAKEI_OSATSU ? AZAKEI_OSATSU(msg, mood) : `<p>${msg}</p>`;
  const bar = () => `<div class="oz-status"><p><span>貯金</span><b>${yen(money)}</b></p><p><span>満足度</span><b class="oz-joy">${'★'.repeat(Math.min(joy, 20)) || '－'}</b></p><p><span>目標まで</span><b>${money >= GOAL ? '達成！' : yen(GOAL - money)}</b></p></div><div class="oz-goal"><i style="width:${Math.min(100, money / GOAL * 100)}%"></i><span>目標：30,000 円の自転車</span></div>`;
  const start = () => { m = 0; money = 0; joy = 0; log = []; month(); };
  const month = () => {
    if (m >= EV.length) return finish();
    const [name, text, cost, j, type] = EV[m];
    money += ALLOW + (type === 'bonus' ? 10000 : 0);
    box.innerHTML = `<p class="oz-month"><b>${name}</b><small>${m + 1} / 12 か月目 ・ おこづかい +${yen(ALLOW)}${type === 'bonus' ? '、お年玉 +10,000 円' : ''}</small></p>${bar()}
      <div class="oz-event"><p>${text}</p><p class="oz-cost">${type === 'must' ? `修理代 ${yen(cost)}（払わないと、スマホが使いにくいまま）` : `${yen(cost)} ・ 満足度 ${'★'.repeat(j)}`}</p></div>
      <div class="oz-btns"><button type="button" class="oz-yes">${type === 'must' ? '払う' : '使う'}</button><button type="button" class="oz-no">${type === 'must' ? '払わずにがまん' : '見送る'}</button></div>`;
    box.querySelector('.oz-yes').addEventListener('click', () => {
      if (money < cost) { box.querySelector('.oz-event').insertAdjacentHTML('beforeend', '<p class="oz-warn">お金が足りない……。今回は見送るしかないね。</p>'); box.querySelector('.oz-yes').disabled = true; return; }
      money -= cost; joy += j; log.push([name, true]); m++; month();
    });
    box.querySelector('.oz-no').addEventListener('click', () => { if (type === 'must') joy = Math.max(0, joy - 2); log.push([name, false]); m++; month(); });
  };
  const finish = () => {
    const ok = money >= GOAL, happy = joy >= 12;
    const title = ok && happy ? 'やりくり名人' : ok ? 'がまんの達人' : happy ? '今を楽しむ人' : 'これからの人';
    if (ok && happy) { try { localStorage.setItem('azakei_ozk_master', '1'); } catch (e) {} }
    const msg = ok && happy ? '自転車も買えて、1 年も楽しめた！ 使うところと、がまんするところのメリハリが最高だね。'
      : ok ? '目標達成、おめでとう！ でも、ちょっとがまんしすぎたかも。楽しむことも、大事なお金の使い方だよ。'
      : happy ? 'たくさん楽しめた 1 年だったね。でも自転車には届かなかった……。何を優先するか、決めておくといいよ。'
      : 'お金も満足度も、あと少し。毎月いくら残すか、先に決めておく「先取り貯金」を試してみて！';
    box.innerHTML = `<p class="oz-month"><b>1 年が終わった！</b><small>称号「${title}」</small></p>${bar()}
      ${say(msg, ok ? 'happy' : 'sad')}
      ${ok ? '<p class="oz-buy">自転車を買いました！ 残り ' + yen(money - GOAL) + '</p>' : ''}
      <details class="oz-log"><summary>1 年のふり返り</summary><ol>${log.map(([n, y]) => `<li class="${y ? 'y' : 'n'}">${n}：${y ? '使った' : '見送った'}</li>`).join('')}</ol></details>
      <div class="oz-btns"><button type="button" class="oz-again">もう一度チャレンジ</button><a class="oz-link" href="glossary.html#budget">「予算と家計簿」を辞典で読む →</a></div>`;
    box.querySelector('.oz-again').addEventListener('click', start);
  };
  box.innerHTML = `<div class="oz-intro">${say('毎月 3,000 円のおこづかいで、1 年後に 30,000 円の自転車を買えるかな？ でも、全部がまんするのもさみしいよね。', '')}<button type="button" class="oz-start">チャレンジをはじめる</button></div>`;
  box.querySelector('.oz-start').addEventListener('click', start);
})();
