import * as concurrency from 'concurrency.libx.js';
import { Deferred } from 'concurrency.libx.js';
import mixin from 'lodash/mixin';
import forEach from 'lodash/forEach';
import transform from 'lodash/transform';
import reduce from 'lodash/reduce';
import map from 'lodash/map';
import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';
import each from 'lodash/each';
import toPairs from 'lodash/toPairs';
import repeat from 'lodash/repeat';
import join from 'lodash/join';
import has from 'lodash/has';
import { extensions } from '../extensions/index';
import { ILog, log } from '../modules/log';
import {
    DynamicProperties,
    DynamicProps,
    IAny,
    IBrowser,
    ICallbacks,
    IDeferred,
    IDeferredJS,
    IExtensions,
    ILodash,
    IModuleNode,
    IPromise,
    Mapping,
} from '../types/interfaces';
import { ObjectHelpers, objectHelpers } from './ObjectHelpers';
import { StringExtensions } from '../extensions/StringExtensions';
import { DateExtensions } from '../extensions/DateExtensions';

export { Deferred };

// import XRegExp from "XRegExp";
// this.fp.map = require("lodash/fp/map");
// this.fp.flatten = require("lodash/fp/flatten");
// this.fp.sortBy = require("lodash/fp/sortBy");
// this.fp.flow = require("lodash/fp/flow");

const __ = {
    forEach,
    mixin,
    transform,
    reduce,
    map,
    mapKeys,
    mapValues,
    each,
    toPairs,
    repeat,
    join,
    has,
};

export interface _ILodash {
    VERSION?: string;
    forEach: typeof forEach;
    mixin: typeof mixin;
    transform: typeof transform;
    reduce: typeof reduce;
    map: typeof map;
    mapKeys: typeof mapKeys;
    mapValues: typeof mapValues;
    each: typeof each;
    toPairs: typeof toPairs;
    repeat: typeof repeat;
    join: typeof join;
    has: typeof has;
    [key: string]: any;
}
export class Helpers {
    public _: _ILodash = __;

    public concurrency: typeof concurrency;
    public Deferred: typeof concurrency.Deferred;
    public throttle: (func: Function, wait: any, immediate?: boolean) => (...args) => void;
    public debounce: (func: Function, wait: any, immediate?: boolean, allowTaillingCall?: boolean) => (...args) => void;
    public delay: (milliseconds: any) => Promise<any>;
    public async: <T>(func: Function) => (...args: any[]) => Promise<T>;
    public isAsync: (func: any) => boolean;
    public makeAsync: any;
    public forceAsync: <T>(func: Function) => (...args: any[]) => Promise<T>;
    public waitUntil: (conditionFn: any, callback?: any, interval?: number, timeout?: number) => Promise<any>;
    public measurements: typeof concurrency.measurements;
    public measure: typeof concurrency.measurements.measure;
    public startMeasure: typeof concurrency.measurements.startMeasure;
    public peekMeasure: typeof concurrency.measurements.peekMeasure;
    public getMeasureAndReset: typeof concurrency.measurements.getMeasureAndReset;
    public chainTasks: (tasks: any, eachCb?: any) => Promise<void>;
    public sleep: (millis: any) => Promise<unknown>;
    public ObjectHelpers = objectHelpers;

    public isBrowser: boolean;
    public extensions = extensions;

    // public XRegExp = XRegExp;

    public constructor() {
        this.initConcurrency();
        this.initCustomLodashMixins();

        this.isBrowser = typeof window !== 'undefined';
    }

    public bufferToArrayBuffer(buf: Buffer) {
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    }

    public arrayBufferToBuffer(ab: ArrayBuffer) {
        var buf = Buffer.alloc(ab.byteLength);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }

    public newPromise<T = any, Treason = any>(): Deferred<T, Treason> {
        var promise = new Deferred<T, Treason>();
        return promise;
    }

    public parseJsonFileStripComments<T = any>(content: String): T {
        const matchHashComment = new RegExp(/(?:^|\s)\/\/(.+?)$/, 'gm');

        // replaces all hash comments & trim the resulting string
        const json = content.replace(matchHashComment, '').trim();
        const ret = JSON.parse(json);

        return ret;
    }

    public parseConfig(contents: string, env: string): Object {
        try {
            var obj = this.parseJsonFileStripComments(contents);

            obj.private = objectHelpers.merge(obj.private, obj.envs[env].private);
            delete obj.envs[env].private;
            obj = objectHelpers.merge(obj, obj.envs[env]);
            delete obj.envs;

            var obj2 = JSON.stringify(obj);
            obj2 = StringExtensions.format.call(obj2, objectHelpers.merge(obj, obj.private));
            obj = JSON.parse(obj2);

            return obj;
        } catch (ex) {
            log.error('parseConfig error: ', ex);
        }
    }

