class QueueWorkerItem<T> {
	item: T;
	promises: LibxJS.IDeferred<any>[];
}

export class QueueWorker<TIn, TOut> {
	private queue: LibxJS.Map<QueueWorkerItem<TIn>> = {};
	private faultsCountDown = 3;
	private processor: (item: TIn) => Promise<TOut> = null;

	constructor(_processor: (item: TIn) => Promise<TOut>, _faultsCountDown?: number) {
		this.processor = _processor;
		this.faultsCountDown = _faultsCountDown;
	}

	public async enqueue(item: TIn, id: string): Promise<TOut> {
		let p = libx.newPromise();
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
		let id = keys[0];
		let job = this.queue[id];
		delete this.queue[id];
		this.processor(job.item).catch(ex => {
			libx.log.w('QueueWorker:cycle: Error processing item', job.item ,ex);
			this.faultsCountDown--;
			if (this.faultsCountDown == 0) {
				job.promises.forEach(x => x.reject(new Error("QueueWorker:cycle: Could not recover from repeated failures! ex: " + ex.response)));
				return;
			}
			this.enqueue(job.item, id); // push it back to the queue
		}).then(out => {
			job.promises.forEach(x => x.resolve(out));
		});
		
		// Don't wait for processing to finish, as it will be blocked on network IO, just continue and bloat the network pipeline
		if (typeof setImmediate != 'undefined') setImmediate(this.cycle.bind(this)); 
		else setTimeout(this.cycle.bind(this), 1);
	}
}
