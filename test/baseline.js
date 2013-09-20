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

describe('bjorling, when processing an event which has a handler', function() {
	var dataObj = {}
		, evt = {
				__type: 'DoesNotHaveHandler'
			, data: dataObj
			}
		, stateObj = {}
		, handlerWasCalled
		, b

	before(function() {
		b = create()
		handlerWasCalled = false
		b.when({
			HasHandler: function(s, e) {
				handlerWasCalled = true
			}
		})
		storage.addState(evt, stateObj)
		b.processEvent(evt)
	})

  it('should not retrieve the state from storage')

  it('should not call the handler', function() {
  	handlerWasCalled.should.be.false
  })
})

function create() {
	return bjorling(__filename, {
		storage: storage
	})
}