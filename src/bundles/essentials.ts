import { helpers, Deferred } from '../helpers';
import { Callbacks } from '../modules/Callbacks';
import { log } from '../modules/log';
import { Buffer } from 'buffer';
import { extensions } from '../extensions/';
import { di } from '../modules/dependencyInjector';
import { ObjectHelpers, objectHelpers } from '../helpers/ObjectHelpers';
import { objectExtensions } from '../extensions/ObjectExtensions';
// import { Deferred } from 'concurrency.libx.js';
// export * as LibxJS from '../types/interfaces';

if (!(<any>global)._libx_avoidExtensions) extensions.applyAllExtensions();

const libxBase = {
    $: {},
    // Deferred,
    Callbacks,
    Buffer,
    extensions,
    log,
    di,
};

const exLibx = objectExtensions.extend(libxBase, objectHelpers);
const exLibx2 = objectExtensions.extend(exLibx, helpers);

export const libx = exLibx2;

// export const libx = {
//     $: {},
//     helpers,
//     Callbacks,
//     Buffer,
//     extensions,
//     log,
//     di,
// };

// ObjectExtensions.extend.call()

// objectHelpers.merge
// helpers.parse;
// libx.merge;

export type ILibxEssentials = typeof libx;
