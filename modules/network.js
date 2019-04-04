module.exports = (function(){
	var mod = {};

	var libx = __libx; //require('../bundles/essentials.js');

	var http = require('http');
	var https = require('https');
	var urlapi = require('url');
	mod.url = urlapi;

	mod.httpGetJson = async (url, _options)=> {
		var ret = await mod.httpGet(url, _options);
		return JSON.parse(ret);
	}

	mod.httpGet = (url, _options)=> {
		return mod.httpRequest(url, null, 'GET', _options);
	};

	mod.httpPost = (url, data, _options)=> {
		return mod.httpRequest(url, data, 'POST', _options);
	};

	mod.httpRequest = (url, data, method, _options)=> {
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
			method: method || 'GET',
			withCredentials: false,
			dataType: "json",
		};
		libx.clone(options, _options);
		options = libx.extend(dest, options);

		var op = http;
		if (dest.protocol == 'https:') op = https;
		var request = op.request(options, (res) => {
			var data = [];
			res.on('data', function (chunk) {
				data.push(chunk);
			});
			res.on('end', function () {
				var buffer = Buffer.concat(data);
				if (res.statusCode == 200) return defer.resolve(buffer);
				else defer.reject({ statusCode: res.statusCode, response: buffer});
			});
		});

		// post the data
		if (data != null) request.write(JSON.stringify(data));

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

	
	return mod;
})();

(()=>{ // Dependency Injector auto module registration
	__libx.di.register('network', module.exports);
})();