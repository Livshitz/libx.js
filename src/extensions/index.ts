import { ObjectHelpers } from "../helpers/ObjectHelpers";
import { ArrayExtensions } from "./ArrayExtensions";
import { DateExtensions } from "./DateExtensions";
import { ObjectExtensions } from "./ObjectExtensions";
import { StringExtensions } from "./StringExtensions";

export class Extensions {
	public object = ObjectExtensions;
	public string = StringExtensions;
	public date = DateExtensions;
	public array = ArrayExtensions;

	constructor() {
		
	}

	public applyObjectExtensions() {
		ObjectExtensions.extend.apply(Object.prototype, ObjectExtensions);
	}

	public applyStringExtensions() {
		ObjectHelpers.merge(String.prototype, StringExtensions);
	}

	public applyDateExtensions() {
		ObjectHelpers.merge(Date.prototype, DateExtensions);
	}

	public applyArrayExtensions() {
		ObjectHelpers.merge(Array.prototype, ArrayExtensions);
	}

	public applyAllExtensions() {
		this.applyStringExtensions();
		this.applyDateExtensions();
		this.applyArrayExtensions();
	}
}

export const extensions = new Extensions();

