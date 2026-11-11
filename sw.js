/* 夜猫手机端 Service Worker：HTML 走网络优先，静态资源走缓存 */
const C = 'yemao-m-v4';
const ASSETS = ['./manifest.json', './games.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  // HTML：网络优先，失败才用缓存
  if (isHTML || url.pathname.endsWith('/index.html')) {
    e.respondWith(
      fetch(req).then(resp => {
        const cp = resp.clone();
        caches.open(C).then(c => c.put(req, cp));
        return resp;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // 其他资源：缓存优先
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(resp => {
      const cp = resp.clone();
      caches.open(C).then(c => c.put(req, cp));
      return resp;
    }).catch(() => null))
  );
});
