// import iMyModule from '../interfaces/IMyModule';
// import myModule from '../myModule';

interface IMyModule {
	// constructor(val: string): void;
	// new (val: string) : void;
	
	val: string;
	test(str: string): boolean;

	// Example for async method:
	method<T>(arg: string): Promise<T>;
}

var instance: IMyModule;

beforeAll(()=> {
	// instance = new myModule('123');
})

test('libx exists', () => {
	expect(global.libx).toBeDefined();
});

