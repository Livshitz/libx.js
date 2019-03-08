module.exports = (function(){
	// var libx = require('.shared.js');
	var libx = require('./bundles/essentials.js');

	libx.log.isShowStacktrace = false;

	// libx.helpers = require('./libx.helpers.js');
	libx.node = require('./node/index.js');
	
	if (libx.modules == null) libx.modules = {};
	if (typeof window == 'undefined') window = global;
	if (libx.browser == null) libx.browser = {};
	libx.browser.angular = require('./browser/angular.js');
	libx.gulp = require('./modules/gulp.js');
	libx.node = require('./node/index.js');
	libx.network = require('./modules/network.js');
	libx.firebase = require('./modules/firebase.js');
	libx.crypto = require('./modules/crypto.js');

	return libx;
})();