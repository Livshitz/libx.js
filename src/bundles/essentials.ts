import { helpers } from '../helpers';
import { Callbacks } from '../modules/Callbacks';
import { log } from '../modules/log';
import { Buffer } from 'buffer';
import { extensions } from '../extensions/';

if (!(<any>global)._libx_avoidExtensions) extensions.applyAllExtensions();

export const libx = {
    $: {},
    helpers,
    Callbacks,
    Buffer,
    extensions,
    log,
};

export type ILibxEssentials = typeof libx;
