import { IPseudoRandomGenerator } from './IPseudoRandomGenerator';
import { MiddleSquaresPseudoRandomness } from './MiddleSquaresPseudoRandomness';
import { XorshiftPseudoRandomness } from './XorshiftPseudoRandomness';

export const NATURAL_NUMBER: number = 16807;

// var seed = 100;

// function xorShift() {
//     seed ^= seed << 13;

//     seed ^= seed >> 17;

//     seed ^= seed << 5;

//     return seed;
// }

export default class PseudoRandom extends XorshiftPseudoRandomness implements IPseudoRandomGenerator {}
