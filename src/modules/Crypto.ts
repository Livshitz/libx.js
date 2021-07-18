// const cryptojs = require('crypto-js');
// import * as cryptojs from 'crypto-js';
import { AES, enc, SHA1, SHA256, DES, MD5 } from 'crypto-js';
import { di } from './dependencyInjector';

export class Crypto {
    public static encrypt = (data, key) => {
        return AES.encrypt(data, key).toString();
    };

    public static decrypt = (ciphertext, key) => {
        var bytes = AES.decrypt(ciphertext, key);
        var plaintext = bytes.toString(enc.Utf8);
        return plaintext;
    };

    public static base64_encode = (text) => {
        const encryptedWord = enc.Utf8.parse(text); // encryptedWord Array object
        const encrypted = enc.Base64.stringify(encryptedWord); // string: 'NzUzMjI1NDE='
        return encrypted;
    };

    public static base64_decode = (ciphertext) => {
        const encryptedWord = enc.Base64.parse(ciphertext); // encryptedWord via Base64.parse()
        const decrypted = enc.Utf8.stringify(encryptedWord); // decrypted encryptedWord via Utf8.stringify() '75322541'
        return decrypted;
    };
}

export { SHA1, SHA256, DES, MD5 };

di.register('crypto', Crypto);
