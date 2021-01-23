import { IStoreProvider } from '../../src/modules/Cache';
import { DynamicProperties, Mapping, DynamicProps } from '../../src/types/interfaces';

export class LocalStorageMock extends DynamicProps implements IStoreProvider {
    private store = null;

    constructor() {
        super();
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = value.toString();
    }

    removeItem(key) {
        delete this.store[key];
    }
}

declare global {
    interface Window {
        localStorage: LocalStorageMock;
    }
}
