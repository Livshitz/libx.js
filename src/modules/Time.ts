import { StringExtensions } from '../extensions/StringExtensions';
import { helpers } from '../helpers';

export class Time {
    private offsetHours = 0;
    constructor(public hour: number, public min: number, public sec?: number, public timezone?: string) {
        if (timezone != null) {
            this.offsetHours = Time.getTimezoneOffset(timezone, this.toDate());
            this.hour -= this.offsetHours;
        }
    }

    public isUTC = () => this.offsetHours == 0;

    public static formDate(date: Date, timezone?: string) {
        const ret = new Time(0, 0);
        ret.hour = date.getUTCHours();
        ret.min = date.getUTCMinutes();
        ret.sec = date.getUTCSeconds();
        ret.timezone = timezone;
        ret.offsetHours = Math.abs(date.getTimezoneOffset()) / 60;
        return ret;
    }

    public static parse(input: string, timezone?: string) {
        const matches = helpers.getMatches(input, /(?<hour>\d+)\:(?<min>\d+)(\:(?<sec>\d+))?\s?(?<timezone>.*)?/, true);
        if (matches == null || matches.length == 0) return null;
        return new Time(parseInt(matches[0]?.hour), parseInt(matches[0]?.min), parseInt(matches[0]?.sec), matches[0]?.timezone || timezone);
    }

    public toDate(baseDate?: Date) {
        const ret = baseDate != null ? new Date(baseDate) : new Date();
        ret.setUTCHours(this.hour, this.min, 0, 0);
        return ret;
    }

    public getTotalSeconds() {
        return this.min * 60 + (this.hour + this.offsetHours) * 60 * 60 + (this.sec || 0);
    }

    public compare(to: Time) {
        const a = this.getTotalSeconds();
        const b = to.getTotalSeconds();

        return a == b ? 0 : a > b ? 1 : a < b ? -1 : null;
    }

    public toString(timezone?: string, baseDate = new Date(), emitSeconds = true) {
        const sec = emitSeconds == false && this.sec != null ? `:${StringExtensions.padNumber.call(this.sec, 2)}` : '';
        let tzOffset = this.offsetHours;
        if (timezone != null) tzOffset = Time.getTimezoneOffset(timezone, this.toDate(baseDate));
        const tz = timezone || this.timezone;
        const tzAbbr = Time.getTimeZoneName(tz, baseDate, true);
        const tzStr = tz != null ? ` ${tzAbbr}` : '';

        return `${StringExtensions.padNumber.call(this.hour + tzOffset, 2)}:${StringExtensions.padNumber.call(this.min, 2)}${sec}${tzStr}`;
    }

    public static getTimezoneOffset(timezone: string, hereDate = new Date()) {
        hereDate = new Date(hereDate);
        hereDate.setMilliseconds(0);

        const hereOffsetHrs = (hereDate.getTimezoneOffset() / 60) * -1,
            thereLocaleStr = hereDate.toLocaleString('en-US', { timeZone: timezone }),
            thereDate = new Date(thereLocaleStr),
            diffHrs = (thereDate.getTime() - hereDate.getTime()) / 1000 / 60 / 60,
            thereOffsetHrs = hereOffsetHrs + diffHrs;

        // console.log(timezone, thereDate, 'UTC' + (thereOffsetHrs < 0 ? '' : '+') + thereOffsetHrs);
        return thereOffsetHrs;
    }

    public static getLocalTimezone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    public static getTimeZoneName(timezone: string, date = new Date(), inAbbreviation = true) {
        let ret = Intl.DateTimeFormat('en', { timeZoneName: 'long', timeZone: timezone })
            .formatToParts(date)
            .find((p) => p.type === 'timeZoneName').value;

        if (inAbbreviation) ret = StringExtensions.getAbbreviation.call(ret);
        return ret;
    }
}
