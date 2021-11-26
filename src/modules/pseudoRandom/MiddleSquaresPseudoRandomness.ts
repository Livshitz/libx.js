import { StringExtensions } from '../../extensions/StringExtensions';
import { helpers } from '../../helpers';
import { IPseudoRandomGenerator } from './IPseudoRandomGenerator';
import { NATURAL_NUMBER } from '.';

export class MiddleSquaresPseudoRandomness implements IPseudoRandomGenerator {
    private _seed: number;
    private _step: number;
    public chain: string;
    public current: number;

    constructor(seed: number = null, step: number = 0, private middleLength = 5) {
        // if (seed == 1) throw 'MiddleSquaresPseudoRandomness:ctor: seed cannot be 1!';
        this._seed = seed * NATURAL_NUMBER || helpers.randomNumber(NATURAL_NUMBER);
        this.current = this._seed;
        this.chain = this.current.toString();
        this._step = 0;
        for (let i = 0; i <= step; i++) this.next();
    }

    public next() {
        const sqr = this.current * this.current;
        const str = sqr.toString();
        const next = str.substr(str.length / 2 - this.middleLength / 2, this.middleLength);
        this.chain += StringExtensions.hashCode.call(next);
        return (this.current = parseInt(next));
    }

    public prev() {
        let curStep = this._step;
        this.reset();
        for (let i = 0; i < curStep - 1; i++) this.next();
        return this.current;
    }

    public reset() {
        this.current = this._seed;
        this._step = -1;
        return this.next();
    }

    public asPercent() {
        return (this.current % 1000000) / 1000000;
    }

    public static oneTime(seed: number): number {
        return new MiddleSquaresPseudoRandomness(seed).current;
    }

    public nextRange(start: number, end: number) {
        // returns in range [start, end): including start, excluding end
        // can't modulu nextInt because of weak randomness in lower bits
        var rangeSize = end - start;
        var randomUnder1 = (this.next() % 1000000) / 1000000;
        return start + Math.floor(randomUnder1 * rangeSize);
    }

    public choice(array: any[]) {
        return array[this.nextRange(0, array.length)];
    }
}
