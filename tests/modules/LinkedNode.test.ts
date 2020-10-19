// helpers.getMeasure-positive
// import iMyModule from '../interfaces/IMyModule';
import LinkedNode from '../../src/modules/LinkedNode';

let testNode: LinkedNode<string>;

let compactJson = (str) => str.replace(/\n/g, '    ');

beforeEach(() => {
    testNode = new LinkedNode<string>('a');
    testNode.addChild('b');
    testNode.addChild('c').addChild('c1').addChild('c2');
});

test('root', () => {
    expect(testNode.content).toBe('a');
});
test('root.toString()', () => {
    expect(testNode.toString()).toBe('a');
});
test('root.toString()-serializable', () => {
    let node = new LinkedNode({ a: 1 });
    expect(compactJson(node.toString())).toBe('{      "a": 1    }');
});
test('root.toStringDeep()', () => {
    expect(compactJson(testNode.toStringDeep())).toBe('a    - b    - c    -- c1    --- c2    ');
});
test('root.print()', () => {
    expect(testNode.children[1].children[0].children[0].print()).toBe('c2');
});
test('root.getFirstChild()', () => {
    expect(testNode.getFirstChild()).toBe(testNode.children[0]);
});
test('root.getRoot()', () => {
    expect(testNode.children[1].getFirstChild().getFirstChild().getRoot()).toBe(testNode);
});
test('root.removeChild()', () => {
    testNode.removeChild(testNode.children[1]);
    expect(testNode.children[0].content).toBe('b');
    testNode.removeChild(testNode.getFirstChild());
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
    testNode.getFirstChild().remove();
    expect(testNode.children[0].content).toBe('c');
    expect(testNode.children.length).toBe(1);
});
test('root.removeChildByContent()', () => {
    testNode.removeChildByContent('c');
    expect(testNode.children[0].content).toBe('b');
    expect(testNode.children.length).toBe(1);
});
test('root.crawl()', () => {
    let foundNodes = testNode.crawl((node) => node.content.startsWith('c'));
    expect(foundNodes.length).toBe(3);
    expect(foundNodes[0].content).toBe('c');
    expect(foundNodes[1].content).toBe('c1');
    expect(foundNodes[2].content).toBe('c2');
});
test('root.serialize()', () => {
    let expected = { children: [{ content: 'b' }, { children: [{ children: [{ content: 'c2' }], content: 'c1' }], content: 'c' }], content: 'a' };
    let serialized = testNode.serialize();
    expect(serialized).toStrictEqual(expected);
});
test('root.deserialize()', () => {
    let input = { children: [{ content: 'b' }, { children: [{ children: [{ content: 'c2' }], content: 'c1' }], content: 'c' }], content: 'a' };
    let deserialized = LinkedNode.deserialize<string>(input);
    expect(deserialized.toStringDeep()).toBe(testNode.toStringDeep());
});
test('root.next()', () => {
    let child1 = testNode.crawl((node) => node.content == 'b')[0];
    let child2 = testNode.crawl((node) => node.content == 'c')[0];
    expect(child1.getNext()).toBe(child2);
});
test('root.next()-negative', () => {
    let child2 = testNode.crawl((node) => node.content == 'c')[0];
    expect(child2.getNext()).toBe(null);
});
test('root.prev()', () => {
    let child1 = testNode.crawl((node) => node.content == 'b')[0];
    let child2 = testNode.crawl((node) => node.content == 'c')[0];
    expect(child2.getPrev()).toBe(child1);
});
test('root.prev()-negative', () => {
    let child1 = testNode.crawl((node) => node.content == 'b')[0];
    expect(child1.getPrev()).toBe(null);
});
test('root.addSibling()', () => {
    let newNode = testNode.getFirstChild().addSibling('d');
    expect(testNode.children.length).toBe(3);
    expect(newNode.parent).toBe(testNode);
});
test('root.addSibling()', () => {
    let newNode = testNode.addSibling('x');
    expect(newNode).toBe(null);
    expect(testNode.getNext()).toBe(null);
});
