class QueueWorkerItem<T> {
	item: T;
	promises: LibxJS.IDeferred<any>[];
}

export class QueueWorker<TIn, TOut> {
	private queue: LibxJS.Map<QueueWorkerItem<TIn>> = {};
	private current: LibxJS.Map<QueueWorkerItem<TIn>> = {};
	private faultsCountDown: number;
	private processor: (item: TIn, id?: string) => Promise<TOut> = null;
	private maxConcurrent: number;

	constructor(_processor: (item: TIn, id?: String) => Promise<TOut>, _maxConcurrent=1, _faultsCountDown=3) {
		this.processor = _processor;
		this.faultsCountDown = _faultsCountDown;
		this.maxConcurrent = _maxConcurrent;
	}

	public async enqueue(item: TIn, id?: string): Promise<TOut> {
		let p = libx.newPromise();
		id = id || libx.randomNumber().toString();
		let handler = this.queue[id];
		if (handler == null)
			handler = this.queue[id] = { item: item, promises: [] };
		handler.promises.push(p);
		this.cycle();
		return p;
	}

	private async cycle(): Promise<void> {
		let keys = Object.keys(this.queue);
		if (keys.length == 0) {
			return;
		}
		if (this.maxConcurrent > 0 && Object.keys(this.current).length >= this.maxConcurrent) {
			return;
		}

		let id = keys[0];
		let job = this.queue[id];
		delete this.queue[id];
		this.current[id] = job;
		this.processor(job.item, id).catch(ex => {
			libx.log.w('QueueWorker:cycle: Error processing item', job.item ,ex);
			this.faultsCountDown--;
			if (this.faultsCountDown == 0) {
				job.promises.forEach(x => x.reject(new Error("QueueWorker:cycle: Could not recover from repeated failures! ex: " + ex.response)));
				return;
			}
			this.enqueue(job.item, id); // push it back to the queue
		}).then(out => {
			delete this.current[id];
			job.promises.forEach(x => x.resolve(out));
		}).finally(()=>{
			this.tickNext();
		});
		
		this.tickNext();
	}

	private async tickNext() {
		if (typeof setImmediate != 'undefined') setImmediate(this.cycle.bind(this)); 
		else setTimeout(this.cycle.bind(this), 1);
	}
}
