var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/css/attendance.css',
  '/css/loginpage.css',
  '/js/attendance.js',
  '/js/chart.js',
  '/js/firebase-auth.js',
  '/js/firebase-init.js',
  '/js/firebaseUI-init.js',
  '/js/moment.js'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});