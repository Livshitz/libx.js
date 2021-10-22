import fs from 'fs';
import path from 'path';
import { argv } from 'yargs';
import bump from 'json-bump';
import { exec } from 'child_process';
import glob from 'glob';

import { helpers } from '../helpers';
import { objectHelpers } from '../helpers/ObjectHelpers';
import { di } from '../modules/dependencyInjector';
import { log } from '../modules/log';
import { Crypto } from '../modules/Crypto';
import prompts from './prompts';
import { DynamicProperties } from '../types/interfaces';

export class Node {
    public args: any = argv;
    public prompts = prompts;

    public getFiles = (query = '**/*', options?) => {
        let p = helpers.newPromise<string[]>();
        glob(query, options, function (err, files) {
            if (err) return p.reject(err);
            p.resolve(files);
        });
        return p;
    };

    public isCalledDirectly = () => {
        try {
            // generate a stack trace
            const stack = new Error().stack;
            // the third line refers to our caller
            const stackLine = stack.split('\n')[2];
            // extract the module name from that line
            const caller = /(?!\s*at\s*)?\(?(\/.*):\d+:\d+\)?$/.exec(stackLine); ///\((.*):\d+:\d+\)$/.exec(stackLine);
            if (caller == null || caller.length == 0) return true;
            const callerModuleName = caller[caller.length - 1];

            return require.main.filename === callerModuleName;
        } catch (ex) {
            log.w('libx.node.isCalledDirectly: Error: ', ex);
            return false;
        }
    };

    public exec = async (commands: string | string[], verbose = false, throwOnFail = true): Promise<string> => {
        var cmd = commands;
        if (Array.isArray(commands)) {
            cmd = '';
            helpers._.forEach(commands, (i) => {
                cmd += i + ' && ';
            });
            cmd = cmd.slice(0, -4);
        }

        var p = helpers.newPromise();

        try {
            var process = exec(<string>cmd, (err, stdout, stderr) => {
                if (!objectHelpers.isEmpty(err) || !objectHelpers.isEmptyString(stderr)) {
                    if (throwOnFail) {
                        p.reject(err || stderr);
                        return;
                    }
                }
                p.resolve(stdout.slice(0, -1));
            });
            if (verbose) {
                process.stdout.on('data', function (data) {
                    console.log(data.slice(0, -1));
                });
            }
        } catch (err) {
            if (throwOnFail) throw err;
        }
        return p;
    };

    public getLibxVersion = (path?) => {
        var dir = path || __dirname + '/../package.json';
        var pkg = this.readPackageJson(dir);
        return pkg.version;
    };

    public readPackageJson = (path?: string) => {
        path = path || './package.json';
        var content = fs.readFileSync(path);
        var obj = helpers.parseJsonFileStripComments(content.toString('utf8'));
        return obj;
    };

    public bumpJsonVersion = async (file: string, releaseType: SemverPart = SemverPart.Patch, replace?: string) => {
        var obj = {};
        obj[releaseType] = replace || 1;
        return await bump(file, obj);
    };

    public getFilenameWithoutExtension = (_path) => {
        _path = path.basename(_path);
        if (_path == null || _path.length <= 1) return null;
        return _path.split('.').slice(0, -1).join('.');
    };

    public readJson = (file) => {
        var content = fs.readFileSync(file).toString();
        return JSON.parse(content);
    };

    public readJsonStripComments = (filePath: string) => {
        var content = fs.readFileSync(filePath);
        var obj = helpers.parseJsonFileStripComments(content.toString('utf8'));
        return obj;
    };

    public encryptFile = (file, key, newFile = null) => {
        var content = fs.readFileSync(file).toString();
        var encrypted = Crypto.encrypt(content, key);
        fs.writeFileSync(newFile || file, encrypted);
        return encrypted;
    };

    public decryptFile = (file, key, newFile = null) => {
        var content = fs.readFileSync(file);
        var data = Crypto.decrypt(content.toString(), key);
        fs.writeFileSync(newFile || file, data);
        return data;
    };

