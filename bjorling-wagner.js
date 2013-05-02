var bjorling = require('bjorling-storage')
	, wagner = require('wagner')

module.exports = function(options) {
	var component = this
	options = options || {}
	var bindTo = options.bindTo

	if(bindTo) {
		bjorling.on('updated', function(update) {
			if(update.projection === bindTo) {
				component.update(update.state)
			}
		})

		wagner.ko.call(component)
	}

	return this
}