    public formatify(objectWithFormat: {}, ...args): {} {
        var str = JSON.stringify(objectWithFormat);
        const trailingArg = args?.length > 1 ? args[args.length - 1] : null;
        str = StringExtensions.format.call(str, objectHelpers.merge(objectWithFormat, ...args), trailingArg);
        return JSON.parse(str);
    }

    public hexc(colorval) {
        try {
            var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            delete parts[0];
            for (var i = 1; i <= 3; ++i) {
                parts[i] = parseInt(parts[i]).toString(16);
                if (parts[i].length == 1) parts[i] = '0' + parts[i];
            }
            return '#' + parts.join('');
        } catch (e) {
            return undefined;
        }
    }

    public parse(str) {
        return JSON.parse(str);
    }

    public jsonify(obj, isCompact = false) {
        // return JSON.stringify(obj, null, "\t");

        if (!isCompact) return JSON.stringify(obj, null, 2);
        if (isCompact) return JSON.stringify(obj);

        return JSON.stringify(
            obj,
            function (k, v) {
                if (v instanceof Array) return JSON.stringify(v);
                return v;
            },
            4
        );
    }

    public newGuid(useDash = false) {
        var dash = useDash ? '-' : '';
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + dash + s4() + dash + s4() + dash + s4() + dash + s4() + s4() + s4();
    }

    public stringifyOnce(obj, replacer = null, indent = null) {
        var printedObjects = [];
        var printedObjectKeys = [];

        function printOnceReplacer(key, value) {
            if (printedObjects.length > 2000) {
                // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
                return 'object too long';
            }
            var printedObjIndex: any = false;
            printedObjects.forEach(function (obj, index) {
                if (obj === value) {
                    printedObjIndex = index;
                }
            });

            if (key == '') {
                //root element
                printedObjects.push(obj);
                printedObjectKeys.push('root');
                return value;
            } else if (printedObjIndex + '' != 'false' && typeof value == 'object') {
                if (printedObjectKeys[printedObjIndex] == 'root') {
                    return '(pointer to root)';
                } else {
                    return (
                        '(see ' +
                        (!!value && !!value.constructor ? value.constructor.name.toLowerCase() : typeof value) +
                        ' with key ' +
                        printedObjectKeys[printedObjIndex] +
                        ')'
                    );
                }
            } else {
                var qualifiedKey = key || '(empty key)';
                printedObjects.push(value);
                printedObjectKeys.push(qualifiedKey);
                if (replacer) {
                    return replacer(key, value);
                } else {
                    return value;
                }
            }
        }
        return JSON.stringify(obj, printOnceReplacer, indent);
    }

    public getMatch(string, regex, index?) {
        index || (index = 1); // default to the first capturing group
        var matches = [];

        var rxp = RegExp(regex, 'g'); // make sure it's set to global, otherwise will cause infinite loop
        let match;
        while ((match = rxp.exec(string))) {
            matches.push(match[index]);
            if (rxp.lastIndex == 0) break;
        }

        return matches;
    }

    public getMatches(string, regex, grab = null) {
        // var ret = [...string.matchAll(regex)];

        var matches = [];

        var rxp = RegExp(regex, 'g'); // make sure it's set to global, otherwise will cause infinite loop
        let match;
        while ((match = rxp.exec(string))) {
            let res = [];
            matches.push(match);
            if (rxp.lastIndex == 0) break;
        }

        if (grab == null) return matches;

        if (typeof grab == 'number') return this._.map(matches, (item) => item[grab]);
        if (typeof grab == 'string') return this._.map(matches, (item) => item.groups[grab]);
        if (typeof grab == 'boolean') return this._.map(matches, (item) => item.groups);

        return matches;
    }

