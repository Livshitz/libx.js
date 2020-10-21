import { objectHelpers } from '../helpers/ObjectHelpers';
import { ArrayExtensions } from './ArrayExtensions';
import { DateExtensions } from './DateExtensions';
import { ObjectExtensions } from './ObjectExtensions';
import { StringExtensions } from './StringExtensions';

export class Extensions {
    public object = ObjectExtensions;
    public string = StringExtensions;
    public date = DateExtensions;
    public array = ArrayExtensions;

    constructor() {}

    public applyObjectExtensions() {
        ObjectExtensions.__extend.call(Object.prototype, ObjectExtensions);
    }

    public applyStringExtensions() {
        // objectHelpers.merge(String.prototype, StringExtensions);
        ObjectExtensions.__extend.call(String.prototype, StringExtensions);
    }

    public applyDateExtensions() {
        // objectHelpers.merge(Date.prototype, DateExtensions);
        ObjectExtensions.__extend.call(Date.prototype, DateExtensions);
    }

    public applyArrayExtensions() {
        // objectHelpers.merge(Array.prototype, ArrayExtensions);
        ObjectExtensions.__extend.call(Array.prototype, ArrayExtensions);
    }

    public applyAllExtensions() {
        // this.applyObjectExtensions();
        this.applyStringExtensions();
        this.applyDateExtensions();
        this.applyArrayExtensions();
    }
}

export const extensions = new Extensions();
