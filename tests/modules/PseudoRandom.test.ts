import { helpers } from '../../src/helpers';
import { IPseudoRandomGenerator } from '../../src/modules/pseudoRandom/IPseudoRandomGenerator';
import { LCGPseudoRandomness } from '../../src/modules/pseudoRandom/LCGPseudoRandomness';
import { LehmerRandomNumberGenerator } from '../../src/modules/pseudoRandom/LehmerRandomNumberGenerator';
import { MiddleSquaresPseudoRandomness } from '../../src/modules/pseudoRandom/MiddleSquaresPseudoRandomness';
import { XorshiftPseudoRandomness } from '../../src/modules/pseudoRandom/XorshiftPseudoRandomness';

const seed = 99;
let pRandom: IPseudoRandomGenerator = null;

beforeEach(() => {
    pRandom = new XorshiftPseudoRandomness(seed);
});

test('XorshiftPseudoRandomness-basic-positive', () => {
    pRandom = new XorshiftPseudoRandomness(1);
    expect(pRandom.current).toEqual(270369);
    expect(pRandom.next()).toEqual(67601921);
    expect(pRandom.next()).toEqual(1815334946);
    expect(pRandom.next()).toEqual(792396775);
    pRandom = new XorshiftPseudoRandomness(1);
    expect(pRandom.current).toEqual(270369);
    expect(pRandom.next()).toEqual(67601921);
    expect(pRandom.next()).toEqual(1815334946);
    expect(pRandom.next()).toEqual(792396775);
    pRandom = new XorshiftPseudoRandomness(2);
    expect(pRandom.current).not.toEqual(270369);
    expect(pRandom.next()).not.toEqual(67601921);
    expect(pRandom.next()).not.toEqual(1815334946);
    expect(pRandom.next()).not.toEqual(792396775);

    const range = pRandom.nextRange(0, 10);
    expect(range).toEqual(9);

    const arr = pRandom.choice(['a', 'b', 'c', 'd']);
    expect(arr).toEqual('d');
});

test('MiddleSquaresPseudoRandomness-basic-positive', () => {
    pRandom = new MiddleSquaresPseudoRandomness(10, 0, 5);
    expect(pRandom.current).toEqual(47524);
    expect(pRandom.next()).toEqual(58530);
    expect(pRandom.next()).toEqual(25760);
    expect(pRandom.next()).toEqual(35776);

    const range = pRandom.nextRange(0, 10);
    expect(range).toEqual(0);

    const arr = pRandom.choice(['a', 'b', 'c', 'd']);
    expect(arr).toEqual('a');
});

test('LehmerRandomNumberGenerator-basic-positive', () => {
    pRandom = new LehmerRandomNumberGenerator(10, 0);
    expect(pRandom.current).toEqual(168070);
    expect(pRandom.next()).toEqual(677268843);
    expect(pRandom.next()).toEqual(1194115201);
    expect(pRandom.next()).toEqual(1259501992);
    expect(pRandom.next()).toEqual(703671065);

    const range = pRandom.nextRange(0, 10);
    expect(range).toEqual(1);

    const arr = pRandom.choice(['a', 'b', 'c', 'd']);
    expect(arr).toEqual('b');
});

test('LCGPseudoRandomness-basic-positive', () => {
    pRandom = new LCGPseudoRandomness(10, 0);
    expect(pRandom.current).toEqual(297746555);
    expect(pRandom.next()).toEqual(1849040512);
    expect(pRandom.next()).toEqual(22424576);
    expect(pRandom.next()).toEqual(1528359992);
    expect(pRandom.next()).toEqual(1290130432);

    const range = pRandom.nextRange(0, 10);
    expect(range).toEqual(4);

    const arr = pRandom.choice(['a', 'b', 'c', 'd']);
    expect(arr).toEqual('b');
});

test('all-length-positive', async () => {
    const lengthTest = 10000;
    let prev = 0;
    let dur = 0;
    let arr = [];
    dur = await helpers.measure(() => {
        arr = [];
        pRandom = new XorshiftPseudoRandomness(seed);
        for (let i = 0; i < lengthTest; i++) {
            let n = pRandom.next();
            arr.push(n);
            expect(n != null && prev != n).toEqual(true);
            prev = n;
        }
    });
    console.log('XorshiftPseudoRandomness:', dur); //, arr);
    expect(dur).toBeLessThanOrEqual(3500);

    dur = await helpers.measure(() => {
        arr = [];
        pRandom = new MiddleSquaresPseudoRandomness(seed);
        for (let i = 0; i < lengthTest; i++) {
            let n = pRandom.next();
            arr.push(n);
            expect(n != null && prev != n).toEqual(true);
        }
    });
    console.log('MiddleSquaresPseudoRandomness:', dur); //, arr);
    expect(dur).toBeLessThanOrEqual(3200);

    dur = await helpers.measure(() => {
        arr = [];
        pRandom = new LehmerRandomNumberGenerator(seed);
        for (let i = 0; i < lengthTest; i++) {
            let n = pRandom.next();
            arr.push(n);
            expect(n != null && prev != n).toEqual(true);
        }
    });
    console.log('LehmerRandomNumberGenerator:', dur); //, arr);
    expect(dur).toBeLessThanOrEqual(3000);

    dur = await helpers.measure(() => {
        arr = [];
        pRandom = new LCGPseudoRandomness(seed);
        for (let i = 0; i < lengthTest; i++) {
            let n = pRandom.next();
            arr.push(n);
            expect(n != null && prev != n).toEqual(true);
        }
    });
    console.log('LCGPseudoRandomness:', dur); //, arr);
    expect(dur).toBeLessThanOrEqual(3000);
});
