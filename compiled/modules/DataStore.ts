// Essentials:
// const libx: LibxJS.ILibxJS = require('../../bundles/essentials');

import { LibxJS } from "../libx";

// Modules:
// import mod from '../../modules/';
// const firebase: LibxJS.ILibxJS = require('../bundles/essentials');

// Libraries:
// import fs = require('fs');

// Vars:

interface IDataProvider<T> {
	get(path: string, ignoreCache?: boolean): Promise<T>;
	set(path: string, data: T): Promise<void>;
	push(path: string, data: T): Promise<void>;
	listen(path: string, callback: (T)=>any): Promise<void>;
	unlisten(path: string): Promise<void>;
}

class Cache<T> implements IDataProvider<T> {
	private _expiryPeriodMS: number = 5 * 60 * 1000; // 5 min
	private _prefix: string = '_dataStore|';

	public async get(path: string, ignoreCache: boolean = false): Promise<T> {
		if (ignoreCache || await this.isExpired(path)) return null;
		let ret = localStorage[this._prefix+path];
		if (ret == null) return null;
		try {
			return JSON.parse(ret);
		} catch (ex) {
			libx.log.w('Cache:get: Failed to parse content', ex);
			return null;
		}
	}	
	public async set(path: string, data: T): Promise<void> {
		localStorage[this._prefix+path] = libx.jsonify(data, true);
		await this.setExpiry(path);
	}
	public async push(path: string, data: T): Promise<void> {
		if (localStorage[this._prefix+path] == null) localStorage[this._prefix+path] = [];
		localStorage[this._prefix+path].push(data);
	}
	public async listen(path: string, callback: (T)=>any): Promise<void> {
		throw new Error("Method not implemented.");
	}
	public async unlisten(path: string): Promise<void> {
		throw new Error("Method not implemented.");
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
		for(let key in localStorage) {
			if (!key.startsWith(prefix || this._prefix)) continue;
			delete localStorage[key];
		}
	}
}

export default class Module<T> implements IDataProvider<T> {
	private static dataProvider: LibxJS.IFirebase;
	private cache: Cache<any>;

	public constructor() {
		this.cache = new Cache<T>();
	}

	public static async Init(): Promise<void> {
		libx.di.registerResolve('dataStore', (firebase)=>{
			console.log('dataStore');
			this.dataProvider = firebase;
			return new Module<any>();
		})
	}

	public async get<T>(path: string, ignoreCache: boolean = false): Promise<T> {
		let ret = null;
		if (!ignoreCache) ret = await this.cache.get(path);
		if (ret == null) {
			ret = await Module.dataProvider.get(path);
			await this.cache.set(path, ret);
		}
		return ret;
	}

	public async set<T>(path: string, data: T): Promise<void> {
		let ret = await Module.dataProvider.set(path, data);
		await this.cache.set(path, data);
		return ret;
	}

	public async push<T>(path: string, data: T): Promise<void> {
		return await Module.dataProvider.push(path, data);
	}

	public async listen(path: string, callback: (T)=>any): Promise<void> {
		await Module.dataProvider.listen(path, async (data)=>{
			await this.cache.set(path, data);
			callback(data);
		});
	}

	public async unlisten(path: string): Promise<void> {
		await Module.dataProvider.unlisten(path);
	}
}

(()=>{
	Module.Init();
})();