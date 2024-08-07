import { StringExtensions } from '../../extensions/StringExtensions';
import { helpers } from '../../helpers';
import { objectHelpers } from '../../helpers/ObjectHelpers';
// import { EventsStream } from './EventsStream';
import { Callbacks } from '../Callbacks';
import { di } from '../dependencyInjector';
import { log } from '../log';

export class Firebase {
    private maxDate = new Date('01/01/2200').getTime(); //7258111200000 //32503672800000;
    private entityVersion = 0;
    private static readonly _DEFAULT_SIZE = 100;

    public firebasePathPrefix = null;
    public onReady = new Callbacks();
    private _database: any;
    public firebaseApp: any;
    public firebaseProvider: any;
    // public events = new EventsStream();

    constructor(firebaseApp, firebaseProvider) {
        // libx.di.require(_appEvents=> {
        // 	appEvents = _appEvents;
        // })

        this.firebaseApp = firebaseApp;
        this.firebaseProvider = firebaseProvider;
        this._database = this.firebaseApp.database();

        this.isConnected((connected) => {
            if (connected) this.onReady.trigger();
        });
    }

    public async isConnected(callback: Function) {
        if (this._database == null) return false;
        var ret = this.get('.info/connected');
        if (callback != null) {
            this.listen('.info/connected', (isConnected) => {
                callback(isConnected);
                // this.events.emit({ step: 'connection-changed', value: isConnected }, 'firebase');
            });
        }
        return ret;
    }

    public makeKey(givenTimestamp?: number) {
        var date = givenTimestamp || Date.now();
        return (this.maxDate - date).toString() + '-' + Math.round(helpers.randomNumber(0, 100) * 100);
    }

    public getRef(path: string, type?, callback?: Function) {
        path = this._fixPath(path);
        if (type != null && callback != null) {
            return this._database.ref(path).on(type, callback);
        } else {
            return this._database.ref(path);
        }
    }

    public listen(path: string, callback: Function) {
        path = this._fixPath(path);
        log.debug('api.firebase.listen: Listening to "' + path + '"');
        return this._database.ref(path).on('value', function (snp) {
            log.debug('api.firebase.listen: Value Changed at "' + path + '"');
            var obj = snp?.val();
            callback(obj);
        });
    }

    public listenChild<T = any>(path: string, callback: (string, T) => void) {
        path = this._fixPath(path);
        log.debug('api.firebase.listenChild: Listening to "' + path + '"');
        this._database.ref(path).on('child_changed', function (snp) {
            const childPath = snp.getRef().path.pieces_.slice(1).join('/');
            var obj = snp?.val();
            log.debug('api.firebase.listenChild: Value Changed at "' + childPath + '"', obj);
            callback(childPath, obj);
        });
    }

    public unlisten(path: string) {
        path = this._fixPath(path);
        log.debug('api.firebase.unlisten: Stopping listening to "' + path + '"');
        this._database.ref(path).off('value');
    }

    public get(path: string) {
        path = this._fixPath(path);
        log.debug('api.firebase.get: Getting "' + path + '"');
        var defer = helpers.newPromise();
        this._database
            .ref(path)
            .once('value')
            .then(function (snp) {
                var obj = snp.val();
                defer.resolve(obj);
            })
            .catch((ex) => defer.reject(ex));
        return defer.promise();
    }

    public getPage(path: string, lastKey = null, size = Firebase._DEFAULT_SIZE) {
        path = this._fixPath(path);
        log.debug('api.firebase.get: Getting "' + path + '"');
        var defer = helpers.newPromise();
        let ref = this._database.ref(path).orderByKey();

        if (lastKey != null) {
            ref = ref.startAt(lastKey);
        }

        ref.limitToFirst(size)
            .once('value')
            .then(function (snp) {
                var obj = snp.val();
                defer.resolve(obj);
            })
            .catch((ex) => defer.reject(ex));

        return defer.promise();
    }

