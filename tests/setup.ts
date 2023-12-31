console.log('---------- SETUP!')
// import 'isomorphic-fetch';
import * as streams from 'web-streams-polyfill';
import { Response } from 'node-fetch';
// globalThis.fetch = fetch

global.TransformStream = streams.TransformStream;
global.ReadableStream = streams.ReadableStream;
global.WritableStream = <any>streams.WritableStream;
global.Response = Response;

// globalThis.ReadableStream = <any>streams.ReadableStream;
// globalThis.WritableStream = <any>streams.WritableStream;
// globalThis.TransformStream = <any>streams.TransformStream;


// Run specific test: `yarn jest -t 'string.capitalize' tests/libx.extensions.test.ts`