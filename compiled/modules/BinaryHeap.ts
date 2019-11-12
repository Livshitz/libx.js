export enum BinaryHeapType {
	min = 1,
	max = 2,
}

export default class BinaryHeap {
	public heap: number[] = [];
	private check: (parent: number, current: number) => boolean;
	private type: BinaryHeapType;

	constructor(_heap: number[], _type?: BinaryHeapType) {
		this.heap = _heap;
		this.type = _type || BinaryHeapType.max;
		if (this.type == BinaryHeapType.max) {
			this.check = (parent, current) => parent >= current;
		} else if (this.type == BinaryHeapType.min) {
			this.check = (parent, current) => parent <= current;
		} else {
			throw "Unsupported heap type";
		}

		this.heap = this.heap.sort((a, b)=> {
			if (a > b) return this.type == BinaryHeapType.max ? -1 : 1;
			if (a < b) return this.type == BinaryHeapType.max ? 1 : -1;
			return 0;
		});
	}

	public insert(val: number) {
		if (this.type == BinaryHeapType.max) {
			this.heap.push(val);
			this.bubbleUp();
		} else if (this.type == BinaryHeapType.min) {
			this.heap.unshift(val);
			this.sinkDown(0)
		}
	}

	public extractTop() {
		const max = this.heap[0];
		this.heap[0]= this.heap.pop()
		this.sinkDown(0)
		return max
	}

	public peakTop() {
		return this.heap[0];
	}

	private bubbleUp() {
		let index = this.heap.length - 1;

		while (index > 0) {
			let element = this.heap[index];
			let parentIndex = Math.floor((index - 1) / 2);
			let parent = this.heap[parentIndex];

			if (this.check(parent, element)) break
			this.heap[index] = parent;
			this.heap[parentIndex] = element;
			index = parentIndex;
		}
	}

	private sinkDown(index) {
		let left = 2 * index + 1,
			right = 2 * index + 2,
			largest = index;
		const length = this.heap.length

		// if left child is greater than parent
		if (left <= length && this.check(this.heap[left], this.heap[largest])) {
			largest = left
		}
		// if right child is greater than parent
		if (right <= length && this.check(this.heap[right], this.heap[largest])) {
			largest = right
		}
		// swap
		if (largest !== index) {
			[this.heap[largest], this.heap[index]] =
				[this.heap[index], this.heap[largest]]
			this.sinkDown(largest)
		}
	}
}