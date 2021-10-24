import { Node } from '.';
import { libx } from '../bundles/node.essentials';
import { IConfig, IScript } from '../helpers/IScript';
import { argv } from 'yargs';
import { log } from '../modules/log';

export default class Program {
    public static args: any = argv;

    public static async run<TConfig = null>(script: IScript<IConfig>, config: IConfig = null, env: string = null) {
        let error: Error = null;

        const envConfig = config?.envs?.[env];

        try {
            await script.executeAsScript(config, env, envConfig);
        } catch (err) {
            error = err;
        } finally {
            if (error) {
                libx.log.fatal('Program: Fatal error: \n ', error);
                return process.exit(1);
            }
            process.exit(0);
        }
    }

    public static async execute<T = any>(execute: () => Promise<T>) {
        let error: Error = null;

        try {
            await execute();
            log.verbose('DONE');
        } catch (err) {
            error = err;
        } finally {
            let errorCode = 0;
            if (error) {
                log.error('----- \n [!] Failed: ', error);
                errorCode = 1;
            }

            if (require.main === module) process.exit(errorCode);
        }
    }
}
