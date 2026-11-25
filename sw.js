const CACHE = 'talking-v7';
const FILES = ['./', './index.html', './styles.css', './app.js', './data.js', './manifest.json', './assets/icon.svg', './version.js', './config.js', './vendor/supabase.js', './vendor/capacitor.js', './vendor/speech-recognition.js', './vendor/local-notifications.js', './fonts/bricolage-grotesque-latin-standard-normal.woff2', './fonts/inter-latin-wght-normal.woff2'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
