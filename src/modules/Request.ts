import axios from 'axios';
import { endsWith } from 'lodash';

export default class RequestModule {
    public options = new ModuleOptions();

    /** Documentation: TBD */
    public constructor(base: string, options?: Partial<ModuleOptions>) {
        this.options = { ...this.options, ...options };
        this.options.baseUrl = base;
        this.options.defaultHeaders.x = 1;
        this.options.defaultHeaders = { x: 1 };
    }

    public async getJson<T = any>(urlPart: string) {
        return (await this.get(urlPart))?.data;
    }

    public async postJson<T = any>(urlPart: string, data: {}) {
        return (await this.post(urlPart, data))?.data;
    }

    public async get<T = any>(urlPart: string, queryParams?: {}, extraHeaders?: {}) {
        const p = RequestModule.get(urlPart, queryParams, {
            token: this.options.token,
            baseUrl: this.options.baseUrl,
            extraHeaders: extraHeaders || this.options.defaultHeaders,
        });
        p.catch((err) => {
            if (this.options?.errorHandler != null) this.options.errorHandler(err);
        });
        return p;
    }

    public async post<T = any>(urlPart: string, data: {}, extraHeaders?: {}) {
        const p = RequestModule.post(urlPart, data, {
            token: this.options.token,
            baseUrl: this.options.baseUrl,
            extraHeaders: extraHeaders || this.options.defaultHeaders,
        });
        p.catch((err) => {
            if (this.options?.errorHandler != null) this.options.errorHandler(err);
        });
        return p;
    }

    public async put<T = any>(urlPart: string, subset: {}, extraHeaders?: {}) {
        const p = RequestModule.post(urlPart, subset, {
            token: this.options.token,
            baseUrl: this.options.baseUrl,
            extraHeaders: extraHeaders || this.options.defaultHeaders,
        });
        p.catch((err) => {
            if (this.options?.errorHandler != null) this.options.errorHandler(err);
        });
        return p;
    }

    public async delete<T = any>(urlPart: string, extraHeaders?: {}) {
        const p = RequestModule.delete(urlPart, {
            token: this.options.token,
            baseUrl: this.options.baseUrl,
            extraHeaders: extraHeaders || this.options.defaultHeaders,
        });
        p.catch((err) => {
            if (this.options?.errorHandler != null) this.options.errorHandler(err);
        });
        return p;
    }

    public static async get<T = any>(url: string, queryParams?: {}, reqOptions?: IRequestOptions) {
        url += this.helpers.serializeQueryParams(queryParams);
        return axios.get<T>(url, {
            ...this.helpers.buildReqConfig(reqOptions),
            headers: reqOptions?.extraHeaders,
        });
    }

    public static async post<T = any>(url: string, data: {}, reqOptions?: IRequestOptions) {
        return axios.post<T>(url, data, {
            ...this.helpers.buildReqConfig(reqOptions),
            headers: reqOptions?.extraHeaders,
        });
    }

    public static async put<T = any>(url: string, subset: {}, reqOptions?: IRequestOptions) {
        return axios.put<T>(url, subset, {
            ...this.helpers.buildReqConfig(reqOptions),
            headers: reqOptions?.extraHeaders,
        });
    }

    public static async delete<T = any>(url: string, reqOptions?: IRequestOptions) {
        return axios.delete<T>(url, {
            ...this.helpers.buildReqConfig(reqOptions),
            headers: reqOptions?.extraHeaders,
        });
    }

    public static escape(obj: {}) {
        return this.helpers.escape(obj);
    }

    private static helpers = {
        buildReqConfig: (options: IRequestOptions) => ({
            baseURL: options.baseUrl,
            headers: {
                ...RequestModule.helpers.getAuthHeader(options),
            },
        }),
        getAuthHeader: (options: IRequestOptions) => {
            const headers = {};
            if (options.token) headers['Authorization'] = 'Bearer ' + options.token;
            return headers;
        },
        serializeQueryParams: (obj: {}) => {
            if (obj == null) return '';
            let ret = '?';
            for (let key in obj) {
                ret += key + '=' + obj[key]?.toString() + '&';
            }
            if (ret == '?') return '';
            if (ret.endsWith('&')) ret = ret.substr(0, ret.length - 1);
            return ret;
        },
        escape: (obj) => {
            if (obj == null || obj == {}) return '';
            return encodeURIComponent(JSON.stringify(obj));
        },
    };
}

export class ModuleOptions {
    token?: string;
    baseUrl?: string;
    defaultHeaders?: any = {
        'Content-Type': 'application/json',
    };
    errorHandler: (err: Object) => void;
}

export interface IRequestOptions {
    token?: string;
    baseUrl?: string;
    extraHeaders?: any;
}
