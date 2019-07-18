module.exports = (function(){
	// var rx = require('rxjs');
	// rx.operators = require('rxjs/operators');

	// Usage:
	// appEvents.subscribe(ev=>ev.type=='test', (x)=>console.log('state: ', x), appEvents.history)
	// appEvents.broadcast('test', { step:'init2' });


	var libx = __libx;
	class EventsStore {
		constructor(intialEvents) {
			// this.hub = null;
			this.channels = {
				history: null,
				state: null,
				future: null,
			}
			this._handler = null;
			this._defaultFilter = () => true;

			// this.state.pipe(
			// 		this._rx.operators.filter(num => num % 2 === 0)
			// 	)
			// 	.subscribe(val => console.log(`Even number: ${val}`));

			libx.di.require(rxjs=>{
				this._rx = rxjs;

				this.channels.history = new this._rx.ReplaySubject()
				this.channels.state = new this._rx.BehaviorSubject()
				this.channels.future = new this._rx.Subject()

				this._rx.from(intialEvents || []).pipe().subscribe(i=>this.broadcast(i.type, i.payload));

				libx.di.register('EventsStore', EventsStore);
			});

		}

		subscribe(action, predicate, channel) {
			return (channel || this.channels.state).pipe(
				this._rx.operators.filter(predicate)
			).subscribe(action);
		}

		subscribeOnce(action, predicate, channel) {
			return (channel || this.channels.future).pipe(
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
			// libx.log.d('eventsStore:boradcast: ', ev.type, ev.payload);
			this.channels.history.next(ev);
			this.channels.state.next(ev);
			this.channels.future.next(ev);
		}

		unsubscribe(handler) {
			handler.unsubscribe();
		}

		newEvent(type, payload) {
			return { type, payload };
		}
	}

	return EventsStore;
})();
