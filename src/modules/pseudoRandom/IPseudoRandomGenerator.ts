export interface IPseudoRandomGenerator {
    current: number;
    next(): number;
    prev(): number;
    reset(): number;
    asPercent(): number;
    nextRange(start: number, end: number): number;
    choice<T = any>(array: T[]): T;
}
