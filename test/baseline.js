var bjorling = require('../')
	, storage = require('./stubStorage')

describe('bjorling, when created', function() {
	var b

	before(function() {
		b = create()
	})

  it('should have the proper projection name', function() {
  	b._projectionName.should.equal('baseline')
  })
})

describe('bjorling, when processing an event which has a handler', function() {
	var dataObj = {}
		, evt = {
				__type: 'HasHandler'
			, data: dataObj
			}
		, stateObj = {}
		, state
		, calledWithEvent
		, b

	before(function() {
		b = create()
		b.when({
			HasHandler: function(s, e) {
				console.log(s, e)
				state = s
				calledWithEvent = e
			}
		})
		storage.addState(evt, stateObj)
		b.processEvent(evt)
	})

  it('should retrieve the state from storage')

  it('should call the handler with state as an argument', function() {
  	state.should.equal(stateObj)
  })

  it('should call the handler with the event as an additional argument', function() {
  	calledWithEvent.should.equal(dataObj)
  })

  it('should call the handler with a context')
})

function create() {
	return bjorling(__filename, {
		storage: storage
	})
}