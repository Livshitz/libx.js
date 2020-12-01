export class DateExtensions {
    public static isValid = function () {
        // An invalid date object returns NaN for getTime() and NaN is the only
        // object not strictly equal to itself.
        return this.getTime() === this.getTime();
    };

    public static dateFormat = (function () {
        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g;

        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {
            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == '[object String]' && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date();
            if (isNaN(date)) throw SyntaxError('invalid date');

            mask = String(DateExtensions.masks[mask] || mask || DateExtensions.masks['default']);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == 'UTC:') {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? 'getUTC' : 'get',
                d = date[_ + 'Date'](),
                D = date[_ + 'Day'](),
                m = date[_ + 'Month'](),
                y = date[_ + 'FullYear'](),
                H = date[_ + 'Hours'](),
                M = date[_ + 'Minutes'](),
                s = date[_ + 'Seconds'](),
                L = date[_ + 'Milliseconds'](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d: d,
                    dd: DateExtensions.pad(d),
                    ddd: DateExtensions.i18n.dayNames[D],
                    dddd: DateExtensions.i18n.dayNames[D + 7],
                    m: m + 1,
                    mm: DateExtensions.pad(m + 1),
                    mmm: DateExtensions.i18n.monthNames[m],
                    mmmm: DateExtensions.i18n.monthNames[m + 12],
                    yy: String(y).slice(2),
                    yyyy: y,
                    h: H % 12 || 12,
                    hh: DateExtensions.pad(H % 12 || 12),
                    H: H,
                    HH: DateExtensions.pad(H),
                    M: M,
                    MM: DateExtensions.pad(M),
                    s: s,
                    ss: DateExtensions.pad(s),
                    l: DateExtensions.pad(L, 3),
                    L: DateExtensions.pad(L > 99 ? Math.round(L / 10) : L),
                    t: H < 12 ? 'a' : 'p',
                    tt: H < 12 ? 'am' : 'pm',
                    T: 'T',
                    TTT: H < 12 ? 'A' : 'P',
                    TT: H < 12 ? 'AM' : 'PM',
                    Z: 'Z',
                    ZZ: utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
                    o: (o > 0 ? '-' : '+') + DateExtensions.pad(Math.floor(Math.abs(o) / 60) * 100 + (Math.abs(o) % 60), 4),
                    S: ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (<any>((d % 100) - (d % 10) != 10) * d) % 10],
                };

            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    })();

    public static pad = function (val, len?) {
        val = String(val);
        len = len || 2;
        while (val.length < len) val = '0' + val;
        return val;
    };

    // Some common format strings
    public static masks = {
        default: 'ddd mmm dd yyyy HH:MM:ss',
        shortDate: 'm/d/yy',
        mediumDate: 'mmm d, yyyy',
        longDate: 'mmmm d, yyyy',
        fullDate: 'dddd, mmmm d, yyyy',
        shortTime: 'h:MM TT',
        mediumTime: 'h:MM:ss TT',
        longTime: 'h:MM:ss TT Z',
        isoDate: 'yyyy-mm-dd',
        isoTime: 'HH:MM:ss',
        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
    };

    // Internationalization strings
    public static i18n = {
        dayNames: [
            'Sun',
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat',
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ],
        monthNames: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ],
    };

    // For convenience...
    public static formatx = function (mask, utc = null) {
        if (mask == null) return this;
        return this.dateFormat(this, mask, utc);
    };

    public static format = function (strFormat, utc = null) {
        if (isNaN(this.getTime())) return null;
        // An invalid date object returns NaN for getTime() and NaN is the only
        // object not strictly equal to itself.
        return this.dateFormat(this, strFormat, utc);
    };

    public static fromJson = function (aJsonDate) {
        if (aJsonDate == undefined || aJsonDate == '') return null;
        var stripped = aJsonDate.replace('/Date(', '').replace(')/', '');
        return new Date(parseInt(stripped, 10));
    };

    public static toJson = function () {
        return '/Date(' + this.getTime() + ')/';
    };

    public static addHours = function (h) {
        return this.addMilliseconds(h * 60 * 60 * 1000);
    };

    public static addMinutes = function (m) {
        return this.addMilliseconds(m * 60 * 1000);
    };

    public static addMilliseconds = function (ms) {
        let ret = new Date(this);
        ret.setTime(ret.getTime() + ms);
        return ret;
    };

    public static toUTC = function () {
        var date = new Date(this);
        var gmtRe = /GMT([\-\+]?\d{4})/;
        var tz = gmtRe.exec(date.toString())[1];
        var hour = parseInt(tz) / 100;
        var min = parseInt(tz) % 100;
        date.setHours(date.getHours() - hour);
        date.setMinutes(date.getMinutes() - min);
        return date;
    };

    public static toISOStringUTC = function (isUTC = false) {
        let date = this;
        return date.formatx('yyyy-mm-ddTHH:MM:ss.lZ', !isUTC); // opposite, as if it's UTC, it'll reduce the timezone
    };

    public static toTimezone = function (timezone) {
        const date = this;
        return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', { timeZone: timezone }));
    };
}
