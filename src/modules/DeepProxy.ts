import { objectHelpers } from '../helpers/ObjectHelpers';
import { Key } from '../types/interfaces';
import { log } from './log';

export default class DeepProxy<T extends object = any> {
    private preproxy = new WeakMap();
    private delimiter = '/';

    private constructor(target: T = <T>null, private handler: IHandler, private isDeep = true) {
        return <any>this.proxify(target, '');
    }

    public static create<T extends object = any>(target: T = <T>null, handler: IHandler, isDeep = true) {
        const proxy = new DeepProxy<T>(target, handler, isDeep);
        return <T>proxy;
    }

    private wrapHandler(path) {
        return {
            get: (target: object, key: Key) => {
                if (key == 'isProxy') return true;

                let ret = null;
                if (this.handler.get) {
                    ret = this.handler.get(target, path + this.delimiter + <string>key, key);
                }
                if (ret == null) ret = target[<string>key];
                return ret;
            },

            set: (target: object, key: Key, value: T, receiver: any) => {
                if (this.handler.set) {
                    this.handler.set(target, path + this.delimiter + <string>key, key, value);
                }

                if (this.isDeep && objectHelpers.isObject(value) && !(<any>value)?.isProxy) {
                    value = this.proxify(value, path + this.delimiter + <string>key);
                }

                if (value == null && Reflect.has(target, key)) {
                    log.debug('set: has existing value');
                    this.unproxy(target, key);
                    // this.handler.deleteProperty(target, path + this.delimiter + <string>key, key) ;
                }

                target[key] = value;

                return true;
            },

            deleteProperty: (target: object, key: string) => {
                if (Reflect.has(target, key)) {
                    this.unproxy(target, key);
                    let deleted = Reflect.deleteProperty(target, key);
                    if (deleted && this.handler.set) {
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
    }

    private unproxy(obj, key) {
        if (this.preproxy.has(obj[key])) {
            obj[key] = this.preproxy.get(obj[key]);
            this.preproxy.delete(obj[key]);
        }

        if (this.isDeep) {
            for (let k of Object.keys(obj[key])) {
                if (this.isDeep && typeof obj[key][k] === 'object') {
                    this.unproxy(obj[key], k);
                }
            }
        }
    }

    private proxify(obj: T, path: string): T {
        if (obj == null) return null;
        let copy = objectHelpers.clone(obj);
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

interface IHandler<T = any> {
    get(target: T, path: string, key: Key);
    set(target: T, path: string, key: Key, value: any);
}
