import each from 'lodash/each';
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
        each(this.list, (cb: Function) => {
            if (cb != null) cb.apply(null, args);
        });
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

di.register(Callbacks, 'Callbacks');
