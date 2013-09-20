var path = require('path')
	, xtend = require('xtend')

function Bjorling(filename, opts) {
	if(!(this instanceof Bjorling)) {
		return new Bjorling(filename, opts)
	}

	opts = opts || {}
	this._handlers = {}
	this._projectionName = path.basename(filename, path.extname(filename))
	this._storage = opts.storage
}

Bjorling.prototype.when = function(handlers) {
	this._handlers = xtend(this._handlers, handlers)
}

Bjorling.prototype.processEvent = function(anEvent) {
	var handler = this._handlers[anEvent.__type]
		, state = this._storage.getState(anEvent)
	if(!handler) return
	handler.call(null, state, anEvent.data)
}


module.exports = Bjorling
