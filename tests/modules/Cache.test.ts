import { Deferred, delay, sleep } from 'concurrency.libx.js';
import {} from 'module';
import { Cache } from '../../src/modules/Cache';
import { LocalStorageMock } from '../helpers/LocalStorageMock';

let localStorage: LocalStorageMock;
let cache: Cache;

// global.localStorage = <any>localStorage;

beforeAll(() => {});
beforeEach(() => {
    localStorage = new LocalStorageMock();
    cache = new Cache('prefix', 0, '/', localStorage);

    cache.set('predefined', 123);
});

// test('-positive', () => {
// 	const param = { a: 1 };
// 	const output = mod.(param);
// 	expect(output).toEqual(true);
// });

test('cache-get-positive', () => {
    const output = cache.get('predefined');
    expect(output).toEqual(123);
});

test('cache-set-positive', () => {
    cache.set('a', 111);
    const output = cache.get('a');
    expect(output).toEqual(111);
});

test('cache-set-complex', () => {
    cache.set('a', 111);
    cache.set('b', { a: 2, b: { c: 3 } });
    expect(cache.get('a')).toEqual(111);
    expect(cache.get('b')).toEqual({ a: 2, b: { c: 3 } });
});

test('cache-clear-positive', () => {
    cache.set('a', 111);
    cache.clear();
    const output = cache.get('a');
    expect(output).toEqual(null);
});

test('cache-delete-positive', () => {
    cache.set('a', 111);
    cache.delete('a');
    const output = cache.get('a');
    expect(output).toEqual(null);
});

test('cache-getAll-positive', () => {
    cache.set('a', 111);
    cache.set('b', { a: 2, b: { c: 3 } });
    const output = cache.getAll();
    expect(output).toEqual({
        predefined: 123,
        a: 111,
        b: { a: 2, b: { c: 3 } },
    });
});

test('cache-listen-positive', () => {
    const p = new Deferred();
    cache.listen('a', (path, data) => {
        p.resolve(data);
    });
    expect(p).resolves.toEqual(123);
    cache.set('a', 123);
    expect(p.isSettled()).toEqual(true);
});
test('cache-listen-root', () => {
    const p = new Deferred();
    cache.listen('/', (path, data) => {
        p.resolve(data);
    });
    expect(p).resolves.toEqual(123);
    cache.set('a', 123);
    expect(p.isSettled()).toEqual(true);
});

test('cache-unlisten-positive', () => {
    const p = new Deferred();
    cache.listen('a', (path, data) => {
        p.resolve(data);
    });
    cache.unlisten('a');
    cache.set('a', 123);
    expect(p.isSettled()).toEqual(false);
});

test('cache-isExpired-positive', async () => {
    cache = new Cache('prefix', 100, '/', localStorage);
    cache.set('a', 1);
    expect(cache.get('a')).toEqual(1);
    expect(cache.isExpired('a')).toEqual(false);
    await delay(110);
    expect(cache.isExpired('a')).toEqual(true);
    expect(cache.get('a')).toEqual(null);
});

test('cache-setExpiry-positive', async () => {
    cache = new Cache('prefix', 100, '/', localStorage);
    cache.set('a', 1);
    cache.setExpiry('a', 300);
    expect(cache.get('a')).toEqual(1);
    expect(cache.isExpired('a')).toEqual(false);
    await delay(100);
    expect(cache.isExpired('a')).toEqual(false);
    expect(cache.get('a')).toEqual(1);
});

// test('cache-delete-positive', () => {
//     cache.set('a', 111);
//     cache.push('a', 22);
//     const output = cache.get('a');
//     expect(output).toEqual(null);
// });

// test('-positive', () => {
// 	const param = { a: 1 };
// 	const output = mod.(param);
// 	expect(output).toEqual(true);
// });
