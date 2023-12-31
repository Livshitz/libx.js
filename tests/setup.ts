import fetch from 'node-fetch'
globalThis.fetch = fetch
global.TransformStream = require('web-streams-polyfill').TransformStream;

// Run specific test: `yarn jest -t 'string.capitalize' tests/libx.extensions.test.ts`