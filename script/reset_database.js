var sys = require('sys'),
    fs = require('fs'),
    db = require('../src/mongo_repository'),
    scriptDir = __dirname,
    dataDir = scriptDir + '/../data/';

fs.readFile(dataDir + 'posts.json', function(err, data) {
  var posts = eval(data.toString());
  db.repo(function(err, repo) {
    repo.dropDatabase(function(err, results) {
      repo.collection('posts', function(err, collection) {
        posts.forEach(function(post) {
          collection.insert(post);
        });
        db.close();
      });
    });
  });
});
