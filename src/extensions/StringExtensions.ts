import capitalize from 'lodash/capitalize';
import { objectHelpers } from '../helpers/ObjectHelpers';

export class StringExtensions {
    public static capitalize = function () {
        return this.replace(/(\w+)/g, capitalize).trim();
        // return this.charAt(0).toUpperCase() + this.slice(1);
    };

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

    public static padNumber = function (width, z) {
        var args = arguments;
        z = z || '0';
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

    // see below for better implementation!
    public static startsWith = function (prefix) {
        return this.indexOf(prefix) == 0;
    };

    public static isEmpty = function (input = null) {
        var v = input || this;
        return v ? v.trim().length == 0 : true;
    };

    public static format = function () {
        var args = [];

        var ret = this;

        var obj = arguments[0];
        if (obj !== null && typeof obj === 'object') {
            var arr = objectHelpers.getCustomProperties(obj);
            for (var i = 0; i < arr.length; i++) {
                var x = arr[i];
                ret = ret.replace('{{' + x + '}}', obj[x]);
                // ret = ret.replace(new RegExp('\{' + x + '\}', 'g'), obj[x])
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
}
