var sys = require('sys'),
    connect = require('connect'),
    auth = require('connect-auth'),
    app = require('express').createServer(),
    repo = require('./mongo_repository'),
    pub = __dirname + '/public';

var basic = Auth.Http({
  getPasswordForUser: function(username, callback) {
    callback(null, 'a'); 
  },
  useBasic: true
});

var appRoutes = (function(appRoot) {
  var that = {};
  that.root = '/';
  that.admin = that.root + 'admin/';
  that.post = that.root + 'posts/';
  that.blogAdmin = that.admin + 'blog/';
  return that;
})();

app.set('view engine', 'jade');

app.use(connect.logger());
app.use(connect.bodyDecoder());
app.use(connect.methodOverride());
app.use(connect.compiler({ src: pub, enable: ['sass'] }));
app.use(connect.staticProvider(pub));
app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
app.use(connect.cookieDecoder());
app.use(connect.session());
app.use(Auth(basic));

app.get(appRoutes.root, function(req, res) {
  repo.findAll(function(err, results) {
    res.render('blog_index', {
      locals: {
        posts: results
      }
    });
  });
});

app.post(appRoutes.post, function(req, res) {
  req.authenticate(['http'], function(error, authenticated) {
    sys.puts(sys.inspect(req));
    res.send('');
  });
});

app.get(appRoutes.post + ':slug', function(req, res) {
  repo.find(req.params.slug, function(post) {
    res.render('post_index', {
      locals: {
        post: post
      }
    });
  });
});

app.get(appRoutes.blogAdmin, function(req, res) {
  res.render('blog_admin', {
    locals: {
      s: 'Blog Administration'
    }
  });
});

app.listen(8000);
