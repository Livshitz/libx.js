export default class Queue<T> implements Iterable<T>{
	public array: T[];

	public constructor(items: T[] = []) {
		this.array = items;
	}

	public enqueue(item: T): Queue<T> {
		this.array.push(item);
		return this;
	}

	public dequeue(): T {
		if (this.array == null || this.array.length == 0) return null;
		return this.array.shift();
	}

	public count() :number {
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