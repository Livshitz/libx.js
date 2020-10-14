// How to run: `$ node examples/cliAndModule.js 123 --param abc`
// Or require as a module (see `anotherModule.ts`).

import { libx } from "../../src/bundles/node.essentials";

export class Program {
	public static main(arg1?: any, arg2?: any): any {
		console.time('main');
		let result;
		try {
			result = `arg1=${arg1}, arg2=${arg2}`;
		} finally {
			console.timeEnd('main');
			return result;
		}
	}
}

// Entrypoint:
if (libx.node.isCalledDirectly()) {
	libx.node.onExit(()=> {
		libx.log.i('Shutting down...');
	});

	(async () => {
		let result = await Program.main(libx.node.args._[0], libx.node.args.param);
		console.log('result: ', result);
		process.exit(0);
	})();
}
	