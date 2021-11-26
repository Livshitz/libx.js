import { helpers } from '../../helpers';
import { IPseudoRandomGenerator } from './IPseudoRandomGenerator';
import { NATURAL_NUMBER } from '.';

export class XorshiftPseudoRandomness implements IPseudoRandomGenerator {
    private _seed: number;
    private _step: number;
    public current: number;

    constructor(seed: number = null, step: number = 0) {
        this._seed = seed || helpers.randomNumber(NATURAL_NUMBER);
        this.current = this._seed;
        this._step = 0;
        for (let i = 0; i <= step; i++) this.next();
    }

    public next() {
        let tmp = this.current;
        tmp ^= tmp << 13;
        tmp ^= tmp >> 17;
        tmp ^= tmp << 5;
        return (this.current = Math.abs(tmp));
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
        return new XorshiftPseudoRandomness(seed).current;
    }
}
