import { expect, test, beforeAll, beforeEach, describe } from 'vitest'
import { Hash } from "../../src/modules/Hash";
import { Measurement } from "../../src/modules/Measurement";

test('hash-sha256-positive', () => {
	const param = 'hello';
	const m = Measurement.start()
	const output = Hash.sha256(param);
	console.log(`hash-sha256 took1 ${m.peek()}ms`);
	expect(output).toEqual('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
});

test('hash-sha1-positive', () => {
	const param = 'hello';
	const m = Measurement.start()
	const output = Hash.sha1(param);
	console.log(`hash-sha1 took ${m.peek()}ms`);
	expect(output).toEqual('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
});

// test('hash-md5-positive', () => {
// 	const param = 'hello';
// 	const output = Hash.md5(param);
// 	expect(output).toEqual('5d41402abc4b2a76b9719d911017c592');
// });
