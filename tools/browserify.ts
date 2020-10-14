import { log } from "../src/modules/log";
import * as pax from "pax.libx.js";
import { libx as libxNode, ILibxNode } from "../src/bundles/node.essentials";
// import fs from 'fs';
// import path from "path";

const libx = {
	...libxNode,
	pax,
};

const inputFile = libx.node.args.input || (__dirname + '/../build/bundles/browser.essentials.js');
const outputFolder = libx.node.args.out || (__dirname + '/../dist');
const outFileName = libx.node.args.filename;
if (!libx.helpers.ObjectHelpers.isString(inputFile)) throw 'Bad input';

(async ()=>{ /* init */
	var dest = outputFolder;
	var input = inputFile;

	var shouldMinify = libx.node.args.minify || false;
	libx.pax.config.debug = true;

	log.v('Starting...', { shouldMinify, mainJS: input, dest });

	// await libx.pax.delete(dest);

	var bundlerOptions = {
		tsify: true,
		// target: { node: 'v6.16.0' },
		babelifyOptions: {
			// global: true,
			// sourceMaps: false
		}
	};

	var p1 = libx.pax.copy(input, dest, ()=>[
		libx.pax.middlewares.browserify(bundlerOptions),
		libx.pax.middlewares.if(shouldMinify, libx.pax.middlewares.minify()),
		libx.pax.middlewares.renameFunc(p=>{ 
			if (outFileName) p.basename = outFileName;
			else p.basename = p.basename + '.min';
			p.extname='.js' 
		}),
	], false, {
		callback: ()=> {
			log.i('build done');
		}
	});

	await Promise.all([p1, ]);

	log.i('-- Done!')
})();