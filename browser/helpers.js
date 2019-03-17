module.exports = (function(){
	var mod = {};
	var log = require('../modules/log.js');
	var libx = require('../bundles/essentials.js');
	if (global._ == null) global._ = libx._;
	global._.fp = libx._.fp;

	mod.isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

	mod.injectScript = function(src, onReady) {
		/*
		return new Promise((resolve, reject) => {
				let script = document.createElement('script');
				script.async = true;
				script.src = src;
				script.addEventListener('load', () => resolve());
				script.addEventListener('error', () => reject('Error loading script.'));
				script.addEventListener('abort', () => reject('Script loading aborted.'));
				document.head.appendChild(script);
		});
		*/
		var head= document.getElementsByTagName('head')[0];
		var script= document.createElement('script');
		script.type= 'text/javascript';
		script.onreadystatechange= function () {
			if (this.readyState == 'complete') onReady(src);
		}
		script.onload= onReady;
		script.src= src;
		head.appendChild(script);
	}

	mod.injectCss = function(filename) {
		var fileref = document.createElement("link")
		fileref.setAttribute("rel", "stylesheet")
		fileref.setAttribute("type", "text/css")
		fileref.setAttribute("href", filename)
		if (typeof fileref != "undefined")
			document.getElementsByTagName("head")[0].appendChild(fileref)
	}

	mod.reload = () => {
		window.location.reload();
	}

	mod.events = {};
	mod.events.subscribe = (eventName, callback) => {
		document.addEventListener(eventName, callback)
	}
	mod.events.broadcast = (eventName) => {
		var event = document.createEvent("Event");
		event.initEvent(eventName);
		document.dispatchEvent(event);
	};

	mod.messages = {};
	mod.messages.subscribe = (channelName, callback) => {
		document.addEventListener(channelName, function (e) {
			callback(e.detail.message);
		});

		// window.addEventListener("message", receiveMessage, false);
	}
	mod.messages.broadcast = (channelName, message) => {
		var newEvent = new CustomEvent(channelName, {
			detail: {
				message: message
			}
		});
		document.dispatchEvent(newEvent);

		// window.postMessage("hello there!", "http://example.com");
	}

	mod.uploadFile = function(folderName, filesInput, callback){
		var fd = new FormData();
		//Take the first selected file
		fd.append("file", filesInput[0]);
		fd.append("destFolder", 'cvs');

		$http.post("api/uploadFile", fd, {
			withCredentials: true,
			headers: { 'Content-Type': undefined, 'destFolder': folderName },
			transformRequest: angular.identity,
		}).success(function (data) {
			log.verbose('uploadFile:success', data);
			callback(filesInput[0], data)
			//$scope.newApp.imageInfo = files[0];
			//alert('ok');
		}).error(function () {
			alert("File upload failed!");
		});
	}

	mod.isIframe = function () {
		try {
			return window.self !== window.top;
		} catch (e) {
			return true;
		}
	};

	mod.copyToClipboard = (text) => {
		var textArea,
			copy;

		var p = libx.newPromise();

		function isOS() {
			return navigator.userAgent.match(/ipad|iphone/i);
		}

		function createTextArea(text) {
			textArea = document.createElement('textArea');
			textArea.value = text;
			document.body.appendChild(textArea);
		}

		function selectText() {
			var range,
				selection;

			if (isOS()) {
				range = document.createRange();
				range.selectNodeContents(textArea);
				selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
				textArea.setSelectionRange(0, 999999);
			} else {
				textArea.select();
			}
		}

		function copyToClipboard() {        
			document.execCommand('copy');
			document.body.removeChild(textArea);
		}
		
		var copy = function(text) {
			createTextArea(text);
			selectText();
			copyToClipboard();
			p.resolve(text);	
		};
		copy(text);
		
		return p;
	}

	mod.getHost = function (absUrl) {
		var url = absUrl || location.href;
		var hostname;
		//find & remove protocol (http, ftp, etc.) and get hostname

		if (url.indexOf("://") > -1) {
			hostname = url.split('/')[2];
		} else {
			hostname = url.split('/')[0];
		}

		//find & remove port number
		//hostname = hostname.split(':')[0];
		//find & remove "?"
		hostname = hostname.split('?')[0];

		return url.substr(0, url.indexOf("://") + 3) + hostname + '/';
	};

	mod.urlize = function (obj) {
		var str = "";
		for (var key in obj) {
			if (obj[key] == null) continue;
			if (str != "") {
				str += "&";
			}
			str += key + "=" + encodeURIComponent(obj[key]);
		}
		return str;
	};

	mod.getParameters = function () {
		var search = location.search;
		search = search.replace(/(?![?&])([^=&?]+)(\=)?([^&]+)?/g, '$1=$3'); // fix missing values, e.g: ?hint -> ?hint=
		search = search.substring(1);
		if (search == null || search == "") return {};
		return JSON.parse('{"' + decodeURI(search).replace(/\"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
	};

	mod.querialize = function(obj, avoidPrefix) {
		if (obj == null || obj.length < 1) return null;
		var str = [];
		for (var p in obj)
			if (obj.hasOwnProperty(p)) {
			str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		}
		return (!avoidPrefix ? '?' : '') + str.join("&");
	}

	mod.getAttributes = function ($node, pattern) {
		var attrs = {};
		jQuery.each($node[0].attributes, function (index, attribute) {
			var attrName = attribute.name;
			if (pattern != null) {
				var match = attrName.match(pattern);
				if (match == null) return;
				attrName = match[1];
			}
			attrName = attrName.replace('-', '_');
			attrs[attrName] = attribute.value;
		});

		return attrs;
	};

	mod.cleanUrl = function (url) {
		if (url == null) return null;
		//return url.replace('/(?<!http:)\/\//g', '/');
		return url.replace(new RegExp("([^:]\/)\/+", "g"), "$1");
	};

	mod.getSubDomain = ()=> { 
		var p = window.location.host.split('.');
		if ( p.length>2 ) return p[0];
		else return null;
	}

	// urlParams
	mod.urlParams;
	(window.onpopstate = function () {
		var match,
			pl     = /\+/g,  // Regex for replacing addition symbol with a space
			search = /([^&=]+)=?([^&]*)/g,
			decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
			query  = window.location.search.substring(1);

		mod.urlParams = {};
		while (match = search.exec(query))
			mod.urlParams[decode(match[1])] = decode(match[2]);
	})();

	mod.enableLogDisplay = function() {
		/*
		mod.setDebugDiv = function () {
			log.verbose('Setting debug div');
			if (typeof console != "undefined") if (typeof log.verbose != 'undefined') console.olog = log.verbose;else console.olog = function () {};
		
			log.verbose = function (message) {
				console.olog(message);
				$('#debugDiv').append('<xmp>' + message + '</xmp><hr />');
			};
			console.error = console.debug = console.info = log.verbose;
		};
		*/

		var log = document.querySelector('#log');
		if (log == null) alert('app.enableLogDisplay: Could not find #log!');

		['log','warn','error'].forEach(function (verb) {
			console[verb] = (function (method, verb, log) {
				return function (text) {
					method(_.join(arguments, ""));
					// handle distinguishing between methods any way you'd like
					var msg = document.createElement('code');
					msg.style="display:block;";
					msg.classList.add(verb);
					msg.textContent = verb + ": " + _.join(arguments, "");
					log.appendChild(msg);
					log.scrollTo(0,log.scrollHeight);
				};
			})(console[verb].bind(console), verb, log);
		});
	}

	mod.pauseOnInactivity = function (videoElm) {
		if (window.lastSeen == null) {
			window.lastSeen = 0;
			var loop = function loop() {
				window.lastSeen = Date.now();
				setTimeout(loop, 1000);
			};
			loop();
		}

		videoElm.addEventListener('timeupdate', function () {
			if (Date.now() - window.lastSeen > 1000) {
				log.verbose("pauseOnInactivity: Timeout reached, pausing!");
				this.pause();
			}
		}, false);
	};

	//#endregion

	//#region libx.jQueryExt
	mod.jQueryExt = {};
	mod.jQueryExt.setup = function($){
		$.postJson = function (url, jsonData) {
			//log.verbose('postJson: posting url:' + url);
			var ret = $.ajax({
				url: url,
				type: 'POST',
				dataType: 'json',
				data: JSON.stringify(jsonData),
				contentType: 'application/json; charset=utf-8'
			});
			return ret;
		};

		$.getJson = function (url) {
			var args = [];
			for (var _i = 0; _i < (arguments.length - 1); _i++) {
				args[_i] = arguments[_i + 1];
			}
			var fullUrl = url.format(args);

			//log.verbose('getJson: getting url:' + fullUrl);
			return $.when($.getJSON(fullUrl));
		};

		$.getJsonSync = function (url) {
			var args = [];
			for (var _i = 0; _i < (arguments.length - 1); _i++) {
				args[_i] = arguments[_i + 1];
			}
			var fullUrl = url.format(args);

			var ret = $.ajax({
				url: fullUrl,
				type: 'GET',
				async: false,
				cache: false,
				dataType: 'json',
				contentType: 'application/json; charset=utf-8'
			});

			return $.when(ret);
		};

		$.expr[':']['hasText'] = function (node, index, props) {
			return node.textContent.trim() == props[3];
			//return node.textContent.contains(props[3]);
		};
	}
	mod.jQueryExt.applyReveal = function(){
		if (jQuery().viewportChecker == null) return;
		jQuery('[reveal-reset]').viewportChecker({
			classToAdd: 'visible animated',
			removeClassAfterAnimation: false, 
			repeat: true,
			offset: '10%', //200,
			callbackFunction: function(elem, action){
				//libx.log.verbose('viewportChecker:reveal-reset');
				var e = $(elem);
				if (action=='add'){
					e.addClass(e.attr('reveal-reset'));
				}else{
					e.removeClass(e.attr('reveal-reset'));
				}
			}
		});
		jQuery('[reveal]').viewportChecker({
			classToAdd: 'visible animated',
			removeClassAfterAnimation: false, 
			//repeat: true,
			//classToRemove: 'fadeInUp visible animated',
			offset: '10%',
			callbackFunction: function(elem, action){
				//libx.log.verbose('viewportChecker:reveal');
				var e = $(elem);
				if (action=='add'){
					e.addClass(e.attr('reveal'));
				}else{
					e.removeClass(e.attr('reveal'));
				}
			}
			
			//classToAdd: 'visible', // Class to add to the elements when they are visible,
			//classToAddForFullView: 'full-visible', // Class to add when an item is completely visible in the viewport
			//classToRemove: 'invisible', // Class to remove before adding 'classToAdd' to the elements
			//removeClassAfterAnimation: false, // Remove added classes after animation has finished
			//offset: [100 OR 10%], // The offset of the elements (let them appear earlier or later). This can also be percentage based by adding a '%' at the end
			//invertBottomOffset: true, // Add the offset as a negative number to the element's bottom
			//repeat: false, // Add the possibility to remove the class if the elements are not visible
			//callbackFunction: function(elem, action){}, // Callback to do after a class was added to an element. Action will return "add" or "remove", depending if the class was added or removed
			//scrollHorizontal: false // Set to true if your website scrolls horizontal instead of vertical.
		});
	};

	if (typeof jQuery != "undefined") {
		jQuery(document).ready(function() {    
			//log.verbose('ext2 - configuring reveal')
			mod.jQueryExt.applyReveal();
		});	
	} else {
		log.warning('helpers: jQuery is not defined, skipping jQuery libx setup...');
	}
	//#endregion

	mod.getImageMeta = function (url) {
		// var deferred = new $.Deferred();
		var defer = libx.newPromise();
		var img = new Image();
		img.addEventListener("load", function () {
			defer.resolve({ width: this.naturalWidth, height: this.naturalHeight });
		});
		img.src = url;
		return defer.promise();
	};

	mod.queryString = function (name) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);
		if (results == null)
			return "";
		else
			return decodeURIComponent(results[1].replace(/\+/g, " "));
	};

	mod.getIdFromUrl = function () {
		var matches = window.location.pathname.match(/\/(\d*)$/);
		if (matches == null || matches.length < 2)
			return null;
		return parseInt(matches[1]);
	};



	return mod;

})();
