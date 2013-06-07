var _ = require('underscore')
	, path = require('path')
	, projections = {}
	, keys = require('./bjorling-keys')
	, dataDir

function createFilterFn(filterObj) {
	return function(state) {
		return _.every(filterObj, function(val, name) {
			return state[name] === val
		})
	}
}

function filter(projectionName, filterObj, cb) {
	var projection = getProjection(projectionName)
		, filterFn = isFunction(filterObj) ? filterObj : createFilterFn(filterObj)
	var result = _.filter(projection, function(state, key) {
		return filterFn(state)
	})
	process.nextTick(function() {
		if(result.length < 2) result = result[0]
		cb(null, result)
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

function getState(projectionName, keyOrFilter, cb) {
	var projection = getProjection(projectionName)
		, val
	if(isFunction(keyOrFilter)) {
		val = resolveFilter(projection, keyOrFilter)
	} else {
		val = projection[keyOrFilter]
	}
	return val
}

function isFunction(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]'
}

function load(projectionName) {
	projections[projectionName] = require(path.resolve(dataDir, projectionName))
}

function remove(projectionName, state) {
	var key = keys(projectionName, state)
		, projection = getProjection(projectionName)
	delete projection[key]
}

function resolveFilter(projection, filterFn) {
	return _.filter(projection, function(state, key) {
		return filterFn(state)
	})[0]
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
module.exports.getState = getState
module.exports.load = load
module.exports.remove = remove
module.exports.save = save
module.exports.setDataLocation = function(dir) {
	dataDir = dir
}
