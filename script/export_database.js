var sys = require('sys'),
    fs = require('fs'),
    db = require('../src/mongo_repository'),
    scriptDir = __dirname,
    dataDir = scriptDir + '/../data/';

db.repo(function(err, repo) {
  repo.collection('posts', function(err, collection) {
    collection.find(function(err, cursor) {
      cursor.toArray(function(err, posts) {
        posts.forEach(function(post) {
          delete post._id;
        });
        fs.writeFile(dataDir + 'posts2.json', JSON.stringify(posts), function(err) {
          sys.puts('finished writing file');
        });
      });
    });
  });
});