    public update(path: string, data, avoidFill = true) {
        path = this._fixPath(path);
        log.debug('api.firebase.update: Updating data to "' + path + '"', data);
        var defer = helpers.newPromise();

        data = this._fixObj(data);

        if (!avoidFill) data = this._fillMissingFields(data, path);
        this._database
            .ref(path)
            .update(data)
            .then(function () {
                defer.resolve(path);
            })
            .catch((ex) => defer.reject(ex));
        return defer.promise();
    }

    public set(path: string, data, avoidFill = true) {
        path = this._fixPath(path);
        log.debug('api.firebase.set: Setting data to "' + path + '"', data);
        var defer = helpers.newPromise();

        data = this._fixObj(data);

        if (!avoidFill) data = this._fillMissingFields(data, path);
        this._database
            .ref(path)
            .set(data)
            .then(function () {
                defer.resolve(path);
            })
            .catch((ex) => defer.reject(ex));
        return defer.promise();
    }

    public push(path: string, data, avoidFill = true) {
        path = this._fixPath(path);
        var key = this.makeKey();
        log.debug('api.firebase.push: Pushing to "' + path + '" key=' + key, data);
        var defer = helpers.newPromise();

        data = this._fixObj(data);

        if (data._entity == null) data._entity = {};
        data._entity.id = key;
        if (!avoidFill) data = this._fillMissingFields(data, path);
        this._database
            .ref(path + '/' + key)
            .set(data)
            .then(function () {
                defer.resolve({ key, path: path + '/' + key });
            })
            .catch((ex) => defer.reject(ex));
        return defer.promise();
    }

    public delete(path: string) {
        path = this._fixPath(path);
        log.debug('api.firebase.delete: Removing data to "' + path + '"');
        var defer = helpers.newPromise();
        this._database
            .ref(path)
            .remove()
            .then(function () {
                defer.resolve(path);
            })
            .catch((ex) => defer.reject(ex));
        return defer.promise();
    }

    public async increment(path: string, key: string) {
        path = this._fixPath(path);
        const r = this._database.ref(path);
        return await r.update({
            [`${key}`]: this._database.app.firebase.database.ServerValue.increment(1)
        });
    }

    public filter(path: string, byChild, byValue, lastKey: string = undefined, size = Firebase._DEFAULT_SIZE, asArray = false) {
        path = this._fixPath(path);
        log.debug(
            StringExtensions.format.apply('api.firebase.filter: Querying data from "{0}", by child "{1}", by value "{2}"', [
                path,
                byChild,
                byValue,
            ])
        );
        var defer = helpers.newPromise();
        let ref = this._database.ref(path).orderByChild(byChild);

        if (lastKey != undefined) {
            ref = ref.startAt(byValue, lastKey).limitToFirst(size);
        } else if (lastKey == null) {
            ref = ref.equalTo(byValue).limitToFirst(size);
        }

        ref.once('value')
            .then((snp) => {
                var obj = snp.val();
                if (obj != null && asArray) obj = this.dictToArray(obj);
                defer.resolve(obj);
            })
            .catch((ex) => defer.reject(ex));
        return defer.promise();
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

    public onPresent(path: string, value, onDisconnectValue: Function) {
        path = this._fixPath(path);
        this.isConnected((isConnected) => {
            log.debug(
                `api.firebase.onPresent: Setting presence on '${path}', with value '${value}' (onDisconnectValue: '${onDisconnectValue}')`
            );
            if (!isConnected) return;
            var ref = this.getRef(path);
            if (onDisconnectValue == null) ref.onDisconnect().remove();
            else ref.onDisconnect().set(onDisconnectValue);
            ref.set(value || true);
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
        if (this.firebasePathPrefix == null) return path;
        if (path.startsWith(this.firebasePathPrefix)) return path;
        if (path.startsWith('.')) return path;
        if (!path.startsWith('/') && !this.firebasePathPrefix.endsWith('/')) path = '/' + path;
        return this.firebasePathPrefix + path;
    }
}

export interface IFirebaseInstance {
    set(path: string, value: any);
    auth();
    listen(string, callback: Function);
}

di.register('Firebase', Firebase);
