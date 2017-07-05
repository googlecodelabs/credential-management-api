var form = document.querySelector('#form');
form.addEventListener('submit', function(e) {
  e.preventDefault();

  fetch('/auth/password', {
    method: 'POST',
    credentials: 'include',
    body: new FormData(form)
  }).then(function(res) {
    if (res.status === 200) {
      if (cmapiAvailable) {
        var cred = new PasswordCredential(form);
        navigator.credentials.store(cred)
        .then(function() {
          location.href = '/main?quote=You are signed in';
        });
      } else {
        location.href = '/main?quote=You are signed in';
      }
    } else {
      app.fire('show-toast', {
        text: 'Authentication failed'
      });
    }
  }, function() {
    app.fire('show-toast', {
      text: 'Authentication failed'
    });
  });
});