    public mkdirRecursiveSync = (path) => {
        let paths = path.split('/'); // path.delimiter);
        let fullPath = '';
        paths.forEach((path) => {
            if (fullPath === '') {
                fullPath = path;
                if (fullPath == '') fullPath = '/';
            } else {
                fullPath = fullPath + '/' + path;
            }

            if (path.match(/.+\..+/)) return false;

            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath);
            }
        });
    };

    public rmdirRecursiveSync(path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach((file, index) => {
                var curPath = path + '/' + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    // recurse
                    this.rmdirRecursiveSync(curPath);
                } else {
                    // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }

    public catchErrors = (handler = null, shouldExit = true) => {
        process
            .on('unhandledRejection', (reason: any, p) => {
                var err = {
                    message: reason.response != null ? Buffer.from(reason.response).toString() : reason?.message || reason,
                    stack: reason.stack != null ? Buffer.from(reason.stack).toString() : reason.stack,
                };
                if (handler) handler(err, reason.statusCode || reason);
                else {
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                    console.error('[Unhandled Rejection at Promise] Error:', err, reason.statusCode || '', reason, p);
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                }
                if (shouldExit) process.exit(1);
            })
            .on('uncaughtException', (err) => {
                if (handler) handler(err);
                else {
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                    console.error('Uncaught Exception thrown', err.stack || err);
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                }
                if (shouldExit) process.exit(1);
            });
    };

    public onExit = (exitHandler = null) => {
        process.stdin.resume(); //so the program will not close instantly
        var __alreadyHandledExit = false;

        function wrapper(options, exitCode) {
            try {
                if (__alreadyHandledExit) return;
                __alreadyHandledExit = true;
                if (exitHandler) exitHandler(options, exitCode);
            } catch (ex) {
                console.error('libx.node:onExit: Failed to run handler. ex: ', ex);
            } finally {
                process.exit();
            }
        }

        //do something when app is closing
        process.on('exit', wrapper.bind(exitHandler, { cleanup: true }));

        //catches ctrl+c event
        process.on('SIGINT', wrapper.bind(exitHandler, { exit: true }));

        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', wrapper.bind(exitHandler, { exit: true }));
        process.on('SIGUSR2', wrapper.bind(exitHandler, { exit: true }));

        //catches uncaught exceptions
        process.on('uncaughtException', wrapper.bind(exitHandler, { exit: true }));
    };

    public readJsonFileStripComments<T = any>(filePath: string, decryptKey?: string): T {
        let fileContent = fs.readFileSync(filePath)?.toString();
        if (fileContent == null) return null;
        if (decryptKey != null) fileContent = Crypto.decrypt(fileContent, decryptKey);
        return helpers.parseJsonFileStripComments(fileContent);
    }

    public getProjectConfig(env: string, containingFolder?: string, secret?: string) {
        const folder = containingFolder || process.cwd() + (this.args.folder || '/src');
        const projectFilePath = folder + '/project.json';
        const projectSecretsFilePath = folder + '/project-secrets.json';
        if (!fs.existsSync(projectFilePath)) throw `getProjectConfig: Could not find project.json file in "${folder}"!`;

        let projectConfig = this.readJsonFileStripComments(projectFilePath);
        projectConfig = objectHelpers.merge(projectConfig, projectConfig.envs[env]);
        delete projectConfig.envs;

        let projectSecrets = null;
        if (secret != null && fs.existsSync(projectSecretsFilePath)) {
            projectSecrets = this.readJsonFileStripComments(projectSecretsFilePath, secret);
            projectSecrets = objectHelpers.merge(projectSecrets, projectSecrets.envs[env]);
            delete projectSecrets.envs;
            projectConfig = objectHelpers.merge(projectConfig, projectSecrets);
        }

        projectConfig = helpers.formatify(projectConfig, projectConfig, projectConfig.private, projectSecrets);

        // var projectSecrets = helpers.parseConfig(projectSecretsStr, env);
        return projectConfig;
    }

    public dump(file: string, data: any, folder = './.tmp') {
        const path = `${folder}/${file}`;
        if (!objectHelpers.isString(data)) data = helpers.jsonify(data);
        fs.writeFileSync(path, data);
        console.log(`dump: File written in "${path}"`);
    }

    public read<T = any>(file, folder = './.tmp') {
        const path = `${folder}/${file}`;
        const str = fs.readFileSync(path).toString();
        return <T>JSON.parse(str);
    }
}

export enum SemverPart {
    Major = 'major',
    Minor = 'minor',
    Patch = 'patch',
    Replace = 'replace',
}

export const node = new Node();

di.register('node', node);
