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

// const ObjectExtensions = import('./extensions/ObjectExtensions');
declare interface Array<T> extends LibxJSExtensions.IExtensionsArray<T> {}
declare type ObjectExtensionsAlias = import('./src/extensions/ObjectExtensions').ObjectExtensions;
declare interface Object extends ObjectExtensionsAlias {}
declare interface String extends LibxJSExtensions.IExtensionsString {}
declare interface Date extends LibxJSExtensions.IExtensionsDate {}

declare namespace LibxJSExtensions {
    interface IExtensionsObject {
        test();
    }

    interface IExtensionsString {
        format(...params: any[]): string;
        capitalize(): string;
        ellipsis(maxLength: number): string;
        kebabCase(): string;
        camelize(): string;
        padNumber(width: number, z: string): string;
        contains(str: string): boolean;
        hashCode(): string;
        endsWith(suffix: string): boolean;
        startsWith(prefix: string): boolean;
        isEmpty(input?: string): boolean;
        removeLastPart(delimiter = '/'): string;
        getAbbreviation(): string;
    }

    interface IExtensionsDate {
        isValid(): boolean;
        formatx(mask: string, utc?: boolean): string;
        format(strFormat: string, utc?: boolean): string;
        fromJson(aJsonDate: Object): Date;
        toJson(): string;
        addHours(h: number): Date;
        addMinutes(m: number): Date;
        addDays(days: number): Date;
        addMilliseconds(ms: number): Date;
        toUTC(): Date;
        toISOStringUTC(isUTC?: Boolean): Date;
        toTimezone(timezone: string): Date;
    }

    interface IExtensionsArray<T = any> {
        diff(a: T[]): T[];
        myFilter(fn: Function): T[];
        myFilterSingle(fn: Function): T;
        move(from: number, to: number): T[];
        remove(item: T): T[];
        removeAt(index: number, replace = null): T[];
        contains(item: T): boolean;
    }
}
