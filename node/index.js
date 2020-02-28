module.exports = (function () {
	var mod = {};
	const fs = require('fs');
	const path = require('path');
	const argv = require('yargs').argv;
	const bump = require('json-bump')
	const exec = require('child_process').exec;
	const glob = require('glob')

	var libx = require('../bundles/essentials.js');

	mod.args = argv;

	mod._projectConfig = null;
	mod.getProjectConfig = (containingFolder, secret) => {
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

	mod.getFiles = (query = '**/*', options)=>{
		let p = libx.newPromise();
		glob(query, options, function (err, files) {
			if (err) return p.reject(err);
			p.resolve(files);
		})
		return p;
	}

	mod.isCalledDirectly = () => {
		try {
			// generate a stack trace
			const stack = (new Error()).stack;
			// the third line refers to our caller
			const stackLine = stack.split("\n")[2];
			// extract the module name from that line
			const caller = /(?!\s*at\s*)?\(?(\/.*):\d+:\d+\)?$/.exec(stackLine); ///\((.*):\d+:\d+\)$/.exec(stackLine);
			if (caller == null || caller.length == 0) return true;
			const callerModuleName = caller[caller.length-1];
		
			return require.main.filename === callerModuleName;
		} catch(ex) {
			libx.log.w('libx.node.isCalledDirectly: Error: ', ex);
			return false;
		}
	}

	mod.exec = async (commands, verbose) => {
		var cmd = commands;
		if (Array.isArray(commands)) {
			cmd = '';
			libx._.forEach(commands, i => {
				cmd += i + ' && ';
			})
			cmd = cmd.slice(0, -4);
		}

		var p = libx.newPromise();

		var process = exec(cmd, (err, stdout, stderr) => {
			if (!libx.isEmpty(err) || !libx.isEmptyString(stderr)) {
				p.reject(err || stderr);
				return;
			}
			p.resolve(stdout.slice(0, -1));
		});
		if (verbose) {
			process.stdout.on('data', function (data) {
				console.log(data.slice(0, -1));
			});
		}
		return p;
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

	mod.getFilenameWithoutExtension = (_path) => {
		_path = path.basename(_path);
		if (_path == null || _path.length <= 1) return null;
		return _path.split('.').slice(0, -1).join('.');
	}

	mod.readJson = (file) => {
		var content = fs.readFileSync(file);
		return JSON.parse(content);
	}
	
	mod.readJsonFileStripComments = (file) => mod.readJsonStripComments(file);

	mod.readJsonStripComments = (file) => {
		var content = fs.readFileSync(file);
		var obj = libx.parseJsonFileStripComments(content);
		return obj;
	}

	mod.encryptFile = (file, key, newFile = null) => {
		var content = fs.readFileSync(file).toString();
		var crypto = require('../modules/crypto.js');
		var encrypted = crypto.encrypt(content, key);
		fs.writeFileSync(newFile || file, encrypted);
		return encrypted;
	}

	mod.decryptFile = (file, key, newFile = null) => {
		var content = fs.readFileSync(file);
		var crypto = require('../modules/crypto.js');
		var data = crypto.decrypt(content.toString(), key);
		fs.writeFileSync(newFile || file, data);
		return data;
	}

	mod.mkdirRecursiveSync = (path) => {
		let paths = path.split('/'); // path.delimiter);
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

	mod.rmdirRecursiveSync = function (path) {
		if (fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function (file, index) {
				var curPath = path + "/" + file;
				if (fs.lstatSync(curPath).isDirectory()) { // recurse
					mod.rmdirRecursiveSync(curPath);
				} else { // delete file
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(path);
		}
	};

	mod.catchErrors = (handler = null, shouldExit = true) => {
		process
			.on("unhandledRejection", (reason, p) => {
				var err = reason.response != null ? Buffer.from(reason.response).toString() : reason.message;
				if (handler) handler(err, reason.statusCode || reason);
				else {
					console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
					console.error("[Unhandled Rejection at Promise] Error:", err, reason.statusCode || '', reason, p);
					console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
				}
				if (shouldExit) process.exit(1);
			})
			.on("uncaughtException", err => {
				if (handler) handler(err.stack, err);
				else {
					console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
					console.error("Uncaught Exception thrown", err.stack || err);
					console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
				}
				if (shouldExit) process.exit(1);
			});
	}

	mod.onExit = (exitHandler = null)=> {
		process.stdin.resume();//so the program will not close instantly

		function wrapper(options, exitCode) {
			// if (options.cleanup) console.log('clean');
			// if (exitCode || exitCode === 0) console.log(exitCode);
			if (options.exit) {
				try {
					if (exitHandler) exitHandler(options, exitCode);
				} catch(ex) {
					console.error('libx.node:onExit: Failed to run handler. ex: ', ex);
				} finally {
					process.exit();
				}
			}
		}

		//do something when app is closing
		process.on('exit', wrapper.bind(exitHandler, {cleanup:true}));

		//catches ctrl+c event
		process.on('SIGINT', wrapper.bind(exitHandler, {exit:true}));

		// catches "kill pid" (for example: nodemon restart)
		process.on('SIGUSR1', wrapper.bind(exitHandler, {exit:true}));
		process.on('SIGUSR2', wrapper.bind(exitHandler, {exit:true}));

		//catches uncaught exceptions
		process.on('uncaughtException', wrapper.bind(exitHandler, {exit:true}));
	}

	return mod;
})();

(() => { // Dependency Injector auto module registration
	__libx.di.register('node', module.exports);
})();