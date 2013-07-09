var path = require('path')
	, _ = require('underscore')
	, handlers = {}
	, keys = require('./bjorling-keys')
	, filters = require('./filters')
	, storage = require('./bjorling-storage')
	, subscriptionFactory

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
			var context = {
				join: join
			, remove: remove
			}

			function remove() {
				storage.remove(projectionName, state)
			}

			state = state || {}

			match.fn.call(context, state, eventData)

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

function Bjorling(filename) {
	if(!(this instanceof Bjorling)) {
		return new Bjorling(filename)
	}
	this._projectionName = path.basename(filename, path.extname(filename))
}

Bjorling.prototype.addHandler = function(fn, name) {
	var handler = handlers[name] = handlers[name] || []
	handler.push({
		projection: this._projectionName
	, fn: fn
	})
}

Bjorling.prototype.getByKey = function(key, cb) {
	storage.getByKey(this._projectionName, key, cb)
}

Bjorling.prototype.load = function() {
	storage.load(this._projectionName)
}

Bjorling.prototype.when = function(handlerObj) {
	var me = this
	_.forEach(handlerObj, function(fn, name) {
		me.addHandler(fn, name)
	})
}

Bjorling.prototype.where = function(filterObj, cb) {
	storage.filter(this._projectionName, filterObj, cb)
}

Bjorling.prototype.setFilter = function(filter) {
	filters.add(this._projectionName, filter)
}

Bjorling.prototype.setKey = function(key) {
	keys.add(this._projectionName, key)
}


module.exports = Bjorling
module.exports.setBus = function(bus) {
	bus.subscribe('*', function(eventData) {
		handleEvent(this.event, eventData)
	})
}
module.exports.on = function() {
	var args = [].slice.call(arguments, 0)
	storage.on.apply(storage, args)
}
module.exports.init = function(opts) {
	subscriptionFactory = opts.subscriptionFactory
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