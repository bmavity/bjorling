var path = require('path')
	, _ = require('underscore')
	, handlers = {}
	, keys = require('./bjorling-keys')
	, storage = require('./bjorling-storage')

function handleEvent(eventName, eventData) {
	var matches = handlers[eventName]
	if(!matches) return

	matches.forEach(function(match) {
		var projectionName = match.projection
			, key = keys(projectionName, eventData)
		storage.getByKey(projectionName, key, function(err, state) {
			state = state || {}
			match.fn(state, eventData)
			storage.save(projectionName, state, function(err) {
				console.log(err)
			})
		})
	})
}

function bjorling(filename) {
	var projectionName = path.basename(filename, path.extname(filename))
 
	function addHandler(fn, name) {
		if(keys.isKey(name)) {
			keys.add(projectionName, fn)
			return
		}
		var handler = handlers[name] = handlers[name] || []
		handler.push({
			projection: projectionName
		, fn: fn
		})
	}

	function getByKey(key, cb) {
		storage.getByKey(projectionName, key, cb)
	}

	function when(handlerObj) {
		_.forEach(handlerObj, addHandler)
	}

	function where(filter, cb) {
		storage.filter(projectionName, filter, cb)
	}

	function setData(data) {
		storage.setData(projectionName, data)
	}

	function setKey(key) {
		keys.add(projectionName, key)
	}

	return {
		getByKey: getByKey
	, when: when
	, where: where
	, setData: setData
	, setKey: setKey
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
module.exports.update = function() {
	var args = [].slice.call(arguments, 0)
	storage.update.apply(storage, args)
}