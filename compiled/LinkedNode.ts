// const libx: LibxJS.ILibxJS = require('../bundles/essentials');

export default class LinkedNode<T> {
	public content: T;
	public parent: LinkedNode<T>;
	public children: LinkedNode<T>[] = [];

	public constructor(_content?: T) {
		this.content = _content;
	}

	public addChild(_content: T): LinkedNode<T> {
		let newNode = new LinkedNode<T>(_content);
		newNode.parent = this;
		this.children.push(newNode);
		return newNode;
	}

	public addSibling(_content: T): LinkedNode<T> {
		if (this.parent == null) return null;
		return this.parent.addChild(_content);
	}

	public addChildren(_contents: T[]): LinkedNode<T>[] {
		let ret: LinkedNode<T>[] = [];
		for(let item of _contents) {
			let newChild = this.addChild(item);
			ret.push(newChild);
		}
		return ret.length > 0 ? ret : null; 
	}

	public remove(): LinkedNode<T> {
		if (this.parent == null) return null;

		let parent = this.parent;
		this.parent.removeChild(this);
		return parent;
	}

	public removeChild(node: LinkedNode<T>): LinkedNode<T> {
		this.children.remove(node);
		return this;
	}

	public removeChildByContent(_content: T): LinkedNode<T> {
		let ret = null;
		for(let child of this.children) {
			if (child.content != _content) continue;
			ret = child;
			this.children.remove(child);
			break;
		}
		return ret;
	}

	public getRoot(): LinkedNode<T> {
		let ret: LinkedNode<T> = this;
		while(ret.parent != null) ret = ret.parent;
		return ret;
	}

	public getPrev(): LinkedNode<T> {
		if (this.parent == null) return null;
		if (this.parent.children == null || this.parent.children.length <= 1) return null;
		let index = this.parent.children.indexOf(this);
		if (index == 0) return null;
		return this.parent.children[index-1];
	}

	public getNext(): LinkedNode<T> {
		if (this.parent == null) return null;
		if (this.parent.children == null || this.parent.children.length <= 1) return null;
		let index = this.parent.children.indexOf(this);
		if (index+1 == this.parent.children.length) return null;
		return this.parent.children[index+1];
	}

	public getFirstChild(): LinkedNode<T> {
		if (this.children.length > 0) return this.children[0];
		return null;
	}

	public crawl(predicate?: (node: LinkedNode<T>, level?: number)=>boolean, breakOnFind: boolean = false, level: number = 0): LinkedNode<T>[] {
		let ret = [];
		if (predicate == null || predicate(this, level)) {
			ret.push(this);
			if (breakOnFind) return ret;
		}
		++level;
		for(let child of this.children) {
			ret.push(...child.crawl(predicate, breakOnFind, level));
			if (ret.length > 0 && breakOnFind) break;
		}
		return ret;
	}

	public toString() {
		let content: any = this.content;
		if (content == null) return null;
		let ret = content.toString();
		if (ret == '[object Object]') ret = libx.jsonify(content);
		return ret;
	}

	public toStringDeep(): string {
		let ret = '';
		this.crawl((node, level)=>{
			let cur =  node.print(level);
			if (cur == null) return false;
			ret += cur + '\n';
			return true;
		});
		return ret;
	}

	public print(level: number = 0) : string {
		let prefix = '-'.repeat(level) + (level > 0 ? ' '  : '');
		let str = this.toString();
		if (str == null) return null;
		str = prefix + str;
		return str;
	}

	public serialize(): LibxJS.JSONObject {
		let ret = {
			content: <any>this.content,
			children: [],
		};
		for(let child of this.children) {
			ret.children.push(child.serialize());
		}
		if (ret.children.length == 0) delete ret.children;
		return ret;
	}

	public toJSON() {
		return this.serialize();
	}

	public static deserialize<T>(jsObject): LinkedNode<T> {
		let node = new LinkedNode<T>(jsObject.content);
		if (jsObject.children != null) {
			for(let child of jsObject.children) {
				let newChild = LinkedNode.deserialize<T>(child);
				newChild.parent = node;
				node.children.push(newChild)
			}
		}
		return node;
	}
}