var autoSignIn = function(unmediated) {
  if (navigator.credentials) {
    return navigator.credentials.get({
      password: true,
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

autoSignIn(true).then(function() {
  location.href = '/main?quote=You are automatically signed in';
}, function() {
  console.log('auto sign-in skipped');
});
