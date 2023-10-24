import { helpers } from '../helpers';
import { Exception } from '../helpers/Exceptions';
import { objectHelpers } from '../helpers/ObjectHelpers';
import { Key } from '../types/interfaces';
import { log } from './log';

export default class DeepProxy<T extends object = any> {
    public target: T;
    public input: T;
    public proxy: T = null;
    public _skip = false;
    private preproxy = new WeakMap();
    private delimiter = '/';

    public constructor(target: T = <T>null, private handler: IHandler, private isDeep = true) {
        this.input = target;
        this.proxy = this.proxify(target, '', true);
        if ((<any>this.input)?.isProxy) throw new Exception('DeepProxy:ctor: input cannot be proxy!');
        this.target = target;
    }

    public static create<T extends object = any>(target: T = <T>null, handler: IHandler, isDeep = true) {
        const newProxy = new DeepProxy<T>(target, handler, isDeep);
        return <T>newProxy.proxy;
    }

    public set(target: object, path: string, key: Key, value: T, receiver: any) {
        log.debug('DeepProxy:set', path, key, value);
        if (this.handler?.set) {
            this.handler.set(target, path, key, value);
        }

        if (this.isDeep && !(<any>value)?.isProxy) {
            // && objectHelpers.isObject(value)) {
            value = this.proxify(value, path + this.delimiter + <string>key, true);
        }

        target[key] = value;

        if (value == null && Reflect.has(target, key)) {
            log.debug('set: has existing value');
            this.unproxy(target, path + this.delimiter + <string>key);
            // this.handler.deleteProperty(target, path, key) ;
        }

        return true;
    }

    public async skip(cb: Function, condition?: boolean) {
        if (cb == null || typeof cb != 'function') return;
        if (this._skip) return;
        if (condition == null) condition = true;
        if (condition) this._skip = true;
        await cb();
        if (condition) this._skip = false;
    }

    private wrapHandler(path) {
        const wrapper = {
            get: (target: object, key: Key) => {
                if (key == 'isProxy') return true;
                if (key == 'toString') return () => helpers.stringifyOnce(target, null, 2);
                if (key == 'toJSON') return () => helpers.stringifyOnce(target, null, 2);
                // if (target[key] == null) return null;

                let ret = null;
                if (this.handler?.get) {
                    ret = this.handler.get(target, path, key);
                }

                if (ret == null) ret = target[<string>key] || objectHelpers.getDeep(this.input, path)?.[key];
                return ret;
            },

            set: (target: object, key: Key, value: T, receiver: any) => {
                // set the input with value before proxifying it
                this.skip(() => {
                    objectHelpers.getDeep(this.input, path)[key] = value;
                });

                if (this.handler?.preSet) {
                    const preSetRet = this.handler.preSet(target, path, key, value);
                    if (preSetRet == false) return null;
                }

                return this.set(target, path, key, value, receiver);
            },

            deleteProperty: (target: object, key: string) => {
                log.debug('deleteProperty: ', key);
                if (Reflect.has(target, key)) {
                    let deleted = null;
                    this.unproxy(target, key);

                    delete objectHelpers.getDeep(this.input, path)[key];

                    deleted = Reflect.deleteProperty(target, key);
                    if (deleted && this.handler?.preSet) {
                        this.handler.preSet(target, path, key, null);
                    }
                    if (deleted && this.handler?.set) {
                        this.handler.set(target, path, key, null);
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
        if (this.isDeep && (objectHelpers.isObject(obj) || objectHelpers.isArray(obj))) {
            for (let key of Object.keys(copy)) {
                const prop = copy[key];
                if (typeof prop === 'object' && !prop?.isProxy) {
                    copy[key] = this.proxify(prop, path + this.delimiter + key);
                }
            }
        } else {
            return obj;
            // copy = () => obj;
        }

        let p = new Proxy(copy, this.wrapHandler(path));
        this.preproxy.set(p, copy);
        return <T>p;
    }
}

export interface IHandler<T = any> {
    get?(target: T, path: string, key: Key): Promise<T> | T | void;
    set?(target: T, path: string, key: Key, value: any): Promise<T> | T | void;
    preSet?(target: T, path: string, key: Key, value: any): Promise<boolean> | boolean | void;
}
