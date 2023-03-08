import { delay } from 'concurrency.libx.js';
import { Callbacks } from '../../src/modules/Callbacks';

beforeEach(() => {});

test('subscribe-simple-positive', (done) => {
    const c = new Callbacks();
    c.subscribe((arg) => {
        expect(true).toEqual(true);
        done();
    });
    setTimeout(() => {
        c.trigger(1);
    }, 10);
});

test('subscribe-simple-ctor-positive', (done) => {
    const c = new Callbacks({
        cb: (arg) => {
            expect(true).toEqual(true);
            done();
        },
    });
    setTimeout(() => {
        c.trigger(1);
    }, 10);
});

test('subscribe-subsequent-positive', (done) => {
    const c = new Callbacks();
    c.subscribe((arg) => {
        expect(arg == 1 || arg == 2).toEqual(true);
        if (arg == 2) done();
    });
    setTimeout(() => {
        c.trigger(1);
    }, 10);
    setTimeout(() => {
        c.trigger(2);
    }, 20);
});

test('once-positive', (done) => {
    const c = new Callbacks();
    c.once((arg) => {
        if (arg == 2) throw "Shouldn't get here";
        expect(arg == 1).toEqual(true);
        if (arg == 1) done();
    });
    setTimeout(() => {
        c.trigger(1);
    }, 10);
    setTimeout(() => {
        c.trigger(2);
    }, 20);
});

test('until-after-positive', (done) => {
    const c = new Callbacks();
    const stopFn = c.until((arg) => {
        if (arg != 1) throw "Shouldn't get here";
        done();
    });
    setTimeout(() => {
        c.trigger(1);
        stopFn();
    }, 10);
    setTimeout(() => {
        c.trigger(1);
    }, 20);
});

test('until-before-positive', (done) => {
    const c = new Callbacks();
    const stopFn = c.until((arg) => {
        throw "Shouldn't get here";
    });
    stopFn();
    setTimeout(() => {
        c.trigger(1);
    }, 10);
    setTimeout(() => {
        done();
    }, 20);
});

test('clear-positive', (done) => {
    const c = new Callbacks();
    const handle = c.subscribe((arg) => {
        throw "Shouldn't get here";
    });
    expect(c.getSubscribersCount()).toEqual(1);

    c.clear(handle);

    expect(c.getSubscribersCount()).toEqual(0);

    setTimeout(() => {
        c.trigger(1);
    }, 10);
    setTimeout(() => {
        done();
    }, 20);
});

test('clearAll-positive', (done) => {
    const c = new Callbacks();
    const handle = c.subscribe((arg) => {
        throw "Shouldn't get here";
    });
    c.clearAll();
    setTimeout(() => {
        c.trigger(1);
    }, 10);
    setTimeout(() => {
        done();
    }, 20);
});

test('subscribe-trigger-all-promise', async () => {
    const c = new Callbacks();
    let counter = { a: 0, b: 0 };
    c.subscribe(async (arg) => {
        await delay(5);
        counter.a = 1;
    });
    c.subscribe(async (arg) => {
        await delay(5);
        counter.b = 1;
    });
    await c.trigger();

    expect(counter).toEqual({ a: 1, b: 1 });
});

// test('-positive', () => {
// 	let param = { a: 1 };
// 	let output = mod.(param);
// 	expect(output).toEqual(true);
// });
