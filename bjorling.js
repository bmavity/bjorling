var path = require('path')
	, util = require('util')
	, Writable = require('stream').Writable

util.inherits(Bjorling, Writable)

function Bjorling(filename, options) {
	options = options || {}
	options.objectMode = true
	if(!(this instanceof Bjorling)) {
		return new Bjorling(filename, options)
	}
	Writable.call(this, options)

	this._handlers = {}
	this._key = options.key
	this._projectionName = path.basename(filename, path.extname(filename))
	this._storage = options.storage(this._projectionName, options.key)
	this._transformers = {}
}

Bjorling.prototype._write = function(chunk, encoding, done) {
	this.processEvent(chunk, done)
}

Bjorling.prototype.addIndex = function(index, cb) {
	this._storage.addIndex(index, cb)
}

Bjorling.prototype.when = function(handlers) {
	this._handlers = handlers
}

Bjorling.prototype.reset = function(cb) {
	this._storage.reset(cb)
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
