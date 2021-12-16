import { StringExtensions } from '../extensions/StringExtensions';
import { helpers } from '../helpers';
import Exception from '../helpers/Exceptions';

export class Time {
    private offsetHours = 0;
    public totalSeconds = 0;
    constructor(hoursMinSecStr?: string, private baseTimestamp?: Date, public timezone?: string) {
        // notice: timestamp is Date object without timezone info
        const isNow = hoursMinSecStr == null;
        baseTimestamp = baseTimestamp != null ? new Date(baseTimestamp.getTime()) : new Date();

        if (isNow) hoursMinSecStr = `${baseTimestamp.getUTCHours()}:${baseTimestamp.getUTCMinutes()}:${baseTimestamp.getUTCSeconds()}`;

        const matches = helpers.getMatches(hoursMinSecStr, /(?<hour>\d+)\:(?<min>\d+)(\:(?<sec>\d+))?\s?(?<timezone>.*)?/, true);
        if (matches == null || matches.length == 0) throw new Exception('Time: Unable to parse time input', { hoursMinSecStr });

        let hour = parseInt(matches[0]?.hour) || 0,
            min = parseInt(matches[0]?.min) || 0,
            sec = parseInt(matches[0]?.sec) || 0;

        if (timezone != null && !isNow) {
            this.offsetHours = Time.getTimezoneOffset(timezone, baseTimestamp);
            hour = hour - Math.floor(this.offsetHours);
            min = Math.abs(min - (this.offsetHours % 1) * 60);
        }
        baseTimestamp.setUTCHours(hour, min, sec);

        this.totalSeconds = (sec || 0) + min * 60 + hour * 60 * 60;
    }

    public get hour() {
        return Time.totalSecondsToHoursMinutesSeconds(this.totalSeconds).hours;
    }
    public set hour(value: number) {
        this.totalSeconds = this.totalSeconds - Math.floor(this.totalSeconds / 60 / 60) * 60 * 60 + value * 60 * 60;
    }
    public get min() {
        return Time.totalSecondsToHoursMinutesSeconds(this.totalSeconds).minutes;
    }
    public set min(value: number) {
        this.totalSeconds = this.totalSeconds - Math.floor((this.totalSeconds % 3600) / 60) * 60 + value * 60;
    }
    public get sec() {
        return Time.totalSecondsToHoursMinutesSeconds(this.totalSeconds).seconds;
    }
    public set sec(value: number) {
        this.totalSeconds = this.totalSeconds - Math.floor(this.totalSeconds % 60) + value;
    }

    public add(hours: number, mins = 0, sec = 0) {
        this.totalSeconds += hours * 60 * 60 + mins * 60 + sec;
        // this.hour += hours;
        // this.min += mins;
        // this.sec += sec;
    }

    public subtract(hours: number, mins = 0, sec = 0) {
        this.totalSeconds -= hours * 60 * 60 + mins * 60 + sec;
    }

    public isUTC = () => this.offsetHours == 0;

    public static formDate(date: Date, timezone?: string) {
        const hour = date.getUTCHours();
        const min = date.getUTCMinutes();
        const sec = date.getUTCSeconds();

        const ret = new Time(`${hour}:${min}:${sec}`, date, timezone);
        return ret;
    }

    public toDate(baseTimestamp?: Date) {
        const ret = baseTimestamp != null ? new Date(baseTimestamp || this.baseTimestamp) : new Date();
        ret.setUTCHours(this.hour, this.min, this.sec, 0);
        return ret;
    }

    public compare(to: Time) {
        const a = this.totalSeconds;
        const b = to.totalSeconds;

        return a == b ? 0 : a > b ? 1 : a < b ? -1 : null;
    }

    public toString(timezone?: string, baseTimestamp?: Date, includeSeconds = false, asDuration = false) {
        let tzOffset = this.offsetHours;
        const tz = timezone || this.timezone;
        if (tz != null) tzOffset = Time.getTimezoneOffset(tz, this.toDate(baseTimestamp || this.baseTimestamp));
        const tzAbbr = Time.getTimeZoneName(tz, baseTimestamp || this.baseTimestamp, true);
        const tzStr = tz != null ? ` ${tzAbbr}` : '';

        let isNegative = this.totalSeconds < 0;

        const newTime = Time.totalSecondsToHoursMinutesSeconds(this.totalSeconds + tzOffset * 60 * 60);

        let sign = isNegative ? '-' : '',
            h = StringExtensions.padNumber.call(Math.abs(asDuration ? newTime.hours : newTime.hours % 24), 2),
            m = StringExtensions.padNumber.call(Math.abs(newTime.minutes), 2),
            s = includeSeconds == true && this.sec != null ? `:${StringExtensions.padNumber.call(Math.abs(newTime.seconds), 2)}` : '';

        return `${sign}${h}:${m}${s}${tzStr}`;
    }

