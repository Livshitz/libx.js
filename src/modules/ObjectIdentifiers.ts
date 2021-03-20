import { helpers } from '../helpers';
import { objectHelpers } from '../helpers/ObjectHelpers';

/**
 * Helper module to generate a persistent map of unique IDs for any runtime object.
 * Useful when need to identify a specific runtime instance in multiple places and keep uniqueness per instance.
 */
export class ObjectIdentifiers<T extends object> {
    private map: WeakMap<T, string> = new WeakMap();

    public constructor(...initialArr: any[]) {
        for (let item of initialArr) {
            this.get(item);
        }
    }

    public get(key: T, extra: string = '') {
        if (extra != '') extra = '-' + extra;

        if (!objectHelpers.isObject(key)) return null;
        let id = null;
        if (!this.map.has(key)) {
            id = this.generateId();
            this.map.set(key, id);
        } else {
            id = this.map.get(key);
        }

        return id + extra;
    }

    public peek(key: T, extra: string = '') {
        if (extra != '') extra = '-' + extra;

        return this.map.get(key) + extra;
    }

    private generateId() {
        return helpers.newGuid();
    }
}
