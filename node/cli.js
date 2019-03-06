(async()=>{
	var infra = require('../bundles/essentials.js');
	infra.node = require('../node');

	if (infra.node.args.bump) {
		
		var f = infra.node.args._[0];
		var releaseType = infra.node.args.bump;
		var res = infra.node.bumpNpmVersion(f, releaseType);
		console.log(releaseType, f, res)
	}

})();