    public base64ToUint8Array(base64String) {
        var padding = this._.repeat('=', (4 - (base64String.length % 4)) % 4);
        var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

        // var rawData = window.atob(base64);
        var rawData = Buffer.from(base64, 'base64').toString('binary');
        var outputArray = new Uint8Array(rawData.length);

        for (var i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    public getParamNames(func) {
        var fnStr = func.toString().replace(objectHelpers.STRIP_COMMENTS, '');
        if (fnStr.match(/^\s*class\s+/) != null) return null;
        var m = fnStr.match(/^\(?(?:async\s?)?(?:function\s?)?\(?([\w\d\,\s\$\_]+)\)?/);
        if (m == null || m.length < 1) return null;
        var params = m[1].replace(/\s/g, '');
        var result = params.split(',');
        // var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if (result === null) result = [];
        return result;
    }

    public randomNumber(max?, min?) {
        if (max == null) max = 100;
        if (min == null) min = 0;
        return Math.floor(Math.random() * (max - min + 1)) + min;
        //return Math.floor(Math.random(0,max)*100);
    }

    public shuffle(a) {
        var ret = objectHelpers.clone(a, []);
        var j, x, i;
        for (i = ret.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = ret[i - 1];
            ret[i - 1] = ret[j];
            ret[j] = x;
        }
        return ret;
    }

    public async fileStreamToBuffer(readStream) {
        let p = this.newPromise();
        let chunks = [];

        if (!readStream.readable) p.reject('fileStreamToBuffer: ex: stream no readable!');

        // Handle any errors while reading
        readStream.on('error', (err) => {
            // File could not be read
            p.reject(err);
        });

        // Listen for data
        readStream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        // File is done being read
        readStream.on('close', () => {
            // Create a buffer of the image from the stream
            p.resolve(Buffer.concat(chunks));
        });

        return p;
    }

    public getObjectByPath(path: string, obj = null) {
        // ref: https://stackoverflow.com/a/6491621
        if (obj == null) obj = window || global;
        path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        path = path.replace(/^\./, ''); // strip a leading dot
        var a = path.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in obj) {
                obj = obj[k];
            } else {
                return;
            }
        }
        return obj;
    }

    public keys = (obj) => {
        if (obj == null) return [];
        return Object.keys(obj);
    };

    public values = (obj) => {
        if (obj == null) return [];
        return Object.values(obj);
    };

    public enumToArray = (_enum) => {
        return Object.keys(_enum)
            .map((key) => _enum[key])
            .filter((value) => typeof value === 'string');
    };

    public getEnumKeyFromValue<T>(_enum: T, value: number): keyof T {
        return Object.keys(_enum).find((key) => _enum[key] === value) as keyof T;
    }

    public querialize(obj: Object, avoidPrefix: Boolean): string {
        if (obj == null || (<any>obj).length < 1) return null;
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            }
        return (!avoidPrefix ? '?' : '') + str.join('&');
    }

    public toUnicode(input: string): string {
        var unicodeString = '';
        for (var i = 0; i < input.length; i++) {
            var theUnicode = input.charCodeAt(i).toString(16).toUpperCase();
            while (theUnicode.length < 4) {
                theUnicode = '0' + theUnicode;
            }
            theUnicode = '\\u' + theUnicode;
            unicodeString += theUnicode;
        }
        return unicodeString;
    }

    public parseUrl(url: string): parseUrlReturn {
        const match = this.getMatches(
            url,
            /((?<protocol>\w+):\/\/(?<domainName>[\w\d]+)\.(?<domainExt>[\w\d]+))?\/(?<path>[^\?]+)\/?([\?\&](?<queryParams>.*))?/g,
            true
        )?.[0];

        if (match == null) return null;

        if (match.path?.endsWith('/')) match.path = match.path.slice(0, -1);

        const params = match.queryParams?.split('&').reduce((agg, x) => {
            const parts = x.split('=');
            agg[parts[0]] = parts[1] || true;
            return agg;
        }, {});

        return {
            ...match,
            segments: match.path?.split('/'),
            params,
        };
        // libx.getMatches(
        //     'http://domain.com/my-service/resource/id112233?queryParam1=1&queryParam2=aa',
        //     /(?<protocol>\w+):\/\/(?<domain>[\w\d]+\.[\w\d]+)\/(?<path>.+)\/?[\?\&](?<queryParams>.*)|[\?\&](?<queryParams>.*)/g, true);
        // this.getMatche('')
    }

