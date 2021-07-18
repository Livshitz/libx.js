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
import { Deferred, delay } from 'concurrency.libx.js';

export class FireProxy<T extends Object = any> {
    public proxy: T; //: ProxyCache;
    public onReady: Callbacks<T>;
    public onChange: Callbacks<T>;
    public target: T = null;
    public readonly objectPath: string;
    private _expiryManager = new ExpiryManager(200);
    private _proxyCache: ProxyCache;
    private _deepProxy: DeepProxy;
    private _skip = false;
    private _firebaseInstance: Firebase;
    private _options = new Options();
    private _isSynced = false;
    static DefaultDeferTimeMilliseconds = 100;
    static DefaultSaveDeferTimeMilliseconds = 100;

    public constructor(firebaseInstance: Firebase, objectPath: string, initialValue?: T, options?: Partial<Options>) {
        this._options = { ...this._options, ...options };
        log.v('FireProxy:ctor: Ready');
        this._firebaseInstance = firebaseInstance;
        this.target = initialValue || <T>{};
        this.objectPath = objectPath;

        this.onReady = new Callbacks<T>();
        this.onChange = new Callbacks<T>();

        // firebaseInstance.listenChild(objectPath, (path, data) => {
        //     console.log('listenChild: change detected', path, data);
        //     this._value[path] = data;
        // });

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

    public async init() {
        this._firebaseInstance.listen(this.objectPath, (data) => {
            log.d('listen: change detected', this.objectPath, data);
            if (this._skip) return;
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

            if (isInitial) this.onReady.trigger(this.proxy);
            this.onChange.trigger(this.proxy);
        });
    }

    public async skip(cb: Function, condition?: boolean) {
        if (cb == null || typeof cb != 'function') return;
        if (condition == null) condition = true;
        if (condition) this._skip = true;
        await cb();
        if (condition) this._skip = false;
    }

    public async defer(cb: Function = null, milliseconds: number = FireProxy.DefaultDeferTimeMilliseconds) {
        if (cb == null || typeof cb != 'function') return;
        const p = new Deferred();

        let cbVal = null;
        await this.skip(async () => {
            cbVal = await cb();
        });
        delay(milliseconds).then(async () => {
            await this.forceWrite();
            p.resolve(cbVal);
        });
        return p;
    }

    public async getValueFromDB(subPath?: string) {
        return await this._firebaseInstance.get(this.objectPath + subPath);
    }

    public async forceWrite() {
        return this.setterHandler(this.target, null, null, this.target, 0);
    }

    public unsubscribe() {
        this._firebaseInstance.unlisten(this.objectPath);
    }

    private async setterHandler(target: T, path: string, key: Key, value: any, defer?: number) {
        // if (value?.isProxy) return;
        if (this._skip) return;
        if (path == null) path = '';
        log.d('FireProxy:set', { path, key, value });
        const parentPath = `${this.objectPath}/` + StringExtensions.removeLastPart.call(path);
        const obj = key != null ? { [key]: value } : value;
        // console.log('FireProxy:set', parentPath, obj);

        setTimeout(async () => {
            await this._firebaseInstance.update(parentPath, obj);
        }, defer ?? 0);
    }
}
export class Options {
    isCachedProxy = false;
    isSyncOnInit = false;
    saveDeferMS = FireProxy.DefaultSaveDeferTimeMilliseconds;
}

di.register('FireProxy', FireProxy);
