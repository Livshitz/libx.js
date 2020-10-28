import DependencyInjector from 'di.libx.js/build/DependencyInjector';

export const di = new DependencyInjector();

/*
import { keys as getKeys } from 'lodash';
import { isEmpty } from 'lodash';
import { helpers } from '../helpers';
import { Map } from '../types/interfaces';

type Resolver = (string)=>IModule;

export class DependencyInjector {
	private pendingFunctions: Map<PendingFunc[]> = {};
	public modules: Map<IModule> = {};
	private _resolver: Resolver;

	public constructor(resolver?: Resolver) {
		this.modules = {};
		this.pendingFunctions = {};
		this._resolver = resolver;
	}

	public register(name, instance) {
		this.modules[name] = instance;
		this._treatReadyPendingFunctions();
		return instance;
	}

	public async registerResolve(name, func) {
		var ret = helpers.newPromise();
		var realInstance = await this.require(func);
		this.register(name, realInstance)
		ret.resolve(realInstance);
		return ret;
	}

	public get(name) {
		var ret = this.modules[name];

		if (ret == null && this._resolver != null) {
			ret = this._resolver(name);
		}

		return ret;
	}
	
	public resolve (func, isGetArray = false) {
		var modulesName = helpers.getParamNames(func);
		if (modulesName == null) return null
		if (modulesName.length == 1 && isGetArray) return this.get(modulesName);

		var ret = [];
		modulesName.forEach(m=> ret.push(this.get(m)));
		return ret;
	}
	
	public inject (func) {
		var modules = this.resolve(func);
		return func.apply(func, modules);
	}

	private _treatReadyPendingFunctions () {
		var pendingModules = getKeys(this.pendingFunctions); //helpers.getCustomProperties(this.pendingFunctions)
		if (isEmpty(pendingModules)) return;

		pendingModules.forEach(modName=>{
			var _mod = this.modules[modName];
			if (_mod == null) return;
			var pendingArr = this.pendingFunctions[modName];
			pendingArr.forEach(pending=>{
				var modulesName = helpers.getParamNames(pending.func);

				var isReady = true;
				modulesName.forEach(modName2=>{
					var _mod2 = this.modules[modName];
					if (_mod2 == null) {
						isReady = false;
						return false;
					}
				})

				if (!isReady) return;

				helpers.extensions.array.remove.call(this.pendingFunctions[modName], pending)
				if (this.pendingFunctions[modName].length == 0) delete this.pendingFunctions[modName];

				this.require(pending.func).then(res=>{
					pending.promise.resolve(res);
				});
			})
		});
	}

	public async require (func) {
		var modulesName = helpers.getParamNames(func);
		return this.requireUgly(modulesName, func);
	}

	public async requireUgly (depsArr, func) {
		var ret = helpers.newPromise();

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

export interface IModule {
	
}

class PendingFunc {
	constructor(public func, public promise) { }
}

export const dependencyInjector = new DependencyInjector();

*/
