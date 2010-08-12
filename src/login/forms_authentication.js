var sys = require('sys'),
    authPaths = [];

require('cookie');

function formsAuthentication() {
  return function(req, res, next) {
    var user = req.getCookie('user');

    var authenticate = function(callback) {
      if(user) {
        callback();
      } else {
        res.redirect('/login?redirect_url=' + req.originalUrl);
      }
    };

    req.authenticated = authenticate;

    if(matchesProtectedPath(req.originalUrl)) {
      authenticate(next);
    } else {
      next();
    }
  };
};

function matchesProtectedPath(path) {
  var i = 0;
  for(i; i < authPaths.length; i += 1) {
    if(path.indexOf(authPaths[i]) == 0) {
      return true;
    }
    return false;
  }
};

function login(req, res) {
  res.setCookie('user', req.body.userName); 
};

function logout(req, res) {
  res.clearCookie('user');
};

function addProtectedPath(path) {
  authPaths.push(path);
};

module.exports.addProtectedPath = addProtectedPath;
module.exports.formsAuthentication = formsAuthentication;
module.exports.login = login;
module.exports.logout = logout;
