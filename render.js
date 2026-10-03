/* ================================================================
   render.js — content.js のデータを各ページに描画
   使い方: <div data-render="events" data-limit="3"></div>
   ================================================================ */
(function() {
  const D = window.AZAKEI || {};

  function fmt(d) {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${y}.${m}.${day}`;
  }
  function todayStr() {
    const jst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    return jst.getFullYear() + '-' + String(jst.getMonth() + 1).padStart(2, '0') + '-' + String(jst.getDate()).padStart(2, '0');
  }

  // 未来（・日程未定）→ 過去 の順に並べる
  function sortedEvents() {
    const t = todayStr();
    const ev = (D.events || []).map(e => ({ ...e, past: !!e.date && (e.end || e.date) < t }));
    const upcoming = ev.filter(e => !e.past).sort((a, b) => (a.date || '9999') < (b.date || '9999') ? -1 : 1);
    const past = ev.filter(e => e.past).sort((a, b) => a.date < b.date ? 1 : -1);
    return { upcoming, past };
  }

  // 今日から何日前か（日付文字列どうしで計算）
  function daysAgo(d) {
    return Math.round((new Date(todayStr()) - new Date(d)) / 86400000);
  }

  function eventCard(e, next) {
    const when = e.date
      ? fmt(e.date) + (e.end && e.end !== e.date ? ' – ' + fmt(e.end).slice(5) : '')
      : (e.when || '日程未定');
    const tag = e.link ? 'a' : 'div';
    // 日付のある予定には「あと○日」／「開催中」
    let badge = '';
    if (e.date && !e.past) {
      const t = todayStr();
      const days = Math.round((new Date(e.date) - new Date(t)) / 86400000);
      badge = days <= 0 ? '<span class="event-countdown is-now">開催中</span>'
                        : `<span class="event-countdown">あと <b>${days}</b> 日</span>`;
    } else if (!e.date && e.when === '受付中') {
      badge = '<span class="event-countdown is-now">受付中</span>';
    }
    return `<${tag} class="event-row${e.past ? ' is-past' : ''}${next ? ' is-next' : ''}"${e.link ? ` href="${e.link}"` : ''}>
      <div class="event-when">${next ? '<span class="event-next">Next Event</span>' : ''}${!e.date && e.when === '受付中' ? '' : when}${badge}</div>
      <div class="event-main">
        <span class="chip">${e.tag || 'Event'}</span>
        <h3>${e.title}</h3>
        <p>${e.desc || ''}</p>
      </div>
      <div class="event-place">${e.img ? `<img class="event-thumb" src="${e.img}" alt="" loading="lazy" decoding="async">` : ''}${e.place || ''}</div>
    </${tag}>`;
  }

  // Firebase から日程・日誌を読みこむあいだは「読みこみ中…」と出す
  let loading = !!D.firebase;
  const emptyMsg = text => `<p class="empty${loading ? ' is-loading' : ''}">${loading ? '読みこみ中…' : text}</p>`;

  const renderers = {
    events(el) {
      const { upcoming, past } = sortedEvents();
      const limit = +el.dataset.limit || Infinity;
      // 日付が決まっている、いちばん近い予定を「Next Event」として大きく見せる
      const nextIdx = upcoming.findIndex(e => e.date);
      const card = (e, i) => eventCard(e, i === nextIdx);
      if (el.dataset.scope === 'upcoming') {
        el.innerHTML = upcoming.slice(0, limit).map(card).join('') || emptyMsg('予定は準備中です。');
        return;
      }
      el.innerHTML =
        `<h3 class="list-head">これから</h3>` +
        (upcoming.map(card).join('') || emptyMsg('予定は準備中です。')) +
        (past.length ? `<h3 class="list-head">これまで</h3>` + past.map(e => eventCard(e)).join('') : '');
    },

    gallery(el) {
      const limit = +el.dataset.limit || Infinity;
      el.innerHTML = (D.gallery || []).slice(0, limit).map(g => g.src
        ? `<figure class="gallery-item"><img src="${g.src}" alt="${g.caption}" loading="lazy"><figcaption>${g.caption}${g.date ? `<span>${g.date}</span>` : ''}</figcaption></figure>`
        : `<figure class="gallery-item is-empty"><div class="gallery-ph" aria-hidden="true"><span class="ph-mark" data-logomark></span><span class="ph-text">Photo coming soon</span></div><figcaption>${g.caption}</figcaption></figure>`
      ).join('');
    },

    diary(el) {
      const limit = +el.dataset.limit || Infinity;
      const items = (D.diary || []).slice().sort((a, b) => a.date < b.date ? 1 : -1).slice(0, limit);
      el.innerHTML = items.map(d => `
        <article class="diary-item${d.img ? ' has-img' : ''}">
          ${d.img ? `<img class="diary-img" src="${d.img}" alt="" loading="lazy" decoding="async">` : ''}
          <time>${fmt(d.date)}${daysAgo(d.date) <= 14 ? '<span class="diary-new">New</span>' : ''}</time>
          <h3>${d.title}</h3>
          <p>${d.body}</p>
        </article>`).join('') || emptyMsg('活動日誌は準備中です。');
    },

    achievements(el) {
      const items = D.achievements || [];
      el.innerHTML = items.map(a => `<li><span>${a.year}</span>${a.title}</li>`).join('') +
        '<li class="is-next"><span>Next</span>ここに、これからの実績が積み重なっていきます。</li>';
    },

    sns(el) {
      el.innerHTML = (D.sns || []).map(s => `
        <a class="sns-card" href="${s.url}" target="_blank" rel="noopener">
          <span class="sns-name">${s.name}</span>
          <span class="sns-handle">${s.handle}</span>
          <span class="sns-desc">${s.desc}</span>
          <svg width="18" height="14" aria-hidden="true"><path d="M1 7h16M11 1l6 6-6 6" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>
        </a>`).join('');
    }
  };

  document.querySelectorAll('[data-render]').forEach(el => {
    const fn = renderers[el.dataset.render];
    if (fn) fn(el);
  });
  if (window.AZAKEI_RENDER_MARKS) window.AZAKEI_RENDER_MARKS();

  /* ---- 部員が管理ページ（admin.html）から書いた「日誌」「日程」を Firebase から足す ---- */
  const live = [...document.querySelectorAll('[data-render="diary"], [data-render="events"]')];
  if (!live.length) loading = false;
  else if (D.firebase) (async () => {
    try {
      const SDK = 'https://www.gstatic.com/firebasejs/12.19.0/';
      const [appMod, fs] = await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-firestore.js')]);
      const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(D.firebase);
      const snap = await fs.getDocs(fs.query(fs.collection(fs.getFirestore(app), 'posts'), fs.limit(300)));
      if (snap.empty) throw 0;
      // 部員が書いた文字は、そのまま文字として表示（HTML として動かない）
      const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      const safeLink = s => (/^(https:\/\/|[a-z0-9-]+\.html(#[\w-]+)?$)/i.test(s || '') ? s : '');
      const day = s => (/^\d{4}-\d{2}-\d{2}$/.test(s || '') ? s : '');
      const safeImg = s => (/^photos\/[a-z0-9-]+\.jpg$/.test(s || '') ? s : '');
      const posts = snap.docs.map(d => d.data());
      // 管理ページに取りこんだものと同じ（種類・日付・タイトルが同じ）元の書きこみは、二重に出さない
      const key = (k, d, t) => k + '|' + (d || '') + '|' + t;
      const has = new Set(posts.map(p => key(p.kind, p.date, p.title)));
      D.diary = (D.diary || []).filter(x => !has.has(key('diary', x.date, x.title)));
      D.events = (D.events || []).filter(x => !has.has(key('event', x.date, x.title)));
      posts.forEach(p => {
        if (p.kind === 'diary' && day(p.date)) D.diary.push({ date: p.date, title: esc(p.title), body: esc(p.body).replace(/\n/g, '<br>'), img: safeImg(p.img) });
        if (p.kind === 'event') {
          // 日付なしでラベルが「投票」なら「受付中」、それ以外は「日程調整中」
          const when = day(p.date) ? '' : (p.tag === '投票' ? '受付中' : '日程調整中');
          D.events.push({ date: day(p.date), end: day(p.end), when, title: esc(p.title), tag: esc(p.tag) || 'Event', place: esc(p.place), desc: esc(p.body), link: safeLink(p.link), img: safeImg(p.img) });
        }
      });
    } catch (e) { /* 読めないとき・まだ何もないときは「準備中」 */ }
    loading = false;
    live.forEach(el => { const fn = renderers[el.dataset.render]; if (fn) fn(el); });
    document.dispatchEvent(new Event('azakei:rerender'));
  })();

  /* ---- お問い合わせフォーム ---- */
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.getElementById('formStatus');
  const cfg = D.contact || {};

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (form.type) data.type = form.type.options[form.type.selectedIndex].text;
    if (data._honey) return; // スパム対策（人には見えない入力欄）

    if (cfg.formEndpoint) {
      status.textContent = '送信中…';
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        // FormSubmit（https://formsubmit.co）へ送信 → AZAKEI の Gmail に届く
        const res = await fetch(cfg.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: '[AZAKEI] ' + data.type + '（' + data.name + ' 様）',
            _template: 'table',
            'お名前': data.name,
            'ご所属': data.org || '—',
            email: data.email,
            '種類': data.type,
            'お問い合わせ内容': data.message
          })
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || res.status);
        form.reset();
        form.type.dispatchEvent(new Event('change'));
        form.message.dispatchEvent(new Event('input'));
        status.textContent = '送信しました。ありがとうございます！内容を確認のうえ、ご連絡いたします。';
      } catch (e) {
        console.error(e);
        // 送れなかったときは、書いた内容をそのままメールで送れるようにする（内容は消さない）
        if (cfg.email) {
          const body = `お名前: ${data.name}\nご所属: ${data.org || '-'}\nメール: ${data.email}\n種類: ${data.type}\n\n${data.message}`;
          const href = `mailto:${cfg.email}?subject=${encodeURIComponent('[AZAKEI] ' + data.type + '（' + data.name + ' 様）')}&body=${encodeURIComponent(body)}`;
          status.innerHTML = '送信に失敗しました。お手数ですが、<a href="' + href + '">こちらからメールで送る</a>（入力した内容が入った状態で開きます）か、<a href="' + cfg.instagram.url + '" target="_blank" rel="noopener">Instagram の DM</a> からご連絡ください。';
        } else {
          status.textContent = '送信に失敗しました。時間をおいて再度お試しいただくか、Instagram の DM からご連絡ください。';
        }
      } finally {
        btn.disabled = false;
      }
      return;
    }

    if (cfg.email) {
      const body = `お名前: ${data.name}\nご所属: ${data.org || '-'}\nメール: ${data.email}\n種別: ${data.type}\n\n${data.message}`;
      location.href = `mailto:${cfg.email}?subject=${encodeURIComponent('[AZAKEI] ' + data.type)}&body=${encodeURIComponent(body)}`;
      status.textContent = 'メールソフトを開きました。そのまま送信してください。';
      return;
    }

    status.innerHTML = 'フォームは現在準備中です。お手数ですが <a href="' + cfg.instagram.url + '" target="_blank" rel="noopener">Instagram（' + cfg.instagram.handle + '）の DM</a> からご連絡ください。';
  });
})();
