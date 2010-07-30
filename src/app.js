var sys = require('sys'),
	connect = require('connect'),
	app = require('express').createServer(),
    repo = require('./mongo_repository'),
	pub = __dirname + '/public';

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(connect.logger());
app.use(connect.bodyDecoder());
app.use(connect.methodOverride());
app.use(connect.compiler({ src: pub, enable: ['sass'] }));
app.use(connect.staticProvider(pub));
	
app.configure('development', function() {
	app.set('reload views', 1000);
	
	app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
	
	sys.puts('dev configure');
});

app.configure('production', function() {
	app.use(connect.errorHandler());
	
	sys.puts('prod configure');
});


app.get('/', function(req, res) {
    repo.findAll(function(err, results) {
        results.each(function(err, item) {
            sys.puts(sys.inspect(item));
        });
        res.render('blog_index', {
            locals: {
                title: 'Blog'
            }
        });
    });
});

app.post('/posts', function(req, res) {
    repo.save();
    res.send('');
});

app.listen(8000);
