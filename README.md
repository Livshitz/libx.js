# Libx.js 

[![MIT license](https://img.badgesize.io/Livshitz/libx.js/master/dist/libx.min.js?compression=gzip)](https://cdn.jsdelivr.net/gh/Livshitz/libx.js@latest/dist/libx.min.js)
[![codecov](https://img.shields.io/codecov/c/github/Livshitz/libx.js)](https://codecov.io/gh/Livshitz/libx.js)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](/LICENSE)
[![npm](https://img.shields.io/npm/v/libx.js.svg?maxAge=1000)](https://www.npmjs.com/package/libx.js)
[![npm](https://img.shields.io/github/languages/code-size/livshitz/libx.js.svg?label=source%20code%20size)](https://www.github.com/livshitz/libx.js)
[![Known Vulnerabilities](https://snyk.io/test/github/Livshitz/libx.js/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Livshitz/libx.js?targetFile=package.json)
<!-- [![Build Status](https://livshitz.visualstudio.com/libx/_apis/build/status/libx-CI?branchName=master)](https://livshitz.visualstudio.com/libx/_build/latest?definitionId=1&branchName=master) -->
<!-- [![codecov](https://codecov.io/gh/Livshitz/libx.js/branch/master/graph/badge.svg)](https://codecov.io/gh/Livshitz/libx.js) -->
<!--- [![npm](https://img.shields.io/bundlephobia/minzip/libx.js.svg?style=plastic)](https://www.npmjs.com/package/libx.js)
[![npm](https://img.shields.io/bundlephobia/min/libx.js.svg?style=plastic)](https://www.npmjs.com/package/libx.js)
-->


> 🛠 libx.js is a carefully crafted toolbelt full of useful modules and helpers for node & web apps

## Description:
Different projects usually have a shared portion of infrastructural or helpers code. Libx.js is intended to bring a broad of useful tools, shaped and sharpened to be easily used, hiding the complex or troublesome routines usually needed. <br/>


## Features: 
* Heavily modular and flexible
* Support javascript and Typescript
* Browserify & bundler friendly
* Shared support:
    * Modules:
        * Dependency Injection
        * Log
        * Network
        * Callbacks (pub/sub)
        * Firebase wrapper
        * Linked nodes and lists
        * BinrayHeap (min and max)
        * Queue
        * General QueueWorker
        * Datastore for clientside caching
    * Promise and deferred wrappers
    * General helpers & extensions
    * Datastore and cache mechanism
    * Crypto related helpers
    * Many general helpers
* Browser-only support:
    * General helpers & extensions
    * Require (for browser)
    * User management (firebase)
* Node-only support:
    * CLI helpers
    * QuickServer (ExpressJS wrapper)
    * ~~Bundler - Watcher, bundler, transformer, and more~~ ([moved to pax.libx.js](https://github.com/Livshitz/pax.libx.js))


## Use Cases:
1. General:
    - Essential string, array, date, extensions:
        - format date into strings
        - string ellipsis, capitalize, padding, hashcode
        - array manipulation
    - Simplified promise wrapper for easily wrapping callbacks into promises
    - Use same API for networking (HTTP get/post/etc) in both browser and node
    - Create dynamic linked-lists and trees to track, traverse nodes and also be able to serialise/deserialize easily
    - Use QueueWorker for handle one or multiple workers and split work into async concurrent handlers
    - Log code flow and events and filter by log level (debug/verbose/info/warning/error), including formatted date and time, stacktrace, etc
    - Use simplified callbacks for easy pub/sub
    - Firebase wrapper for handling read/write access and polyfill some missing functionality (reverse key ordering, entity version, etc.)
    - Helpers for object manipulation, handy types and checks, chain functions, deep clone and extend objects, guid generation, regexp wrappers, and many more
2. Node:
    - Allow modules to be able to detect and work in both CLI or import modes
    - Quickly access command line arguments
    - Bump package.json version
    - Execute complex shell commands and capture outputs
    - Parse and encrypt/decrypt project.json files
    - Encrypt/decrypt files
    - Globally catch errors and unhandled promises
3. Browser:
    - Browserify and make all the helpers and modules available to be used (share same codebase for both Node and browser).
    - Support progressive script loading, just like `require` but in the browser and on demand
    - Events and Messages managers
    - Helpers for download, upload, inject and many more helpers

** See [unit-tests](./tests) and [example](./examples) folder for practical uses and examples.
** Live [playground](https://raw.githack.com/Livshitz/libx.js/master/examples/playground.html)

## Usage
```
$ yarn add libx.js
or
$ npm install --save libx.js   
```
Play with it in browser playground: https://npm.runkit.com/libx.js
    

__For browser:__ <br/>
Create a dedicated file, include (e.g: require) the needed modules into `global` (window) scope and browserify it. See [pax.libx.js](https://github.com/Livshitz/pax.libx.js) for more details how to efficiently browserify and bundle files for browser use.

Grab from CDN:
```
https://cdn.jsdelivr.net/npm/libx.js@latest/dist/libx.min.js
```

## Contributing

Fork into your own repo, run locally, make changes and submit PullRequests to the main repository.

<!-- 
### Code of Conduct

We have adopted the same Code of Conduct as Facebook that we expect project participants to adhere to. Please read [the full text](https://code.facebook.com/codeofconduct) so that you can understand what actions will and will not be tolerated.

### Contributing Guide

Read our [contributing guide](/CONTRIBUTING.md) to learn about how you can contribute, how to propose improvements or if you are interested in translating the content. -->


## Tests Coverage:

![Code Coverage](https://codecov.io/gh/Livshitz/libx.js/branch/master/graphs/commits.svg)

## License

All projects and packages in this repository are [MIT licensed](/LICENSE).
