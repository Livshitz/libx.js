import { helpers as libxHelpers } from '../helpers';
import { log } from '../modules/log';
import { network } from '../modules/Network';

declare const jQuery: any;

export class BrowserHelpers {
    public urlParams;
    public isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    public lastSeen: number;

    public constructor() {
        // If not browser, quit here!
        if (!libxHelpers.isBrowser) {
            return;
        }

        const _self = this;

        (window.onpopstate = function () {
            var match,
                pl = /\+/g, // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s) {
                    return decodeURIComponent(s.replace(pl, ' '));
                },
                query = window.location.search.substring(1);

            _self.urlParams = {};
            while ((match = search.exec(query))) _self.urlParams[decode(match[1])] = decode(match[2]);
        })();

        if (typeof jQuery != 'undefined') {
            jQuery(document).ready(function () {
                //log.verbose('ext2 - configuring reveal')
                this.jQueryExt.applyReveal();
            });
        } else {
            if (log) log.warning('helpers: jQuery is not defined, skipping jQuery libx setup...');
        }

        if (console) (<any>console).watch = this.watch;
    }

    public urlize = function (obj) {
        var str = '';
        for (var key in obj) {
            if (obj[key] == null) continue;
            if (str != '') {
                str += '&';
            }
            str += key + '=' + encodeURIComponent(obj[key]);
        }
        return str;
    };

    public cleanUrl = function (url) {
        if (url == null) return null;
        return url.replace(new RegExp('([^:]/)/+', 'g'), '$1');
    };

    public querialize = function (obj, avoidPrefix) {
        if (obj == null || obj.length < 1) return null;
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            }
        return (!avoidPrefix ? '?' : '') + str.join('&');
    };

    public injectScript = function (src, onReady, doc = document) {
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
        var head = doc.getElementsByTagName('head')[0];
        var script = doc.createElement('script');
        script.type = 'text/javascript';
        (<any>script).onreadystatechange = function () {
            if (this.readyState == 'complete') onReady(src);
        };
        script.onload = onReady;
        script.src = src;
        head.appendChild(script);
    };

    public injectCss = function (filename, doc = document) {
        var fileref = doc.createElement('link');
        fileref.setAttribute('rel', 'stylesheet');
        fileref.setAttribute('type', 'text/css');
        fileref.setAttribute('href', filename);
        if (typeof fileref != 'undefined') doc.getElementsByTagName('head')[0].appendChild(fileref);
    };

    public reload = () => {
        window.location.reload();
    };

    public events = {
        subscribe: (eventName, callback) => {
            document.addEventListener(eventName, callback);
        },
        broadcast: (eventName) => {
            var event = document.createEvent('Event');
            event.initEvent(eventName);
            document.dispatchEvent(event);
        },
    };

    public messages = {
        subscribe: (channelName, callback) => {
            document.addEventListener(channelName, function (e) {
                callback(e.detail.message);
            });

            // window.addEventListener("message", receiveMessage, false);
        },
        broadcast: (channelName, message) => {
            var newEvent = new CustomEvent(channelName, {
                detail: {
                    message: message,
                },
            });
            document.dispatchEvent(newEvent);

            // window.postMessage("hello there!", "http://example.com");
        },
    };

    public uploadFile = function (folderName, filesInput, callback) {
        var fd = new FormData();
        //Take the first selected file
        fd.append('file', filesInput[0]);
        fd.append('destFolder', 'cvs');

        network
            .httpPost('api/uploadFile', fd, {
                withCredentials: true,
                headers: { 'Content-Type': undefined, destFolder: folderName },
                // transformRequest: angular.identity,
            })
            .then(function (data) {
                log.verbose('uploadFile:success', data);
                callback(filesInput[0], data);
                //$scope.newApp.imageInfo = files[0];
                //alert('ok');
            })
            .catch(function (err) {
                log.error('File upload failed!', err);
            });
    };

    public isIframe = function () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    };

    public copyToClipboard = (text) => {
        let textArea, copy;

        let p = libxHelpers.newPromise();

        function isOS() {
            return navigator.userAgent.match(/ipad|iphone/i);
        }

        function createTextArea(text) {
            textArea = document.createElement('textArea');
            textArea.value = text;
            document.body.appendChild(textArea);
        }

        function selectText() {
            var range, selection;

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

        copy = function (text) {
            createTextArea(text);
            selectText();
            copyToClipboard();
            p.resolve(text);
        };
        copy(text);

        return p;
    };

    public getHost = function (absUrl) {
        var url = absUrl || location.href;
        var hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname

        if (url.indexOf('://') > -1) {
            hostname = url.split('/')[2];
        } else {
            hostname = url.split('/')[0];
        }

        //find & remove port number
        //hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];

        return url.substr(0, url.indexOf('://') + 3) + hostname + '/';
    };

    public getParameters = function () {
        var search = location.search;
        search = search.replace(/(?![?&])([^=&?]+)(\=)?([^&]+)?/g, '$1=$3'); // fix missing values, e.g: ?hint -> ?hint=
        search = search.substring(1);
        if (search == null || search == '') return {};
        return JSON.parse('{"' + decodeURI(search).replace(/\"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    };

    public getAttributes = function ($node, pattern) {
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

    public getSubDomain = () => {
        var p = window.location.host.split('.');
        if (p.length > 2) return p[0];
        else return null;
    };

    public getDomain = () => {
        var p = window.location.host.split('.');
        if (p.length > 2) return p[1];
        else if (p.length > 1) return p[0];
        else return null;
    };

    public localDownload = (data, fileName, type = 'data:text/plain;charset=utf-8') => {
        // var blob = new Blob([data], {type: type}); // "text/plain"
        // FileSaver.saveAs(blob, fileName);

        var uri = type + ',' + data;
        var downloadLink = document.createElement('a');
        downloadLink.href = uri;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    public localDownloadBlob = (data, fileName, type = 'octet/stream;charset=utf-8') => {
        var a = document.createElement('a');
        document.body.appendChild(a);
        (<any>a).style = 'display: none';

        if (libxHelpers.ObjectHelpers.isObject(data)) {
            data = JSON.stringify(data);
        }
        var blob = new Blob([data], { type: type });
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    public enableLogDisplay() {
        /*
		public setDebugDiv = function () {
			log.verbose('Setting debug div');
			if (typeof console != "undefined") if (typeof log.verbose != 'undefined') console.olog = log.verbose;else console.olog = function () {};
		
			log.verbose = function (message) {
				console.olog(message);
				$('#debugDiv').append('<xmp>' + message + '</xmp><hr />');
			};
			console.error = console.debug = console.info = log.verbose;
		};
		*/

        let log = document.querySelector('#log');
        if (log == null) alert('app.enableLogDisplay: Could not find #log!');

        ['log', 'warn', 'error'].forEach(function (verb) {
            console[verb] = (function (method, verb, log) {
                return function (text) {
                    method(libxHelpers._.join(arguments, ''));
                    // handle distinguishing between methods any way you'd like
                    var msg = document.createElement('code');
                    (<any>msg).style = 'display:block;';
                    msg.classList.add(verb);
                    msg.textContent = verb + ': ' + libxHelpers._.join(arguments, '');
                    log.appendChild(msg);
                    log.scrollTo(0, log.scrollHeight);
                };
            })(console[verb].bind(console), verb, log);
        });
    }

    //#endregion

    //#region libx.jQueryExt
    public jQueryExt = {
        setup: function ($) {
            $.postJson = function (url, jsonData) {
                //log.verbose('postJson: posting url:' + url);
                var ret = $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'json',
                    data: JSON.stringify(jsonData),
                    contentType: 'application/json; charset=utf-8',
                });
                return ret;
            };

            $.getJson = function (url) {
                var args = [];
                for (var _i = 0; _i < arguments.length - 1; _i++) {
                    args[_i] = arguments[_i + 1];
                }
                var fullUrl = url.format(args);

                //log.verbose('getJson: getting url:' + fullUrl);
                return $.when($.getJSON(fullUrl));
            };

            $.getJsonSync = function (url) {
                var args = [];
                for (var _i = 0; _i < arguments.length - 1; _i++) {
                    args[_i] = arguments[_i + 1];
                }
                var fullUrl = url.format(args);

                var ret = $.ajax({
                    url: fullUrl,
                    type: 'GET',
                    async: false,
                    cache: false,
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                });

                return $.when(ret);
            };

            $.expr[':']['hasText'] = function (node, index, props) {
                return node.textContent.trim() == props[3];
                //return node.textContent.contains(props[3]);
            };
        },
        applyReveal: function () {
            if (jQuery().viewportChecker == null) return;
            jQuery('[reveal-reset]').viewportChecker({
                classToAdd: 'visible animated',
                removeClassAfterAnimation: false,
                repeat: true,
                offset: '10%', //200,
                callbackFunction: function (elem, action) {
                    //libx.log.verbose('viewportChecker:reveal-reset');
                    var e = jQuery(elem);
                    if (action == 'add') {
                        e.addClass(e.attr('reveal-reset'));
                    } else {
                        e.removeClass(e.attr('reveal-reset'));
                    }
                },
            });
            jQuery('[reveal]').viewportChecker({
                classToAdd: 'visible animated',
                removeClassAfterAnimation: false,
                //repeat: true,
                //classToRemove: 'fadeInUp visible animated',
                offset: '10%',
                callbackFunction: function (elem, action) {
                    //libx.log.verbose('viewportChecker:reveal');
                    var e = jQuery(elem);
                    if (action == 'add') {
                        e.addClass(e.attr('reveal'));
                    } else {
                        e.removeClass(e.attr('reveal'));
                    }
                },

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
        },
    };

    //#endregion

    public getImageMeta = function (url) {
        // var deferred = new $.Deferred();
        var defer = libxHelpers.newPromise();
        var img = new Image();
        img.addEventListener('load', function () {
            defer.resolve({ width: this.naturalWidth, height: img.naturalHeight });
        });
        img.src = url;
        return defer.promise();
    };

    public imgToBase64 = async (src, outputFormat) => {
        var p = libxHelpers.newPromise();
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            var canvas: any = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');
            var dataURL;
            canvas.height = img.naturalHeight;
            canvas.width = img.naturalWidth;
            ctx.drawImage(this, 0, 0);
            dataURL = canvas.toDataURL(outputFormat);
            p.resolve(dataURL);
        };
        img.src = src;
        if (img.complete || img.complete === undefined) {
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
            img.src = src;
        }
        return p.promise();
    };

    public queryString = function (name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regexS = '[\\?&]' + name + '=([^&#]*)';
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null) return '';
        else return decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    public getIdFromUrl = function () {
        var matches = window.location.pathname.match(/\/(\d*)$/);
        if (matches == null || matches.length < 2) return null;
        return parseInt(matches[1]);
    };

    public watch(oObj, sProp) {
        var sPrivateProp = '$_' + sProp + '_$'; // to minimize the name clash risk
        oObj[sPrivateProp] = oObj[sProp];

        // overwrite with accessor
        Object.defineProperty(oObj, sProp, {
            get: function () {
                return oObj[sPrivateProp];
            },

            set: function (value) {
                //console.log("setting " + sProp + " to " + value);
                debugger; // sets breakpoint
                oObj[sPrivateProp] = value;
            },
        });
    }
}

export const browserHelpers = new BrowserHelpers();
