import { di } from "./dependencyInjector";

export default (function(){
	var redux = require('redux');

	di.register(redux, 'redux');

	return redux; 
})();