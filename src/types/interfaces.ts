// import Deferred from 'concurrency.libx.js/build/Deferred';
export { Deferred } from 'concurrency.libx.js';

export {};

export type FuncWithArgs<T = any> = (...args: T[]) => void;

export interface IDeferredJS {
    when();
    (): IDeferred<any>;
}

export type Key = string | number | symbol;

export type ObjectLiteral = { [key: string]: any };
export type DynamicProperties<T = any> = { [P in keyof T]: T[P] };
export const DynamicProps = class {
    [key: string]: any;
};
export interface Mapping<T = any> {
    [K: string]: T;
}

export interface Base {
    create(): any;
}

// export interface IDeferred<T=any, Treason=any> extends Deferred<T, Treason> { }
// export interface IDeferred<T=any, Treason=any> extends Promise<T> {
// 	resolveWith(ctx);
// 	rejectWith(ctx);
// 	notifyWith(ctx);
// 	resolve(...args);
// 	reject(...args);
// 	// [Symbol.toStringTag];
// 	notify();
// }

// export interface IDeferred<T = any, Treason = any> extends Deferred<T, Treason> {
export interface IDeferred<T = any, Treason = any> extends Promise<T> {
    resolveWith(ctx);
    rejectWith(ctx);
    notifyWith(ctx);
    resolve(...args);
    reject(...args);
    notify();
}

export interface IPromise<T> {
    done();
    fail();
    always();
    progress();
    promise();
    state();
    debug();
    isRejected();
    isResolved();
    pipe(done, fail, progress);
    getContext();
    getId();
}

export interface IAny {
    [key: string]: any;
}

export interface IBrowser {
    require<T>(identifier: string, callback?: Function, compiler?: any): Promise<T>;
    helpers: IBrowserHelpers;
}

export interface IBrowserHelpers {
    cleanUrl(url: string): string;
    copyToClipboard(text: string);
    enableLogDisplay();
    events: {
        subscribe: Function;
        broadcast: Function;
    };
    getAttributes($node, pattern): { [key: string]: string };
    getHost(absUrl): string;
    getIdFromUrl(): string;
    getImageMeta(url): Promise<{ width; height }>;
    getParameters(): [string];
    getSubDomain(): string;
    injectCss(filename: string);
    injectScript(src: string, onReady: Function);
    isIframe(): Boolean;
    isiOS: Boolean;
    jQueryExt: {
        setup($);
        applyReveal();
    };
    messages: {
        subscribe(channelName, callback);
        broadcast(channelName, message);
    };
    querialize(obj: Object, avoidPrefix: Boolean): string;
    queryString(name: string): string;
    reload();
    uploadFile(folderName: string, filesInput: any, callback?: Function);
    urlParams();
    urlize(obj: Object): string;
}

export interface IFirebase {
    new (firebaseApp: any, firebaseProvider: any): IFirebase;
    firebasePathPrefix: string;
    isConnected(callback: (isConnected: boolean) => void): Promise<any>;
    makeKey(givenTimestamp: Date);
    getRef(path: string, type: string, callback: Function);
    listen(path: string, callback: Function);
    unlisten(path: string);
    get(path: string): Promise<any>;
    update(path: string, data: Object, avoidFill?: Boolean);
    set(path: string, data: Object, avoidFill?: Boolean);
    push(path: string, data: Object, avoidFill?: Boolean);
    delete(path: string);
    filter(path: string, byChild: string, byValue: any);
    getIdFromPath(path: string);
    dictToArray(dict: any);
    arrayToDic(arr: any);
    parseKeyDate(key: string);
    onPresent(path: string, value: any, onDisconnectValue: any);
    cleanObjectId(objectId: string, char?: string): string;
}

export interface ICallbacks {
    new (): ICallbacks;
    counter: number;
    list: [];
    clear(id: string): any;
    clearAll(): any;
    subscribe(callback: Function): any;
    once(callback: Function): any;
    until(callback: Function): Function;
    trigger(...params: any[]): any;
}

export interface IDependencyInjector {
    register(name: string, instance: any);
    registerResolve(name: string, func: Function);
    get<T>(name: string): T;
    resolve(func: Function, isGetArray: Boolean);
    inject(func: Function);
    require(func: Function);
    requireUgly(depsArr: [string], func: Function);
    modules: { [key: string]: any };
}

