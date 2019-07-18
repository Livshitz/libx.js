module.exports = function(firebaseApp, firebaseProvider){
	var mod = {};

	var libx = __libx;

	require('./appEvents');
	var appEvents = null;
	libx.di.require(_appEvents=> {
		appEvents = _appEvents;
	})

	mod.maxDate = new Date('01/01/2200').getTime(); //7258111200000 //32503672800000;
	mod.entityVersion = 0;
	mod.firebaseApp = firebaseApp;
	mod.firebaseProvider = firebaseProvider;
	mod._database = mod.firebaseApp.database();
	mod.firebasePathPrefix = null;
	mod.onReady = new libx.Callbacks();

	mod.isConnected = async (callback) => {
		var ret = mod.get('.info/connected');
		if (callback != null) {
			mod.listen('.info/connected', isConnected => {
				callback(isConnected);
				if (appEvents != null) appEvents.broadcast('firebase', { step: 'connection-changed', value: isConnected });
			});
		}
		return ret;
	}

	mod.makeKey = function(givenTimestamp) {
		var date = givenTimestamp || Date.now();
		return (mod.maxDate - date).toString() + "-" + Math.round(Math.random(0,100)*100);
	}

	mod.getRef = (path, type, callback)=>{
		path = mod._fixPath(path);
		if (type != null && callback != null) {
			return mod._database.ref(path).on(type, callback);
		} else {
			return mod._database.ref(path)
		}

	}

	mod.listen = function(path, callback) {
		path = mod._fixPath(path);
		libx.log.debug('api.firebase.listen: Listening to \"' + path + '\"');
		mod._database.ref(path).on('value', function(snp) {
			libx.log.debug('api.firebase.listen: Value Changed at \"' + path + '\"');
			var obj = snp.val();
			callback(obj);
		});
	}

	mod.get = function(path) {
		path = mod._fixPath(path);
		libx.log.debug('api.firebase.get: Getting \"' + path + '\"');
		var defer = libx.newPromise();
		mod._database.ref(path).once('value').then(function(snp) {
			var obj = snp.val();
			defer.resolve(obj);
		});
		return defer.promise();
	}

	mod.update = function(path, data, avoidFill = true) {
		path = mod._fixPath(path);
		libx.log.debug('api.firebase.update: Updating data to \"' + path + '\"', data);
		var defer = libx.newPromise();

		data = mod._fixObj(data);

		if (!avoidFill) data = mod._fillMissingFields(data, path);
		mod._database.ref(path).update(data).then(function() {
			defer.resolve(path);
		});
		return defer.promise();
	}

	mod.set = function(path, data, avoidFill = true) {
		path = mod._fixPath(path);
		libx.log.debug('api.firebase.set: Setting data to \"' + path + '\"', data);
		var defer = libx.newPromise();

		data = mod._fixObj(data);

		if (!avoidFill) data = mod._fillMissingFields(data, path);
		mod._database.ref(path).set(data).then(function() {
			defer.resolve(path);
		});
		return defer.promise();
	}

	mod.push = function(path, data, avoidFill = true) {
		path = mod._fixPath(path);
		var key = mod.makeKey();
		libx.log.debug('api.firebase.push: Pushing to \"' + path + '\" key=' + key, data);
		var defer = libx.newPromise();

		data = mod._fixObj(data);

		if (data._entity == null) data._entity = {};
		data._entity.id = key;
		if (!avoidFill) data = mod._fillMissingFields(data, path);
		mod._database.ref(path + '/' + key).set(data).then(function() {
			defer.resolve(key, path + '/' + key);
		});
		return defer.promise();
	}

	mod.delete = function(path) {
		path = mod._fixPath(path);
		libx.log.debug('api.firebase.delete: Removing data to \"' + path + '\"');
		var defer = libx.newPromise();
		mod._database.ref(path).remove().then(function() {
			defer.resolve(path);
		});
		return defer.promise();
	}

	mod.filter = function(path, byChild, byValue) {
		path = mod._fixPath(path);
		libx.log.debug('api.firebase.filter: Querying data from "{0}", by child "{1}", by value "{2}"'.format(path, byChild, byValue));
		var defer = libx.newPromise();
		mod._database.ref(path).orderByChild(byChild).equalTo(byValue).once('value').then(function(snp) {
			var obj = snp.val();
			if (obj != null) obj = mod.dictToArray(obj);
			defer.resolve(obj);
		});
		return defer.promise();
	}

	mod.getIdFromPath = function(path) {
		var tmp = path.match(/\/?.+\/(.+?)\/?$/);
		if (tmp == null || tmp.length ==0) return null;
		return tmp[1];
	}

	mod.dictToArray = function(dict) {
		var pairs = libx._.toPairs(dict);
		var ret = [];
		libx._.each(pairs, function(pair) {
			if (pair[1].id == null) pair[1].id = pair[0];
			else pair[1]._id = pair[0];

			ret.push(pair[1]);
		});

		return ret;
	}

	mod.parseKeyDate = function(key) {
		var reversedTimestamp = key.match(/(\d+)\-\d+/)[1];
		reversedTimestamp = parseInt(reversedTimestamp);
		var timestamp = mod.maxDate - reversedTimestamp;
		return new Date(timestamp);
	}

	mod.onPresent = (path, value, onDisconnectValue)=>{
		path = mod._fixPath(path);
		mod.isConnected((isConnected)=>{
			libx.log.debug(`api.firebase.onPresent: Setting presence on '${path}', with value '${value}' (onDisconnectValue: '${onDisconnectValue}')`)
			if (!isConnected) return;
			var ref = mod.getRef(path);
			if (onDisconnectValue == null)
				ref.onDisconnect().remove();
			else
				ref.onDisconnect().set(onDisconnectValue);
			ref.set(value || true);
		});
	};

	mod._fixObj = function(data) {
		return JSON.parse( JSON.stringify(data)); // In order to clear 'undefined' values
	}

	mod._fillMissingFields = function(data, path) {
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

		if (data._entity.entityVersion == null) data._entity.entityVersion = mod.entityVersion;

		if (data._entity.id == null) {
			data._entity.id = mod.getIdFromPath(path);
		}

		return data;
	}

	mod._fixPath = (path)=> {
		if (mod.firebasePathPrefix == null) return path;
		if (path.startsWith(mod.firebasePathPrefix)) return path;
		if (path.startsWith('.')) return path;
		if (!path.startsWith('/') && !mod.firebasePathPrefix.endsWith('/')) path = '/' + path;
		return mod.firebasePathPrefix + path;
	}

	mod.isConnected((isConnected)=>{
		mod.isReady = isConnected;
		if (isConnected) {
			mod.onReady.trigger();
			if (appEvents != null) appEvents.broadcast('firebase', { step: 'ready' });
		}
	})

	return mod;
};

(()=>{ // Dependency Injector auto module registration
	__libx.di.register('Firebase', module.exports);
})();
