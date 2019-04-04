module.exports = (function(){
	var Rx = require('rxjs');

	return Rx; 
})();

(()=>{ // Dependency Injector auto module registration
	__libx.di.register('rxjs', module.exports);
})();