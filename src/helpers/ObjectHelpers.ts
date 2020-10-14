import { each, has, isString, isObject, transform, isEqual } from 'lodash';

class Dummy {}

export class ObjectHelpers {
    private static globalProperties: string[] = [...Object.getOwnPropertyNames(Dummy), ...Object.getOwnPropertyNames(new Object())];
    public static readonly STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
    private static readonly ARGUMENT_NAMES = /([^\s,]+)/g;

    public static class2type = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regexp',
        '[object Object]': 'object',
    };

    /**
     * Deep diff between two object, using lodash
     * @param  {Object} object Object compared
     * @param  {Object} base   Object to compare with
     * @return {Object}        Return a new object who represent the diff
     */
    public static diff(object: Object, base: Object, skipEmpty = false) {
        function changes(object, base, skipEmpty = false) {
            let ret = transform(object, function (result, value, key) {
                if (!isEqual(value, base[key])) {
                    if (skipEmpty && ObjectHelpers.isEmpty(value)) {
                        result = null;
                        return;
                    }
                    result[key] = isObject(value) && isObject(base[key]) ? changes(value, base[key], skipEmpty) : value;
                    if (skipEmpty && ObjectHelpers.isEmpty(result[key])) {
                        delete result[key];
                    }
                }
            });

            if (skipEmpty && ObjectHelpers.isEmpty(ret)) return null;
            else return ret;
        }
        return changes(object, base, skipEmpty);
    }

    public static isObject(object) {
        return isObject(object);
    }

    public static isString(object) {
        return isString(object);
    }

    public static isFunction(obj) {
        var isFunc = ObjectHelpers.type(obj) === 'function';
        if (!isFunc) return false;

        var fnStr = obj.toString().replace(ObjectHelpers.STRIP_COMMENTS, '');
        if (fnStr.match(/\s*class\s+/) != null) return false;

        return true;
    }

    public static isArray =
        Array.isArray ||
        function (obj) {
            return ObjectHelpers.type(obj) === 'array';
        };
    public static isWindow(obj) {
        return obj != null && (obj == obj.window || (typeof global != 'undefined' && obj == global));
    }
    public static isNumeric(obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    }
    public static type(obj) {
        return obj == null ? String(obj) : ObjectHelpers.class2type[toString.call(obj)] || 'object';
    }
    public static isPlainObject(obj) {
        var hasOwn = Object.prototype.hasOwnProperty;
        if (!obj || ObjectHelpers.type(obj) !== 'object' || obj.nodeType) {
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

    public static isDefined(obj, prop) {
        if (typeof obj == 'undefined') return false;

        if (prop != null) {
            return has(obj, prop);
        }

        return true;
    }

    public static clone(source, target = {}) {
        return ObjectHelpers.merge(true, target, source);
    }

    public static merge(...args) {
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
        if (typeof target !== 'object' && !ObjectHelpers.isFunction(target)) {
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
                    if (deep && copy && (ObjectHelpers.isPlainObject(copy) || (copyIsArray = ObjectHelpers.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && ObjectHelpers.isArray(src) ? src : [];
                        } else {
                            clone = src && ObjectHelpers.isPlainObject(src) ? src : {};
                        }
                        // WARNING: RECURSION
                        target[name] = ObjectHelpers.merge(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    }

    public static shallowCopy(obj) {
        return ObjectHelpers.merge(false, {}, obj); // Object.assign({}, obj);
    }

    public static getDeep(obj, path) {
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

    public static isNull(obj) {
        return obj == undefined || obj == null;
    }
    public static isEmptyObject(obj) {
        for (var name in obj) {
            return false;
        }
        return true;
    }
    public static isEmptyString(obj) {
        return obj == null || obj == '';
    }
    public static isEmpty(obj) {
        if (obj == null) return true;
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) return false;
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }

    public static makeEmpty(obj) {
        each(Object.keys(obj), (prop) => {
            if (!obj.hasOwnProperty(prop)) return;

            if (Array.isArray(obj[prop])) {
                obj[prop] = [];
            } else if (typeof obj[prop] == 'object') {
                if (obj[prop] == null) {
                    obj[prop] = null;
                    return;
                }
                ObjectHelpers.makeEmpty(obj[prop]);
            } else {
                obj[prop] = '';
            }
        });

        return obj;
    }

    public static getCustomProperties(obj) {
        var currentPropList = Object.getOwnPropertyNames(obj);

        const findDuplicate = (propName) => ObjectHelpers.globalProperties.indexOf(propName) === -1;

        return currentPropList.filter(findDuplicate);
    }
}
