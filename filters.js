var sarastro = require('sarastro')
	, filters = {}

function add(projectionName, filter) {
	var args = sarastro(filter)
	args.pop()

	filters[projectionName] = {
		args: args
	, fn: filter
	}
}

function getFilter(projectionName, evt) {
	var getVal = function(name) {
		return evt[name]
	}

	var filter = filters[projectionName]
	if(!filter) return
	var argVals = filter.args.map(getVal)
	if(!argVals) return

	return function(s) {
		return filter.fn.apply({}, argVals.concat(s))
	}
}


module.exports = getFilter
module.exports.add = add