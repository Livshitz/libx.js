export class NumberExtensions {
    public static toFixedNum = function (digits = 2, base = 10) {
        var pow = Math.pow(base || 10, digits);
        return Math.round(this * pow) / pow;
    };
}

export const numberExtensions = new NumberExtensions();
