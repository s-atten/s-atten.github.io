var config = {
	apiKey: "AIzaSyANT4EpshJExss64j6_ZPL-ehLOyQPgOxQ",
	authDomain: "st-info.firebaseapp.com",
	databaseURL: "https://st-info.firebaseio.com",
	projectId: "st-info",
	storageBucket: "st-info.appspot.com",
	messagingSenderId: "64383851995"
};

firebase.initializeApp(config);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}