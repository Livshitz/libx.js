// How to run: `$ node examples/anotherModule.js 123 --param abc`

import { Program } from './cliAndModule';

export class Program2 {
	public static main(arg1?: any, arg2?: any): any {
		return Program.main(arg1, arg2);
	}
}

// Entrypoint:
if (libx.node.isCalledDirectly()) {
	libx.node.onExit(()=> {
		libx.log.i('Shutting down...');
	});

	(async () => {
		let result = await Program2.main(libx.node.args._[0], libx.node.args.param);
		console.log('result: ', result);
		process.exit(0);
	})();
}
	