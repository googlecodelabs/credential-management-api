var regForm = document.querySelector('#regForm');
regForm.addEventListener('submit', function(e) {
  e.preventDefault();

  fetch('/register', {
    method: 'POST',
    credentials: 'include',
    body: new FormData(regForm)
  }).then(function(res) {
    if (res.status === 200) {
      location.href = '/main?quote=You are registered';
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
  location.href = '/signin';
});
