import { libx } from 'libx.js/build/bundles/node.essentials';
import { IScript } from '../helpers/IScript';
import { log } from '../modules/log';
import Program from './Program';

const conf = {
    field: 1,
    envs: {
        prod: {
            baseUrl: 'prd',
        },
        staging: {
            baseUrl: 'stg',
        },
    },
};

// node build/Main.js --env="staging"
class Script implements IScript<typeof conf> {
    public executeAsScript(config: typeof conf, env: string = Program.args.env, envConf: typeof conf.envs.prod): Promise<void> {
        log.verbose('Script: Execute: ', 'config:', config, 'env:', env, 'envConf: ', envConf.baseUrl);
        return;
    }
}

if (libx.node.isCalledDirectly()) Program.run(new Script(), conf, Program.args.env || 'prod');
