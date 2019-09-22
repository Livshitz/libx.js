// helpers.getMeasure-positive
// import iMyModule from '../interfaces/IMyModule';
import LinkedNode from '../modules/LinkedNode';

let testNode: LinkedNode<string>;

beforeEach(()=> {
	testNode = new LinkedNode<string>('a');
	testNode.addChild("b");
	testNode.addChild("c").addChild("c1").addChild("c2");
})

test('root', () => {
	expect(testNode.content).toBe('a')
});
test('root.toString()', () => {
	expect(testNode.toString()).toBe('a')
});
test('root.toStringDeep()', () => {
	expect(testNode.toStringDeep().replace(/\n/g, '    ')).toBe('a    - b    - c    -- c1    --- c2    ')
});
test('root.print()', () => {
	expect(testNode.children[1].children[0].children[0].print()).toBe('c2')
});
test('root.getFirstChild()', () => {
	expect(testNode.firstChild()).toBe(testNode.children[0]);
});
test('root.getRoot()', () => {
	expect(testNode.children[1].firstChild().firstChild().getRoot()).toBe(testNode);
});
test('root.removeChild()', () => {
	testNode.removeChild(testNode.children[1]);
	expect(testNode.children[0].content).toBe('b');
	testNode.removeChild(testNode.firstChild());
	expect(testNode.children.length).toBe(0);
});
test('root.removeChildByContent()', () => {
	testNode.removeChildByContent('c');
	expect(testNode.children[0].content).toBe('b');
	testNode.removeChildByContent('b');
	expect(testNode.children.length).toBe(0);
});
test('root.addChildren()', () => {
	testNode.addChildren(['d', 'e']);
	expect(testNode.children[2].content).toBe('d');
	expect(testNode.children[3].content).toBe('e');
	expect(testNode.children.length).toBe(4);
});
test('root.addChildren()', () => {
	testNode.addChildren(['d', 'e']);
	expect(testNode.children[2].content).toBe('d');
	expect(testNode.children[3].content).toBe('e');
	expect(testNode.children.length).toBe(4);
});
test('root.addChild()', () => {
	testNode.addChild('d');
	expect(testNode.children[2].content).toBe('d');
	expect(testNode.children.length).toBe(3);
});
test('root.remove()', () => {
	testNode.firstChild().remove();
	expect(testNode.children[0].content).toBe('c');
	expect(testNode.children.length).toBe(1);
});
test('root.removeChildByContent()', () => {
	testNode.removeChildByContent('c')
	expect(testNode.children[0].content).toBe('b');
	expect(testNode.children.length).toBe(1);
});
test('root.crawl()', () => {
	let foundNodes = testNode.crawl(node=>node.content.startsWith('c'));
	expect(foundNodes.length).toBe(3);
	expect(foundNodes[0].content).toBe('c');
	expect(foundNodes[1].content).toBe('c1');
	expect(foundNodes[2].content).toBe('c2');
});
test('root.serialize()', () => {
	let expected = {"children": [{"content": "b", "id": ""}, {"children": [{"children": [{"content": "c2", "id": ""}], "content": "c1", "id": ""}], "content": "c", "id": ""}], "content": "a", "id": ""};
	
	// remove ids, as they're randomly generated
	testNode.crawl(node=>{
		node.id = '';
		return true;
	});
	let serialized = testNode.serialize();

	expect(serialized).toStrictEqual(expected);
});
test('root.deserialize()', () => {
	let input = {"children": [{"content": "b", "id": ""}, {"children": [{"children": [{"content": "c2", "id": ""}], "content": "c1", "id": ""}], "content": "c", "id": ""}], "content": "a", "id": ""};
	
	let deserialized = LinkedNode.deserialize<string>(input);
	testNode.crawl(node=>{
		node.id = '';
		return true;
	});

	expect(deserialized.toStringDeep()).toBe(testNode.toStringDeep());
});



