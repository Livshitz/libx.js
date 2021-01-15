import { merge } from 'lodash';
import { libx } from '../bundles/essentials';
import { Deferred } from '../helpers';
import { objectHelpers } from '../helpers/ObjectHelpers';
import { Cache, IStoreProvider } from './Cache';
import { log } from './log';
import DeepProxy, { IHandler } from './DeepProxy';
import { Mapping } from '../types/interfaces';
import { ExpiryManager } from './ExpiryManager';

export class ProxyCache<T extends object = any> {
    public proxy: T;
    private _cache: Cache = null;
    private _options = new ModuleOptions();
    // private _expiryManager = new ExpiryManager(200);

    public constructor(name: string, target: T, options?: ModuleOptions) {
        this._options = { ...this._options, ...options };
        this._cache = new Cache(name, 0, '/', this._options.store);
        const mergedObj = { ...target, ...this._cache.getAll() };
        // const mergedObj = target;

        this.storeObjectAsKeyValueCache('', mergedObj);

        this.proxy = DeepProxy.create(
            mergedObj,
            {
                get: (target, path, key) => {
                    if (path.startsWith('/')) path = path.substr(1, path.length);
                    log.debug(`ProxyCache:get: ${path}`, key);
                    let ret = null;
                    if (target[key] != null) ret = target[key];
                    const cached = this._cache.get(path);
                    // const isExpired = this._expiryManager.isExpired(path);
                    // if (isExpired) {

                    // }

                    if (this._options.customHandler?.get != null) {
                        return this._options.customHandler?.get(target, path, key);
                    }

                    if (!ret?.isProxy && !objectHelpers.isObject(ret) && cached != ret) {
                        // target[key] = cached;
                        return cached; // if mismatched, prefer cached value
                    }
                    return ret;
                },
                set: (target, path, key, value) => {
                    if (path.startsWith('/')) path = path.substr(1, path.length);
                    log.debug(`ProxyCache:changes: ${path}`, key);
                    // console.log('set', path, '=', JSON.stringify(value), target, path, value);

                    if (this._options.customHandler?.set != null) {
                        this._options.customHandler?.set(target, path, key, value);
                    }

                    if (value != null) {
                        this.storeObjectAsKeyValueCache(path, value);
                    } else {
                        if (path.startsWith('/')) path = path.substr(1, path.length);
                        log.debug(`ProxyCache:delete: ${path}`, key);
                        this._cache.delete(path);
                        // this._expiryManager.delete(path);
                    }
                },
            },
            true
        );
    }

    public set(path: string, value, context: object) {
        return objectHelpers.merge.call(this, this.proxy, value);
        // this.storeObjectAsKeyValueCache(path, value, context);
    }

    private storeObjectAsKeyValueCache(path: string, value: Object) {
        if (objectHelpers.isObject(value)) {
            const kvObj = objectHelpers.objectToKeyValue(value);
            if (path != '' && !path.endsWith('/')) path += '/';
            for (let key in kvObj) {
                const val = kvObj[key];
                if (val == null) continue;
                this._cache.set(path + key, val);
                // this._expiryManager.setExpiry(path + key);
                // this._expiryMap[path + key] = new
            }
        } else {
            this._cache.set(path, value);
            // this._expiryManager.setExpiry(path);
        }
    }
}

export class ModuleOptions {
    store?: IStoreProvider;
    customHandler?: IHandler;
}
