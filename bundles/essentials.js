
module.exports = (function(){
	if (typeof global == 'undefined') window.global = window;

	var libx = require('../modules/helpers.js');

	libx.$ = {}; // Use that as dynamic bag and throw there any runtime values

	libx.Callbacks = require('../modules/callbacks');
	
	libx.extensions = require('../modules/extensions.js')();
	if (!global._libx_avoidExtensions) libx.extensions.applyAllExtensions();

	if (libx.modules == null) libx.modules = () => libx.di.modules;

	libx.Buffer = require('buffer/').Buffer;

	return libx;

})();
