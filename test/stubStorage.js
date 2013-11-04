function StubStorage(projectionName, key) {
	this._projectionName = projectionName
	this._key = key
	this._states = {}
}

StubStorage.prototype.addState = function(data, state) {
	this._states[JSON.stringify(data)] = state
}

StubStorage.prototype.get = function(data, cb) {
	var result = this._states[JSON.stringify(data)]
	setImmediate(function() {
		cb(null, result)
	})
}

StubStorage.prototype.getKeyValue = function(data) {
	return data[this._key]
}

StubStorage.prototype.reset = function(cb) {
	setImmediate(cb)
}

StubStorage.prototype.save = function(state, cb) {
	setImmediate(cb)
}

module.exports = function stubStorage(projectionName, key) {
	return new StubStorage(projectionName, key)
}