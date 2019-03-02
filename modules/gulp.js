const infra = require('../bundles/essentials.js');
infra.node = require('../node/index.js');
infra.crypto = require('../modules/crypto.js');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const through = require('through');
const through2 = require('through2');

const path = require('path');
const connect = require('gulp-connect');
const compression = require('compression')
const argv = require('yargs').argv;
const cors = require('cors');
const del = require('del');
const fs = require('fs');
const shell = require('gulp-shell');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

// const filter = require("gulp-filter");
// const chokidar = require('chokidar');

// middleweres
const minify = require("gulp-babel-minify");
const rename = require('gulp-rename');
const less = require('gulp-less');
const jade = require('gulp-pug');
const sass2less = require('less-plugin-sass2less')
const babel = require('gulp-babel');
const cleanCss = require('gulp-clean-css');
const usemin = require('gulp-usemin');
const htmlmin = require('gulp-htmlmin');
const templateCache = require('gulp-angular-templatecache');
const debug = require('gulp-debug');
const browserify = require('browserify');
const babelify = require('babelify');
const transform = require('vinyl-transform');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const streamify = require('gulp-streamify');
const intoStream = require('into-stream');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const cheerio = require('cheerio')

module.exports = (function(){
	var mod = {};

	var wrapper = function(fun) {
		var args = new Array(arguments).slice(1);
		fun.call(args);
	}

	//#region middlewares: 
	mod.middlewares = {};
	mod.middlewares.minify = (options) => streamify(minify(infra.extend({ mangle: false, builtIns: false }, options)));
	mod.middlewares.renameFunc = (func) => rename(func);
	mod.middlewares.rename = (to) => rename(to);
	mod.middlewares.babelify = () => babel({ presets: ['es2015'] }); //['es2015']
	mod.middlewares.if = (condition, middlewareAction) => gulpif(condition, middlewareAction);
	mod.middlewares.ifProd = (middleware) => mod.middlewares.if(mod.config.isProd, middleware);
	mod.middlewares.minifyLess = () => cleanCss();
	mod.middlewares.concat = (filename) => concat(filename);
	mod.middlewares.write = (dest) => gulp.dest(dest);
	mod.middlewares.triggerChange = (path) => {
		return through2.obj(async function(file, encoding, callback) {
			this.push(file);
			callback();
			return mod.triggerChange(path);
		});
	}
	mod.middlewares.less = () => {
		return less({
			paths: [path.join(__dirname, 'less', 'includes')],
			plugins: [sass2less]
		})
	};
	mod.middlewares.pug = (locals) => {
		return jade({
			locals: infra.extend(locals || {}, { config: mod.projconfig }),
			// pretty: mod.config.isProd,
		})
	};
	mod.middlewares.usemin = (base) => {
		infra.log.verbose('usemin:', )
		return usemin({
			// assetsDir: './tests/bundle/',
			path: base, //'./tests/bundle/',
			//outputRelativePath: "dist",
			css: [ cleanCss(), 'concat' ], // rev()
			html: [ htmlmin({ collapseWhitespace: true }) ],
			js: [ gulpif(mod.config.isProd, minify({
				mangle: {
				keepClassName: true
				}
			}) ) ],
			jsBundle: [ 'concat' ],
			sitejs: [ babel({ presets: ['es2015'] }), minify({ mangle: false }).on('error', (uglify) => {
				console.error('! Uglify error: ', uglify.message);
				console.error('Error: ', uglify.stack);
				this.emit('end');
			})],
			componentsjs: [ minify({ mangle: false }) ],
			inlinejs: [ minify() ],
			inlinecss: [ cleanCss(), 'concat' ]
		});
	};
	mod.middlewares.template = (name) => {
		return templateCache({
			filename: name + '-templates.js',
			// standalone: true,
			//module: 'myApp'
			transformUrl: function(url) {
				url = path.relative(mod.config.workdir , url);
				return '/' + url; // '/' + name +  //url.replace(/\.tpl\.html$/, '.html')
			}
		})
	};
	mod.middlewares.browserify = (_options) => {
		options = {
			// entries: files,
			transform: [babelify.configure({
				presets: ['es2015']
			})],
			bare: true, 
			// plugin: ['http'],
			// bundleExternal: true,
			standalone: '__libxjs',
			debug: false,
			plumber: false,
			minify: true,
		}

		// if (!mod.config.isProd) {
		// 	options.debug = true;
		// 	options.plumber = true;
		// 	options.minify = false;
		// }

		infra.extend(options, _options);

		// return browserify(options).bundle() //buffer()
		var browserified = through2.obj(function(chunk, enc, callback) {
			if(chunk.isBuffer()) {
				options.entries = chunk.path;

				var b = browserify(options)
					;
					//.transform(to5browserify); // Any custom browserify stuff should go here

				chunk.contents = b.bundle()

				// if (options.sourcemaps)
				// 	chunk.contents
						// .pipe(source(chunk.path)) //getBundleName() + '.js'))
						// .pipe(source(path.basename(chunk.path))) //getBundleName() + '.js'))
						// .pipe(buffer())
						// .pipe(sourcemaps.init({loadMaps: true}))
						// Add transformation tasks to the pipeline here.
						// .pipe(minify())
						// .pipe(sourcemaps.write('./'))
						// .pipe(gulp.dest('./temp'))

				this.push(chunk);
			}
			if (callback) callback();
		});
		
		return browserified;
	};
	mod.middlewares.localize = (libCacheDir, dest, avoidCache) => {
		var transform = async (e, attr, avoidRenameFile) => {
			var promise = infra.newPromise();
			var src = e.attr(attr);
			var dest = e.attr('dest');
			if (src == null) return;
			var m = src.match(/(?:\/\/.+?\/|\.\.\/|\.\/)(.*)\/.*?([^\/]+)(\.[^\.\/\?]+).*$/);
			if (m == null || m.length == 1) return;
			var dir = dest || m[1] + '/';
			var name = m[2];
			var ext = m[3];
			var isRemote = src.match(/^(.+:)?\/\/|http/g) != null
			// if (!isRemote) return;
			var h = infra.crypto.lib.SHA1(src).toString();
			var p = (libCacheDir || './') + 'lib-cache/' + (avoidRenameFile ? dir : '');
			// var fname = avoidRenameFile ? `${name}${ext}` : `${h}${ext}`;
			var fname = `${name}${ext}`;
			console.log('fname: ', fname);
			var f = p + fname;
			if (!fs.existsSync(p)) infra.node.mkdirRecursiveSync(p);

			var func = async ()=> {
				onFileReady(e, attr, f, ext, fname, avoidRenameFile ? dir : null).then(()=> {
					promise.resolve();
				});
			}
		
			if (avoidCache || !fs.existsSync(f)) {
				console.log('getting: ', src, ext, h);

				var isNetworkResource = src.startsWith("http://") || src.startsWith("https://") || src.startsWith("ftp://") || src.startsWith("//");

				var handler = (data)=> {
					if (data == null) 
						throw `Could not find "${src}"!`;
					console.log('got data: ', data.length);
						
					fs.writeFile(f, data, err=> {
						if (err) throw 'Write: error: ', err;
						func();
						// return onFileReady(e, attr, f, ext, fname, avoidRenameFile ? dir : null);
					});
				}

				if (isNetworkResource) {
					infra.network.httpGet(src, { dataType: '' }).then(handler)
				} else {
					var p = path.relative(process.cwd(), process.cwd() + '/' + mod.config.workdir + '/' + src);
					fs.readFile(p, (err, data)=> handler(data));
				}
			} else {
				func();
			}
			return promise;
		}

		var onFileReady = async (elm, attr, file, ext, fname, dir) => {
			console.log('onFileReady: ', file)
			var type = '';
			switch(ext) {
				case '.js': type = 'scripts'; break;
				case '.css': type = 'styles'; break;
				case '.jpg': 
				case '.jpeg': 
				case '.gif': 
				case '.png': type = 'imgs'; break;
				case '.otf': 
				case '.svg': 
				case '.eot': 
				case '.ttf': 
				case '.woff': type = 'fonts'; break;
			}
			dir = dir || '';
			dir = dir.replace(/^fonts(\/)?(lib)?/, '');
			var p = `/resources/${type}/lib/${dir}`;
			infra.gulp.copy([file], dest + p)
		
			if (attr != null) elm.attr(attr, p.substr(1) + fname);
		}

		return through2.obj(async function(file, encoding, callback) {
			if(file.isBuffer()) {
				var $ = cheerio.load(file.contents);
				// $('script').each(async (i, e)=> {
				// 	console.log('$$$ ', i, $(e).attr('src'))
				// });

				var p = [];

				$('script').each(async (i, e)=> {
					p.push(transform($(e), 'src'));
				})
				$('link').each(async (i, e)=> {
					p.push(transform($(e), 'href'));
				})
			
				$('font').each(async (i, e)=> {
					p.push(transform($(e), 'url', true));
					$(e).remove();
				});
			
				await Promise.all(p);
			
				console.log('all done, saving')
				file.contents = Buffer.from($.html());

				this.push(file);

			}
			callback();
		});
	}
	mod.middlewares.liveReload = () => connect.reload();

	//#endregion

	//#region methods: 
	mod.getArgs = () => argv;

	mod.readConfig = (_path, secretsKey) => {
		_path = _path || mod.config.workdir + 'project.json';
		var content = fs.readFileSync(_path);
		mod.projconfig = infra.readConfig(content, mod.config.env );
		infra.log.verbose('infra.gulp:readConfig: Config for "{0}" v.{1} in env={2} was loaded'.format(mod.projconfig.projectName, mod.projconfig.version, mod.config.env));

		var secretsPath = path.dirname(_path) + '/project-secrets.json';
		if (!fs.existsSync(secretsPath)) return mod.projconfig;

		var content = fs.readFileSync(secretsPath);

		// try to decrypt:
		try {
			content = infra.crypto.decrypt(content.toString(), secretsKey);
		} catch (ex) {
			infra.log.warning('infra.gulp:readConfig: were unable to decrypt secret config file, maybe already decrypted. ex: ', ex);
		}

		var secrets = infra.readConfig(content, mod.config.env);
		if (secrets == null) throw "infra.gulp:readConfig: Failed to read secrets config!";

		infra.log.verbose('infra.gulp:readConfig: Extending config with secrets'.format(mod.projconfig.projectName, mod.projconfig.version, mod.config.env));
		infra.extend(true, mod.projconfig, secrets); //deep

		return mod.projconfig;
	};

	mod.copy = async (_source, dest, middlewares, shouldWatch, _options) => {
		if (middlewares != null && typeof middlewares != 'function') throw 'middlewares argument must be an initializator (function)!'
		if (middlewares == null) middlewares = ()=> [through()];

		var p = infra.newPromise();

		var options = { }; // base: mod.config.workdir };
		infra.extend(options, _options);

		// if '_source' contains 
		if (options.base == null) {
			if (!infra._.isArray(_source)) _source = [_source];
			var src = infra._.map(_source, i=> {
				var m = i.match(/(.+?)\/\*/)
				if (m == null || m.length <= 1) return;
				return m[1];
			})
			src = infra._.reduce(src);
			if (src == null || src.length == 0) {
				// options.base = mod.config.workdir;
			} else {
				options.base = src;
				infra.log.verbose('copy: setting base to: ', options.base);
			}
		}

		options.debug = false;
		var stream = gulp.src(_source, options);
		if (options.debug == null) options.debug = mod.config.debug;
		if (options.debug != false) stream = stream.pipe(debug())
		
		infra._.each(middlewares(), i=> 
			stream = stream.pipe(i) 
		);

		stream.pipe(gulp.dest(dest));
		stream.on('error', (err) => infra.log.error('--- ERROR: --- ', err) );
		stream.on('end', ()=> {
			p.resolve(stream);
			if (options.callback) options.callback(stream);
		});

		shouldWatch = shouldWatch || false;
		if (Array.isArray(_source)) _source = infra._.map(_source, i=> i.replace(/^(\!)?\.\//, '$1'));
		else _source = _source.replace(/^(\!)?\.\//, '$1');

		if (shouldWatch) mod.watch(_source, dest, middlewares, null, options);

		return p;
	};

	mod.test = async (src, dest) => {
		var p = infra.newPromise();

		gulp.src(src + '/**/*.less')
			// .pipe(concat('all.css'))
			.pipe(debug())

			.pipe(gulp.dest('./dist2/'))
			.on('error', (err) => 
				console.log('--- ERROR: --- ', err)
				)
			.on('end', ()=> {
				console.log('--- DONE --- ')
				p.resolve();
			});
	
		return p;
	}


	mod.watch = async (source, dest, middlewares, callback, _options) => {
		if (middlewares != null && typeof middlewares != 'function') throw 'middlewares arguments must be an initializator (function)!'
		
		var options =  {}; //{ base: path.relative(__dirname, path.dirname(source)) }; 
		infra.extend(options, _options);

		infra.log.verbose('watch: Starting to watch "%s"', source);
		mod.watchSimple(source, async(ev, p)=> {
			if (ev.type != 'changed') return;
			infra.log.verbose('mod.watch: File "%s" changed', p, ev.type, dest);
			// options.base = './src'
			// p = path.relative(__dirname, p);
			await mod.copy(options.useSourceDir ? source : p, dest, middlewares, false, options);
			if (callback) callback(p);
		})
	};

	mod.watchSimple = async (source, callback, _options) => {
		var options = { }; // cwd: "./" };
		options = infra.extend(options, _options); // {cwd: './'}
		gulp.watch(source,  options , async (ev)=> { //
			var p = ev.path;
			p = path.relative(process.cwd(), p);
			if (callback) callback(ev, p);
		});
	}

	mod.triggerChange = async (file) => {
		return fs.readFile(file, (err, data)=> fs.writeFile(file, data, ()=>{} ));
	}

	mod.serve = async (path, options, watchPath, watchCallback) => {
		path = path || mod.config.workdir;
		var port = mod.config.devServer.port;
		var livePort = mod.config.devServer.livePort;
		var opts = {
			livereload: livePort ? {
				port: livePort
			} : false,
			root: path,
			fallback: path + '/' + 'index' + '.html',
			// debug: true,
			https: mod.config.devServer.useHttps,
			/* https: {
				cert: fs.readFileSync("DevLocal.crt"),
				passphrase: "1"
				
				// key: fs.readFileSync("DevLocal.key"),
				// ca: fs.readFileSync(pathToCa),
			}, */
			host: mod.config.devServer.host || '0.0.0.0', //'liv-mac.local',
			port: port,
			middleware: () => [cors(), 
				// compression({
				// 	filter: (req) => req.url !== '/'
				// })
			],
		};
		opts = infra.extend(opts, options);

		if (watchPath != null) {
			infra.log.verbose('server: starting watch');
			var debounce = infra.debounce((path)=> {
				infra.log.verbose('server: debounce', path);
				if (watchCallback) watchCallback(path);
				gulp.src(path).pipe(connect.reload());
				// setTimeout(()=>gulp.src(path).pipe(connect.reload()), 500);
			}, 500);
			gulp.watch(watchPath, e => { //{cwd: path} ,
				infra.log.verbose('server: detected change!', e.path);
				debounce(e.path)
			});
		}

		return connect.server(opts);
	};

	mod.delete = async (path, options) => {
		return del(path, options);
	}

	mod.exec = async (commands, verbose) => {
		var cmd = commands;
		if (Array.isArray(commands)) {
			cmd = '';
			infra._.forEach(commands, i=>{
				cmd += i + ' && ';
			})
			cmd = cmd.slice(0, -4);
		}

		var p = infra.newPromise();

		// var output = [];
		// var process = spawn('ls', ['-lh', '/usr']);
		// process.stdout.on('data', function (data) {
		// 	console.log('stdout: ' + data.toString());
		// });
		
		// process.stderr.on('data', function (data) {
		// 	console.log('stderr: ' + data.toString());
		// });
		
		// process.on('exit', function (code) {
		// 	if (code == 0) p.resolve(output.slice(0, -1));
		// 	else p.reject(code);
		// });

		var process = exec(cmd, (err, stdout, stderr)=> {
			if (!infra.isEmpty(err) || !infra.isEmptyString(stderr)) {
				p.reject(err || stderr);
				return;
			}
			p.resolve(stdout.slice(0, -1));
		});
		if (verbose) {
			process.stdout.on('data', function(data) {
				console.log(data.slice(0, -1)); 
			});
		}
		return p;
	}
	//#endregion

	mod.consts = {
		environments: { dev: 0, staging: 1, prod:2 },
		environmentsNames: { 0:'dev', 1:'staging', 2:'prod' },
		fileTypes: { other: 0, script: 1, style: 2, html:3 },
		locations: { other: 0, view: 1, component: 2 }
	}

	//#region config: 
	mod.projconfig = {};
	mod.config = {};
	mod.config.workdir = path.relative(__dirname, '.');
	mod.config.env = mod.getArgs().env || 'dev';
	mod.config.isProd = argv.env == 'prod';
	mod.config.devServer = {};
	mod.config.devServer.port = 3000;
	mod.config.devServer.host = '0.0.0.0';
	mod.config.devServer.livePort = 35729;
	mod.config.devServer.useHttps = false;
	//#endregion

	return mod;
})();