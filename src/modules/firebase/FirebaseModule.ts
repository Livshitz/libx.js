import { StringExtensions } from '../../extensions/StringExtensions';
import { helpers } from '../../helpers';
import { objectHelpers } from '../../helpers/ObjectHelpers';
// import { EventsStream } from './EventsStream';
import { Callbacks } from '../Callbacks';
import { di } from '../dependencyInjector';
import { log } from '../log';

console.log('DEBUG TST 6');

// Firebase Modular SDK imports
import {
    getDatabase,
    ref,
    get,
    set,
    update,
    remove,
    onValue,
    off,
    push as fbPush,
    query,
    orderByChild,
    orderByKey,
    equalTo,
    startAt,
    limitToFirst,
    onDisconnect as fbOnDisconnect,
    increment as fbIncrement,
    onChildChanged,
    type Database,
    type DatabaseReference,
    type DataSnapshot,
    type Unsubscribe,
} from 'firebase/database';
import {
    getStorage,
    ref as fbStorageRef,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    type FirebaseStorage,
    type StorageReference,
} from 'firebase/storage';
import type { FirebaseApp } from 'firebase/app';
import { libx } from '../../bundles/essentials';

export class Firebase {
    private maxDate = new Date('01/01/2200').getTime(); //7258111200000 //32503672800000;
    private entityVersion = 0;
    private static readonly _DEFAULT_SIZE = 100;

    public firebasePathPrefix = null;
    public onReady = new Callbacks();
    private _database: Database;
    private _storage: FirebaseStorage;
    public firebaseApp: FirebaseApp;
    public firebaseConfig: any;
    private _listeners: Map<string, Unsubscribe> = new Map();
    private presenceListener: Unsubscribe = null;
    // public events = new EventsStream();

    constructor(firebaseApp: FirebaseApp, firebaseConfig?: any) {
        // libx.di.require(_appEvents=> {
        // 	appEvents = _appEvents;
        // })

        console.log('[TEST] 6');

        this.firebaseApp = firebaseApp;
        this.firebaseConfig = firebaseConfig;
        // The databaseURL is already configured in firebaseApp via initializeApp.
        // Calling getDatabase with the URL again can cause initialization conflicts.
        this._database = getDatabase(firebaseApp);
        this._storage = getStorage(firebaseApp);

        this.isConnected((connected) => {
            if (connected) this.onReady.trigger();
        }).catch(err => {
            libx.log.w('FirebaseModule:ctor: error while setting up isConnected', err?.message ?? err);
        });
    }

    public async isConnected(callback?: Function) {
        if (this._database == null) return false;
        const p = helpers.newPromise();
        if (this.presenceListener) this.presenceListener();
        this.presenceListener = this.listen('.info/connected', (isConnected) => {
            console.log('DBG: isConnected', isConnected);
            if (!p?._settled) p.resolve(isConnected);
            if (callback) callback(isConnected);
            // this.events.emit({ step: 'connection-changed', value: isConnected }, 'firebase');
        });
        return p;
    }

    public makeKey(givenTimestamp?: number) {
        var date = givenTimestamp || Date.now();
        return (this.maxDate - date).toString() + '-' + Math.round(helpers.randomNumber(0, 100) * 100);
    }

    public getRef(path: string, type?: string, callback?: Function): DatabaseReference | Unsubscribe {
        path = this._fixPath(path);
        const dbRef = ref(this._database, path);

        if (type != null && callback != null) {
            // Return unsubscribe function
            return onValue(dbRef, (snapshot: DataSnapshot) => {
                callback(snapshot);
            });
        } else {
            return dbRef;
        }
    }

    public listen(path: string, callback: Function): Unsubscribe {
        path = this._fixPath(path);
        log.debug('api.firebase.listen: Listening to "' + path + '"');

        // Unlisten to existing listener if any
        this.unlisten(path);

        const dbRef = ref(this._database, path);
        const unsubscribe = onValue(dbRef, (snapshot: DataSnapshot) => {
            log.debug('api.firebase.listen: Value Changed at "' + path + '"');
            const obj = snapshot?.val();
            callback(obj);
        });

        // Store unsubscribe function
        this._listeners.set(path, unsubscribe);

        return unsubscribe;
    }

    public listenChild<T = any>(path: string, callback: (childPath: string, data: T) => void): Unsubscribe {
        path = this._fixPath(path);
        log.debug('api.firebase.listenChild: Listening to "' + path + '"');

        const dbRef = ref(this._database, path);
        const unsubscribe = onChildChanged(dbRef, (snapshot: DataSnapshot) => {
            // Extract child path from ref
            const fullPath = snapshot.ref.toString();
            const databaseURL = this._database.app.options.databaseURL as string;
            const childPath = fullPath.split(databaseURL)[1] || fullPath;
            const obj = snapshot?.val();
            log.debug('api.firebase.listenChild: Value Changed at "' + childPath + '"', obj);
            callback(childPath, obj);
        });

        return unsubscribe;
    }

