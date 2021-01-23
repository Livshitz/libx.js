import each from 'lodash/each';
import has from 'lodash/has';
import isObject from 'lodash/isObject';
import isPlainObject from 'lodash/isPlainObject';
import transform from 'lodash/transform';
import isEqual from 'lodash/isEqual';
import isString from 'lodash/isString';
import { Mapping } from '../types/interfaces';

class Dummy {
    constructor() {}
    static ___func = () => {};
}

export class ObjectHelpers {
    private globalProperties: string[] = [
        ...Object.getOwnPropertyNames(Dummy),
        ...Object.getOwnPropertyNames(new Object()),
        ...Object.getOwnPropertyNames(Dummy.prototype),
        ...Object.getOwnPropertyNames((<any>Dummy).__proto__),
    ];
    private readonly ARGUMENT_NAMES = /([^\s,]+)/g;
    public readonly STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
    public class2type = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regexp',
        '[object Object]': 'object',
    };

    public constructor() {}

    /**
     * Deep diff between two object, using lodash
     * @param  {Object} object Object compared
     * @param  {Object} base   Object to compare with
     * @return {Object}        Return a new object who represent the diff
     */
    public diff(object: Object, base: Object, skipEmpty = false) {
        const changes = (object, base, skipEmpty = false) => {
            let ret = transform(object, (result, value, key) => {
                if (!isEqual(value, base[key])) {
                    if (skipEmpty && this.isEmpty(value)) {
                        result = null;
                        return;
                    }
                    result[key] = isObject(value) && isObject(base[key]) ? changes(value, base[key], skipEmpty) : value;
                    if (skipEmpty && this.isEmpty(result[key])) {
                        delete result[key];
                    }
                }
            });

            if (skipEmpty && this.isEmpty(ret)) return null;
            else return ret;
        };
        return changes(object, base, skipEmpty);
    }

    public isObject(object) {
        if (object != null && object.isProxy) return typeof object == 'object' && object.constructor == Object;
        return isPlainObject(object); // && !this.isDate(object);
    }

    public isString(object) {
        return isString(object);
        // return typeof object === 'string';
    }

    public isFunction(obj) {
        var isFunc = this.type(obj) === 'function';
        if (!isFunc) return false;

        var fnStr = obj.toString().replace(this.STRIP_COMMENTS, '');
        if (fnStr.match(/\s*class\s+/) != null) return false;

        return true;
    }

    public isArray(obj) {
        if (Array.isArray) return Array.isArray(obj);
        return this.type(obj) === 'array';
    }
    public isWindow(obj) {
        return obj != null && (obj == obj.window || (typeof global != 'undefined' && obj == global));
    }
    public isNumeric(obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    }
    public type(obj) {
        if (obj == null) return String(obj);
        if (obj.isProxy) return 'object';
        return this.class2type[toString.call(obj)] || 'object';
    }
    public isPlainObject(obj) {
        var hasOwn = Object.prototype.hasOwnProperty;
        if (!obj || this.type(obj) !== 'object' || obj.nodeType) {
            return false;
        }
        try {
            if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        } catch (e) {
            return false;
        }
        var key;
        for (key in obj) {
        }
        return key === undefined || hasOwn.call(obj, key);
    }

    public isDefined(obj, prop) {
        if (typeof obj == 'undefined') return false;

        if (prop != null) {
            return has(obj, prop);
        }

        return true;
    }

    public clone(source, target = {}) {
        return this.merge(true, target, source);
    }

    public merge(...args) {
        var options,
            name,
            src,
            copy,
            copyIsArray,
            clone,
            target = arguments[0],
            i = 1,
            length = arguments.length,
            deep = true,
            toString = Object.prototype.toString,
            hasOwn = Object.prototype.hasOwnProperty,
            push = Array.prototype.push,
            slice = Array.prototype.slice,
            trim = String.prototype.trim,
            indexOf = Array.prototype.indexOf;

        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== 'object' && !objectHelpers.isFunction(target)) {
            target = {};
        }
        if (length === i) {
            target = this;
            --i;
        }
        for (i; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (objectHelpers.isPlainObject(copy) || (copyIsArray = objectHelpers.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && objectHelpers.isArray(src) ? src : [];
                        } else {
                            clone = src && objectHelpers.isPlainObject(src) ? src : {};
                        }
                        // WARNING: RECURSION
                        target[name] = objectHelpers.merge(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    }

    public shallowCopy(obj) {
        return this.merge(false, {}, obj); // Object.assign({}, obj);
    }

    public getDeep(obj, path) {
        let parts = path.split('/');
        let ret = obj;
        do {
            if (parts.length == 0) return ret;
            let curPart = parts.shift();
            if (curPart == '') continue;
            ret = ret[curPart];
        } while (ret != null);
        return ret;
    }

    public isNull(obj) {
        return obj == undefined || obj == null;
    }
    public isEmptyObject(obj) {
        for (var name in obj) {
            return false;
        }
        return true;
    }
    public isEmptyString(obj) {
        return obj == null || obj == '';
    }
    public isEmpty(obj) {
        if (obj == null) return true;
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) return false;
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }

    public isDate(obj) {
        return typeof obj?.getMonth === 'function';
    }

    public makeEmpty(obj) {
        each(Object.keys(obj), (prop) => {
            if (!obj.hasOwnProperty(prop)) return;

            if (Array.isArray(obj[prop])) {
                obj[prop] = [];
            } else if (typeof obj[prop] == 'object') {
                if (obj[prop] == null) {
                    obj[prop] = null;
                    return;
                }
                this.makeEmpty(obj[prop]);
            } else {
                obj[prop] = '';
            }
        });

        return obj;
    }

    public getCustomProperties(obj) {
        var currentPropList = Object.getOwnPropertyNames(obj);

        const findDuplicate = (propName) => this.globalProperties.indexOf(propName) === -1;

        return currentPropList.filter(findDuplicate);
    }

    public spawnHierarchy(path: string, root: any = {}, putValue: any = null, delimiter = '.'): any {
        let p = path.split(delimiter);
        if (root == null) root = {};
        let cur = root;
        let next = null;
        let prev = null;
        for (let i = 0; i < p.length; i++) {
            next = p[i];
            if (typeof cur[next] == 'undefined') cur[next] = {};
            prev = cur;
            cur = cur[next];
        }
        if (putValue != null) prev[next] = putValue;
        return root;
    }

    public objectToKeyValue(obj: object): Mapping<any> {
        const props = this.getCustomProperties(obj);
        let ret: Mapping<any> = {};

        for (let prop of props) {
            const sub = obj[prop];
            if (this.isObject(sub)) {
                // if nested object:
                const subKV = this.objectToKeyValue(sub);
                for (let subK in subKV) {
                    ret[prop + '/' + subK] = subKV[subK];
                }
            } else {
                // if primitive:
                ret[prop] = sub;
            }
        }
        return ret;
    }

    public keyValueToObject(keyValueMap: Mapping<any>, shouldParse = false): object {
        let ret = {};
        for (let path in keyValueMap) {
            let value = keyValueMap[path];
            if (shouldParse && this.isString(value)) {
                try {
                    value = JSON.parse(value);
                } catch {}
            }
            objectHelpers.spawnHierarchy(path, ret, value, '/');
        }
        return ret;
    }
}

export const objectHelpers = new ObjectHelpers();
