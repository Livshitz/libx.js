/// <reference path="./libx.extensions.d.ts" />
/// <reference path="./enums.d.ts" />
/// <reference path="./enums.d.ts" />
/// <reference types="lodash" />

declare namespace LibxJS {
	interface Base {
		create(): any;
	}

	interface IDeferredJS {
		when();
		(): IDeferred<any>;
	}

	interface IDeferred<T>  extends Promise<any> {
		resolveWith(ctx);
		rejectWith(ctx);
		notifyWith(ctx);
		resolve(...args);
		reject(...args);
		notify();
	}

	interface IPromise<T> {
		done();
		fail();
		always();
		progress();
		promise();
		state()
		debug();
		isRejected();
		isResolved();
		pipe(done, fail, progress);
		getContext();
		getId();
	}

	interface ILibxJS {
		_: ILodash;
		$: IAny;
		di: IDependencyInjector;
		newPromise(): IDeferred<any>;
		log: ILog;
		browser: IBrowser;
		Callbacks: ICallbacks;
		DependencyInjector: DependencyInjector;
		async(callback: Function): Promise<any>;
		base64ToUint8Array(base64String: string): Uint8Array;
		Buffer: Buffer;
		chainTasks(tasks: (() => Promise<any>)[]): Promise<any>;
		class2type: {[key: string]: string};
		clone(source:any, target?: any): any;
		debounce(func: Function, wait: number, immediate?: boolean, allowTaillingCall?: boolean): Function;
		deferred: IDeferredJS; //(func :Function): Promise<any>;
		delay(milliseconds: number): Promise<any>;
		diff(object: Object, base: Object): Object;
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
		makeEmpty(obj: Object): Object;
		makeAsync(func: Function): ()=>Promise<any>;
		modules(): [];
		newGuid(useDash?: Boolean): string;
		parseConfig(contents: string, env: string): Object;
		parseJsonFileStripComments(content): Object;
		randomNumber(max?: number, min?: number): number;
		shallowCopy(obj: Object): Object;
		shuffle(a: Array<any>): Array<any>;
		sleep(time: number, callback?: Function): Promise<void>;
		spawnHierarchy(path: string): any;
		stringifyOnce(obj: Object, replacer?: (key: string, value: any) => any, indent?: number): string;
		throttle(func: Function, wait: number, immediate?: Boolean): Function;
		type(obj: any): string;
		waitUntil<T>(conditionFn: Function, callback?: (()=>T), interval?: number, timeout?: number): Promise<T>;
		measure(measureName?: string): number;
		getMeasure(measureName?: string): number;
		node: IModuleNode;
		fileStreamToBuffer(readStream): Promise<Buffer>;
	}

	interface IExtensions {
		
	}

	interface ILodash extends _.LoDashStatic {
		VERSION: string;
		camelCase(): any;
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

	interface IAny {
		[key: string]: any;
	}

	interface IBrowser {
		require(identifier: string, callback?: Function, compiler?: any): Promise<any>;
		helpers: IBrowserHelpers;
	}
	
	interface IBrowserHelpers {
		cleanUrl(url: string): string;
		copyToClipboard(text: string);
		enableLogDisplay();
		events: {
			subscribe: Function, 
			broadcast: Function
		};
		getAttributes($node, pattern): {[key: string]: string};
		getHost(absUrl): string;
		getIdFromUrl(): string;
		getImageMeta(url): Promise<{width, height}>;
		getParameters(): [string];
		getSubDomain(): string;
		injectCss(filename: string);
		injectScript(src: string, onReady: Function);
		isIframe(): Boolean;
		isiOS: Boolean;
		jQueryExt: {
			setup($), 
			applyReveal(),
		};
		messages: {
			subscribe(channelName, callback), 
			broadcast(channelName, message),
		};
		pauseOnInactivity(videoElm: HTMLElement);
		querialize(obj: Object, avoidPrefix: Boolean): string;
		queryString(name: string): string;
		reload();
		uploadFile(folderName: string, filesInput: any, callback?: Function);
		urlParams();
		urlize(obj: Object): string;
	}

