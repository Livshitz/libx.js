// helpers.getMeasure-positive
// import iMyModule from '../interfaces/IMyModule';
import BinaryHeap, { BinaryHeapType } from '../compiled/modules/BinaryHeap';

let obj: BinaryHeap;
let initArr = [10, 5, 9, 7, 30, 20];

beforeEach(()=> {
})

test('basic', () => {
	obj = new BinaryHeap([...initArr]);
	let res = [ 30, 20, 10, 9, 7, 5 ];
	expect(obj.heap).toEqual(res);

	obj = new BinaryHeap(initArr, BinaryHeapType.max);
	expect(obj.heap).toEqual(res);
});

test('max - insert low', () => {
	obj = new BinaryHeap([...initArr], BinaryHeapType.max);
	obj.insert(2);
	expect(obj.heap).toEqual([ 30, 20, 10, 9, 7, 5, 2 ]);

	expect(obj.peakTop()).toEqual(30);

	expect(obj.extractTop()).toEqual(30);
	expect(obj.extractTop()).toEqual(20);
	expect(obj.extractTop()).toEqual(10);
	expect(obj.extractTop()).toEqual(9);
	expect(obj.extractTop()).toEqual(7);
	expect(obj.extractTop()).toEqual(5);
	expect(obj.extractTop()).toEqual(2);
});

test('max - insert mid', () => {
	obj = new BinaryHeap([...initArr], BinaryHeapType.max);
	obj.insert(11);
	expect(obj.heap).toEqual([ 30, 20, 11, 9, 7, 5, 10 ]);
	
	expect(obj.peakTop()).toEqual(30);

	expect(obj.extractTop()).toEqual(30);
	expect(obj.extractTop()).toEqual(20);
	expect(obj.extractTop()).toEqual(11);
	expect(obj.extractTop()).toEqual(10);
	expect(obj.extractTop()).toEqual(9);
	expect(obj.extractTop()).toEqual(7);
	expect(obj.extractTop()).toEqual(5);
});

test('max - insert high', () => {
	obj = new BinaryHeap([...initArr], BinaryHeapType.max);
	obj.insert(31);
	expect(obj.heap).toEqual([ 31, 20, 30, 9, 7, 5, 10 ]);
	expect(obj.peakTop()).toEqual(31);
	expect(obj.extractTop()).toEqual(31);
	expect(obj.extractTop()).toEqual(30);
	expect(obj.extractTop()).toEqual(20);
	expect(obj.extractTop()).toEqual(10);
	expect(obj.extractTop()).toEqual(9);
	expect(obj.extractTop()).toEqual(7);
	expect(obj.extractTop()).toEqual(5);
});

test('max - insert low', () => {
	obj = new BinaryHeap([...initArr], BinaryHeapType.max);
	expect(obj.peakTop()).toEqual(30);
});


test('min - insert low', () => {
	obj = new BinaryHeap([...initArr], BinaryHeapType.min);
	obj.insert(2);
	expect(obj.heap).toEqual([ 2, 5, 7, 9, 10, 20, 30 ]);
	expect(obj.peakTop()).toEqual(2);
	expect(obj.extractTop()).toEqual(2);
	expect(obj.extractTop()).toEqual(5);
	expect(obj.extractTop()).toEqual(7);
	expect(obj.extractTop()).toEqual(9);
	expect(obj.extractTop()).toEqual(10);
	expect(obj.extractTop()).toEqual(20);
	expect(obj.extractTop()).toEqual(30);
});

test('min - insert mid', () => {
	obj = new BinaryHeap([...initArr], BinaryHeapType.min);
	obj.insert(11);
	expect(obj.heap).toEqual([ 5, 9, 7, 11, 10, 20, 30 ]);
	expect(obj.peakTop()).toEqual(5);
	expect(obj.extractTop()).toEqual(5);
	expect(obj.extractTop()).toEqual(7);
	expect(obj.extractTop()).toEqual(9);
	expect(obj.extractTop()).toEqual(10);
	expect(obj.extractTop()).toEqual(11);
	expect(obj.extractTop()).toEqual(20);
	expect(obj.extractTop()).toEqual(30);
});

test('min - insert high', () => {
	obj = new BinaryHeap([...initArr], BinaryHeapType.min);
	obj.insert(31);
	expect(obj.heap).toEqual([ 5, 9, 7, 31, 10, 20, 30 ]);
	expect(obj.peakTop()).toEqual(5);
	expect(obj.extractTop()).toEqual(5);
	expect(obj.extractTop()).toEqual(7);
	expect(obj.extractTop()).toEqual(9);
	expect(obj.extractTop()).toEqual(10);
	expect(obj.extractTop()).toEqual(20);
	expect(obj.extractTop()).toEqual(30);
	expect(obj.extractTop()).toEqual(31);
});
