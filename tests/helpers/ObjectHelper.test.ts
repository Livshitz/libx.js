import {} from 'module';
import { ObjectHelpers } from '../../src/helpers/ObjectHelpers';

beforeEach(() => {});

test('isString-positive', () => {
    expect(ObjectHelpers.isString('abc')).toEqual(true);
    expect(ObjectHelpers.isString(`abc`)).toEqual(true);
    expect(ObjectHelpers.isString(`1`)).toEqual(true);
    expect(ObjectHelpers.isString(123)).toEqual(false);
    expect(ObjectHelpers.isString({ a: 'aaa' })).toEqual(false);
    expect(ObjectHelpers.isString({})).toEqual(false);
    expect(ObjectHelpers.isString(true)).toEqual(false);
});
test('diff-positive', () => {
    let param = { a: 1, b: 2, c: { ca: 11, cb: 22 }, empty: {} };
    let output = ObjectHelpers.diff(param, { a: 1, c: { cb: 22 } });
    expect(output).toEqual({ b: 2, c: { ca: 11 }, empty: {} });
});
test('diff-skipEmpty-positive', () => {
    let param = { a: 1, b: 2, c: { ca: 11, cb: 22 }, empty: {} };
    let output = ObjectHelpers.diff(param, { a: 1, c: { cb: 22 } }, true);
    expect(output).toEqual({ b: 2, c: { ca: 11 } });
});
test('diff-skipEmpty-negative', () => {
    let param = { a: 1, b: 2, c: { ca: 11, cb: 22 }, empty: {} };
    let output = ObjectHelpers.diff(param, { a: 1, c: { cb: 22 } }, false);
    expect(output).toEqual({ b: 2, c: { ca: 11 }, empty: {} });
});

test('isObject-positive', () => {
    let param = {};
    let output = ObjectHelpers.isObject(param);
    expect(output).toEqual(true);
});

test('isObject-negative', () => {
    let param = 'not an object';
    let output = ObjectHelpers.isObject(param);
    expect(output).toEqual(false);
});

test('isFunction-positive', () => {
    let param = () => {
        console.log('isFunction');
    };
    let output = ObjectHelpers.isFunction(param);
    expect(output).toEqual(true);
});

test('isArray-positive', () => {
    let param = [1];
    let output = ObjectHelpers.isArray(param);
    expect(output).toEqual(true);
});

// test('bufferToArrayBuffer-positive', () => {
// 	let param = ObjectHelpers.Buffer.from('abc');
// 	let output = ObjectHelpers.isArray(param);
// 	expect(output).toEqual(true);
// });

// test('arrayBufferToBuffer-positive', () => {
// 	let param = Buffer.from('abc');
// 	let output = ObjectHelpers.isArray(param);
// 	expect(output).toEqual(true);
// });

test('isWindow-positive', () => {
    let param = global;
    let output = ObjectHelpers.isWindow(param);
    expect(output).toEqual(true);
});

test('isNumeric-positive', () => {
    let param = 123;
    let output = ObjectHelpers.isNumeric(param);
    expect(output).toEqual(true);
});

test('type-positive', () => {
    expect(ObjectHelpers.type(1)).toEqual('number');
    expect(ObjectHelpers.type('0')).toEqual('string');
    expect(ObjectHelpers.type(true)).toEqual('boolean');
    expect(ObjectHelpers.type(new Date())).toEqual('date');
    expect(ObjectHelpers.type(/123/g)).toEqual('regexp');
    expect(ObjectHelpers.type(new RegExp(/2/g))).toEqual('regexp');
    expect(ObjectHelpers.type({ a: 1 })).toEqual('object');
    expect(ObjectHelpers.type(() => {})).toEqual('function');
});

test('isPlainObject-positive', () => {
    let param = { a: 1 };
    let output = ObjectHelpers.isPlainObject(param);
    expect(output).toEqual(true);
});

test('isDefined-positive', () => {
    let param = { a: 1 };
    let output = ObjectHelpers.isDefined(param, 'a');
    expect(output).toEqual(true);
});

