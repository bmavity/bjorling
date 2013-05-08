var filters = {}

function add(projectionName, key, filter) {
	filters[projectionName] = {
		key: key
	, fn: filter
	}
}

function getFilter(projectionName, evt) {
	var filter = filters[projectionName]
	if(!filter) return
	var keyVal = evt[filter.key]
	if(!keyVal) return

	return function(s) {
		console.log(keyVal, s)
		return filter.fn(keyVal, s)
	}
}


module.exports = getFilter
module.exports.add = add