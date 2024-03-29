import { helpers, Deferred } from '../helpers';
import { Callbacks } from '../modules/Callbacks';
import { log } from '../modules/log';
import { Buffer } from 'buffer';
import { extensions } from '../extensions/';
import { di } from '../modules/dependencyInjector';
import { ObjectHelpers, objectHelpers } from '../helpers/ObjectHelpers';
import { objectExtensions } from '../extensions/ObjectExtensions';
import { BitwiseEnumHelper } from '../helpers/BitwiseEnumHelper';
import { ObjectId } from '../helpers/ObjectId';
import { Time } from '../modules/Time';
// import { Deferred } from 'concurrency.libx.js';
// export * as LibxJS from '../types/interfaces';

try {
    if (typeof global !== "undefined" && !(<any>global)._libx_avoidExtensions) extensions.applyAllExtensions();
} catch (ex) {
    console.warn('libx: failed to apply extensions', ex);
}

const libxBase = {
    $: {},
    // Deferred,
    Callbacks,
    Buffer,
    extensions,
    log,
    di,
    enum: BitwiseEnumHelper,
    objectId: ObjectId,
    Time,
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