    public static getTimezoneOffset(timezone: string, hereDate = new Date()) {
        hereDate = new Date(hereDate);
        hereDate.setMilliseconds(0);

        const hereOffsetHrs = (hereDate.getTimezoneOffset() / 60) * -1,
            thereLocaleStr = hereDate.toLocaleString('en-US', { timeZone: timezone }),
            thereDate = new Date(thereLocaleStr),
            diffHrs = (thereDate.getTime() - hereDate.getTime()) / 1000 / 60 / 60,
            thereOffsetHrs = hereOffsetHrs + diffHrs;

        return thereOffsetHrs;
    }

    public static getLocalTimezone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    public static getTimeZoneName(timezone: string, date = new Date(), inAbbreviation = true) {
        const format = Intl.DateTimeFormat('en', { timeZoneName: 'long', timeZone: timezone });
        let ret = format.formatToParts(date || new Date()).find((p) => p.type === 'timeZoneName').value;

        if (ret.startsWith('GMT')) ret = format.formatToParts(null).find((p) => p.type === 'timeZoneName').value;

        if (inAbbreviation && !ret.startsWith('GMT')) ret = StringExtensions.getAbbreviation.call(ret);

        return ret;
    }

    public static totalSecondsToHoursMinutesSeconds(totalSeconds: number) {
        return {
            hours: Math.floor(totalSeconds / 3600),
            minutes: Math.floor((totalSeconds % 3600) / 60),
            seconds: Math.floor(totalSeconds % 60),
        };
    }

