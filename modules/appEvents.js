module.exports = (function(){
	var libx = __libx;

	var EventsStore = require('./EventsStore');

	console.log('appEvents-pre resolve');
	return libx.di.registerResolve('appEvents', (rxjs) => {
		console.log('appEvents-resolved');
		return global.appEvents = new EventsStore();
	});
})();
