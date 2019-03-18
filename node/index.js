module.exports = (function(){
	var mod = {};
	const fs = require('fs');
	const path = require('path');
	const argv = require('yargs').argv;
	const bump = require('json-bump')
	
	var libx = require('../bundles/essentials.js');
	libx.modules.crypto = require('../modules/crypto.js');

	mod.args = argv;

	mod.bumpNpmVersion = (file, releaseType) => {
		var obj = {};
		obj[releaseType] = 1;
		return bump(file, { obj })
	}

	mod.readJsonFileStripComments = (file) => {
		var data = fs.readFileSync(file);
	}

	mod.encryptFile = (file, key, newFile) => {
		var content = fs.readFileSync(file).toString();
		var encrypted = libx.modules.crypto.encrypt(content, key);
		fs.writeFileSync(newFile || file, encrypted);
		return encrypted;
	}

	mod.decryptFile = (file, key, newFile) => {
		var content = fs.readFileSync(file);
		var data = libx.modules.crypto.decrypt(content.toString(), key);
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
