module.exports = (function(){
	var libx = __libx;

	var EventsStore = require('./EventsStore');

	return libx.di.registerResolve('appEvents', (rxjs) => {
		if (typeof rxjs == "undefined") return; // just use the variable so the compile will not exclude it
		return global.appEvents = new EventsStore();
	});
})();
