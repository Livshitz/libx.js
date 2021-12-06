/*
// Enum example:
export enum BasicBitwiseMap {
    A = 1 << 0, // 0000
    B = 1 << 1, // 0001
    C = 1 << 2, // 0010
}
const x = BasicBitwiseMap.A | BasicBitwiseMap.B; \\ 0011 (3)
*/

type EnumVal = number;

export class BitwiseEnumHelper {
    public static combine<T>(...values: EnumVal[]) {
        // or use `A | B`
        let ret = null;
        for (let v of values) {
            ret = ret | v;
        }
        return ret;
    }

    public static has<T>(e: EnumVal, value: EnumVal): boolean {
        return (e & value) === value;
    }

    public static doesNotHave<T>(e: EnumVal, value: EnumVal): boolean {
        return (e & value) !== value;
    }

    public static getValues(e: EnumDefinition, val: number) {
        const ret = [];
        for (let k of Object.keys(e)) {
            if ((e[k] & val) != 0) ret.push(e[k]);
        }
        return ret.length > 0 ? ret : null;
    }

    public static getValueNames(e: EnumDefinition, val: number) {
        const ret = [];
        for (let k of Object.keys(e)) {
            if ((e[k] & val) != 0) ret.push(k);
        }
        return ret.length > 0 ? ret : null;
    }
}

export interface EnumDefinition<T = string | number | boolean | EnumVal> {
    [id: number]: T;
}
