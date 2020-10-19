import { helpers } from '../helpers';
import { Callbacks } from '../modules/Callbacks';
import { log } from '../modules/log';
import { Buffer } from 'buffer';
import { extensions } from '../extensions/';
import { di } from '../modules/dependencyInjector';

if (!(<any>global)._libx_avoidExtensions) extensions.applyAllExtensions();

export const libx = {
    $: {},
    helpers,
    Callbacks,
    Buffer,
    extensions,
    log,
    di,
};

export type ILibxEssentials = typeof libx;
