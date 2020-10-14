import App from '../src/main';

const main = new App();

test('should return true', async () => {
    expect(await main.run()).toEqual(true);
});
  