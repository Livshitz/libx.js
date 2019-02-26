module.exports = (function(){
	// var infra = require('./liv.infra.shared.js');
	var infra = require('./bundles/essentials.js');

	infra.log.isShowStacktrace = false;

	// infra.helpers = require('./liv.infra.helpers.js');
	infra.node = require('./node/index.js');
	
	if (infra.modules == null) infra.modules = {};
	if (typeof window == 'undefined') window = global;
	if (infra.browser == null) infra.browser = {};
	infra.browser.angular = require('./browser/angular.js');
	infra.gulp = require('./modules/gulp.js');
	infra.node = require('./node/index.js');
	infra.network = require('./modules/network.js');
	infra.firebase = require('./modules/firebase.js');
	infra.crypto = require('./modules/crypto.js');

	return infra;
})();