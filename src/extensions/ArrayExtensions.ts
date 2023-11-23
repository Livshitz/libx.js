export class ArrayExtensions {
    public static diff = function (a, fn) {
        return this.filter(function (i) {
            return a.indexOf(i) < 0;
        });
    };

    public static myFilter = function (fn) {
        var ret = [];
        for (var item of this) {
            if (fn(item)) ret.push(item);
        }
        return ret;
    };

    public static contains = function (item) {
        return this.indexOf(item) != -1;
    };

    public static myFilterSingle = function (fn) {
        var ret = null;
        for (var item of this) {
            if (fn(item)) {
                ret = item;
                break;
            }
        }
        return ret;
    };

    public static remove = function (item) {
        var index = this.indexOf(item);
        if (index > -1) {
            this.splice(index, 1);
        }
        return this;
    };

    public static removeAt = function (index: number, replace = undefined) {
        if (index > -1 && this?.length > index) {
            if (replace) this.splice(index, 1, replace);
            else this.splice(index, 1);
        }
        return this;
    };

    public static move = function (from: number, to: number) {
        this.splice(to, 0, this.splice(from, 1)[0]);
        return this;
    };

    public static last = function (pos = -1) {
        if (this == null || this.length == 0) return null;
        if (pos == 0) pos = -1;
        return this[this.length + pos];
    };


    public static removeDuplicates = function () {
        if (this == null || this.length == 0) return null;
        const arr: any[] = this;
        return [...new Set(arr)];
    }
}
