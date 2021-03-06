var bjorling = require('../')
	, storage = require('./stubStorage')
	, emitStream = require('./eventEmitStream')

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
		, eventStream = emitStream(evt)
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

		b.on('finish', done)

		eventStream.pipe(b)
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
		, eventStream = emitStream(evt)
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

		b.on('finish', done)

		eventStream.pipe(b)
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
		, eventStream = emitStream(evt)
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
		
		b.on('finish', done)

		eventStream.pipe(b)
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
		, eventStream = emitStream(evt)
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
		
		b.on('finish', done)

		eventStream.pipe(b)
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
		, eventStream = emitStream(evt)
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
		
		b.on('finish', done)

		eventStream.pipe(b)
	})

  it('should call the $new function with the event data as the only argument', function() {
  	providedEvent.should.equal(evt.data)
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
		, eventStream = emitStream(evt)
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
		
		b.on('finish', done)

		eventStream.pipe(b)
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
		, eventStream = emitStream(evt)
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
		
		b.on('finish', done)

		eventStream.pipe(b)
	})

  it('should not call the $new function', function() {
  	$newWasCalled.should.be.false
  })
})

describe('bjorling, when processing an event which has a registered transformer', function() {
	var dataObj = {
				originalKey: 'toodles'
			, val: 'original'
			}
		, evt = {
				__type: 'HasHandler'
			, data: dataObj
			}
		, transformedEventData = {
				key2: dataObj.originalKey
			, valId: dataObj.val
			}
		, calledWithEvent
		, keyEventData
		, storageEvent
		, eventWasTransformed = false
		, eventStream = emitStream(evt)
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
						s.getKeyValue = function(ked) {
							keyEventData = ked
							return gkv.apply(s, arguments)
						}
						return s
					}
				})

		b.transform({
			HasHandler: function(e) {
				eventWasTransformed = true
				return transformedEventData
			}
		})

		b.when({
			$new: function(e) {
				$newEventData = e
			}
		, HasHandler: function(s, e) {
				calledWithEvent = e
			}
		})
		
		b.on('finish', done)

		eventStream.pipe(b)
	})

	it('should transform the event data', function() {
		eventWasTransformed.should.be.true
	})

  it('should retrieve the state from storage with the transformed event data', function() {
  	storageEvent.should.equal(transformedEventData)
  })

  it('should retrieve the key from storage with the transformed event data', function() {
  	keyEventData.should.equal(transformedEventData)
  })

  it('should call the $new function with the transformed event data', function() {
  	$newEventData.should.equal(transformedEventData)
  })

  it('should supply the matching handler with the transformed event as the second argument', function() {
  	calledWithEvent.should.equal(transformedEventData)
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
		, eventStream = emitStream(evt)
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
		
		b.on('finish', done)

		eventStream.pipe(b)
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