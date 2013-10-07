var path = require('path')
	, xtend = require('xtend')

function Bjorling(filename, opts) {
	if(!(this instanceof Bjorling)) {
		return new Bjorling(filename, opts)
	}

	this._handlers = {}
	this._projectionName = path.basename(filename, path.extname(filename))
	this._storage = opts.storage(this._projectionName, opts.key)
}

Bjorling.prototype.when = function(handlers) {
	this._handlers = handlers//xtend(this._handlers, handlers)
}

Bjorling.prototype.processEvent = function(anEvent) {
	var handler = this._handlers[anEvent.__type]
	if(!handler) return
		
	var state = this._storage.getState(anEvent)
	handler.call(null, state, anEvent.data)
}


module.exports = Bjorling
