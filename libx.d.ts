/// <reference path="./libx.extensions.d.ts" />

declare namespace LibxJS {
	interface Base {
		create(): any;
	}

	interface ILibxJS {
		di: any;
		newPromise(): any;
		log: any;
		browser: any;
		Callbacks: ICallbacks;
	}

	interface IFirebase {
		new(firebaseApp: any, firebaseProvider: any) : IFirebase,
		isConnected(callback: ((isConnected: boolean) => void)): Promise<any>,
		makeKey(givenTimestamp),
		getRef(path, type, callback),
		listen(path, callback),
		get(path): Promise<any>,
		update(path, data, avoidFill),
		set(path, data, avoidFill),
		push(path, data, avoidFill),
		delete(path),
		filter(path, byChild, byValue),
		getIdFromPath(path),
		dictToArray(dict),
		parseKeyDate(key),
		onPresent(path, value, onDisconnectValue),
	}

	interface ICallbacks {
		new() : ICallbacks,
		counter: number,
		list: [],
		clear(id: string): any,
		clearAll(): any,
		subscribe(callback: Function): any,
		trigger(... params : any[]): any,
	}
}

// --------------------------------------------------------------------------------

// enables access simply by writing 'libx.'
declare var libx: LibxJS.ILibxJS;

// enables access with 'global.libx' (sometimes you want to make sure the scope)
declare module NodeJS  {
    interface Global {
        libx: LibxJS.ILibxJS;
    }
}

