import { IFirebase } from '../types/interfaces';
import { Cache } from './Cache';
import { IDataProvider } from './IDataProvider';
import { di } from './dependencyInjector';

export class DataStore implements IDataProvider {
    private dataProvider: IFirebase;
    private cache: Cache;
    private prefix: string = '';

    public constructor(dataProvider: IFirebase, prefix: string = '') {
        this.cache = new Cache('_dataStore|');
        this.dataProvider = dataProvider;
        this.prefix = prefix;
    }

    public static async init(prefix: string = ''): Promise<DataStore> {
        let dataProvider: IFirebase = null;
        await di.inject((firebase) => {
            dataProvider = firebase;
        });
        const ret = new DataStore(dataProvider, prefix);
        ret.prefix = prefix;
        return ret;
    }

    public async get<T = any>(path: string = '', ignoreCache: boolean = false): Promise<T> {
        let ret = null;
        if (!ignoreCache) ret = await this.cache.get(path);
        if (ret == null) {
            ret = await this.dataProvider.get(this.prefix + path);
            await this.cache.set(path, ret);
        }
        return ret;
    }

    public async set<T = any>(path: string, data: T): Promise<void> {
        let ret = await this.dataProvider.set(this.prefix + path, data);
        await this.cache.set(path, data);
        return ret;
    }

    public async push<T>(path: string, data: T): Promise<void> {
        return await this.dataProvider.push(this.prefix + path, data);
    }

    public async listen(path: string, callback: (T) => any): Promise<void> {
        await this.dataProvider.listen(this.prefix + path, async (data) => {
            await this.cache.set(path, data);
            callback(data);
        });
    }

    public async unlisten(path: string): Promise<void> {
        await this.dataProvider.unlisten(this.prefix + path);
    }

    public async clear() {
        this.cache.clear();
    }
}

di.register('DataStore', DataStore);
