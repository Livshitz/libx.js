import { libx as libxEssentials } from './essentials';
import { browser } from '../browser';
import { objectExtensions } from '../extensions/ObjectExtensions';

export const libx = objectExtensions.extend(libxEssentials, { browser });

export type ILibxBrowser = typeof libx;

declare global {
    interface Window {
        libx: typeof libx;
    }
}

window.libx = libx;
