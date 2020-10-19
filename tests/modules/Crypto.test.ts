import { Crypto } from '../../src/modules/Crypto';

beforeEach(() => {});
const textToEncrypt = 'my text';
const myEncKey = 'secret';

test('base64_encode-positive', () => {
    const output = Crypto.base64_encode('input');
    expect(output).toEqual('aW5wdXQ=');
});

test('base64_decode-positive', () => {
    const output = Crypto.base64_decode('aW5wdXQ=');
    expect(output).toEqual('input');
});

test('encrypt-positive', () => {
    const output = Crypto.encrypt('my text', myEncKey);
    expect(output.length).toEqual('U2FsdGVkX19bx1XLG6SDnooJcHIAIjwgWdetAE8pF08='.length);
});

test('decrypt-positive', () => {
    const output = Crypto.decrypt('U2FsdGVkX19bx1XLG6SDnooJcHIAIjwgWdetAE8pF08=', myEncKey);
    expect(output).toEqual(textToEncrypt);

    // encrypt & decrypt e2e:
    const encrypted = Crypto.encrypt(textToEncrypt, myEncKey);
    const output2 = Crypto.decrypt(encrypted, myEncKey);
    expect(output2).toEqual(textToEncrypt);
});
