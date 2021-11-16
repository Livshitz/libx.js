import { helpers } from '../../src/helpers';

var dataset: any = {};

beforeAll(() => {});

// [[[[[[[[[[  Helper Extensions  ]]]]]]]]]]
// TODO: isWindow, arrayBufferToBuffer, bufferToArrayBuffer, getProjectConfig, DependencyInjector, jsonRecurse, jsonResolveReferences

test('helpers.newGuid-positive', () => {
    let guid = helpers.newGuid(true);
    expect(guid.replace(/[\d\w]/g, '')).toEqual('----');
});

test('helpers.newPromise-positive', () => {
    let p = helpers.newPromise();
    p.resolve(true);
    expect(p).resolves.toEqual(true);
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
    let param = { a: 1, b: { c: 3 } };
    let output = helpers.jsonify(param, true);
    expect(output).toEqual('{"a":1,"b":{"c":3}}');
});
test('helpers.jsonify-notcompact-positive', () => {
    let param = { a: 1, b: { c: 3 } };
    let output = helpers.jsonify(param);
    // expect(output.replace(/[\t\s]/g, '')).toEqual('{"a":1,"b":{"c":3}}');
    expect(output).toEqual('{\n  "a": 1,\n  "b": {\n    "c": 3\n  }\n}');
});

test('helpers.parse-positive', () => {
    let param = '{\n  "a": 1,\n  "b": {\n    "c": 3\n  }\n}';
    let output = helpers.parse(param);
    expect(output).toEqual({ a: 1, b: { c: 3 } });
});

test('helpers.stringifyOnce-positive', () => {
    let param = { a: 1, b: 2, c: { ca: 11 } };
    let output = helpers.stringifyOnce(param, (k, v) => (k == 'b' ? v * 20 : v), 0);
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

test('helpers.base64ToUint8Array-positive', () => {
    let param = 'YWJj';
    let output = helpers.base64ToUint8Array(param);
    expect(output.toString()).toEqual('97,98,99');
});

test('helpers.getParamNames-positive-arrow', () => {
    let param = (a) => {};
    let output = helpers.getParamNames(param);
    expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-function', () => {
    let param = function (a) {};
    let output = helpers.getParamNames(param);
    expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-async', () => {
    let param = async (a) => {};
    let output = helpers.getParamNames(param);
    expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-asyncWithSpace', () => {
    let param = async (a) => {};
    let output = helpers.getParamNames(param);
    expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-asyncWithSpace', () => {
    let namedFunc = async (a) => {};
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
    let param = [1, 2, 3, 4, 5];
    let output = helpers.shuffle(param);
    expect(output.length).toEqual(5);
    expect(output).not.toEqual(param);
});

test('helpers.measure-positive', async () => {
    helpers.measure('test');
    await helpers.delay(100);
    let output = helpers.measure('test');
    await helpers.delay(100);
    expect(output).toBeLessThanOrEqual(200);
    output = helpers.measure('test');
    expect(output).toBeLessThanOrEqual(250);
});

test('helpers.getMeasure-positive', async () => {
    helpers.measure('test2');
    await helpers.delay(100);
    let output = helpers.getMeasure('test2');
    expect(output).toBeLessThanOrEqual(120);
});

test('helpers.bufferToArrayBuffer-positive', async () => {
    let param = Buffer.from('abc');
    let output = helpers.bufferToArrayBuffer(param);
    expect(output.byteLength).toEqual(3);
});
test('helpers.arrayBufferToBuffer-positive', async () => {
    let param = helpers.bufferToArrayBuffer(Buffer.from('abc'));
    let output = helpers.arrayBufferToBuffer(param);
    expect(output.toString()).toEqual('abc');
});

test('helpers.parseJsonFileStripComments-positive', async () => {
    let param = `{ 
		"a": 111,
		"b": 222
		// "c": 333,
	}`;
    let output = helpers.parseJsonFileStripComments(param);
    expect(output).toEqual({ a: 111, b: 222 });
});

test('helpers.parseConfig-positive', async () => {
    let param = `{  
		"myEnvVars": {
			"ShareVar": 123,
			"replaceAble": "--{{myPrivateVar}}--"
		},
		"private": {
			"myPrivateVar": 999
		},
		
		"envs": {
			"dev": {
				"isDebug": true,
				"myEnvVars": {
					"perEnvVar": "dev"
				}
			},
			"prod": {
				"isDebug": false,
				"myEnvVars": {
					"perEnvVar": "prod"
				}
			}
		}
	}`;
    let output = helpers.parseConfig(param, 'dev');
    expect(output).toEqual({
        myEnvVars: {
            ShareVar: 123,
            perEnvVar: 'dev',
            replaceAble: '--999--',
        },
        isDebug: true,
        private: {
            myPrivateVar: 999,
        },
    });
});

test('helpers.getObjectByPath-positive', () => {
    let param = { a: { b: 1 } };
    let output = helpers.getObjectByPath('a.b', param);
    expect(output).toEqual(1);
});

test('helpers.keys-positive', () => {
    let param = { a: 1 };
    let output = helpers.keys(param);
    expect(output).toEqual(['a']);
});

test('helpers.values-positive', () => {
    let param = { a: 1 };
    let output = helpers.values(param);
    expect(output).toEqual([1]);
});

enum myEnum {
    A,
    B,
}

test('helpers.enumToArray-positive', () => {
    let output = helpers.enumToArray(myEnum);
    expect(output).toEqual(['A', 'B']);
});

test('helpers.formatify', () => {
    let output = helpers.formatify(
        {
            myField: '{{toBeReplaced}}',
            myField2: 'notToBeReplaced',
        },
        {
            toBeReplaced: 111,
            notToBeReplaced: 222,
        }
    );
    expect(output).toEqual({
        myField: '111',
        myField2: 'notToBeReplaced',
    });
});

// test('helpers.-positive', () => {
// 	let param = { a: 1 };
// 	let output = helpers.(param);
// 	expect(output).toEqual(true);
// });
