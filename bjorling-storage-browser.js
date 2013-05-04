var _ = require('underscore')
	, events = require('eventemitter2')
	, keys = require('./bjorling-keys')
	, projections = {}

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

function save(projectionName, state, cb) {
	var key = keys(projectionName, state)
		, projection = getProjection(projectionName)
	projection[key] = state
	emitUpdate(projectionName, state)
	cb(null)
}

function setData(projectionName, data) {
	projections[projectionName] = data
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
module.exports.save = save
module.exports.setData = setData
module.exports.update = update
