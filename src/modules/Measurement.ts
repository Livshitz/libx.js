import { log } from "./log";

// This is a template
export class Measurement {
    private startTime: number;
    private endTime: number;
    private id: string;

    public constructor(id?: string, public options?: Partial<ModuleOptions>) {
        this.options = { ...new ModuleOptions(), ...options };
        this.id = id;
    }

    public static start(id?: string, options?: Partial<ModuleOptions>) {
        const ret = new Measurement(id, options);
        ret.start();
        return ret;
    }

    public static async measure(func: Function, id?: string, options?: Partial<ModuleOptions>) {
        const ret = Measurement.start(id, options);
        await func();
        ret.stop();
        return ret.peek();
    }

    public start() {
        this.startTime = new Date().getTime();
    }

    public stop() {
        this.endTime = new Date().getTime();
        const ret = this.peek();
        if (this.options?.autoPrint) log.d(`Measurement: ${this.id} took ${ret}ms`);
        return ret;
    }

    public reset() {
        this.start();
    }

    public peek(endTime?: Date) {
        return (endTime?.getTime() ?? this.endTime ?? new Date().getTime()) - this.startTime;
    }
}

export class ModuleOptions {
    autoPrint = false;
}
