/* ================================================================
   sw.js — オフラインでも開けるように（ホーム画面に追加したとき用）
     ・ページ（HTML）    … まずネットから最新を。つながらないときだけ保存しておいたものを出す
     ・?v= つきの CSS/JS … 版ごとに URL が変わるので、一度読んだものは保存版を使う
     ・写真・アイコン     … 保存版を出しつつ、裏で新しいものに入れかえる
     ・フォントなど外部   … 同上
     ・Firebase や送信（POST）は触らない
   ================================================================ */
const CACHE = 'azakei-v2';
const CORE = ['./', 'index.html', 'quiz.html', 'diagnosis.html', 'offline.html', 'icon-192.png', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const put = (req, res) => {
  if (res && (res.ok || res.type === 'opaque')) caches.open(CACHE).then(c => c.put(req, res.clone()));
  return res;
};

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Firebase・アナリティクス・フォーム送信などは、そのままネットへ
  if (/firestore|googleapis\.com\/(identitytoolkit|securetoken)|google-analytics|googletagmanager|formsubmit|firebaseinstallations/.test(url.href)) return;

  // ページ：ネット優先
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => put(req, res))
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('offline.html'))));
    return;
  }

  const same = url.origin === self.location.origin;
  // 版つきの CSS/JS：保存版があればそれを使う
  if (same && url.searchParams.has('v')) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => put(req, res))));
    return;
  }
  // 写真・アイコン・フォント・Firebase の本体など：保存版を出しつつ裏で更新
  if (same || /fonts\.(googleapis|gstatic)\.com|www\.gstatic\.com\/firebasejs/.test(url.href)) {
    e.respondWith(caches.match(req).then(r => {
      const net = fetch(req).then(res => put(req, res)).catch(() => r);
      return r || net;
    }));
  }
});
