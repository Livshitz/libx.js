// Essentials:
// const libx: LibxJS.ILibxJS = require('../../bundles/essentials');

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
	subscribe(path: string): Promise<T>;
}

class Cache<T> implements IDataProvider<T> {
	public async get(path: string, ignoreCache: boolean = false): Promise<T> {
		let ret = localStorage[path];
		if (ret == null) return null;
		try {
			return JSON.parse(ret);
		} catch (ex) {
			libx.log.w('Cache:get: Failed to parse content', ex);
			return null;
		}
	}	
	public async set(path: string, data: T): Promise<void> {
		localStorage[path] = libx.jsonify(data, true);
	}
	public async push(path: string, data: T): Promise<void> {
		if (localStorage[path] == null) localStorage[path] = [];
		localStorage[path].push(data);
	}
	public async subscribe(path: string): Promise<T> {
		throw new Error("Method not implemented.");
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
		await Module.dataProvider.set(path, data);
	}

	public async push<T>(path: string, data: T): Promise<void> {
		await Module.dataProvider.push(path, data);
	}

	public async subscribe(path: string): Promise<T> {
		throw new Error("Method not implemented.");
	}
}

(()=>{
	Module.Init();
})();