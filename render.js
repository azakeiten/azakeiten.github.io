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

  function eventCard(e) {
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
    return `<${tag} class="event-row${e.past ? ' is-past' : ''}"${e.link ? ` href="${e.link}"` : ''}>
      <div class="event-when">${when}${badge}</div>
      <div class="event-main">
        <span class="chip">${e.tag || 'Event'}</span>
        <h3>${e.title}</h3>
        <p>${e.desc || ''}</p>
      </div>
      <div class="event-place">${e.place || ''}</div>
    </${tag}>`;
  }

  const renderers = {
    events(el) {
      const { upcoming, past } = sortedEvents();
      const limit = +el.dataset.limit || Infinity;
      if (el.dataset.scope === 'upcoming') {
        el.innerHTML = upcoming.slice(0, limit).map(eventCard).join('') || '<p class="empty">予定は準備中です。</p>';
        return;
      }
      el.innerHTML =
        `<h3 class="list-head">これから</h3>` +
        (upcoming.map(eventCard).join('') || '<p class="empty">予定は準備中です。</p>') +
        (past.length ? `<h3 class="list-head">これまで</h3>` + past.map(eventCard).join('') : '');
    },

    gallery(el) {
      const limit = +el.dataset.limit || Infinity;
      el.innerHTML = (D.gallery || []).slice(0, limit).map(g => g.src
        ? `<figure class="gallery-item"><img src="${g.src}" alt="${g.caption}" loading="lazy"><figcaption>${g.caption}${g.date ? `<span>${g.date}</span>` : ''}</figcaption></figure>`
        : `<figure class="gallery-item is-empty"><div class="gallery-ph">Photo<br>coming soon</div><figcaption>${g.caption}</figcaption></figure>`
      ).join('');
    },

    diary(el) {
      const limit = +el.dataset.limit || Infinity;
      const items = (D.diary || []).slice().sort((a, b) => a.date < b.date ? 1 : -1).slice(0, limit);
      el.innerHTML = items.map(d => `
        <article class="diary-item">
          <time>${fmt(d.date)}</time>
          <h3>${d.title}</h3>
          <p>${d.body}</p>
        </article>`).join('');
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

  /* ---- お問い合わせフォーム ---- */
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.getElementById('formStatus');
  const cfg = D.contact || {};

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (form.type) data.type = form.type.options[form.type.selectedIndex].text;
    if (data._gotcha) return; // スパム対策

    if (cfg.formEndpoint) {
      status.textContent = '送信中…';
      try {
        const res = await fetch(cfg.formEndpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        status.textContent = '送信しました。ありがとうございます！内容を確認のうえ、ご連絡いたします。';
      } catch (e) {
        status.textContent = '送信に失敗しました。時間をおいて再度お試しいただくか、Instagram の DM からご連絡ください。';
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
