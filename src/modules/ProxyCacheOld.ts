import { libx } from '../bundles/essentials';
import { Deferred } from '../helpers';
import { objectHelpers } from '../helpers/ObjectHelpers';
import { Cache } from './Cache';

export class ProxyCacheOld<T extends object> {
    private _cache: Cache = null;
    private _object: T = null;
    private _name: string = null;
    public proxy: typeof Proxy = null;

    public constructor(name: string, initialObject: T = <T>null) {
        if (objectHelpers.isEmptyString(name)) throw 'ProxyCache:init: name cannot be empty!';
        this._name = name;
        this._cache = new Cache(this._name, 0);

        const self = this;
        const _proxyHandler: ProxyHandler<T> = {
            get: (target, property) => {
                console.log(`Property ${property.toString()} has been read.`);
                // return target[property];
                return this._cache.get(property.toString()) || target[property];
            },
            set: (target, property, value) => {
                console.log(`Property ${property.toString()} has been set.`, value);
                this._cache.set(property.toString(), value);
                target[property] = value;
                return true;
            },
            // ownKeys: (target) => {
            //     return <any>this.getObjectFromCache();
            // },
            // apply: function(target, thisArg, args) {
            // 	//...
            // }
        };

        const cached = this.getObjectFromCache();
        if (initialObject != null) {
            initialObject = { ...initialObject, ...cached };
            this.writeObjectToCache(initialObject);
            this._object = initialObject;
        } else {
            this._object = cached;
        }

        this.proxy = new Proxy(<any>this._object, _proxyHandler);
    }

    private writeObjectToCache(obj: Object) {
        const props = libx.getCustomProperties(obj);
        for (let prop of props) {
            this._cache.set(prop, obj[prop]);
        }
    }

    private getObjectFromCache(): T {
        const props = libx.getCustomProperties(localStorage).filter((x) => x.startsWith(this._cache.prefix));
        const obj: T = <T>{};
        const name = this._name;
        for (let prop of props) {
            const propName = prop.replace(new RegExp(`${this._name}\/`, 'gi'), '');
            if (propName.contains('__expiry')) continue;
            obj[propName] = this._cache.get(propName);
        }
        return obj;
    }

    public refresh() {
        this._object = this.getObjectFromCache();
        this._object = { ...this._object, ...this.getObjectFromCache() };
    }

    /*
    public static init2<T extends object>(initialObject: T = <T>{}, name: string = '__proxyCache') {
        const _cache = new Cache(name);
        let _object = initialObject;

        const existing = _cache.get('/');
        _object = objectHelpers.merge(_object, existing);

        const self = this;
        const _proxyHandler: ProxyHandler<T> = {
            get(target, property) {
                console.log(`Property ${property.toString()} has been read.`);
                let p = new Deferred();
                _cache
                    .get('/')
                    .then((ret) => {
                        p.resolve(JSON.parse(ret)[property]);
                    })
                    .catch((err) => p.reject(err));
                return p;
            },
            set(target, property, value) {
                target[property] = value;
                _cache.set('/', JSON.stringify(target));
                return true;
            },
            // apply: function(target, thisArg, args) {
            // 	//...
            // }
        };

        const _proxy = new Proxy(<any>_object, _proxyHandler);

        _cache.set('/', JSON.stringify(_object));

        return _proxy;
    }
    */
}
