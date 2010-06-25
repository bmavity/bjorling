var kiwi = require('kiwi'),
	sys = require('sys');

kiwi.require('express');

configure(function() {
	use(MethodOverride);
	use(ContentLength);
	use(Logger);
	
	set('root', __dirname);
});

get('/', function() {
	var self = this;
	
	self.render('blog_index.html.haml', {
		locals: {
			title: 'Blog'
		}
	});
});

run();