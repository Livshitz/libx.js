import { expect, test, beforeAll, beforeEach, describe, afterAll } from 'vitest'

describe('dependencyInjector tests', () => {
    let dataset: any = {};

    beforeAll(async () => {});

    test('dependencyInjector--positive', async () => {
        expect(true).toBe(true);
    });

    afterAll(() => {

    });

    /*
		beforeAll(() => {
			mongoDB.connect();
		});
		afterAll((done) => {
			mongoDB.disconnect(done);
		});
	*/
});
