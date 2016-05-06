/**
 *
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
  Although this sample app is using Polymer, most of the interactions are
  handled using regular APIs so you don't have to learn about it.
 */
var app = document.querySelector('#app');
// `selected` is used to show a portion of our page
app.selected = 0;
// Set an event listener to show a toast. (Polymer)
app.listeners = {
  'show-toast': 'showToast'
};

app.addEventListener('dom-change', function() {
  /**
   * When google sign-in button is pressed.
   * @return {void}
   */
  var gsignin = document.querySelector('#gsignin');
  if (gsignin) {
    gsignin.addEventListener('click', function() {
      gSignIn()
      .then(function(googleUser) {
        // Now user is successfully authenticated with Google.
        // Send ID Token to the server to authenticate with our server.
        var form = new FormData();
        form.append('id_token', googleUser.getAuthResponse().id_token);
        form.append('csrf_token', document.querySelector('#csrf_token').value);

        return fetch('/auth/google', {
          method: 'POST',
          credentials: 'include',
          body: form
        }).then(function(res) {
          if (res.status === 200) {
            if (navigator.credentials) {
              var profile = googleUser.getBasicProfile();
              var cred = new FederatedCredential({
                id: profile.getEmail(),
                name: profile.getName(),
                iconURL: profile.getImageUrl(),
                provider: GOOGLE_SIGNIN
              });
              return navigator.credentials.store(cred);
            } else {
              return Promise.resolve();
            }
          } else {
            return Promise.reject();
          }
        });
      }).then(function() {
        location.href = '/main?quote=You are signed in with Google SignIn';
      }, function() {
        app.fire('show-toast', {
          text: 'Google Sign-In failed'
        });
      });
    });
  }

  /**
   * When facebook login button is pressed.
   * @return {void}
   */
  var fbsignin = document.querySelector('#fbsignin');
  if (fbsignin) {
    fbsignin.addEventListener('click', function() {
      var access_token = '';
      fbSignIn()
      .then(function(res) {
        return new Promise(function(resolve, reject) {
          // On successful authentication with Facebook
          if (res.status == 'connected') {
            access_token = res.authResponse.accessToken;
            FB.api('/me', resolve);
          } else {
            // When authentication was rejected by Facebook
            reject();
          }
        });
      })
      .then(function(profile) {
        var form = new FormData();
        form.append('access_token', access_token);
        form.append('csrf_token', document.querySelector('#csrf_token').value);

        return fetch('/auth/facebook', {
          method: 'POST',
          credentials: 'include',
          body: form
        }).then(function(res) {
          if (res.status === 200) {
            if (navigator.credentials) {
              var cred = new FederatedCredential({
                id: profile.id,
                name: profile.name,
                iconURL: 'https://graph.facebook.com/'+
                  profile.id+'/picture?width=96&height=96',
                provider: FACEBOOK_LOGIN
              });
              return navigator.credentials.store(cred);
            } else {
              return Promise.resolve();
            }
          }
        });
      }).then(function() {
        location.href = '/main?quote=You are signed in with Facebook Login';
      }, function() {
        app.fire('show-toast', {
          text: 'Facebook login failed'
        });
      });
    });
  }

  var url = new URL(location.href);
  var params = new URLSearchParams(url.search.slice(1));
  if (params.get('quote')) {
    app.fire('show-toast', {
      text: params.get('quote')
    });
  }
});

/**
 * Polymer event handler to show a toast.
 * @param  {Event} e Polymer custom event object
 * @return {void}
 */
app.showToast = function(e) {
  this.$.toast.text = e.detail.text;
  this.$.toast.show();
};
