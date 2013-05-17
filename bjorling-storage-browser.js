var _ = require('underscore')
	, events = require('eventemitter2')
	, keys = require('./bjorling-keys')
	, http = require('./http')
	, projections = {}
	, projectionDataLocations = {}
	, dataUrl

emitter = new events.EventEmitter2()

function emitUpdate(projectionName, state) {
	process.nextTick(function() {
		emitter.emit('updated', {
			projection: projectionName
		, state: state
		})
	})
}

function filter(projectionName, fn, cb) {
	var projection = getProjection(projectionName)
	var result = _.filter(projection, function(state, key) {
		return fn(state)
	})[0]
	process.nextTick(function() {
		cb(null, result)
	})
}

function getProjection(projectionName) {
	return projections[projectionName] = projections[projectionName] || {}
}

function getByKey(projectionName, key, cb) {
	var projection = getProjection(projectionName)
		, val = projection[key]

	function handleResponse(res) {
		res.on('end', function(resData) {
			if(!resData) return

			projection[key] = resData
			cb(null, resData)
		})
	}

	function immediateResult() {
		process.nextTick(function() {
			cb(null, val)
		})
	}

	function retrieveResult() {
		var dataLocation = projectionDataLocations[projectionName]
			, keyObj = keys.getObj(projectionName, key)
		http[dataLocation.method](dataLocation.action, keyObj, handleResponse)
	}

	if(val) {
		immediateResult()
	} else {
		retrieveResult()
	}
}

function getByKeySync(projectionName, key) {
	return getProjection(projectionName)[key]
}

function load(projectionName) {
	function handleResponse(res) {
		res.on('end', function(resData) {
			projections[projectionName] = resData
		})
	}

	http.get(dataUrl, { projectionName: projectionName }, handleResponse)
}

function save(projectionName, state, cb) {
	var key = keys(projectionName, state)
		, projection = getProjection(projectionName)
	projection[key] = state
	emitUpdate(projectionName, state)
	cb(null)
}

function setProjectionDataLocation(projectionName, method, action) {
	projectionDataLocations[projectionName] = {
		method: method
	, action: action
	}
}

function update(projectionName, state) {
	if(!state) return

	var key = keys(projectionName, state)
		, projection = getProjection(projectionName)
	projection[key] = state
	emitUpdate(projectionName, state)
}

module.exports = emitter
module.exports.filter = filter
module.exports.getByKey = getByKey
module.exports.getByKeySync = getByKeySync
module.exports.load = load
module.exports.save = save
module.exports.setProjectionDataLocation = setProjectionDataLocation
module.exports.update = update
module.exports.setDataLocation = function(url) {
	console.log(url)
	dataUrl = url
}
