import { async } from 'concurrency.libx.js';
import each from 'lodash/each';
import { helpers } from '../helpers';
import { FuncWithArgs } from '../types/interfaces';
import { di } from './dependencyInjector';

export class Callbacks<T = any> {
    counter: number;
    list: {};
    constructor() {
        this.counter = 0;
        this.list = {};
    }

    subscribe(cb: FuncWithArgs<T>): number {
        this.list[this.counter] = cb;
        var ret = this.counter;
        this.counter++;
        return ret;
    }

    once(cb: FuncWithArgs<T>) {
        let _this = this;
        let handle = this.subscribe(function () {
            _this.clear(handle);
            cb.apply(null, arguments);
        });
    }

    until(cb: FuncWithArgs<T>): () => void {
        let handle = this.subscribe(cb);
        let untilFn = () => {
            this.clear(handle);
        };
        return untilFn;
    }

    trigger(...args: T[]) {
        const p = helpers.newPromise();
        const allP = [];
        each(this.list, (cb: Function) => {
            if (cb == null) return;

            const promise = async(cb).apply(cb, args);
            allP.push(promise);
        });
        Promise.all(allP)
            .then(() => {
                p.resolve();
            })
            .catch((err) => {
                p.reject(err);
            });
        return p;
    }

    unsubscribe(id: number) {
        return this.clear(id);
    }

    clear(id: number) {
        delete this.list[id];
    }

    clearAll() {
        delete this.list;
        this.list = {};
    }
}

di.register('Callbacks', Callbacks);
