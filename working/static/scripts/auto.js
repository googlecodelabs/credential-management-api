var autoSignIn = function(unmediated) {
  if (navigator.credentials) {
    return navigator.credentials.get({
      password: true,
      federated: {
        providers: [ GOOGLE_SIGNIN, FACEBOOK_LOGIN ]
      },
      unmediated: unmediated
    })
    .then(function(cred) {
      if (cred) {
        cred.additionalData = new FormData();
        switch (cred.type) {
          case 'password':
            cred.idName = 'email';
            return cred;
          case 'federated':
            switch (cred.provider) {
              case GOOGLE_SIGNIN:
                return gSignIn(cred.id)
                .then(function(googleUser) {
                  var id_token = googleUser.getAuthResponse().id_token;
                  cred.additionalData.append('id_token', id_token);
                  return cred;
                });
              case FACEBOOK_LOGIN:
                return fbSignIn()
                .then(function(res) {
                  var access_token = res.authResponse.accessToken;
                  cred.additionalData.append('access_token', access_token);
                  return cred;
                });
            }
        }
        return Promise.reject();
      } else {
        return Promise.reject();
      }
    })
    .then(function(cred) {
      var url = '';
      var csrf_token = document.querySelector('#csrf_token').value;
      cred.additionalData.append('csrf_token', csrf_token);
      if (cred.type === 'password') {
        url = '/auth/password';
      } else {
        if (cred.provider === GOOGLE_SIGNIN) {
          url = '/auth/google';
        } else if (cred.provider === FACEBOOK_LOGIN) {
          url = '/auth/facebook';
        }
      }
      return fetch(url, {
        method: 'POST',
        credentials: cred
      })
      .then(function(res) {
        if (res.status === 200) {
          return Promise.resolve();
        } else {
          return Promise.reject();
        }
      });
    }).catch(function() {
      return Promise.reject();
    });
  } else {
    return Promise.reject();
  }
};
autoSignIn(true).then(function() {
  location.href = '/main?quote=You are automatically signed in';
}, function() {
  console.log('auto sign-in skipped');
});
