import { ArrayExtensions } from '../extensions/ArrayExtensions';
import { StringExtensions } from '../extensions/StringExtensions';
import { helpers } from '../helpers';
import { objectHelpers } from '../helpers/ObjectHelpers';
import { Callbacks } from './Callbacks';
import { IDataProvider } from './IDataProvider';
import { log } from './log';
import { DynamicProperties, Mapping } from '../types/interfaces';
import { LocalStorageMock } from './LocalStorageMock';

let localStorage = LocalStorageMock.safeGetLocalStorage();

export class Cache implements IDataProvider {
    public delimiter = '/';
    public prefix: string;
    private _expiryPeriodMS: number;
    private static readonly _DefaultExpiryMS = 5 * 60 * 1000; // 5 min
    private store: IStoreProvider;
    private onChange = new Callbacks();
    private listenersMap: Mapping<ListenerCallback> = {};

    constructor(prefix: string, expiryPeriodMS: number = Cache._DefaultExpiryMS, delimiter?: string, store: IStoreProvider = null) {
        if (delimiter) this.delimiter = delimiter;
        this.prefix = prefix;
        if (expiryPeriodMS != null) this._expiryPeriodMS = expiryPeriodMS;
        if (this?.prefix != '' && !this.prefix.endsWith) this.prefix += this.delimiter;
        this.store = store || localStorage;

        this.onChange.subscribe((path, data) => this.changesListener(path, data));
    }

    public get<T = any>(path: string, ignoreCache: boolean = false): T {
        if (ignoreCache || this.isExpired(path)) return null;
        const keyPath = this.prefix + this.delimiter + path;
        let ret = this.store[keyPath];
        if (ret != null) {
            try {
                return JSON.parse(ret);
            } catch (ex) {
                log.w('Cache:get: Failed to parse content', ex);
                return null;
            }
        } else {
            if (ret == null) {
                return <T>this.getAll(keyPath);
            }
        }
    }

    public set<T = any>(path: string, data: T) {
        if (data == null || this.isEmpty(data)) {
            this.delete(path);
        }
        this.store[this.prefix + this.delimiter + path] = helpers.jsonify(data, true);
        if (this._expiryPeriodMS != 0 && this._expiryPeriodMS != null) this.setExpiry(path);
        this.onChange.trigger(path, data);
    }

    public delete<T = any>(path: string) {
        const key = this.prefix + this.delimiter + path;
        for (const k in this.store) {
            if (k.startsWith(key)) {
                delete this.store[k];
            }
        }
        this.onChange.trigger(path, null);
    }

    public push<T = any>(path: string, data: T) {
        if (this.store[this.prefix + this.delimiter + path] == null) this.store[this.prefix + this.delimiter + path] = [];
        this.store[this.prefix + this.delimiter + path].push(data);
        this.onChange.trigger(path, this.store[this.prefix + this.delimiter + path]);
    }

    public listen<T = any>(path: string = '/', callback: ListenerCallback) {
        this.listenersMap[path] = callback;
    }

    public unlisten(path: string) {
        delete this.listenersMap[path];
    }

    public isExpired(path: string): boolean {
        if (this._expiryPeriodMS == 0) return false;

        let expiryObj = this.store[`${this.prefix}/__expiry/${path}`];
        if (expiryObj == null) return true;
        let expiry = new Date(expiryObj);
        if (expiry == null) return true;
        else if (expiry > new Date()) return false;
        else return true;
    }

    public setExpiry(path: string, expiryPeriodMS: number = null): Date {
        let expiry = new Date().addMilliseconds(expiryPeriodMS || this._expiryPeriodMS);
        this.store[`${this.prefix}/__expiry/${path}`] = expiry;
        return expiry;
    }

    public clear(prefix?: string): void {
        for (let key in this.store) {
            if (!key.startsWith(prefix || this.prefix)) continue;
            delete this.store[key];
            this.onChange.trigger(key, null);
        }
    }

    public getAll(prefix?: string): Object {
        let ret: Object = null;
        prefix = prefix || this.prefix;
        for (let key in this.store) {
            const orgKey = key;
            if (!key.startsWith(prefix || this.prefix)) continue;
            key = key.substr(prefix.length + 1);

            if (StringExtensions.contains.call(key, '__expiry')) continue;

            let value = this.store[orgKey];
            try {
                value = JSON.parse(value);
            } catch {}
            ret = objectHelpers.spawnHierarchy(key, ret, value, '/');
        }
        return ret;
    }

    private isEmpty(value: any) {
        if (Array.isArray(value)) {
            return value.length === 0;
        } else if (typeof value === 'object' && value !== null) {
            return Object.keys(value).length === 0;
        }
        return false;
    }

    private fixPath(path: string): string {
        return path.replace(/\/\//g, '/');
    }

    private changesListener(path: string, data: Object) {
        const rootCallback = this.listenersMap['/'];
        if (rootCallback != null) rootCallback(path, data);

        const registeredCallback = this.listenersMap[path];
        if (registeredCallback == null) return;
        registeredCallback(path, data);
    }
}

type ListenerCallback<T = any> = (path, data: T) => void;

export interface IStoreProvider {
    clear();
    getItem(key);
    setItem(key, value);
    removeItem(key);
}
