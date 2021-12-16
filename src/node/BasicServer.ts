import express, { Express, Router } from 'express';
import cors from 'cors';
import { Server } from 'http';
import { libx } from '../bundles/essentials';
import { log } from '../modules/log';

export class BasicServer {
    public app: Express;
    public server: Server;
    public mainRouter: Router;

    public constructor(public options?: Partial<ModuleOptions>) {
        this.options = { ...new ModuleOptions(), ...options };
        this.mainRouter = express.Router();

        this.app = express();
        this.app.use(cors());

        // this.mainRouter.get('/', (req, res) => {
        //     res.send('hello');
        // });
        this.app.use(this.mainRouter);
    }

    public async init() {
        const p = libx.newPromise();
        this.server = this.app.listen(this.options.port, () => {
            log.v(`BasicServerServer listening on port ${this.options.port}`);
            p.resolve(this.options.port);
        });
        return p;
    }

    public close() {
        this.server?.close();
    }
}

export class ModuleOptions {
    port = 3000;
}
