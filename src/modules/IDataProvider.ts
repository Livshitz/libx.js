export interface IDataProvider {
    get<T = any>(path: string, ignoreCache?: boolean): T | Promise<T>;
    set<T = any>(path: string, data: T): void | Promise<void>;
    push<T = any>(path: string, data: T): void | Promise<void>;
    listen<T = any>(path: string, callback: (T) => any): void | Promise<void>;
    unlisten(path: string): void | Promise<void>;
}
