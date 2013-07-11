var path = require('path')
	, _ = require('underscore')
	, handlers = {}
	, keys = require('./bjorling-keys')
	, filters = require('./filters')
	, storage = require('./bjorling-storage')
	, dataDir
	, subscriptionFactory

function join(projectionName, key) {
	return storage.getByKeySync(projectionName, key)
}

function Bjorling(filename) {
	if(!(this instanceof Bjorling)) {
		return new Bjorling(filename)
	}

	this._projectionName = path.basename(filename, path.extname(filename))
	this._handlers = {}
	this._subscription = subscriptionFactory()
}

Bjorling.prototype.execute = function(handler, eventData, position) {
	var projectionName = this._projectionName
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

		handler.call(context, state, eventData)

		storage.eventResult(projectionName, position, state, function(err) {
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
}

Bjorling.prototype.getByKey = function(key, cb) {
	storage.getByKey(this._projectionName, key, cb)
}

Bjorling.prototype.load = function() {
	storage.load(this._projectionName)
}

Bjorling.prototype.when = function(handlerObj) {
	this._handlers = handlerObj
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

Bjorling.prototype.start = function() {
	var me = this

	storage.initialLoad(this._projectionName, function(err, lastProcessedPosition) {
		console.log(me._projectionName, lastProcessedPosition)
		var sub = me._subscription.replay(lastProcessedPosition + 1)
		sub.on('event', function(evt) {
			var handler = me._handlers[evt.__type]
			if(handler) {
				me.execute(handler, evt.evt, evt.position)
			}
		})
	})
}


module.exports = Bjorling
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