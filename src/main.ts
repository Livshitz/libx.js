import { helpers } from "./helpers";
import { DataStore } from "./modules/DataStore";
import { log, LogLevel } from "./modules/log";
import { node } from "./node";

import { libx } from "./bundles/browser.essentials";

log.filterLevel = LogLevel.Info;
// log.isDebug = true;
helpers.extensions.applyAllExtensions();
helpers.extensions.applyDateExtensions();

export default class App {
	constructor() {
	}

	public async run() {
		log.v('Hello World!');

		// const ds = new DataStore();
		const p = new helpers.Deferred();

		setTimeout(()=>{
			log.i('tick');

			// log.debug('debug');
			// log.info('info');
			// log.verbose('verbose');
			// log.warning('w');
			// log.error('e');
			// log.fatal('f');

			p.resolve(1);
		}, 100);

		await p;

		return true;
	}
}

class Program {
	public static async main() {
		let error: Error = null;

		try {
			log.verbose('----------------');
			let app = new App();
			await app.run();
			log.i('DONE');
		}
		catch (err) {
			error = err;
		} finally {
			if (error) {
				log.error('----- \n [!] Failed: ', error);
				return process.exit(1);
			}
			process.exit(0);
		}
	}
}

if (node.isCalledDirectly()) Program.main(); // Uncomment if you want to use this file as node script and self execute