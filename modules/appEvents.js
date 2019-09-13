module.exports = (function(){
	var libx = __libx;

	var EventsStore = require('./EventsStore');

	return libx.di.registerResolve('appEvents', (rxjs) => {
		console.log('appEvents-resolved');
		return global.appEvents = new EventsStore();
	});
})();
