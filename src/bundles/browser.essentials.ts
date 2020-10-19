import { libx as libxEssentials } from './essentials';
import { browser } from '../browser';

export const libx = {
    ...libxEssentials,
    browser,
};

export type ILibxBrowser = typeof libx;

declare global {
    interface Window {
        libx: typeof libx;
    }
}

window.libx = libx;
