module.exports = (function(){
	var libx = __libx;
	var mod = {};

	mod.string = {};
	mod.date = {};
	mod.array = {};

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

	// [[[[[[[[[[  String Extensions  ]]]]]]]]]]

	mod.string.capitalize = function() {
		return this.replace(/(\w+)/g, libx._.capitalize).trim();
		// return this.charAt(0).toUpperCase() + this.slice(1);
	}

	mod.string.kebabCase = function() {
		return this.replace(/([a-z])([A-Z])/g, '$1-$2')    // get all lowercase letters that are near to uppercase ones
		.replace(/[\s_]+/g, '-')                // replace all spaces and low dash
		.toLowerCase() 							// convert to lower case
	}

	mod.string.camelize = function() {
		return this.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
			return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
		}).replace(/\s+|\-/g, '');
	}

	mod.string.padNumber = function (width, z) {
		var args = arguments;
		z = z || '0';
		var n = this + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	};

	mod.string.contains = function (str) {
		return this.indexOf(str) >= 0;
	};

	mod.string.hashCode = function () {
		var hash = 0;
		if (this.length == 0)
			return hash.toString();
		for (var i = 0; i < this.length; i++) {
			var char = this.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash.toString();
	};

	mod.string.endsWith = function (suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};

	// see below for better implementation!
	mod.string.startsWith = function (prefix) {
		return this.indexOf(prefix) == 0;
	};

	mod.string.isEmpty = function(input = null) {
		var v = input || this;
		return v ? v.trim().length == 0 : true;
	}

	mod.string.format = function () {
		var args = [];

		var ret = this;

		var obj = arguments[0];
		if (obj !== null && typeof obj === 'object') {
			var arr = mod.getCustomProperties(obj);
			for(var i=0; i<arr.length; i++) {
				var x = arr[i];
				ret = ret.replace('{' + x + '}', obj[x])
				// ret = ret.replace(new RegExp('\{' + x + '\}', 'g'), obj[x])
			}
		} else {
			for (var _i = 0; _i < (arguments.length - 0); _i++) {
				args[_i] = arguments[_i + 0];
			}
			if (args.length > 0 && Array.isArray(args[0]))
				args = args[0];
		
			ret = this.replace(/{(\d+)}/g, function (match, number) {
				return typeof args[number] != 'undefined' ? args[number] : match;
			});
		}


		return ret;
	};

	// [[[[[[[[[[  Date Extensions  ]]]]]]]]]]

	mod.date.isValid = function () {
		// An invalid date object returns NaN for getTime() and NaN is the only
		// object not strictly equal to itself.
		return this.getTime() === this.getTime();
	};

	mod.dateFormat = function () {
		var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g, timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, timezoneClip = /[^-+\dA-Z]/g;

		// Regexes and supporting functions are cached through closure
		return function (date, mask, utc) {
			var dF = mod.dateFormat;

			// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
			if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
				mask = date;
				date = undefined;
			}

			// Passing date through Date applies Date.parse, if necessary
			date = date ? new Date(date) : new Date;
			if (isNaN(date))
				throw SyntaxError("invalid date");

			mask = String(dF.masks[mask] || mask || dF.masks["default"]);

			// Allow setting the utc argument via the mask
			if (mask.slice(0, 4) == "UTC:") {
				mask = mask.slice(4);
				utc = true;
			}

			var _ = utc ? "getUTC" : "get", d = date[_ + "Date"](), D = date[_ + "Day"](), m = date[_ + "Month"](), y = date[_ + "FullYear"](), H = date[_ + "Hours"](), M = date[_ + "Minutes"](), s = date[_ + "Seconds"](), L = date[_ + "Milliseconds"](), o = utc ? 0 : date.getTimezoneOffset(), flags = {
				d: d,
				dd: mod.dateFormat.pad(d),
				ddd: dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m: m + 1,
				mm: mod.dateFormat.pad(m + 1),
				mmm: dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy: String(y).slice(2),
				yyyy: y,
				h: H % 12 || 12,
				hh: mod.dateFormat.pad(H % 12 || 12),
				H: H,
				HH: mod.dateFormat.pad(H),
				M: M,
				MM: mod.dateFormat.pad(M),
				s: s,
				ss: mod.dateFormat.pad(s),
				l: mod.dateFormat.pad(L, 3),
				L: mod.dateFormat.pad(L > 99 ? Math.round(L / 10) : L),
				t: H < 12 ? "a" : "p",
				tt: H < 12 ? "am" : "pm",
				T: H < 12 ? "A" : "P",
				TT: H < 12 ? "AM" : "PM",
				Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o: (o > 0 ? "-" : "+") + mod.dateFormat.pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

			return mask.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
			});
		};
	}();

	mod.dateFormat.pad = function (val, len) {
		val = String(val);
		len = len || 2;
		while (val.length < len)
			val = "0" + val;
		return val;
	};

	// Some common format strings
	mod.dateFormat.masks = {
		"default": "ddd mmm dd yyyy HH:MM:ss",
		shortDate: "m/d/yy",
		mediumDate: "mmm d, yyyy",
		longDate: "mmmm d, yyyy",
		fullDate: "dddd, mmmm d, yyyy",
		shortTime: "h:MM TT",
		mediumTime: "h:MM:ss TT",
		longTime: "h:MM:ss TT Z",
		isoDate: "yyyy-mm-dd",
		isoTime: "HH:MM:ss",
		isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
		isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
	};

	// Internationalization strings
	mod.dateFormat.i18n = {
		dayNames: [
			"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
			"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
		],
		monthNames: [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
			"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
		]
	};

	// For convenience...
	mod.date.formatx = function (mask, utc = null) {
		if (mask == null) return this;
		return mod.dateFormat(this, mask, utc);
	};

	mod.date.format = function (strFormat, utc) {
		if (isNaN( this.getTime() )) return null;
		// An invalid date object returns NaN for getTime() and NaN is the only
		// object not strictly equal to itself.
		return mod.dateFormat(this, strFormat, utc);
	};

	mod.date.fromJson = function (aJsonDate) {
		if (aJsonDate == undefined || aJsonDate == '')
			return null;
		var stripped = aJsonDate.replace("/Date(", "").replace(")/", "");
		return new Date(parseInt(stripped, 10));
	};

	mod.date.toJson = function () {
		return '/Date(' + this.getTime() + ')/';
	};

	mod.date.addHours = function (h) {
		let ret = new Date(this);
		ret.setTime(this.getTime() + h * 60 * 60 * 1000);
		return ret;
	};

	// [[[[[[[[[[  Array Extensions  ]]]]]]]]]]

	mod.array.diff = function(a, fn) {
		return this.filter(function(i) {return a.indexOf(i) < 0;});
	};

	mod.array.myFilter = function (fn) {
		var ret = [];
		for(var item of this) {
			if (fn(item)) ret.push(item);
		}
		return ret;
	};

	mod.array.contains = function (item) {
		return this.indexOf(item) != -1;
	}

	mod.array.myFilterSingle = function (fn) {
		var ret = null;
		for(var item of this) {
			if (fn(item)) {
				ret = item;
				break;
			}
		}
		return ret;
	};

	mod.array.remove = function (item) {
		var index = this.indexOf(item);
		if (index > -1) {
			this.splice(index, 1);
		}
		return this;
	}

	// [[[[[[[[[[  -----------  ]]]]]]]]]]

	mod.applyStringExtensions = () => {
		libx.extend(String.prototype, mod.string);
	}
	mod.applyDateExtensions = () => {
		libx.extend(Date.prototype, mod.date);
	}
	mod.applyArrayExtensions = () => {
		libx.extend(Array.prototype, mod.array);
	}

	mod.applyAllExtensions = () => {
		mod.applyStringExtensions();
		mod.applyDateExtensions();
		mod.applyArrayExtensions();
	}

	return mod;
});
