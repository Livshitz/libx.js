module.exports = (function(){ // dependencyInjector.js
	var mod = {};

	mod.modules = {};

	mod.register = (name, instance)=>{
		mod.modules[name] = instance;
		return instance;
	}
	mod.get = (name)=>{
		var ret = mod.modules[name];

		if (ret == null && mod.resolver != null) { // try to require a module
			ret = mod.resolver(name);
		}

		return ret;
	}
	mod.resolve = (func, isGetArray)=>{
		var modulesName = libx.getParamNames(func);
		if (modulesName == null) return null
		if (modulesName.length == 1 && isGetArray) return mod.get(modulesName);

		var ret = [];
		modulesName.forEach(m=> ret.push(mod.get(m)));
		return ret;
	}
	mod.inject = (func)=>{
		var modules = mod.resolve(func);
		return func.apply(func, modules);
	}

	return mod;
})();