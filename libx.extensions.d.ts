interface String extends LibxJS.IExtensionsString { }
interface Date extends LibxJS.IExtensionsDate { }
interface Array<T> extends LibxJS.IExtensionsArray<T> { }

declare namespace LibxJS {
	interface IExtensionsString {
		format(...params: any[]) : any;
		capitalize() : string;
		kebabCase() : string;
		camelize() : string;
		padNumber(width: number, z: string) : string;
		contains(str: string) : boolean;
		hashCode() : string;
		endsWith(suffix: string) : boolean;
		startsWith(prefix: string) : boolean;
		isEmpty(input: string) : boolean;
	}

	interface IExtensionsDate {
		isValid() : boolean;
		formatx(mask: string, utc: boolean) : string;
		format(strFormat: string, utc: boolean) : string;
		fromJson(aJsonDate: Object) : Date;
		toJson() : string;
		addHours(h: number) :Date;
	}

	interface IExtensionsArray<T> {
		diff(a: T[]) : T[];
		myFilter(fn: Function) : T[];
		myFilterSingle(fn: Function) : T;
		remove(item: T): T[];
		contains(item: T): boolean;
	}
}