module.exports = (function(){
	var mod = {};
	var fs = require('fs');
	var path = require('path');

	var infra = require('../bundles/essentials.js');

	mod.readJsonFileStripComments = (file)=> {
		var data = fs.readFileSync(file);
	}

	mod.mkdirRecursiveSync = (dir) => {
		let paths = dir.split('/'); // path.delimiter);
		let fullPath = '';
		paths.forEach((path) => {
	
			if (fullPath === '') {
				fullPath = path;
			} else {
				fullPath = fullPath + '/' + path;
			}
	
			if (!fs.existsSync(fullPath)) {
				fs.mkdirSync(fullPath);
			}
		});
	};
	
	return mod;
})();
