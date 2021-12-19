import { helpers } from '../../helpers';
import { IPseudoRandomGenerator } from './IPseudoRandomGenerator';
import { NATURAL_NUMBER } from '.';

export class LCGPseudoRandomness implements IPseudoRandomGenerator {
    private _seed: number;
    private _step: number;
    public current: number;
    // LCG using GCC's constants
    private m: number = 0x80000000; // 2**31;
    private a: number = 1103515245;
    private c: number = 12345;

    constructor(seed: number = null, step: number = 0) {
        this._seed = seed || Math.floor(Math.random() * (this.m - 1));
        this.current = this._seed;
        this._step = 0;

        for (let i = 0; i <= step; i++) this.next();
    }

    public next() {
        return (this.current = (this.a * this.current + this.c) % this.m);
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
        return new LCGPseudoRandomness(seed).current;
    }

    public nextRange(start: number, end: number) {
        // returns in range [start, end): including start, excluding end
        // can't modulu nextInt because of weak randomness in lower bits
        var rangeSize = end - start;
        var randomUnder1 = this.next() / this.m;
        return start + Math.floor(randomUnder1 * rangeSize);
    }

    public choice(array: any[]) {
        return array[this.nextRange(0, array.length)];
    }
}
