import { merge } from 'lodash';
import { libx } from '../bundles/essentials';
import { Deferred } from '../helpers';
import { objectHelpers } from '../helpers/ObjectHelpers';
import { Cache, IStoreProvider } from './Cache';
import { log } from './log';
import DeepProxy from './DeepProxy';

export class ProxyCache<T extends object = any> {
    public proxy: T;
    private _cache: Cache = null;

    public constructor(name: string, target: T, store: IStoreProvider = null) {
        this._cache = new Cache(name, 0, '/', store);
        const mergedObj = { ...target, ...this._cache.getAll() };

        this.storeObjectAsKeyValueCache('', mergedObj);

        this.proxy = DeepProxy.create(
            mergedObj,
            {
                get: (target, path, key) => {
                    if (path.startsWith('/')) path = path.substr(1, path.length);
                    log.debug(`ProxyCache2:get: ${path}`, key);
                    let ret = null;
                    if (target[key] != null) ret = target[key];
                    const cached = this._cache.get(path);
                    if (!ret?.isProxy && !objectHelpers.isObject(ret) && cached != ret) {
                        // target[key] = cached;
                        return cached; // if mismatched, prefer cached value
                    }
                    return ret;
                },
                set: (target, path, key, value) => {
                    if (path.startsWith('/')) path = path.substr(1, path.length);
                    log.debug(`ProxyCache2:changes: ${path}`, key);
                    // console.log('set', path, '=', JSON.stringify(value), target, path, value);

                    if (value != null) {
                        this.storeObjectAsKeyValueCache(path, value);
                    } else {
                        if (path.startsWith('/')) path = path.substr(1, path.length);
                        log.debug(`ProxyCache2:delete: ${path}`, key);
                        this._cache.delete(path);
                    }
                },
            },
            true
        );
    }

    private storeObjectAsKeyValueCache(path: string, value: Object) {
        if (objectHelpers.isObject(value)) {
            const kvObj = objectHelpers.objectToKeyValue(value);
            if (path != '' && !path.endsWith('/')) path += '/';
            for (let key in kvObj) {
                const val = kvObj[key];
                if (val == null) continue;
                this._cache.set(path + key, val);
            }
        } else {
            this._cache.set(path, value);
        }
    }
}
