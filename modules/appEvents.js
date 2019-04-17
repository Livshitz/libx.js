module.exports = (function(){
	var libx = __libx;

	var EventsStore = require('./EventsStore');

	return libx.di.register('appEvents', global.appEvents = new EventsStore());
})();
