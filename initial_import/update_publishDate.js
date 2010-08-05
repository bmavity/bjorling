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
          post.publishDate = new Date(post.publishDate);
          collection.update({ _id: post._id }, post);
        });
        db.close();
      });
    });
  });
});