    public stringToColour(str: string) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xff;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    }

    public for(iteration: (i) => void, max: number, min = 0, step = 1) {
        // for((i)=> console.log(i), 10, 5, 2)
        const ret = [];
        for (let i = min; i < max; i += step) {
            ret.push(iteration(i));
        }
        return ret;
    }

    public each<T>(arr: T[], iteration: (T, i?: number) => T) {
        // each(myArr, (x, i)=> console.log(x))
        let count = 0;
        for (let item of arr) {
            iteration(item, count);
            count++;
        }
        return arr;
    }

    public csvToJson(csvStr: string, cellDelimiter = ',', lineDelimiter = '\n') {
        const lines = csvStr.split(lineDelimiter);
        const result = [];

        var headers = lines[0].split(cellDelimiter).map((x) => x.replace(/^\s*\"?\s*(.*?)\s*\"?$/g, '$1'));

        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            // 'a,"b,x",c'.split(/\s*,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/)
            var currentline = lines[i].match(new RegExp(`(".*?"|[^"${cellDelimiter}]+)(?=\\s*${cellDelimiter}|\s*$)`, 'g'));

            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j].replace(/^\s*\"?\s*(.*?)\s*\"?$/g, '$1');
            }

            result.push(obj);
        }

        return result;
    }

    public median(values: number[]): number {
        const copy = [...values];
        if (copy.length === 0) throw new Error('No inputs');

        copy.sort(function (a, b) {
            return a - b;
        });

        var half = Math.floor(copy.length / 2);

        if (copy.length % 2) return copy[half];

        return (copy[half - 1] + copy[half]) / 2.0;
    }

    public average(values: number[]): number {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length || 0;
        return avg;
    }

    public std(values: number[]): number {
        const mean = values.reduce((s, n) => s + n) / values.length;
        const variance = values.reduce((s, n) => s + (n - mean) ** 2, 0) / (values.length - 1);
        return Math.sqrt(variance);
    }

    public humanizeTime(ms: number) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / 1000 / 60) % 60);
        // const hours = Math.floor((ms  / 1000 / 3600 ) % 24)
        const hours = parseInt(<any>(ms / (1000 * 60 * 60)));

        const humanized = [
            DateExtensions.pad(hours.toString(), 2),
            DateExtensions.pad(minutes.toString(), 2),
            DateExtensions.pad(seconds.toString(), 2),
        ].join(':');

        return humanized;
    }

    public bumpVersion(version: string, bumpType: SemverPart | 'replace' = SemverPart.Patch, replace?: string | number): string {
        if (bumpType == 'replace') {
            return replace.toString();
        }
        const parts = this.parseSemVer(version);
        parts[bumpType] = replace ?? parseInt(parts[bumpType]) + 1;

        let found = false;
        forEach(Object.values(SemverPart), (key) => {
            if (key != bumpType && !found) return;
            if (key == bumpType) {
                found = true;
                return;
            }
            parts[key] = 0;
        });

        return Object.values(parts).join('.');
    }

    public parseSemVer(version: string) {
        return this.getMatches(version, /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/, true)?.[0];
    }

    public dictToArray(dict: {}) {
        var pairs = helpers._.toPairs(dict);
        var ret = [];
        helpers._.each(<any>pairs, (pair) => {
            const key = pair[0];
            let val = pair[1];
            if (objectHelpers.isObject(val)) {
                if (val.id == null) val.id = key;
                else val._id = key;
            } else {
                val = { id: key, val };
            }

            ret.push(val);
        });

        return ret;
    }

    public arrayToDic(arr: []) {
        return this._.transform(arr, (agg, key: string) => (agg[key] = true), {});
    }

    private initConcurrency() {
        this.concurrency = concurrency;
        this.Deferred = concurrency.Deferred;
        this.throttle = concurrency.throttle;
        this.debounce = concurrency.debounce;
        this.delay = concurrency.delay;
        this.async = concurrency.async;
        this.isAsync = concurrency.isAsync;
        this.forceAsync = concurrency.async;
        this.waitUntil = concurrency.waitUntil;
        this.measurements = concurrency.measurements;
        this.measure = this.measurements.measure;
        this.startMeasure = this.measurements.startMeasure;
        this.peekMeasure = this.measurements.peekMeasure;
        this.getMeasureAndReset = this.measurements.getMeasureAndReset;
        this.chainTasks = concurrency.chain.chainTasks;
        this.sleep = concurrency.sleep;
    }

    private initCustomLodashMixins() {
        this._.mixin({
            sortKeysBy: function (obj, comparator) {
                var keys = this._.sortBy(this._.keys(obj), function (key) {
                    return comparator ? comparator(obj[key], key) : key;
                });

                return this._.zipObject(
                    keys,
                    this._.map(keys, function (key) {
                        return obj[key];
                    })
                );
            },
        });
    }
}

export const helpers = new Helpers();

type parseUrlReturn = {
    domainExt: string;
    domainName: string;
    protocol: string;
    path: string;
    queryParams: string;
    segments: string[];
    params: Mapping<string>;
};

export enum SemverPart {
    Major = 'major',
    Minor = 'minor',
    Patch = 'patch',
}

