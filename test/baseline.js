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
	var dataObj = {
				key2: 'toodles'
			}
		, evt = {
				__type: 'HasHandler'
			, data: dataObj
			}
		, calledWithEvent
		, storageEvent
		, retrievedKeyFromStorage = false
		, b

	before(function(done) {
		b = bjorling(__filename, {
					key: 'key2'
				, storage: function(p, k) {
						var s = storage(p, k)
							, gs = s.get
							, gkv = s.getKeyValue
						s.get = function(evt) {
							storageEvent = evt
							return gs.apply(s, arguments)
						}
						s.getKeyValue = function() {
							retrievedKeyFromStorage = true
							return gkv.apply(s, arguments)
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
		b.processEvent(evt, done)
	})

  it('should get the key value from storage', function() {
  	retrievedKeyFromStorage.should.be.true
  })

  it('should retrieve the state from storage with date from the raised event', function() {
  	storageEvent.should.eql(dataObj)
  })

  it('should supply the matching handler with the event as the second argument', function() {
  	calledWithEvent.should.equal(dataObj)
  })
})

describe('bjorling, when processing an event which has a registered handler, and the handler returns a falsy value', function() {
	var evt = {
				__type: 'HasHandler'
			, data: {
					key2: 'toodles'
				}
			}
		, stateObj = {}
		, savedItem
		, b

	before(function(done) {
		b = bjorling(__filename, {
					key: 'key2'
				, storage: function(p, k) {
						var s = storage(p, k)
							, saveFn = s.save
						s.save = function(projection) {
							savedItem = projection
							return saveFn.apply(s, arguments)
						}
						s.addState(evt.data, stateObj)
						return s
					}
				})

		b.when({
			HasHandler: function(s, e) {
			}
		})
		b.processEvent(evt, done)
	})

  it('should save the state value to storage', function() {
  	savedItem.should.equal(stateObj)
  })
})

describe('bjorling, when processing an event which has a registered handler, and the handler returns a value', function() {
	var evt = {
				__type: 'HasHandler'
			, data: {
					key2: 'toodles'
				}
			}
		, handlerReturn = {
			  vals: ['val1']
			}
		, stateObj = {}
		, savedItem
		, b

	before(function(done) {
		b = bjorling(__filename, {
					key: 'key2'
				, storage: function(p, k) {
						var s = storage(p, k)
							, saveFn = s.save
						s.save = function(projection) {
							savedItem = projection
							return saveFn.apply(s, arguments)
						}
						s.addState(evt.data, stateObj)
						return s
					}
				})

		b.when({
			HasHandler: function(s, e) {
				return handlerReturn
			}
		})
		b.processEvent(evt, done)
	})

  it('should save the returned value to storage', function() {
  	savedItem.should.equal(handlerReturn)
  })
})

describe('bjorling, when processing an event which has a registered handler and state is in storage', function() {
	var evt = {
				__type: 'HasHandler'
			, data: {}
			}
		, stateObj = {}
		, state
		, b

	before(function(done) {
		b = bjorling(__filename, {
					key: 'key2'
				, storage: function(p, k) {
						var s = storage(p, k)
						s.addState(evt.data, stateObj)
						return s
					}
				})

		b.when({
			HasHandler: function(s, e) {
				state = s
			}
		})
		b.processEvent(evt, done)
	})

  it('should call the handler with state as an argument', function() {
  	state.should.equal(stateObj)
  })
})

describe('bjorling, when processing an event which has a registered handler, state is not in storage, and there is a $new function', function() {
	var evt = {
				__type: 'HasHandler'
			, data: {
					key2: 'hello'
				}
			}
		, createResult = {}
		, providedEvent
		, state
		, b

	before(function(done) {
		b = bjorling(__filename, {
					key: 'key2'
				, storage: storage
				})

		b.when({
			$new: function(e) {
				providedEvent = e
				return createResult
			}
		, HasHandler: function(s, e) {
				state = s
			}
		})
		b.processEvent(evt, done)
	})

  it('should call the $new function with the event as the only argument', function() {
  	providedEvent.should.equal(evt)
  })

  it('should call the handler with the result of the create function as the first argument', function() {
  	state.should.equal(createResult)
  })
})

describe('bjorling, when processing an event which has a registered handler, state is not in storage, and there is not a $new function', function() {
	var evt = {
				__type: 'HasHandler'
			, data: {
					key2: 'hi'
				}
			}
		, state
		, b

	before(function(done) {
		b = bjorling(__filename, {
					key: 'key2'
				, storage: storage
				})

		b.when({
			HasHandler: function(s, e) {
				state = s
			}
		})
		b.processEvent(evt, done)
	})

  it('should call the handler with an empty object as an argument', function() {
  	state.should.eql({})
  })
})

describe('bjorling, when processing an event which has a registered handler, state is not in storage, and the event does not have a key value', function() {
	var evt = {
				__type: 'HasHandler'
			, data: {}
			}
		, $newWasCalled = false
		, b

	before(function(done) {
		b = bjorling(__filename, {
					key: 'key2'
				, storage: storage
				})

		b.when({
			$new: function(e) {
				$newWasCalled = true
				return {}
			}
		, HasHandler: function(s, e) {
				state = s
			}
		})
		b.processEvent(evt, done)
	})

  it('should not call the $new function', function() {
  	$newWasCalled.should.be.false
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

	before(function(done) {
		b = bjorling(__filename, {
					key: 'key2'
				, storage: function(p, k) {
						var s = storage(p, k)
							, gs = s.get
						s.addState(evt, stateObj)
						s.get = function(evt) {
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
		b.processEvent(evt, done)
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