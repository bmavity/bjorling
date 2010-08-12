var sys = require('sys');

require('cookie');

function formsAuthentication() {
  return function(req, res, next) {
    var user = req.getCookie('user'),
        redirectUrl = req.originalUrl;

    req.authenticated = function(callback) {
      if(user) {
        callback(user);
      } else {
        res.redirect('/login?redirect_url=' + redirectUrl);
      }
    };

    if(user) {
      next();
    } else {
      res.redirect('/login?redirect_url=' + redirectUrl);
    }
  };
};

function login(req, res) {
  res.setCookie('user', req.body.userName); 
};

function logout(req, res) {
  res.clearCookie('user');
};

module.exports.formsAuthentication = formsAuthentication;
module.exports.login = login;
module.exports.logout = logout;
