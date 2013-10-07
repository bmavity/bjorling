var bjorling = require('../')
	, storage = require('./stubStorage')

describe('bjorling, when created', function() {
	var b
		, projectionName
		, key

	before(function() {
		b = bjorling(__filename, {
					key: 'theKey'
				, storage: function(p, k) {
						projectionName = p
						key = k
						return storage(p, k)
					}
				})
	})

  it('should initialize storage with proper projection name', function() {
  	projectionName.should.equal('baseline')
  })

  it('should initialize storage with proper key', function() {
  	key.should.equal('theKey')
  })
})

describe('bjorling, when processing an event which has a registered handler', function() {
	var dataObj = {}
		, evt = {
				__type: 'HasHandler'
			, data: dataObj
			}
		, stateObj = {}
		, state
		, calledWithEvent
		, storageEvent
		, b

	before(function() {
		b = bjorling(__filename, {
					key: 'key2'
				, storage: function(p, k) {
						var s = storage(p, k)
							, gs = s.getState
						s.addState(evt, stateObj)
						s.getState = function(evt) {
							storageEvent = evt
							return gs.apply(s, arguments)
						}
						return s
					}
				})

		b.when({
			HasHandler: function(s, e) {
				state = s
				calledWithEvent = e
			}
		})
		b.processEvent(evt)
	})

  it('should retrieve the state from storage with raised event', function() {
  	storageEvent.should.eql(evt)
  })

  it('should call the handler with state as an argument', function() {
  	state.should.equal(stateObj)
  })

  it('should supply the matching handler with the event as the second argument', function() {
  	calledWithEvent.should.equal(dataObj)
  })
})

describe('bjorling, when processing an event which does not have a registered handler', function() {
	var dataObj = {}
		, evt = {
				__type: 'DoesNotHaveHandler'
			, data: dataObj
			}
		, stateObj = {}
		, stateWasRetrieved = false
		, handlerWasCalled = false
		, b

	before(function() {
		b = bjorling(__filename, {
					key: 'key2'
				, storage: function(p, k) {
						var s = storage(p, k)
							, gs = s.getState
						s.addState(evt, stateObj)
						s.getState = function(evt) {
							stateWasRetrieved = true
							return gs.apply(s, arguments)
						}
						return s
					}
				})

		b.when({
			HasHandler: function(s, e) {
				handlerWasCalled = true
			}
		})
		b.processEvent(evt)
	})

  it('should not retrieve the state from storage', function() {
  	stateWasRetrieved.should.be.false
  })

  it('should not call the handler', function() {
  	handlerWasCalled.should.be.false
  })
})

function create() {
	return bjorling(__filename, {
		storage: storage
	})
}