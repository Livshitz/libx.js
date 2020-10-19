import { di } from "./dependencyInjector";

export default (function(){
	var Rx = require('rxjs');

	Rx.operators = require('rxjs/operators');

	di.register(Rx, 'rxjs');

	return Rx; 
})();