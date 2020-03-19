var dataset: any = {

 }

beforeAll(()=> {
})

// [[[[[[[[[[  Helper Extensions  ]]]]]]]]]]
// TODO: isWindow, arrayBufferToBuffer, bufferToArrayBuffer, getProjectConfig, DependencyInjector, jsonRecurse, jsonResolveReferences

test('helpers.spawnHierarchy-positive', () => {
	let param = 'a.b.c';
	let output = libx.spawnHierarchy(param);
	expect(output).toEqual({ a: { b: { c: {} } }});
});

test('helpers.diff-positive', () => {
	let param = { a: 1, b: 2 , c: { ca: 11, cb: 22 }, empty: {}};
	let output = libx.diff(param, { a: 1, c: { cb:22 } });
	expect(output).toEqual({ b: 2, c: { ca: 11 }, empty: {}});
});
test('helpers.diff-skipEmpty-positive', () => {
	let param = { a: 1, b: 2 , c: { ca: 11, cb: 22 }, empty: {} };
	let output = libx.diff(param, { a: 1, c: { cb:22 } }, true);
	expect(output).toEqual({ b: 2, c: { ca: 11 }});
});
test('helpers.diff-skipEmpty-negative', () => {
	let param = { a: 1, b: 2 , c: { ca: 11, cb: 22 }, empty: {} };
	let output = libx.diff(param, { a: 1, c: { cb:22 } }, false);
	expect(output).toEqual({ b: 2, c: { ca: 11 }, empty: {} });
});

test('helpers.isObject-positive', () => {
	let param = {};
	let output = libx.isObject(param);
	expect(output).toEqual(true);
});

test('helpers.isObject-negative', () => {
	let param = 'not an object';
	let output = libx.isObject(param);
	expect(output).toEqual(false);
});

test('helpers.isFunction-positive', () => {
	let param = () => { console.log('isFunction') };
	let output = libx.isFunction(param);
	expect(output).toEqual(true);
});

test('helpers.isArray-positive', () => {
	let param = [ 1 ];
	let output = libx.isArray(param);
	expect(output).toEqual(true);
});

test('helpers.isWindow-positive', () => {
	let param = [ 1 ];
	let output = libx.isArray(param);
	expect(output).toEqual(true);
});

// test('helpers.bufferToArrayBuffer-positive', () => {
// 	let param = libx.Buffer.from('abc');
// 	let output = libx.isArray(param);
// 	expect(output).toEqual(true);
// });

// test('helpers.arrayBufferToBuffer-positive', () => {
// 	let param = libx.Buffer.from('abc');
// 	let output = libx.isArray(param);
// 	expect(output).toEqual(true);
// });

test('helpers.isWindow-positive', () => {
	let param = global;
	let output = libx.isWindow(param);
	expect(output).toEqual(true);
});

test('helpers.isNumeric-positive', () => {
	let param = 123;
	let output = libx.isNumeric(param);
	expect(output).toEqual(true);
});

test('helpers.type-positive', () => {
	expect(libx.type(1)).toEqual('number');
	expect(libx.type('0')).toEqual('string');
	expect(libx.type(true)).toEqual('boolean');
	expect(libx.type(new Date())).toEqual('date');
	expect(libx.type(/123/g)).toEqual('regexp');
	expect(libx.type(new RegExp(/2/g))).toEqual('regexp');
	expect(libx.type({ a: 1 })).toEqual('object');
	expect(libx.type(()=>{})).toEqual('function');
});

test('helpers.isPlainObject-positive', () => {
	let param = { a : 1};
	let output = libx.isPlainObject(param);
	expect(output).toEqual(true);
});

test('helpers.throttle-positive', async () => {
	let track = [];
	let counter = 0;
	let throttle = 50;
	let func = libx.throttle(()=>{
		track.push(counter++)
	}, throttle, true);
	let tickEachMs = 10;
	let ticksToCount = 10;
	let interval = setInterval(func, tickEachMs);
	let p = libx.newPromise();
	setTimeout(()=>{ // stop after a while
		clearInterval(interval); // stop ticking
		p.resolve(tickEachMs * ticksToCount / throttle); // expect calls to be interval / throttle
	}, tickEachMs * ticksToCount)

	let expected = await p;
	expect(track.length).toEqual(expected);
	expect(track.length).toEqual(counter);
});

