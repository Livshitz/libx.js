import { Time } from '../../src/modules/Time';

const baseDateDTS = new Date(1627818230000); // Sun Aug 01 2021 14:43:50 GMT+0300 (Israel Daylight Time)
const baseDate = new Date(1639379000000); // Mon Dec 13 2021 09:03:20 GMT+0200 (Israel Standard Time)

test('Time - basic', () => {
    let output = new Time(12, 0);
    expect(output.toString(null, baseDate)).toEqual('12:00');
    expect(output.toString('Asia/Jerusalem', baseDate)).toEqual('14:00 IST');
});
test('Time.formDate - UTC', () => {
    let output = Time.formDate(baseDateDTS);
    expect(output.toString(null, baseDateDTS)).toEqual('11:43');
    output = Time.formDate(baseDate);
    expect(output.toString(null, baseDate)).toEqual('07:03');
});

test('Time.parse', () => {
    const output = Time.parse('14:43');
    expect(output.isUTC()).toEqual(true);
    expect(output.toString()).toEqual('14:43');
});

test('Time.getSeconds', () => {
    const time = Time.parse('14:43 Asia/Jerusalem');
    const output = time.getTotalSeconds();
    expect(output).toEqual(52980);
});

test('Time.compare', () => {
    const a = Time.parse('14:43 Asia/Jerusalem');
    let output: 0 | 1 | -1;

    output = a.compare(Time.parse('10:23 Asia/Jerusalem'));
    expect(output).toEqual(1);

    output = a.compare(Time.parse('17:23 Asia/Jerusalem'));
    expect(output).toEqual(-1);

    output = a.compare(Time.parse('14:43 Asia/Jerusalem'));
    expect(output).toEqual(0);
});

test('Time.getTimeZoneName', () => {
    const timezone = 'Asia/Jerusalem';
    let output = Time.getTimeZoneName(timezone, baseDate, false);
    expect(output).toEqual('Israel Standard Time');

    output = Time.getTimeZoneName(timezone, baseDate, true);
    expect(output).toEqual('IST');

    output = Time.getTimeZoneName(timezone, baseDateDTS, false);
    expect(output).toEqual('Israel Daylight Time');

    output = Time.getTimeZoneName(timezone, baseDateDTS, true);
    expect(output).toEqual('IDT');

    output = Time.getTimeZoneName('America/Los_Angeles', baseDate, false);
    expect(output).toEqual('Pacific Standard Time');

    output = Time.getTimeZoneName('America/Los_Angeles', baseDateDTS, true);
    expect(output).toEqual('PDT');
});

describe('timezones', () => {
    test('Time.getLocalTimezone - default', () => {
        expect(Time.getLocalTimezone()).toEqual('UTC'); // overridden in jest.config.js
    });

    test('Time.formDate - with timezone', () => {
        let output = Time.formDate(baseDateDTS);
        expect(output.toString('Asia/Jerusalem', baseDateDTS)).toEqual('14:43 IDT');
        output = Time.formDate(baseDate);
        expect(output.toString('Asia/Jerusalem', baseDate)).toEqual('09:03 IST');
    });

    test('Time.parse', () => {
        const output = Time.parse('14:43 Asia/Jerusalem');
        expect(output.toString()).toEqual('14:43 IST');
    });

    test('Time.getTimezoneOffset - with DTS', () => {
        let output = Time.getTimezoneOffset('Asia/Jerusalem', baseDateDTS);
        expect(output).toEqual(3);

        output = Time.getTimezoneOffset('Australia/Adelaide', baseDateDTS);
        expect(output).toEqual(9.5);

        output = Time.getTimezoneOffset('Atlantic/Bermuda', baseDateDTS);
        expect(output).toEqual(-3);

        output = Time.getTimezoneOffset('Europe/London', baseDateDTS);
        expect(output).toEqual(1);
    });

    test('Time.getTimezoneOffset - without DTS', () => {
        const date = new Date(baseDate);
        let output = Time.getTimezoneOffset('Asia/Jerusalem', date);
        expect(output).toEqual(2);

        output = Time.getTimezoneOffset('Australia/Adelaide', date);
        expect(output).toEqual(10.5);

        output = Time.getTimezoneOffset('Atlantic/Bermuda', date);
        expect(output).toEqual(-4);

        output = Time.getTimezoneOffset('Europe/London', date);
        expect(output).toEqual(0);
    });
});
