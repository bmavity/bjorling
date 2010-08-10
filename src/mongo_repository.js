var sys = require('sys'),
    mongo = require('mongodb'),
    _db = new mongo.Db('node-mongo-blog', new mongo.Server('localhost', 27017, { auto_reconnect: true }, {})),
    db,
    dbCallback,
    postsCollection,
    postsCollectionCallback;

_db.open(function(err, dbResult) {
  db = dbResult;
  if(dbCallback) {
    dbCallback(err, db);
    dbCallback = undefined;
  }
  db.collection('posts', function(err, collection) {
    postsCollection = collection;
    if(postsCollectionCallback) {
      postsCollectionCallback(err, postsCollection);
      postsCollectionCallback = undefined;
    }
  });
});

exports.repo = function(callback) {
  if(db) {
    callback(null, db);
  } else {
    dbCallback = callback;
  }
};

var session = function(callback) {
  if(postsCollection) {
    callback(postsCollection);
  } else {
    postsCollectionCallback = callback;
  }
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
      callback(post);
    });
  });
};

exports.save = function(post, callback) {
  session(function(collection) {
    collection.insert(post, function(err, result) {
      callback();
    });
  });
};

exports.close = function() {
  db.close();
};

process.on('exit', function() {
  db.close();
});

