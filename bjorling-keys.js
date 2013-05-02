var keyName = '$key'
	, keys = {}

function getKey(projectionName, obj) {
	return keys[projectionName](obj)
}

function isKey(name) {
	return name === keyName
}

function addKey(projectionName, keyFn) {
	keys[projectionName] = keyFn
}


module.exports = getKey
module.exports.add = addKey
module.exports.isKey = isKey
