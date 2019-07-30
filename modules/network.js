module.exports = (function(){
	var mod = {};

	var libx = __libx; //require('../bundles/essentials.js');

	var http = require('http');
	var https = require('https');
	var urlapi = require('url');
	mod.url = urlapi;

	mod.httpGetJson = async (url, _options)=> {
		_options = libx.extend({}, _options, { headers: { 'Content-Type': 'application/json; charset=UTF-8' }, enc: 'utf-8' });
		let ret = await mod.httpGet(url, _options);
		return JSON.parse(ret);
	}
	
	mod.httpGetString = async (url, _options)=> {
		_options = libx.extend({}, _options, { enc: 'utf-8' });
		let ret = await mod.httpGet(url, _options);
		return ret.toString(); //Buffer.concat(ret).toString(_options.enc);
	}

	mod.httpGet = async (url, _options)=> {
		let ret = await mod.httpRequest(url, null, 'GET', _options);
		return ret;
	};

	mod.httpPost = async (url, data, _options)=> {
		return await mod.httpRequest(url, data, 'POST', _options);
	};

	mod.httpPostJson = async (url, data, _options)=> {
		let ret = await mod.httpRequest(url, data, 'POST', _options);
		return JSON.parse(ret);
	};

	mod.httpRequest = async (url, data, method, _options)=> {
		var defer = libx.newPromise();

		url = mod.helpers.fixUrl(url);

		var dest = mod.helpers.parseUrl(url);
		var options = {
			headers: {
				'Accept': "*/*",
				// 'Origin': origin,
				// 'Referer': origin,
				// 'User-Agent': 'Mozilla/5.0'
				// 'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36",
				//'Content-Type':'application/x-www-form-urlencoded'
				// 'client': process.env.MOVIEGLU_CLIENT,
				/*
				'x-api-key': process.env.MOVIEGLUE_API_KEY,
				'api-version': process.env.MOVIEGLU_API_VERSION,
				'Authorization': process.env.MOVIEGLUE_AUTHORISATION,
				'geolocation': user.loc[0] + ';' + user.loc[1],
				*/
				// 'Content-Type': 'application/json; charset=UTF-8',
				// 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				// 'Content-Length': Buffer.byteLength(data)
			},
			// host: dest.hostname, 
			// path: dest.path,
			// port: dest.port,
			enc: null,
			method: method || 'GET',
			withCredentials: false,
			dataType: "json",
			autoParse: false,
		};
		libx.clone(_options, options);
		libx.clone(dest, options);

		// Fill in missing content type based on dataType:
		if (options.dataType != null && options.headers['content-type'] == null) {
			if (options.dataType == 'json') options.headers['content-type'] = 'application/json; charset=UTF-8';
			else if (options.dataType == 'formData') options.headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
		}

		var op = http;
		if (dest.protocol == 'https:') op = https;

		var request = op.request(options, (res) => {
			if (options.enc) res.setEncoding(options.enc);

			var data = [];
			res.on('data', function (chunk) {
				data.push(libx.Buffer.from(chunk));
			});
			res.on('end', function () {
				let buffer = null;
				if (data != null) {
					if (data.length == 1) buffer = data[0];
					else buffer = libx.Buffer.concat(data); //  data; 
				}
				if (res.statusCode == 200) return defer.resolve(buffer);
				else defer.reject({ statusCode: res.statusCode, response: buffer});
			});
		});

		// post the data
		if (data != null) {
			var dataObj = data;
			if (options.dataType == "json") dataObj = JSON.stringify(data);
			else if (options.dataType == "formData") dataObj = mod.helpers.params(data);
			//if (options.headers['Content-Type'] != null && options.headers['Content-Type'].startsWith("application/x-www-form-urlencoded")) dataObj = mod.helpers.getFormData(data);
			request.write(dataObj);
		} 

		request.on('error', function (e) {
			libx.log.error(e.message);
			defer.reject(e);
		});
		request.end();

		return defer;
	}

	mod.helpers = {};

	mod.helpers.fixUrl = function(url, prefixUrl) {
		var sep = "://";
		var pos = url.indexOf(sep);
		if (pos > -1) {
			var startOfUrl = url.slice(0,pos);
			var restOfUrl = url.slice(pos+3);
			restOfUrl = restOfUrl.replace(/\/+/g, '/')
			url = startOfUrl + sep + restOfUrl;
		} else {
			url = url.replace(/\/+/g, '/');
		}

		prefixUrl = prefixUrl || "";


		var isAbsoluteUrl = pos > -1; // url.contains("//");
		url = mod.helpers.cleanUrl((!isAbsoluteUrl ? prefixUrl : "") + url)
		
		return url;
	}

	mod.helpers.parseUrl = function(url) {
		return urlapi.parse(url);

		var l = document.createElement("a");
		l.href = url;
		return l;
	};

	mod.helpers.cleanUrl = function (url) {
		if (url == null) return null;
		//return url.replace('/(?<!http:)\/\//g', '/');
		return url.replace(new RegExp("([^:]\/)\/+", "g"), "$1");
	};

	mod.helpers.getFormData = object => {
		const formData = new FormData();
		Object.keys(object).forEach(key => {
			if (libx.isObject(object[key])) 
				formData.append(key, mod.helpers.getFormData(object[key]));
			else 
				formData.append(key, object[key])
		});
		return formData;
	}
	// object => Object.keys(object).reduce((formData, key) => {
	// 	formData.append(key, object[key]);
	// 	return formData;
	// }, new FormData());

	mod.helpers.formDataToString = formDataObj => [...formDataObj.entries()] // expand the elements from the .entries() iterator into an actual array
		.map(e => encodeURIComponent(e[0]) + "=" + encodeURIComponent(e[1]));  // transform the elements into encoded key-value-pairs

	mod.helpers.params = (params, keys = [], isArray = false) => {
		const p = Object.keys(params).map(key => {
			let val = params[key]
		
			if ("[object Object]" === Object.prototype.toString.call(val) || Array.isArray(val)) {
				if (Array.isArray(params)) {
					keys.push("")
				} else {
					keys.push(key)
				}
				return mod.helpers.params(val, keys, Array.isArray(val))
			} else {
				let tKey = key
		
				if (keys.length > 0) {
					const tKeys = isArray ? keys : [...keys, key]
					tKey = tKeys.reduce((str, k) => { return "" === str ? k : `${str}[${k}]` }, "")
				}
				if (isArray) {
					return `${ tKey }[]=${ val }`
				} else {
					return `${ tKey }=${ val }`
				}
			}
		}).join('&')
		
		keys.pop()
		return p
	}
	
	return mod;
})();

(()=>{ // Dependency Injector auto module registration
	__libx.di.register('network', module.exports);
})();