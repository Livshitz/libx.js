import { extensions } from '../extensions/';
extensions.applyDateExtensions();

export class Log implements ILog {
    public colors = ConsoleColors;
    public isBrowser: boolean;
    public isDebug: boolean = false;
    public isConsole: boolean = true;
    public isShowStacktrace: boolean = false;
    public isShowTime: boolean;
    public isShowPrefix: boolean = true;
    public severities = LogLevel;
    public filterLevels: LogLevel;
    public filterLevel: LogLevel = LogLevel.Verbose;

    constructor(filterLevel: LogLevel = LogLevel.Verbose) {
        this.isBrowser = typeof window !== 'undefined' && window.document != null && typeof process === 'undefined';
        this.isShowTime = !this.isBrowser;
        this.filterLevel = filterLevel;
    }

    public debug(msg, ...args) {
        return this.write(this.severities.Debug, msg, args);
    }
    public d(msg, ...args) {
        return this.write(this.severities.Debug, msg, args);
    }
    public verbose(msg, ...args) {
        return this.write(this.severities.Verbose, msg, args);
    }
    public v(msg, ...args) {
        return this.write(this.severities.Verbose, msg, args);
    }
    public info(msg, ...args) {
        return this.write(this.severities.Info, msg, args);
    }
    public i(msg, ...args) {
        return this.write(this.severities.Info, msg, args);
    }
    public warning(msg, ...args) {
        return this.write(this.severities.Warning, msg, args);
    }
    public w(msg, ...args) {
        return this.write(this.severities.Warning, msg, args);
    }
    public error(msg, ...args) {
        return this.write(this.severities.Error, msg, args);
    }
    public e(msg, ...args) {
        return this.write(this.severities.Error, msg, args);
    }
    public fatal(msg, ...args) {
        return this.write(this.severities.Fatal, msg, args);
    }

    public write(severity: LogLevel, msg: string, args = []) {
        var time = this.isShowTime ? '[' + new Date().format('HH:MM:ss.l') + ']' : '';
        var prefix = '';
        var style = '';
        var func = 'log';

        if (severity == this.severities.Debug && !this.isDebug) return;
        if (severity != this.severities.Debug && severity > this.filterLevel) return;

        switch (severity) {
            case this.severities.Debug:
                func = 'log';
                prefix = ' [DBG]';
                style += 'font-size:10px;';
                break;
            case this.severities.Verbose:
                func = 'log';
                prefix = ' [v]';
                break;
            case this.severities.Info:
                func = 'info';
                prefix = ' [>>]';
                break;
            case this.severities.Warning:
                func = 'warn';
                prefix = ' [*]';
                break;
            case this.severities.Error:
                func = 'error';
                prefix = ' [!]';
                break;
            case this.severities.Fatal:
                func = 'error';
                prefix = ' [!!!]';
                style += 'color:red;';
                break;
        }

        prefix += '\t';
        if (!this.isShowPrefix) prefix = '';

        var trace = '';
        if (this.isShowStacktrace) trace = this.getStackTrace();

        const argsStr = JSON.stringify(args || '');

        if (typeof msg == 'object' && (<any>msg)?.constructor == Object) msg = JSON.stringify(msg);

        var _msg = `${prefix}${time} ${msg} ${trace}`; //${color != null ? '%c' : ''}
        if (this.isBrowser) {
            var _msg = `${prefix}${time} ${msg} %c${trace}`; //${color != null ? '%c' : ''}
            if (args.length == 0) console[func].call(console, _msg, 'font-size:8px;');
            else console[func].call(console, _msg, 'font-size:8px;', argsStr);
        } else if (this.isConsole) {
            console[func].call(console, _msg, args.length == 0 ? '' : this.color(argsStr, this.colors.fgYellow));
        }
        else {
            console[func].call(console, _msg, argsStr);
        }

        return msg + ' ' + argsStr;
    }

    public color(str: string, color: ConsoleColors) {
        var c = null;
        if (!color.startsWith('\x1b[')) c = ConsoleColors['fg' + color.capitalize()];
        else c = color;
        if (c == null && ConsoleColors[color] == null)
            throw 'given color ({0}) is not supported. options: black, red, green, yellow, blue, magenta, cyan, white'.format(color);
        return c + str + ConsoleColors.reset;
    }

    private getStackTrace() {
        try {
            var err = new Error();
            var ret = err.stack;
            var lines = ret.split('\n');
            var i = 4;
            if (lines.length < i) i = lines.length - 1;
            return lines[i].replace(/^\s+/g, '\n\t');
            // return lines[i].substring(lines[i].indexOf("(")+1, lines[i].lastIndexOf(")"));
        } catch (ex) {}
    }
}

export enum ConsoleColors {
    reset = '\x1b[0m',
    bright = '\x1b[1m',
    dim = '\x1b[2m',
    underscore = '\x1b[4m',
    blink = '\x1b[5m',
    reverse = '\x1b[7m',
    hidden = '\x1b[8m',

    fgBlack = '\x1b[30m',
    fgRed = '\x1b[31m',
    fgGreen = '\x1b[32m',
    fgYellow = '\x1b[33m',
    fgBlue = '\x1b[34m',
    fgMagenta = '\x1b[35m',
    fgCyan = '\x1b[36m',
    fgWhite = '\x1b[37m',

    bgBlack = '\x1b[40m',
    bgRed = '\x1b[41m',
    bgGreen = '\x1b[42m',
    bgYellow = '\x1b[43m',
    bgBlue = '\x1b[44m',
    bgMagenta = '\x1b[45m',
    bgCyan = '\x1b[46m',
    bgWhite = '\x1b[47m',
}

export enum LogLevel {
    None = 0,
    Fatal = 1 << 0,
    Error = 1 << 1,
    Warning = 1 << 2,
    Info = 1 << 3,
    Verbose = 1 << 4,
    Debug = 1 << 5,
    All = ~(~0 << 8),
}

export interface ILog {
    isDebug;
    isShowStacktrace;
    isShowTime;
    isShowPrefix;
    isBrowser;
    severities: typeof LogLevel;
    filterLevel: LogLevel;

    debug(message: string, ...args);
    d(message: string, ...args);
    verbose(message: string, ...args);
    v(message: string, ...args);
    info(message: string, ...args);
    i(message: string, ...args);
    warning(message: string, ...args);
    w(message: string, ...args);
    error(message: string, ...args);
    e(message: string, ...args);
    fatal(message: string, ...args);

    colors: typeof ConsoleColors;
    color(str: string, color: ConsoleColors): string;
    write(...args);
    // getStackTrace(): string;
}

export const log = new Log();
