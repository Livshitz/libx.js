class A {
	prop: number = 0;

	constructor(arg: number) {
		this.prop = arg;
	}

	test(arg: number) {
		return this.prop * arg;
	}
}

(()=>{
	var a = new A(10);
	// "libx.".format
	console.log('aaa', a.test(2));
})