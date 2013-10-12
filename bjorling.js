var path = require('path')
	, xtend = require('xtend')

function Bjorling(filename, opts) {
	if(!(this instanceof Bjorling)) {
		return new Bjorling(filename, opts)
	}

	this._handlers = {}
	this._key = opts.key
	this._projectionName = path.basename(filename, path.extname(filename))
	this._storage = opts.storage(this._projectionName, opts.key)
}

Bjorling.prototype.addIndex = function(index, cb) {
	this._storage.addIndex(index, cb)
}

Bjorling.prototype.when = function(handlers) {
	this._handlers = handlers//xtend(this._handlers, handlers)
}

Bjorling.prototype.processEvent = function(anEvent, cb) {
	var handlers = this._handlers
		, handler = handlers[anEvent.__type]
		, storage = this._storage
	if(!handler) return cb && cb()

	storage.get(anEvent.data, function(err, state) {
		if(!state) {
			var keyVal = storage.getKeyValue(anEvent.data)
			if(!keyVal) return cb && cb()

			var $new = handlers['$new']
			if($new) {
				state = $new(anEvent)
			}
		}
		state = state || {}

		var stateToSave = handler.call(null, state, anEvent.data)
		stateToSave = stateToSave || state
		storage.save(stateToSave, cb)
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
