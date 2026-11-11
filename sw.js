const C='yemao-m-v1';
const A=['./index.html','./games.json','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
  const cp=resp.clone();caches.open(C).then(c=>c.put(e.request,cp));return resp;
 }).catch(()=>caches.match('./index.html'))));});
