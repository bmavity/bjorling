var _ = require('underscore')
	, fs = require('fs')
	, path = require('path')
	, afs = new (require('atomic-write').Context)
	, projections = {}
	, positions = {}
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
	projections[projectionName] = require(getProjectionFile(projectionName))
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

function getProjectionFile(projectionName) {
	return path.resolve(dataDir, projectionName + '.json')
}

function eventResult(projectionName, eventPosition, state, cb) {
	var key = keys(projectionName, state)
		, projection = getProjection(projectionName)
	projection[key] = state
	positions[projectionName] = eventPosition
	cb(null)
}

function persistState(projectionState, projectionName) {
	var projectionFile = getProjectionFile(projectionName)
	fs.readFile(projectionFile, 'utf8', function(err, file) {
		var persistedProjection = !!err ? { lastProcessedPosition: -1 } : JSON.parse(file)
			, lastProcessedPosition = positions[projectionName]
		if(lastProcessedPosition > persistedProjection.lastProcessedPosition) {
			persistedProjection.lastProcessedPosition = lastProcessedPosition
			persistedProjection.state = projectionState
			afs.writeFile(projectionFile, JSON.stringify(persistedProjection), function(err) {
				if(err) return console.error(err)
			})
		}
	})
}

function persistAllState() {
	_.forEach(projections, persistState)
}


setTimeout(persistAllState, 5000)


module.exports.eventResult = eventResult
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
