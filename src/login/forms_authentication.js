var sys = require('sys');

require('cookie');

function formsAuthentication() {
  return function(req, res, next) {
    var user = req.getCookie('user');

    req.authenticated = function(callback) {
      if(user) {
        callback(user);
      } else {
        res.redirect('/login?redirect_url=' + req.url);
      }
    };

    if(user || req.url.indexOf('/admin') != 0) {
      next();
    } else {
      res.redirect('/login?redirect_url=' + req.url);
    }
  };
};

function login(req, res) {
  res.setCookie('user', req.body.userName); 
};

module.exports.formsAuthentication = formsAuthentication;
module.exports.login = login;
