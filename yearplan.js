/* ================================================================
   yearplan.js — 1 年の流れ（コンテストと文化祭の予定を、月ごとの帯で）
   ・予定は部員から聞いたまま。日付が変わったら、下の PLAN を書きかえる
   ・[data-yearplan]：帯の表（スマホでは一覧）／ [data-yearplan="now"]：「いま進んでいること」だけ
   ・今日の位置に線を引き、終わったもの・いま・これからを色で分ける
   ================================================================ */
(function() {
  // 日付：'YYYY-MM'（その月ぜんぶ）か 'YYYY-MM-DD'（その日）。[開始, 終わり, 名前, 時期の書き方（部員から聞いたまま）, 節目なら 1（「これからの予定」の一覧にも出す）]
  const PLAN = [
    { key: 'bpg', name: '高校生ビジネスプラン・グランプリ', short: 'ビジネスプラン・グランプリ', href: 'contests.html#business', items: [
      ['2026-09-24', '2026-09-24', 'シート提出・応募', '9/24', 1],
      ['2026-11', '2026-11', '結果発表', '11 月中', 1]
    ] },
    { key: 'nsl', name: '日経ストックリーグ', short: 'ストックリーグ', href: 'contests.html#stockleague', items: [
      ['2026-08', '2026-08', '応募', '8 月中', 1],
      ['2026-08', '2026-09', 'テーマ選定', '8〜9 月'],
      ['2026-09', '2026-10', '練り上げ', '9〜10 月'],
      ['2026-11', '2026-12', 'ヒアリング', '11〜12 月'],
      ['2026-12', '2027-01', '仕上げ', '12〜1 月'],
      ['2027-01-08', '2027-01-08', 'レポート提出', '1/8', 1],
      ['2027-02-11', '2027-02-20', '発表', '2027 年 2 月中旬', 1]
    ] },
    { key: 'fes', name: '文化祭「麻布経済展」', short: '文化祭', href: 'festival.html', items: [
      ['2026-06', '2026-10', '展示の企画を練る', '6〜10 月'],
      ['2026-11', '2026-11', '細かい内容を詰める', '11 月'],
      ['2026-11-21', '2026-11-30', '査定', '11 月下旬', 1],
      ['2026-12', '2026-12', '査定の結果発表', '12 月', 1],
      ['2026-12', '2027-03', '事前準備', '12〜3 月'],
      ['2027-04', '2027-04', '組み立て', '4 月'],
      ['2027-05', '2027-05', '本番（予定）', '5 月']
    ] }
  ];
  // 帯の色のクラス（CSS を分けるときに見つけられるよう）：is-bpg is-nsl is-fes
  const FROM = [2026, 6], MONTHS = 12; // 2026 年 6 月〜2027 年 5 月
  const jst = new Date(Date.now() + 9 * 3600e3);
  const today = new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()));
  const parse = (s, end) => {
    const [y, m, d] = s.split('-').map(Number);
    if (d) return new Date(Date.UTC(y, m - 1, d + (end ? 1 : 0)));
    return new Date(Date.UTC(y, m - 1 + (end ? 1 : 0), 1));
  };
  const t0 = Date.UTC(FROM[0], FROM[1] - 1, 1), t1 = Date.UTC(FROM[0], FROM[1] - 1 + MONTHS, 1);
  const pct = t => Math.max(0, Math.min(100, (t - t0) / (t1 - t0) * 100));
  const state = (a, b) => b <= today ? 'is-done' : a <= today ? 'is-now' : 'is-next';
  const isPin = it => it[0] === it[1] && it[0].length === 10;
  const when = it => it[3];
  const rows = PLAN.flatMap(l => l.items.map(it => ({ l, it, a: parse(it[0]), b: parse(it[1], true) })));
  rows.forEach(r => { r.st = state(r.a, r.b); });

  // 「これからの予定」（render.js）に、節目（結果発表・提出・査定など）を日程の一覧として渡す
  // 文化祭の本番は、管理ページの日程（日付つき）があるので、ここからは出さない
  const ymd = d => d.toISOString().slice(0, 10);
  window.AZAKEI_PLAN_EVENTS = rows.filter(r => r.it[4] && r.st !== 'is-done').map(r => {
    const pin = isPin(r.it), y = r.it[0].slice(0, 4);
    return {
      date: pin ? r.it[0] : '', when: /年/.test(r.it[3]) ? r.it[3] : `${y} 年 ${r.it[3]}`,
      sort: r.st === 'is-now' ? ymd(today) : ymd(r.a),
      title: `${r.l.name}　${r.it[2]}`, tag: r.l.key === 'fes' ? '文化祭' : 'コンテスト', link: r.l.href,
      desc: r.st === 'is-now' ? '' : pin ? '' : '日にちは、決まりしだいお知らせします。',
      badge: r.st === 'is-now' ? (/発表/.test(r.it[2]) ? '結果待ち' : 'いま') : '', plan: true
    };
  });

  const boxes = document.querySelectorAll('[data-yearplan]');
  if (!boxes.length) return;

  const full = () => {
    const months = Array.from({ length: MONTHS }, (_, i) => { const m = (FROM[1] - 1 + i) % 12 + 1, y = FROM[0] + Math.floor((FROM[1] - 1 + i) / 12); return { m, y }; });
    const tp = pct(today.getTime());
    const chart = `<div class="yp-chart" role="img" aria-label="2026 年 6 月から 2027 年 5 月までの予定の表">
      <div class="yp-head"><span></span><div class="yp-months">${months.map(({ m, y }) => `<span${m === 1 ? ' class="is-year"' : ''}>${m === 1 || m === FROM[1] && y === FROM[0] ? `<small>${y}</small>` : ''}${m}月</span>`).join('')}</div></div>
      ${PLAN.map(l => `<div class="yp-lane is-${l.key}"><p class="yp-lane-name"><a href="${l.href}">${l.name}</a></p>
        ${l.items.map(it => { const r = rows.find(x => x.it === it); const pin = isPin(it);
          return `<div class="yp-row ${r.st}"><span class="yp-label">${it[2]}<small>${it[3]}</small></span><div class="yp-track">${pin
            ? `<i class="yp-pin" style="left:${pct(r.a.getTime()).toFixed(2)}%"></i>`
            : `<i class="yp-bar" style="left:${pct(r.a.getTime()).toFixed(2)}%;width:${(pct(r.b.getTime()) - pct(r.a.getTime())).toFixed(2)}%"></i>`}</div></div>`; }).join('')}</div>`).join('')}
      ${tp > 0 && tp < 100 ? `<div class="yp-today" style="--x:${tp.toFixed(2)}"><span>今日</span></div>` : ''}
    </div>`;
    const list = `<div class="yp-list">${PLAN.map(l => `<div class="yp-l is-${l.key}"><p class="yp-lane-name"><a href="${l.href}">${l.name}</a></p><ol>${l.items.map(it => { const r = rows.find(x => x.it === it); return `<li class="${r.st}"><span>${when(it)}</span><b>${it[2]}</b>${r.st === 'is-now' ? '<em>いま</em>' : ''}</li>`; }).join('')}</ol></div>`).join('')}</div>`;
    return chart + list + '<p class="yp-note">※ 予定です。変わることがあります。決まった日にちは「日程とイベント」でお知らせします。</p>';
  };
  const now = () => {
    const cur = rows.filter(r => r.st === 'is-now');
    const next = PLAN.map(l => rows.find(r => r.l === l && r.st === 'is-next')).filter(Boolean);
    return `<ul class="yp-now">${PLAN.map(l => {
      const c = cur.filter(r => r.l === l).map(r => r.it[2]), n = next.find(r => r.l === l);
      return `<li class="is-${l.key}"><a href="${l.href}"><span class="yp-now-k">${l.short}</span><b>${c.length ? c.join('・') : n ? 'つぎ：' + n.it[2] : 'ひと区切り'}</b><small>${n && c.length ? `つぎ：${when(n.it)} ${n.it[2]}` : n ? when(n.it) : ''}</small></a></li>`;
    }).join('')}</ul>`;
  };
  // [data-yearplan="lane:fes"]：1 つの取り組みだけを、コンテストのページと同じ「進み具合」の帯で
  const lane = key => {
    const l = PLAN.find(x => x.key === key); if (!l) return '';
    return `<ol class="cstep" aria-label="${l.name}の進み具合">${l.items.map(it => { const r = rows.find(x => x.it === it);
      return `<li class="${r.st === 'is-next' ? '' : r.st}"><b>${it[2]}</b><small>${r.st === 'is-now' ? 'いま・' : ''}${it[3]}</small></li>`; }).join('')}</ol>`;
  };
  boxes.forEach(b => { const v = b.dataset.yearplan; b.innerHTML = v === 'now' ? now() : v.startsWith('lane:') ? lane(v.slice(5)) : full(); });
})();

// [data-days-to="YYYY-MM-DD"]：その日まで「あと ○ 日」（文化祭のページの、次の麻布経済展の帯など）
(function() {
  const jst = new Date(Date.now() + 9 * 3600e3);
  const today = Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate());
  document.querySelectorAll('[data-days-to]').forEach(el => {
    const [y, m, d] = el.dataset.daysTo.split('-').map(Number), n = Math.round((Date.UTC(y, m - 1, d) - today) / 864e5);
    if (n > 0) el.textContent = `あと ${n} 日`;
  });
})();
