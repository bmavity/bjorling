var sys = require('sys'),
    connect = require('connect'),
    forms = require('./forms_authentication'),
    app = require('express').createServer(),
    repo = require('./mongo_repository'),
    pub = __dirname + '/public';

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
app.use(forms());

app.get(appRoutes.root, function(req, res) {
  repo.findAll(function(err, results) {
    res.render('blog_index', {
      locals: {
        posts: results
      }
    });
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

app.post(appRoutes.post, function(req, res) {
  repo.save({
    author: 'Brian',
    content: req.body.postContent,
    publishDate: new Date(),
    slug: req.body.slug,
    title: req.body.title
  }, function() {
    res.redirect(appRoutes.post + req.body.slug);
  });
});

app.get(appRoutes.blogAdmin, function(req, res) {
  res.render('blog_admin', {
    locals: {
      pageTitle: 'Blog Administration'
    }
  });
});

app.get(appRoutes.blogAdmin + ':pageName', function(req, res) {
  res.render(req.params.pageName, {
    locals:{
      submitPostUrl: appRoutes.post
    }
  });
});

app.listen(8000);
