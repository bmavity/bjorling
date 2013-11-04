var util = require('util')
	, Readable = require('stream').Readable

util.inherits(EventEmitStream, Readable)

function EventEmitStream(events, options) {
	options = options || {}
	options.objectMode = true

	if(!(this instanceof EventEmitStream)) {
    return new EventEmitStream(events, options)
	}
	Readable.call(this, options)
	this._events = Array.isArray(events) ? events : [events]
}

EventEmitStream.prototype._read = function() {
	var me = this
	this._events.forEach(function(evt) {
		me.push(evt)
	})
	me.push(null)
}


module.exports = EventEmitStream
