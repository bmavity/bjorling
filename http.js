var url = require('url')
	, util = require('util')
	, events = require('eventemitter2')
	, http = require('http')

function HttpFormSubmissionResponse(res) {
	if(!(this instanceof HttpFormSubmissionResponse)) {
		return new HttpFormSubmissionResponse(res)
	}

	var me = this
		, resData = ''

	res.on('data', function(data) {
		resData += data
		me.emit('data', data)
	})

	res.on('error', function() {
		me.emit('error')
	})
	
	res.on('end', function() {
		me.emit('end', resData && JSON.parse(resData))
	})

	events.EventEmitter2.call(me)
}
util.inherits(HttpFormSubmissionResponse, events.EventEmitter2)


function get(path, data, cb) {
	var pathUrl = url.parse(path)
	if(cb) {
		pathUrl.query = data
	}
	var opts = {
				method: 'get'
			, path: url.format(pathUrl)
			}
		, req = http.request(opts, cb)
	req.setHeader('accept', 'application/json')
	req.end()
}

function post(path, data, cb) {
	var pathUrl = url.parse(path)
		, opts = {
				method: 'post'
			, path: url.format(pathUrl)
			}
		, req = http.request(opts, cb)
	req.setHeader('Content-Type', 'application/json')
	req.setHeader('accept', 'application/json')
	if(cb) {
		req.write(JSON.stringify(data))
	}
	req.end()
}


module.exports = {
	get: get
, post: post
}