module.exports = (function(){
	// var rx = require('rxjs');
	// rx.operators = require('rxjs/operators');

	var libx = __libx;
	class EventsStore {
		constructor(intialEvents) {
			// this.hub = null;
			this.history = null;
			this.state = null;
			this.future = null;
			this.handler = null;
			this._defaultFilter = () => true;

			// this.state.pipe(
			// 		this._rx.operators.filter(num => num % 2 === 0)
			// 	)
			// 	.subscribe(val => console.log(`Even number: ${val}`));

			libx.di.require(rx=>{
				this._rx = rx;

				this.history = new this._rx.ReplaySubject()
				this.state = new this._rx.BehaviorSubject()
				this.future = new this._rx.Subject()
				
				this._rx.from(intialEvents || []).pipe().subscribe(i=>this.broadcast(i.type, i.payload));
			});
			
		}
	
		subscribe(predicate, action, channel) {
			return (channel || this.state).pipe(
				this._rx.operators.filter(predicate)
			).subscribe(action);
		}
	
		subscribeOnce(predicate, action, channel) {
			return (channel || this.future).pipe(
				this._rx.operators.filter(predicate),
				this._rx.operators.take(1)
			)
			.subscribe(action);
		}
	
		/*
		subscribe(action, predicate) {
			this.state.pipe(
				this._rx.operators.filter(predicate || this._defaultFilter)
			).subscribe(action);
		}
		*/
	
		broadcast(type, payload) {
			var ev = this.newEvent(type, payload);
			libx.log.d('eventsStore:boradcast: ', ev.type, ev.payload);
			this.history.next(ev);
			this.state.next(ev);
			this.future.next(ev);
		}
	
		unsubscribe(handler) {
			handler.unsubscribe();
		}
	
		newEvent(type, payload) {
			return { type, payload };
		}
	}

	return libx.di.register('EventsStore', EventsStore)
})();
