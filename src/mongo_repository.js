var sys = require('sys'),
    mongo = require('mongodb');

var db = new mongo.Db('node-mongo-blog', new mongo.Server('localhost', 27017, {}, {}));

exports.findAll = function(callback) {
    db.open(function(err, repo) {
        repo.collection('posts', function(err, coll) {
            coll.find(function(err, results) {
                callback(err, results);
                db.close();
            });
        });
    });
};

exports.save = function() {
    db.open(function(err, repo) {
        repo.collection('posts', function(err, coll) {
            coll.insert({ author: 'Brian Mavity' }, function() {
                db.close();
            });
        });
    });
};
