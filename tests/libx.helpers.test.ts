import { helpers } from "../src/helpers";

var dataset: any = {

 }

beforeAll(()=> {
})

// [[[[[[[[[[  Helper Extensions  ]]]]]]]]]]
// TODO: isWindow, arrayBufferToBuffer, bufferToArrayBuffer, getProjectConfig, DependencyInjector, jsonRecurse, jsonResolveReferences

test('helpers.spawnHierarchy-positive', () => {
	let param = 'a.b.c';
	let output = helpers.spawnHierarchy(param);
	expect(output).toEqual({ a: { b: { c: {} } }});
});

test('helpers.diff-positive', () => {
	let param = { a: 1, b: 2 , c: { ca: 11, cb: 22 }, empty: {}};
	let output = helpers.ObjectHelpers.diff(param, { a: 1, c: { cb:22 } });
	expect(output).toEqual({ b: 2, c: { ca: 11 }, empty: {}});
});
test('helpers.diff-skipEmpty-positive', () => {
	let param = { a: 1, b: 2 , c: { ca: 11, cb: 22 }, empty: {} };
	let output = helpers.ObjectHelpers.diff(param, { a: 1, c: { cb:22 } }, true);
	expect(output).toEqual({ b: 2, c: { ca: 11 }});
});
test('helpers.diff-skipEmpty-negative', () => {
	let param = { a: 1, b: 2 , c: { ca: 11, cb: 22 }, empty: {} };
	let output = helpers.ObjectHelpers.diff(param, { a: 1, c: { cb:22 } }, false);
	expect(output).toEqual({ b: 2, c: { ca: 11 }, empty: {} });
});

test('helpers.isObject-positive', () => {
	let param = {};
	let output = helpers.ObjectHelpers.isObject(param);
	expect(output).toEqual(true);
});

test('helpers.isObject-negative', () => {
	let param = 'not an object';
	let output = helpers.ObjectHelpers.isObject(param);
	expect(output).toEqual(false);
});

test('helpers.isFunction-positive', () => {
	let param = () => { console.log('isFunction') };
	let output = helpers.ObjectHelpers.isFunction(param);
	expect(output).toEqual(true);
});

test('helpers.isArray-positive', () => {
	let param = [ 1 ];
	let output = helpers.ObjectHelpers.isArray(param);
	expect(output).toEqual(true);
});

// test('helpers.bufferToArrayBuffer-positive', () => {
// 	let param = helpers.ObjectHelpers.Buffer.from('abc');
// 	let output = helpers.ObjectHelpers.isArray(param);
// 	expect(output).toEqual(true);
// });

// test('helpers.arrayBufferToBuffer-positive', () => {
// 	let param = helpers.Buffer.from('abc');
// 	let output = helpers.ObjectHelpers.isArray(param);
// 	expect(output).toEqual(true);
// });

test('helpers.isWindow-positive', () => {
	let param = global;
	let output = helpers.ObjectHelpers.isWindow(param);
	expect(output).toEqual(true);
});

test('helpers.isNumeric-positive', () => {
	let param = 123;
	let output = helpers.ObjectHelpers.isNumeric(param);
	expect(output).toEqual(true);
});

test('helpers.type-positive', () => {
	expect(helpers.ObjectHelpers.type(1)).toEqual('number');
	expect(helpers.ObjectHelpers.type('0')).toEqual('string');
	expect(helpers.ObjectHelpers.type(true)).toEqual('boolean');
	expect(helpers.ObjectHelpers.type(new Date())).toEqual('date');
	expect(helpers.ObjectHelpers.type(/123/g)).toEqual('regexp');
	expect(helpers.ObjectHelpers.type(new RegExp(/2/g))).toEqual('regexp');
	expect(helpers.ObjectHelpers.type({ a: 1 })).toEqual('object');
	expect(helpers.ObjectHelpers.type(()=>{})).toEqual('function');
});

test('helpers.isPlainObject-positive', () => {
	let param = { a : 1};
	let output = helpers.ObjectHelpers.isPlainObject(param);
	expect(output).toEqual(true);
});

test('helpers.newGuid-positive', () => {
	let guid = helpers.newGuid(true);
	expect(guid.replace(/[\d\w]/g, '')).toEqual('----');
});

test('helpers.newPromise-positive', () => {
	let p = helpers.newPromise();
	p.resolve(true);
	expect(p).resolves.toEqual(true);
});

test('helpers.isDefined-positive', () => {
	let param = { a : 1};
	let output = helpers.ObjectHelpers.isDefined(param, 'a');
	expect(output).toEqual(true);
});