test('helpers.debounce-positive', async () => {
	let track = [];
	let counter = 0;
	let debounce = 50;
	let func = libx.debounce(()=>{
		track.push(counter++)
	}, debounce);
	let tickEachMs = 10;
	let ticksToCount = 10;
	let interval = setInterval(func, tickEachMs);
	let p = libx.newPromise();
	setTimeout(()=>{ // stop after a while
		clearInterval(interval); // stop ticking

		setTimeout(()=>{ // let debounce period pass and expect 1 call
			p.resolve();
		}, debounce);
	}, tickEachMs * ticksToCount)

	await p;
	expect(track.length).toEqual(1);
});

test('helpers.newGuid-positive', () => {
	let guid = libx.newGuid(true);
	expect(guid.replace(/[\d\w]/g, '')).toEqual('----');
});

test('helpers.newPromise-positive', () => {
	let p = libx.newPromise();
	p.resolve(true);
	expect(p).resolves.toEqual(true);
});

test('helpers.async-positive', async () => {
	let counter = 0
	let p = libx.async((promise)=>{
		counter = 1;
		promise.resolve();
	});
	await p;
	expect(counter).toEqual(1);
});

test('helpers.chainTasks-positive', async () => {
	let counter = 0
	let tasks = [async ()=>counter=1, async ()=>counter=2];
	await libx.chainTasks(tasks);
	expect(counter).toEqual(2);
});

test('helpers.isDefined-positive', () => {
	let param = { a : 1};
	let output = libx.isDefined(param, 'a');
	expect(output).toEqual(true);
});

test('helpers.clone-positive', () => {
	let param = { a : 1};
	let target = { b : 2 };
	let output = libx.clone(param, target);
	param.a = 10; // modify source
	expect(output).toEqual({ a:1, b:2 });
});
test('helpers.clone-positive-2', () => {
	let param = { a : 1};
	let target = {};
	let output = libx.clone(param, target);
	param.a = 10; // modify source
	expect(output).toEqual({ a:1 });
});

test('helpers.extend-positive-deep', () => {
	let param = { a : 1, b : { c : 3 } };
	let target = {};
	let output = libx.extend(true, target, param);
	param.a = 10; // modify source
	param.b.c = 30;
	expect(output).toEqual({ a : 1, b : { c : 3 } });
});
test('helpers.extend-positive-deep-2', () => {
	let param = { a : 1, b : { c : 3 } };
	let target = {};
	let output = libx.extend(target, param);
	param.a = 10; // modify source
	param.b.c = 30;
	expect(output).toEqual({ a : 1, b : { c : 3 } });
});
test('helpers.extend-positive-shallow', () => {
	let param = { a : 1, b : { c : 3 } };
	let target = {};
	let output = libx.extend(false, target, param);
	param.a = 10; // modify source
	param.b.c = 30;
	expect(output).toEqual({ a : 1, b : { c : 30 } });
});

test('helpers.shallowCopy-positive-shallow', () => {
	let param = { a : 1, b : { c : 3 } };
	let output = libx.shallowCopy(param);
	param.a = 10; // modify source
	param.b.c = 30;
	expect(output).toEqual({ a : 1, b : { c : 30 } });
});

// test('helpers.parseJsonFileStripComments-positive', () => {
// 	let param = { a : 1};
// 	let output = libx.parseJsonFileStripComments(param);
// 	expect(output).toEqual(true);
// });

// test('helpers.parseConfig-positive', () => {
// 	let param = { a : 1};
// 	let output = libx.parseConfig(param);
// 	expect(output).toEqual(true);
// });

test('helpers.hexc-positive', () => {
	let param = 'rgb(10,11,12)';
	let output = libx.hexc(param);
	expect(output).toEqual('#0a0b0c');
});

test('helpers.jsonify-compact-positive', () => {
	let param = { a : 1, b : { c : 3 } };
	let output = libx.jsonify(param, true);
	expect(output).toEqual('{"a":1,"b":{"c":3}}');
});
test('helpers.jsonify-notcompact-positive', () => {
	let param = { a : 1, b : { c : 3 } };
	let output = libx.jsonify(param);
	// expect(output.replace(/[\t\s]/g, '')).toEqual('{"a":1,"b":{"c":3}}');
	expect(output).toEqual("{\n  \"a\": 1,\n  \"b\": {\n    \"c\": 3\n  }\n}");
});

