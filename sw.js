// keeps the game on the device so it opens without a connection
const CACHE = 'mossbright-7e42855aae';
const LOCAL = ['./', 'manifest.webmanifest', 'icon-v21-192.png', 'icon-v21-512.png', 'icon-v21-180.png', 'icon-v21-mask.png'];
const REMOTE = ["https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js", "https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&family=Pixelify+Sans:wght@500;700&display=swap"];
self.addEventListener('install', e => e.waitUntil((async () => {
  const c = await caches.open(CACHE);
  await c.addAll(LOCAL);
  for (const u of REMOTE) {
    const r = await fetch(u, { mode: 'cors' });
    await c.put(u, r.clone());
    if (u.includes('fonts.googleapis')) for (const m of (await r.text()).matchAll(/url\((https:[^)]+)\)/g)) { try { await c.put(m[1], await fetch(m[1], { mode: 'cors' })); } catch (x) {} }
  }
  self.skipWaiting();
})()));
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('mossbright-') && k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const q = e.request;
  if (q.method !== 'GET') return;
  if (q.mode === 'navigate') { // newest version when online, the saved one when not
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try { const r = await Promise.race([fetch(q), new Promise((_, no) => setTimeout(no, 4000))]); if (r.ok) c.put('./', r.clone()); return r; }
      catch (x) { return (await c.match('./')) || Response.error(); }
    })());
    return;
  }
  e.respondWith((async () => {
    const hit = await caches.match(q, { ignoreVary: true });
    if (hit) return hit;
    const r = await fetch(q);
    if (r.ok && new URL(q.url).origin === location.origin) (await caches.open(CACHE)).put(q, r.clone());
    return r;
  })());
});
