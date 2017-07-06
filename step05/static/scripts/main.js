var signout = document.querySelector('#signout');
signout.addEventListener('click', function() {
  // TODO 8-1: Turn off auto sign-in when a user signs out
  location.href = '/signout';
});

var unregForm = document.querySelector('#unregForm');
unregForm.addEventListener('submit', function(e) {
  e.preventDefault();

  fetch('/unregister', {
    method: 'POST',
    credentials: 'include',
    body: new FormData(unregForm)
  }).then(function(res) {
    if (res.status === 200) {
      // TODO 8-2: Turn off auto sign-in when a user unregisters
      location.href = '/?quote=You are unregistered';
    } else {
      app.fire('show-toast', {
        text: 'Unregister failed'
      });
    }
  }, function() {
    app.fire('show-toast', {
      text: 'Unregister failed'
    });
  });
});
