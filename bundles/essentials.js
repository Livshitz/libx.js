
module.exports = (function(){
	var libx = require('../modules/helpers.js');

	libx.Callbacks = require('../modules/callbacks');
	
	libx.extensions = require('../modules/extensions.js')();
	if (!global._libx_avoidExtensions) libx.extensions.applyAllExtensions();

	if (libx.modules == null) libx.modules = {};

	libx.buffer = require('buffer/').Buffer;

	return libx;

})();
