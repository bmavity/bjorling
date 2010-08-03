var sys = require('sys'),
    mongo = require('mongodb');

var db = new mongo.Db('node-mongo-blog', new mongo.Server('localhost', 27017, { auto_reconnect: true }, {}));

var session = function(callback) {
  db.open(function(err, repo) {
    repo.collection('posts', function(err, coll) {
      callback(coll);
      db.close();
    });
  });
};

exports.findAll = function(callback) {
  session(function(collection) {
    collection.find({}, { sort: [['publishDate', 'desc']] }, function(err, cursor) {
      cursor.toArray(function(err, results) {
        callback(err, results);
      });
    });
  });
};

exports.save = function(post) {
  session(function(collection) {
    collection.insert(post);
  });
};

exports.reset = function(posts) {
  db.open(function(err, repo) {
    repo.dropDatabase(function(err, result) {
      repo.collection('posts', function(err, collection) {
        posts.forEach(function(post) {
          collection.insert(post);
        });
        db.close();
      });
    });
  });
};

exports.updatePublishDate = function() {
  db.open(function(err, repo) {
    repo.collection('posts', function(err, collection) {
      collection.find(function(err, cursor) {
        cursor.toArray(function(err, posts) {
          posts.forEach(function(post) {
            post.publishDate = new Date(post.publishDate);
            collection.update({ _id: post._id }, post);
          });
          db.close();
        });
      });
    });
  });
};

exports.updateSlugs = function() {
  session(function(collection) {
    collection.find(function(err, cursor) {
      cursor.toArray(function(err, posts) {
        require('fs').readFile(__dirname + '/../data/slugs.json', function(err, lines) {
          var slugLines = lines.toString().split('\r\n');
          for(var i = 0; i < posts.length; i += 1) {
            posts[i].slug = slugLines[i].split(' ')[0];
            collection.update({ _id: posts[i]._id }, posts[i]);
          }
        });
      });
    });
  });
};
