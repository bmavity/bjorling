var sys = require('sys')
  , fs = require('fs')
  , repo = require('../src/mongo_repository')
  , scriptDir = __dirname
  , dataDir = scriptDir + '/../data/';

sys.puts('Loading data from: ' + dataDir);

var camelize = function(obj) {
  var cameled = {};
  for(var key in obj) {
    cameled[key.charAt(0).toLowerCase() + key.substring(1)] = obj[key]; 
  }
  return cameled;
};

fs.readFile(dataDir + 'posts.json', function(err, data) {
  var posts = eval('[' + data.toString().replace(/{/g, ',{').replace(',{', '{') + ']')
    , camelizedPosts = [];
  posts.forEach(function(post) {
    camelizedPosts.push(camelize(post));
  });
  repo.batch(camelizedPosts);
});