    public unlisten(path: string): void {
        path = this._fixPath(path);
        log.debug('api.firebase.unlisten: Stopping listening to "' + path + '"');

        const unsubscribe = this._listeners.get(path);
        if (unsubscribe) {
            unsubscribe();
            this._listeners.delete(path);
        }
    }

    public async get(path: string): Promise<any> {
        // Hardcoded fix for .info/connected path with modular SDK
        if (path.includes('.info/connected')) {
            try {
                const dbRef = ref(this._database, '/.info/connected');
                const snapshot = await get(dbRef);
                return snapshot.val();
            } catch (ex) {
                throw ex;
            }
        }

        path = this._fixPath(path);
        log.debug('api.firebase.get: Getting "' + path + '"');

        try {
            const dbRef = ref(this._database, path);
            const snapshot = await get(dbRef);
            return snapshot.val();
        } catch (ex) {
            throw ex;
        }
    }

    public async getPage(path: string, lastKey: string = null, size = Firebase._DEFAULT_SIZE): Promise<any> {
        path = this._fixPath(path);
        log.debug('api.firebase.get: Getting "' + path + '"');

        try {
            const dbRef = ref(this._database, path);
            let dbQuery;

            if (lastKey != null) {
                dbQuery = query(dbRef, orderByKey(), startAt(lastKey), limitToFirst(size));
            } else {
                dbQuery = query(dbRef, orderByKey(), limitToFirst(size));
            }

            const snapshot = await get(dbQuery);
            return snapshot.val();
        } catch (ex) {
            throw ex;
        }
    }

    public async update(path: string, data: any, avoidFill = true): Promise<string> {
        path = this._fixPath(path);
        log.debug('api.firebase.update: Updating data to "' + path + '"', data);

        data = this._fixObj(data);

        if (!avoidFill) data = this._fillMissingFields(data, path);

        try {
            const dbRef = ref(this._database, path);
            await update(dbRef, data);
            return path;
        } catch (ex) {
            throw ex;
        }
    }

    public async set(path: string, data: any, avoidFill = true): Promise<string> {
        path = this._fixPath(path);
        log.debug('api.firebase.set: Setting data to "' + path + '"', data);

        data = this._fixObj(data);

        if (!avoidFill) data = this._fillMissingFields(data, path);

        try {
            const dbRef = ref(this._database, path);
            await set(dbRef, data);
            return path;
        } catch (ex) {
            throw ex;
        }
    }

    public async push(path: string, data: any, avoidFill = true): Promise<{ key: string; path: string; }> {
        path = this._fixPath(path);
        const key = this.makeKey();
        log.debug('api.firebase.push: Pushing to "' + path + '" key=' + key, data);

        data = this._fixObj(data);

        if (data._entity == null) data._entity = {};
        data._entity.id = key;
        if (!avoidFill) data = this._fillMissingFields(data, path);

        try {
            const dbRef = ref(this._database, path + '/' + key);
            await set(dbRef, data);
            return { key, path: path + '/' + key };
        } catch (ex) {
            throw ex;
        }
    }

    public async delete(path: string): Promise<string> {
        path = this._fixPath(path);
        log.debug('api.firebase.delete: Removing data to "' + path + '"');

        try {
            const dbRef = ref(this._database, path);
            await remove(dbRef);
            return path;
        } catch (ex) {
            throw ex;
        }
    }

    public async increment(path: string, key: string): Promise<void> {
        path = this._fixPath(path);
        const dbRef = ref(this._database, path);
        await update(dbRef, {
            [key]: fbIncrement(1),
        });
    }

    public async filter(
        path: string,
        byChild: string,
        byValue: any,
        lastKey: string = undefined,
        size = Firebase._DEFAULT_SIZE,
        asArray = false
    ): Promise<any> {
        path = this._fixPath(path);
        log.debug(
            StringExtensions.format.apply('api.firebase.filter: Querying data from "{0}", by child "{1}", by value "{2}"', [
                path,
                byChild,
                byValue,
            ])
        );

        try {
            const dbRef = ref(this._database, path);
            let dbQuery;

            if (lastKey !== undefined) {
                dbQuery = query(dbRef, orderByChild(byChild), startAt(byValue, lastKey), limitToFirst(size));
            } else if (lastKey === null) {
                dbQuery = query(dbRef, orderByChild(byChild), equalTo(byValue), limitToFirst(size));
            }

            const snapshot = await get(dbQuery);
            let obj = snapshot.val();
            if (obj != null && asArray) obj = this.dictToArray(obj);
            return obj;
        } catch (ex) {
            throw ex;
        }
    }

    public getIdFromPath(path: string) {
        var tmp = path.match(/\/?.+\/(.+?)\/?$/);
        if (tmp == null || tmp.length == 0) return null;
        return tmp[1];
    }

    public dictToArray(dict: {}) {
        return helpers.dictToArray(dict);
    }

