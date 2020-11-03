import { browserHelpers } from './browserHelpers';
import req from './require';
import platform from 'platform';

export const browser = {
    helpers: browserHelpers,
    require: req,
    platform,
};
