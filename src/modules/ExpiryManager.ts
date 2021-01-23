import { Deferred } from 'concurrency.libx.js';
import { helpers } from '../helpers';
import { di } from '../modules/dependencyInjector';
import { log } from '../modules/log';
import { Mapping } from '../types/interfaces';

export class ExpiryManager {
    private static readonly _DefaultExpiryMS = 5 * 60 * 1000; // 5 min
    private _expiryMap: Mapping<Date> = {};

    public constructor(private expiryPeriodMS: number = ExpiryManager._DefaultExpiryMS) {
        log.v('ExpiryManager:ctor: Ready');
    }

    public isExpired(key: string): boolean {
        if (this.expiryPeriodMS == 0) return false;

        let expiryObj = this._expiryMap[key];
        if (expiryObj == null) return true;
        let expiry = new Date(expiryObj);
        if (expiry == null) return true;
        else if (expiry > new Date()) return false;
        else return true;
    }

    public delete(key: string) {
        delete this._expiryMap[key];
    }

    public setExpiry(key: string, expiryPeriodMS: number = null): Date {
        let expiry = new Date().addMilliseconds(expiryPeriodMS || this.expiryPeriodMS);
        this._expiryMap[key] = expiry;
        return expiry;
    }

    public clear(): void {
        this._expiryMap = {};
    }
}

di.register(ExpiryManager, 'ExpiryManager');
