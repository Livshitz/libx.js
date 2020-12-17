// import { libx as libxEssentials } from '../../src/bundles/essentials';
import { libx as libxBrowser } from '../../src/bundles/browser.essentials';
import { Firebase } from '../../src/modules/Firebase';
import DeepProxy from '../../src/modules/DeepProxy';
import { objectExtensions } from '../../src/extensions/ObjectExtensions';
import { ProxyCache } from '../../src/modules/ProxyCache';

export const libx = objectExtensions.extend(libxBrowser, { ProxyCache, DeepProxy });

declare global {
    interface Window {
        FirebaseModule: typeof Firebase;
    }
}

window.FirebaseModule = Firebase; // just another module
