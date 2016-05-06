var autoSignIn = function(unmediated) {
  if (navigator.credentials) {
    return navigator.credentials.get({
      password: true,
      federated: {
        providers: [ GOOGLE_SIGNIN, FACEBOOK_LOGIN ]
      },
      unmediated: unmediated
    }).then(function(cred) {
      if (cred) {
        var form = new FormData();
        var csrf_token = document.querySelector('#csrf_token').value;
        form.append('csrf_token', csrf_token);

        switch (cred.type) {
          case 'password':
            cred.additionalData = form;
            cred.idName = 'email';
            return fetch('/auth/password', {
              method: 'POST',
              credentials: cred
            });
          case 'federated':
            switch (cred.provider) {
              case GOOGLE_SIGNIN:
                return gSignIn(cred.id)
                .then(function(googleUser) {
                  var id_token = googleUser.getAuthResponse().id_token;
                  form.append('id_token', id_token);
                  return fetch('/auth/google', {
                    method: 'POST',
                    credentials: 'include',
                    body: form
                  });
                });
              case FACEBOOK_LOGIN:
                return fbSignIn()
                .then(function(res) {
                  var access_token = res.authResponse.accessToken;
                  form.append('access_token', access_token);
                  return fetch('/auth/facebook', {
                    method: 'POST',
                    credentials: 'include',
                    body: form
                  });
                });
            }
        }
        return Promise.reject();
      } else {
        return Promise.reject();
      }
    }).then(function(res) {
      if (res.status === 200) {
        return Promise.resolve();
      } else {
        return Promise.reject();
      }
    });
  } else {
    return Promise.reject();
  }
};

googleAuthReady.then(function() {
  return autoSignIn(true);
}).then(function() {
  location.href = '/main?quote=You are automatically signed in';
}, function() {
  console.log('auto sign-in skipped');
});
