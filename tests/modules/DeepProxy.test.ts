import DeepProxy from '../../src/modules/DeepProxy';

let existingObj = null;

beforeEach(() => {
    existingObj = {
        a: 1,
        b: 2,
        c: {
            ca: 11,
            cb: 22,
            cc: {
                da: 111,
            },
        },
    };
});

test('DeepProxy-get-simple', () => {
    const obj = {
        a: 1,
    };
    const proxy = DeepProxy.create(obj, {
        get: (target, path, key) => {
            expect(path).toEqual('/a');
            expect(key).toEqual('a');
        },
        set: (target, path, key, value) => {},
    });

    const param = proxy.a;
    expect(param).toEqual(1);
});

test('DeepProxy-get-deep', () => {
    const proxy = DeepProxy.create(existingObj, {
        get: (target, path, key) => {
            expect(path).toEqual('/a');
            expect(key).toEqual('a');
        },
        set: (target, path, key, value) => {},
    });

    const param = proxy.a;
    expect(param).toEqual(1);
});

test('DeepProxy-get-additional', () => {
    const proxy = DeepProxy.create(existingObj, {
        get: (target, path, key) => {
            switch (key) {
                case 'c':
                    return;
                case 'e':
                    expect(path).toEqual('/c/e');
                    expect(key).toEqual('e');
                    break;
                case 'ea':
                    expect(path).toEqual('/c/e/ea');
                    expect(key).toEqual('ea');
                    break;
                default:
                    throw 'unexpected case!';
            }
        },
        set: (target, path, key, value) => {
            expect(path).toEqual('/c/e');
            expect(key).toEqual('e');
            expect(value.ea).toEqual(555);
        },
    });

    (<any>proxy.c).e = { ea: 555 };

    const param = (<any>proxy.c).e.ea;
    expect(param).toEqual(555);
});

test('DeepProxy-set-positive', () => {
    const proxy = DeepProxy.create(existingObj, {
        get: (target, path, key) => {},
        set: (target, path, key, value) => {
            expect(path).toEqual('/a');
            expect(key).toEqual('a');
            expect(value).toEqual(2);
        },
    });

    proxy.a = 2;
    const param = proxy.a;
    expect(param).toEqual(2);
});

test('DeepProxy-delete-positive', () => {
    const proxy = DeepProxy.create(existingObj, {
        get: (target, path, key) => {},
        set: (target, path, key, value) => {
            expect(path).toEqual('/a');
            expect(key).toEqual('a');
            expect(value).toEqual(null);
        },
    });

    delete proxy.a;
    const param = proxy.a;
    expect(param).toBeUndefined();
});

test('DeepProxy-delete-null', () => {
    const proxy = DeepProxy.create(
        { ...existingObj, b: 2 },
        {
            get: (target, path, key) => {},
            set: (target, path, key, value) => {
                expect(path).toEqual('/b');
                expect(key).toEqual('b');
                expect(value).toEqual(null);
            },
        }
    );

    proxy.b = null;
    const param = proxy.b;
    expect(param).toEqual(null);
});

test('DeepProxy-set-object (should proxify it as well)', () => {
    const proxy = DeepProxy.create(existingObj, {
        get: (target, path, key) => {},
        set: (target, path, key, value) => {
            // expect(path).toEqual('/a/b');
            // expect(key).toEqual('b');
            // expect(value).toEqual(2);
        },
    });

    proxy.a = { b: 2 };
    // proxy.a.b = 3;
    const param = proxy.a.b;
    expect(param).toEqual(2);
    expect(proxy.a.isProxy).toEqual(true);
});
