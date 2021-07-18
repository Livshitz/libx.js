import http from 'http';
import https from 'https';
import urlapi from 'url';
import axios from 'axios';
import FormData from 'form-data';
import { helpers } from '../helpers';
import { di } from './dependencyInjector';
import { Buffer } from 'buffer';
import { log } from './log';
import { objectHelpers } from '../helpers/ObjectHelpers';

// var querialize = require('../browser/helpers').querialize;

export class Network {
    private url = urlapi;
    private helper = new Helper();

    constructor() {}

    public httpGetJson = async (url: string, _options = {}) => {
        _options = objectHelpers.merge({}, _options, { headers: { 'Content-Type': 'application/json; charset=UTF-8' }, enc: 'utf-8' });
        let ret = await this.httpGet(url, _options);
        return JSON.parse(ret);
    };

    public httpGetString = async (url: string, _options = {}) => {
        _options = objectHelpers.merge({}, _options, { enc: 'utf-8' });
        let ret = await this.httpGet(url, _options);
        return ret.toString(); //Buffer.concat(ret).toString(_options.enc);
    };

    public httpGet = async (url: string, _options = {}) => {
        let ret = await this.httpRequest(url, null, 'GET', _options);
        return ret;
    };

    public httpPost = async (url: string, data, _options = {}) => {
        return await this.httpRequest(url, data, 'POST', _options);
    };

    public httpPostJson = async (url: string, data, _options = {}) => {
        let ret = await this.httpRequest(url, data, 'POST', _options);
        if (ret == null) return null;
        return JSON.parse(ret.toString());
    };

    public httpRequest = async (url: string, data: any, method: string, _options = {}) => {
        var defer = helpers.newPromise();

        url = this.helper.fixUrl(url);

        var dest = this.helper.parseUrl(url);
        var options = {
            headers: {
                Accept: '*/*',
                // 'Origin': origin,
                // 'Referer': origin,
                // 'User-Agent': 'Mozilla/5.0'
                // 'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36",
                //'Content-Type':'application/x-www-form-urlencoded'
                // 'client': process.env.MOVIEGLU_CLIENT,
                /*
				'x-api-key': process.env.MOVIEGLUE_API_KEY,
				'api-version': process.env.MOVIEGLU_API_VERSION,
				'Authorization': process.env.MOVIEGLUE_AUTHORISATION,
				'geolocation': user.loc[0] + ';' + user.loc[1],
				*/
                // 'Content-Type': 'application/json; charset=UTF-8',
                // 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                // 'Content-Length': Buffer.byteLength(data)
            },
            // host: dest.hostname,
            // path: dest.path,
            // port: dest.port,
            enc: null,
            method: method || 'GET',
            withCredentials: false,
            dataType: 'json',
            autoParse: false,
            formData: null,
        };
        objectHelpers.clone(_options, options);
        objectHelpers.clone(dest, options);

        // Fill in missing content type based on dataType:
        if (options.dataType != null && options.headers['content-type'] == null) {
            if (options.dataType == 'json') options.headers['content-type'] = 'application/json; charset=UTF-8';
            else if (options.dataType == 'formData') options.headers['content-type'] = 'multipart/form-data'; //'application/x-www-form-urlencoded; charset=UTF-8';
        }

        var operation: typeof http | typeof https = http;
        if (dest.protocol == 'https:') operation = https;

        if (options.dataType == 'formData') {
            // dataObj = this.helpers.params(data);; //JSON.stringify(data);
            options.formData = data;
        }

        var request = operation.request(options, (res) => {
            if (options.enc) res.setEncoding(options.enc);

            var data = [];
            res.on('data', function (chunk) {
                data.push(Buffer.from(chunk));
            });
            res.on('end', function () {
                let buffer = null;
                if (data != null) {
                    if (data.length == 1) buffer = data[0];
                    else buffer = Buffer.concat(data); //  data;
                }
                if (res.statusCode == 200) return defer.resolve(buffer);
                else defer.reject({ statusCode: res.statusCode, response: buffer.toString() });
            });
        });

        // post the data
        if (data != null) {
            var dataObj = data;
            if (options.dataType == 'json') {
                dataObj = JSON.stringify(data);
                request.write(dataObj);
            }
            //if (options.headers['Content-Type'] != null && options.headers['Content-Type'].startsWith("application/x-www-form-urlencoded")) dataObj = this.helpers.getFormData(data);
        }

        request.on('error', function (e) {
            log.error(e.message);
            defer.reject(e);
        });
        request.end();

        return defer;
    };

