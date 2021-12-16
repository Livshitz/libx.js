import { Time } from '../../src/modules/Time';

const baseDateDTS = new Date(1627818230000); // Sun Aug 01 2021 14:43:50 GMT+0300 (Israel Daylight Time)
const baseDate = new Date(1639379000000); // Mon Dec 13 2021 09:03:20 GMT+0200 (Israel Standard Time)
const timezone = 'Asia/Jerusalem';

test('Time - basic', () => {
    let output = new Time(`12:00`);
    expect(output.toString(null, baseDate)).toEqual('12:00');
    expect(output.toString(timezone)).toEqual('14:00 IST');
    expect(output.toString(timezone, baseDate)).toEqual('14:00 IST');
    expect(output.toString(timezone, baseDateDTS)).toEqual('15:00 IDT');

    output = new Time(`12:00`, baseDate);
    expect(output.toString()).toEqual('12:00');

    output = new Time(`12:00`, baseDateDTS);
    expect(output.toString()).toEqual('12:00');

    output = new Time(`12:00`, baseDateDTS, timezone);
    expect(output.toString()).toEqual('12:00 IDT');

    // expect(output.toString(timezone, baseDate)).toEqual('14:00 IST');
    // expect(output.toString(timezone, baseDateDTS)).toEqual('15:00 IDT');
});

test('Time - Timezone with fractional offset', () => {
    let output = new Time(`19:35`, new Date(1639659695089), 'Asia/Yangon');
    expect(output.toString('Asia/Jerusalem')).toEqual('15:05 IST');
});

test('Time - add', () => {
    let output = new Time(`2:5:5`);
    output.add(1, 5, 45);
    expect(output.toString(null, null, true)).toEqual('03:10:50');
});

test('Time.formDate - UTC', () => {
    let output = Time.formDate(baseDateDTS);
    expect(output.toString(null, baseDateDTS)).toEqual('11:43');
    output = Time.formDate(baseDate);
    expect(output.toString(null, baseDate)).toEqual('07:03');
});

test('Time.parse', () => {
    const output = new Time('14:43');
    expect(output.isUTC()).toEqual(true);
    expect(output.toString()).toEqual('14:43');
});

test('Time - toString & parse', () => {
    const time = Time.formDate(baseDateDTS, timezone);
    let output = new Time(time.toString(), baseDateDTS, timezone);
    expect(output.toString()).toEqual('11:43 IDT');

    output = new Time(time.toString(), baseDateDTS); // input considered as UTC
    expect(output.toString()).toEqual('11:43');
});

test('Time.toString - negative', () => {
    const time = new Time(`01:10`);
    time.subtract(2, 5);
    expect(time.toString()).toEqual('-01:55');
});

test('Time.getSeconds', () => {
    const time = new Time('14:43 Asia/Jerusalem');
    const output = time.totalSeconds;
    expect(output).toEqual(52980);
});

test('Time.compare', () => {
    const a = new Time('14:43 Asia/Jerusalem');
    let output: 0 | 1 | -1;

    output = a.compare(new Time('10:23 Asia/Jerusalem'));
    expect(output).toEqual(1);

    output = a.compare(new Time('17:23 Asia/Jerusalem'));
    expect(output).toEqual(-1);

    output = a.compare(new Time('14:43 Asia/Jerusalem'));
    expect(output).toEqual(0);
});

describe('timezones', () => {
    test('Time.getTimeZoneName', () => {
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

    test('Time.getLocalTimezone - default', () => {
        expect(Time.getLocalTimezone()).toEqual('UTC'); // overridden in jest.config.js
    });

    test('Time.formDate - with timezone', () => {
        let output = Time.formDate(baseDateDTS);
        expect(output.toString(timezone, baseDateDTS)).toEqual('14:43 IDT');
        output = Time.formDate(baseDate);
        expect(output.toString(timezone, baseDate)).toEqual('09:03 IST');
    });

    test('Time.parse', () => {
        const output = new Time('14:43 IST', null, timezone);
        expect(output.toString()).toEqual('14:43 IST');
    });

    test('Time.getTimezoneOffset - with DTS', () => {
        let output = Time.getTimezoneOffset(timezone, baseDateDTS);
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
        let output = Time.getTimezoneOffset(timezone, date);
        expect(output).toEqual(2);

        output = Time.getTimezoneOffset('Australia/Adelaide', date);
        expect(output).toEqual(10.5);

        output = Time.getTimezoneOffset('Atlantic/Bermuda', date);
        expect(output).toEqual(-4);

        output = Time.getTimezoneOffset('Europe/London', date);
        expect(output).toEqual(0);
    });
});