test('helpers.clone-positive', () => {
	let param = { a : 1};
	let target = { b : 2 };
	let output = helpers.ObjectHelpers.clone(param, target);
	param.a = 10; // modify source
	expect(output).toEqual({ a:1, b:2 });
});
test('helpers.clone-positive-2', () => {
	let param = { a : 1};
	let target = {};
	let output = helpers.ObjectHelpers.clone(param, target);
	param.a = 10; // modify source
	expect(output).toEqual({ a:1 });
});

test('helpers.extend-positive-deep', () => {
	let param = { a : 1, b : { c : 3 } };
	let target = {};
	let output = helpers.ObjectHelpers.merge(true, target, param);
	param.a = 10; // modify source
	param.b.c = 30;
	expect(output).toEqual({ a : 1, b : { c : 3 } });
});
test('helpers.extend-positive-deep-2', () => {
	let param = { a : 1, b : { c : 3 } };
	let target = {};
	let output = helpers.ObjectHelpers.merge(target, param);
	param.a = 10; // modify source
	param.b.c = 30;
	expect(output).toEqual({ a : 1, b : { c : 3 } });
});
test('helpers.extend-positive-shallow', () => {
	let param = { a : 1, b : { c : 3 } };
	let target = {};
	let output = helpers.ObjectHelpers.merge(false, target, param);
	param.a = 10; // modify source
	param.b.c = 30;
	expect(output).toEqual({ a : 1, b : { c : 30 } });
});

test('helpers.shallowCopy-positive-shallow', () => {
	let param = { a : 1, b : { c : 3 } };
	let output = helpers.ObjectHelpers.shallowCopy(param);
	param.a = 10; // modify source
	param.b.c = 30;
	expect(output).toEqual({ a : 1, b : { c : 30 } });
});

// test('helpers.parseJsonFileStripComments-positive', () => {
// 	let param = { a : 1};
// 	let output = helpers.parseJsonFileStripComments(param);
// 	expect(output).toEqual(true);
// });

// test('helpers.parseConfig-positive', () => {
// 	let param = { a : 1};
// 	let output = helpers.parseConfig(param);
// 	expect(output).toEqual(true);
// });

test('helpers.hexc-positive', () => {
	let param = 'rgb(10,11,12)';
	let output = helpers.hexc(param);
	expect(output).toEqual('#0a0b0c');
});

test('helpers.jsonify-compact-positive', () => {
	let param = { a : 1, b : { c : 3 } };
	let output = helpers.jsonify(param, true);
	expect(output).toEqual('{"a":1,"b":{"c":3}}');
});
test('helpers.jsonify-notcompact-positive', () => {
	let param = { a : 1, b : { c : 3 } };
	let output = helpers.jsonify(param);
	// expect(output.replace(/[\t\s]/g, '')).toEqual('{"a":1,"b":{"c":3}}');
	expect(output).toEqual("{\n  \"a\": 1,\n  \"b\": {\n    \"c\": 3\n  }\n}");
});

test('helpers.parse-positive', () => {
	let param = "{\n  \"a\": 1,\n  \"b\": {\n    \"c\": 3\n  }\n}";
	let output = helpers.parse(param);
	expect(output).toEqual({ a : 1, b : { c : 3 } });
});

test('helpers.stringifyOnce-positive', () => {
	let param = { a:1, b:2, c: { ca:11 }}
	let output = helpers.stringifyOnce(param, (k, v)=>k == 'b' ? v*20 : v, 0);
	expect(output).toEqual('{"a":1,"b":40,"c":{"ca":11}}');
});

test('helpers.getMatch-positive', () => {
	let output = helpers.getMatch('aaBB33', /\w+?([A-Z]+?)(\d+)/);
	expect(output[0]).toEqual('BB');
});
test('helpers.getMatch-positive-2', () => {
	let output = helpers.getMatch('aaBB33', /\w+?([A-Z]+?)(\d+)/, 2);
	expect(output[0]).toEqual('33');
});

test('helpers.getMatches-positive', () => {
	let output = helpers.getMatches('aaBB33', /\w+?(?<test>[A-Z]+?)(\d+)/);
	expect(output[0][1]).toEqual('BB');
	expect(output[0][2]).toEqual('33');
	expect(output[0].groups.test).toEqual('BB');
});
test('helpers.getMatches-positive-index', () => {
	let output = helpers.getMatches('aaBB33', /\w+?(?<test>[A-Z]+?)(\d+)/, 2);
	expect(output[0]).toEqual('33');
});
test('helpers.getMatches-positive-groupName', () => {
	let output = helpers.getMatches('aaBB33', /\w+?(?<test>[A-Z]+?)(\d+)/, 'test');
	expect(output[0]).toEqual('BB');
});
test('helpers.getMatches-positive-groups', () => {
	let output = helpers.getMatches('aaBB33', /\w+?(?<test>[A-Z]+?)(\d+)/, true);
	expect(output[0].test).toEqual('BB');
});

