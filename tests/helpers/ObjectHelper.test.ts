import {} from 'module';
import { objectHelpers } from '../../src/helpers/ObjectHelpers';

beforeEach(() => {});

test('isString-positive', () => {
    expect(objectHelpers.isString('abc')).toEqual(true);
    expect(objectHelpers.isString(`abc`)).toEqual(true);
    expect(objectHelpers.isString(`1`)).toEqual(true);
    expect(objectHelpers.isString(123)).toEqual(false);
    expect(objectHelpers.isString({ a: 'aaa' })).toEqual(false);
    expect(objectHelpers.isString({})).toEqual(false);
    expect(objectHelpers.isString(true)).toEqual(false);
});
test('diff-positive', () => {
    let param = { a: 1, b: 2, c: { ca: 11, cb: 22 }, empty: {} };
    let output = objectHelpers.diff(param, { a: 1, c: { cb: 22 } });
    expect(output).toEqual({ b: 2, c: { ca: 11 }, empty: {} });
});
test('diff-skipEmpty-positive', () => {
    let param = { a: 1, b: 2, c: { ca: 11, cb: 22 }, empty: {} };
    let output = objectHelpers.diff(param, { a: 1, c: { cb: 22 } }, true);
    expect(output).toEqual({ b: 2, c: { ca: 11 } });
});
test('diff-skipEmpty-negative', () => {
    let param = { a: 1, b: 2, c: { ca: 11, cb: 22 }, empty: {} };
    let output = objectHelpers.diff(param, { a: 1, c: { cb: 22 } }, false);
    expect(output).toEqual({ b: 2, c: { ca: 11 }, empty: {} });
});
test('diff-dates-positive', () => {
    let param = { a: new Date('2022-02-28T20:47:27.366Z') };
    let output = objectHelpers.diff(param, { a: new Date() });
    expect(output).toEqual(param);
});

test('isObject-positive', () => {
    let param = {};
    let output = objectHelpers.isObject(param);
    expect(output).toEqual(true);
});

test('isObject-negative', () => {
    let param = 'not an object';
    let output = objectHelpers.isObject(param);
    expect(output).toEqual(false);
});

test('isObject-date', () => {
    let param = new Date();
    let output = objectHelpers.isObject(param);
    expect(output).toEqual(false);
});

test('isFunction-positive', () => {
    let param = () => {
        console.log('isFunction');
    };
    let output = objectHelpers.isFunction(param);
    expect(output).toEqual(true);
});

test('isArray-positive', () => {
    let param = [1];
    let output = objectHelpers.isArray(param);
    expect(output).toEqual(true);
});

// test('bufferToArrayBuffer-positive', () => {
// 	let param = objectHelpers.Buffer.from('abc');
// 	let output = objectHelpers.isArray(param);
// 	expect(output).toEqual(true);
// });

// test('arrayBufferToBuffer-positive', () => {
// 	let param = Buffer.from('abc');
// 	let output = objectHelpers.isArray(param);
// 	expect(output).toEqual(true);
// });

test('isWindow-positive', () => {
    let param = global;
    let output = objectHelpers.isWindow(param);
    expect(output).toEqual(true);
});

test('isNumeric-positive', () => {
    let param = 123;
    let output = objectHelpers.isNumeric(param);
    expect(output).toEqual(true);
});

test('type-positive', () => {
    expect(objectHelpers.type(1)).toEqual('number');
    expect(objectHelpers.type('0')).toEqual('string');
    expect(objectHelpers.type(true)).toEqual('boolean');
    expect(objectHelpers.type(new Date())).toEqual('date');
    expect(objectHelpers.type(/123/g)).toEqual('regexp');
    expect(objectHelpers.type(new RegExp(/2/g))).toEqual('regexp');
    expect(objectHelpers.type({ a: 1 })).toEqual('object');
    expect(objectHelpers.type(() => {})).toEqual('function');
});

test('isPlainObject-positive', () => {
    let param = { a: 1 };
    let output = objectHelpers.isPlainObject(param);
    expect(output).toEqual(true);
});

test('isDefined-positive', () => {
    let param = { a: 1 };
    let output = objectHelpers.isDefined(param, 'a');
    expect(output).toEqual(true);
});

