import { expect, test, beforeAll, beforeEach, describe } from 'vitest'
import { Time } from '../../src/modules/Time';

const baseDateDTS = new Date(1627818230000); // Sun Aug 01 2021 14:43:50 GMT+0300 (Israel Daylight Time)
const baseDate = new Date(1639379000000); // Mon Dec 13 2021 09:03:20 GMT+0200 (Israel Standard Time)
const timezone = 'Asia/Jerusalem';

test('Time - basic', () => {
    let output = new Time(`12:00`, null, baseDate);
    expect(output.toString(null, baseDate)).toEqual('12:00');
    expect(output.toString(timezone)).toEqual('14:00 IST');
    expect(output.toString(timezone, baseDate)).toEqual('14:00 IST');
    expect(output.toString(timezone, baseDateDTS)).toEqual('15:00 IDT');

    output = new Time(`12:00`, null, baseDate);
    expect(output.toString()).toEqual('12:00');

    output = new Time(`12:00`, null, baseDateDTS);
    expect(output.toString()).toEqual('12:00');

    output = new Time(`12:00`, timezone, baseDateDTS);
    expect(output.toString()).toEqual('12:00 IDT');
});

test('Time - Timezone with fractional offset', () => {
    let output = new Time(`19:35`, 'Asia/Yangon', new Date(1639659695089));
    expect(output.toString('Asia/Jerusalem')).toEqual('15:05 IST');

    output = new Time(`16:45`, 'Asia/Jerusalem', new Date(1639665852052));
    expect(output.toString('Asia/Yangon')).toEqual('21:15 MT');
});

test('Time - Timezone with overflow', () => {
    let output = new Time(`19:35`, 'Australia/Sydney', new Date(1639659695089));
    expect(output.toString('Asia/Jerusalem')).toEqual('10:35 IST');
});

test('Time - Default Now', () => {
    let output = new Time(null, 'Australia/Sydney', new Date(1639668944470));
    expect(output.toString()).toEqual('02:35 AEDT');
});

test('Time - Check fromDate vs localized', () => {
    let a = new Time('12:00', null, baseDateDTS);
    const date = new Date(baseDateDTS);
    date.setHours(12, 0, 0);
    let b = Time.formDate(date);
    expect(a.toString(timezone)).toEqual(b.toString(timezone));
    expect(a.totalSeconds).toEqual(b.totalSeconds);
});

test('Time.parse', () => {
    let output = Time.parse('12:01:30 Asia/Jerusalem');
    expect(output).toMatchObject({
        hours: 12,
        minutes: 1,
        seconds: 30,
        timezone: 'Asia/Jerusalem',
    });
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

test('Time.formDate - With TZ', () => {
    let output = Time.formDate(baseDateDTS);
    expect(output.toString(timezone)).toEqual('14:43 IDT');
    output = Time.formDate(baseDate);
    expect(output.toString(timezone)).toEqual('09:03 IST');
});

test('Time.parse', () => {
    const output = new Time('14:43');
    expect(output.isUTC()).toEqual(true);
    expect(output.toString()).toEqual('14:43');
});

test('Time - toString & parse', () => {
    const time = Time.formDate(baseDateDTS);
    let output = new Time(time.toString(), timezone, baseDateDTS);
    expect(output.toString()).toEqual('11:43 IDT');

    output = new Time(time.toString(), null, baseDateDTS); // input considered as UTC
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
        const output = new Time('14:43 IST', timezone, baseDate);
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
