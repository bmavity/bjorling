var _ = require('underscore')
	, projections = {}
	, keys = require('./bjorling-keys')

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

function save(projectionName, state, cb) {
	var key = keys(projectionName, state)
		, projection = getProjection(projectionName)
	projection[key] = state
	cb(null)
}

function setData(projectionName, data) {
	projections[projectionName] = data
}

module.exports = {
	filter: filter
, getByKey: getByKey
, save: save
, setData: setData
}
