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
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = '/auth/google';

        var id_token = document.createElement('input');
        id_token.name = 'id_token';
        id_token.value = googleUser.getAuthResponse().id_token;
        form.appendChild(id_token);

        var csrf_token = document.createElement('input');
        csrf_token.name = 'csrf_token';
        csrf_token.value = document.querySelector('#csrf_token').value;
        form.appendChild(csrf_token);

        document.body.appendChild(form);
        form.submit();
      }).catch(function() {
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
      fbSignIn().then(function(res) {
        // On successful authentication with Facebook
        if (res.status == 'connected') {
          var form = document.createElement('form');
          form.method = 'POST';
          form.action = '/auth/facebook';

          var access_token = document.createElement('input');
          access_token.name = 'access_token';
          access_token.value = res.authResponse.accessToken;
          form.appendChild(access_token);

          var csrf_token = document.createElement('input');
          csrf_token.name = 'csrf_token';
          csrf_token.value = document.querySelector('#csrf_token').value;
          form.appendChild(csrf_token);

          document.body.appendChild(form);
          form.submit();
        } else {
          // When authentication was rejected by Facebook
          return Promise.reject();
        }
      }).catch(function() {
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