test('helpers.getCustomProperties-positive', () => {
	let param = { a : 1};
	let output = helpers.ObjectHelpers.getCustomProperties(param);
	expect(output).toEqual(['a']);
});
test('helpers.getCustomProperties-negative', () => {
	let param = { a : 1};
	let output = helpers.ObjectHelpers.getCustomProperties(param);
	expect(output).not.toContain('toString');
});

test('helpers.isNull-positive', () => {
	let param = null;
	let output = helpers.ObjectHelpers.isNull(param);
	expect(output).toEqual(true);
});
test('helpers.isNull-negative', () => {
	let param = {a:1};
	let output = helpers.ObjectHelpers.isNull(param);
	expect(output).toEqual(false);
});

test('helpers.isEmptyObject-positive', () => {
	let param = { };
	let output = helpers.ObjectHelpers.isEmptyObject(param);
	expect(output).toEqual(true);
});
test('helpers.isEmptyObject-negative', () => {
	let param = { a : 1 };
	let output = helpers.ObjectHelpers.isEmptyObject(param);
	expect(output).toEqual(false);
});

test('helpers.isEmptyString-positive', () => {
	let param = "";
	let output = helpers.ObjectHelpers.isEmptyString(param);
	expect(output).toEqual(true);
});
test('helpers.isEmptyString-negative', () => {
	let param = "{ a : 1 }";
	let output = helpers.ObjectHelpers.isEmptyString(param);
	expect(output).toEqual(false);
});

test('helpers.isEmpty-positive', () => {
	let param = { };
	let output = helpers.ObjectHelpers.isEmpty(param);
	expect(output).toEqual(true);
});

test('helpers.makeEmpty-positive', () => {
	let param = { a : 1};
	let output = helpers.ObjectHelpers.makeEmpty(param);
	expect(output).toEqual({ a : "" });
});
test('helpers.makeEmpty-positive-withNull', () => {
	let param = { a : 1, b: null};
	let output = helpers.ObjectHelpers.makeEmpty(param);
	expect(output).toEqual({ a : "", b: null });
});

test('helpers.base64ToUint8Array-positive', () => {
	let param = 'YWJj';
	let output = helpers.base64ToUint8Array(param);
	expect(output.toString()).toEqual("97,98,99");
});

// test('helpers.jsonRecurse-positive', () => {
// 	let param = { a : 1};
// 	let output = helpers.jsonRecurse(param);
// 	expect(output).toEqual(true);
// });

// test('helpers.jsonResolveReferences-positive', () => {
// 	let param = { a : 1};
// 	let output = helpers.jsonResolveReferences(param);
// 	expect(output).toEqual(true);
// });

test('helpers.getParamNames-positive-arrow', () => {
	let param = (a)=>{};
	let output = helpers.getParamNames(param);
	expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-function', () => {
	let param = function (a) { };
	let output = helpers.getParamNames(param);
	expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-async', () => {
	let param = async(a)=>{};
	let output = helpers.getParamNames(param);
	expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-asyncWithSpace', () => {
	let param = async (a)=>{};
	let output = helpers.getParamNames(param);
	expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-asyncWithSpace', () => {
	let namedFunc = async (a)=>{};
	let param = namedFunc;
	let output = helpers.getParamNames(param);
	expect(output).toEqual(['a']);
});

test('helpers.randomNumber-positive', () => {
	let output = helpers.randomNumber(100, 50);
	expect(output).not.toBeNaN();
	expect(output).toBeLessThanOrEqual(100);
	expect(output).toBeGreaterThanOrEqual(50);
});

test('helpers.shuffle-positive', () => {
	let param = [1,2,3,4,5];
	let output = helpers.shuffle(param);
	expect(output.length).toEqual(5);
	expect(output).not.toEqual(param);
});

test('helpers.measure-positive', async () => {
	helpers.measure('test');
	await helpers.delay(100);
	let output = helpers.measure('test');
	await helpers.delay(100);
	expect(output).toBeLessThanOrEqual(150);
	output = helpers.measure('test');
	expect(output).toBeLessThanOrEqual(250);
});

test('helpers.getMeasure-positive', async () => {
	helpers.measure('test2');
	await helpers.delay(100);
	let output = helpers.getMeasure('test2');
	expect(output).toBeLessThanOrEqual(120);
});

test('helpers.getDeep-positive', async () => {
	let param = { a: { b: { c: 2 } }};
	let output = helpers.ObjectHelpers.getDeep(param, 'a/b/c');
	expect(output).toEqual(2);
});
test('helpers.getDeep-positive-slashAtStart', async () => {
	let param = { a: { b: { c: 2 } }};
	let output = helpers.ObjectHelpers.getDeep(param, '/a/b/c');
	expect(output).toEqual(2);
});

// test('helpers.-positive', () => {
// 	let param = { a : 1};
// 	let output = helpers.(param);
// 	expect(output).toEqual(true);
// });

