/* ================================================================
   econcal.js — 経済の暦（その日に起きた、経済のできごと）
   ・[data-ecal]      … 12 か月のこよみ（日程とイベントのページ）
   ・[data-ecal-mini] … 今日は何の日／もうすぐ（トップ）
   ・日付は、記録がはっきりしているものだけ
   ================================================================ */
(function() {
  // [月, 日, 年, 見出し, ひとこと, 辞典の言葉（任意）]
  const E = [
    [1, 1, 1999, 'ユーロが誕生', 'EU の 11 か国で、共通のお金ユーロが使われ始めました（はじめは銀行どうしの取引などから）。', 'eu'],
    [1, 1, 2002, 'ユーロのお札と硬貨', 'ユーロの紙幣と硬貨が、町の買い物で使われ始めました。', 'eu'],
    [1, 1, 2024, '新しい NISA', '税金がかからずに投資できる期間に期限がなくなり、使える額も大きくなりました。', 'nisa'],
    [1, 3, 2009, 'ビットコインの最初の記録', 'ビットコインの最初のブロック（取引の記録のかたまり）がつくられました。', 'blockchain'],
    [1, 29, 2016, 'マイナス金利を決定', '日本銀行が、日本で初めてのマイナス金利の導入を決めました。', 'negative-rate'],
    [2, 14, 1973, '円が変動相場制に', '円とドルの交換の比率が、市場の売り買いで決まるようになりました。', ''],
    [2, 22, 2024, '日経平均が 34 年ぶりに最高値', '1989 年末の記録をこえて、終値 39,098 円になりました。', 'index'],
    [3, 9, 1776, '『国富論』が出版', 'アダム・スミスが、分業と市場のはたらきを説いた本。「経済学の父」と呼ばれるきっかけに。', 'adam-smith'],
    [3, 14, 1927, '昭和金融恐慌のはじまり', '大蔵大臣の国会での発言をきっかけに、銀行へ預金を引き出しに行く人が殺到しました。', ''],
    [3, 19, 2024, 'マイナス金利の解除', '日本銀行が、8 年ほど続いたマイナス金利をやめることを決めました。', 'negative-rate'],
    [3, 20, 1602, 'オランダ東インド会社', '世界で最初の株式会社といわれる会社がつくられました。', 'east-india'],
    [4, 1, 1989, '消費税が始まる', '税率 3% で始まりました。', 'tax'],
    [4, 1, 1997, '消費税が 5% に', '', 'tax'],
    [4, 1, 2014, '消費税が 8% に', '', 'tax'],
    [4, 1, 2022, '成年年齢が 18 歳に', '18 歳から、親の同意がなくても、ローンやクレジットカードなどの契約ができるようになりました。', ''],
    [5, 15, 1878, '東京株式取引所の設立', 'いまの東京証券取引所のもとになった取引所です。', 'listing'],
    [5, 16, 1949, '戦後の株の売買が再開', '戦争で止まっていた取引所での売り買いが、東京証券取引所で再び始まりました。', ''],
    [6, 27, 1871, '「円」の誕生', '新貨条例で、お金の単位が「円・銭・厘」に決まりました。', ''],
    [7, 2, 1997, 'アジア通貨危機', 'タイのお金バーツが変動相場制に移って大きく下がり、その動きがアジアの国々に広がりました。', ''],
    [7, 3, 2024, '新しいお札', '一万円札は渋沢栄一、五千円札は津田梅子、千円札は北里柴三郎に。', ''],
    [8, 15, 1971, 'ニクソン・ショック', 'アメリカが、ドルと金の交換を止めると発表しました（日本の時間では 16 日）。', 'nixon-shock'],
    [9, 14, 1867, '『資本論』第 1 巻', 'マルクスが、資本主義のしくみを分析した本です。', ''],
    [9, 15, 2008, 'リーマン・ショック', 'アメリカの大きな証券会社リーマン・ブラザーズが破綻し、世界の金融危機に広がりました。', 'lehman'],
    [9, 22, 1985, 'プラザ合意', '先進 5 か国がドル高をおさえることで合意し、そのあと急な円高が進みました。', 'plaza-accord'],
    [10, 1, 2019, '消費税が 10% に', '食料品などは 8% のままにする、軽減税率も始まりました。', ''],
    [10, 10, 1882, '日本銀行が開業', '日本の中央銀行。お札を発行し、金融政策を行います。', 'central-bank'],
    [10, 19, 1987, 'ブラックマンデー', 'ニューヨークの株価が、1 日で 20% をこえて下がりました。', ''],
    [10, 24, 1929, '暗黒の木曜日', 'ニューヨークの株価が大きく下がり、世界恐慌のきっかけになりました。', 'great-depression'],
    [10, 31, 2011, '円が戦後最高値に', '1 ドル 75 円 32 銭まで円高が進みました。', 'yen'],
    [11, 17, 1997, '北海道拓殖銀行の破綻', '都市銀行として、はじめての破綻でした。', ''],
    [11, 24, 1997, '山一證券が自主廃業へ', '日本の四大証券会社のひとつが、営業をやめると発表しました。', ''],
    [12, 18, 1971, 'スミソニアン協定', '1 ドル 360 円だった交換の比率が、308 円に変わりました。', ''],
    [12, 29, 1989, '日経平均が当時の最高値', '終値 38,915 円。このあとバブルがはじけ、長く下がりました。', 'bubble']
  ];
  window.AZAKEI_ECAL = E;   // 麻経だより（dayori.js）でも使う
  const now = new Date(), M = now.getMonth() + 1, D = now.getDate();
  const ord = (m, d) => m * 100 + d;
  const today = E.filter(e => e[0] === M && e[1] === D);
  // 次に来る日（今日のあと。年をまたぐときは 1 月から）
  const after = E.filter(e => ord(e[0], e[1]) > ord(M, D));
  const nextDay = (after.length ? after : E)[0];
  const upcoming = E.filter(e => e[0] === nextDay[0] && e[1] === nextDay[1]);
  const daysTo = (m, d) => { let t = new Date(now.getFullYear(), m - 1, d); const z = new Date(now.getFullYear(), M - 1, D); if (t < z) t = new Date(now.getFullYear() + 1, m - 1, d); return Math.round((t - z) / 864e5); };
  const glLink = id => id ? `<a class="ec-gl" href="glossary.html#${id}">辞典で見る</a>` : '';

  // ── トップ：今日は何の日／もうすぐ
  const mini = document.querySelector('[data-ecal-mini]');
  if (mini) {
    const list = today.length ? today : upcoming, isToday = !!today.length;
    const e = list[0], n = daysTo(e[0], e[1]);
    mini.innerHTML = `<div class="ecm-day" aria-hidden="true"><small>${e[0]}月</small><b>${e[1]}</b></div>
      <div class="ecm-body"><p class="ecm-k">${isToday ? '今日は、経済の何の日' : `あと ${n} 日で、経済の何の日`}</p>
        <p class="ecm-t"><span>${e[2]} 年</span>${e[3]}${list.length > 1 ? `<small>ほか ${list.length - 1} つ</small>` : ''}</p>
        <p class="ecm-s">${e[4]}</p>
        <a class="ecm-go" href="events.html#koyomi">経済の暦を見る</a></div>`;
    mini.hidden = false;
  }

  // ── トップの最初の画面：今日の日付と、経済の何の日（1 行）
  const ht = document.querySelector('[data-hero-today]');
  if (ht) {
    const e = (today.length ? today : upcoming)[0], n = daysTo(e[0], e[1]);
    ht.innerHTML = `<span class="ht-date"><b>${M}</b>月<b>${D}</b>日</span><span class="ht-t">${today.length ? '今日は' : `あと ${n} 日で`}、<b>${e[2]} 年 ${e[3]}</b> の日</span><span class="ht-go" aria-hidden="true">→</span>`;
    ht.hidden = false;
  }

  // ── 日程とイベント：12 か月のこよみ
  const box = document.querySelector('[data-ecal]');
  if (!box) return;
  let cur = M;
  box.innerHTML = `<div class="ec-tabs" role="tablist" aria-label="月をえらぶ">${Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
      const n = E.filter(e => e[0] === m).length;
      return `<button type="button" role="tab" data-m="${m}" aria-selected="${m === cur}"${m === M ? ' class="is-now"' : ''}>${m}<small>月</small>${n ? `<i>${n}</i>` : ''}</button>`;
    }).join('')}</div>
    <ol class="ec-list" aria-live="polite"></ol>`;
  const list = box.querySelector('.ec-list');
  const show = m => {
    cur = m;
    box.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-selected', +b.dataset.m === m));
    const rows = E.filter(e => e[0] === m);
    list.innerHTML = rows.length ? rows.map((e, i) => {
      const isT = e[0] === M && e[1] === D, isNext = !today.length && e === upcoming[0];
      return `<li class="${isT ? 'is-today' : ''}${isNext ? ' is-next' : ''}" style="--i:${i}">
        <div class="ec-date"><b>${e[1]}</b><small>日</small></div>
        <div class="ec-body"><p class="ec-t"><span>${e[2]} 年</span>${e[3]}${isT ? '<em>今日</em>' : isNext ? `<em>あと ${daysTo(e[0], e[1])} 日</em>` : ''}</p>${e[4] ? `<p class="ec-s">${e[4]}</p>` : ''}${glLink(e[5])}</div>
      </li>`;
    }).join('') : '<li class="ec-empty">この月の記録は、まだありません。</li>';
  };
  box.querySelector('.ec-tabs').addEventListener('click', ev => { const b = ev.target.closest('[data-m]'); if (b) show(+b.dataset.m); });
  show(cur);
})();
