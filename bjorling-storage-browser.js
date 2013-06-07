var _ = require('underscore')
	, events = require('eventemitter2')
	, keys = require('./bjorling-keys')
	, http = require('./http')
	, projections = {}
	, projectionDataLocations = {}
	, notFounds = {}
	, dataUrl

emitter = new events.EventEmitter2()

function createFilterFn(filterObj) {
	return function(state) {
		return _.every(filterObj, function(val, name) {
			return state[name] === val
		})
	}
}

function emitUpdate(projectionName, state, isNewState) {
	process.nextTick(function() {
		emitter.emit('projection updated', {
			projection: projectionName
		, isNew: isNewState
		, state: state
		})
	})
}

function processQuery(projectionName, queriedValue, data, cb) {
	if(queriedValue) {
		immediateResult(projectionName, queriedValue, cb)
	} else {
		retrieveResult(projectionName, data, cb)
	}	
}

function filter(projectionName, filterObj, cb) {
	var projection = getProjection(projectionName)
		, filterFn = isFunction(filterObj) ? filterObj : createFilterFn(filterObj)
		, result = _.filter(projection, function(state, key) {
				return filterFn(state)
			})[0]

	processQuery(projectionName, result, filterObj, cb)
}

function getByKey(projectionName, key, cb) {
	var projection = getProjection(projectionName)
		, val = projection[key]
		, keyObj = keys.getObj(projectionName, key)

	processQuery(projectionName, val, keyObj, cb)
}

function getByKeySync(projectionName, key) {
	return getProjection(projectionName)[key]
}

function getProjection(projectionName) {
	return projections[projectionName] = projections[projectionName] || {}
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

function immediateResult(projectionName, val, cb) {
	process.nextTick(function() {
		cb(null, val)
	})
}

function load(projectionName) {
	function handleResponse(res) {
		res.on('end', function(resData) {
			projections[projectionName] = resData
		})
	}

	http.get(dataUrl, { projectionName: projectionName }, handleResponse)
}

function remove(projectionName, state) {
	var key = keys(projectionName, state)
		, projection = getProjection(projectionName)
	delete projection[key]
}

function retrieveResult(projectionName, data, cb) {
	var dataLocation = projectionDataLocations[projectionName]
		, url = http.getUrl(dataLocation.action, data)

	function handleResponse(res) {
		res.on('end', function(resData) {
			if(!resData) {
				notFounds[url] = true
				return cb(null, null)
			}

			var key = keys(projectionName, resData)
				, projection = getProjection(projectionName)

			if(!key) return cb({ message: 'Response data has no key value' })

			projection[key] = resData
			cb(null, resData)
		})
	}

	if(notFounds[url]) {
		return cb(null, null)
	}

	http[dataLocation.method](dataLocation.action, data, handleResponse)
}

function isNew(projection, key) {
	return !projection[key]
}

function resolveFilter(projection, filterFn) {
	return _.filter(projection, function(state, key) {
		return filterFn(state)
	})[0]
}

function save(projectionName, state, cb) {
	var key = keys(projectionName, state)
		, projection = getProjection(projectionName)
		, isNewState = isNew(projection, key)

	projection[key] = state
	emitUpdate(projectionName, state, isNewState)
	cb(null)
}

function setProjectionDataLocation(projectionName, method, action) {
	projectionDataLocations[projectionName] = {
		method: method
	, action: action
	}
}

module.exports = emitter
module.exports.filter = filter
module.exports.getByKey = getByKey
module.exports.getByKeySync = getByKeySync
module.exports.getState = getState
module.exports.load = load
module.exports.remove = remove
module.exports.save = save
module.exports.setProjectionDataLocation = setProjectionDataLocation
module.exports.setDataLocation = function(url) {
	dataUrl = url
}
