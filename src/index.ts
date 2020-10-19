// Playground test:

class A {
	prop: number = 0;

	constructor(arg: number) {
		this.prop = arg;
	}

	test(arg: number) {
		return this.prop * arg;
	}
}

// global.libx = require('../bundles/essentials');
// import * as _libx from './bundles/essentials';
// var libx: LibxJS.ILibxJS = _libx;

(async ()=>{
	var a = new A(10);
	// "libx.".format
	console.log('aaa', a.test(2));


	let b = Buffer;
	b.from('abc');

	// let param = libx.Buffer.from('abc');
	// console.log(b)

    console.log(1)
    // let p = libx.delay(5000);
    // await p;
    console.log(2);
})();
