module.exports = (function(){
	var mod = {};

	var infra = require('./helpers.js');

	mod.isDebug = false;
	mod.isShowStacktrace = true;
	mod.isShowTime = !infra.isBrowser;
	mod.isShowPrefix = true;
	mod.severities = {
		debug: 0, //console.debug
		verbose: 1, //console.log
		info: 2, //console.info
		warning: 3, //console.warn
		error: 4, //console.error
		fatal: 5, //console.log("%c" + msg, "color:" + 'red');
	}

	mod.debug = (...args) 	=> mod.write(mod.severities.debug, ...args);
	mod.verbose = (...args) 	=> mod.write(mod.severities.verbose, ...args);
	mod.info = (...args) 		=> mod.write(mod.severities.info, ...args);
	mod.warning = (...args) 	=> mod.write(mod.severities.warning, ...args);
	mod.error = (...args) 	=> mod.write(mod.severities.error, ...args);
	mod.fatal = (...args) 	=> mod.write(mod.severities.fatal, ...args);

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
		switch(severity) {
			case mod.severities.debug: 	func='log'; 	prefix=" [DBG]"; style+="font-size:10px;"; break;
			case mod.severities.verbose: 	func='log'; 	prefix=" [v]"; break;
			case mod.severities.info: 	func='info'; 	prefix=" [>>]"; break;
			case mod.severities.warning: 	func='warn'; prefix=" [*]"; break;
			case mod.severities.error: 	func='error'; 	prefix=" [!]"; break;
			case mod.severities.fatal: 	func='error'; 	prefix=" [!!!]"; style+="color:red;"; break;
		}

		if (!mod.isShowPrefix) prefix = '';
		
		if (severity == mod.severities.debug && !mod.isDebug) return;

		var trace = '';
		if (mod.isShowStacktrace) trace = mod.getStackTrace();

		if (infra.isBrowser) {
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
