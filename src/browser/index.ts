import { browserHelpers } from './browserHelpers';
import req from './require';
import { detect, parseUserAgent } from 'detect-browser';

const getBrowserInfo = (userAgent = null) => detect(userAgent || navigator.userAgent);
// const browserInfo = getBrowserInfo();

export const browser = {
    helpers: browserHelpers,
    require: <(url, callbackOrIsModule?: Function | boolean) => Promise<any>>req,
    detect,
    getBrowserInfo,
    parseUserAgent,
    // browserInfo,
};
