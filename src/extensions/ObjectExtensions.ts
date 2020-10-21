import { objectHelpers } from '../helpers/ObjectHelpers';

export class ObjectExtensions {
    public static __getCustomProperties = function () {
        return objectHelpers.getCustomProperties(this);
    };

    public static __extend = function <T1 = any, T2 = any>(withObj: T2): T1 & T2 {
        return objectExtensions.extend(this, withObj);
    };

    public extend<T1 = any, T2 = any>(input: T1, withObj: T2): T1 & T2 {
        for (let key of ObjectExtensions.__getCustomProperties.call(withObj)) {
            input[key] = withObj[key];
        }
        for (let key of ObjectExtensions.__getCustomProperties.call((<any>withObj).__proto__)) {
            input[key] = (<any>withObj).__proto__[key];
        }
        return input as T1 & T2;
    }
}

export const objectExtensions = new ObjectExtensions();
