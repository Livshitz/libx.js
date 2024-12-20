type Key = string | number;

export class MyLodash {
	// _.forEach
	public static forEach<T>(collection: T[] | { [key: string]: any }, iteratee: (value: any, index: string | number, collection: T[] | { [key: string]: any }) => void): void {
		if (Array.isArray(collection)) {
			collection.forEach((value, index) => iteratee(value, index, collection));
		} else {
			for (const key in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, key)) {
					iteratee(collection[key], key, collection);
				}
			}
		}
	}

	// _.mixin
	public static mixin(object: { [key: string]: Function }): void {
		for (const [key, value] of Object.entries(object)) {
			MyLodash[key] = value;
		}
	}

	public static transform<T = any, TResult = any>(
		object: T[] | Record<string, T>,
		iteratee: (
			result: TResult,
			value: T,
			key: string | number,
			object: T[] | Record<string, T>
		) => boolean | void,
		accumulator?: TResult
	): TResult {
		// If accumulator is not provided, create a new object or array
		if (accumulator === undefined) {
			accumulator = Array.isArray(object) ? <TResult>[] : ({} as TResult);
		}

		const isArray = Array.isArray(object);

		for (const key in object) {
			if (Object.prototype.hasOwnProperty.call(object, key)) {
				const value = object[key];
				const index = isArray ? Number(key) : key;

				// Call the iteratee function
				const shouldBreak = iteratee(accumulator, value, index, object);

				// If the iteratee returns false, break the loop
				if (shouldBreak === false) {
					break;
				}
			}
		}

		return accumulator;
	}

	public static transform3<T, R>(
		object: T | T[],
		callback?: (accumulator: R, value: T[keyof T], key: keyof T | number, object: T) => void,
		accumulator?: R,
		thisArg?: any
	): R {
		const isArr = Array.isArray(object);

		if (accumulator == null) {
			if (isArr) {
				accumulator = [] as unknown as R; // Ensures type compatibility
			} else {
				const ctor = object && (object as any).constructor;
				const proto = ctor && ctor.prototype;

				accumulator = Object.create(proto) as R;
			}
		}

		if (callback) {
			const boundCallback = callback.bind(thisArg);
			const iterate = isArr ? (array: T[], cb: any) => array.forEach(cb) : (obj: T, cb: any) => {
				for (const key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) {
						cb(obj[key], key, obj);
					}
				}
			};

			iterate(object as any, (value: any, key: any) => {
				boundCallback(accumulator!, value, key, object);
			});
		}

		return accumulator!;
	}

	// _.transform
	public static transform2<T, U>(collection: T[] | { [key: string]: any }, iteratee: (result: U, value: any, key: string | number, collection: T[] | { [key: string]: any }) => U, accumulator?: U): U {
		accumulator = accumulator ?? (Array.isArray(this) ? [] : {}) as U;

		for (let i = 0; i < collection.length; i++) {
			const shouldContinue = iteratee(accumulator, collection[i], i, collection);
			if (!shouldContinue) {
				break;
			}
		}
		return accumulator;
	}

	// _.reduce
	public static reduce<T, U>(collection: T[] | { [key: string]: any }, iteratee: (accumulator: U, value: any, key: string | number, collection: T[] | { [key: string]: any }) => U, accumulator: U): U {
		MyLodash.forEach(collection, (value, key) => {
			accumulator = iteratee(accumulator, value, key, collection);
		});
		return accumulator;
	}

	// _.map
	public static map<T, U>(collection: T[] | { [key: string]: any }, iteratee: (value: any, index: string | number, collection: T[] | { [key: string]: any }) => U): U[] {
		const result: U[] = [];
		MyLodash.forEach(collection, (value, key) => {
			result.push(iteratee(value, key, collection));
		});
		return result;
	}

	// _.mapKeys
	public static mapKeys<T>(collection: { [key: Key]: T }, iteratee: (value: T, key: Key, collection: { [key: Key]: T }) => string): { [key: Key]: T } {
		const result: { [key: Key]: T } = {};
		MyLodash.forEach(collection, (value, key) => {
			const newKey = iteratee(value, key, collection);
			result[newKey] = value;
		});
		return result;
	}

	// _.mapValues
	public static mapValues<T>(collection: { [key: Key]: T }, iteratee: (value: T, key: Key, collection: { [key: Key]: T }) => any): { [key: Key]: any } {
		const result: { [key: Key]: any } = {};
		MyLodash.forEach(collection, (value, key) => {
			result[key] = iteratee(value, key, collection);
		});
		return result;
	}

	// _.each (alias for _.forEach)
	public static each<T>(collection: T[] | { [key: Key]: any }, iteratee: (value: any, index: Key, collection: T[] | { [key: Key]: any }) => void): void {
		MyLodash.forEach(collection, iteratee);
	}

	// _.toPairs
	public static toPairs<T>(object: { [key: string]: T }): [string, T][] {
		return Object.entries(object) as [string, T][];
	}

	// _.repeat
	public static repeat(string: string, n: number): string {
		return string.repeat(n);
	}

	// _.join
	public static join(array: string[], separator: string = ','): string {
		return array.join(separator);
	}

	// _.has
	public static has(object: { [key: string]: any }, path: string): boolean {
		return path.split('.').reduce((acc, key) => acc && acc[key], object) !== undefined;
	}

	public static isEqual(value: any, other: any): boolean {
		return JSON.stringify(value) === JSON.stringify(other);
	}

	public static isPlainObject(value: any): boolean {
		// return value !== null && typeof value === 'object' && value.constructor === Object;
		return value !== null && typeof value === 'object' &&
			(value.constructor === Object || Object.getPrototypeOf(value) === null);
	}

	// _.isString
	public static isString(value: any): boolean {
		return typeof value === 'string';
	}

	// _.has
	// public static has(object: any, path: string | number): boolean {
	// 	const keys = typeof path === 'string' ? path.split('.') : [path];
	// 	let result = object;
	// 	for (let key of keys) {
	// 		if (result && Object.prototype.hasOwnProperty.call(result, key)) {
	// 			result = result[key];
	// 		} else {
	// 			return false;
	// 		}
	// 	}
	// 	return true;
	// }

	// _.isObject
	public static isObject(value: any): boolean {
		return value !== null && typeof value === 'object';
	}

	public static toUpperCase(value: string): string {
		if (typeof value !== 'string') {
			throw new TypeError('Expected a string');
		}
		return value.toUpperCase();
	}
}