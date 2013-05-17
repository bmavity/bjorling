var keyName = '$key'
	, keys = {}

function addKey(projectionName, key) {
	var keyObj = {}

	if(isFunction(key)) {
		keyObj.to = key
	} else {
		keyObj.to = key.to || createSingleNameKeyFn(key)
		keyObj.from = key.from || createSingleNameKeyObjFn(key)
	}
	keys[projectionName] = keyObj
}

function createSingleNameKeyFn(key) {
	return function(obj) {
		return obj[key]
	}
}

function createSingleNameKeyObjFn(key) {
	return function(keyObj) {
		var keyObj = {}
		keyObj[key] = val
		return keyObj
	}
}

function isFunction(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]'
}

function isKey(name) {
	return name === keyName
}

function getObj(projectionName, key) {
	return keys[projectionName](obj)
}


function getKey(projectionName, obj) {
	return keys[projectionName](obj)
}


module.exports = getKey
module.exports.add = addKey
module.exports.isKey = isKey
module.exports.getObj = getObj
