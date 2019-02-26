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
	
	return mod; //mod;
})();