    public arrayToDic(arr: []) {
        return helpers.arrayToDic(arr);
    }

    public parseKeyDate(key: string) {
        var reversedTimestamp = key.match(/(\d+)\-\d+/)[1];
        var reversedTimestampNum = parseInt(reversedTimestamp);
        var timestamp = this.maxDate - reversedTimestampNum;
        return new Date(timestamp);
    }

    public onPresent(path: string, value: any, onDisconnectValue?: any): void {
        path = this._fixPath(path);
        this.isConnected((isConnected) => {
            log.debug(
                `api.firebase.onPresent: Setting presence on '${path}', with value '${value}' (onDisconnectValue: '${onDisconnectValue}')`
            );
            if (!isConnected) return;

            const dbRef = ref(this._database, path);
            const disconnectRef = fbOnDisconnect(dbRef);

            if (onDisconnectValue == null) {
                disconnectRef.remove();
            } else {
                disconnectRef.set(onDisconnectValue);
            }

            set(dbRef, value || true);
        });
    }

    public cleanObjectId(objectId: string, char = '-') {
        return objectId.replace(/[\.\#\$\/\[\]\&]/g, char);
    }

    public _fixObj(data: string) {
        if (data == null) return null;
        return JSON.parse(JSON.stringify(data)); // In order to clear 'undefined' values
    }

    public _fillMissingFields(data, path: string) {
        if (data == null) return null;

        var date = new Date();

        // Delete 'date' field

        if (typeof data != 'object') return data;

        if (data._entity == null) {
            data._entity = {};
        }
        if (data._entity.date != null) {
            data._entity.createDate = data._entity.date;
            data._entity.date = null;
        }

        if (data._entity.createDate == null) data._entity.createDate = date.toISOString();
        if (data._entity.createDateTime == null) data._entity.createDateTime = date.getTime();

        if (data._entity.entityVersion == null) data._entity.entityVersion = this.entityVersion;

        if (data._entity.id == null) {
            data._entity.id = this.getIdFromPath(path);
        }

        return data;
    }

    public _fixPath(path: string) {
        // Special .info paths require a leading slash and should not be prefixed.
        if (path.includes('.info')) {
            return path.startsWith('/') ? path : '/' + path;
        }

        if (this.firebasePathPrefix == null) return path;
        if (path.startsWith(this.firebasePathPrefix)) return path;

        if (!path.startsWith('/') && !this.firebasePathPrefix.endsWith('/')) path = '/' + path;
        return this.firebasePathPrefix + path;
    }

    // ==================== Storage Methods ====================

    /**
     * Upload a file to Firebase Storage
     * @param path - Storage path (e.g., 'user/123/file.jpg')
     * @param data - File data (Blob, File, or Uint8Array)
     * @param metadata - Optional metadata for the file
     * @returns Storage path
     */
    public async uploadFile(path: string, data: Blob | Uint8Array | ArrayBuffer): Promise<string> {
        try {
            const storageRef = fbStorageRef(this._storage, path);
            await uploadBytes(storageRef, data);
            log.debug('api.firebase.uploadFile: Uploaded to "' + path + '"');
            return path;
        } catch (ex) {
            log.error('api.firebase.uploadFile: Failed:', ex);
            throw ex;
        }
    }

    /**
     * Get download URL for a file
     * @param path - Storage path
     * @returns Download URL
     */
    public async getFileUrl(path: string): Promise<string> {
        try {
            const storageRef = fbStorageRef(this._storage, path);
            const url = await getDownloadURL(storageRef);
            log.debug('api.firebase.getFileUrl: Got URL for "' + path + '"');
            return url;
        } catch (ex) {
            log.error('api.firebase.getFileUrl: Failed:', ex);
            throw ex;
        }
    }

    /**
     * Delete a file from Storage
     * @param path - Storage path
     */
    public async deleteFile(path: string): Promise<void> {
        try {
            const storageRef = fbStorageRef(this._storage, path);
            await deleteObject(storageRef);
            log.debug('api.firebase.deleteFile: Deleted "' + path + '"');
        } catch (ex) {
            log.error('api.firebase.deleteFile: Failed:', ex);
            throw ex;
        }
    }

    /**
     * Upload and get URL in one call (convenience method)
     * @param path - Storage path
     * @param data - File data (Blob, File, or Uint8Array)
     * @returns Download URL
     */
    public async uploadAndGetUrl(path: string, data: Blob | Uint8Array | ArrayBuffer): Promise<string> {
        await this.uploadFile(path, data);
        return await this.getFileUrl(path);
    }

    /**
     * Get a storage reference for advanced operations
     * @param path - Storage path
     * @returns StorageReference
     */
    public getStorageRef(path: string): StorageReference {
        return fbStorageRef(this._storage, path);
    }
}

export interface IFirebaseInstance {
    set(path: string, value: any);
    auth();
    listen(string, callback: Function);
}

di.register('Firebase', Firebase);
