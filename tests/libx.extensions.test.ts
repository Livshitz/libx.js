var dataset: any = {
	date: new Date("2019-07-25T21:00:14.000Z"),
}

beforeAll(()=> {
})

// [[[[[[[[[[  String Extensions  ]]]]]]]]]]

test('string.format-positive', () => {
	let source = 'abc {0}';
	let output = source.format(123);
	expect(output).toBe('abc 123');
});

test('string.capitalize-positive', () => {
	let source = 'abc def';
	let output = source.capitalize();
	expect(output).toBe('Abc Def');
});

test('string.kebabCase-positive', () => {
	let source = 'aBc Def';
	let output = source.kebabCase();
	expect(output).toBe('a-bc-def');
});

test('string.camelize-positive', () => {
	let source = 'abc def';
	let output = source.camelize();
	expect(output).toBe('abcDef');
});

test('string.padNumber-positive', () => {
	let source = '3';
	let output = source.padNumber(4, "0");
	expect(output).toBe('0003');
});

test('string.contains-positive', () => {
	let source = 'abc def';
	let output = source.contains('def');
	expect(output).toBe(true);
});

test('string.hashCode-positive', () => {
	let source = 'abc def';
	let output = source.hashCode();
	expect(output).toBe('-1208318137');
});

test('string.endsWith-positive', () => {
	let source = 'abc def';
	let output = source.endsWith('f');
	expect(output).toBe(true);
});

test('string.startsWith-positive', () => {
	let source = 'abc def';
	let output = source.startsWith('a');
	expect(output).toBe(true);
});

test('string.isEmpty-positive', () => {
	let source = '';
	let output = source.isEmpty();
	expect(output).toBe(true);
});
test('string.isEmpty-positive-2', () => {
	let source = '';
	let output = String.prototype.isEmpty(source);
	expect(output).toBe(true);
});
test('string.isEmpty-negative', () => {
	let source = 'abc';
	let output = String.prototype.isEmpty(source);
	expect(output).toBe(false);
});

// [[[[[[[[[[  Date Extensions  ]]]]]]]]]]

test('date.toUtc-positive', () => {
	let local = new Date();
	let global = local.toUTC();
	expect(global.toISOStringUTC(true)).toBe(local.toISOString());
});

test('date.isValid-positive', () => {
	let output = dataset.date.isValid();
	expect(output).toBe(true);
});
test('date.isValid-negative', () => {
	let source = new Date(1231231231312312313100);
	let output = source.isValid();
	expect(output).toBe(false);
});

test('date.formatx-positive', () => {
	let output = dataset.date.formatx("HH:MM:ss.l", true);
	expect(output).toBe("21:00:14.000");
});

test('date.format-positive', () => {
	let output = dataset.date.format("HH:MM:ss.l", true);
	expect(output).toBe("21:00:14.000");
});

test('date.toJSON-positive', () => {
	let output = dataset.date.toJSON();
	expect(output).toBe("2019-07-25T21:00:14.000Z");
});

test('date.toJson-positive', () => {
	let output = dataset.date.toJson();
	expect(output).toBe("/Date(1564088414000)/");
});

test('date.fromJson-positive', () => {
	let output = new Date().fromJson('/Date(1564088414000)/').getTime();
	expect(output).toBe(dataset.date.getTime());
});

test('date.addHours-positive', () => {
	let output = dataset.date.addHours(6);
	expect(output.getHours()).toBe((dataset.date.getHours() + 6) % 24);
});

// [[[[[[[[[[  Array Extensions  ]]]]]]]]]]

test('date.diff-positive', () => {
	let source = [ 1, 2, 3];
	let output = source.diff([2]);
	expect(output).toEqual([1, 3]);
});

test('date.myFilter-positive', () => {
	let source = [ 1, 2, 3, 4];
	let output = source.myFilter(item=> item % 2 == 0);
	expect(output).toEqual([2, 4]);
});

test('date.myFilterSingle-positive', () => {
	let source = [ 1, 2, 3, 4];
	let output = source.myFilterSingle(item=> item % 2 == 0);
	expect(output).toEqual(2);
});

test('date.myFilterSingle-positive', () => {
	let source = [ 1, 2, 3, 4];
	let output = source.myFilterSingle(item=> item % 2 == 0);
	expect(output).toEqual(2);
});

test('date.remove-positive', () => {
	let source = [ 1, 2, 3, 4];
	let output = source.remove(3);
	expect(output).toEqual([1, 2, 4]);
});

test('date.contains-positive', () => {
	let source = [ 1, 2, 3, 4];
	let output = source.contains(3);
	expect(output).toEqual(true);
});

