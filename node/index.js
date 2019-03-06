module.exports = (function(){
	var mod = {};
	const fs = require('fs');
	const path = require('path');
	const argv = require('yargs').argv;

	var infra = require('../bundles/essentials.js');
	infra.crypto = require('../modules/crypto.js');

	mod.args = argv;

	mod.readJsonFileStripComments = (file)=> {
		var data = fs.readFileSync(file);
	}

	mod.encryptFile = (file, key, newFile) => {
		var content = fs.readFileSync(file).toString();
		var encrypted = infra.crypto.encrypt(content, key);
		fs.writeFileSync(newFile || file, encrypted);
		return encrypted;
	}

	mod.decryptFile = (file, key, newFile) => {
		var content = fs.readFileSync(file);
		var data = infra.crypto.decrypt(content.toString(), key);
		fs.writeFileSync(newFile || file, data);
		return data;
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
