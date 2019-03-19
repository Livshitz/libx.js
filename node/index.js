module.exports = (function(){
	var mod = {};
	const fs = require('fs');
	const path = require('path');
	const argv = require('yargs').argv;
	const bump = require('json-bump')
	
	var libx = require('../bundles/essentials.js');
	libx.modules.crypto = require('../modules/crypto.js');

	mod.args = argv;

	mod.readConfig = (_path, secretsKey) => {
		_path = (_path || mod.config.workdir) + '/project.json';
		if (!fs.existsSync(_path)) throw `libx.gulp:readConfig: Config file could not be fount at '${_path}'`;
		var content = fs.readFileSync(_path);

		var env = mod.args.env || 'dev';

		mod.projconfig = libx.parseConfig(content, env);
		libx.log.verbose('libx.gulp:readConfig: Config for "{0}" v.{1} in env={2} was loaded'.format(mod.projconfig.projectName, mod.projconfig.version, env));

		var secretsPath = path.dirname(_path) + '/project-secrets.json';
		if (!fs.existsSync(secretsPath)) throw `libx.gulp:readConfig: Secrets config file could not be fount at '${_path}'`;
		if (!fs.existsSync(secretsPath)) return mod.projconfig;

		var content = fs.readFileSync(secretsPath);

		// try to decrypt:
		try {
			content = libx.modules.crypto.decrypt(content.toString(), secretsKey);
		} catch (ex) {
			libx.log.warning('libx.gulp:readConfig: were unable to decrypt secret config file, maybe already decrypted. ex: ', ex);
		}

		var secrets = libx.parseConfig(content, env);
		if (secrets == null) throw "libx.gulp:readConfig: Failed to read secrets config!";

		libx.log.verbose('libx.gulp:readConfig: Extending config with secrets'.format(mod.projconfig.projectName, mod.projconfig.version, env));
		libx.extend(true, mod.projconfig, secrets); //deep

		return mod.projconfig;
	};

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
