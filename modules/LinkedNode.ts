// const libx: LibxJS.ILibxJS = require('../bundles/essentials');

export default class LinkedNode<T> {
	public content: T;
	public parent: LinkedNode<T>;
	public children: LinkedNode<T>[] = [];
	public id: string;

	public constructor(_content?: T) {
		this.content = _content;
		this.id = libx.newGuid();
	}

	public addChild(_content: T) {
		let newNode = new LinkedNode<T>(_content);
		newNode.parent = this;
		this.children.push(newNode);
		return newNode;
	}

	public addChildren(_contents: T[]) {
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

	public firstChild(): LinkedNode<T> {
		if (this.children.length > 0) return this.children[0];
		return null;
	}

	public crawl(predicate?: (node: LinkedNode<T>, level?: number)=>boolean, level: number = 0): LinkedNode<T>[] {
		let ret = [];
		if (predicate == null || predicate(this, level)) ret.push(this);
		++level;
		for(let child of this.children) {
			ret.push(...child.crawl(predicate, level));
		}
		return ret;
	}

	public toString() {
		return this.content.toString();
	}

	public toStringDeep(): string {
		let ret = '';
		this.crawl((node, level)=>{
			ret += node.print(level) + '\n';
			return true;
		});
		return ret;
	}

	public print(level: number = 0) : string {
		let prefix = '-'.repeat(level) + (level > 0 ? ' '  : '');
		let str = prefix + this.toString();
		return str;
	}

	public serialize(): LibxJS.JSONObject {
		let ret = {
			id: this.id,
			content: <any>this.content,
			children: [],
		};
		for(let child of this.children) {
			ret.children.push(child.serialize());
		}
		if (ret.children.length == 0) delete ret.children;
		return ret;
	}

	public static deserialize<T>(jsObject): LinkedNode<T> {
		let node = new LinkedNode<T>(jsObject.content);
		node.id = jsObject.id;
		if (jsObject.children != null) {
			for(let child of jsObject.children) {
				node.children.push(LinkedNode.deserialize(child))
			}
		}
		return node;
	}
}