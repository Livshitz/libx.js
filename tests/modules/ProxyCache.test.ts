import { expect, test, beforeAll, beforeEach, describe } from 'vitest'
import { ProxyCache } from '../../src/modules/ProxyCache';
import { LocalStorageMock } from '../../src/modules/LocalStorageMock';

let localStorage: LocalStorageMock = null;
let proxyCache: ProxyCache;

beforeEach(() => {
    const existingObj = { a: 1, b: 2, c: { ca: 11, cb: 22 } };
    localStorage = new LocalStorageMock();
    localStorage['test/a'] = 10;
    localStorage['test/x'] = 111;
    localStorage['test/y/0'] = 0;
    localStorage['test/y/1'] = 1;
    localStorage['test/y/2'] = 2;
    proxyCache = new ProxyCache('test', existingObj, { store: localStorage });
});

test('localStorage-verify-proxified', () => {
    expect(proxyCache.proxy.isProxy).toEqual(true);
    expect(proxyCache.proxy.c.isProxy).toEqual(true);
    expect(proxyCache.proxy.a.isProxy).not.toEqual(true);
});

test('localStorage-preExisting values merged into init obj', () => {
    expect(proxyCache.proxy.a).toEqual(10); // prefer value from cache vs initial
    expect(proxyCache.proxy.x).toEqual(111); // non existing value from cache but not in initial
});

test('localStorage-changes in localStorage should be reflected in proxy', () => {
    localStorage['test/b'] = 22;
    expect(proxyCache.proxy.b).toEqual(22);
});

test('localStorage-changes in proxy should be reflected in localStorage', () => {
    proxyCache.proxy.b = 222;
    expect(localStorage['test/b']).toEqual('222');
});

test('localStorage-get-positive', () => {
    expect(proxyCache.proxy.b).toEqual(2);
    expect(proxyCache.proxy.c.ca).toEqual(11);
});

test('localStorage-add&get-positive', () => {
    proxyCache.proxy.d = 3;
    expect(proxyCache.proxy.d).toEqual(3);
    proxyCache.proxy.c.da = 3;
    expect(proxyCache.proxy.c.ca).toEqual(11);
});

test('localStorage-delete-positive', () => {
    delete proxyCache.proxy.a;
    expect(proxyCache.proxy.a).toEqual(undefined);
});

test('localStorage-delete-object', () => {
    delete proxyCache.proxy.y;
    expect(proxyCache.proxy?.y?.[1]).toEqual(undefined);
});
test('localStorage-set-object', () => {
    proxyCache.proxy.y = [];
    expect(proxyCache.proxy?.y?.[1]).toEqual(undefined);
});

test('localStorage-array-positive', () => {
    proxyCache.proxy.d = [];
    proxyCache.proxy.d.push(111);
    expect(proxyCache.proxy.d[0]).toEqual(111);
    proxyCache.proxy.d[0] = 222;
    expect(proxyCache.proxy.d[0]).toEqual(222);
});
