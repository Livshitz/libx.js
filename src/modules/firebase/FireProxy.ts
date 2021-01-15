import { objectHelpers } from '../../helpers/ObjectHelpers';
import { Key } from '../../types/interfaces';
import { Callbacks } from '../Callbacks';
import { di } from '../dependencyInjector';
import { ExpiryManager } from '../ExpiryManager';
import { Firebase } from '../Firebase/Firebase';
import { log } from '../log';
import { ProxyCache } from '../ProxyCache';

export class FireProxy<T extends Object = any> {
    public proxy: T; //: ProxyCache;
    private _expiryManager = new ExpiryManager(200);
    private _proxyCache: ProxyCache;
    private _value: T = null;
    public onReady = new Callbacks<T>();

    public constructor(firebaseInstance: Firebase, objectPath: string, initialValue: T) {
        log.v('FireProxy:ctor: Ready');
        this._value = initialValue || <T>{};

        // firebaseInstance.listenChild(objectPath, (path, data) => {
        //     console.log('listenChild: change detected', path, data);
        //     this._value[path] = data;
        // });
        firebaseInstance.listen(objectPath, (data) => {
            log.d('listen: change detected', objectPath, data);
            // this._value = data;
            objectHelpers.merge(this.proxy, data);
            objectHelpers.merge(this._value, data);
            // this._proxyCache.set('', data, { manual: true });

            this.onReady.trigger(this.proxy);
        });

        this._proxyCache = new ProxyCache(objectPath, this._value, {
            customHandler: {
                // get: async (target: T, path: string, key: Key) => {
                //     log.i('FireProxy:get');
                //     return this._value;
                // },
                set: async (target: T, path: string, key: Key, value: any) => {
                    log.d('FireProxy:set', { path, key, value });
                    await firebaseInstance.set(`${objectPath}/${path}`, value);
                },
            },
        });

        this.proxy = this._proxyCache.proxy;

        // listen to remote changes from firebase and reflect in local object
        // listen to local changes and reflect in firebase
        // consider abstracting and treating any web resource
    }
}

di.register(FireProxy, 'FireProxy');
