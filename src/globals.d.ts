/*
declare global {
	namespace NodeJS  {
		// const libx: ILibx;
		// interface Global {
		// }
		
		interface String {
			format(...params: any[]) : string;
			capitalize() : string;
			ellipsis(maxLength: number) : string;
			kebabCase() : string;
			camelize() : string;
			padNumber(width: number, z: string) : string;
			contains(str: string) : boolean;
			hashCode() : string;
			endsWith(suffix: string) : boolean;
			startsWith(prefix: string) : boolean;
			isEmpty(input?: string) : boolean;
		}

		interface Date {
			isValid() : boolean;
			formatx(mask: string, utc?: boolean) : string;
			format(strFormat: string, utc?: boolean) : string;
			fromJson(aJsonDate: Object) : Date;
			toJson() : string;
			addHours(h: number) : Date;
			addMinutes(m: number) : Date;
			addMilliseconds(ms: number) : Date;
			toUTC(): Date;
			toISOStringUTC(isUTC?: Boolean): Date;
		}

		interface Array<T> {
			diff(a: T[]) : T[];
			myFilter(fn: Function) : T[];
			myFilterSingle(fn: Function) : T;
			remove(item: T): T[];
			contains(item: T): boolean;
		}
	}
}
*/


// declare global {
// 	const libx: LibxJS.ILibxJS;
// 	namespace NodeJS  {
// 		interface Global {
// 			localStorage: any;
// 		}
// 	}
// }

const ObjectExtensions = import('./extensions/ObjectExtensions');
type ObjectExtensionsAlias = ObjectExtensions;
interface Object extends ObjectExtensionsAlias { }
interface String extends LibxJSExtensions.IExtensionsString { }
interface Date extends LibxJSExtensions.IExtensionsDate { }
interface Array<T> extends LibxJSExtensions.IExtensionsArray<T> { }

declare namespace LibxJSExtensions {

	interface IExtensionsObject {
		test();
	}

	interface IExtensionsString {
		format(...params: any[]) : string;
		capitalize() : string;
		ellipsis(maxLength: number) : string;
		kebabCase() : string;
		camelize() : string;
		padNumber(width: number, z: string) : string;
		contains(str: string) : boolean;
		hashCode() : string;
		endsWith(suffix: string) : boolean;
		startsWith(prefix: string) : boolean;
		isEmpty(input?: string) : boolean;
	}

	interface IExtensionsDate {
		isValid() : boolean;
		formatx(mask: string, utc?: boolean) : string;
		format(strFormat: string, utc?: boolean) : string;
		fromJson(aJsonDate: Object) : Date;
		toJson() : string;
		addHours(h: number) : Date;
		addMinutes(m: number) : Date;
		addMilliseconds(ms: number) : Date;
		toUTC(): Date;
		toISOStringUTC(isUTC?: Boolean): Date;
	}

	interface IExtensionsArray<T> {
		diff(a: T[]) : T[];
		myFilter(fn: Function) : T[];
		myFilterSingle(fn: Function) : T;
		remove(item: T): T[];
		contains(item: T): boolean;
	}
}