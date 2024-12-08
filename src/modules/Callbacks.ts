import * as _ from 'lodash-es';
import { async } from 'concurrency.libx.js';
import { helpers } from '../helpers';
import { FuncWithArgs } from '../types/interfaces';
import { di } from './dependencyInjector';

export class Callbacks<T = any> {
    private counter: number;
    private list: {};
    private options = new ModuleOptions();

    constructor(options?: ModuleOptions<T>) {
        this.options = { ...this.options, ...options };
        this.counter = 0;
        this.list = {};
        if (this.options.cb != null) this.subscribe(this.options.cb);
    }

    public subscribe(cb: FuncWithArgs<T>): number {
        this.list[this.counter] = cb;
        var ret = this.counter;
        this.counter++;
        return ret;
    }

    public once(cb: FuncWithArgs<T>) {
        let _this = this;
        let handle = this.subscribe(function () {
            _this.clear(handle);
            cb.apply(null, arguments);
        });
    }

    public until(cb: FuncWithArgs<T>): () => void {
        let handle = this.subscribe(cb);
        let untilFn = () => {
            this.clear(handle);
        };
        return untilFn;
    }

    public trigger(...args: T[]) {
        const p = helpers.newPromise();
        const allP = [];
        _.each(this.list, (cb: Function) => {
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

    public unsubscribe(id: number) {
        return this.clear(id);
    }

    public clear(id: number) {
        delete this.list[id];
        this.counter--;
    }

    public clearAll() {
        delete this.list;
        this.list = {};
        this.counter = 0;
    }

    public getSubscribersCount() {
        return this.counter;
    }
}

export class ModuleOptions<T> {
    cb?: FuncWithArgs<T>;
}

di.register('Callbacks', Callbacks);
