import fs from 'fs';
import path from 'path';
import { argv } from 'yargs';
import { bump } from 'json-bump';
import { exec } from 'child_process';
import glob from 'glob';

import { helpers } from "../helpers";
import { di } from "../modules/dependencyInjector";
import { log } from "../modules/log";
import { Crypto } from '../modules/Crypto';
import prompts from "./prompts";

export class Node {
	public args = argv;
	private _projectConfig = null;
	
	public getProjectConfig = (containingFolder, secret) => {
		var ret = null;
		try {
			if (this._projectConfig == null) {
				var secretsKey = secret;
				// libx.log.info('!!! Secret key is: ', secretsKey);
				var node = this; //require('../node')
				var projconfig = node.readConfig(containingFolder || '.' + '/project.json', secretsKey);
				this._projectConfig = projconfig;
			}
			if (this._projectConfig == null) throw "libx:helpers:getProjectConfig: Could not find/load project.json in '{0}'".format(containingFolder);
			return ret = this._projectConfig;
		} finally {
			if (ret != null && ret.private == null) ret.private = {};
			return ret;
		}
	}

	public getFiles = (query = '**/*', options)=>{
		let p = helpers.newPromise();
		glob(query, options, function (err, files) {
			if (err) return p.reject(err);
			p.resolve(files);
		})
		return p;
	}

	public isCalledDirectly = () => {
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
			log.w('libx.node.isCalledDirectly: Error: ', ex);
			return false;
		}
	}

	public exec = async (commands, verbose) => {
		var cmd = commands;
		if (Array.isArray(commands)) {
			cmd = '';
			helpers._.forEach(commands, i => {
				cmd += i + ' && ';
			})
			cmd = cmd.slice(0, -4);
		}

		var p = helpers.newPromise();

		var process = exec(cmd, (err, stdout, stderr) => {
			if (!helpers.ObjectHelpers.isEmpty(err) || !helpers.ObjectHelpers.isEmptyString(stderr)) {
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

	public getLibxVersion = () => {
		var dir = __dirname;
		var pkg = this.readPackageJson(dir + '/../package.json');
		return pkg.version;
	}

	public readPackageJson = (path) => {
		path = path || './package.json';
		var content = fs.readFileSync(path);
		var obj = helpers.parseJsonFileStripComments(content);
		return obj;
	}

	public readConfig = (_path, secretsKey) => {
		_path = (_path) + '/project.json';
		if (!fs.existsSync(_path)) throw `libx.bundler:readConfig: Config file could not be fount at '${_path}'`;
		var content = fs.readFileSync(_path).toString();

		var env = this.args.env || 'dev';

		this._projectConfig = helpers.parseConfig(content, env);
		log.verbose('libx.bundler:readConfig: Config for "{0}" v.{1} in env={2} was loaded'.format(this._projectConfig.projectName, this._projectConfig.version, env));

		var secretsPath = path.dirname(_path) + '/project-secrets.json';
		if (!fs.existsSync(secretsPath)) throw `libx.bundler:readConfig: Secrets config file could not be fount at '${_path}'`;
		if (!fs.existsSync(secretsPath)) return this._projectConfig;

		var content = fs.readFileSync(secretsPath).toString();

		// try to decrypt:
		if (secretsKey != null) {
			try {
				content = Crypto.decrypt(content.toString(), secretsKey);
			} catch (ex) {
				log.warning('libx.bundler:readConfig: were unable to decrypt secret config file, maybe already decrypted. ex: ', ex);
			}
		}

		var secrets = helpers.parseConfig(content, env);
		if (secrets == null) throw "libx.bundler:readConfig: Failed to read secrets config!";

		log.verbose('libx.bundler:readConfig: Extending config with secrets'.format(this._projectConfig.projectName, this._projectConfig.version, env));
		helpers.ObjectHelpers.merge(true, this._projectConfig, secrets); //deep

		return this._projectConfig;
	};

	public bumpNpmVersion = (file, releaseType) => {
		var obj = {};
		obj[releaseType] = 1;
		return bump(file, { obj })
	}

	public getFilenameWithoutExtension = (_path) => {
		_path = path.basename(_path);
		if (_path == null || _path.length <= 1) return null;
		return _path.split('.').slice(0, -1).join('.');
	}

	public readJson = (file) => {
		var content = fs.readFileSync(file).toString();
		return JSON.parse(content);
	}
	
	public readJsonFileStripComments = (file) => this.readJsonStripComments(file);

	public readJsonStripComments = (file) => {
		var content = fs.readFileSync(file);
		var obj = helpers.parseJsonFileStripComments(content);
		return obj;
	}

	public encryptFile = (file, key, newFile = null) => {
		var content = fs.readFileSync(file).toString();
		var encrypted = Crypto.encrypt(content, key);
		fs.writeFileSync(newFile || file, encrypted);
		return encrypted;
	}

	public decryptFile = (file, key, newFile = null) => {
		var content = fs.readFileSync(file);
		var data = Crypto.decrypt(content.toString(), key);
		fs.writeFileSync(newFile || file, data);
		return data;
	}

	public mkdirRecursiveSync = (path) => {
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

	public rmdirRecursiveSync = function (path) {
		if (fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function (file, index) {
				var curPath = path + "/" + file;
				if (fs.lstatSync(curPath).isDirectory()) { // recurse
					this.rmdirRecursiveSync(curPath);
				} else { // delete file
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(path);
		}
	};

	public catchErrors = (handler = null, shouldExit = true) => {
		process
			.on("unhandledRejection", (reason: any, p) => {
				var err = {
					message: reason.response != null ? Buffer.from(reason.response).toString() : reason.message,
					stack: reason.stack != null ? Buffer.from(reason.stack).toString() : reason.stack,
				};
				if (handler) handler(err, reason.statusCode || reason);
				else {
					console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
					console.error("[Unhandled Rejection at Promise] Error:", err, reason.statusCode || '', reason, p);
					console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
				}
				if (shouldExit) process.exit(1);
			})
			.on("uncaughtException", err => {
				if (handler) handler(err);
				else {
					console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
					console.error("Uncaught Exception thrown", err.stack || err);
					console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
				}
				if (shouldExit) process.exit(1);
			});
	}

	public onExit = (exitHandler = null)=> {
		process.stdin.resume();//so the program will not close instantly
		var __alreadyHandledExit = false;

		function wrapper(options, exitCode) {
			try {
				if (__alreadyHandledExit) return;
				__alreadyHandledExit  = true;
				if (exitHandler) exitHandler(options, exitCode);
			} catch(ex) {
				console.error('libx.node:onExit: Failed to run handler. ex: ', ex);
			} finally {
				process.exit();
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
}

export const node = new Node();

di.register(node, 'node');