var sys = require('sys'),
    mongo = require('mongodb');

var db = new mongo.Db('node-mongo-blog', new mongo.Server('localhost', 27017, {}, {}));

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
        collection.find(function(err, results) {
            callback(err, results);
        });
    });
};

exports.save = function(post) {
    session(function(collection) {
        collection.insert(post);
    });
};
