var sys = require('sys'),
    fs = require('fs'),
    db = require('../src/mongo_repository'),
    scriptDir = __dirname,
    dataDir = scriptDir + '/../data/';

sys.puts('Loading data from: ' + dataDir);

var camelize = function(obj) {
  var cameled = {};
  for(var key in obj) {
    cameled[key.charAt(0).toLowerCase() + key.substring(1)] = obj[key]; 
  }
  return cameled;
};

fs.readFile(dataDir + 'posts.json', function(err, data) {
  var posts = eval('[' + data.toString().replace(/{/g, ',{').replace(',{', '{') + ']');
  db.repo(function(err, repo) {
    repo.dropDatabase(function(err, results) {
      repo.collection('posts', function(err, collection) {
        posts.forEach(function(post) {
          collection.insert(camelize(post));
        });
        db.close();
      });
    });
  });
});
