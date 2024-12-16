import { expect, test, beforeAll, beforeEach, describe, vi, Mock } from 'vitest'
import { ArrayExtensions } from '../../src/extensions/ArrayExtensions';
import { ConsoleColors, Log, LogLevel } from '../../src/modules/log';

beforeEach(() => {
    console.log = console.info = console.warn = console.error = vi.fn();
});

const getTime = () => new Date().format('HH:MM:ss.l');
const getCalledWith = () => {
    // Get the calls of the mocked console.log function
    const calls = (console.log as Mock).mock.calls;
    // Return the last call's first argument, or undefined if no calls
    return calls.length > 0 ? calls[calls.length - 1][0] : undefined;
};

test('write-allLevels-positive', () => {
    const mod = new Log(LogLevel.All);
    mod.isDebug = true;

    mod.debug('debug');
    expect(getCalledWith()).toMatch(/\s+\[DBG\]\s+\[\d+:\d+:\d+\.\d+\] debug /);

    mod.d('debug2');
    expect(getCalledWith()).toMatch(/\s+\[DBG\]\s+\[\d+:\d+:\d+\.\d+\] debug2 /);

    mod.verbose('verbose');
    expect(getCalledWith()).toMatch(/\s+\[v\]\s+\[\d+:\d+:\d+\.\d+\] verbose /);

    mod.v('verbose2');
    expect(getCalledWith()).toMatch(/\s+\[v\]\s+\[\d+:\d+:\d+\.\d+\] verbose2 /);

    mod.info('info');
    expect(getCalledWith()).toMatch(/\s+\[>>\]\s+\[\d+:\d+:\d+\.\d+\] info /);

    mod.i('info2');
    expect(getCalledWith()).toMatch(/\s+\[>>\]\s+\[\d+:\d+:\d+\.\d+\] info2 /);

    mod.warning('warn');
    expect(getCalledWith()).toMatch(/\s+\[\*\]\s+\[\d+:\d+:\d+\.\d+\] warn /);

    mod.w('warn2');
    expect(getCalledWith()).toMatch(/\s+\[\*\]\s+\[\d+:\d+:\d+\.\d+\] warn2 /);

    mod.error('error');
    expect(getCalledWith()).toMatch(/\s+\[\!\]\s+\[\d+:\d+:\d+\.\d+\] error /);

    mod.e('error2');
    expect(getCalledWith()).toMatch(/\s+\[\!\]\s+\[\d+:\d+:\d+\.\d+\] error2 /);

    mod.fatal('fatal');
    expect(getCalledWith()).toMatch(/\s+\[\!\!\!\]\s+\[\d+:\d+:\d+\.\d+\] fatal /);

    mod.write(LogLevel.Verbose, 'write');
    expect(getCalledWith()).toMatch(/\s+\[v\]\s+\[\d+:\d+:\d+\.\d+\] write /);

    //toHaveBeenCalledWith(` [v]     [${getTime()}] verbose `, '');
});

test('verbose-noTime-positive', () => {
    const mod = new Log(LogLevel.All);
    mod.isShowTime = false;
    const output = mod.verbose('verbose');
    expect(getCalledWith()).toMatch(/\s+\[v\]\s+\ verbose /);
});

test('verbose-noPrefix-positive', () => {
    const mod = new Log(LogLevel.All);
    mod.isShowPrefix = false;
    const output = mod.verbose('verbose');
    expect(getCalledWith()).toMatch(/\[\d+:\d+:\d+\.\d+\] verbose /);
});

test('verbose-noTime-noPrefix-positive', () => {
    const mod = new Log(LogLevel.All);
    mod.isShowTime = false;
    mod.isShowPrefix = false;
    const output = mod.verbose('verbose');
    expect(getCalledWith()).toMatch(/verbose /);
});

test('verbose-consoleColors-positive', () => {
    const mod = new Log(LogLevel.All);
    const output = mod.verbose(`verbose, ${mod.color('yellow', mod.colors.fgYellow)}`);
    expect(getCalledWith()).toMatch(/\s+\[v\]\s+\[\d+:\d+:\d+\.\d+\] verbose, \x1b\[33myellow\x1b\[0m /);
});

test('verbose-stacktrace-positive', () => {
    const mod = new Log(LogLevel.All);
    mod.isShowStacktrace = true;
    mod.error('error');
    const output = getCalledWith();
    expect(output).toMatch(/^\s+\[\!\]\s+\[\d{2}:\d{2}:\d{2}\.\d{3}\]\s+error\s+\n\s+at\s+.*$/);
    // [!]     [16:54:58.440] error·
    // at Object.<anonymous> (/Users/livshitz/Projects/Livshitz/libx.js/tests/modules/Log.test.ts:80:24)
});

test('verbose-filteredOut-positive', () => {
    const mod = new Log(LogLevel.Warning);
    const output = mod.info('should not print');
    expect(getCalledWith()).toEqual(undefined);
});

test('verbose-notFiltered-positive', () => {
    const mod = new Log(LogLevel.Verbose);
    const output = mod.info('should print');
    expect(getCalledWith()).toMatch(/\s+\[>>\]\s+\[\d+:\d+:\d+\.\d+\] should print /);
});

test('verbose-debug-noPrint-positive', () => {
    const mod = new Log(LogLevel.All);
    const output = mod.debug('should not print');
    expect(getCalledWith()).toEqual(undefined);
});

test('verbose-debug-print-positive', () => {
    const mod = new Log(LogLevel.All);
    mod.isDebug = true;
    const output = mod.debug('should print');
    expect(getCalledWith()).toMatch(/\s+\[DBG\]\s+\[\d+:\d+:\d+\.\d+\] should print /);
});

test('verbose-isBrowser-positive', () => {
    const mod = new Log(LogLevel.All);
    mod.isBrowser = true;
    const output = mod.verbose('verbose');
    expect(getCalledWith()).toMatch(/\s+\[v\]\s+\[\d+:\d+:\d+\.\d+\] verbose %c/);
});

// test('-positive', () => {
// 	const param = { a: 1 };
// 	const output = mod.(param);
// 	expect(output).toEqual(true);
// });
