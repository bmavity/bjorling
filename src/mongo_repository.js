var sys = require('sys'),
    mongo = require('mongodb'),
    db = new mongo.Db('node-mongo-blog', new mongo.Server('localhost', 27017, { auto_reconnect: true }, {})),
    repo,
    uncalledCallback;

db.open(function(err, _db) {
  repo = _db;
  if(uncalledCallback) {
    uncalledCallback(err, repo);
    db.close();
    uncalledCallback = undefined;
  }
});

exports.repo = function(callback) {
  if(repo) {
    callback(null, repo);
    db.close();
  } else {
    uncalledCallback = callback;
  }
};

var session = function(callback) {
  repo.collection('posts', function(err, coll) {
    callback(coll);
  });
};
exports.session = session;

exports.findAll = function(callback) {
  session(function(collection) {
    collection.find({}, { sort: [['publishDate', 'desc']] }, function(err, cursor) {
      cursor.toArray(function(err, results) {
        callback(err, results);
      });
    });
  });
};

exports.find = function(slug, callback) {
  session(function(collection) {
    collection.findOne({ slug: slug }, function(err, post) {
      sys.puts(slug);
      sys.puts(sys.inspect(err));
      sys.puts(sys.inspect(post));
      callback(post);
    });
  });
};

exports.save = function(post) {
  session(function(collection) {
    collection.insert(post);
  });
};

exports.close = function() {
  db.close();
};
