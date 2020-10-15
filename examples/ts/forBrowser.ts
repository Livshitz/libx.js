import { libx } from '../../src/bundles/browser.essentials';
import { Firebase } from '../../src/modules/Firebase';

// import { ObjectHelpers } from '../../src/helpers/ObjectHelpers';

// import { log } from '../../src/modules/log';
// import { extensions } from '../../src/extensions/';
// import { ArrayExtensions } from '../../src/extensions/ArrayExtensions';

declare global {
    // namespace NodeJS  {
    // 	interface Global {
    // libx: typeof libx;
    // FirebaseModule: typeof Firebase;
    // 	}
    // }
    interface Window {
        libx: typeof libx;
        FirebaseModule: typeof Firebase;
    }
}

window.libx = libx;
window.FirebaseModule = Firebase; // just another module

(() => {
    console.log('hey!');
    libx.log.info('yooo');
    // extensions.applyAllExtensions();
    // console.log('test: ', { has });
    // console.log(ObjectHelpers.diff({ a: 1 }, { a: 1, b: 2 }));
    // log.info('yooo');
})();
