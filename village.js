/* ================================================================
   village.js — 経済ラボ「仕組みをつくる工房：村の税金」
   ・10 人の村で、税の集め方と使い道を自分で決める → 手取り・差・公共サービス・働く気持ちがどう変わるか
   ・数字はすべて説明のための「たとえ」。現実の税率や制度とは別
   ================================================================ */
(function() {
  const box = document.querySelector('[data-village]');
  if (!box) return;
  // 10 人の 1 年の所得（たとえ。万円）
  const P = [['花', 100], ['蓮', 150], ['葵', 200], ['湊', 250], ['紬', 300], ['陽', 400], ['律', 500], ['凪', 700], ['樹', 1000], ['朔', 1500]];
  const st = { mode: 'flat', flat: 10, low: 5, mid: 15, high: 30, give: 50 };
  const PRESET = {
    none: { mode: 'flat', flat: 0, give: 50 },
    flat: { mode: 'flat', flat: 15, give: 50 },
    prog: { mode: 'prog', low: 5, mid: 20, high: 40, give: 60 },
    heavy: { mode: 'flat', flat: 50, give: 100 }
  };
  const taxOf = inc => {
    if (st.mode === 'flat') return inc * st.flat / 100;
    // 累進：300 万円まで low%、300〜700 万円の部分に mid%、700 万円をこえた部分に high%
    const a = Math.min(inc, 300), b = Math.max(0, Math.min(inc, 700) - 300), c = Math.max(0, inc - 700);
    return (a * st.low + b * st.mid + c * st.high) / 100;
  };
  const topRate = () => st.mode === 'flat' ? st.flat : Math.max(st.low, st.mid, st.high);
  const fmt = n => Math.round(n).toLocaleString('ja-JP');

  box.innerHTML = `<div class="vg-grid">
      <div class="vg-ctl">
        <p class="vg-h">① 税の集め方</p>
        <div class="vg-seg" role="group" aria-label="税の集め方"><button type="button" data-mode="flat" aria-pressed="true">みんな同じ割合</button><button type="button" data-mode="prog" aria-pressed="false">所得が多いほど高い割合</button></div>
        <div class="vg-flat"><label>税率 <b data-o="flat"></b>%<input type="range" min="0" max="60" step="1" data-k="flat"></label></div>
        <div class="vg-prog" hidden>
          <label>300 万円までの部分 <b data-o="low"></b>%<input type="range" min="0" max="60" step="1" data-k="low"></label>
          <label>300〜700 万円の部分 <b data-o="mid"></b>%<input type="range" min="0" max="60" step="1" data-k="mid"></label>
          <label>700 万円をこえる部分 <b data-o="high"></b>%<input type="range" min="0" max="60" step="1" data-k="high"></label>
        </div>
        <p class="vg-h">② 集めた税の使い道</p>
        <label class="vg-give"><span>みんなに同じ額を配る <b data-o="give"></b>%</span><input type="range" min="0" max="100" step="5" data-k="give"><span class="vg-give-r">道路や学校に使う <b data-o="pub"></b>%</span></label>
        <p class="vg-h">ためしてみる</p>
        <div class="vg-pre"><button type="button" data-pre="none">税なし</button><button type="button" data-pre="flat">一律 15%</button><button type="button" data-pre="prog">累進</button><button type="button" data-pre="heavy">重い税で全部配る</button></div>
      </div>
      <div class="vg-out">
        <div class="vg-kpi">
          <p><span>集まった税</span><b data-r="rev"></b><small>万円</small></p>
          <p><span>いちばん多い人と少ない人の手取りの差</span><b data-r="gap"></b><small>倍</small></p>
          <p><span>道路や学校</span><b data-r="pubn"></b><small>万円分</small></p>
        </div>
        <div class="vg-bars" role="img" aria-label="10 人の、税の前と後の手取り"></div>
        <p class="vg-leg"><span class="vg-leg0"></span>税の前の所得<span class="vg-leg1"></span>税と配るお金のあとの手取り</p>
        <div class="vg-meters"><p><span>公共サービス</span><i><em data-m="pub"></em></i></p><p><span>働く気持ち</span><i><em data-m="work"></em></i></p></div>
        <p class="vg-msg" aria-live="polite"></p>
      </div>
    </div>
    <p class="vg-note">10 人の所得や、手取り・気持ちの変わり方は、仕組みを考えるための「たとえ」です。実際の税の制度や税率とは別のものです。</p>`;

  const bars = box.querySelector('.vg-bars');
  bars.innerHTML = P.map(([n]) => `<div class="vg-b"><span class="vg-b0"></span><span class="vg-b1"></span><em>${n}</em></div>`).join('');
  const MAX = 1500;
  const render = () => {
    box.querySelectorAll('[data-k]').forEach(r => { r.value = st[r.dataset.k]; });
    box.querySelectorAll('[data-o]').forEach(o => { o.textContent = o.dataset.o === 'pub' ? 100 - st.give : st[o.dataset.o]; });
    box.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === st.mode));
    box.querySelector('.vg-flat').hidden = st.mode !== 'flat';
    box.querySelector('.vg-prog').hidden = st.mode !== 'prog';
    const tax = P.map(([, inc]) => taxOf(inc));
    const rev = tax.reduce((a, b) => a + b, 0);
    const each = rev * st.give / 100 / P.length, pub = rev * (100 - st.give) / 100;
    const net = P.map(([, inc], i) => inc - tax[i] + each);
    const gap = Math.max(...net) / Math.max(1, Math.min(...net));
    const g0 = P[P.length - 1][1] / P[0][1];
    const work = Math.max(0, 100 - Math.max(0, topRate() - 25) * 2.4);
    const pubLv = Math.min(100, pub / 15);
    box.querySelector('[data-r="rev"]').textContent = fmt(rev);
    box.querySelector('[data-r="gap"]').textContent = gap.toFixed(1);
    box.querySelector('[data-r="pubn"]').textContent = fmt(pub);
    bars.querySelectorAll('.vg-b').forEach((b, i) => {
      b.querySelector('.vg-b0').style.height = (P[i][1] / MAX * 100) + '%';
      b.querySelector('.vg-b1').style.height = (net[i] / MAX * 100) + '%';
      b.title = `${P[i][0]}さん　所得 ${P[i][1]} 万円 → 手取り ${fmt(net[i])} 万円`;
    });
    box.querySelector('[data-m="pub"]').style.width = pubLv + '%';
    box.querySelector('[data-m="work"]').style.width = work + '%';
    let m;
    if (rev === 0) m = `税がないので、差は ${g0.toFixed(0)} 倍のまま。道路や学校をつくるお金もありません。`;
    else if (work < 50) m = '差はとても小さくなりましたが、たくさん稼いでもほとんど税で取られるので、働く気持ちが下がってしまいそうです。';
    else if (pubLv < 15 && st.give < 100) m = '税は集まりましたが、道路や学校に回るお金が少ないようです。';
    else if (st.give >= 80) m = '多くを配ったので、手取りの差は小さくなりました。そのぶん、道路や学校に回るお金は少なめです。';
    else if (gap < g0 * 0.6) m = '手取りの差が小さくなり、道路や学校にもお金が回っています。どこでつり合わせるかが、仕組みづくりのむずかしいところです。';
    else m = '差は少しだけ小さくなりました。税率や使い道を動かして、ちょうどいいところを探してみてください。';
    box.querySelector('.vg-msg').textContent = m;
  };
  box.addEventListener('input', e => { const k = e.target.dataset.k; if (k) { st[k] = +e.target.value; render(); } });
  box.addEventListener('click', e => {
    const m = e.target.closest('[data-mode]'); if (m) { st.mode = m.dataset.mode; render(); return; }
    const p = e.target.closest('[data-pre]'); if (p) { Object.assign(st, PRESET[p.dataset.pre]); render(); try { localStorage.setItem('azakei_village', '1'); } catch (e2) {} }
  });
  box.addEventListener('change', () => { try { localStorage.setItem('azakei_village', '1'); } catch (e) {} });
  render();
})();
