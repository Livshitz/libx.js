module.exports = (function(){
	// var libx = require('../libx.shared.js');

	var libx = require('./essentials.js');

	if (libx.browser == null) libx.browser = {};
	libx.browser.require = require('../browser/require.js');
	libx.browser.helpers = require('../browser/helpers.js');

	return libx;
})();
