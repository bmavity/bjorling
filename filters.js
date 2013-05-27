var sarastro = require('sarastro')
	, allFilters = {}

function getFilters(projectionName) {
	return allFilters[projectionName] = allFilters[projectionName] || []
}

function add(projectionName, filter) {
	var args = sarastro(filter)
		, filters = getFilters(projectionName)
	args.pop()

	filters.push({
		args: args
	, fn: filter
	})
}

function applyFilter(projectionName, evt) {
	var filters = getFilters(projectionName)
		, argVals
		, selectedFilter

	function getVal(name) {
		return evt[name]
	}

	function hasNoArgValue(argVal) {
		return !argVal
	}

	function hasAllArgVals(filter) {
		argVals = filter.args.map(getVal)
		if(argVals.some(hasNoArgValue)) return

		selectedFilter = filter
		return true
	}

	if(!filters) return
	if(!filters.some(hasAllArgVals)) return


	return function(s) {
		return selectedFilter.fn.apply({}, argVals.concat(s))
	}
}


module.exports = applyFilter
module.exports.add = add