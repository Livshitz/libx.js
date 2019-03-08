module.exports = (function(){
	// var libx = require('../libx.shared.js');

	var libx = require('./essentials.js');

	// libx.log.isShowStacktrace = false;

	// libx.helpers = require('./liv.libx.helpers.js');
	// libx.node = require('./liv.libx.node.js');
	// libx.gulp = require('./liv.libx.gulp.js');
	
	// if (libx.modules == null) libx.modules = {};
	// if (typeof window == 'undefined') window = global;
	
	if (libx.browser == null) libx.browser = {};
	libx.browser.require = require('../browser/require.js');
	libx.browser.helpers = require('../browser/helpers.js');

	// // libx.browser.angular = require('./browser/angular.js');
	// libx.modules.network = require('./modules/network.js');
	// libx.modules.firebase = require('./modules/firebase.js');

	return libx;

})();
