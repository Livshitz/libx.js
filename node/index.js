module.exports = (function(){
	var mod = {};
	const fs = require('fs');
	const path = require('path');
	const argv = require('yargs').argv;
	const bump = require('json-bump')
	
	var libx = require('../bundles/essentials.js');

	mod.args = argv;

	mod._projectConfig = null;
	mod.getProjectConfig = (containingFolder, secret)=>{
		var ret = null;
		try {
			if (mod._projectConfig == null) {
				if (global.libx == null) global.libx = {};
				if (global.libx._projconfig != null) {
					return ret = mod._projectConfig = global.libx._projconfig;
				}

				var secretsKey = secret;
				// libx.log.info('!!! Secret key is: ', secretsKey);
				var node = mod; //require('../node')
				var projconfig = node.readConfig(containingFolder || '.' + '/project.json', secretsKey);
				global.libx._projconfig = projconfig;
				mod._projectConfig = projconfig;
			}
			if (mod._projectConfig == null) throw "libx:helpers:getProjectConfig: Could not find/load project.json in '{0}'".format(containingFolder);
			return ret = mod._projectConfig;
		} finally {
			if (ret != null && ret.private == null) ret.private = {};
			return ret;
		}
	}

	mod.getLibxVersion = () => {
		var dir = __dirname;
		var pkg = mod.readPackageJson(dir + '/../package.json');
		return pkg.version;
	}

	mod.readPackageJson = (path) => {
		path = path || './package.json';
		var content = fs.readFileSync(path);
		var obj = libx.parseJsonFileStripComments(content);
		return obj;
	}

	mod.readConfig = (_path, secretsKey) => {
		_path = (_path || mod.config.workdir) + '/project.json';
		if (!fs.existsSync(_path)) throw `libx.bundler:readConfig: Config file could not be fount at '${_path}'`;
		var content = fs.readFileSync(_path);

		var env = mod.args.env || 'dev';

		mod.projconfig = libx.parseConfig(content, env);
		libx.log.verbose('libx.bundler:readConfig: Config for "{0}" v.{1} in env={2} was loaded'.format(mod.projconfig.projectName, mod.projconfig.version, env));

		var secretsPath = path.dirname(_path) + '/project-secrets.json';
		if (!fs.existsSync(secretsPath)) throw `libx.bundler:readConfig: Secrets config file could not be fount at '${_path}'`;
		if (!fs.existsSync(secretsPath)) return mod.projconfig;

		var content = fs.readFileSync(secretsPath);

		// try to decrypt:
		if (secretsKey != null) {
			try {
				var crypto = require('../modules/crypto.js');
				content = crypto.decrypt(content.toString(), secretsKey);
			} catch (ex) {
				libx.log.warning('libx.bundler:readConfig: were unable to decrypt secret config file, maybe already decrypted. ex: ', ex);
			}
		}

		var secrets = libx.parseConfig(content, env);
		if (secrets == null) throw "libx.bundler:readConfig: Failed to read secrets config!";

		libx.log.verbose('libx.bundler:readConfig: Extending config with secrets'.format(mod.projconfig.projectName, mod.projconfig.version, env));
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
		return data;
	}

	mod.encryptFile = (file, key, newFile) => {
		var content = fs.readFileSync(file).toString();
		var crypto = require('../modules/crypto.js');
		var encrypted = crypto.encrypt(content, key);
		fs.writeFileSync(newFile || file, encrypted);
		return encrypted;
	}

	mod.decryptFile = (file, key, newFile) => {
		var content = fs.readFileSync(file);
		var crypto = require('../modules/crypto.js');
		var data = crypto.decrypt(content.toString(), key);
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

(()=>{ // Dependency Injector auto module registration
	__libx.di.register('node', module.exports);
})();