const libx = require('../entry.js');
libx.pax = require("pax.libx.js");
libx.node = require("./../node");

(async ()=>{ /* init */
	var src = __dirname + "/";
	var dest = __dirname + "/../dist";
	var mainJS = src + '/browserified.js';

	var shouldMinify = libx.node.args.minify || false;
	libx.pax.config.debug = true;

	await libx.pax.delete(dest);

	var bundlerOptions = {
		tsify: true,
		// target: { node: 'v6.16.0' },
		babelifyOptions: {
			// global: true,
			// sourceMaps: false
		}
	};

	var p1 = libx.pax.copy(mainJS, dest, ()=>[
		libx.pax.middlewares.browserify(bundlerOptions),
		libx.pax.middlewares.if(shouldMinify, libx.pax.middlewares.minify()),
		libx.pax.middlewares.renameFunc(p=>p.basename='libx.min'),
	], false, {
		callback: ()=> console.log('build done')
	});

	await Promise.all([p1, ]);

	console.log('-- Done!')
})();