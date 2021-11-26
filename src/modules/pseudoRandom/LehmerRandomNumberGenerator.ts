import { helpers } from '../../helpers';
import { IPseudoRandomGenerator } from './IPseudoRandomGenerator';
import { NATURAL_NUMBER } from '.';

export class LehmerRandomNumberGenerator implements IPseudoRandomGenerator {
    public current: number;
    public step: number;
    private _seed: number;
    constructor(seed: number = null, step: number = 0) {
        this._seed = seed || helpers.randomNumber(NATURAL_NUMBER);
        this.current = seed;
        this.step = -1;
        for (let i = 0; i <= step; i++) this.next();
    }
    public asPercent() {
        return (this.current % 1000000) / 1000000;
    }
    public next() {
        this.step++;
        return (this.current = (this.current * NATURAL_NUMBER) % 2147483647);
    }
    public reset() {
        this.current = this._seed;
        this.step = -1;
        return this.next();
    }
    public prev() {
        let curStep = this.step;
        this.reset();
        for (let i = 0; i < curStep - 1; i++) this.next();
        return this.current;
    }

    public static oneTime(input: number) {
        return (input * NATURAL_NUMBER) % 2147483647;
    }
}
