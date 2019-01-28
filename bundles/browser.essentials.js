module.exports = (function(){
	// var infra = require('../liv.infra.shared.js');

	var infra = require('./essentials.js');

	// infra.log.isShowStacktrace = false;

	// infra.helpers = require('./liv.infra.helpers.js');
	// infra.node = require('./liv.infra.node.js');
	// infra.gulp = require('./liv.infra.gulp.js');
	
	// if (infra.modules == null) infra.modules = {};
	// if (typeof window == 'undefined') window = global;
	
	if (infra.browser == null) infra.browser = {};
	infra.browser.require = require('../browser/require.js');
	infra.browser.helpers = require('../browser/helpers.js');

	// // infra.browser.angular = require('./browser/angular.js');
	// infra.modules.network = require('./modules/network.js');
	// infra.modules.firebase = require('./modules/firebase.js');

	return infra;

})();
