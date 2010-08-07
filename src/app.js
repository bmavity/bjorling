var sys = require('sys'),
    connect = require('connect'),
    app = require('express').createServer(),
    repo = require('./mongo_repository'),
    pub = __dirname + '/public';

var appRoutes = {
  root: '/',
  post: this.root + 'posts/:slug'
};

app.set('view engine', 'jade');

app.use(connect.logger());
app.use(connect.bodyDecoder());
app.use(connect.methodOverride());
app.use(connect.compiler({ src: pub, enable: ['sass'] }));
app.use(connect.staticProvider(pub));
app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));

app.get(appRoutes.root, function(req, res) {
  repo.findAll(function(err, results) {
    res.render('blog_index', {
      locals: {
        posts: results
      }
    });
  });
});

app.post('/posts', function(req, res) {
  repo.save({ author: 'Brian Mavity', postedOn: new Date() });
  res.send('');
});

app.get(appRoutes.post, function(req, res) {
  repo.find(req.params.slug, function(post) {
    res.render('post_index', {
      locals: {
        post: post
      }
    });
  });
});

app.listen(8000);
