var autoSignIn = function(mode) {
  if (cmapiAvailable) {
    return navigator.credentials.get({
      password: true,
      federated: {
        providers: [ GOOGLE_SIGNIN ]
      },
      mediation: mode
    }).then(function(cred) {
      if (cred) {
        var form = new FormData();
        var csrf_token = document.querySelector('#csrf_token').value;
        form.append('csrf_token', csrf_token);

        switch (cred.type) {
          case 'password':
            form.append('email', cred.id);
            form.append('password', cred.password);
            return fetch('/auth/password', {
              method: 'POST',
              credentials: 'include',
              body: form
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
  return autoSignIn('silent');
}).then(function() {
  location.href = '/main?quote=You are automatically signed in';
}, function() {
  console.log('auto sign-in skipped');
});
