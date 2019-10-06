const cryptojs = require('crypto-js');

module.exports = (function(){
	var mod = {};

	mod.lib = cryptojs;
	
	mod.encrypt = (data, key) => {
		return mod.lib.AES.encrypt(data, key).toString();
	};

	mod.decrypt = (ciphertext, key) => {
		var bytes = mod.lib.AES.decrypt(ciphertext, key);
		var plaintext = bytes.toString(mod.lib.enc.Utf8);
		return plaintext
	};

	mod.base64_encode = (text) => {
		const encryptedWord = mod.lib.enc.Utf8.parse(text); // encryptedWord Array object
		const encrypted = mod.lib.enc.Base64.stringify(encryptedWord); // string: 'NzUzMjI1NDE='
		return encrypted;
	}

	mod.base64_decode = (ciphertext) => {
		const encryptedWord = mod.lib.enc.Base64.parse(ciphertext); // encryptedWord via Base64.parse()
		const decrypted = mod.lib.enc.Utf8.stringify(encryptedWord); // decrypted encryptedWord via Utf8.stringify() '75322541'
		return decrypted;
	}
	
	return mod; //mod;
})();

(()=>{ // Dependency Injector auto module registration
	__libx.di.register('crypto', module.exports);
})();