export interface IModuleNetwork {
    httpGetJson(url: string, _options?: {}): Promise<JSONObject>;
    httpGetString(url: string, _options?: {}): Promise<String>;
    httpGet(url: string, _options?: {}): Promise<Buffer>;
    httpPost(url: string, data: any, _options?: {}): Promise<Buffer>;
    httpPostJson(url: string, data: any, _options?: {}): Promise<JSONObject>;
    httpRequest(url: string, data: any, method: string, _options?: {}): Promise<any>;
    request(method, url, params?, options?): Promise<any>;
    get(url, params?, options?): Promise<any>;
    post(url, data?, options?): Promise<any>;
    upload(url, fileReadStream?, options?): Promise<any>;
    helpers: {
        fixUrl(url: string, prefixUrl: string): string;
        parseUrl(url: string): string;
        cleanUrl(url: string): string;
        // getFormData(object: Object): any;
        formDataToString(formDataObj: Object): string;
        params(params: any, keys: Object, isArray?: Boolean): any;
    };
}

export interface IModuleNode {
    args: any;
    isCalledDirectly(): boolean;
    exec(commands: string, verbose: boolean): Promise<any>;
    getLibxVersion(): string;
    readPackageJson(path: string): any;
    readConfig(_path: string, secretsKey: string): any;
    bumpNpmVersion(file: string, releaseType: string): { original; updated };
    readJsonStripComments(file: string): any;
    readJson(file: string): any;
    encryptFile(file: string, key: string, newFile?: string): string;
    decryptFile(file: string, key: string, newFile?: string): string;
    mkdirRecursiveSync(path: string): void;
    rmdirRecursiveSync(path: string): void;
    catchErrors(handler?: Function, shouldExit?: boolean): void;
    onExit(exitHandler?: Function): void;
    getFilenameWithoutExtension(filePath: string): string;
    getProjectConfig(containingFolder: string, secret: string): any;
    getFiles(query?: string, options?: JSONObject): string[];
    prompts: IModulePrompts;
}

export interface IModulePrompts {
    confirm(question: string, pattern?: string, defaultAnswer?: string): Promise<Boolean>;
}

// export type LogColors = { reset, bright, dim, underscore, blink, reverse, hidden, fgBlack, fgRed, fgGreen, fgYellow, fgBlue, fgMagenta, fgCyan, fgWhite, bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite };

// export type LogSeverities = { debug, verbose, info, warning, error, fatal }

type Serializable = number | string | boolean | null | JSONArray | JSONObject;
export interface JSONArray extends Array<Serializable> {}
export interface JSONObject {
    [key: string]: Serializable;
}

export interface ISerializable {
    toJSON(): string;
}

export interface IExtensions {}

export interface ILodash extends _.LoDashStatic {
    VERSION: string;
    // camelCase(str: string): string;
    // forEach(): any;
    // assignIn(): any;
    // bind(): any;
    // length(): any;
    // name(): any;
    // arguments(): any;
    // caller(): any;
    // prototype(): any;
    // before(): any;
    // bind(): any;
    // chain(): any;
    // compact(): any;
    // concat(): any;
    // create(): any;
    // defaults(): any;
    // defer(): any;
    // delay(): any;
    // filter(): any;
    // flatten(): any;
    // flattenDeep(): any;
    // iteratee(): any;
    // keys(): any;
    // map(): any;
    // matches(): any;
    // mixin(): any;
    // negate(): any;
    // once(): any;
    // pick(): any;
    // slice(): any;
    // sortBy(): any;
    // tap(): any;
    // thru(): any;
    // toArray(): any;
    // values(): any;
    // extend(): any;
    // clone(): any;
    // escape(): any;
    // every(): any;
    // find(): any;
    // has(): any;
    // head(): any;
    // identity(): any;
    // indexOf(): any;
    // isArguments(): any;
    // isArray(): any;
    // isBoolean(): any;
    // isDate(): any;
    // isEmpty(): any;
    // isEqual(): any;
    // isFinite(): any;
    // isFunction(): any;
    // isNaN(): any;
    // isNull(): any;
    // isNumber(): any;
    // isObject(): any;
    // isRegExp(): any;
    // isString(): any;
    // isUndefined(): any;
    // last(): any;
    // max(): any;
    // min(): any;
    // noConflict(): any;
    // noop(): any;
    // reduce(): any;
    // result(): any;
    // size(): any;
    // some(): any;
    // uniqueId(): any;
    // each(): any;
    // first(): any;
    // range(): any;
    // countBy(): any;
    // toPairs(): any;
    // keyBy(): any;
    // repeat(): any;
    // transform(): any;
    // uniq(): any;
    // sortKeysBy(): any;
    // fp(): any;
}

export class DependencyInjector {
    constructor() {}
}
