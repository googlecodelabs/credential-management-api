var PASSWORD_LOGIN = 'password';
var GOOGLE_SIGNIN  = 'https://accounts.google.com';
var DEFAULT_IMG    = location.origin+'/images/default_img.png';

/**
 * Let user sign-in using Google Sign-in
 * @param  {String} id Preferred Gmail address for user to sign-in
 * @return {Promise} Returns result of authFlow
 */
var gSignIn = function(id) {
  var auth2 = gapi.auth2.getAuthInstance();
  if (auth2.isSignedIn.get()) {
    // Check if currently signed in user is the same as intended.
    var googleUser = auth2.currentUser.get();
    if (googleUser.getBasicProfile().getEmail() === id) {
      return Promise.resolve(googleUser);
    }
  }
  return auth2.signIn({
    // Set `login_hint` to specify an intended user account,
    // otherwise user selection dialog will popup.
    login_hint: id || ''
  });
};

// Initialize Google Sign-In
var googleAuthReady = new Promise(function(resolve) {
  gapi.load('auth2', function() {
    gapi.auth2.init().then(function() {
      resolve();
    });
  });
});

