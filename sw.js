/* ================================================================
   sw.js — 通信が遅いとき・つながらないときも開けるように
     ・ページ（HTML）    … ネットから最新を。ただし保存版があれば、3 秒待っても来ないときは保存版を出す
                          （ネットの分は裏で受け取って保存し、次に開いたときに新しくなる）
     ・?v= つきの CSS/JS … 版ごとに URL が変わるので、一度読んだものは保存版を使う
     ・写真・アイコン     … 保存版を出しつつ、裏で新しいものに入れかえる
     ・フォントなど外部   … 同上
     ・Firebase や送信（POST）は触らない
     ・一度サイトを開いたら、主なページとその見た目（CSS）・共通の JS を裏で保存しておく
   ================================================================ */
const CACHE = 'azakei-v220';
const VER = '20261110e'; // ?v= と同じ（公開のたびに、ほかのファイルといっしょに書きかわる）
const CORE = ['./', 'index.html', 'quiz.html', 'diagnosis.html', 'offline.html', 'icon-192.png', 'manifest.webmanifest'];
const PAGES = ['about', 'report', 'activities', 'azakei', 'contact', 'contests', 'events', 'festival', 'glossary', 'mypage', 'sim', 'vote', 'sponsor', 'policy', 'privacy', 'sitemap'];
const EXTRA_PAGES = ['sponsor-kit.html', 'en.html']; // 協賛の資料（見た目はページの中）と、英語のページも
const SHARED_JS = ['content', 'layout', 'brand', 'nav', 'reveal', 'site', 'render', 'yearplan', 'pagetoc', 'osatsu'];
const LATER = [
  ...PAGES.map(p => p + '.html'), ...EXTRA_PAGES,
  ...['index', 'quiz', 'diagnosis', 'en', ...PAGES].map(p => `p-${p}.min.css?v=${VER}`),
  ...SHARED_JS.map(j => `${j}.js?v=${VER}`)
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
    // 残りのページ・CSS・共通 JS は、1 つずつ裏で保存（失敗しても気にしない）
    .then(() => caches.open(CACHE).then(async c => { for (const u of LATER) { try { if (!(await c.match(u))) await c.add(u); } catch (x) {} } })));
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

  // ページ：ネット優先。ただし保存版があれば 3 秒で見切りをつける
  if (req.mode === 'navigate') {
    const net = fetch(req).then(res => put(req, res));
    e.waitUntil(net.catch(() => {}));
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(saved => {
      if (!saved) return net.catch(() => caches.match('offline.html'));
      const wait = new Promise(r => setTimeout(() => r(saved), 3000));
      return Promise.race([net, wait]).catch(() => saved);
    }));
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
