var autoSignIn = function(unmediated) {
  if (navigator.credentials) {
    return navigator.credentials.get({
      password: true,
      unmediated: unmediated
    })
    .then(function(cred) {
      if (cred) {
        cred.additionalData = new FormData();
        switch (cred.type) {
          case 'password':
            cred.idName = 'email';
            return cred;
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
