import { ObjectHelpers } from "../helpers/ObjectHelpers";

export class ObjectExtensions {
	public static getCustomProperties(obj) {
		return ObjectHelpers.getCustomProperties(obj);
	}

	public static extend(withObj: Object) {
		for(let key of ObjectExtensions.getCustomProperties(withObj)){
			this.prototype[key] = withObj[key];
		}
		return withObj;
	}
}