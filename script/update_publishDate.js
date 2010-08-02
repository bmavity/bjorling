
var sys = require('sys')
  , fs = require('fs')
  , repo = require('../src/mongo_repository')
  , scriptDir = __dirname
  , dataDir = scriptDir + '/../data/';

repo.updatePublishDate();
