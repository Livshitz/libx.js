module.exports = (function(){
	var libx = require('./bundles/essentials.js');
	libx.log.isShowStacktrace = false;
	
	if (typeof window == 'undefined') window = global;

	if (libx.modules == null) libx.modules = {};
	if (libx.browser == null) libx.browser = {};

	return libx;
})();