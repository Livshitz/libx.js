(async()=>{
	var libx = require('../bundles/essentials.js');
	libx.node = require('../node');

	if (libx.node.args.bump) {
		
		var f = libx.node.args._[0];
		var releaseType = libx.node.args.bump;
		var res = libx.node.bumpNpmVersion(f, releaseType);
		libx.log.info(releaseType, f, res)
	}

})();