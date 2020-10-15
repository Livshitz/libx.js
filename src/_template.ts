import { Deferred } from 'concurrency.libx.js';
import { helpers } from './helpers';
import { di } from './modules/dependencyInjector';
import { log } from './modules/log';

export class MyClass {
    public constructor() {
        log.v('MyClass:ctor: Ready');
    }
}

di.register(MyClass, 'MyClass');
