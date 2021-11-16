import { helpers } from '../../src/helpers';
// helpers.getMeasure-positive
// import iMyModule from '../interfaces/IMyModule';
import { QueueWorker } from '../../src/modules/QueueWorker';

// private async processItem(item: PackageInfo): Promise<PackageInfo> {

const delay = 100;
const delayPadded = delay + delay * 0.2 + 50;

const processItem = (input: string, id: string): Promise<string> => {
    let p = helpers.newPromise<string>();
    helpers.sleep(delay).then(() => {
        // console.log('Resolved: ', id, input);
        p.resolve(input + '-xxx');
    });
    return p; //.getPromise();
};
const queueWorker = new QueueWorker<string, string>(processItem);

beforeEach(() => {});

test('queue new', async () => {
    let p = queueWorker.enqueue('aaa', '0');
    await expect(p).resolves.toEqual('aaa-xxx');
    // p.then((res)=>{
    // 	expect(res).toBe('aaa-xxx');
    // })
});

test('queue with maxConcurrent 1 & serial', async () => {
    const queueWorker = new QueueWorker<string, string>(processItem, null, 1);
    const startDate = new Date().getTime();
    let p1 = queueWorker.enqueue('aa1', '1');
    p1.then((res) => {
        expect(new Date().getTime() - startDate).toBeLessThanOrEqual(delayPadded);
    });
    await p1;
    let p2 = queueWorker.enqueue('aa2', '2');
    await p2;
    let p3 = queueWorker.enqueue('aa3', '3');
    await p3;

    let res = await Promise.all([p1, p2, p3]);
    expect(res).toEqual(['aa1-xxx', 'aa2-xxx', 'aa3-xxx']);
});

test('queue with maxConcurrent 1', async () => {
    const queueWorker = new QueueWorker<string, string>(processItem, null, 1);
    const startDate = new Date().getTime();
    let p1 = queueWorker.enqueue('aa1', '1');
    p1.then((res) => {
        expect(new Date().getTime() - startDate).toBeLessThanOrEqual(delayPadded);
    });
    let p2 = queueWorker.enqueue('aa2', '2');
    p2.then((res) => {
        expect(new Date().getTime() - startDate).toBeLessThanOrEqual(delayPadded * 2);
    });
    let p3 = queueWorker.enqueue('aa3', '3');
    p3.then((res) => {
        expect(new Date().getTime() - startDate).toBeLessThanOrEqual(delayPadded * 3);
    });

    let res = await Promise.all([p1, p2, p3]);
    expect(res).toEqual(['aa1-xxx', 'aa2-xxx', 'aa3-xxx']);
});

test('queue with maxConcurrent 2', async () => {
    const queueWorker = new QueueWorker<string, string>(processItem, null, 2);
    const startDate = new Date().getTime();
    let p1 = queueWorker.enqueue('aa1', '1');
    let p2 = queueWorker.enqueue('aa2', '2');
    p1.then((res) => {
        expect(new Date().getTime() - startDate).toBeLessThanOrEqual(delayPadded);
    });
    p2.then((res) => {
        expect(new Date().getTime() - startDate).toBeLessThanOrEqual(delayPadded);
    });
    let p3 = queueWorker.enqueue('aa3', '3');
    p3.then((res) => {
        expect(new Date().getTime() - startDate).toBeLessThanOrEqual(delayPadded * 2);
    });

    let res = await Promise.all([p1, p2, p3]);
    expect(res).toEqual(['aa1-xxx', 'aa2-xxx', 'aa3-xxx']);
});

test('queue with maxConcurrent 3', async () => {
    const queueWorker = new QueueWorker<string, string>(processItem, null, 3);
    const startDate = new Date().getTime();
    let p1 = queueWorker.enqueue('aa1', '1');
    let p2 = queueWorker.enqueue('aa2', '2');
    let p3 = queueWorker.enqueue('aa3', '3');
    p1.then((res) => {
        expect(new Date().getTime() - startDate).toBeLessThanOrEqual(delayPadded);
    });
    p2.then((res) => {
        expect(new Date().getTime() - startDate).toBeLessThanOrEqual(delayPadded);
    });
    p3.then((res) => {
        expect(new Date().getTime() - startDate).toBeLessThanOrEqual(delayPadded);
    });

    let res = await Promise.all([p1, p2, p3]);
    expect(res).toEqual(['aa1-xxx', 'aa2-xxx', 'aa3-xxx']);
});
