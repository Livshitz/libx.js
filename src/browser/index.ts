import { browserHelpers } from './browserHelpers';
import req from './require';
import detect from 'detect.js';

const getBrowserInfo = (userAgent = null) => detect.parse(userAgent || navigator.userAgent);
const browserInfo = getBrowserInfo();

export const browser = {
    helpers: browserHelpers,
    require: req,
    detect,
    getBrowserInfo,
    browserInfo,
};
