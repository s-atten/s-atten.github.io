var currentUser;
var userData;
var db = firebase.firestore();
var variables = {
	site: 'http://localhost:8080/',
	usernameContainer: 'dw-name',
	emailContainer: 'dw-email',
	profilePicConainer: 'dw-pic',
	profilePicConainer2: 'dw-pic-2',
	logOutContainer: 'dw-signout'
}

initApp = function() {
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			currentUser = firebase.auth().currentUser;
			displayUserInfoInMenu(currentUser);
			initListener();

		} else {
			// User is signed out.
			currentUser = null;
			userData = null;
			showError('Logging Out');
			window.location.href = variables.site;
		}
	}, function(error) {
		showError('Something went wrong');
		console.log(error);
	});
};

function refreshUserData() {
	var qr = firebase.firestore().collection('users').doc(currentUser.uid);
	qr.get().then(function(doc){
		if(doc.exists) {
			userData = doc.data();
			initUI();
			console.log('Refreshed user data');
		} else {
			showError('Can\t find user data in database');
			console.log('User not properly registered');
		}
	}).catch(function(error){
		userData = null;
		console.log(error);
	});
}

function displayUserInfoInMenu(user) {
	document.getElementById(variables.usernameContainer).textContent = user.displayName;
	document.getElementById(variables.emailContainer).textContent = user.email;
	document.getElementById(variables.profilePicConainer).src = user.photoURL;
	document.getElementById(variables.profilePicConainer2).src = user.photoURL;
}

window.addEventListener('load', function() {
	initApp();
	document.getElementById(variables.logOutContainer).addEventListener('click', function(event) {
		firebase.auth().signOut();
	});
});

function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function unescapeHtml(text) {
	var map = {
    '&amp;' : '&',
    '&lt;' : '<',
    '&gt;' : '>',
    '&quot;' : '"',
    '&#039;': "'" 
  };

  return text.replace(/(&amp;|&lt;|&gt;|&#039;|&quot;)/g, function(m) { return map[m]; });
}

function showError(str) {
	console.log(str)
}

firebase.firestore().enablePersistence()
  .catch(function(err) {
      if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
      } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
      }
  });