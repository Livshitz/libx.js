module.exports = (function(){
	require('../modules/extensions.js')();
	var libx = require('../modules/helpers.js');
	libx.log = require('../modules/log.js');
	libx.buffer = require('buffer/').Buffer;

	// libx.log.isShowStacktrace = false;

	// libx.helpers = require('./libx.helpers.js');
	// libx.node = require('./libx.node.js');
	// libx.gulp = require('./libx.gulp.js');
	
	// if (libx.modules == null) libx.modules = {};
	// if (typeof window == 'undefined') window = global;
	// // if (libx.browser == null) libx.browser = {};
	// // libx.browser.angular = require('./browser/angular.js');
	// libx.modules.network = require('./modules/network.js');
	// libx.modules.firebase = require('./modules/firebase.js');

	return libx;

})();
