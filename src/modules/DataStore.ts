import { helpers } from "../helpers";
import { IFirebase } from "../types/interfaces";
import { log } from "./log";

interface IDataProvider {
    get<T = any>(path: string, ignoreCache?: boolean): Promise<T>;
    set<T = any>(path: string, data: T): Promise<void>;
    push<T = any>(path: string, data: T): Promise<void>;
    listen<T = any>(path: string, callback: (T) => any): Promise<void>;
    unlisten(path: string): Promise<void>;
}

export class Cache implements IDataProvider {
    private _expiryPeriodMS: number = 5 * 60 * 1000; // 5 min

    constructor(private _prefix: string = '_dataStore|') {}

    public async get<T = any>(path: string, ignoreCache: boolean = false): Promise<T> {
        if (ignoreCache || (await this.isExpired(path))) return null;
        let ret = localStorage[this._prefix + path];
        if (ret == null) return null;
        try {
            return JSON.parse(ret);
        } catch (ex) {
            log.w('Cache:get: Failed to parse content', ex);
            return null;
        }
    }
    public async set<T = any>(path: string, data: T): Promise<void> {
        localStorage[this._prefix + path] = helpers.jsonify(data, true);
        await this.setExpiry(path);
    }
    public async push<T = any>(path: string, data: T): Promise<void> {
        if (localStorage[this._prefix + path] == null) localStorage[this._prefix + path] = [];
        localStorage[this._prefix + path].push(data);
    }
    public async listen<T = any>(path: string, callback: (T) => any): Promise<void> {
        throw new Error('Method not implemented.');
    }
    public async unlisten(path: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    public async isExpired(path: string): Promise<boolean> {
        let expiryObj = localStorage[`${this._prefix}__expiry/${path}`];
        if (expiryObj == null) return true;
        let expiry = new Date(expiryObj);
        if (expiry == null) return true;
        else if (expiry > new Date()) return false;
        else return true;
    }
    public async setExpiry(path: string): Promise<Date> {
        let expiry = new Date().addMilliseconds(this._expiryPeriodMS);
        localStorage[`${this._prefix}__expiry/${path}`] = expiry;
        return expiry;
    }
    public clear(prefix?: string): void {
        for (let key in localStorage) {
            if (!key.startsWith(prefix || this._prefix)) continue;
            delete localStorage[key];
        }
    }
}

export class DataStore implements IDataProvider {
    private dataProvider: IFirebase;
    private cache: Cache;

    public constructor(dataProvider) {
        this.cache = new Cache();
        this.dataProvider = dataProvider;
    }

    public static async init(): Promise<DataStore> {
        let dataProvider: IFirebase = null;
        await helpers.di.require((firebase) => {
            dataProvider = firebase;
        });
        return new DataStore(dataProvider);
    }

    public async get<T = any>(path: string, ignoreCache: boolean = false): Promise<T> {
        let ret = null;
        if (!ignoreCache) ret = await this.cache.get(path);
        if (ret == null) {
            ret = await this.dataProvider.get(path);
            await this.cache.set(path, ret);
        }
        return ret;
    }

    public async set<T = any>(path: string, data: T): Promise<void> {
        let ret = await this.dataProvider.set(path, data);
        await this.cache.set(path, data);
        return ret;
    }

    public async push<T>(path: string, data: T): Promise<void> {
        return await this.dataProvider.push(path, data);
    }

    public async listen(path: string, callback: (T) => any): Promise<void> {
        await this.dataProvider.listen(path, async (data) => {
            await this.cache.set(path, data);
            callback(data);
        });
    }

    public async unlisten(path: string): Promise<void> {
        await this.dataProvider.unlisten(path);
    }
}
