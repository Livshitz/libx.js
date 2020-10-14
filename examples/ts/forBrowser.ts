import { libx } from "../../src/bundles/browser.essentials";
import { Firebase } from "../../src/modules/Firebase";

declare global {
	namespace NodeJS  {
		interface Global {
			libx: typeof libx;
			FirebaseModule: typeof Firebase;
		}
	}
}

global.libx = libx;
global.FirebaseModule = Firebase;