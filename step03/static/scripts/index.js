var regForm = document.querySelector('#regForm');
regForm.addEventListener('submit', function(e) {
  e.preventDefault();

  fetch('/register', {
    method: 'POST',
    credentials: 'include',
    body: new FormData(regForm)
  }).then(function(res) {
    if (res.status === 200) {
      if (cmapiAvailable) {
        var cred = new PasswordCredential(regForm);
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
});

var signin = document.querySelector('#signin');
signin.addEventListener('click', function() {
  autoSignIn()
  .then(function() {
    location.href = '/main?quote=You are signed in';
  }, function() {
    location.href = '/signin';
  });
});
