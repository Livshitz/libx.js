import { IStoreProvider } from './Cache';
import { DynamicProperties, Mapping, DynamicProps } from '../types/interfaces';

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

    // when accessing localStorage under frame when in incognito, localStorage throws access denied error.
    public static safeGetLocalStorage() {
        let localStorage = null;
        try {
            localStorage = window.localStorage;
        }
        catch (e) { }
        if (localStorage == null) {
            localStorage = <any>new LocalStorageMock();
        }

        return localStorage;
    }
}

declare global {
    interface Window {
        localStorage: LocalStorageMock;
    }
}
