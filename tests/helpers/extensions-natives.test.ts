import { expect, test } from 'vitest'

const nativeReplaceAll = String.prototype.replaceAll;
const nativeStartsWith = String.prototype.startsWith;

test('extensions never replace built-ins', async () => {
    const { extensions } = await import('../../src/extensions');
    extensions.applyAllExtensions();
    expect(String.prototype.replaceAll).toBe(nativeReplaceAll);
    expect(String.prototype.startsWith).toBe(nativeStartsWith);
    expect('a.b.c'.replaceAll(/\./g, '-')).toBe('a-b-c');
    expect(typeof (<any>'x').replaceAt).toBe('function');
});
