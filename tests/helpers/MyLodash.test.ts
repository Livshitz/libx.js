import { expect, test, beforeAll, beforeEach, describe, vi } from 'vitest'
import { MyLodash } from '../../src/helpers/MyLodash'; // Adjust the import path as needed

describe('MyLodash', () => {
	test('forEach should iterate over each element in an array', () => {
		const mockFn = vi.fn();
		MyLodash.forEach([1, 2, 3], mockFn);
		expect(mockFn).toHaveBeenCalledTimes(3);
		expect(mockFn).toHaveBeenCalledWith(1, 0, [1, 2, 3]);
		expect(mockFn).toHaveBeenCalledWith(2, 1, [1, 2, 3]);
		expect(mockFn).toHaveBeenCalledWith(3, 2, [1, 2, 3]);
	});

	test('forEach should iterate over each property in an object', () => {
		const mockFn = vi.fn();
		MyLodash.forEach({ a: 1, b: 2 }, mockFn);
		expect(mockFn).toHaveBeenCalledTimes(2);
		expect(mockFn).toHaveBeenCalledWith(1, 'a', { a: 1, b: 2 });
		expect(mockFn).toHaveBeenCalledWith(2, 'b', { a: 1, b: 2 });
	});

	test('mixin should add new methods to the class', () => {
		MyLodash.mixin({
			greet: (name: string) => `Hello, ${name}!`,
		});
		//@ts-ignore
		expect(MyLodash.greet('John')).toBe('Hello, John!');
	});

	test('official transform test', () => {
		const output = MyLodash.transform([2, 3, 4], function (result, n) {
			result.push(n *= n);
			return n % 2 == 0;
		}, []);
		expect(output).toEqual([4, 9]);
	});

	test('reduce should reduce an array into a single value', () => {
		const result = MyLodash.reduce([1, 2, 3], (acc, value) => acc + value, 0);
		expect(result).toBe(6);
	});

	test('map should return a new array with transformed values', () => {
		const result = MyLodash.map([1, 2, 3], (num) => num * 2);
		expect(result).toEqual([2, 4, 6]);
	});

	test('mapKeys should return a new object with transformed keys', () => {
		const result = MyLodash.mapKeys({ a: 1, b: 2 }, (value, key) => MyLodash.toUpperCase(key?.toString()));
		expect(result).toEqual({ A: 1, B: 2 });
	});

	test('mapValues should return a new object with transformed values', () => {
		const result = MyLodash.mapValues({ a: 1, b: 2 }, (value) => value * 2);
		expect(result).toEqual({ a: 2, b: 4 });
	});

	test('each should be an alias for forEach', () => {
		const mockFn = vi.fn();
		MyLodash.each([1, 2], mockFn);
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test('toPairs should convert an object to key-value pairs', () => {
		const result = MyLodash.toPairs({ a: 1, b: 2 });
		expect(result).toEqual([['a', 1], ['b', 2]]);
	});

	test('repeat should repeat a string n times', () => {
		const result = MyLodash.repeat('a', 3);
		expect(result).toBe('aaa');
	});

	test('join should join an array of strings into a single string', () => {
		const result = MyLodash.join(['a', 'b', 'c'], '-');
		expect(result).toBe('a-b-c');
	});

	test('has should return true if path exists in object', () => {
		const result = MyLodash.has({ a: { b: 1 } }, 'a.b');
		expect(result).toBe(true);
	});

	test('has should return false if path does not exist in object', () => {
		const result = MyLodash.has({ a: { b: 1 } }, 'a.c');
		expect(result).toBe(false);
	});

	test('isEqual should check deep equality', () => {
		expect(MyLodash.isEqual({ a: 1 }, { a: 1 })).toBe(true);  // Same structure and values
		expect(MyLodash.isEqual({ a: 1 }, { a: 2 })).toBe(false);  // Different values
		expect(MyLodash.isEqual([1, 2], [1, 2])).toBe(true);  // Same arrays
		expect(MyLodash.isEqual([1, 2], [2, 1])).toBe(false);  // Different arrays
	});

	test('isPlainObject should check if value is a plain object', () => {
		expect(MyLodash.isPlainObject({})).toBe(true);  // Plain object
		expect(MyLodash.isPlainObject([])).toBe(false);  // Array is not a plain object
		expect(MyLodash.isPlainObject(null)).toBe(false);  // null is not an object
		expect(MyLodash.isPlainObject(new Date())).toBe(false);  // Date is not a plain object
		expect(MyLodash.isPlainObject(Object.create(null))).toBe(true);  // Object created with null prototype is a plain object
	});

	test('isString should check if value is a string', () => {
		expect(MyLodash.isString('hello')).toBe(true);  // String value
		expect(MyLodash.isString(123)).toBe(false);  // Number is not a string
		expect(MyLodash.isString([])).toBe(false);  // Array is not a string
		expect(MyLodash.isString('')).toBe(true);  // Empty string
	});

	test('has should check if object has a property at the given path', () => {
		const obj = { a: { b: { c: 1 } } };
		expect(MyLodash.has(obj, 'a.b.c')).toBe(true);  // Property exists at path
		expect(MyLodash.has(obj, 'a.b.d')).toBe(false);  // Property does not exist at path
		expect(MyLodash.has(obj, 'a')).toBe(true);  // Property exists at top level
		expect(MyLodash.has(obj, 'b')).toBe(false);  // Property does not exist at top level
	});

	test('isObject should check if value is an object', () => {
		expect(MyLodash.isObject({})).toBe(true);  // Plain object
		expect(MyLodash.isObject([])).toBe(true);  // Arrays are objects
		expect(MyLodash.isObject(null)).toBe(false);  // null is not an object
		expect(MyLodash.isObject('string')).toBe(false);  // String is not an object
		expect(MyLodash.isObject(123)).toBe(false);  // Number is not an object
	});

	test('should convert a mixed-case string to uppercase', () => {
		expect(MyLodash.toUpperCase('HeLLo WoRLd')).toBe('HELLO WORLD');
	});
});
