console.log('---------- SETUP!')
import 'isomorphic-fetch';
// import fetch from 'node-fetch'
import * as streams from 'web-streams-polyfill';
// globalThis.fetch = fetch

global.TransformStream = streams.TransformStream;
global.ReadableStream = streams.ReadableStream;
global.WritableStream = <any>streams.WritableStream;
// globalThis.ReadableStream = <any>streams.ReadableStream;
// globalThis.WritableStream = <any>streams.WritableStream;
// globalThis.TransformStream = <any>streams.TransformStream;


// Run specific test: `yarn jest -t 'string.capitalize' tests/libx.extensions.test.ts`