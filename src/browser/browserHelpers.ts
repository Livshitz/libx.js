import { helpers as libxHelpers } from '../helpers';
import { MyLodash } from '../helpers/MyLodash';
import { objectHelpers } from '../helpers/ObjectHelpers';
import { log } from '../modules/log';
import { network } from '../modules/Network';

declare const jQuery: any;
export class BrowserHelpers {
    public urlParams;
    public isiOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !(<any>window).MSStream;
    public lastSeen: number;

    public constructor() {
        // If not browser, quit here!
        if (!libxHelpers.isBrowser) {
            return;
        }

        /* This is causing infinite loop if navigated to `?1`, and not clear what it's value..
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
        */

        if (typeof jQuery != 'undefined') {
            jQuery(document).ready(function () {
                //log.verbose('ext2 - configuring reveal')
                this.jQueryExt.applyReveal();
            });
        } else {
            if (log) log.debug('helpers: jQuery is not defined, skipping jQuery libx setup...');
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

    public injectScript = function (src, onReady, doc = document, attributes = {}) {
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
        for (let attrKey of Object.keys(attributes)) {
            script.setAttribute(attrKey, attributes[attrKey]);
        }
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

    public getHost = function (absUrl?: string) {
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

    public getParameters = function (search?: string) {
        if (search == null) search = location.search;
        if (!search.startsWith('?')) search = '?' + search;
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

        if (objectHelpers.isObject(data)) {
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
                    method(MyLodash.join(<any>arguments, ''));
                    // handle distinguishing between methods any way you'd like
                    var msg = document.createElement('code');
                    (<any>msg).style = 'display:block;';
                    msg.classList.add(verb);
                    msg.textContent = verb + ': ' + MyLodash.join(<any>arguments, '');
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

    public imgToBase64 = async (src, outputFormat = null) => {
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

    public queryString = function (name, url = window.location.href) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regexS = '[\\?&]' + name + '=([^&#]*)';
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
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

    //#region RTL & Text Direction

    /**
     * Check if a string contains RTL (Right-To-Left) characters
     * @param str String to check
     * @returns True if string contains RTL characters (Hebrew, Arabic, etc.)
     */
    public isRTL(str: string): boolean {
        const rtlPattern = /[\u0590-\u05FF\u0600-\u06FF\u0680-\u06FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF\u200F]/;
        return rtlPattern.test(str);
    }

    /**
     * Apply automatic text direction (RTL/LTR) to elements matching a selector
     * @param selector CSS selector for elements to apply direction to (default: '.auto-dir')
     * @param applyLTR Whether to explicitly set LTR direction for non-RTL text (default: false)
     * @param delay Delay in milliseconds before applying (default: 1)
     */
    public applyAutoDir(selector = '.auto-dir', applyLTR = false, delay = 1) {
        setTimeout(() => {
            const dur = libxHelpers.Measurement.start();
            const elms = document.querySelectorAll(selector);
            elms.forEach((x) => {
                let content = (<HTMLInputElement>x).value;
                if (!objectHelpers.isEmptyString(x.textContent)) content = x.textContent;
                if (objectHelpers.isEmptyString(content)) content = (<HTMLInputElement>x).placeholder;

                const isRTL = this.isRTL(content);
                if (!isRTL) {
                    if (applyLTR) x.setAttribute('dir', 'ltr');
                    return;
                }
                x.setAttribute('dir', 'rtl');
            });
            log.debug(`browserHelpers:applyAutoDir: dur: ${dur.peek()}ms`);
        }, delay);
    }

    /**
     * Debounced version of applyAutoDir
     * @param wait Debounce wait time in milliseconds (default: 100)
     * @param selector CSS selector for elements (default: '.auto-dir')
     * @param applyLTR Whether to explicitly set LTR direction (default: true)
     * @returns Debounced function
     */
    public applyAutoDirDebounced(wait = 100, selector = '.auto-dir', applyLTR = true) {
        return libxHelpers.debounce(() => {
            this.applyAutoDir(selector, applyLTR);
        }, wait);
    }

    //#endregion

    //#region Screen & Viewport

    /**
     * Screen size breakpoints
     */
    public ScreenSize = {
        xs: 'xs',
        sm: 'sm',
        md: 'md',
        lg: 'lg',
        xl: 'xl',
    } as const;

    /**
     * Get current screen size based on window width
     * @returns Screen size identifier (xs, sm, md, lg, xl)
     */
    public getScreenSize(): string {
        const screenWidth = window.innerWidth;

        if (screenWidth <= 599) return this.ScreenSize.xs;
        if (screenWidth <= 959) return this.ScreenSize.sm;
        if (screenWidth <= 1279) return this.ScreenSize.md;
        if (screenWidth <= 1919) return this.ScreenSize.lg;
        return this.ScreenSize.xl;
    }

    //#endregion

    //#region Image & Canvas Operations

    /**
     * Resize an image file
     * @param file Image file to resize
     * @param maxSizeWidthPx Maximum width/height in pixels
     * @param bgColor Background color (default: '#111')
     * @param mimetype Output MIME type (default: 'image/jpeg')
     * @returns Blob of resized image
     */
    public async resizeImageFile(
        file: File,
        maxSizeWidthPx: number,
        bgColor = '#111',
        mimetype = 'image/jpeg'
    ): Promise<Blob> {
        if (!file.type.match(/image.*/)) {
            throw new Error('Not an image');
        }

        const reader = new FileReader();
        const p = libxHelpers.newPromise<string>();
        reader.onload = (readerEvent: any) => {
            try {
                p.resolve(readerEvent.target.result);
            } catch (err) {
                p.reject(err);
            }
        };
        reader.readAsDataURL(file);
        const dataURI = await p;

        const resizedDataURI = await this.resizeImage(dataURI, maxSizeWidthPx, bgColor, mimetype);
        return libxHelpers.dataURItoBlob(resizedDataURI);
    }

    /**
     * Resize an image from data URI
     * @param dataURI Image data URI
     * @param maxSizeWidthPx Maximum width/height in pixels
     * @param bgColor Background color (default: '#111')
     * @param mimetype Output MIME type (default: 'image/jpeg')
     * @param quality Image quality 0-1 (default: 0.85)
     * @returns Resized image as data URI
     */
    public async resizeImage(
        dataURI: string,
        maxSizeWidthPx: number,
        bgColor = '#111',
        mimetype = 'image/jpeg',
        quality = 0.85
    ): Promise<string> {
        const image = new Image();
        const canvas = document.createElement('canvas');

        const resize = () => {
            let width = image.width;
            let height = image.height;

            log.verbose(`browserHelpers:resizeImage: Original dimensions: ${width}x${height}`);

            if (width > height) {
                if (width > maxSizeWidthPx) {
                    height *= maxSizeWidthPx / width;
                    width = maxSizeWidthPx;
                }
            } else {
                if (height > maxSizeWidthPx) {
                    width *= maxSizeWidthPx / height;
                    height = maxSizeWidthPx;
                }
            }

            log.verbose(`browserHelpers:resizeImage: Target dimensions: ${Math.round(width)}x${Math.round(height)}`);

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(image, 0, 0, width, height);

            const resultDataURI = canvas.toDataURL(mimetype, quality);
            const resultSize = (resultDataURI.length * 2) / 1024;
            log.verbose(`browserHelpers:resizeImage: Result size: ${resultSize.toFixed(0)}KB`);

            return resultDataURI;
        };

        const p = libxHelpers.newPromise<string>();
        image.onload = () => {
            try {
                const result = resize();
                p.resolve(result);
            } catch (err) {
                log.error('browserHelpers:resizeImage: Error during resize:', err);
                p.reject(err);
            }
        };
        image.onerror = (err) => {
            log.error('browserHelpers:resizeImage: Image load error:', err);
            p.reject(err);
        };

        image.crossOrigin = 'anonymous';
        image.src = dataURI;

        return await p;
    }

    /**
     * Copy canvas content to clipboard or download as file (based on device type)
     * @param canvas Canvas element to copy/download
     * @param filenameNoExt Filename without extension (for download)
     */
    public async copyOrDownloadCanvas(canvas: HTMLCanvasElement, filenameNoExt: string) {
        const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        if (!isMobile) {
            await this.copyCanvasToClipboard(canvas);
        } else {
            try {
                const p = libxHelpers.newPromise<Blob>();
                await canvas.toBlob((blob) => p.resolve(blob));
                const blob = await p;
                this.localDownloadBlob(blob, `${filenameNoExt}.png`);
            } catch (err) {
                throw log.error('browserHelpers:copyOrDownloadCanvas: Failed to download as file!', err);
            }
        }
    }

    /**
     * Copy canvas content to clipboard
     * @param canvas Canvas element to copy
     */
    public async copyCanvasToClipboard(canvas: HTMLCanvasElement) {
        try {
            const canWriteToClipboard = await this.askClipboardWritePermission();
            if (!canWriteToClipboard) throw new Error("Don't have permissions to copy");

            const p = libxHelpers.newPromise<Blob>();
            await canvas.toBlob((blob) => p.resolve(blob));
            const blob = await p;
            await this.writeToClipboard(blob);

            log.info('browserHelpers:copyCanvasToClipboard: Copied!');
        } catch (err) {
            throw log.error('browserHelpers:copyCanvasToClipboard: Failed! Error:', err?.message || err);
        }
    }

    /**
     * Write blob to clipboard using modern Clipboard API
     * @param blob Blob to write to clipboard
     */
    private async writeToClipboard(blob: Blob) {
        const data = [new ClipboardItem({ [blob.type]: blob })];
        await navigator.clipboard.write(data);
    }

    /**
     * Ask for clipboard write permission
     * @returns True if permission granted
     */
    private async askClipboardWritePermission(): Promise<boolean> {
        try {
            const { state } = await navigator.permissions.query(<any>{ name: 'clipboard-write' });
            return state === 'granted';
        } catch (error) {
            return false;
        }
    }

    //#endregion

    //#region Media & Audio

    /**
     * Convert a File to HTMLAudioElement
     * @param file Audio file
     * @returns Audio element with loaded file
     */
    public async fileToAudio(file: File): Promise<HTMLAudioElement> {
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        const p = libxHelpers.newPromise<HTMLAudioElement>();
        audio.onloadedmetadata = () => p.resolve(audio);
        audio.onerror = (err) => p.reject(err);
        return p;
    }

    /**
     * Get MediaSource instance (supports ManagedMediaSource for iOS 17.1+)
     * @returns MediaSource instance
     */
    public getMediaSource(): MediaSource {
        if ('ManagedMediaSource' in window) {
            return new (<any>window).ManagedMediaSource();
        } else if ('MediaSource' in window) {
            return new MediaSource();
        } else {
            throw new Error('MediaSource API is not supported on this device.');
        }
    }

    /**
     * Convert base64 string to MP3 file and trigger download
     * @param base64String Base64 encoded audio data
     * @param filename Output filename (default: 'audio.mp3')
     */
    public base64ToMP3(base64String: string, filename = 'audio.mp3') {
        const byteCharacters = atob(base64String);
        const byteArrays = [];

        for (let i = 0; i < byteCharacters.length; i += 512) {
            const slice = byteCharacters.slice(i, i + 512);
            const byteNumbers = new Array(slice.length);

            for (let j = 0; j < slice.length; j++) {
                byteNumbers[j] = slice.charCodeAt(j);
            }

            byteArrays.push(new Uint8Array(byteNumbers));
        }

        const blob = new Blob(byteArrays, { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }

    //#endregion

    //#region DOM Utilities

    /**
     * Remove focus from currently active element
     */
    public blur() {
        (<any>document.activeElement)?.blur();
    }

    /**
     * Decode HTML entities in a string
     * @param text Text containing HTML entities
     * @returns Decoded text
     */
    public decodeHTMLEntities(text: string): string {
        const txt = document.createElement('textarea');
        txt.innerHTML = text;
        return txt.value;
    }

    /**
     * Scroll to element matching a query selector
     * @param query CSS selector
     * @param options Scroll options
     * @returns Element that was scrolled to, or null if not found
     */
    public scrollTo(
        query: string,
        options?: { double?: boolean; smooth?: boolean }
    ): Element | null {
        const { double = false, smooth = true } = options || {};
        const element = document.querySelector(query);
        if (!element) return null;

        element.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
        if (double) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
            }, 1000);
        }

        return element;
    }

    /**
     * Show a modal dialog by ID
     * @param modalId Modal element ID
     */
    public showModal(modalId: string) {
        (<HTMLDialogElement>document.getElementById(modalId))?.showModal();
    }

    /**
     * Close a modal dialog by ID
     * @param modalId Modal element ID
     */
    public closeModal(modalId: string) {
        (<HTMLDialogElement>document.getElementById(modalId))?.close();
    }

    /**
     * Auto-grow textarea height based on content
     * @param e Input event from textarea
     */
    public autoGrowTextarea(e: Event) {
        const element = <HTMLTextAreaElement>e.target;
        const maxHeight = 120;
        element.style.height = 'auto';
        if (element.scrollHeight > maxHeight) {
            element.style.height = maxHeight + 'px';
        } else {
            element.style.height = element.scrollHeight + 'px';
        }
    }

    //#endregion

    //#region Page Information

    /**
     * Get page metadata (title, description, og:image)
     * @returns Object with page metadata
     */
    public getPageMetadata(): { title: string; description: string; ogImage: string } {
        const metadata = {
            title: document.title,
            description: '',
            ogImage: '',
        };

        const metaTags = document.getElementsByTagName('meta');
        for (let tag of metaTags) {
            if (tag.getAttribute('name') === 'description') {
                metadata.description = tag.getAttribute('content') || '';
            } else if (tag.getAttribute('property') === 'og:image') {
                metadata.ogImage = tag.getAttribute('content') || '';
            }
        }

        return metadata;
    }

    /**
     * Get referrer hostname
     * @returns Hostname of the referrer, or empty string if none
     */
    public getReferrer(): string {
        const url = document.referrer;
        if (!url) return '';
        try {
            const hostname = new URL(url).hostname;
            return hostname.replace(/^www\./, '');
        } catch {
            return '';
        }
    }

    //#endregion
}

export const browserHelpers = new BrowserHelpers();
