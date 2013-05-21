var path = require('path')
	, _ = require('underscore')
	, handlers = {}
	, keys = require('./bjorling-keys')
	, filters = require('./filters')
	, storage = require('./bjorling-storage')

function join(projectionName, key) {
	return storage.getByKeySync(projectionName, key)
}

function handleEvent(eventName, eventData) {
	var matches = handlers[eventName]
	if(!matches) return

	matches.forEach(function(match) {
		var projectionName = match.projection
			, key = keys(projectionName, eventData)

		function executeHandler(projectionName, state) {
			state = state || {}
			match.fn.call(join, state, eventData)
			storage.save(projectionName, state, function(err) {
				if(err) console.log(err)
			})
		}

		if(key) {
			return executeHandler(projectionName, storage.getState(projectionName, key))
		}

		var filter = filters(projectionName, eventData)	
		if(filter) {
			return executeHandler(projectionName, storage.getState(projectionName, filter))
		}
	})
}

function bjorling(filename) {
	var projectionName = path.basename(filename, path.extname(filename))
 
	function addHandler(fn, name) {
		var handler = handlers[name] = handlers[name] || []
		handler.push({
			projection: projectionName
		, fn: fn
		})
	}

	function getByKey(key, cb) {
		storage.getByKey(projectionName, key, cb)
	}

	function load() {
		storage.load(projectionName)
	}

	function when(handlerObj) {
		_.forEach(handlerObj, addHandler)
	}

	function where(filterObj, cb) {
		storage.filter(projectionName, filterObj, cb)
	}

	function setFilter(filter) {
		filters.add(projectionName, filter)
	}

	function setKey(key) {
		keys.add(projectionName, key)
	}

	return {
		getByKey: getByKey
	, load: load
	, when: when
	, where: where
	, setKey: setKey
	, setFilter: setFilter
	}
}

module.exports = bjorling
module.exports.setBus = function(bus) {
	bus.subscribe('*', function(eventData) {
		handleEvent(this.event, eventData)
	})
}
module.exports.on = function() {
	var args = [].slice.call(arguments, 0)
	storage.on.apply(storage, args)
}
module.exports.getProjection = function(projectionName, cb) {
	process.nextTick(function() {
		cb(null, storage.getProjection(projectionName))
	})
}
module.exports.get = function(projectionName, key, cb) {
	process.nextTick(function() {
		storage.getByKey(projectionName, key, cb)
	})
}
module.exports.storage = storage