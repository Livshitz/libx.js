export { libx } from '../../src/bundles/browser.essentials';
import { Firebase } from '../../src/modules/Firebase';

declare global {
    interface Window {
        FirebaseModule: typeof Firebase;
    }
}

window.FirebaseModule = Firebase; // just another module
