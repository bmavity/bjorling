function StubStorage(projectionName, key) {
	this._projectionName = projectionName
	this._key = key
	this._states = {}
}

StubStorage.prototype.addState = function(data, state) {
	this._states[JSON.stringify(data)] = state
}

StubStorage.prototype.getState = function(data) {
	return this._states[JSON.stringify(data)]
}

StubStorage.prototype.save = function(state) {

}

module.exports = function stubStorage(projectionName, key) {
	return new StubStorage(projectionName, key)
}