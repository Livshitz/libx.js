import { expect, test, beforeAll, beforeEach, describe } from 'vitest'

// const mod = new mod();

beforeEach(() => {
    
});

test('-positive', () => {
	const param = { a: 1 };
	const output = true; //mod.(param);
	expect(output).toEqual(true);
});

// test('-positive', () => {
// 	const param = { a: 1 };
// 	const output = mod.(param);
// 	expect(output).toEqual(true);
// });