test('clone-positive', () => {
    let param = { a: 1 };
    let target = { b: 2 };
    let output = objectHelpers.clone(param, target);
    param.a = 10; // modify source
    expect(output).toEqual({ a: 1, b: 2 });
});
test('clone-positive-2', () => {
    let param = { a: 1 };
    let target = {};
    let output = objectHelpers.clone(param, target);
    param.a = 10; // modify source
    expect(output).toEqual({ a: 1 });
});
test('clone-positive-symbbol', () => {
    const keySymbol = Symbol('a');
    const param = {};
    param[keySymbol] = 1;

    let output = objectHelpers.clone(param);
    param[keySymbol] = 10; // modify source
    expect(objectHelpers.isEmptyObject(output)).toEqual(false);
});

test('extend-positive-deep', () => {
    let param = { a: 1, b: { c: 3 } };
    let target = {};
    let output = objectHelpers.merge(true, target, param);
    param.a = 10; // modify source
    param.b.c = 30;
    expect(output).toEqual({ a: 1, b: { c: 3 } });
});
test('extend-positive-deep-2', () => {
    let param = { a: 1, b: { c: 3 } };
    let target = {};
    let output = objectHelpers.merge(target, param);
    param.a = 10; // modify source
    param.b.c = 30;
    expect(output).toEqual({ a: 1, b: { c: 3 } });
});
test('extend-positive-shallow', () => {
    let param = { a: 1, b: { c: 3 } };
    let target = {};
    let output = objectHelpers.merge(false, target, param);
    param.a = 10; // modify source
    param.b.c = 30;
    expect(output).toEqual({ a: 1, b: { c: 30 } });
});

test('shallowCopy-positive-shallow', () => {
    let param = { a: 1, b: { c: 3 } };
    let output = objectHelpers.shallowCopy(param);
    param.a = 10; // modify source
    param.b.c = 30;
    expect(output).toEqual({ a: 1, b: { c: 30 } });
});

test('getCustomProperties-positive', () => {
    let param = { a: 1 };
    let output = objectHelpers.getCustomProperties(param);
    expect(output).toEqual(['a']);
});
test('getCustomProperties-negative', () => {
    let param = { a: 1 };
    let output = objectHelpers.getCustomProperties(param);
    expect(output).not.toContain('toString');
});

test('isNull-positive', () => {
    let param = null;
    let output = objectHelpers.isNull(param);
    expect(output).toEqual(true);
});
test('isNull-negative', () => {
    let param = { a: 1 };
    let output = objectHelpers.isNull(param);
    expect(output).toEqual(false);
});

test('isEmptyObject-positive', () => {
    let param = {};
    let output = objectHelpers.isEmptyObject(param);
    expect(output).toEqual(true);
});
test('isEmptyObject-null', () => {
    let param = null;
    let output = objectHelpers.isEmptyObject(param);
    expect(output).toEqual(true);
});
test('isEmptyObject-negative', () => {
    let param = { a: 1 };
    let output = objectHelpers.isEmptyObject(param);
    expect(output).toEqual(false);
});

test('isEmptyString-positive', () => {
    let param = '';
    let output = objectHelpers.isEmptyString(param);
    expect(output).toEqual(true);
});
test('isEmptyString-negative', () => {
    let param = '{ a : 1 }';
    let output = objectHelpers.isEmptyString(param);
    expect(output).toEqual(false);
});

test('isEmpty-positive', () => {
    let param = {};
    let output = objectHelpers.isEmpty(param);
    expect(output).toEqual(true);
});

test('isDate-positive', () => {
    let param = new Date();
    let output = objectHelpers.isDate(param);
    expect(output).toEqual(true);

    let param2 = {};
    let output2 = objectHelpers.isDate(param2);
    expect(output2).toEqual(false);
});

test('makeEmpty-positive', () => {
    let param = { a: 1 };
    let output = objectHelpers.makeEmpty(param);
    expect(output).toEqual({ a: '' });
});
test('makeEmpty-positive-withNull', () => {
    let param = { a: 1, b: null };
    let output = objectHelpers.makeEmpty(param);
    expect(output).toEqual({ a: '', b: null });
});

test('getDeep-positive', async () => {
    let param = { a: { b: { c: 2 } } };
    let output = objectHelpers.getDeep(param, 'a/b/c');
    expect(output).toEqual(2);
});
test('getDeep-positive-slashAtStart', async () => {
    let param = { a: { b: { c: 2 } } };
    let output = objectHelpers.getDeep(param, '/a/b/c');
    expect(output).toEqual(2);
});

