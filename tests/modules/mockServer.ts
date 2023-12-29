// Run: ts-node tests/mockServer.ts
import fs from 'fs';
import express from 'express';
import formidable from 'express-formidable';
import { node } from '../../src/node';
import { network } from '../../src/modules/Network';
import { helpers } from '../../src/helpers';
import { log, LogLevel } from '../../src/modules/log';
import { objectHelpers } from '../../src/helpers/ObjectHelpers';
import { Server } from 'http';
import { Socket } from 'net';

log.filterLevel = LogLevel.Info;
node.catchErrors();

class mod {
    private app: any;
    private server: Server;
    private openSockets = new Set<Socket>();
    public options = {
        port: 5678,
        endpoint: null,
        uploadFolder: './.tmp/uploads',
        verbose: false,
    };

    constructor(options = {}) {
        this.options = objectHelpers.merge(options, this.options);
        this.options.endpoint = `http://localhost:${this.options.port}/`;
        node.mkdirRecursiveSync(this.options.uploadFolder);
    }

    run = async () => {
        let p = helpers.newPromise();
        let app = (this.app = express());
        // app.use(bodyParser.json());
        // app.use(bodyParser.urlencoded({ extended: true }));

        app.use(
            formidable({
                encoding: 'utf-8',
                uploadDir: this.options.uploadFolder,
                multiples: false, // req.files to be arrays of files
            })
        );

        app.get('/', (req, res) => {
            log.v('request "/": ');
            res.status(200).send('OK');
            log.v('----------');
        });
        app.all('/echoParams', (req, res) => {
            log.v('request: "/echoParams": ', req.query);
            res.status(200).send(JSON.stringify(req.query));
            log.v('----------');
        });
        app.all('/echoBody', (req, res) => {
            let data = req.body || req.fields;
            log.v('request: "/echoBody": ', data);
            res.status(200).send(JSON.stringify(data));
            log.v('----------');
        });
        app.post('/echoFormdata', (req, res) => {
            let data = req.body || req.fields || req.files;
            log.v('request: "/echoFormdata": req.fields: ', data);
            res.status(200).send(JSON.stringify(data));
            log.v('----------');
        });
        app.all('/stream/:interval?', async (req, res) => {
            let interval = parseInt(req.params.interval ?? '1000');
            let data = req.body || req.fields || req.files;
            log.v('request: "/stream": req.fields: ', data);

            res.writeHead(200, {
                // "Connection": "keep-alive",
                // "Cache-Control": "no-cache",
                "Content-Type": "text/event-stream; charset=utf-8",
            });
            res.on("close", () => {
                res.end();
            });

            const messages = [
                'hello',
                'world,',
                'you',
                'rock!',
                interval,
            ];
            const pAll = [];
            helpers.each(messages, (x, i) => {
                const p = helpers.newPromise();
                setTimeout(() => {
                    const event = 'message';
                    // res.write(x.toString());
                    res.write("event: " + String(event) + "\n" + "data: " + JSON.stringify(x) + "\n\n");
                    p.resolve();
                }, i * interval);
                pAll.push(p);
            });
            Promise.all(pAll).then(() => {
                res.end();
            });

            log.v('----------');
        });
        app.post('/echoUpload', (req, res) => {
            let data = req.body || req.fields || req.files;
            const files = req.files as { [fieldname: string]: any };
            let file = null;
            let content = null;
            log.v('request: "/echoUpload": req.fields: ', req.fields);
            log.v('request: "/echoUpload": req.files: ', helpers.jsonify(files, true));
            if (req.files) {
                content = fs.readFileSync(files.file.path).toString();
                fs.writeFileSync(this.options.uploadFolder + '/' + 'tmp_' + files.file.name, content);
            }
            res.status(200).json({ data: data, size: files.file.size, content: content });
            log.v('----------');
        });
        this.server = app.listen(this.options.port, () => {
            log.v(`Local express server listening on ${this.options.endpoint}`);
            p.resolve(this.options.endpoint);
        });
        this.server.on("connection", socket => {
            this.openSockets.add(socket);
            socket.on("close", () => {
                this.openSockets.delete(socket);
            });
        });

        await network.httpGet(this.options.endpoint); // wait for express to be ready

        return p;
    };

    stop = () => {
        log.v('mockServer: stopping...');
        for (const socket of this.openSockets.values()) {
            log.v('mockServer: killing socket...');
            socket.destroy();
        }
        this.server.close();
        log.i('mockServer: stopped!');
    };
}

if (node.isCalledDirectly()) {
    log.i('mockServer:cli: starting server...');
    let server = new mod();
    server.options.verbose = true;

    node.onExit(() => {
        log.i('mockServer:cli: shutting down server...');
        server.stop();
    });

    (async () => {
        const url = await server.run();
        log.i('ready on ', url);
    })();
}

export default mod;
