/* ================================================================
   moneyevo.js — クイズ：「お金の進化」（物々交換から、電子のお金まで）
   ・横にめくる 6 つの場面。それぞれに絵と、だいたいの時代と、辞典の言葉
   ・← → ボタン・スワイプ・キーボードで動く。いまの場面は点で示す
   ================================================================ */
(function() {
  const box = document.querySelector('[data-moneyevo]');
  if (!box) return;
  const C = 'currentColor';
  const ART = {
    barter: `<svg viewBox="0 0 200 140"><g fill="none" stroke="${C}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M28 70c14-18 38-18 52 0-14 18-38 18-52 0z"/><path d="M80 70l12-10v20z"/><circle cx="44" cy="66" r="3" fill="${C}"/><path d="M132 52h44v42a6 6 0 0 1-6 6h-32a6 6 0 0 1-6-6z"/><path d="M128 52h52M140 52c0-10 28-10 28 0"/><path d="M90 34q20-14 40 0M130 34l-6-6M130 34l-8 3M110 106q-20 14-40 0M70 106l6 6M70 106l8-3"/></g></svg>`,
    shell: `<svg viewBox="0 0 200 140"><g fill="none" stroke="${C}" stroke-width="4" stroke-linecap="round"><ellipse cx="100" cy="70" rx="44" ry="56"/><path d="M100 22c-10 20-10 76 0 96"/><path d="M92 40h-8M92 54h-10M92 68h-10M92 82h-10M92 96h-8M108 40h8M108 54h10M108 68h10M108 82h10M108 96h8"/></g></svg>`,
    coin: `<svg viewBox="0 0 200 140"><g fill="none" stroke="${C}" stroke-width="4"><circle cx="100" cy="70" r="54"/><circle cx="100" cy="70" r="44" stroke-width="2"/><rect x="86" y="56" width="28" height="28"/></g><g fill="${C}" font-family="Shippori Mincho, serif" font-weight="800" font-size="20" text-anchor="middle"><text x="100" y="44">和</text><text x="100" y="112">同</text><text x="68" y="77">珎</text><text x="132" y="77">開</text></g></svg>`,
    paper: `<svg viewBox="0 0 200 140"><g fill="none" stroke="${C}" stroke-width="4"><rect x="62" y="16" width="76" height="108" rx="4"/><rect x="72" y="26" width="56" height="88" stroke-width="2"/></g><g fill="${C}" font-family="Shippori Mincho, serif" font-weight="800" text-anchor="middle"><text x="100" y="62" font-size="22">交</text><text x="100" y="90" font-size="22">子</text></g><circle cx="118" cy="104" r="7" fill="#b5432f"/></svg>`,
    yen: `<svg viewBox="0 0 200 140"><g fill="none" stroke="${C}" stroke-width="4"><rect x="22" y="34" width="156" height="78" rx="6"/><circle cx="62" cy="73" r="22" stroke-width="2"/></g><g fill="${C}" font-family="Shippori Mincho, serif" font-weight="800" text-anchor="middle"><text x="62" y="82" font-size="26">円</text><text x="132" y="68" font-size="15">日本銀行券</text><text x="132" y="96" font-size="13">見本</text></g></svg>`,
    digital: `<svg viewBox="0 0 200 140"><g fill="none" stroke="${C}" stroke-width="4" stroke-linejoin="round"><rect x="40" y="14" width="56" height="112" rx="10"/><rect x="50" y="34" width="36" height="36" stroke-width="3"/><path d="M58 42h8v8h-8zM70 54h8v8h-8z" fill="${C}" stroke="none"/><rect x="112" y="46" width="68" height="44" rx="6"/><path d="M112 58h68" stroke-width="6"/><path d="M58 102h20"/></g><path d="M118 104q12-10 24 0M124 112q6-5 12 0" fill="none" stroke="#b5432f" stroke-width="4" stroke-linecap="round"/></svg>`
  };
  const S = [
    ['barter', 'ずっとむかし', '物々交換', 'ほしい物どうしを、そのまま取りかえる。でも、「魚がほしい人」と「米を出せる人」がちょうど出会うのは、なかなかむずかしいことでした。', [['money-roles', 'お金の 3 つの役割']]],
    ['shell', 'むかし', '貝や布、米がお金に', 'みんなが価値を認める物が、交換のなかだちに。「貨」「財」「買」など、お金に関係する漢字に「貝」が入っているのは、そのなごりといわれます。', [['money-roles', 'お金の 3 つの役割']]],
    ['coin', '708 年', '金属のお金', '持ち運びやすく、長もちする金属のお金へ。日本では、708 年につくられはじめた和同開珎が、古い時代のお金の代表です。', [['wadokaichin', '和同開珎'], ['coin', '硬貨']]],
    ['paper', '11 世紀ごろ', '紙のお金', 'たくさんの金属は重すぎる。中国（宋）の「交子」は、世界で早い時期の紙のお金のひとつといわれます。日本でも江戸時代に、藩が出す「藩札」が使われました。', [['bank-note', '日本銀行券']]],
    ['yen', '1871 年・1885 年', '「円」と日本銀行券', '1871 年に、お金の単位が「円」に決まりました。1885 年には、日本銀行がお札（日本銀行券）を出しはじめ、いまのお札につながっています。', [['bank-note', '日本銀行券'], ['central-bank', '中央銀行']]],
    ['digital', 'いま', '電子のお金', 'カードやスマホで払うとき、お金は紙や金属ではなく、数字の記録として動きます。便利になる一方で、使いすぎや、だまされないための注意も大切に。', [['cashless', 'キャッシュレス決済'], ['e-money', '電子マネー'], ['qr-pay', 'QR コード決済'], ['crypto', '暗号資産']]]
  ];
  box.innerHTML = `<div class="me-track" tabindex="0" aria-label="お金の進化（横にめくれます）">${S.map(([k, era, t, x, gl], i) => `<article class="me-s" data-i="${i}">
      <div class="me-art" aria-hidden="true">${ART[k]}</div>
      <p class="me-era"><span>${['一', '二', '三', '四', '五', '六'][i]}</span>${era}</p>
      <h3>${t}</h3><p class="me-x">${x}</p>
      <p class="me-gl">${gl.map(([id, n]) => `<a href="glossary.html#${id}">${n}</a>`).join('')}${k === 'barter' ? '<a class="me-try" href="#koukan">交換の島で試す</a>' : ''}</p></article>`).join('')}</div>
    <div class="me-ctl"><button type="button" class="me-prev" aria-label="前の場面">←</button><ol class="me-dots" aria-hidden="true">${S.map(() => '<li></li>').join('')}</ol><button type="button" class="me-next" aria-label="次の場面">→</button></div>`;
  const tr = box.querySelector('.me-track'), slides = [...tr.children], dots = [...box.querySelectorAll('.me-dots li')];
  let cur = 0;
  const go = i => { i = Math.max(0, Math.min(S.length - 1, i)); tr.scrollTo({ left: slides[i].offsetLeft - tr.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
  const sync = () => {
    const mid = tr.scrollLeft + tr.clientWidth / 2;
    let best = 0, d = Infinity;
    slides.forEach((s, i) => { const c = s.offsetLeft - tr.offsetLeft + s.offsetWidth / 2; if (Math.abs(c - mid) < d) { d = Math.abs(c - mid); best = i; } });
    cur = best;
    slides.forEach((s, i) => s.classList.toggle('is-on', i === cur));
    dots.forEach((d2, i) => d2.classList.toggle('is-on', i === cur));
    box.querySelector('.me-prev').disabled = cur === 0;
    box.querySelector('.me-next').disabled = cur === S.length - 1;
  };
  let wait = false;
  tr.addEventListener('scroll', () => { if (!wait) { wait = true; setTimeout(() => { wait = false; sync(); }, 90); } }, { passive: true });
  box.querySelector('.me-prev').addEventListener('click', () => go(cur - 1));
  box.querySelector('.me-next').addEventListener('click', () => go(cur + 1));
  tr.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); } });
  sync();
})();