test('spawnHierarchy-positive', () => {
    let param = 'a.b.c';
    let output = objectHelpers.spawnHierarchy(param);
    expect(output).toEqual({ a: { b: { c: null } } });
});
test('spawnHierarchy-existinObj-positive', () => {
    let param = 'a.b.c';
    let obj = {
        a: {
            d: 4,
        },
    };
    let output = objectHelpers.spawnHierarchy(param, obj);
    expect(output).toEqual({ a: { b: { c: null }, d: 4 } });

    let output2 = objectHelpers.spawnHierarchy('a.b.e', obj);
    expect(output2).toEqual({ a: { b: { c: null, e: null }, d: 4 } });
});
test('spawnHierarchy-putValue-positive', () => {
    let param = 'a.b.c';
    let output = objectHelpers.spawnHierarchy(param, null, 111);
    expect(output).toEqual({ a: { b: { c: 111 } } });
});

test('objectToKeyValue-positive-simple', async () => {
    let param = { a: 1 };
    let output = objectHelpers.objectToKeyValue(param);
    expect(output).toEqual({
        a: 1,
    });
});
test('objectToKeyValue-positive-multiKey', async () => {
    let param = { a: { b: { c: 3, d: 4 } } };
    let output = objectHelpers.objectToKeyValue(param);
    expect(output).toEqual({
        'a/b/c': 3,
        'a/b/d': 4,
    });
});
test('objectToKeyValue-positive-complex', async () => {
    let param = {
        a: {
            b: {
                c: 3,
                d: 4,
            },
            e: {
                x1: 1,
                x2: 2,
            },
        },
        x: {
            bArray: [1, 2, 3],
        },
    };
    let output = objectHelpers.objectToKeyValue(param);
    expect(output).toEqual({
        'a/b/c': 3,
        'a/b/d': 4,
        'a/e/x1': 1,
        'a/e/x2': 2,
        'x/bArray': [1, 2, 3],
    });
});

test('keyValueToObject-positive-simple', async () => {
    let param = {
        'a/b/c': 3,
        'a/b/d': 4,
        'a/e/x1': 1,
        'a/e/x2': 2,
        'x/bArray': [1, 2, 3],
    };
    let output = objectHelpers.keyValueToObject(param);
    let expected = {
        a: {
            b: {
                c: 3,
                d: 4,
            },
            e: {
                x1: 1,
                x2: 2,
            },
        },
        x: {
            bArray: [1, 2, 3],
        },
    };
    expect(output).toEqual(expected);
});

test('keyValueToObject-positive-withSubObject', async () => {
    let param = {
        'a/b/c': 3,
        'a/e/x1': '{ "aaa": 123 }',
    };
    let output = objectHelpers.keyValueToObject(param, true);
    let expected = {
        a: {
            b: {
                c: 3,
            },
            e: {
                x1: { aaa: 123 },
            },
        },
    };
    expect(output).toEqual(expected);
});

test('getObjectHash-positive-simple', () => {
    let param = { a: 1 };
    let output = objectHelpers.getObjectHash(param);
    expect(output).toEqual('-1442153986');
});

test('getObjectHash-positive-null', () => {
    let param = null;
    let output = objectHelpers.getObjectHash(param);
    expect(output).toEqual('');
});

describe('other', () => {
    test('flatterObjectToDotNotation should convert object-notation to dot-notation', async () => {
        let q = {
            a: 1,
            b: {
                bb: 22,
                c: {
                    ccc: 333,
                },
            },
        };
        let res = objectHelpers.flatterObjectToDotNotation(q);
        expect(res).toEqual({
            a: 1,
            'b.bb': 22,
            'b.c.ccc': 333,
        });
    });

    // test('flatterObjectToDotNotation should not break ObjectId', async () => {
    //     let id = new ObjectID('5eee53e33f5881111e73efe5');
    //     let q = {
    //         a: 1,
    //         b: id,
    //     };
    //     let res = objectHelpers.flatterObjectToDotNotation(q);
    //     expect(res).toEqual({
    //         a: 1,
    //         b: id,
    //     });
    // });

    test('flatterObjectToDotNotation should not break array', async () => {
        let q = {
            a: 1,
            b: {
                bb: ['1', '2', '3'],
            },
        };
        let res = objectHelpers.flatterObjectToDotNotation(q);
        expect(res).toEqual({
            a: 1,
            'b.bb': ['1', '2', '3'],
        });
    });
});

// test('-positive', () => {
// 	let param = { a: 1 };
// 	let output = (param);
// 	expect(output).toEqual(true);
// });