test('helpers.parse-positive', () => {
	let param = "{\n  \"a\": 1,\n  \"b\": {\n    \"c\": 3\n  }\n}";
	let output = libx.parse(param);
	expect(output).toEqual({ a : 1, b : { c : 3 } });
});

test('helpers.sleep-positive', async () => {
	let start = new Date();
	let output = await libx.sleep(100);
	let end = new Date();
	expect(end.getTime() - start.getTime()).toBeLessThanOrEqual(200);
});

test('helpers.delay-positive', async () => {
	let p2 = libx.newPromise();
	p2.reject();
	p2.catch(()=>{
		console.log('p2')
	})
	let start = new Date();
	let p = libx.delay(100);
	await p;
	let end = new Date();
	expect(end.getTime()-start.getTime()).toBeLessThanOrEqual(150);
});

test('helpers.waitUntil-positive', async () => {
	let counter = 0;
	let interval = setInterval(()=>counter++, 10);
	await libx.waitUntil(()=>{
		return counter == 10;
	}, ()=> {
		clearInterval(interval);
	}, 10);
	expect(counter).toBeLessThanOrEqual(11);
});
test('helpers.waitUntil-negative', async () => {
	let counter = 0;
	let interval = setInterval(()=>counter++, 10);
	await libx.waitUntil(()=>counter == 10, ()=> {
		clearInterval(interval);
	}, 10, 50)
	.catch(()=>{ // expect period to pass
		expect(counter).toBeLessThanOrEqual(6);
	});
});

test('helpers.makeAsync-positive', async () => {
	let track = false;
	let param = ()=>track=true;
	let wrapper = libx.makeAsync(param);
	await wrapper();
	expect(track).toEqual(true);
});
test('helpers.makeAsync-positive-2', async () => {
	let track = false;
	let param = async ()=>track=true;
	let wrapper = libx.makeAsync(param);
	await wrapper();
	expect(track).toEqual(true);
});

test('helpers.isAsync-positive', () => {
	let param = async ()=>true;
	let output = libx.isAsync(param);
	expect(output).toEqual(true);
});
test('helpers.isAsync-negative', () => {
	let param = ()=>true;
	let output = libx.isAsync(param);
	expect(output).toEqual(false);
});

test('helpers.stringifyOnce-positive', () => {
	let param = { a:1, b:2, c: { ca:11 }}
	let output = libx.stringifyOnce(param, (k, v)=>k == 'b' ? v*20 : v, 0);
	expect(output).toEqual('{"a":1,"b":40,"c":{"ca":11}}');
});

test('helpers.getMatch-positive', () => {
	let output = libx.getMatch('aaBB33', /\w+?([A-Z]+?)(\d+)/);
	expect(output[0]).toEqual('BB');
});
test('helpers.getMatch-positive-2', () => {
	let output = libx.getMatch('aaBB33', /\w+?([A-Z]+?)(\d+)/, 2);
	expect(output[0]).toEqual('33');
});

test('helpers.getMatches-positive', () => {
	let output = libx.getMatches('aaBB33', /\w+?(?<test>[A-Z]+?)(\d+)/);
	expect(output[0][1]).toEqual('BB');
	expect(output[0][2]).toEqual('33');
	expect(output[0].groups.test).toEqual('BB');
});
test('helpers.getMatches-positive-index', () => {
	let output = libx.getMatches('aaBB33', /\w+?(?<test>[A-Z]+?)(\d+)/, 2);
	expect(output[0]).toEqual('33');
});
test('helpers.getMatches-positive-groupName', () => {
	let output = libx.getMatches('aaBB33', /\w+?(?<test>[A-Z]+?)(\d+)/, 'test');
	expect(output[0]).toEqual('BB');
});
test('helpers.getMatches-positive-groups', () => {
	let output = libx.getMatches('aaBB33', /\w+?(?<test>[A-Z]+?)(\d+)/, true);
	expect(output[0].test).toEqual('BB');
});

test('helpers.getCustomProperties-positive', () => {
	let param = { a : 1};
	let output = libx.getCustomProperties(param);
	expect(output).toEqual(['a']);
});
test('helpers.getCustomProperties-negative', () => {
	let param = { a : 1};
	let output = libx.getCustomProperties(param);
	expect(output).not.toContain('toString');
});

