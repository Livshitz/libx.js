module.exports = (function(){
	// var infra = require('../liv.infra.shared.js');
	
	require('../modules/extensions.js')();
	// var infra = {};
	var infra = require('../modules/helpers.js');
	infra.log = require('../modules/log.js');
	infra.buffer = require('Buffer/').Buffer;

	// infra.log.isShowStacktrace = false;

	// infra.helpers = require('./liv.infra.helpers.js');
	// infra.node = require('./liv.infra.node.js');
	// infra.gulp = require('./liv.infra.gulp.js');
	
	// if (infra.modules == null) infra.modules = {};
	// if (typeof window == 'undefined') window = global;
	// // if (infra.browser == null) infra.browser = {};
	// // infra.browser.angular = require('./browser/angular.js');
	// infra.modules.network = require('./modules/network.js');
	// infra.modules.firebase = require('./modules/firebase.js');

	return infra;

})();