/*
export interface IHelper {
    _: ILodash;
    $: IAny;
    newPromise(): IDeferred<any>;
    log: ILog;
    browser: IBrowser;
    Callbacks: ICallbacks;
    async(callback: Function): Promise<any>;
    base64ToUint8Array(base64String: string): Uint8Array;
    Buffer: Buffer;
    chainTasks(tasks: (() => Promise<any>)[]): Promise<any>;
    class2type: { [key: string]: string };
    clone(source: any, target?: any): any;
    debounce(func: Function, wait: number, immediate?: boolean, allowTaillingCall?: boolean): Function;
    deferred: IDeferredJS; //(func :Function): Promise<any>;
    delay(milliseconds: number): Promise<any>;
    diff(object: Object, base: Object, skipEmpty?: boolean): Object;
    extend(deep: boolean, targe: Object, ...sources: Object[]): any;
    extend(targe: Object, ...sources: Object[]): any;
    extensions: IExtensions;
    getCustomProperties(obj: Object): [string];
    getMatch(string: string, regex: RegExp, index?: number): [string];
    getMatches(string: string, regex: RegExp): [any];
    getMatches(string: string, regex: RegExp, grab: number): string;
    getMatches(string: string, regex: RegExp, grab: string): string;
    getMatches(string: string, regex: RegExp, grab: true): any;
    // getMatches(string: string, regex: RegExp, grab: string): [string];
    // getMatches(string: string, regex: RegExp, grab: number): [string];
    // getMatches(string: string, regex: RegExp, grab: boolean): [any];
    getParamNames(func: Function): [string];
    getProjectConfig(containingFolder: string, secret: string): JSON;
    hexc(colorval: string): string;
    isArray(obj: any): Boolean;
    isAsync(obj: Function): Boolean;
    isBrowser: Boolean;
    isDefined(obj: any, prop: string): Boolean;
    isEmpty(obj: any): Boolean;
    isEmptyObject(obj: any): Boolean;
    isEmptyString(obj: string): Boolean;
    isFunction(obj: any): Boolean;
    isNull(obj: any): Boolean;
    isNumeric(obj: any): Boolean;
    isObject(obj: any): Boolean;
    isPlainObject(obj: any): Boolean;
    isWindow(obj: any): Boolean;
    jsonRecurse(obj, byid?, refs?, prop?, parent?): any;
    jsonResolveReferences(json): any;
    jsonify(obj: any, isCompact?: Boolean): string;
    parse(str: string): any;
    makeEmpty(obj: Object): Object;
    makeAsync(func: Function): () => Promise<any>;
    modules(): [];
    newGuid(useDash?: Boolean): string;
    parseConfig(contents: string, env: string): Object;
    parseJsonFileStripComments(content): Object;
    randomNumber(max?: number, min?: number): number;
    shallowCopy(obj: Object): Object;
    shuffle(a: Array<any>): Array<any>;
    sleep(time: number, callback?: Function): Promise<void>;
    spawnHierarchy(path: string): any;
    getObjectHash(obj: object): string;
    stringifyOnce(obj: Object, replacer?: (key: string, value: any) => any, indent?: number): string;
    throttle(func: Function, wait: number, immediate?: Boolean): Function;
    type(obj: any): string;
    waitUntil<T>(conditionFn: Function, callback?: () => T, interval?: number, timeout?: number): Promise<T>;
    measure(measureName?: string): number;
    getMeasure(measureName?: string): number;
    getMeasureAndReset(measureName?: string): number;
    node: IModuleNode;
    fileStreamToBuffer(readStream): Promise<Buffer>;
    enumToArray(_enum: any): string[];
    getDeep(obj: any, path: string, delimiter?: string): any;
    dictToArray(dict: any);
    arrayToDic(arr: any);
    getObjectByPath(s: string, obj?: any);
    keys(obj: any): string[];
    values(obj: any): string[];
}
*/

/*
this._projectConfig = null;
this.getProjectConfig = (containingFolder, secret)=>{
	var ret = null;
	try {
		if (this._projectConfig == null) {
			if (global.libx == null) global.libx = {};
			if (global.libx._projconfig != null) {
				return ret = this._projectConfig = global.libx._projconfig;
			}
			
			if (global.projconfig != null) return ret = global.projconfig;
			if (global.libx._projconfig == null) throw "libx:helpers:getProjectConfig: Detected browser, but `window.libx._projconfig` was not provided";
		
		}
		if (this._projectConfig == null) throw "libx:helpers:getProjectConfig: Could not find/load project.json in '{0}'".format(containingFolder);
		return ret = this._projectConfig;
	} finally {
		if (ret != null && ret.private == null) ret.private = {};
		return ret;
	}
}
*/
