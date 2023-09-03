// helpers.getMeasure-positive
// import iMyModule from '../interfaces/IMyModule';
import { TransformStream } from 'web-streams-polyfill';
import { Streams } from '../../src/modules/Streams';

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
    //     console.log(i);
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
