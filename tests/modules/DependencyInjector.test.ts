describe('dependencyInjector tests', () => {
    let dataset: any = {};

    beforeAll(async (done) => {
        done();
    });

    test('dependencyInjector--positive', async (done) => {
        expect(true).toBe(true);
        done();
    });

    afterAll((done) => {
        done();
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
