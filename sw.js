/* ================================================================
   sw.js 窶・騾壻ｿ｡縺碁≦縺・→縺阪・縺､縺ｪ縺後ｉ縺ｪ縺・→縺阪ｂ髢九￠繧九ｈ縺・↓
     繝ｻ繝壹・繧ｸ・・TML・・   窶ｦ 繝阪ャ繝医°繧画怙譁ｰ繧偵ゅ◆縺縺嶺ｿ晏ｭ倡沿縺後≠繧後・縲・ 遘貞ｾ・▲縺ｦ繧よ擂縺ｪ縺・→縺阪・菫晏ｭ倡沿繧貞・縺・                          ・医ロ繝・ヨ縺ｮ蛻・・陬上〒蜿励￠蜿悶▲縺ｦ菫晏ｭ倥＠縲∵ｬ｡縺ｫ髢九＞縺溘→縺阪↓譁ｰ縺励￥縺ｪ繧具ｼ・     繝ｻ?v= 縺､縺阪・ CSS/JS 窶ｦ 迚医＃縺ｨ縺ｫ URL 縺悟､峨ｏ繧九・縺ｧ縲∽ｸ蠎ｦ隱ｭ繧薙□繧ゅ・縺ｯ菫晏ｭ倡沿繧剃ｽｿ縺・     繝ｻ蜀咏悄繝ｻ繧｢繧､繧ｳ繝ｳ     窶ｦ 菫晏ｭ倡沿繧貞・縺励▽縺､縲∬｣上〒譁ｰ縺励＞繧ゅ・縺ｫ蜈･繧後°縺医ｋ
     繝ｻ繝輔か繝ｳ繝医↑縺ｩ螟夜Κ   窶ｦ 蜷御ｸ・     繝ｻFirebase 繧・∽ｿ｡・・OST・峨・隗ｦ繧峨↑縺・     繝ｻ荳蠎ｦ繧ｵ繧､繝医ｒ髢九＞縺溘ｉ縲∽ｸｻ縺ｪ繝壹・繧ｸ縺ｨ縺昴・隕九◆逶ｮ・・SS・峨・蜈ｱ騾壹・ JS 繧定｣上〒菫晏ｭ倥＠縺ｦ縺翫￥
   ================================================================ */
const CACHE = 'azakei-v243';
const VER = '20261114f'; // ?v= 縺ｨ蜷後§・亥・髢九・縺溘・縺ｫ縲√⊇縺九・繝輔ぃ繧､繝ｫ縺ｨ縺・▲縺励ｇ縺ｫ譖ｸ縺阪°繧上ｋ・・const CORE = ['./', 'index.html', 'quiz.html', 'diagnosis.html', 'offline.html', 'icon-192.png', 'manifest.webmanifest'];
const PAGES = ['about', 'report', 'activities', 'azakei', 'contact', 'contests', 'events', 'festival', 'glossary', 'mypage', 'sim', 'vote', 'sponsor', 'policy', 'privacy', 'sitemap'];
const EXTRA_PAGES = ['sponsor-kit.html', 'en.html']; // 蜊碑ｳ帙・雉・侭・郁ｦ九◆逶ｮ縺ｯ繝壹・繧ｸ縺ｮ荳ｭ・峨→縲∬恭隱槭・繝壹・繧ｸ繧・const SHARED_JS = ['content', 'layout', 'brand', 'nav', 'reveal', 'site', 'render', 'yearplan', 'pagetoc', 'osatsu'];
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
    // 谿九ｊ縺ｮ繝壹・繧ｸ繝ｻCSS繝ｻ蜈ｱ騾・JS 縺ｯ縲・ 縺､縺壹▽陬上〒菫晏ｭ假ｼ亥､ｱ謨励＠縺ｦ繧よｰ励↓縺励↑縺・ｼ・    .then(() => caches.open(CACHE).then(async c => { for (const u of LATER) { try { if (!(await c.match(u))) await c.add(u); } catch (x) {} } })));
});

const put = (req, res) => {
  if (res && (res.ok || res.type === 'opaque')) caches.open(CACHE).then(c => c.put(req, res.clone()));
  return res;
};

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Firebase繝ｻ繧｢繝翫Μ繝・ぅ繧ｯ繧ｹ繝ｻ繝輔か繝ｼ繝騾∽ｿ｡縺ｪ縺ｩ縺ｯ縲√◎縺ｮ縺ｾ縺ｾ繝阪ャ繝医∈
  if (/firestore|googleapis\.com\/(identitytoolkit|securetoken)|google-analytics|googletagmanager|formsubmit|firebaseinstallations/.test(url.href)) return;

  // 繝壹・繧ｸ・壹ロ繝・ヨ蜆ｪ蜈医ゅ◆縺縺嶺ｿ晏ｭ倡沿縺後≠繧後・ 3 遘偵〒隕句・繧翫ｒ縺､縺代ｋ
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
  // 迚医▽縺阪・ CSS/JS・壻ｿ晏ｭ倡沿縺後≠繧後・縺昴ｌ繧剃ｽｿ縺・  if (same && url.searchParams.has('v')) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => put(req, res))));
    return;
  }
  // 蜀咏悄繝ｻ繧｢繧､繧ｳ繝ｳ繝ｻ繝輔か繝ｳ繝医・Firebase 縺ｮ譛ｬ菴薙↑縺ｩ・壻ｿ晏ｭ倡沿繧貞・縺励▽縺､陬上〒譖ｴ譁ｰ
  if (same || /fonts\.(googleapis|gstatic)\.com|www\.gstatic\.com\/firebasejs/.test(url.href)) {
    e.respondWith(caches.match(req).then(r => {
      const net = fetch(req).then(res => put(req, res)).catch(() => r);
      return r || net;
    }));
  }
});
