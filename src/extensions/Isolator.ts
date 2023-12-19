import { objectHelpers } from "../helpers/ObjectHelpers";
import { ObjectLiteral } from "../types/interfaces";

export class Isolator {
	public static async cleanRun<T = any>(func: () => Promise<T>) {
		const { props: arrProps, clone: arrClone } = Isolator.isolateArray();
		const { props: dateProps, clone: dateClone } = Isolator.isolateDate();
		const { props: numProps, clone: numClone } = Isolator.isolateNumber();
		const { props: strProps, clone: strClone } = Isolator.isolateString();
		const { props: objProps, clone: objClone } = Isolator.isolateObject();

		try {
			return await func();
		} finally {
			// Restore the original prototype
			for (let prop of arrProps) { Array.prototype[prop] = arrClone[prop]; };
			for (let prop of dateProps) { Date.prototype[prop] = dateClone[prop]; };
			for (let prop of numProps) { Number.prototype[prop] = numClone[prop]; };
			for (let prop of strProps) { String.prototype[`${prop}`] = strClone[prop]; };
			for (let prop of objProps) { Object.prototype[prop] = objClone[prop]; };
		}
	}

	public static getProps(obj: any) {
		// return objectHelpers.getCustomProperties(obj);
		return Object.getOwnPropertyNames(obj);
	}

	private static clone(obj) {
		return { ...obj };
		// return objectHelpers.clone(obj);
	}

	// private static indexOf<T>(array: T[], searchElement: T, fromIndex = 0): number {
	// 	for (let i = fromIndex; i < array.length; i++) {
	// 		if (array[i] === searchElement) {
	// 			return i;
	// 		}
	// 	}
	// 	return -1;
	// }

	private static removeFromArr(item, arr) {
		var index = arr.indexOf(item);
		if (index > -1) {
			arr.splice(index, 1);
		}
		return arr;
	}

	private static isolateBase(obj, propsList: string): { props: string[]; clone: any } {
		let props = Object.getOwnPropertyNames(obj);
		const clone = this.clone(obj);

		[...props].forEach(x => {
			if (`,${propsList},`.indexOf(`,${x},`) > -1) {
				this.removeFromArr(x, props);
				return;
			}
			delete obj[x]
		});

		return { props, clone };
	}

	private static isolateArray() {
		return this.isolateBase(Array.prototype, 'length,constructor,at,concat,copyWithin,fill,find,findIndex,findLast,findLastIndex,lastIndexOf,pop,push,reverse,shift,unshift,slice,sort,splice,includes,indexOf,join,keys,entries,values,forEach,filter,flat,flatMap,map,every,some,reduce,reduceRight,toLocaleString,toString,toReversed,toSorted,toSpliced,with');
	}

	private static isolateDate() {
		return this.isolateBase(Date.prototype, 'length,constructor,toString,toDateString,toTimeString,toISOString,toUTCString,toGMTString,getDate,setDate,getDay,getFullYear,setFullYear,getHours,setHours,getMilliseconds,setMilliseconds,getMinutes,setMinutes,getMonth,setMonth,getSeconds,setSeconds,getTime,setTime,getTimezoneOffset,getUTCDate,setUTCDate,getUTCDay,getUTCFullYear,setUTCFullYear,getUTCHours,setUTCHours,getUTCMilliseconds,setUTCMilliseconds,getUTCMinutes,setUTCMinutes,getUTCMonth,setUTCMonth,getUTCSeconds,setUTCSeconds,valueOf,getYear,setYear,toJSON,toLocaleString,toLocaleDateString,toLocaleTimeString');
	}

	private static isolateNumber() {
		return this.isolateBase(Number.prototype, 'constructor,toExponential,toFixed,toPrecision,toString,valueOf,toLocaleString');
	}

	private static isolateString() {
		return this.isolateBase(String.prototype, 'length,constructor,anchor,at,big,blink,bold,charAt,charCodeAt,codePointAt,concat,endsWith,fontcolor,fontsize,fixed,includes,indexOf,isWellFormed,italics,lastIndexOf,link,localeCompare,match,matchAll,normalize,padEnd,padStart,repeat,replace,replaceAll,search,slice,small,split,strike,sub,substr,substring,sup,startsWith,toString,toWellFormed,trim,trimStart,trimLeft,trimEnd,trimRight,toLocaleLowerCase,toLocaleUpperCase,toLowerCase,toUpperCase,valueOf');
	}

	private static isolateObject() {
		return this.isolateBase(Object.prototype, 'constructor,__defineGetter__,__defineSetter__,hasOwnProperty,__lookupGetter__,__lookupSetter__,isPrototypeOf,propertyIsEnumerable,toString,valueOf,__proto__,toLocaleString');
	}
}

export const cleanRun = Isolator.cleanRun;