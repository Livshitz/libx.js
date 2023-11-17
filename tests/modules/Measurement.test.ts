import { helpers } from "../../src/helpers";
import { Measurement } from "../../src/modules/Measurement";

const mod = new Measurement();

test('Measurement-positive', async () => {
	const param = new Measurement('test-1');
	param.start();
	await helpers.delay(100);
	const output = param.stop();
	expect(output).toBeGreaterThanOrEqual(100);
	expect(output).toBeLessThanOrEqual(200);
});

test('Measurement-start', async () => {
	const param = Measurement.start('test-1', { autoPrint: true });
	await helpers.delay(100);
	const output = param.stop();
	expect(output).toBeGreaterThanOrEqual(99);
	expect(output).toBeLessThanOrEqual(200);
});

test('Measurement-func', async () => {
	const param = await Measurement.measure(async () => {
		await helpers.delay(100);
	});
	const output = param;
	expect(output).toBeGreaterThanOrEqual(100);
	expect(output).toBeLessThanOrEqual(200);
});

