var keyName = '$key'
	, keys = {}

function addKey(projectionName, key) {
	keys[projectionName] = isFunction(key) ? key : createSingleNameKeyFn(key)
}

function createSingleNameKeyFn(key) {
	return function(obj) {
		return obj[key]
	}
}

function isFunction(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]'
}

function isKey(name) {
	return name === keyName
}


function getKey(projectionName, obj) {
	return keys[projectionName](obj)
}


module.exports = getKey
module.exports.add = addKey
module.exports.isKey = isKey
