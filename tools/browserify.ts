import { log } from '../src/modules/log';
import * as pax from 'pax.libx.js';
import { libx as libxNode, ILibxNode } from '../src/bundles/node.essentials';
import { objectExtensions } from '../src/extensions/ObjectExtensions';
// import fs from 'fs';
// import path from "path";

export const libx = objectExtensions.extend(libxNode, { pax });

const inputFile = libx.node.args.input || __dirname + '/../build/bundles/browser.essentials.js';
const outputFolder = libx.node.args.out || __dirname + '/../dist';
const outFileName = libx.node.args.filename;
if (!libx.isString(inputFile)) throw 'Bad input';

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
        sourceMaps: true,
        presets: ['@babel/preset-env'],
        // global: false,
    },
};

var p1 = libx.pax.copy(
    input,
    dest,
    () => [
        // libx.pax.middlewares.ts(tsOptions, tsconfig), //{}, tsconfig),
        libx.pax.middlewares.if(bundlerOptions.babelifyOptions.sourceMaps, libx.pax.middlewares.sourcemaps.init({ loadMaps: true })),

        libx.pax.middlewares.browserify(bundlerOptions),
        libx.pax.middlewares.if(shouldMinify, libx.pax.middlewares.minify()),
        libx.pax.middlewares.renameFunc((p) => {
            if (outFileName) p.basename = outFileName;
            else p.basename = p.basename + '.min';
            p.extname = '.js';
        }),

        libx.pax.middlewares.if(bundlerOptions.babelifyOptions.sourceMaps, libx.pax.middlewares.buffer()),
        libx.pax.middlewares.if(bundlerOptions.babelifyOptions.sourceMaps, libx.pax.middlewares.sourcemaps.write('./')),
    ],
    libx.node.args.watch || false,
    {
        callback: () => {
            log.i('build done');
        },
    }
);

Promise.all([p1]).then(() => {
    log.i('-- Done!');
});

if (libx.node.args.watch) {
    const triggerChange = libx.throttle(
        (p) => {
            libx.log.verbose('changed', p);
            libx.pax.triggerChange(inputFile);
        },
        3000,
        true
    );
    libx.pax.watchSimple([__dirname + '/../build/**/*.js'], (ev, p) => {
        triggerChange(p);
    });
}
