import { IAny } from '../types/interfaces';

export interface IScript<IConf extends IConfig> {
    executeAsScript(config: IConfig | unknown, env: string, envConf?: unknown): Promise<void>;
}

export interface IConfig extends IAny {
    envs: {};
}