	interface ILog {
		isDebug;
		isShowStacktrace;
		isShowTime;
		isShowPrefix;
		severities: LogSeverities;
		filterLevel: LogSeverities;
		
		debug(message: string, ...args);
		d(message: string, ...args);
		verbose(message: string, ...args);
		v(message: string, ...args);
		info(message: string, ...args);
		i(message: string, ...args);
		warning(message: string, ...args);
		w(message: string, ...args);
		error(message: string, ...args);
		e(message: string, ...args);
		fatal(message: string, ...args);
		f(message: string, ...args);

		colors: LogColors;
		color(str: string, color: LogColors): string;
		write(...args);
		getStackTrace(): string;
	}

	interface IFirebase {
		new(firebaseApp: any, firebaseProvider: any) : IFirebase;
		isConnected(callback: ((isConnected: boolean) => void)): Promise<any>;
		makeKey(givenTimestamp: Date);
		getRef(path: string, type: string, callback: Function);
		listen(path: string, callback: Function);
		get(path: string): Promise<any>;
		update(path: string, data: Object, avoidFill?: Boolean);
		set(path: string, data: Object, avoidFill?: Boolean);
		push(path: string, data: Object, avoidFill?: Boolean);
		delete(path: string);
		filter(path: string, byChild: string, byValue: any);
		getIdFromPath(path: string);
		dictToArray(dict: any);
		parseKeyDate(key: string);
		onPresent(path: string, value: any, onDisconnectValue: any);
	}

	interface ICallbacks {
		new() : ICallbacks;
		counter: number;
		list: [];
		clear(id: string): any;
		clearAll(): any;
		subscribe(callback: Function): any;
		trigger(... params : any[]): any;
	}

	class DependencyInjector {
		constructor();
	}	

	interface IDependencyInjector {
		register(name: string, instance: any);
		registerResolve(name: string, func: Function);
		get<T>(name: string): T;
		resolve (func: Function, isGetArray: Boolean);
		inject (func: Function);
		require (func: Function);
		requireUgly (depsArr: [string], func: Function);
		modules: {[key: string]: any};
	}

	interface IModuleNetwork {
		httpGetJson(url: string, _options?: {}): Promise<Object>;
		httpGetString(url: string, _options?: {}): Promise<String>;
		httpGet(url: string, _options?: {}): Promise<Buffer>;
		httpPost(url: string, data: any, _options?: {}): Promise<Buffer>;
		httpPostJson(url: string, data: any, _options?: {}): Promise<Object>;
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
		}
	}

	interface IModuleNode {
		args:any;
		isCalledDirectly(): boolean;
		exec(commands: string, verbose: boolean): Promise<any>;
		getLibxVersion(): string;
		readPackageJson(path: string): any;
		readConfig(_path: string, secretsKey: string): any;
		bumpNpmVersion(file: string, releaseType: string): { original, updated };
		readJsonFileStripComments(file: string): any;
		encryptFile(file: string, key: string, newFile?: string): string;
		decryptFile(file: string, key: string, newFile?: string): string;
		mkdirRecursiveSync(path: string): void;
		rmdirRecursiveSyncfunction(path: string): void;
		catchErrors(handler?: Function, shouldExit?: boolean): void;
		onExit(exitHandler?: Function): void;
	}

	type LogColors = { reset, bright, dim, underscore, blink, reverse, hidden, fgBlack, fgRed, fgGreen, fgYellow, fgBlue, fgMagenta, fgCyan, fgWhite, bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite };

	type LogSeverities = { debug, verbose, info, warning, error, fatal }
}

// --------------------------------------------------------------------------------

// enables access simply by writing 'libx.'
declare var libx: LibxJS.ILibxJS;

// enables access with 'global.libx' (sometimes you want to make sure the scope)
declare module NodeJS  {
    interface Global {
        libx: LibxJS.ILibxJS;
	}
	
	interface String {
        capitalize() : string;
    }
}
