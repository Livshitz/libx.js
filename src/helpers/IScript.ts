import { IAny } from '../types/interfaces';

export interface IScript<IConf extends IConfig = any> {
    executeAsScript(config: IConfig | unknown, env: string, envConf?: unknown): Promise<void>;
}

export interface IConfig extends IAny {
    envs: {};
}
