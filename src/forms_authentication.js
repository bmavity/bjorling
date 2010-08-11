var sys = require('sys');

require('cookie');

module.exports = function forms_authentication() {
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

