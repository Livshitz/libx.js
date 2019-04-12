module.exports = (function(){
	var redux = require('redux');

	return redux; 
})();

(()=>{ // Dependency Injector auto module registration
	__libx.di.register('redux', module.exports);
})();