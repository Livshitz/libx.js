/**
 * @jest-environment node
 */
import { Streams } from '../../src/modules/Streams';
import mockServer from './mockServer';
import { log } from '../../src/modules/log';


// import fetch, {
//     Blob,
//     // blobFrom,
//     // blobFromSync,
//     // File,
//     // fileFrom,
//     // fileFromSync,
//     // FormData,
//     Headers,
//     Request,
//     Response,
// } from 'node-fetch'
// if (!globalThis.fetch) {
//     (<any>globalThis).fetch = fetch;
//     (<any>globalThis).Headers = Headers;
//     (<any>globalThis).Request = Request;
//     (<any>globalThis).Response = Response;
//     global.TransformStream = TransformStream;
// }

const expected = `event: message
data: "hello"

event: message
data: "world,"

event: message
data: "you"

event: message
data: "rock!"

event: message
data: 100

`;

describe('streams', () => {
    let url: string;
    let server = new mockServer();

    beforeAll(async () => {
        url = await server.run();
    })

    test('getStream-positive', (done) => {
        let buffer = '';
        Streams.getStream(url + 'stream/100', delta => {
            log.v('delta: ', delta);
            buffer += delta;
        }, {
            method: 'GET',
        }).then(() => {
            log.v('done!')
            expect(buffer).toEqual(expected);
            done();
        });
    });

    test('getStream-chop', (done) => {
        let buffer = <string[]>[];
        Streams.getStream(url + 'stream/100/chop', delta => {
            log.v('delta: ', delta);
            buffer += delta;
        }, {
            method: 'GET',
            useEventBuffering: true,
        }).then(() => {
            log.v('done!')
            expect(buffer).toEqual(expected);
            done();
        });
    });

    afterAll(() => {
        log.i('shutting down server...');
        server.stop();
    });
});

test('asyncIterableToStream-positive', async () => {
    async function* range(start, stop) {
        for (let i = start; i <= stop; i++) {
            yield i;
        }
    }

    async function getRange() {
        const arr = range(4, 8);
        return arr;
    }

    const arr = range(4, 8);
    // for await (let i of arr) {
    //     log.v(i);
    // }

    let readable = await Streams.asyncIterableToStream(getRange(), null);
    const reader = readable.getReader();

    const textDecoder = new TextDecoder();
    let buffer = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const decodedString = textDecoder.decode(value);
        buffer.push(JSON.parse(decodedString));
    }

    expect(buffer).toStrictEqual([4, 5, 6, 7, 8]);
});
