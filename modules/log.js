module.exports = (function(){
	var mod = {};

	mod.isBrowser = typeof window !== 'undefined';

	mod.isDebug = false;
	mod.isShowStacktrace = true;
	mod.isShowTime = !mod.isBrowser;
	mod.isShowPrefix = true;
	mod.severities = {
		debug: 0, //console.debug
		verbose: 1, //console.log
		info: 2, //console.info
		warning: 3, //console.warn
		error: 4, //console.error
		fatal: 5, //console.log("%c" + msg, "color:" + 'red');
	}
	mod.filterLevel = 1;

	mod.debug = (...args) 		=> mod.write(mod.severities.debug, ...args);
	mod.verbose = (...args) 	=> mod.write(mod.severities.verbose, ...args);
	mod.info = (...args) 		=> mod.write(mod.severities.info, ...args);
	mod.warning = (...args) 	=> mod.write(mod.severities.warning, ...args);
	mod.error = (...args) 		=> mod.write(mod.severities.error, ...args);
	mod.fatal = (...args) 		=> mod.write(mod.severities.fatal, ...args);

	mod.d = mod.debug;
	mod.v = mod.verbose;
	mod.i = mod.info;
	mod.w = mod.warning;
	mod.e = mod.error;
	mod.f = mod.fatal;

	mod.colors = {
		reset: "\x1b[0m",
		bright: "\x1b[1m",
		dim: "\x1b[2m",
		underscore: "\x1b[4m",
		blink: "\x1b[5m",
		reverse: "\x1b[7m",
		hidden: "\x1b[8m",
		
		fgBlack: "\x1b[30m",
		fgRed: "\x1b[31m",
		fgGreen: "\x1b[32m",
		fgYellow: "\x1b[33m",
		fgBlue: "\x1b[34m",
		fgMagenta: "\x1b[35m",
		fgCyan: "\x1b[36m",
		fgWhite: "\x1b[37m",
		
		bgBlack: "\x1b[40m",
		bgRed: "\x1b[41m",
		bgGreen: "\x1b[42m",
		bgYellow: "\x1b[43m",
		bgBlue: "\x1b[44m",
		bgMagenta: "\x1b[45m",
		bgCyan: "\x1b[46m",
		bgWhite: "\x1b[47m",
	}

	mod.color = (str, color) => {
		var c = null;
		if (!color.startsWith("\x1b[")) c = mod.colors['fg' + color.capitalize()];
		else c = color;
		if (c == null && mod.colors[color] == null) throw "given color ({0}) is not supported. options: black, red, green, yellow, blue, magenta, cyan, white".format(color);
		return c + str + mod.colors.reset;
	}

	mod.write = function() { //msg, args
		// var time = DateTime.Now.ToString("HH:mm:ss.fff");
		// Console.WriteLine($" [#{Thread.CurrentThread.ManagedThreadId}]:[{time}] {msg}", args);
		var severity = arguments[0];
		var msg = arguments[1];
		var args = Array.from(arguments).slice(2);
		var time = (mod.isShowTime) ? ( '[' + (new Date()).format('HH:MM:ss.l') + ']' ) : '';
		var prefix = "";	
		var style = '';
		var func = 'log';

		if (severity < mod.filterLevel) return;

		switch(severity) {
			case mod.severities.debug: 	func='log'; 	prefix=" [DBG]"; style+="font-size:10px;"; break;
			case mod.severities.verbose: 	func='log'; 	prefix=" [v]"; break;
			case mod.severities.info: 	func='info'; 	prefix=" [>>]"; break;
			case mod.severities.warning: 	func='warn'; prefix=" [*]"; break;
			case mod.severities.error: 	func='error'; 	prefix=" [!]"; break;
			case mod.severities.fatal: 	func='error'; 	prefix=" [!!!]"; style+="color:red;"; break;
		}

		prefix += '\t';
		if (!mod.isShowPrefix) prefix = '';
		
		if (severity == mod.severities.debug && !mod.isDebug) return;

		var trace = '';
		if (mod.isShowStacktrace) trace = mod.getStackTrace();

		if (mod.isBrowser) {
			var _msg = `${prefix}${time} ${msg} %c${trace}`; //${color != null ? '%c' : ''}
			if (args.length == 0) console[func].call(console, _msg, 'font-size:8px;');
			else console[func].call(console, _msg, 'font-size:8px;', args);
		} else {
			var _msg = `${prefix}${time} ${msg} ${trace}`; //${color != null ? '%c' : ''}
			console[func].call(console, _msg, (args.length == 0) ? '' : args );
		}
	}

	mod.getStackTrace = () => {
		try {
			var err = new Error();
			var ret = err.stack;
			var lines = ret.split("\n");
			var i = 4;
			if (lines.length < i) i = lines.length-1;
			return lines[i].replace(/^\s+/g, '\n\t'); 
			// return lines[i].substring(lines[i].indexOf("(")+1, lines[i].lastIndexOf(")"));
		} catch(ex) {  }
	}
	
	return mod;
})();

(()=>{ // Dependency Injector auto module registration
	setTimeout(()=>	{
		__libx.di.register('log', module.exports);
	}, 0);
})();