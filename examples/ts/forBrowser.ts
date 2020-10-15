import { libx } from '../../src/bundles/browser.essentials';
import { Firebase } from '../../src/modules/Firebase';

declare global {
    interface Window {
        libx: typeof libx;
        FirebaseModule: typeof Firebase;
    }
}

window.libx = libx;
window.FirebaseModule = Firebase; // just another module
