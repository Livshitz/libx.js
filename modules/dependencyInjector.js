module.exports = (function(){ // dependencyInjector.js
	return class {
		constructor() {
			this.modules = {};
		}

		register(name, instance) {
			this.modules[name] = instance;
			return instance;
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

	}
	
})();