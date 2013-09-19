var states = {}

function addState(data, state) {
	states[JSON.stringify(data)] = state
}

function getState(data) {
	console.log(states, JSON.stringify(data), states[JSON.stringify(data)])
	return states[JSON.stringify(data)]
}


module.exports.addState = addState
module.exports.getState = getState	
