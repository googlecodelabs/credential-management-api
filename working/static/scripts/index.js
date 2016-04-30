app.onReg = function() {
  var form = document.querySelector('#regForm');
  fetch('/register', {
    method: 'POST',
    credentials: 'include',
    body: new FormData(form)
  })
  .then(function(res) {
    if (res.status === 200) {
      if (navigator.credentials) {
        var cred = new PasswordCredential(form);
        navigator.credentials.store(cred)
        .then(function() {
          location.href = '/main?quote=You are registered';
        });
      } else {
        location.href = '/main?quote=You are registered';
      }
    } else {
      app.fire('show-toast', {
        text: 'Registration failed'
      });
    }
  }, function() {
    app.fire('show-toast', {
      text: 'Registration failed'
    });
  });
};

app.onSignIn = function() {
  autoSignIn(false)
  .then(function() {
    location.href = '/main';
  }, function() {
    location.href = '/signin';
  });
};
