var path = require('path')

function Bjorling(filename, opts) {
	if(!(this instanceof Bjorling)) {
		return new Bjorling(filename, opts)
	}

	this._handlers = {}
	this._key = opts.key
	this._projectionName = path.basename(filename, path.extname(filename))
	this._storage = opts.storage(this._projectionName, opts.key)
	this._transformers = {}
}

Bjorling.prototype.addIndex = function(index, cb) {
	this._storage.addIndex(index, cb)
}

Bjorling.prototype.when = function(handlers) {
	this._handlers = handlers
}

Bjorling.prototype.transform = function(transformers) {
	this._transformers = transformers
}

Bjorling.prototype.processEvent = function(anEvent, cb) {
	var eventType = anEvent.__type
		, handlers = this._handlers
		, handler = handlers[eventType]
		, transformers = this._transformers
		, transformer = transformers[eventType]
		, storage = this._storage
		, eventData = anEvent.data
	if(!handler) {
		return setImmediate(function() {
			cb && cb()
		})
	}

	if(transformer) {
		eventData = transformer(eventData)
	}

	storage.get(eventData, function(err, state) {
		if(!state) {
			var keyVal = storage.getKeyValue(eventData)
			if(!keyVal) return cb && cb()

			var $new = handlers['$new']
			if($new) {
				state = $new(eventData)
			}
		}
		state = state || {}

		var stateToSave = handler.call(null, state, eventData)
		stateToSave = stateToSave || state
		storage.save(stateToSave, function(err, r) {
			cb(err, r)
		})
	})
}

function isObject(obj) {
	return Object.prototype.toString.call(obj) === '[object Object]'
}

Bjorling.prototype.get = function(queryObj, cb) {
	var query
	if(isObject(queryObj)) {
		query = queryObj
	} else {
		query = {}
		query[this._key] = queryObj
	}

	this._storage.get(query, cb)
}


module.exports = Bjorling
