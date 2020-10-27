"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
module.exports = (function () {
    if (typeof window == 'undefined')
        return require;
    var mod = {};
    (function (load) {
        'use strict';
        var RequireError = function (message, fileName, lineNumber) {
            this.name = 'RequireError';
            this.message = message;
        };
        RequireError.prototype = Object.create(Error.prototype);
        if (typeof new Error().fileName == 'string') {
            self.addEventListener('error', function (evt) {
                if (evt.error instanceof Error) {
                    if (pwd[0]) {
                        evt.preventDefault();
                        throw new evt.error.constructor(evt.error.message, pwd[0].uri, evt.error.lineNumber);
                    }
                    else {
                        var m = evt.error.stack.match(/^[^\n@]*@([^\n]+):\d+:\d+/);
                        if (m === null) {
                            console.warn('libx.browser.require: unable to read file name from stack');
                        }
                        else if (evt.error.fileName != m[1]) {
                            evt.preventDefault();
                            throw new evt.error.constructor(evt.error.message, m[1], evt.error.lineNumber);
                        }
                    }
                }
            }, false);
        }
        var pwd = Array();
        var parser = URL ? new URL(location.href) : document.createElement('A');
        try {
            var cache = new Object();
            Object.defineProperty(cache, 'foo', { value: 'bar', configurable: true });
            delete cache.foo;
        }
        catch (e) {
            console.warn('Falling back to DOM workaround for defineProperty: ' + e);
            cache = document.createElement('DIV');
        }
        var lock = new Object();
        var requirePath = mod && mod.requirePath !== undefined ? mod.requirePath.slice(0) : ['./'];
        var requireCompiler = mod && mod.requireCompiler !== undefined ? mod.requireCompiler : null;
        var base = [location.origin, location.href.substr(0, location.href.lastIndexOf('/') + 1)];
        for (var i = 0; i < requirePath.length; i++) {
            parser.href = (requirePath[i][0] == '.' ? base[1] : base[0]) + requirePath[i];
            requirePath[i] = parser.href;
        }
        for (var id in mod && mod.requirePreloaded)
            cache['$' + resolve(id).id] = mod.requirePreloaded[id].toString();
        for (var id in mod && mod.requireOverrides)
            cache['$' + resolve(id).id] = mod.requireOverrides[id];
        mod = function (identifier, callback, compiler) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolvePromise, rejectPromise) => {
                    if (identifier instanceof Array) {
                        var modules = new Array();
                        var modcount = identifier.length;
                        for (var index = 0; index < identifier.length; index++) {
                            (function (id, i) {
                                modules.push(mod(id, callback &&
                                    function (mod) {
                                        modules[i] = mod;
                                        --modcount == 0 && callback(modules);
                                    }, compiler));
                            })(identifier[index], index);
                        }
                        return modules;
                    }
                    compiler = compiler !== undefined ? compiler : requireCompiler;
                    var descriptor = resolve(identifier);
                    var cacheid = '$' + descriptor.id;
                    if (cache[cacheid]) {
                        if (typeof cache[cacheid] === 'string')
                            load(descriptor, cache, pwd, cache[cacheid]);
                        callback &&
                            setTimeout(function () {
                                callback(cache[cacheid]);
                            }, 0);
                        return resolvePromise(cache[cacheid]);
                    }
                    var request = new XMLHttpRequest();
                    callback && (request[request.onload === null ? 'onload' : 'onreadystatechange'] = onLoad);
                    request.addEventListener('load', onLoad);
                    request.open('GET', descriptor.uri, true);
                    try {
                        request.setRequestHeader('Access-Control-Allow-Origin', '*');
                        request.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
                        request.setRequestHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');
                    }
                    catch (ex) {
                        console.warn('libx.require: Error setting CORS headers. ', ex);
                    }
                    lock[cacheid] = lock[cacheid]++ || 1;
                    request.send();
                    !callback && onLoad();
                    function onLoad() {
                        try {
                            if (request.readyState != 4)
                                return;
                            if (request.status != 200)
                                new RequireError('unable to load ' + descriptor.id + ' (' + request.status + ' ' + request.statusText + ')');
                            if (request.status == 200)
                                lock[cacheid]--;
                            if (lock[cacheid]) {
                                console.warn('module locked: ' + descriptor.id);
                                callback && setTimeout(onLoad, 0);
                                return;
                            }
                            if (!cache[cacheid]) {
                                var source = compiler ? compiler(request.responseText) : request.responseText;
                                load(descriptor, cache, pwd, source);
                            }
                            !callback && onLoad();
                            callback && callback(cache[cacheid]);
                            resolvePromise(cache[cacheid]);
                        }
                        catch (err) {
                            rejectPromise(err);
                        }
                    }
                });
            });
        };
        function fixSlash(url) {
            var isDoubleSlash = url.startsWith('//');
            var ret = url.replace(/[\/]+/g, '/').replace(':/', '://');
            if (isDoubleSlash)
                ret = ret.replace(/^\//, '//');
            return ret;
        }
        function resolve(identifier) {
            if (identifier.indexOf('http://') == 0 ||
                identifier.indexOf('https://') == 0 ||
                identifier.indexOf('//') == 0 ||
                identifier.indexOf('://') != -1)
                return { id: identifier, uri: fixSlash(identifier) };
            if (identifier.indexOf('/') == 0) {
                var root = requirePath[0].substr(0, requirePath[0].indexOf('/', requirePath[0].indexOf('://') + 3));
                return { id: identifier, uri: fixSlash(root + '/' + identifier) };
            }
            return { id: identifier, uri: fixSlash(identifier) };
            var m = identifier.match(/^(?:([^:\/]+):)?(\.\.?)?\/?((?:.*\/)?)([^\.]+)?(\..*)?$/);
            var p = (pwd[0] ? pwd[0].id : '').match(/^(?:([^:\/]+):)?(.*\/|)[^\/]*$/);
            var root = m[2] ? requirePath[p[1] ? parseInt(p[1]) : 0] : requirePath[m[1] ? parseInt(m[1]) : 0];
            parser.href = (m[2] ? root + p[2] + m[2] + '/' : root) + m[3] + (m[4] ? m[4] : 'index');
            var uri = parser.href + (m[5] ? m[5] : '.js');
            if (uri.substr(0, root.length) != root)
                throw new RequireError('Relative identifier outside of module root');
            var id = (m[1] ? m[1] + ':' : '0:') + parser.href.substr(root.length);
            return { id: id, uri: fixSlash(uri) };
        }
        if (mod !== undefined) {
            return;
        }
        try {
            Object.defineProperty('require', { value: mod });
            Object.defineProperty(mod, 'resolve', { value: resolve });
            Object.defineProperty(mod, 'path', {
                get: function () {
                    return requirePath.slice(0);
                },
            });
        }
        catch (e) {
            mod.resolve = resolve;
            mod.path = requirePath.slice(0);
        }
    })(function (module) {
        var global = self;
        var exports = new Object();
        Object.defineProperty(module, 'exports', {
            get: function () {
                return exports;
            },
            set: function (e) {
                exports = e;
            },
        });
        arguments[2].unshift(module);
        Object.defineProperty(arguments[1], '$' + module.id, {
            get: function () {
                return exports;
            },
        });
        var content = arguments[3];
        var extra = 'var __moduleUri = "' + module.uri + '";\n';
        if (!module.uri.endsWith('.js')) {
            content = 'module.exports = ' + content;
        }
        var script = 'function(){\n' + extra + content + '\n}';
        let wrapper = '(' + script + ')();\n//# sourceURL=' + module.uri;
        eval(wrapper);
        if (typeof module.id !== 'string')
            for (id in module)
                arguments[1]['$' + mod.resolve(id).id] = module[id].toString();
        arguments[2].shift();
    });
    return mod;
})();
//# sourceMappingURL=require.js.map