    public request = async (method, url: string, params: any = null, data: any = null, options: any = {}) => {
        let p = helpers.newPromise();
        let _options = {
            method: method,
            mode: 'no-cors',
        };
        url = this.helper.fixUrl(url);
        options = objectHelpers.merge(options, _options, { url: url });
        options.data = data;
        if (options.responseType == null) options.responseType = 'arraybuffer';
        axios(options)
            .then((response) => {
                p.resolve(response.data);
            })
            .catch((err) => {
                return p.reject(err);
            });
        return p;
    };

    public get = async (url: string, params: any = null, options = {}) => {
        if (params != null) {
            let includePrefix = url.contains('?') ? false : true;
            let queryString = this.helper.toQueryString(params, !includePrefix);
            url += includePrefix ? queryString : '&' + queryString;
        }

        options = objectHelpers.merge(options, { url: url });
        return await this.request('GET', url, params, null, options);
    };

    public post = async (url: string, data = null, options = {}) => {
        let p = helpers.newPromise();

        // wrap data with 'body' in case it's not including predefined keyword
        // if (data != null) {
        // 	let props = libx.getCustomProperties(data);
        // 	let keywords = ['body', 'form', 'formData', 'multipart', 'json'];
        // 	if (libx._.intersection(keywords, props).length == 0) {
        // 		data = { body: data };
        // 	}
        // }

        // data = this.helpers.getFormData(data);

        options = objectHelpers.merge(options, { url: url });

        return await this.request('POST', url, null, data, options);
        // request.post(options, (err, httpResponse, body) => {
        // 	if (err) return p.reject(err);
        // 	p.resolve(body, httpResponse);
        // });
        // return p;
    };

    public upload = async (url: string, fileReadStream, options: any = {}) => {
        let p = helpers.newPromise();

        let formData = new FormData();
        formData.append('file', fileReadStream);

        if (options.data != null) {
            let props = objectHelpers.getCustomProperties(options.data);

            for (let prop of props) {
                formData.append(prop, options.data[prop]);
            }
        }

        axios
            .create({
                headers: formData.getHeaders(),
            })
            .post(url, formData)
            .then((response) => {
                p.resolve(response.data);
            })
            .catch((err) => {
                return p.reject(err);
            });

        return p;
    };
}

class Helper {
    public toQueryString = (obj: any, excludePrefix = false) => {
        return helpers.querialize(obj, excludePrefix);
    };

    public fixUrl(url: string, prefixUrl?: string) {
        var sep = '://';
        var pos = url.indexOf(sep);
        if (pos > -1) {
            var startOfUrl = url.slice(0, pos);
            var restOfUrl = url.slice(pos + 3);
            restOfUrl = restOfUrl.replace(/\/+/g, '/');
            url = startOfUrl + sep + restOfUrl;
        } else {
            url = url.replace(/\/+/g, '/');
        }

        prefixUrl = prefixUrl || '';

        var isAbsoluteUrl = pos > -1; // url.contains("//");
        url = this.cleanUrl((!isAbsoluteUrl ? prefixUrl : '') + url);

        return url;
    }

    public parseUrl(url: string) {
        return urlapi.parse(url);

        var l = document.createElement('a');
        l.href = url;
        return l;
    }

    public cleanUrl(url: string) {
        if (url == null) return null;
        //return url.replace('/(?<!http:)\/\//g', '/');
        return url.replace(new RegExp('([^:]/)/+', 'g'), '$1');
    }

    /*
	public getFormData = object => {
		const formData = new FormData();
		Object.keys(object).forEach(key => {
			if (helpers.isObject(object[key])) 
				formData.append(key, this.getFormData(object[key]));
			else 
				formData.append(key, object[key])
		});
		return formData;
	}

    public formDataToString = (formDataObj) =>
        [...formDataObj.entries()] // expand the elements from the .entries() iterator into an actual array
            .map((e) => encodeURIComponent(e[0]) + '=' + encodeURIComponent(e[1])); // transform the elements into encoded key-value-pairs

    public params(params, keys = [], isArray = false) {
        const p = Object.keys(params)
            .map((key) => {
                let val = params[key];

                if ('[object Object]' === Object.prototype.toString.call(val) || Array.isArray(val)) {
                    if (Array.isArray(params)) {
                        keys.push('');
                    } else {
                        keys.push(key);
                    }
                    return this.params(val, keys, Array.isArray(val));
                } else {
                    let tKey = key;

                    if (keys.length > 0) {
                        const tKeys = isArray ? keys : [...keys, key];
                        tKey = tKeys.reduce((str, k) => {
                            return '' === str ? k : `${str}[${k}]`;
                        }, '');
                    }
                    if (isArray) {
                        return `${tKey}[]=${val}`;
                    } else {
                        return `${tKey}=${val}`;
                    }
                }
            })
            .join('&');

        keys.pop();
        return p;
	}
	*/
}

export const network = new Network();

di.register('network', network);
