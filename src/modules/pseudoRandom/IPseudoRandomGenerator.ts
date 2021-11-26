export interface IPseudoRandomGenerator {
    current: number;
    next(): number;
    prev(): number;
    reset(): number;
    asPercent(): number;
}