test('clone-positive', () => {
    let param = { a: 1 };
    let target = { b: 2 };
    let output = ObjectHelpers.clone(param, target);
    param.a = 10; // modify source
    expect(output).toEqual({ a: 1, b: 2 });
});
test('clone-positive-2', () => {
    let param = { a: 1 };
    let target = {};
    let output = ObjectHelpers.clone(param, target);
    param.a = 10; // modify source
    expect(output).toEqual({ a: 1 });
});

test('extend-positive-deep', () => {
    let param = { a: 1, b: { c: 3 } };
    let target = {};
    let output = ObjectHelpers.merge(true, target, param);
    param.a = 10; // modify source
    param.b.c = 30;
    expect(output).toEqual({ a: 1, b: { c: 3 } });
});
test('extend-positive-deep-2', () => {
    let param = { a: 1, b: { c: 3 } };
    let target = {};
    let output = ObjectHelpers.merge(target, param);
    param.a = 10; // modify source
    param.b.c = 30;
    expect(output).toEqual({ a: 1, b: { c: 3 } });
});
test('extend-positive-shallow', () => {
    let param = { a: 1, b: { c: 3 } };
    let target = {};
    let output = ObjectHelpers.merge(false, target, param);
    param.a = 10; // modify source
    param.b.c = 30;
    expect(output).toEqual({ a: 1, b: { c: 30 } });
});

test('shallowCopy-positive-shallow', () => {
    let param = { a: 1, b: { c: 3 } };
    let output = ObjectHelpers.shallowCopy(param);
    param.a = 10; // modify source
    param.b.c = 30;
    expect(output).toEqual({ a: 1, b: { c: 30 } });
});

test('getCustomProperties-positive', () => {
    let param = { a: 1 };
    let output = ObjectHelpers.getCustomProperties(param);
    expect(output).toEqual(['a']);
});
test('getCustomProperties-negative', () => {
    let param = { a: 1 };
    let output = ObjectHelpers.getCustomProperties(param);
    expect(output).not.toContain('toString');
});

test('isNull-positive', () => {
    let param = null;
    let output = ObjectHelpers.isNull(param);
    expect(output).toEqual(true);
});
test('isNull-negative', () => {
    let param = { a: 1 };
    let output = ObjectHelpers.isNull(param);
    expect(output).toEqual(false);
});

test('isEmptyObject-positive', () => {
    let param = {};
    let output = ObjectHelpers.isEmptyObject(param);
    expect(output).toEqual(true);
});
test('isEmptyObject-negative', () => {
    let param = { a: 1 };
    let output = ObjectHelpers.isEmptyObject(param);
    expect(output).toEqual(false);
});

test('isEmptyString-positive', () => {
    let param = '';
    let output = ObjectHelpers.isEmptyString(param);
    expect(output).toEqual(true);
});
test('isEmptyString-negative', () => {
    let param = '{ a : 1 }';
    let output = ObjectHelpers.isEmptyString(param);
    expect(output).toEqual(false);
});

test('isEmpty-positive', () => {
    let param = {};
    let output = ObjectHelpers.isEmpty(param);
    expect(output).toEqual(true);
});

test('makeEmpty-positive', () => {
    let param = { a: 1 };
    let output = ObjectHelpers.makeEmpty(param);
    expect(output).toEqual({ a: '' });
});
test('makeEmpty-positive-withNull', () => {
    let param = { a: 1, b: null };
    let output = ObjectHelpers.makeEmpty(param);
    expect(output).toEqual({ a: '', b: null });
});

test('getDeep-positive', async () => {
    let param = { a: { b: { c: 2 } } };
    let output = ObjectHelpers.getDeep(param, 'a/b/c');
    expect(output).toEqual(2);
});
test('getDeep-positive-slashAtStart', async () => {
    let param = { a: { b: { c: 2 } } };
    let output = ObjectHelpers.getDeep(param, '/a/b/c');
    expect(output).toEqual(2);
});

// test('-positive', () => {
// 	let param = { a: 1 };
// 	let output = (param);
// 	expect(output).toEqual(true);
// });
