var libx = __libx;
libx.node = libx.di.get('node') || require('./index.js');
libx.modules.crypto = libx.di.get('crypto') || require('../modules/crypto');
libx.modules.network = libx.di.get('network') || require('../modules/network');

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
const gulpBabel = require('gulp-babel');
const cleanCss = require('gulp-clean-css');
const usemin = require('gulp-usemin');
const htmlmin = require('gulp-htmlmin');
const templateCache = require('gulp-angular-templatecache');
const debug = require('gulp-debug');
const browserify = require('browserify');
const babelify = require("babelify");
const babel = require("@babel/core");
const tsify = require("tsify");
const ts = require('gulp-typescript');
const transform = require('vinyl-transform');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const streamify = require('gulp-streamify');
const intoStream = require('into-stream');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const cheerio = require('cheerio');

module.exports = (function(){
	var mod = {};

	var wrapper = function(fun) {
		var args = new Array(arguments).slice(1);
		fun.call(args);
	}

	mod.ts = ts;

	//#region middlewares: 
	mod.middlewares = {};
	mod.middlewares.minify = (options) => streamify(minify(libx.extend({ mangle: false, builtIns: false }, options)));
	mod.middlewares.renameFunc = (func) => rename(func);
	mod.middlewares.rename = (to) => rename(to);
	mod.middlewares.babelify = () => gulpBabel({ presets: ['es2015'] });
	mod.middlewares.if = (condition, middlewareAction) => gulpif(condition, middlewareAction);
	mod.middlewares.ifProd = (middleware) => mod.middlewares.if(mod.config.isProd, middleware);
	mod.middlewares.sourcemaps = sourcemaps;
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
			locals: libx.extend(locals || {}, { config: mod.projconfig }),
			// pretty: mod.config.isProd,
		})
	};
	mod.middlewares.usemin = (base) => {
		libx.log.verbose('usemin:', )
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
			sitejs: [ gulpBabel({ presets: ['es2015'] }), minify({ mangle: false }).on('error', (uglify) => {
				console.error('! Uglify error: ', uglify.message);
				console.error('usemin error: ', uglify.stack);
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
			base: mod.config.workdir, //process.cwd(),
			transformUrl: function(url) {
				// url = path.relative(mod.config.workdir , url);
				return '/' + url; // '/' + name +  //url.replace(/\.tpl\.html$/, '.html')
			}
		})
	};
	mod.middlewares.ts = (_options, tsproject) => {
		var options = {
			module: 'commonjs', // 'commonjs', 'amd', 'umd', 'system'.
            // outFile: 'compiled.js',
		};
		libx.extend(options, _options);

		// outFile forces the use of 'system' or 'amd'
		if (options.outFile != null) {
			options.module = "amd"
		}
		if (tsproject != null)
			return tsproject(options);
		else
			return ts(options);
	}

	mod.middlewares.tsify = (_options) => {
		var options = { 
			// transform: [babelify.configure({
			// 	presets: ['es2015'] //, require("@babel/preset-typescript")]
			// })],
			plugin: [tsify],
			treatChunk: (chunk, options)=> {
				if (options.sourcemaps) {
					chunk.contents
						.pipe(source(chunk.path, chunk.base)) //getBundleName() + '.js'))
						.pipe(rename(f=>f.extname = ".js"))
						// .pipe(source(path.basename(chunk.path))) //getBundleName() + '.js'))
						.pipe(buffer())
						.pipe(sourcemaps.init({loadMaps: true}))
						// Add transformation tasks to the pipeline here.
							// .pipe(uglify())
							// .on('error', log.error)
						// .pipe(minify())
						.pipe(sourcemaps.write('./'))
						.pipe(gulp.dest(options.sourcemapDest));
				} else { 
					// Just rename:
					// chunk.contents.pipe(source(chunk.path, chunk.base))
					// 	.pipe(rename(f=>f.extname = ".js"))
					// 	.pipe(gulp.dest(options.sourcemapDest));
				}
				return chunk;
			}
		};
		libx.extend(options, _options);
		
		return mod.middlewares.browserify(options); 
	}
	mod.middlewares.browserify = (_options) => {
		options = {
			// entries: files,
			
			// bare: true, 
			// bundleExternal: true,
			// target: { node: 'v10.15.3' },
			babelify: false,
			tsify: false,
			// paths: ['./node_modules', './app/'],
			standalone: '__libxjs',
			debug: false,
			plumber: false,
			minify: false,
		}
		options.babelifyOptions = {
			global: false,
			plugins: [
				// "transform-es2015-arrow-functions",
				// [
				// 	"@babel/plugin-transform-runtime", {
				// 		regenerator: true
				// 	}
				// ]
			],
			presets: [
				[
					'@babel/preset-env', 
					{
						targets: _options.target || options.target,
						// esmodules: true,
						// modules: 'commonjs',
						// useBuiltIns: "entry",
					},
				]
				//[__dirname + '/../node_modules/babel-preset-es3'], //, ["@babel/preset-env", "@babel/preset-react"] es2015 env
			],
			sourceMaps: true
		};

		// if (!mod.config.isProd) {
		// 	options.debug = true;
		// 	options.plumber = true;
		// 	options.minify = false;
		// }
		libx.extend(true, options, _options);

		// options.treatChunk = (chunk, options)=>{
		// 	chunk.contents.pipe(source(chunk.path, chunk.base))
		// 		.pipe(gulpBabel({presets: ["@babel/preset-env"]}))
		// 		// .pipe(gulp.dest(options.sourcemapDest));
		// }

		var browserified = through2.obj(function(chunk, enc, callback) {
			if(chunk.isBuffer()) {
				options.entries = chunk.path;

				var b = browserify(options);

				if (options.tsify) b.plugin(tsify) //, { noImplicitAny: false, target: 'es3' })
				if (options.babelify) b.transform(babelify, options.babelifyOptions);

				chunk.contents = b.bundle();
				
				if (options.treatChunk) options.treatChunk(chunk, options);

				this.push(chunk);
			}
			if (callback) callback();
		});
		
		return browserified;
	};
	mod.middlewares.localize = (libCacheDir, dest, avoidCache) => {
		var transform = async (e, attr, avoidRenameFile) => {
			var promise = libx.newPromise();
			var sourceDir = process.cwd(); 
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
			var h = libx.modules.crypto.lib.SHA1(src).toString();
			var p = (libCacheDir || './') + 'lib-cache/' + (avoidRenameFile ? dir : '');
			// var fname = avoidRenameFile ? `${name}${ext}` : `${h}${ext}`;
			var fname = `${name}${ext}`;
			libx.log.v('fname: ', fname);
			var f = p + fname;
			if (!fs.existsSync(p)) libx.node.mkdirRecursiveSync(p);

			var func = async ()=> {
				onFileReady(e, attr, f, ext, fname, avoidRenameFile ? dir : null).then(()=> {
					promise.resolve();
				});
			}
		
			if (avoidCache || !fs.existsSync(f)) {
				libx.log.v('getting: ', src, ext, h, dir);

				var isNetworkResource = src.startsWith("http://") || src.startsWith("https://") || src.startsWith("ftp://") || src.startsWith("//");

				var handler = (data)=> {
					if (data == null) 
						throw `Could not find "${src}"!`;
					libx.log.i('got data: ', data.length);
						
					fs.writeFile(f, data, err=> {
						if (err) throw 'Write: error: ', err;
						func();
						// return onFileReady(e, attr, f, ext, fname, avoidRenameFile ? dir : null);
					});
				}
				
				if (isNetworkResource) {
					libx.modules.network.httpGet(src, { dataType: '' }).then(data=>handler(data));
				} else {
					var p = path.relative(process.cwd(), mod.config.workdir + '/' + src);
					fs.readFile(p, (err, data)=> handler(data));
				}
			} else {
				func();
			}
			return promise;
		}

		var onFileReady = async (elm, attr, file, ext, fname, dir) => {
			libx.log.v('onFileReady: ', file)
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
			libx.bundler.copy([file], dest + p)
		
			if (attr != null) elm.attr(attr, p.substr(1) + fname);
		}

		return through2.obj(async function(file, encoding, callback) {
			if(file.isBuffer()) {
				var $ = cheerio.load(file.contents);
				// $('script').each(async (i, e)=> {
				// 	libx.log.v('$$$ ', i, $(e).attr('src'))
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
			
				libx.log.i('all done, saving')
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

	mod.copy = async (_source, dest, middlewares, shouldWatch, _options) => {
		if (middlewares != null && typeof middlewares != 'function') throw 'middlewares argument must be an initializator (function)!'
		if (middlewares == null) middlewares = ()=> [through()];

		var p = libx.newPromise();

		var options = { }; // base: mod.config.workdir };
		libx.extend(options, _options);

		// if '_source' contains 
		if (options.base == null) {
			if (!libx._.isArray(_source)) _source = [_source];
			var src = libx._.map(_source, i=> {
				var m = i.match(/(.+?)\/\*/)
				if (m == null || m.length <= 1) return;
				return m[1];
			})
			src = libx._.reduce(src);
			if (src == null || src.length == 0) {
				// options.base = mod.config.workdir;
			} else {
				options.base = src;
				libx.log.verbose('copy: setting base to: ', options.base);
			}
		}

		options.debug = false;
		var stream = gulp.src(_source, options);
		if (options.debug == null) options.debug = mod.config.debug;
		if (options.debug != false) stream = stream.pipe(debug())
		
		libx._.each(middlewares(), i=> 
			stream = stream.pipe(i) 
		);

		stream.pipe(gulp.dest(dest));
		stream.on('error', (err) => libx.log.error('--- ERROR: --- ', err) );
		stream.on('end', ()=> {
			p.resolve(stream);
			if (options.callback) options.callback(stream);
		});

		shouldWatch = shouldWatch || false;
		if (Array.isArray(_source)) _source = libx._.map(_source, i=> i.replace(/^(\!)?\.\//, '$1'));
		else _source = _source.replace(/^(\!)?\.\//, '$1');

		if (shouldWatch) mod.watch(_source, dest, middlewares, null, options);

		return p;
	};

	mod.test = async (src, dest) => {
		var p = libx.newPromise();

		gulp.src(src + '/**/*.less')
			// .pipe(concat('all.css'))
			.pipe(debug())

			.pipe(gulp.dest('./dist2/'))
			.on('error', (err) => 
				libx.log.e('--- ERROR: --- ', err)
				)
			.on('end', ()=> {
				libx.log.i('--- DONE --- ')
				p.resolve();
			});
	
		return p;
	}


	mod.watch = async (source, dest, middlewares, callback, _options) => {
		if (middlewares != null && typeof middlewares != 'function') throw 'middlewares arguments must be an initializator (function)!'
		
		var options =  {}; //{ base: path.relative(__dirname, path.dirname(source)) }; 
		libx.extend(options, _options);

		libx.log.verbose('watch: Starting to watch "%s"', source);
		mod.watchSimple(source, async(ev, p)=> {
			if (ev.type != 'changed') return;
			libx.log.verbose('mod.watch: File "%s" changed', p, ev.type, dest);
			// options.base = './src'
			// p = path.relative(__dirname, p);
			await mod.copy(options.useSourceDir ? source : p, dest, middlewares, false, options);
			if (callback) callback(p);
		})
	};

	mod.watchSimple = async (source, callback, _options) => {
		var options = { }; // cwd: "./" };
		options = libx.extend(options, _options); // {cwd: './'}
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
		opts = libx.extend({}, opts, options);

		if (watchPath != null) {
			libx.log.verbose('serve: starting watch');
			var debounce = libx.debounce((path)=> {
				libx.log.verbose('serve: debounce', path);
				if (watchCallback) watchCallback(path);
				gulp.src(path).pipe(connect.reload());
				// setTimeout(()=>gulp.src(path).pipe(connect.reload()), 500);
			}, 2000, true);
			gulp.watch(watchPath, e => { //{cwd: path} ,
				libx.log.verbose('serve: detected change!', e.path);
				setTimeout(()=>debounce(e.path), 1000);
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
			libx._.forEach(commands, i=>{
				cmd += i + ' && ';
			})
			cmd = cmd.slice(0, -4);
		}

		var p = libx.newPromise();

		// var output = [];
		// var process = spawn('ls', ['-lh', '/usr']);
		// process.stdout.on('data', function (data) {
		// 	libx.log.e('stdout: ' + data.toString());
		// });
		
		// process.stderr.on('data', function (data) {
		// 	libx.log.e('stderr: ' + data.toString());
		// });
		
		// process.on('exit', function (code) {
		// 	if (code == 0) p.resolve(output.slice(0, -1));
		// 	else p.reject(code);
		// });

		var process = exec(cmd, (err, stdout, stderr)=> {
			if (!libx.isEmpty(err) || !libx.isEmptyString(stderr)) {
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
	mod.config.workdir = process.cwd(); //path.relative(process.cwd(), '.'); //__dirname
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