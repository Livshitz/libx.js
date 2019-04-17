module.exports = (function(){
	var Rx = require('rxjs');

	Rx.operators = require('rxjs/operators');

	return Rx; 
})();

(()=>{ // Dependency Injector auto module registration
	__libx.di.register('rxjs', module.exports);
})();