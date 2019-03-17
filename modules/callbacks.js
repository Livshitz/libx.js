module.exports = (function(){
	var mod = {};
	
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