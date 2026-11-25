const CACHE = 'talking-v4';
const FILES = ['./', './index.html', './styles.css', './app.js', './data.js', './manifest.json', './assets/icon.svg', './version.js', './vendor/capacitor.js', './vendor/speech-recognition.js', './fonts/fraunces-latin-full-normal.woff2', './fonts/fraunces-latin-full-italic.woff2', './fonts/inter-latin-wght-normal.woff2'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
