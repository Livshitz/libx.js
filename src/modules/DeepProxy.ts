import { objectHelpers } from '../helpers/ObjectHelpers';
import { Key } from '../types/interfaces';
import { log } from './log';

export default class DeepProxy<T extends object = any> {
    public target: T;
    public proxy: T = null;
    private preproxy = new WeakMap();
    private delimiter = '/';

    public constructor(target: T = <T>null, private handler: IHandler, private isDeep = true) {
        this.proxy = this.proxify(target, '');
        this.target = target;
    }

    public static create<T extends object = any>(target: T = <T>null, handler: IHandler, isDeep = true) {
        const proxy = new DeepProxy<T>(target, handler, isDeep);
        return <T>proxy;
    }

    public set(target: object, path: string, key: Key, value: T, receiver: any) {
        log.debug('DeepProxy:set', path, key, value);
        if (this.handler?.set) {
            this.handler.set(target, path + this.delimiter + <string>key, key, value);
        }

        target[key] = value;

        if (this.isDeep && !(<any>value)?.isProxy && objectHelpers.isObject(value)) {
            value = this.proxify(value, path + this.delimiter + <string>key);
        }

        if (value == null && Reflect.has(target, key)) {
            log.debug('set: has existing value');
            this.unproxy(target, path + this.delimiter + <string>key);
            // this.handler.deleteProperty(target, path + this.delimiter + <string>key, key) ;
        }

        return true;
    }

    private wrapHandler(path) {
        const wrapper = {
            get: (target: object, key: Key) => {
                if (key == 'isProxy') return true;
                // if (target[key] == null) return null;

                let ret = null;
                if (this.handler?.get) {
                    ret = this.handler.get(target, path + this.delimiter + <string>key, key);
                }
                if (ret == null) ret = target[<string>key];
                return ret;
            },

            set: (target: object, key: Key, value: T, receiver: any) => {
                if (this.isDeep && !(<any>value)?.isProxy && objectHelpers.isObject(value)) {
                    log.debug('wrapHandler:set: value is an object, proxying it', value);
                    value = this.proxify(value, path + this.delimiter + <string>key);
                }
                return this.set(target, path, key, value, receiver);
            },

            deleteProperty: (target: object, key: string) => {
                if (Reflect.has(target, key)) {
                    this.unproxy(target, key);
                    let deleted = Reflect.deleteProperty(target, key);
                    if (deleted && this.handler?.set) {
                        this.handler.set(target, path + this.delimiter + key, key, null);
                    }
                    // if (deleted && this.handler.deleteProperty) {
                    //     this.handler.deleteProperty(target, path + this.delimiter + key, key);
                    // }
                    return deleted;
                }
                return false;
            },
        };
        return wrapper;
    }

    private unproxy(obj, key) {
        if (this.preproxy.has(obj[key])) {
            obj[key] = this.preproxy.get(obj[key]);
            this.preproxy.delete(obj[key]);
        }

        if (this.isDeep && obj[key] != null) {
            for (let k of Object.keys(obj[key])) {
                if (this.isDeep && typeof obj[key][k] === 'object') {
                    this.unproxy(obj[key], k);
                }
            }
        }
    }

    private proxify(obj: T, path: string, clone = false): T {
        if (obj == null) return null;
        let copy = clone ? objectHelpers.clone(obj) : obj;
        if (this.isDeep) {
            for (let key of Object.keys(copy)) {
                const prop = copy[key];
                if (typeof prop === 'object' && !prop?.isProxy) {
                    copy[key] = this.proxify(prop, path + this.delimiter + key);
                }
            }
        }

        let p = new Proxy(copy, this.wrapHandler(path));
        this.preproxy.set(p, copy);
        return <T>p;
    }
}

export interface IHandler<T = any> {
    get?(target: T, path: string, key: Key): Promise<T> | void;
    set?(target: T, path: string, key: Key, value: any): Promise<T> | void;
}
