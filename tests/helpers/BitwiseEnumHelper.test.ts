import { BitwiseEnumHelper } from '../../src/helpers/BitwiseEnumHelper';

enum BasicBitwiseMap {
    A = 1 << 0,
    B = 1 << 1,
    C = 1 << 2,
    D = 1 << 3,
    E = 1 << 4,
    F = 1 << 5,
    G = 1 << 6,
    H = 1 << 7,
}

enum BitwiseUsage {
    AD = BasicBitwiseMap.A | BasicBitwiseMap.D,
    AB = BasicBitwiseMap.A | BasicBitwiseMap.B,
    AF = BasicBitwiseMap.A | BasicBitwiseMap.F,
}

beforeEach(() => {});

test('EnumHelper-combine-positive', () => {
    const output = BitwiseEnumHelper.combine(BasicBitwiseMap.A, BasicBitwiseMap.D);
    expect(output).toEqual(BitwiseUsage.AD);
});

test('EnumHelper-has-positive', () => {
    const output = BitwiseEnumHelper.has(BitwiseUsage.AD, BasicBitwiseMap.D);
    expect(output).toEqual(true);
});

test('EnumHelper-doesNotHave-positive', () => {
    const output = BitwiseEnumHelper.doesNotHave(BitwiseUsage.AD, BasicBitwiseMap.G);
    expect(output).toEqual(true);
});

test('EnumHelper-getValues-positive', () => {
    const output = BitwiseEnumHelper.getValues(BasicBitwiseMap, BitwiseUsage.AD);
    expect(output).toEqual([BasicBitwiseMap.A, BasicBitwiseMap.D]);
});

test('EnumHelper-getValueNames-positive', () => {
    const output = BitwiseEnumHelper.getValueNames(BasicBitwiseMap, BitwiseUsage.AD);
    expect(output).toEqual(['A', 'D']);
});
