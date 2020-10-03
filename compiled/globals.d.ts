// declare type ILibx = import('./libx').LibxJS.ILibxJS;

// declare const libx: ILibx;

// declare module NodeJS  {
//     export interface Global {
// 		libx: ILibx;
// 	}

// 	interface String {
// 		capitalize() : string;
// 	}
// }

/*
export {};

declare global {
	type ILibx = import('./libx').LibxJS.ILibxJS;
	
	namespace NodeJS  {
		const libx: ILibx;
		interface Global {
		}
		
		interface String {
			capitalize() : string;
		}
	}
}
*/

import { LibxJS } from './libx';

declare global {
	const libx: LibxJS.ILibxJS;
	namespace NodeJS  {
		interface Global {
			libx: LibxJS.ILibxJS;
		}
	}
}