    public static readonly TimeZones = [
        'Europe/Andorra',
        'Asia/Dubai',
        'Asia/Kabul',
        'Europe/Tirane',
        'Asia/Yerevan',
        'Antarctica/Casey',
        'Antarctica/Davis',
        'Antarctica/DumontDUrville', // https://bugs.chromium.org/p/chromium/issues/detail?id=928068
        'Antarctica/Mawson',
        'Antarctica/Palmer',
        'Antarctica/Rothera',
        'Antarctica/Syowa',
        'Antarctica/Troll',
        'Antarctica/Vostok',
        'America/Argentina/Buenos_Aires',
        'America/Argentina/Cordoba',
        'America/Argentina/Salta',
        'America/Argentina/Jujuy',
        'America/Argentina/Tucuman',
        'America/Argentina/Catamarca',
        'America/Argentina/La_Rioja',
        'America/Argentina/San_Juan',
        'America/Argentina/Mendoza',
        'America/Argentina/San_Luis',
        'America/Argentina/Rio_Gallegos',
        'America/Argentina/Ushuaia',
        'Pacific/Pago_Pago',
        'Europe/Vienna',
        'Australia/Lord_Howe',
        'Antarctica/Macquarie',
        'Australia/Hobart',
        'Australia/Currie',
        'Australia/Melbourne',
        'Australia/Sydney',
        'Australia/Broken_Hill',
        'Australia/Brisbane',
        'Australia/Lindeman',
        'Australia/Adelaide',
        'Australia/Darwin',
        'Australia/Perth',
        'Australia/Eucla',
        'Asia/Baku',
        'America/Barbados',
        'Asia/Dhaka',
        'Europe/Brussels',
        'Europe/Sofia',
        'Atlantic/Bermuda',
        'Asia/Brunei',
        'America/La_Paz',
        'America/Noronha',
        'America/Belem',
        'America/Fortaleza',
        'America/Recife',
        'America/Araguaina',
        'America/Maceio',
        'America/Bahia',
        'America/Sao_Paulo',
        'America/Campo_Grande',
        'America/Cuiaba',
        'America/Santarem',
        'America/Porto_Velho',
        'America/Boa_Vista',
        'America/Manaus',
        'America/Eirunepe',
        'America/Rio_Branco',
        'America/Nassau',
        'Asia/Thimphu',
        'Europe/Minsk',
        'America/Belize',
        'America/St_Johns',
        'America/Halifax',
        'America/Glace_Bay',
        'America/Moncton',
        'America/Goose_Bay',
        'America/Blanc-Sablon',
        'America/Toronto',
        'America/Nipigon',
        'America/Thunder_Bay',
        'America/Iqaluit',
        'America/Pangnirtung',
        'America/Atikokan',
        'America/Winnipeg',
        'America/Rainy_River',
        'America/Resolute',
        'America/Rankin_Inlet',
        'America/Regina',
        'America/Swift_Current',
        'America/Edmonton',
        'America/Cambridge_Bay',
        'America/Yellowknife',
        'America/Inuvik',
        'America/Creston',
        'America/Dawson_Creek',
        'America/Fort_Nelson',
        'America/Vancouver',
        'America/Whitehorse',
        'America/Dawson',
        'Indian/Cocos',
        'Europe/Zurich',
        'Africa/Abidjan',
        'Pacific/Rarotonga',
        'America/Santiago',
        'America/Punta_Arenas',
        'Pacific/Easter',
        'Asia/Shanghai',
        'Asia/Urumqi',
        'America/Bogota',
        'America/Costa_Rica',
        'America/Havana',
        'Atlantic/Cape_Verde',
        'America/Curacao',
        'Indian/Christmas',
        'Asia/Nicosia',
        'Asia/Famagusta',
        'Europe/Prague',
        'Europe/Berlin',
        'Europe/Copenhagen',
        'America/Santo_Domingo',
        'Africa/Algiers',
        'America/Guayaquil',
        'Pacific/Galapagos',
        'Europe/Tallinn',
        'Africa/Cairo',
        'Africa/El_Aaiun',
        'Europe/Madrid',
        'Africa/Ceuta',
        'Atlantic/Canary',
        'Europe/Helsinki',
        'Pacific/Fiji',
        'Atlantic/Stanley',
        'Pacific/Chuuk',
        'Pacific/Pohnpei',
        'Pacific/Kosrae',
        'Atlantic/Faroe',
        'Europe/Paris',
        'Europe/London',
        'Asia/Tbilisi',
        'America/Cayenne',
        'Africa/Accra',
        'Europe/Gibraltar',
        'America/Godthab',
        'America/Danmarkshavn',
        'America/Scoresbysund',
        'America/Thule',
        'Europe/Athens',
        'Atlantic/South_Georgia',
        'America/Guatemala',
        'Pacific/Guam',
        'Africa/Bissau',
        'America/Guyana',
        'Asia/Hong_Kong',
        'America/Tegucigalpa',
        'America/Port-au-Prince',
        'Europe/Budapest',
        'Asia/Jakarta',
        'Asia/Pontianak',
        'Asia/Makassar',
        'Asia/Jayapura',
        'Europe/Dublin',
        'Asia/Jerusalem',
        'Asia/Kolkata',
        'Indian/Chagos',
        'Asia/Baghdad',
        'Asia/Tehran',
        'Atlantic/Reykjavik',
        'Europe/Rome',
        'America/Jamaica',
        'Asia/Amman',
        'Asia/Tokyo',
        'Africa/Nairobi',
        'Asia/Bishkek',
        'Pacific/Tarawa',
        'Pacific/Enderbury',
        'Pacific/Kiritimati',
        'Asia/Pyongyang',
        'Asia/Seoul',
        'Asia/Almaty',
        'Asia/Qyzylorda',
        'Asia/Qostanay', // https://bugs.chromium.org/p/chromium/issues/detail?id=928068
        'Asia/Aqtobe',
        'Asia/Aqtau',
        'Asia/Atyrau',
        'Asia/Oral',
        'Asia/Beirut',
        'Asia/Colombo',
        'Africa/Monrovia',
        'Europe/Vilnius',
        'Europe/Luxembourg',
        'Europe/Riga',
        'Africa/Tripoli',
        'Africa/Casablanca',
        'Europe/Monaco',
        'Europe/Chisinau',
        'Pacific/Majuro',
        'Pacific/Kwajalein',
        'Asia/Yangon',
        'Asia/Ulaanbaatar',
        'Asia/Hovd',
        'Asia/Choibalsan',
        'Asia/Macau',
        'America/Martinique',
        'Europe/Malta',
        'Indian/Mauritius',
        'Indian/Maldives',
        'America/Mexico_City',
        'America/Cancun',
        'America/Merida',
        'America/Monterrey',
        'America/Matamoros',
        'America/Mazatlan',
        'America/Chihuahua',
        'America/Ojinaga',
        'America/Hermosillo',
        'America/Tijuana',
        'America/Bahia_Banderas',
        'Asia/Kuala_Lumpur',
        'Asia/Kuching',
        'Africa/Maputo',
        'Africa/Windhoek',
        'Pacific/Noumea',
        'Pacific/Norfolk',
        'Africa/Lagos',
        'America/Managua',
        'Europe/Amsterdam',
        'Europe/Oslo',
        'Asia/Kathmandu',
        'Pacific/Nauru',
        'Pacific/Niue',
        'Pacific/Auckland',
        'Pacific/Chatham',
        'America/Panama',
        'America/Lima',
        'Pacific/Tahiti',
        'Pacific/Marquesas',
        'Pacific/Gambier',
        'Pacific/Port_Moresby',
        'Pacific/Bougainville',
        'Asia/Manila',
        'Asia/Karachi',
        'Europe/Warsaw',
        'America/Miquelon',
        'Pacific/Pitcairn',
        'America/Puerto_Rico',
        'Asia/Gaza',
        'Asia/Hebron',
        'Europe/Lisbon',
        'Atlantic/Madeira',
        'Atlantic/Azores',
        'Pacific/Palau',
        'America/Asuncion',
        'Asia/Qatar',
        'Indian/Reunion',
        'Europe/Bucharest',
        'Europe/Belgrade',
        'Europe/Kaliningrad',
        'Europe/Moscow',
        'Europe/Simferopol',
        'Europe/Kirov',
        'Europe/Astrakhan',
        'Europe/Volgograd',
        'Europe/Saratov',
        'Europe/Ulyanovsk',
        'Europe/Samara',
        'Asia/Yekaterinburg',
        'Asia/Omsk',
        'Asia/Novosibirsk',
        'Asia/Barnaul',
        'Asia/Tomsk',
        'Asia/Novokuznetsk',
        'Asia/Krasnoyarsk',
        'Asia/Irkutsk',
        'Asia/Chita',
        'Asia/Yakutsk',
        'Asia/Khandyga',
        'Asia/Vladivostok',
        'Asia/Ust-Nera',
        'Asia/Magadan',
        'Asia/Sakhalin',
        'Asia/Srednekolymsk',
        'Asia/Kamchatka',
        'Asia/Anadyr',
        'Asia/Riyadh',
        'Pacific/Guadalcanal',
        'Indian/Mahe',
        'Africa/Khartoum',
        'Europe/Stockholm',
        'Asia/Singapore',
        'America/Paramaribo',
        'Africa/Juba',
        'Africa/Sao_Tome',
        'America/El_Salvador',
        'Asia/Damascus',
        'America/Grand_Turk',
        'Africa/Ndjamena',
        'Indian/Kerguelen',
        'Asia/Bangkok',
        'Asia/Dushanbe',
        'Pacific/Fakaofo',
        'Asia/Dili',
        'Asia/Ashgabat',
        'Africa/Tunis',
        'Pacific/Tongatapu',
        'Europe/Istanbul',
        'America/Port_of_Spain',
        'Pacific/Funafuti',
        'Asia/Taipei',
        'Europe/Kiev',
        'Europe/Uzhgorod',
        'Europe/Zaporozhye',
        'Pacific/Wake',
        'America/New_York',
        'America/Detroit',
        'America/Kentucky/Louisville',
        'America/Kentucky/Monticello',
        'America/Indiana/Indianapolis',
        'America/Indiana/Vincennes',
        'America/Indiana/Winamac',
        'America/Indiana/Marengo',
        'America/Indiana/Petersburg',
        'America/Indiana/Vevay',
        'America/Chicago',
        'America/Indiana/Tell_City',
        'America/Indiana/Knox',
        'America/Menominee',
        'America/North_Dakota/Center',
        'America/North_Dakota/New_Salem',
        'America/North_Dakota/Beulah',
        'America/Denver',
        'America/Boise',
        'America/Phoenix',
        'America/Los_Angeles',
        'America/Anchorage',
        'America/Juneau',
        'America/Sitka',
        'America/Metlakatla',
        'America/Yakutat',
        'America/Nome',
        'America/Adak',
        'Pacific/Honolulu',
        'America/Montevideo',
        'Asia/Samarkand',
        'Asia/Tashkent',
        'America/Caracas',
        'Asia/Ho_Chi_Minh',
        'Pacific/Efate',
        'Pacific/Wallis',
        'Pacific/Apia',
        'Africa/Johannesburg',
    ];
}
/*
let y = {};
libx.Time.TimeZones.map(x=> y[x] = { abbr: libx.Time.getTimeZoneName(x), offset: libx.Time.getTimezoneOffset(x) });
y
*/
