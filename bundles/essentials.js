module.exports = (function(){
	var libx = require('../modules/helpers.js');

	libx.Callbacks = require('../modules/callbacks');
	
	require('../modules/extensions.js')();

	if (libx.modules == null) libx.modules = {};

	libx.buffer = require('buffer/').Buffer;

	return libx;

})();
