var _ = require('underscore')
	, path = require('path')
	, projections = {}
	, keys = require('./bjorling-keys')
	, dataDir

function filter(projectionName, fn, cb) {
	var projection = getProjection(projectionName)
	var result = _.filter(projection, function(state, key) {
		if(keys.isKey(key)) return false
		return fn(state)
	})
	process.nextTick(function() {
		cb(null, result[0])
	})
}

function getProjection(projectionName) {
	return projections[projectionName] = projections[projectionName] || {}
}

function getByKey(projectionName, key, cb) {
	var projection = getProjection(projectionName)
	process.nextTick(function() {
		cb(null, projection[key])
	})
}

function getByKeySync(projectionName, key) {
	return getProjection(projectionName)[key]
}

function load(projectionName) {
	projections[projectionName] = require(path.resolve(dataDir, projectionName))
}

function save(projectionName, state, cb) {
	var key = keys(projectionName, state)
		, projection = getProjection(projectionName)
	projection[key] = state
	cb(null)
}

module.exports.filter = filter
module.exports.getByKey = getByKey
module.exports.getByKeySync = getByKeySync
module.exports.getProjection = getProjection
module.exports.load = load
module.exports.save = save
module.exports.setDataLocation = function(dir) {
	dataDir = dir
}
