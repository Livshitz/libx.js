import { expect, test, beforeAll, beforeEach, describe } from 'vitest'
import { extensions } from '../../src/extensions';
import { Isolator, cleanRun } from '../../src/extensions/Isolator';

var dataset = {
    date: new Date('2019-07-25T21:00:14.000Z'),
};

describe('extensions isolation test', () => {
    test('isolator', async () => {
        let withoutExts;
        let withExts;

        // expect(Isolator.getProps(Array.prototype).length).toEqual(before); // commented out because during tests some other place might apply extensions
        extensions.applyAllExtensions();
        withExts = Isolator.getProps(Array.prototype).length;
        // expect(withExts).toEqual(after);

        await cleanRun(async () => {
            withoutExts = Isolator.getProps(Array.prototype).length;
            expect(withoutExts).toBeLessThan(withExts);
        })
        // expect(Isolator.getProps(Array.prototype).length).toEqual(after);
    });
});

describe('extensions test', () => {
    beforeAll(() => {
        extensions.applyAllExtensions();
    });

    // [[[[[[[[[[  String Extensions  ]]]]]]]]]]

    test('string.format-positive', () => {
        let source = 'abc {{0}}';
        let output = source.format(123);
        expect(output).toBe('abc 123');
    });

    test('string.format-with-object', () => {
        let source = 'abc {{aa}}-{{bb}}';
        let output = source.format({ aa: 1, bb: 2 });
        expect(output).toBe('abc 1-2');
    });

    test('string.format-with-object-missing', () => {
        let source = 'abc {{aa}}-{{bb}}';
        let output = source.format({ aa: 1 });
        expect(output).toBe('abc 1-{{bb}}');
    });

    test('string.format-with-object-missing-remove', () => {
        let source = 'abc {{aa}}-{{bb}}';
        let output = source.format({ aa: 1 }, true);
        expect(output).toBe('abc 1-');
    });

    test('string.format-with-arr-missing-remove', () => {
        let source = 'abc {{0}}-{{1}}';
        let output = source.format(1);
        expect(output).toBe('abc 1-{{1}}');
    });

    test('string.capitalize-positive', () => {
        let source = 'abc def';
        let output = source.capitalize();
        expect(output).toBe('Abc def');
    });
    test('string.ellipsis-positive', () => {
        let source = 'abc def ghi';
        let output = source.ellipsis(5);
        expect(output).toBe('abc d...');
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
        let output = source.padNumber(4, '0');
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

    test('string.removeLastPart-positive', () => {
        let source = 'a/b/c';
        let output = source.removeLastPart();
        expect(output).toBe('a/b');
    });
    test('string.removeLastPart-positive-2', () => {
        let source = '/a/b/c';
        let output = source.removeLastPart();
        expect(output).toBe('/a/b');
    });
    test('string.removeLastPart-positive-3', () => {
        let source = 'a.b.c';
        let output = source.removeLastPart('.');
        expect(output).toBe('a.b');
    });
    test('string.getAbbreviation-positive', () => {
        let source = 'Israel Standard Time';
        let output = source.getAbbreviation();
        expect(output).toBe('IST');
    });
    test('string.getAbbreviation-negative', () => {
        let source = 'Israel';
        let output = source.getAbbreviation();
        expect(output).toBe('I');
    });

    test('string.isDateString-positive-iso', () => {
        let output = '2022-03-01T18:03:36.606Z'.isDateString();
        expect(output).toBe(true);
    });
    test('string.isDateString-negative-iso', () => {
        let output = '2022-03-01T'.isDateString();
        expect(output).toBe(false);
    });
    test('string.isDateString-positive-short', () => {
        let output = '01/01/2021'.isDateString();
        expect(output).toBe(true);
    });
    test('string.isDateString-positive-shorter', () => {
        let output = '01/01/21'.isDateString();
        expect(output).toBe(true);
    });

    test('string.replaceAll-positive', () => {
        let output = 'hello world i\'m home'.replaceAll('h', 'x').replaceAll('l', 'z');
        expect(output).toBe('xezzo worzd i\'m xome');
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
    test('date.isValid-null-value-simple', () => {
        let output = new Date('invalid').isValid();
        expect(output).toBe(false);
    });
    test('date.isValid-null-value-tricky', () => {
        let output = new Date('invalid...1').isValid();
        expect(output).toBe(true); // The Date object itself is actually valid, the string itself should be validated
    });
    test('date.isValid-negative', () => {
        let source = new Date(1231231231312312313100);
        let output = source.isValid();
        expect(output).toBe(false);
    });

    test('date.formatx-positive', () => {
        let output = dataset.date.formatx('HH:MM:ss.l', true);
        expect(output).toBe('21:00:14.000');
    });

    test('date.format-positive', () => {
        let output = dataset.date.format('HH:MM:ss.l', true);
        expect(output).toBe('21:00:14.000');
    });

    test('date.toJSON-positive', () => {
        let output = dataset.date.toJSON();
        expect(output).toBe('2019-07-25T21:00:14.000Z');
    });

    test('date.toJson-positive', () => {
        let output = dataset.date.toJson();
        expect(output).toBe('/Date(1564088414000)/');
    });

    test('date.fromJson-positive', () => {
        let output = new Date().fromJson('/Date(1564088414000)/').getTime();
        expect(output).toBe(dataset.date.getTime());
    });

    test('date.addHours-positive', () => {
        let output = dataset.date.addHours(6);
        expect(output.getHours()).toBe((dataset.date.getHours() + 6) % 24);
    });
    test('date.addMinutes-positive', () => {
        let output = dataset.date.addMinutes(6);
        expect(output.getMinutes()).toBe((dataset.date.getMinutes() + 6) % 60);
    });
    test('date.addDays-positive', () => {
        let output = dataset.date.addDays(1);
        expect(output.getDay()).toBe(dataset.date.getDay() + 1);
    });
    test('date.addMilliseconds-positive', () => {
        let output = dataset.date.addMilliseconds(6);
        expect(output.getMilliseconds()).toBe((dataset.date.getMilliseconds() + 6) % 1000);
    });

    test('date.toTimezone-positive', () => {
        let output = dataset.date.toTimezone('Australia/Sydney');
        expect(output.toString().startsWith('Fri Jul 26 2019 07:00:14')).toBe(true); // equals to 'Fri Jul 26 2019 07:00:14'
    });

    // [[[[[[[[[[  Array Extensions  ]]]]]]]]]]

    test('array.each-positive', () => {
        let source = [1, 2, 3];
        let output = source.each((v, k, c) => {
            // console.log({ v, k })
            source[k] = v * 2;
        });
        expect(source).toEqual([2, 4, 6]);
    });

    test('array.diff-positive', () => {
        let source = [1, 2, 3];
        let output = source.diff([2]);
        expect(output).toEqual([1, 3]);
    });

    test('array.myFilter-positive', () => {
        let source = [1, 2, 3, 4];
        let output = source.myFilter((item) => item % 2 == 0);
        expect(output).toEqual([2, 4]);
    });

    test('array.myFilterSingle-positive', () => {
        let source = [1, 2, 3, 4];
        let output = source.myFilterSingle((item) => item % 2 == 0);
        expect(output).toEqual(2);
    });

    test('array.myFilterSingle-positive', () => {
        let source = [1, 2, 3, 4];
        let output = source.myFilterSingle((item) => item % 2 == 0);
        expect(output).toEqual(2);
    });

    test('array.move-positive', () => {
        let source = [1, 2, 3, 4];
        let output = source.move(1, 3);
        expect(output).toEqual([1, 3, 4, 2]);
    });

    test('array.remove-positive', () => {
        let source = [1, 2, 3, 4];
        let output = source.remove(3);
        expect(output).toEqual([1, 2, 4]);
    });

    test('array.removeAt-positive', () => {
        let source = [1, 2, 3, 4];
        let output = source.removeAt(2);
        expect(output).toEqual([1, 2, 4]);
    });

    test('array.removeAt-replace', () => {
        let source = [1, 2, 3, 4];
        let output = source.removeAt(2, 'x');
        expect(output).toEqual([1, 2, 'x', 4]);
    });

    test('array.contains-positive', () => {
        let source = [1, 2, 3, 4];
        let output = source.contains(3);
        expect(output).toEqual(true);
    });

    test('array.removeDuplicates-positive', () => {
        let source = [1, 2, 3, 4, 3, 2];
        let output = source.removeDuplicates();
        expect(output).toEqual([1, 2, 3, 4]);
    });

    test('array.removeEmpty-positive', () => {
        let source = [1, 2, null, 4, null, 2];
        let output = source.removeEmpty();
        expect(output).toEqual([1, 2, 4, 2]);
    });
});
