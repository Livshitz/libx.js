// helpers.getMeasure-positive
// import iMyModule from '../interfaces/IMyModule';
import { QueueWorker } from "../compiled/modules/QueueWorker";

// private async processItem(item: PackageInfo): Promise<PackageInfo> {

const processItem = (input: string): Promise<string> => {
	let p = libx.newPromise();
	libx.sleep(500).then(()=>{
		p.resolve(input + "-xxx");
	});
	return p;
}
const queueWorker = new QueueWorker<string, string>(processItem);


beforeEach(()=> {
	
})

test('queue new', async () => {
	let p = queueWorker.enqueue("aaa", "1");
	await expect(p).resolves.toEqual('aaa-xxx');
	// p.then((res)=>{
	// 	expect(res).toBe('aaa-xxx');
	// })
});
