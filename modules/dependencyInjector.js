module.exports = (function(){ // dependencyInjector.js
	var libx = __libx;

	var getKeys = require('lodash/keys');
	var isEmpty = require('lodash/isEmpty');

	class PendingFunc {
		constructor(func, promise) {
			this.func = func;
			this.promise = promise;
		}
	}

	return class {
		constructor() {
			this.modules = {};
			this.pendingFunctions = {};
		}

		register(name, instance) {
			this.modules[name] = instance;
			this._treatReadyPendingFunctions();
			return instance;
		}

		async registerResolve(name, func) {
			var ret = libx.newPromise();
			var realInstance = await this.require(func);
			this.register(name, realInstance)
			ret.resolve(realInstance);
			return ret;
		}

		get(name) {
			var ret = this.modules[name];

			if (ret == null && this.resolver != null) { // try to require a module
				ret = this.resolver(name);
			}

			return ret;
		}
		
		resolve (func, isGetArray) {
			var modulesName = libx.getParamNames(func);
			if (modulesName == null) return null
			if (modulesName.length == 1 && isGetArray) return this.get(modulesName);

			var ret = [];
			modulesName.forEach(m=> ret.push(this.get(m)));
			return ret;
		}
		
		inject (func) {
			var modules = this.resolve(func);
			return func.apply(func, modules);
		}

		_treatReadyPendingFunctions () {
			var pendingModules = getKeys(this.pendingFunctions); //libx.getCustomProperties(this.pendingFunctions)
			if (isEmpty(pendingModules)) return;

			pendingModules.forEach(modName=>{
				var _mod = this.modules[modName];
				if (_mod == null) return;
				var pendingArr = this.pendingFunctions[modName];
				pendingArr.forEach(pending=>{
					var modulesName = libx.getParamNames(pending.func);
	
					var isReady = true;
					modulesName.forEach(modName2=>{
						var _mod2 = this.modules[modName];
						if (_mod2 == null) {
							isReady = false;
							return false;
						}
					})
	
					if (!isReady) return;

					libx.extensions.array.remove.call(this.pendingFunctions[modName], pending)
					if (this.pendingFunctions[modName].length == 0) delete this.pendingFunctions[modName];

					this.require(pending.func).then(res=>{
						pending.promise.resolve(res);
					});
				})
			});
		}

		async require (func) {
			var modulesName = libx.getParamNames(func);
			return this.requireUgly(modulesName, func);
		}

		async requireUgly (depsArr, func) {
			var ret = libx.newPromise();

			var modules = [];
			var modulesName = depsArr;
			var wasMissing = false;
			modulesName.forEach(m=> { 
				var _mod = this.get(m);
				if (_mod != null) modules.push(_mod);
				else {
					wasMissing = true;
					if (this.pendingFunctions[m] == null) this.pendingFunctions[m] = [];
					this.pendingFunctions[m].push(new PendingFunc(func, ret));
				}
			})
			if (!wasMissing) {
				var res = func.apply(func, modules);
				ret.resolve(res);
			}

			return ret;
		}

	}
	
})();