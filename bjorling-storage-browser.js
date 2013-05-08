var _ = require('underscore')
	, events = require('eventemitter2')
	, keys = require('./bjorling-keys')
	, http = require('./http')
	, projections = {}
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
	function handleResponse(res) {
		var resData = ''

		res.on('data', function(data) {
			resData += data
		})

		res.on('error', function(err) {
			console.log('error', err)
		})
		
		res.on('end', function() {
			projection[projectionName] == resData && JSON.parse(resData)
		})
	}

	process.nextTick(function() {
		http.get(dataUrl, { projectionName: projectionName }, handleResponse)
	})
}

function save(projectionName, state, cb) {
	var key = keys(projectionName, state)
		, projection = getProjection(projectionName)
	projection[key] = state
	emitUpdate(projectionName, state)
	cb(null)
}

function update(projectionName, state) {
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
module.exports.update = update
module.exports.setDataLocation = function(url) {
	dataUrl = url
}
