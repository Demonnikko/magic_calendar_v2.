
const CACHE='magiccal-premium-v3';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll([
    './','./index.html','./style.css','./script.js',
    'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.9/index.global.min.js',
    'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.9/index.global.min.css'
  ])));
});
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
