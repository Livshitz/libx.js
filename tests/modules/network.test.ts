import { extensions } from '../../src/extensions/';
import { helpers } from '../../src/helpers';
import { di } from '../../src/modules/dependencyInjector';
import { log } from '../../src/modules/log';
import { IModuleNetwork } from '../../src/types/interfaces';
/**
 * @jest-environment node
 */

log.isShowStacktrace = false;
extensions.applyAllExtensions();

import mockServer from './mockServer';

describe('libx:modules:network tests', () => {
    let dataset: any = {};
    let url = null;
    let networkModule: IModuleNetwork = null;
    let server = new mockServer();

    beforeAll(async (done) => {
        networkModule = di.get<IModuleNetwork>('network');

        url = await server.run();

        done();
    });

    test('module-network-httpRequest-positive', async (done) => {
        let res: Buffer = await networkModule.httpRequest(url, null, 'GET');
        expect(res.toString()).toBe('OK');
        done();
    });

    test('module-network-httpGet-positive', async (done) => {
        let res: Buffer = await networkModule.httpGet(url);
        expect(res.toString()).toBe('OK');
        done();
    });

    test('module-network-httpGetString-positive', async (done) => {
        let res = await networkModule.httpGetString(url);
        expect(res).toBe('OK');
        done();
    });

    test('module-network-echoParams-httpGet-positive', async (done) => {
        let res: Buffer = await networkModule.httpGet(url + '/echoParams/' + '?a=1&b=2');
        expect(Buffer.compare(res, Buffer.from('{"a":"1","b":"2"}'))).toBe(0);
        done();
    });

    test('module-network-echoParams-get-positive', async (done) => {
        log.v('- echoParams-get-positive');
        let res: Buffer = await networkModule.get(url + '/echoParams/' + '?a=1&b=2');
        expect(Buffer.compare(res, Buffer.from('{"a":"1","b":"2"}'))).toBe(0);
        done();
    });

    test('module-network-echoParams-httpGetString-positive', async (done) => {
        let res: String = await networkModule.httpGetString(url + '/echoParams/' + '?a=1&b=2');
        expect(res).toEqual('{"a":"1","b":"2"}');
        done();
    });
    test('module-network-echoParams-httpGetJson-positive', async (done) => {
        let res: Object = await networkModule.httpGetJson(url + '/echoParams/' + '?a=1&b=2');
        expect(res).toEqual({ a: '1', b: '2' });
        done();
    });
    test('module-network-echoParams-httpPost-positive', async (done) => {
        let res = await networkModule.httpPost(url + '/echoParams/' + '?a=1&b=2', null);
        expect(Buffer.compare(res, Buffer.from('{"a":"1","b":"2"}'))).toBe(0);
        done();
    });
    test('module-network-echoParams-httpPostJson-positive', async (done) => {
        let res = await networkModule.httpPostJson(url + '/echoParams/' + '?a=1&b=2', null);
        expect(res).toEqual({ a: '1', b: '2' });
        done();
    });

    test('module-network-echoBody-httpPostJson-positive', async (done) => {
        let res = await networkModule.httpPostJson(url + '/echoBody/', { a: 1, b: 2 });
        expect(res).toEqual({ a: 1, b: 2 });
        done();
    });

    test('module-network-echoFormData-post-positive', async (done) => {
        let formData = {
            a: '1',
            b: '2',
        };

        let res = await networkModule.post(url + 'echoFormdata', formData);
        expect(JSON.parse(res.toString())).toEqual({ a: '1', b: '2' });
        done();
    });
    test('module-network-echoFormData-get-positive', async (done) => {
        let res = await networkModule.get(url + 'echoParams', { a: 1, b: 2 });
        expect(JSON.parse(res)).toEqual({ a: '1', b: '2' });
        done();
    });
    test('module-network-echoFormData-upload-positive', async (done) => {
        let fs = require('fs');
        let filePath = __dirname + '/../../LICENSE';
        let fileStats = fs.statSync(filePath);
        let buffer = fs.createReadStream(filePath);

        let params = {
            a: '1',
            b: '2',
        };

        let res = await networkModule.upload(url + 'echoUpload', buffer, {
            data: params,
        });

        let content = (await helpers.fileStreamToBuffer(fs.createReadStream(filePath))).toString();

        expect(res).toEqual({
            data: {
                a: '1',
                b: '2',
            },
            size: fileStats.size,
            content: content,
        });
        done();
    });

    // test('module-network-getFormData-positive', () => {
    // 	const param = { a: 1 };
    // 	const output = networkModule.getFormData(param);
    // 	expect(output).toEqual(true);
    // });

    afterAll((done) => {
        console.log('mockServer:cli: shutting down server...');
        server.stop();
    });

    /*
		beforeAll(() => {
			mongoDB.connect();
		});
		afterAll((done) => {
			mongoDB.disconnect(done);
		});
	*/
});
