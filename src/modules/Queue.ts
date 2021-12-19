import { Callbacks } from './Callbacks';

export class Queue<T = any> implements Iterable<T> {
    public array: T[];
    public onEnqueue = new Callbacks();
    private options = new ModuleOptions();

    public constructor(items: T[] = [], options?: ModuleOptions<T>) {
        this.options = { ...this.options, ...options };
        this.array = items;
        if (this.options.onEnqueueCallback != null) this.onEnqueue.subscribe(this.options.onEnqueueCallback);
    }

    public enqueue(item: T): Queue<T> {
        this.array.push(item);
        setTimeout(() => {
            this.onEnqueue?.trigger(item);
        }, 0);
        return this;
    }

    public dequeue(): T {
        if (this.array == null || this.array.length == 0) return null;
        return this.array.shift();
    }

    public count(): number {
        return this.array.length;
    }

    public get(index: number): T {
        return this.array[index];
    }

    public get length(): number {
        return this.array.length;
    }

    // private counter = 0;
    // [Symbol.iterator](): Iterator<T, any, undefined> {
    // 	return {
    //         next: function() {
    //             return {
    //                 done: this.counter === 5,
    //                 value: this.counter++
    //             }
    //         }.bind(this)
    //     }
    // }

    *[Symbol.iterator](): Iterator<T> {
        for (let key of Object.keys(this.array)) {
            yield this.array[key];
        }
    }
}

export class ModuleOptions<T> {
    onEnqueueCallback?: (T) => Promise<void>;
}
