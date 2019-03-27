module.exports = (function(){
	var mod = {};
	mod._ = require('lodash/core');
	mod._.range = require('lodash/range');
	mod._.flatMap = require('lodash/flatMap');
	mod._.uniq = require('lodash/uniq');
	mod._.countBy = require('lodash/countBy');
	mod._.toPairs = require('lodash/toPairs');
	mod._.array = require('lodash/array');
	mod._.includes = require('lodash/includes');
	mod._.transform = require('lodash/transform');
	mod._.groupBy = require('lodash/groupBy');
	mod._.keyBy = require('lodash/keyBy');
	mod._.merge = require('lodash/merge');

	mod._.fp = require("lodash/fp");
	// mod.fp.map = require("lodash/fp/map");
	// mod.fp.flatten = require("lodash/fp/flatten");
	// mod.fp.sortBy = require("lodash/fp/sortBy");
	// mod.fp.flow = require("lodash/fp/flow");

	mod.isBrowser = typeof window !== 'undefined';

	mod.Callbacks = require('./callbacks');
	mod.deferred = require('deferred-js');
	mod.log = require('./log.js');

	mod._.mixin({
		'sortKeysBy': function (obj, comparator) {
			var keys = mod._.sortBy(mod._.keys(obj), function (key) {
				return comparator ? comparator(obj[key], key) : key;
			});
		
			return mod._.zipObject(keys, mod._.map(keys, function (key) {
				return obj[key];
			}));
		}
	});

	mod._projectConfig = null;
	mod.getProjectConfig = (containingFolder, secret)=>{
		var ret = null;
		try {
			if (mod._projectConfig == null) {
				if (global.libx == null) global.libx = {};
				if (global.libx._projconfig != null) {
					return ret = mod._projectConfig = global.libx._projconfig;
				}

				if (!mod.isBrowser) {
					var secretsKey = secret || process.env.FUSER_SECRET_KEY;
					// libx.log.info('!!! Secret key is: ', secretsKey);
					var node = require('../node')
					var projconfig = node.readConfig(containingFolder || '.' + '/project.json', secretsKey);
					global.libx._projconfig = projconfig;
					mod._projectConfig = projconfig;
				} else {
					if (global.projconfig != null) return ret = global.projconfig;
					if (global.libx._projconfig == null) throw "libx:helpers:getProjectConfig: Detected browser, but `window.libx._projconfig` was not provided";
				}
			}
			if (mod._projectConfig == null) throw "libx:helpers:getProjectConfig: Could not find/load project.json in '{0}'".format(containingFolder);
			return ret = mod._projectConfig;
		} finally {
			if (ret != null && ret.private == null) ret.private = {};
			return ret;
		}
	}

	mod.spawnHierarchy = (path)=> {
		var p = path.split('.')
		var cur = this;
		var next = null;
		for(var i=0;i<p.length;i++) {
			next = p[i];
			if (typeof cur[next] == 'undefined') cur[next] = {};
			cur = cur[next];
		}	
		return cur;
	}

	mod.isFunction = function (obj) {
		return mod.type(obj) === "function"
	};
	mod.isArray = Array.isArray || function (obj) {
		return mod.type(obj) === "array"
	};
	mod.isWindow = function (obj) {
		return obj != null && obj == obj.window
	};
	mod.isNumeric = function (obj) {
		return !isNaN(parseFloat(obj)) && isFinite(obj)
	};
	mod.type = function (obj) {
		return obj == null ? String(obj) : mod.class2type[toString.call(obj)] || "object"
	};
	mod.class2type = {
		"[object Boolean]": "boolean",
		"[object Number]": "number",
		"[object String]": "string",
		"[object Function]": "function",
		"[object Array]": "array",
		"[object Date]": "date",
		"[object RegExp]": "regexp",
		"[object Object]": "object"
	};
	mod.isPlainObject = function (obj) {
		var hasOwn = Object.prototype.hasOwnProperty;
		if (!obj || mod.type(obj) !== "object" || obj.nodeType) {
			return false
		}
		try {
			if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
				return false
			}
		} catch (e) {
			return false
		}
		var key;
		for (key in obj) {}
		return key === undefined || hasOwn.call(obj, key)
	}

	mod.throttle = (func, wait, immediate) => {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			
			if (timeout != null) return;
			timeout = setTimeout(later, wait);
			if (immediate) func.apply(context, args);
		};
	};

	mod.debounce = (func, wait, immediate, allowTaillingCall) => {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (allowTaillingCall) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};
	
	mod.newGuid = (useDash) => {
		var dash = useDash ? '-' : '';
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return s4() + s4() + dash + s4() + dash + s4() + dash + s4() + dash + s4() + s4() + s4();
	}
	
	mod.newPromise = () => {
		var promise = mod.deferred();
		return promise;
	}
	
	mod.async = (callback) => {
		var promise = mod.newPromise();
		callback(promise);
		return promise.promise();
	}
	
	mod.chainTasks = async (tasks) => {
		var counter = 0;
	
		for(var i=0; i<tasks.length; i++) {
			var t = tasks[i];
			await t().then(()=> {
				mod.log.debug('chain: done #' + counter++);
			});
		}
	}
	
	mod.isDefined = (obj, prop) => {
		if (typeof obj == 'undefined') return false;
	
		if (prop != null) {
			return mod._.has(obj, prop);
		}
		
		return true;
	}
	
	mod.clone = (target, source) => mod.extend(true, target, source);

	mod.extend = function() {
		var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false,
			toString = Object.prototype.toString,
			hasOwn = Object.prototype.hasOwnProperty,
			push = Array.prototype.push,
			slice = Array.prototype.slice,
			trim = String.prototype.trim,
			indexOf = Array.prototype.indexOf;
			
		if (typeof target === "boolean") {
			deep = target;
			target = arguments[1] || {};
			i = 2;
		}
		if (typeof target !== "object" && !mod.helpers.isFunction(target)) {
			target = {}
		}
		if (length === i) {
			target = this;
			--i;
		}
		for (i; i < length; i++) {
			if ((options = arguments[i]) != null) {
				for (name in options) {
					src = target[name];
					copy = options[name];
					if (target === copy) {
						continue
					}
					if (deep && copy && (mod.isPlainObject(copy) || (copyIsArray = mod.isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && mod.isArray(src) ? src : []
						} else {
							clone = src && mod.isPlainObject(src) ? src : {};
						}
						// WARNING: RECURSION
						target[name] = mod.extend(deep, clone, copy);
					} else if (copy !== undefined) {
						target[name] = copy;
					}
				}
			}
		}
		return target;
	}

	mod.parseJsonFileStripComments = function(content) {
		const matchHashComment = new RegExp(/(?:^|\s)\/\/(.+?)$/, 'gm');
	
		// replaces all hash comments & trim the resulting string
		let json = content.toString('utf8').replace(matchHashComment, '').trim();  
		json = JSON.parse(json);
	
		return json;
	}
	
	mod.parseConfig = function(contents, env) {
		try{
			var obj = mod.parseJsonFileStripComments(contents);
	
			obj.private = mod.extend(obj.private, obj.envs[env].private);
			delete obj.envs[env].private;
			obj = mod.extend(obj, obj.envs[env]);
			delete obj.envs;
	
			var obj2 = JSON.stringify(obj);
			obj2 = obj2.format(mod.extend(obj, obj.private));
			obj = JSON.parse(obj2);
	
			return obj;
		} catch(ex) {
			mod.log.error('readConfig error: ', ex);
		}
	}

	mod.shallowCopy = function(obj) {
		return Object.assign({}, obj);
	}

	mod.hexc = function(colorval) {
		try {
			var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			delete(parts[0]);
			for (var i = 1; i <= 3; ++i) {
				parts[i] = parseInt(parts[i]).toString(16);
				if (parts[i].length == 1) parts[i] = '0' + parts[i];
			}
			color = '#' + parts.join('');
			return color;
		} catch(e) { 
			return undefined;
		}
	}

	mod.jsonify = function (obj, isCompact) {
		// return JSON.stringify(obj, null, "\t");

		if (isCompact) {
			return JSON.stringify(obj,function(k,v){
				if(v instanceof Array)
				   return JSON.stringify(v);
				return v;
			 },4);
			 
		}

		return JSON.stringify(obj, null, 4); 
	}
	
	mod.sleep = async (time, callback) => {
		var stop = new Date().getTime();
		while(new Date().getTime() < stop + time) {
			;
		}
		callback();
	}
	
	mod.waitUntil = async (conditionFn, callback, interval, timeoutSec) => {
		var interval = interval || 10;
		var timeoutSec = timeoutSec || 5;
		var expiry = new Date();
		expiry.setSeconds(expiry.getSeconds() + timeoutSec);
	
		var wrapper = async () => {
			if (mod.isAsync(conditionFn)) {
				return await conditionFn();
			} else {
				return conditionFn();
			}
		};
	
		// Check before waiting
		if (await wrapper()) {
			callback();
			return;
		}
	
		// Wait and check again
		var i = setInterval(async () => {
			if (new Date() > expiry) {
				clearInterval(i);
				return;
			}
			if (await wrapper()) {
				clearInterval(i);
				callback();
			}
		}, interval);
	}
	
	mod.isAsync = function (func) {
		const string = func.toString().trim();
	
		return !!(
			// native
			string.match(/^async /) ||
			// babel (this may change, but hey...)
			string.match(/return _ref[^\.]*\.apply/)
			// insert your other dirty transpiler check
	
			// there are other more complex situations that maybe require you to check the return line for a *promise*
		);
	}
	
	mod.newGuid = (useDash) => {
		var dash = useDash ? '-' : '';
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return s4() + s4() + dash + s4() + dash + s4() + dash + s4() + dash + s4() + s4() + s4();
	}
	
	mod.stringifyOnce = function(obj, replacer, indent){
		var printedObjects = [];
		var printedObjectKeys = [];
	
		function printOnceReplacer(key, value){
			if ( printedObjects.length > 2000){ // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
			return 'object too long';
			}
			var printedObjIndex = false;
			printedObjects.forEach(function(obj, index){
				if(obj===value){
					printedObjIndex = index;
				}
			});
	
			if ( key == ''){ //root element
				 printedObjects.push(obj);
				printedObjectKeys.push("root");
				 return value;
			}
	
			else if(printedObjIndex+"" != "false" && typeof(value)=="object"){
				if ( printedObjectKeys[printedObjIndex] == "root"){
					return "(pointer to root)";
				}else{
					return "(see " + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase()  : typeof(value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
				}
			}else{
	
				var qualifiedKey = key || "(empty key)";
				printedObjects.push(value);
				printedObjectKeys.push(qualifiedKey);
				if(replacer){
					return replacer(key, value);
				}else{
					return value;
				}
			}
		}
		return JSON.stringify(obj, printOnceReplacer, indent);
	};

	mod.getMatches = (string, regex, index)=> {
		index || (index = 1); // default to the first capturing group
		var matches = [];
		var match;
		while (match = regex.exec(string)) {
			matches.push(match[index]);
		}
		return matches;
	}

	var getGlobalProperties = function() {
		mod._globalProps = Object.getOwnPropertyNames( new Object() );
	}();

	mod.getCustomProperties = function (obj) { // Note: Using Object.prototype as global extension will mess up other libraries, not recomended.
		var currentPropList = Object.getOwnPropertyNames( obj /*this*/ );

		return currentPropList.filter( findDuplicate );

		function findDuplicate( propName ) {
			return mod._globalProps.indexOf( propName ) === -1;
		}
	}

	mod.isNull = (obj) => obj == undefined || obj == null;
	mod.isFunction = (obj) => (typeof obj === "function");
	mod.isEmptyObject = function( obj ) {
	for ( var name in obj ) {
		return false;
	}
	return true;
	};
	mod.isEmptyString = (obj) => obj == null || obj == "";
	mod.isEmpty = function (obj) {
		if (obj == null) return true;
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop))
				return false;
		}

		return JSON.stringify(obj) === JSON.stringify({});
	}

	mod.makeEmpty = (obj) => {
		mod._.each(Object.keys(obj), prop=>{
			if (!obj.hasOwnProperty(prop)) return;
	
			if (Array.isArray(obj[prop])) {
				obj[prop] = [];
			} else if (typeof obj[prop] == "object") {
				hasContent = true;			
				mod.makeEmpty(obj[prop]);
			} else {
				obj[prop] = '';
			}
		});
		
		return obj;
	}

	mod.base64ToUint8Array = (base64String) => {
		var padding = mod._.repeat('=', (4 - base64String.length % 4) % 4);
		var base64 = (base64String + padding)
			.replace(/\-/g, '+')
			.replace(/_/g, '/');

		var rawData = window.atob(base64);
		var outputArray = new Uint8Array(rawData.length);

		for (var i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}

	mod.jsonRecurse = function (obj, byid, refs, prop, parent) {
		if (typeof obj !== 'object' || !obj)
			return obj;
		if (Object.prototype.toString.call(obj) === '[object Array]') {
			for (var i = 0; i < obj.length; i++)
				// check also if the array element is not a primitive value
				if (typeof obj[i] !== 'object' || !obj[i])
					return obj[i];
				else if ("$ref" in obj[i])
					obj[i] = window.jsonRecurse(obj[i], byid, refs, i, obj);
				else
					obj[i] = window.jsonRecurse(obj[i], byid, refs, prop, obj);
			return obj;
		}
		if ("$ref" in obj) {
			var ref = obj.$ref;
			if (ref in byid)
				return byid[ref];

			// else we have to make it lazy:
			refs.push([parent, prop, ref]);
			return;
		} else if ("$id" in obj) {
			var id = obj.$id;
			delete obj.$id;
			if ("$values" in obj)
				obj = obj.$values.map(window.jsonRecurse);
			else
				for (var prop in obj)
					obj[prop] = window.jsonRecurse(obj[prop], byid, refs, prop, obj);
			byid[id] = obj;
		}
		return obj;
	};

	mod.jsonResolveReferences = function (json) {
		if (typeof json === 'string')
			json = JSON.parse(json);

		var byid = {}, refs = [];
		json = window.jsonRecurse(json, byid, refs); // run it!

		for (var i = 0; i < refs.length; i++) {
			var ref = refs[i];
			ref[0][ref[1]] = byid[ref[2]];
			// Notice that this throws if you put in a reference at top-level
		}
		return json;
	};

	mod.delay = function(milliseconds) {
		var start = window.performance.now();
		var end = window.performance.now();
		while (end - start < milliseconds) {
			end = window.performance.now();
		}
		return end - start;
	}

	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	var ARGUMENT_NAMES = /([^\s,]+)/g;
	mod.getParamNames = function(func) {
		var fnStr = func.toString().replace(STRIP_COMMENTS, '');
		var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
		if(result === null)
			result = [];
		return result;
	}

	mod.randomNumber = function(max, min){
		if (max == null) max = 100;
		if (min == null) min = 0;
		return Math.floor(Math.random() * (max - min + 1)) + min;
		//return Math.floor(Math.random(0,max)*100);
	}

	mod.shuffle = function(a) {
		var ret = a;
		var j, x, i;
		for (i = ret.length; i; i--) {
			j = Math.floor(Math.random() * i);
			x = ret[i - 1];
			ret[i - 1] = ret[j];
			ret[j] = x;
		}
		return ret;
	}

	return mod;
})();
