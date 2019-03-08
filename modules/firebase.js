module.exports = function(firebaseProvider){
	var mod = {};

	mod.maxDate = new Date('01/01/2200').getTime(); //7258111200000 //32503672800000;
	mod.entityVersion = 0;
	mod.firebaseProvider = firebaseProvider;

	mod.makeKey = function(givenTimestamp) {
		var date = givenTimestamp || Date.now();
		return (mod.maxDate - date).toString() + "-" + Math.round(Math.random(0,100)*100);
	}

	mod.listen = function(path, callback) {
		console.log('api.firebase.listen: Listening to \"' + path + '\"');
		mod.firebaseProvider.database().ref(path).on('value', function(snp) {
			console.log('api.firebase.listen: Value Changed at \"' + path + '\"');
			var obj = snp.val();
			callback(obj);
		});
	}

	mod.get = function(path) {
		console.log('api.firebase.get: Getting \"' + path + '\"');
		var defer = $.Deferred();
		mod.firebaseProvider.database().ref(path).once('value').then(function(snp) {
			var obj = snp.val();
			defer.resolve(obj);
		});
		return defer.promise();
	}

	mod.update = function(path, data, avoidFill) {
		console.log('api.firebase.update: Updating data to \"' + path + '\"', data);
		var defer = $.Deferred();

		data = mod._fixObj(data);

		if (!avoidFill) data = mod._fillMissingFields(data, path);
		mod.firebaseProvider.database().ref(path).update(data).then(function() {
			defer.resolve(path);
		});
		return defer.promise();
	}

	mod.set = function(path, data) {
		console.log('api.firebase.set: Setting data to \"' + path + '\"', data);
		var defer = $.Deferred();

		data = mod._fixObj(data);

		data = mod._fillMissingFields(data, path);
		mod.firebaseProvider.database().ref(path).set(data).then(function() {
			defer.resolve(path);
		});
		return defer.promise();
	}

	mod.push = function(path, data, avoidFill) {
		var key = mod.makeKey();
		console.log('api.firebase.push: Pushing to \"' + path + '\" key=' + key, data);
		var defer = $.Deferred();

		data = mod._fixObj(data);
		
		data.id = key;
		if (!avoidFill) data = mod._fillMissingFields(data, path);
		mod.firebaseProvider.database().ref(path + '/' + key).set(data).then(function() {
			defer.resolve(key, path + '/' + key);
		});
		return defer.promise();
	}

	mod.delete = function(path) {
		console.log('api.firebase.delete: Removing data to \"' + path + '\"');
		var defer = $.Deferred();
		mod.firebaseProvider.database().ref(path).remove().then(function() {
			defer.resolve(path);
		});
		return defer.promise();
	}

	mod.filter = function(path, byChild, byValue) {
		console.log('api.firebase.filter: Querying data from "{0}", by child "{1}", by value "{2}"'.format(path, byChild, byValue));
		var defer = $.Deferred();
		mod.firebaseProvider.database().ref(path).orderByChild(byChild).equalTo(byValue).once('value').then(function(snp) {
			var obj = snp.val();
			obj = mod.dictToArray(obj);
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
		var pairs = _.toPairs(dict);
		var ret = [];
		_.each(pairs, function(pair) {
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

	mod._fixObj = function(data) {
		return JSON.parse( JSON.stringify(data)); // In order to clear 'undefined' values
	}

	mod._fillMissingFields = function(data, path) {
		if (data == null) return null;

		var date = new Date();
		
		// Delete 'date' field
		if (data.date != null) {
			data.createDate = data.date;
			data.date = null;
		}

		if (data.createDate == null) data.createDate = date.toISOString();
		if (data.createDateTime == null) data.createDateTime = date.getTime();
		
		if (data.entityVersion == null) data.entityVersion = mod.entityVersion;

		if (data.id == null) {
			data.id = mod.getIdFromPath(path);
		}

		return data;
	}


	return mod;
}
