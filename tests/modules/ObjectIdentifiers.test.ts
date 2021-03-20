import { ObjectIdentifiers } from '../../src/modules/ObjectIdentifiers';

test('ObjectIdentifiers-simple-positive', () => {
    const paramA = { a: 1 };
    const paramB = { b: 2 };
    const oi = new ObjectIdentifiers();
    const output1 = oi.get(paramA);
    const output2 = oi.get(paramB);
    expect(output1).not.toEqual(output2);

    const output3 = oi.get(paramA);
    expect(output3).toEqual(output1);
});

test('ObjectIdentifiers-initial-array-positive', () => {
    const paramA = { a: 1 };
    const paramB = { b: 2 };
    const oi = new ObjectIdentifiers(paramA, paramB);
    const output1 = oi.peek(paramA);
    const output2 = oi.peek(paramB);
    expect(output1).not.toEqual(output2);

    const output3 = oi.get(paramA);
    expect(output3).toEqual(output1);
});

test('ObjectIdentifiers-invalid-key-negative', () => {
    const oi = new ObjectIdentifiers();
    const output1 = oi.get(<any>0);
    expect(output1).toEqual(null);
});

test('ObjectIdentifiers-withExtra-positive', () => {
    const paramA = { a: 1 };
    const extra = 'some-another-area-namespace';
    const oi = new ObjectIdentifiers();
    const output1 = oi.get(paramA);
    const output2 = oi.get(paramA, extra);
    expect(output1).not.toEqual(output2);

    const output3 = oi.get(paramA, extra);
    expect(output3).toEqual(output2);
});
