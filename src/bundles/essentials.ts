import { helpers } from '../helpers';
import { Callbacks } from '../modules/Callbacks';
import { log } from '../modules/log';
import { Buffer } from 'buffer';
import { extensions } from '../extensions/';
import { di } from '../modules/dependencyInjector';
import { ObjectHelpers, objectHelpers } from '../helpers/ObjectHelpers';
import { ObjectExtensions } from '../extensions/ObjectExtensions';

if (!(<any>global)._libx_avoidExtensions) extensions.applyAllExtensions();

const libxBase = {
    $: {},
    Callbacks,
    Buffer,
    extensions,
    log,
    di,
};

const exLibx = ObjectExtensions.extend(libxBase, objectHelpers);
const exLibx2 = ObjectExtensions.extend(exLibx, helpers);

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
