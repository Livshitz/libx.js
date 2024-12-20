import { MyLodash } from '../helpers/MyLodash';
import { objectHelpers } from '../helpers/ObjectHelpers';

export class StringExtensions {
    public static capitalize = function (): string {
        const str = this;
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    public static ellipsis = function (maxLength) {
        let ret = this;
        if (ret.length > maxLength) {
            ret = ret.substr(0, maxLength);
            ret += '...';
        }
        return ret;
    };

    public static kebabCase = function () {
        return this.replace(/([a-z])([A-Z])/g, '$1-$2') // get all lowercase letters that are near to uppercase ones
            .replace(/[\s_]+/g, '-') // replace all spaces and low dash
            .toLowerCase(); // convert to lower case
    };

    public static camelize = function () {
        return this.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+|\-/g, '');
    };

    public static padNumber = function (width: number, z = '0') {
        var args = arguments;
        var n = this + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };

    public static contains = function (str) {
        return this.indexOf(str) >= 0;
    };

    public static hashCode = function () {
        var hash = 0;
        if (this.length == 0) return hash.toString();
        for (var i = 0; i < this.length; i++) {
            var char = this.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    };

    public static endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    public static removeLastPart = function (delimiter = '/') {
        let parts = this.split(delimiter);
        parts.pop();
        return parts.join(delimiter);
    };

    // see below for better implementation!
    public static startsWith = function (prefix) {
        return this.indexOf(prefix) == 0;
    };

    public static isEmpty = function (input = null) {
        var v = input ?? this;
        return v ? v.trim().length == 0 : true;
    };

    public static format = function (args: any[]) {
        var args = [];

        var ret = this;

        var obj = arguments[0];
        if (obj !== null && typeof obj === 'object') {
            var isRemoveMissing = arguments[1] ?? false;
            const matches = ret?.matchAll(/\{\{(.*?)\}\}/g);
            const keys = [...matches]?.map((m) => m[1]);
            // const keys = ret.match(/\{\{(.*?)\}\}/g);
            for (const key of keys) {
                let val = objectHelpers.getDeep(obj, key, '.');
                if (val == null) {
                    if (!isRemoveMissing) continue;
                    val = '';
                }
                ret = ret.replace('{{' + key + '}}', val);
            }
        } else {
            for (var _i = 0; _i < arguments.length - 0; _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (args.length > 0 && Array.isArray(args[0])) args = args[0];

            ret = this.replace(/{{(\d+)}}/g, function (match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        }

        return ret;
    };

    public static replaceAt = function (index, replacement) {
        return this.substr(0, index) + replacement + this.substr(index + replacement.length);
    };

    public static replaceAll = function (find: string, replace: string) {
        if (find == null) return null;
        const findReg = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return this.replace(new RegExp(findReg, 'g'), replace);
    }

    public static getAbbreviation = function () {
        if (this == null || this === '') return null;
        return this.match(/\b([A-Z])/g)?.join('') ?? this[0].toUpperCase();
    };

    public static isDateString = function (checkShortFormat = true) {
        const isISO8601 = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/.test(
            this
        );
        if (isISO8601) return true;
        if (checkShortFormat) {
            const isShortFormat = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(\d{2,4})$/.test(this);
            if (isShortFormat) return true;
        }

        return false;
    };
}
