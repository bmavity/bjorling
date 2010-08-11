var sys = require('sys'),
    connect = require('connect'),
    auth = require('./forms_authentication'),
    app = require('express').createServer();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.get('/login', function(req, res) {
  res.render('login', {
    locals: {
      action_url: 'login?redirect_url=' + (req.query.redirect_url ? req.query.redirect_url : '/')
    }
  });
});

app.post('/login', function(req, res) {
  auth.login(req, res);
  res.redirect(req.query.redirect_url);
});

app.get('/logout', function(req, res) {
  auth.logout(req, res);
  res.redirect('/');
});

module.exports = app;
