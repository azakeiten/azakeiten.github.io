/* ================================================================
   town.js — サイトマップ：「経済の町」の地図
   ・このサイトの 14 のページを、町の建物にして並べる。押すと説明と「このページへ」
   ・行ったことのあるページ（サイト探検のスタンプ）には「済」の札
   ================================================================ */
(function() {
  const box = document.querySelector('[data-town]');
  if (!box) return;
  let visited = []; try { visited = JSON.parse(localStorage.getItem('azakei-visited') || '[]'); } catch (e) {}
  // [ページ, 建物, 印, 説明, 形, 屋根の色, 列, 行]
  const B = [
    ['index.html', '町の入口（ホーム）', '駅', 'はじめての人は、ここから。4 つの場面と、3 つの章で麻経を紹介しています。', 'station', '#1c2b23', 0, 0],
    ['about.html', '本部（麻経とは）', '麻', 'どんな同好会か、歩み・実績・よくある質問。', 'hall', '#b5432f', 1, 0],
    ['azakei.html', '志の館（AZAKEI として）', '志', '合言葉と、大切にしていること。マスコットのお札マン（仮）も。', 'house', '#2d4f80', 2, 0],
    ['activities.html', '写真館（活動風景）', '写', '展示ができるまでのフィルムと、ふだんの日記。', 'house', '#b08a4a', 3, 0],
    ['contests.html', '挑戦の塔（コンテスト）', '挑', 'ストックリーグとビジネスコンテストへの挑戦。', 'tower', '#1c2b23', 4, 0],
    ['festival.html', '会場（文化祭）', '祭', '麻布経済展の 3 日間。3D の会場と、麻経券づくり。', 'big', '#b5432f', 0, 1],
    ['quiz.html', '遊技場（クイズ）', '遊', '億万長者クイズ・クロスワード・カード勝負・おつりの達人など 7 つの遊び。', 'dome', '#2f6b4f', 1, 1],
    ['sim.html', '研究所（経済ラボ）', '試', 'お金のめぐりの図と、16 の実験。', 'lab', '#2d4f80', 2, 1],
    ['glossary.html', '図書館（用語辞典）', '辞', '300 語の辞典、しりとり、ニュースの言葉さがし。', 'hall', '#b08a4a', 3, 1],
    ['diagnosis.html', '占いの館（エコノミスト診断）', '診', 'YES と NO で、あなたの投資家タイプがわかる。', 'dome', '#b5432f', 4, 1],
    ['events.html', '時計台（日程とイベント）', '暦', '1 年の流れと、経済の暦。', 'clock', '#1c2b23', 0, 2],
    ['vote.html', '投票所（文化祭投票）', '票', '次の展示で見たいものに、1 票を。', 'house', '#2f6b4f', 1, 2],
    ['sponsor.html', '商会（協賛のご案内）', '協', '協賛・取材・コラボのご相談。1 分でわかるスライドも。', 'hall', '#2d4f80', 2, 2],
    ['contact.html', '郵便局（お問い合わせ）', '便', '見学・協賛・取材など、なんでもご連絡を。', 'house', '#b5432f', 3, 2]
  ];
  const X0 = 110, DX = 195, Y0 = 192, DY = 184;
  const win = (x, y, n, w) => Array.from({ length: n }, (_, i) => `<rect x="${x + i * (w + 8)}" y="${y}" width="${w}" height="14" rx="2" class="tw-win"/>`).join('');
  const shape = (s, c) => {
    switch (s) {
      case 'tower': return `<rect x="-26" y="-118" width="52" height="118" class="tw-body"/><polygon points="-34,-118 0,-150 34,-118" fill="${c}"/>${win(-15, -100, 2, 10)}${win(-15, -74, 2, 10)}${win(-15, -48, 2, 10)}`;
      case 'big': return `<rect x="-70" y="-70" width="140" height="70" class="tw-body"/><path d="M-80,-70 Q0,-128 80,-70 Z" fill="${c}"/>${win(-56, -52, 5, 16)}<rect x="-12" y="-28" width="24" height="28" class="tw-door"/>`;
      case 'dome': return `<rect x="-46" y="-56" width="92" height="56" class="tw-body"/><path d="M-46,-56 A46,40 0 0 1 46,-56 Z" fill="${c}"/>${win(-34, -40, 3, 16)}<rect x="-10" y="-24" width="20" height="24" class="tw-door"/>`;
      case 'lab': return `<rect x="-50" y="-66" width="100" height="66" class="tw-body"/><rect x="-56" y="-76" width="112" height="12" fill="${c}"/><rect x="22" y="-104" width="14" height="30" class="tw-body"/>${win(-38, -52, 4, 14)}${win(-38, -28, 4, 14)}`;
      case 'clock': return `<rect x="-24" y="-96" width="48" height="96" class="tw-body"/><polygon points="-30,-96 0,-120 30,-96" fill="${c}"/><circle cx="0" cy="-72" r="14" class="tw-clock"/><path d="M0,-72 L0,-82 M0,-72 L7,-68" class="tw-hand"/>${win(-12, -42, 2, 8)}`;
      case 'station': return `<rect x="-56" y="-60" width="112" height="60" class="tw-body"/><polygon points="-64,-60 0,-92 64,-60" fill="${c}"/>${win(-42, -44, 4, 14)}<rect x="-14" y="-26" width="28" height="26" class="tw-door"/>`;
      case 'hall': return `<rect x="-52" y="-64" width="104" height="64" class="tw-body"/><polygon points="-60,-64 0,-98 60,-64" fill="${c}"/>${Array.from({ length: 5 }, (_, i) => `<rect x="${-44 + i * 20}" y="-56" width="8" height="56" class="tw-col"/>`).join('')}`;
      default: return `<rect x="-40" y="-54" width="80" height="54" class="tw-body"/><polygon points="-48,-54 0,-86 48,-54" fill="${c}"/>${win(-28, -40, 3, 12)}<rect x="-9" y="-22" width="18" height="22" class="tw-door"/>`;
    }
  };
  const done = B.filter(b => visited.includes(b[0])).length;
  box.innerHTML = `<div class="tw-head"><p class="tw-prog">町の探検 <b>${done}</b> / ${B.length}<span class="tw-bar"><i style="width:${Math.round(done / B.length * 100)}%"></i></span></p><p class="tw-hint">建物を押すと、説明が出ます。行ったことのある建物には「済」の札。</p></div>
    <div class="tw-map"><svg viewBox="0 0 1000 600" role="group" aria-label="このサイトのページを建物にした町の地図">
      <rect width="1000" height="600" class="tw-ground"/>
      ${[0, 1, 2].map(r => `<rect x="0" y="${Y0 + r * DY + 4}" width="1000" height="22" class="tw-road"/><line x1="0" x2="1000" y1="${Y0 + r * DY + 15}" y2="${Y0 + r * DY + 15}" class="tw-line"/>`).join('')}
      <path id="tw-route" d="M20,${Y0 + 15} H980 V${Y0 + DY + 15} H20 V${Y0 + DY * 2 + 15} H980" fill="none"/>
      <circle r="7" class="tw-coin"><animateMotion dur="22s" repeatCount="indefinite" rotate="0"><mpath href="#tw-route"/></animateMotion></circle>
      ${[850, 895, 940].map((x, i) => `<g class="tw-tree" transform="translate(${x},${Y0 + DY * 2 - (i % 2) * 14})"><rect x="-3" y="-14" width="6" height="14"/><circle cy="-24" r="14"/></g>`).join('')}
      ${B.map((b, i) => { const v = visited.includes(b[0]); const x = X0 + b[6] * DX, y = Y0 + b[7] * DY; return `<g class="tw-b${v ? ' is-v' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="${b[1]}${v ? '（行ったことあり）' : ''}" transform="translate(${x},${y})" style="--d:${i * 50}ms">
        <ellipse cx="0" cy="2" rx="62" ry="7" class="tw-shadow"/><g class="tw-in">${shape(b[4], b[5])}
        <g transform="translate(0,${b[4] === 'tower' ? -160 : b[4] === 'clock' ? -134 : -118})"><circle r="17" class="tw-sign"/><text y="7" class="tw-k">${b[2]}</text></g>
        ${v ? `<g transform="translate(46,-30)" class="tw-done"><rect x="-13" y="-13" width="26" height="26" rx="4"/><text y="6">済</text></g>` : ''}</g></g>`; }).join('')}
    </svg></div>
    <div class="tw-info" aria-live="polite"><p class="tw-i-k">経済の町へ、ようこそ</p><p class="tw-i-t">14 の建物があります</p><p class="tw-i-x">いちばん左上の「町の入口」から、順に回ってみてください。</p></div>`;
  const info = box.querySelector('.tw-info'), svg = box.querySelector('svg');
  const pick = g => {
    const b = B[+g.dataset.i]; const v = visited.includes(b[0]);
    svg.querySelectorAll('.tw-b').forEach(x => x.classList.toggle('is-on', x === g));
    info.innerHTML = `<p class="tw-i-k"><span class="tw-i-seal">${b[2]}</span>${v ? '行ったことのある建物' : 'まだ行っていない建物'}</p><p class="tw-i-t">${b[1]}</p><p class="tw-i-x">${b[3]}</p><a class="tw-go" href="${b[0]}">このページへ</a>`;
  };
  svg.addEventListener('click', e => { const g = e.target.closest('.tw-b'); if (g) pick(g); });
  svg.addEventListener('keydown', e => { const g = e.target.closest('.tw-b'); if (!g) return; if (e.key === 'Enter') { location.href = B[+g.dataset.i][0]; } else if (e.key === ' ') { e.preventDefault(); pick(g); } });
  svg.addEventListener('focusin', e => { const g = e.target.closest('.tw-b'); if (g) pick(g); });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches && svg.pauseAnimations) svg.pauseAnimations();
})();
