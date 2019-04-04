module.exports = (function(){
	class Callbacks {
        constructor() {
			this.counter = 0;
            this.list = {};
        }

        subscribe(cb) {
            this.list[this.counter] = cb;
			var ret = this.counter;
			this.counter++;
			return ret;
        }

		trigger() {
			_.each(this.list, (cb)=> {
				cb.apply(null, arguments)
            });
        }

		clear(id) {
			delete this.list[id];
        }

		clearAll() {
			delete this.list;
			this.list = {};
        }
    }

	return Callbacks; 
})();

(()=>{ // Dependency Injector auto module registration
	__libx.di.register('Callbacks', module.exports);
})();