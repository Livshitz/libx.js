import fetch from 'node-fetch'
globalThis.fetch = fetch
global.TransformStream = require('web-streams-polyfill').TransformStream;
import { WritableStream } from 'web-streams-polyfill/ponyfill';

if (!global.WritableStream) {
	global.WritableStream = <any>WritableStream;
}

// Run specific test: `yarn jest -t 'string.capitalize' tests/libx.extensions.test.ts`