test('helpers.isNull-positive', () => {
	let param = null;
	let output = libx.isNull(param);
	expect(output).toEqual(true);
});
test('helpers.isNull-negative', () => {
	let param = {a:1};
	let output = libx.isNull(param);
	expect(output).toEqual(false);
});

test('helpers.isEmptyObject-positive', () => {
	let param = { };
	let output = libx.isEmptyObject(param);
	expect(output).toEqual(true);
});
test('helpers.isEmptyObject-negative', () => {
	let param = { a : 1 };
	let output = libx.isEmptyObject(param);
	expect(output).toEqual(false);
});

test('helpers.isEmptyString-positive', () => {
	let param = "";
	let output = libx.isEmptyString(param);
	expect(output).toEqual(true);
});
test('helpers.isEmptyString-negative', () => {
	let param = "{ a : 1 }";
	let output = libx.isEmptyString(param);
	expect(output).toEqual(false);
});

test('helpers.isEmpty-positive', () => {
	let param = { };
	let output = libx.isEmpty(param);
	expect(output).toEqual(true);
});

test('helpers.makeEmpty-positive', () => {
	let param = { a : 1};
	let output = libx.makeEmpty(param);
	expect(output).toEqual({ a : "" });
});
test('helpers.makeEmpty-positive-withNull', () => {
	let param = { a : 1, b: null};
	let output = libx.makeEmpty(param);
	expect(output).toEqual({ a : "", b: null });
});

test('helpers.base64ToUint8Array-positive', () => {
	let param = 'YWJj';
	let output = libx.base64ToUint8Array(param);
	expect(output.toString()).toEqual("97,98,99");
});

// test('helpers.jsonRecurse-positive', () => {
// 	let param = { a : 1};
// 	let output = libx.jsonRecurse(param);
// 	expect(output).toEqual(true);
// });

// test('helpers.jsonResolveReferences-positive', () => {
// 	let param = { a : 1};
// 	let output = libx.jsonResolveReferences(param);
// 	expect(output).toEqual(true);
// });

test('helpers.getParamNames-positive-arrow', () => {
	let param = (a)=>{};
	let output = libx.getParamNames(param);
	expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-function', () => {
	let param = function (a) { };
	let output = libx.getParamNames(param);
	expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-async', () => {
	let param = async(a)=>{};
	let output = libx.getParamNames(param);
	expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-asyncWithSpace', () => {
	let param = async (a)=>{};
	let output = libx.getParamNames(param);
	expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-asyncWithSpace', () => {
	let namedFunc = async (a)=>{};
	let param = namedFunc;
	let output = libx.getParamNames(param);
	expect(output).toEqual(['a']);
});

test('helpers.randomNumber-positive', () => {
	let output = libx.randomNumber(100, 50);
	expect(output).not.toBeNaN();
	expect(output).toBeLessThanOrEqual(100);
	expect(output).toBeGreaterThanOrEqual(50);
});

test('helpers.shuffle-positive', () => {
	let param = [1,2,3,4,5];
	let output = libx.shuffle(param);
	expect(output.length).toEqual(5);
	expect(output).not.toEqual(param);
});

test('helpers.measure-positive', async () => {
	libx.measure('test');
	await libx.delay(100);
	let output = libx.measure('test');
	await libx.delay(100);
	expect(output).toBeLessThanOrEqual(150);
	output = libx.measure('test');
	expect(output).toBeLessThanOrEqual(250);
});

test('helpers.getMeasure-positive', async () => {
	libx.measure('test2');
	await libx.delay(100);
	let output = libx.getMeasure('test2');
	expect(output).toBeLessThanOrEqual(120);
});

test('helpers.getDeep-positive', async () => {
	let param = { a: { b: { c: 2 } }};
	let output = libx.getDeep(param, 'a/b/c');
	expect(output).toEqual(2);
});
test('helpers.getDeep-positive-slashAtStart', async () => {
	let param = { a: { b: { c: 2 } }};
	let output = libx.getDeep(param, '/a/b/c');
	expect(output).toEqual(2);
});

// test('helpers.-positive', () => {
// 	let param = { a : 1};
// 	let output = libx.(param);
// 	expect(output).toEqual(true);
// });

