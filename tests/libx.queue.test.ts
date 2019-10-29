// helpers.getMeasure-positive
// import iMyModule from '../interfaces/IMyModule';
import Queue from '../compiled/modules/Queue';

let obj: Queue<string>;

beforeEach(()=> {
	obj = new Queue<string>(['a', 'b', 'c', 'd']);
})

test('queue new', () => {
	obj = new Queue<string>();
	obj.enqueue('a')
	expect(obj.length).toBe(1);
});

test('queue.length', () => {
	expect(obj.length).toBe(4);
});

test('queue.enqueue', () => {
	obj.enqueue('e');
	expect(obj.count()).toBe(5);
});

test('queue.enqueue', () => {
	obj.dequeue();
	expect(obj.count()).toBe(3);
});

test('queue forEach', () => {
	let counter = '';
	for(let i of obj) {
		counter+= i
	}
	expect(counter).toBe('abcd');
});

test('queue index', () => {
	expect(obj.get(1)).toBe('b');
});

