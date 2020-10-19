// Run: ts-node tests/mockServer.ts

import fs from 'fs';
import express from 'express';
import formidable from 'express-formidable';

import { node } from '../../src/node';
import { network } from '../../src/modules/network';
import { helpers } from '../../src/helpers';
import { log, LogLevel } from '../../src/modules/log';

log.filterLevel = LogLevel.Info;
node.catchErrors();

class mod {
    private app: any;
    private server: any;
    public options = {
        port: 5678,
        endpoint: null,
        uploadFolder: './.tmp/uploads',
        verbose: false,
    };

    constructor(options = {}) {
        this.options = helpers.ObjectHelpers.merge(options, this.options);
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
            log.v('request: "/echoFormdata": req.fields: ', req.data);
            res.status(200).send(JSON.stringify(data));
            log.v('----------');
        });
        app.post('/echoUpload', (req, res) => {
            let data = req.body || req.fields || req.files;
            let file = null;
            let content = null;
            log.v('request: "/echoUpload": req.fields: ', req.fields);
            log.v('request: "/echoUpload": req.files: ', helpers.jsonify(req.files, true));
            if (req.files) {
                content = fs.readFileSync(req.files.file.path).toString();
                fs.writeFileSync(this.options.uploadFolder + '/' + 'tmp_' + req.files.file.name, content);
            }
            res.status(200).json({ data: data, size: req.files.file.size, content: content });
            log.v('----------');
        });
        this.server = app.listen(this.options.port, () => {
            log.i(`Local express server listening on ${this.options.endpoint}`);
            p.resolve(this.options.endpoint);
        });
        await network.httpGet(this.options.endpoint); // wait for express to be ready

        return p;
    };

    stop = () => {
        this.server.close();
    };
}

if (node.isCalledDirectly()) {
    let server = new mod();
    server.options.verbose = true;

    node.onExit(() => {
        log.i('mockServer:cli: shutting down server...');
        server.stop();
    });

    (async () => {
        await server.run();
        log.i('ready!');
    })();
}

export default mod;
