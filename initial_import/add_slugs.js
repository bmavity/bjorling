var sys = require('sys'),
    fs = require('fs'),
    db = require('../src/mongo_repository'),
    scriptDir = __dirname,
    dataDir = scriptDir + '/../data/';

db.repo(function(err, repo) {
  repo.collection('posts', function(err, collection) {
    collection.find(function(err, cursor) {
      cursor.toArray(function(err, posts) {
        fs.readFile(__dirname + '/../data/slugs.json', function(err, lines) {
          var slugLines = lines.toString().split('\r\n');
          for(var i = 0; i < posts.length; i += 1) {
            posts[i].slug = slugLines[i].split(' ')[0];
            collection.update({ _id: posts[i]._id }, posts[i]);
          }
        });
      });
    });
  });
});
