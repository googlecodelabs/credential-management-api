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

var cmapiAvailable = !!window.PasswordCredential;

/*
  Although this sample app is using Polymer, most of the interactions are
  handled using regular APIs so you don't have to learn about it.
 */
var app = document.querySelector('#app');
// Set an event listener to show a toast. (Polymer)
app.listeners = {
  'show-toast': 'showToast'
};

/**
 * Polymer event handler to show a toast.
 * @param  {Event} e Polymer custom event object
 * @return {void}
 */
app.showToast = function(e) {
  this.$.toast.text = e.detail.text;
  this.$.toast.show();
};

app.addEventListener('dom-change', function() {
  var url = new URL(location.href);
  var params = new URLSearchParams(url.search.slice(1));
  if (params.get('quote')) {
    app.fire('show-toast', {
      text: params.get('quote')
    });
  }
});

/**
 * When google sign-in button is pressed.
 * @return {void}
 */
var gsignin = document.querySelector('#gsignin');
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
        if (cmapiAvailable) {
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
