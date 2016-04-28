var PASSWORD_LOGIN = 'password';
var GOOGLE_SIGNIN  = 'https://accounts.google.com';
var FACEBOOK_LOGIN = 'https://www.facebook.com';
var DEFAULT_IMG    = location.origin+'/images/default_img.png';

/**
 * Let user sign-in using Google Sign-in
 * @param  {String} id Preferred Gmail address for user to sign-in
 * @return {Promise} Returns result of authFlow
 */
var gSignIn = function(id) {
  var auth2 = gapi.auth2.getAuthInstance();
  return auth2.signIn({
    // Set `login_hint` to specify an intended user account,
    // otherwise user selection dialog will popup.
    login_hint: id || ''
  });
};

/**
 * Let user sign-in using Facebook Login
 * @return {Promise} Returns result of authFlow
 */
var fbSignIn = function() {
  // Return Promise after Facebook Login dance.
  return new Promise(function(resolve, reject) {
    FB.getLoginStatus(function(res) {
      if (res.status == 'connected') {
        resolve(res);
      } else {
        FB.login(resolve, {scope: 'email'});
      }
    });
  });
};

// Initialise Facebook Login
FB.init({
  // Replace this with your own App ID
  appId:    FB_APPID,
  cookie:   true,
  xfbml:    false,
  version:  'v2.5'
});

// Initialise Google Sign-In
gapi.load('auth2', function() {
  gapi.auth2.init();
});
