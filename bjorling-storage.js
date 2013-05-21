var _ = require('underscore')
	, path = require('path')
	, projections = {}
	, keys = require('./bjorling-keys')
	, dataDir

function createFilterFn(filterObj) {
	return function(state) {
		console.log(filterObj)
		return _.every(filterObj, function(val, name) {
			console.log(name, val, state[name])
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
	console.log(result[0])
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

function resolveFilter(projection, filterFn) {
	return _.filter(projection, function(state, key) {
		console.log(state)
		return filterFn(state)
	})[0]
}

function save(projectionName, state, cb) {
	var key = keys(projectionName, state)
		, projection = getProjection(projectionName)
	projection[key] = state
	console.log(projectionName, projection)
	cb(null)
}

module.exports.filter = filter
module.exports.getByKey = getByKey
module.exports.getByKeySync = getByKeySync
module.exports.getProjection = getProjection
module.exports.getState = getState
module.exports.load = load
module.exports.save = save
module.exports.setDataLocation = function(dir) {
	dataDir = dir
}
