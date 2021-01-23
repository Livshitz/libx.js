import { StringExtensions } from '../../extensions/StringExtensions';
import { objectHelpers } from '../../helpers/ObjectHelpers';
import { Key } from '../../types/interfaces';
import { Callbacks } from '../Callbacks';
import DeepProxy from '../DeepProxy';
import { di } from '../dependencyInjector';
import { ExpiryManager } from '../ExpiryManager';
import { Firebase } from './FirebaseModule';
import { log } from '../log';
import { ProxyCache } from '../ProxyCache';

export class FireProxy<T extends Object = any> {
    public proxy: T; //: ProxyCache;
    public onReady = new Callbacks<T>();
    public target: T = null;
    public readonly objectPath: string;
    private _expiryManager = new ExpiryManager(200);
    private _proxyCache: ProxyCache;
    private _deepProxy: DeepProxy;
    private _skip = false;
    private _firebaseInstance: Firebase;
    private _options = new Options();
    private _isSynced = false;

    public constructor(firebaseInstance: Firebase, objectPath: string, initialValue?: T, options?: Partial<Options>) {
        this._options = { ...this._options, ...options };
        log.v('FireProxy:ctor: Ready');
        this._firebaseInstance = firebaseInstance;
        this.target = initialValue || <T>{};
        this.objectPath = objectPath;

        // firebaseInstance.listenChild(objectPath, (path, data) => {
        //     console.log('listenChild: change detected', path, data);
        //     this._value[path] = data;
        // });
        firebaseInstance.listen(objectPath, (data) => {
            log.v('listen: change detected', objectPath, data);
            const isInitial = !this._isSynced;

            // this._value = data;
            this.skip(() => {
                objectHelpers.merge(this.proxy, data);
                objectHelpers.merge(this.target, data);
            });
            this._isSynced = true;

            // this._proxyCache.set('', data, { manual: true });

            const shouldMerge = this._options.isSyncOnInit && isInitial;
            if (shouldMerge) {
                this._firebaseInstance.set(this.objectPath, this.proxy);
            }

            this.onReady.trigger(this.proxy);
        });

        if (this._options.isCachedProxy) {
            this._proxyCache = new ProxyCache(objectPath, this.target, {
                customHandler: {
                    // get: async (target: T, path: string, key: Key) => {
                    //     log.i('FireProxy:get');
                    //     return this._value;
                    // },
                    set: async (target: T, path: string, key: Key, value: any) => {
                        this.setterHandler(target, path, key, value);
                    },
                },
            });
            this.proxy = this._proxyCache.proxy;
        } else {
            this._deepProxy = new DeepProxy(
                this.target,
                {
                    set: (target, path, key, value) => {
                        this.setterHandler(target, path, key, value);
                    },
                },
                true
            );
            this.proxy = this._deepProxy.proxy;
        }

        // listen to remote changes from firebase and reflect in local object
        // listen to local changes and reflect in firebase
        // consider abstracting and treating any web resource
    }

    public async skip(cb: Function, condition?: boolean) {
        if (cb == null || typeof cb != 'function') return;
        if (condition == null) condition = true;
        if (condition) this._skip = true;
        await cb();
        if (condition) this._skip = false;
    }

    public async getValueFromDB(subPath?: string) {
        return await this._firebaseInstance.get(this.objectPath + subPath);
    }

    private async setterHandler(target: T, path: string, key: Key, value: any) {
        if (value?.isProxy) return;
        if (this._skip) return;
        log.d('FireProxy:set', { path, key, value });
        const parentPath = `${this.objectPath}/` + StringExtensions.removeLastPart.call(path);
        console.log('FireProxy:set', parentPath, { [key]: value });
        await this._firebaseInstance.update(parentPath, { [key]: value });
        // await firebaseInstance.set(`${objectPath}/${path}`, value);
    }
}
export class Options {
    isCachedProxy = false;
    isSyncOnInit = false;
}

di.register(FireProxy, 'FireProxy');
