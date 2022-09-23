import { Action, EventsStream } from '../../src/modules/EventsStream';

interface IMyPayload {
    test: number;
}

beforeEach(() => {});

test('subscribe-state-positive', async () => {
    const mod = new EventsStream<IMyPayload>();
    let counter = 0;
    const handler = mod.subscribe(
        (event) => {
            expect(event.payload.test).toEqual(1);
            expect(counter).toEqual(2);
            return;
        },
        (event) => {
            counter++;
            return event?.payload?.test == 1;
        }
    );
    mod.emit({ test: 1 });
});

test('subscribe-state-emitCurrent-noTrigger-positive', async () => {
    const mod = new EventsStream<IMyPayload>([{ payload: { test: 1 } }, { payload: { test: 2 } }]);
    let counter = 0;
    const handler = mod.subscribe(
        (event) => {
            expect(event.payload.test == 1 || event.payload.test == 2).toEqual(true);
            expect(counter).toEqual(1);
            return;
        },
        (event) => {
            counter++;
            return true;
        }
    );
});

test('subscribe-history-emitAll-noTrigger-positive', async () => {
    const mod = new EventsStream<IMyPayload>([{ payload: { test: 1 } }, { payload: { test: 2 } }, { payload: { test: 3 } }]);
    let counter = 0;
    const handler = mod.subscribe(
        (event) => {
            expect(counter).toEqual(3);
            return;
        },
        (event) => {
            expect(event.payload.test == 1 || event.payload.test == 2 || event.payload.test == 3).toEqual(true);
            counter++;
            return event.payload.test == 3;
        },
        mod.channels.history
    );
});

test('subscribe-future-noEmit-noTrigger-positive', async () => {
    const mod = new EventsStream<IMyPayload>([{ payload: { test: 1 } }, { payload: { test: 2 } }, { payload: { test: 3 } }]);
    let counter = 0;
    const handler = mod.subscribe(
        (event) => {
            throw 'should not get here';
        },
        (event) => {
            throw 'should not get here';
        },
        mod.channels.future
    );
    setTimeout(() => {
        return;
    }, 10);
});

test('subscribe-future-noEmit-withTrigger-positive', async () => {
    const mod = new EventsStream<IMyPayload>([{ payload: { test: 1 } }, { payload: { test: 2 } }, { payload: { test: 3 } }]);
    let counter = 0;
    const handler = mod.subscribe(
        (event) => {
            expect(counter).toEqual(1);
            return;
        },
        (event) => {
            counter++;
            return true;
        },
        mod.channels.future
    );
    mod.emit({ test: 1 });
});

test('subscribe-withTypePredicate-positive', async () => {
    const mod = new EventsStream<IMyPayload>();

    const onDbStateChange: Action<IMyPayload> = (event) => {
        expect(event.payload.test).toEqual(222);
        expect(event.type).toEqual('database');
    };
    const onNetworkChange: Action<IMyPayload> = (event) => {
        expect(event.payload.test).toEqual(111);
        expect(event.type).toEqual('network');
    };
    const onCatchAll: Action<IMyPayload> = (event) => {
        if (event.payload.test === 0) return;
        expect(event.payload.test == 111 || event.payload.test == 222).toEqual(true);
        expect(event.type == 'network' || event.type == 'database' || event.type == null).toEqual(true);
    };

    mod.subscribe(onNetworkChange, (event) => event.type == 'network', mod.channels.future);
    mod.subscribe(onDbStateChange, (event) => event.type == 'database', mod.channels.future);
    mod.subscribe(onCatchAll, null, mod.channels.future);

    mod.emit({ test: 111 }, 'network');
    mod.emit({ test: 222 }, 'database');
    mod.emit({ test: 0 });
});

test('subscribeOnce-defaultFuture-positive', async () => {
    const mod = new EventsStream<IMyPayload>([{ payload: { test: 1 } }, { payload: { test: 2 } }, { payload: { test: 3 } }]);
    let counter = 0;
    mod.subscribeOnce(
        (event) => {
            expect(event.payload.test).toEqual(999);
            expect(counter).toEqual(1);
        },
        (event) => {
            counter++;
            return true;
        }
    );
    mod.emit({ test: 999 });
    mod.emit({ test: 0 });
});

test('subscribeOnce-state-positive', async () => {
    const mod = new EventsStream<IMyPayload>([{ payload: { test: 1 } }, { payload: { test: 2 } }, { payload: { test: 3 } }]);
    let counter = 0;
    mod.subscribeOnce(
        (event) => {
            expect(event.payload.test == 3 || event.payload.test == 999).toEqual(true);
            expect(counter == 1 || counter == 2).toEqual(true);
            return;
        },
        (event) => {
            counter++;
            return true;
        },
        mod.channels.state
    );
    mod.emit({ test: 999 });
    mod.emit({ test: 0 });
});

test('unsubscribe-viaHandler-positive', async () => {
    const mod = new EventsStream<IMyPayload>([{ payload: { test: 1 } }, { payload: { test: 2 } }, { payload: { test: 3 } }]);
    let counter = 0;
    const handler = mod.subscribe(
        (event) => {
            expect(event.payload.test == 3 || event.payload.test == 10 || event.payload.test == 20).toEqual(true);
            expect(counter == 1 || counter == 2 || counter == 3).toEqual(true);
            return;
        },
        (event) => {
            counter++;
            return event?.payload?.test == 1;
        }
    );
    mod.emit({ test: 10 });
    mod.emit({ test: 20 });
    handler.unsubscribe();
    mod.emit({ test: 3 });
});

test('unsubscribe-viaModule-positive', async () => {
    const mod = new EventsStream<IMyPayload>([{ payload: { test: 1 } }, { payload: { test: 2 } }, { payload: { test: 3 } }]);
    let counter = 0;
    const handler = mod.subscribe(
        (event) => {
            expect(event.payload.test == 3 || event.payload.test == 10 || event.payload.test == 20).toEqual(true);
            expect(counter == 1 || counter == 2 || counter == 3).toEqual(true);
            return;
        },
        (event) => {
            counter++;
            return event?.payload?.test == 1;
        }
    );
    mod.emit({ test: 10 });
    mod.emit({ test: 20 });
    mod.unsubscribe(handler);
    mod.emit({ test: 3 });
});

test('getAll-positive', async () => {
    const mod = new EventsStream<IMyPayload>([{ payload: { test: 1 } }, { payload: { test: 2 } }]);
    const output = mod.getAll();
    expect(output).toEqual([{ payload: { test: 1 } }, { payload: { test: 2 } }]);
});

test('getAll-transformer-positive', async () => {
    const mod = new EventsStream<IMyPayload>([{ payload: { test: 1 } }, { payload: { test: 2 } }]);
    const output = mod.getAll(
        (ev) => ev.payload,
        (ev) => ev.payload?.test != 1
    );
    expect(output).toEqual([{ test: 2 }]);
});

// test('-positive', () => {
// 	const param = { a: 1 };
// 	const handler = mod.(param);
// 	expect(output).toEqual(true);
// });
