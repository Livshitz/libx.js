import { Node } from '../../src/node';
import fs from 'fs';
import { objectHelpers } from '../../src/helpers/ObjectHelpers';
import { Crypto } from '../../src/modules/Crypto';
import { SemverPart } from '../../src/helpers';

const envKey = 'secretKey';
const fakeProjectSettings = __dirname + '/../fakes/project-settings-open.json';
const encryptedProjectSettings = __dirname + '/../../.tmp/encrypted.json';
const mod = new Node();

beforeAll(async () => {
    mod.mkdirRecursiveSync(__dirname + '/../../.tmp');
});
beforeEach(() => {});

test('encryptFile-positive', () => {
    let output = mod.encryptFile(fakeProjectSettings, envKey, encryptedProjectSettings);
    expect(output).not.toEqual(null);
});

test('encryptFile-positive', () => {
    const decryptedFile = __dirname + '/../../.tmp/decrypted.json';
    let output = mod.decryptFile(encryptedProjectSettings, envKey, decryptedFile);
    const original = fs.readFileSync(fakeProjectSettings)?.toString();
    expect(output).toEqual(original);
});

test('getFiles-positive', async () => {
    let output = await mod.getFiles(__dirname + '/../fakes/*.*');
    expect(output).not.toEqual(null);
    expect(objectHelpers.isArray(output)).toEqual(true);
});

test('isCalledDirectly-positive', () => {
    let output = mod.isCalledDirectly();
    expect(output).toEqual(true);
});

test('getLibxVersion-positive', () => {
    let output = mod.getLibxVersion(__dirname + '/../../package.json');
    expect(output).toMatch(/\d+\.\d+\.\d+/);
});

test('readPackageJson-positive', () => {
    let output = mod.readPackageJson(__dirname + '/../fakes/package.json');
    expect(output).toEqual({ description: '', name: 'libx.js', version: '0.7.10' });
});

test('exec-positive', async () => {
    let output = await mod.exec('date -u +"%FT%T.000Z"');
    const date = new Date(output);
    expect(typeof date.getDate).toEqual('function');
});

test('exec-array-positive', async () => {
    let output = await mod.exec(['echo "hey!"', 'date -u +"%FT%T.000Z"'], true);
    const date = new Date(output);
    expect(typeof date.getDate).toEqual('function');
});

describe('bumpJsonVersion', () => {
    const source = __dirname + '/../fakes/package.json';
    const copy = __dirname + '/../../.tmp/package.json';

    test('bumpJsonVersion-replace', async () => {
        fs.copyFileSync(source, copy);
        let output = null;

        output = await mod.bumpJsonVersion(copy, 'replace', '0.0.0');
        expect(output).toEqual({ major: '0', minor: '0', patch: '0', original: '0.7.10', updated: '0.0.0' });
    });

    test('bumpJsonVersion-patch-implicit', async () => {
        fs.copyFileSync(source, copy);
        let output = null;

        output = await mod.bumpJsonVersion(copy);
        expect(output).toEqual({ major: '0', minor: '7', patch: '11', original: '0.7.10', updated: '0.7.11' });
    });

    test('bumpJsonVersion-patch', async () => {
        fs.copyFileSync(source, copy);
        let output = null;

        output = await mod.bumpJsonVersion(copy, SemverPart.Patch);
        expect(output).toEqual({ major: '0', minor: '7', patch: '11', original: '0.7.10', updated: '0.7.11' });
    });

    test('bumpJsonVersion-minor', async () => {
        fs.copyFileSync(source, copy);
        let output = null;

        output = await mod.bumpJsonVersion(copy, SemverPart.Minor);
        expect(output).toEqual({ major: '0', minor: '8', patch: '0', original: '0.7.10', updated: '0.8.0' });
    });

    test('bumpJsonVersion-major', async () => {
        fs.copyFileSync(source, copy);
        let output = null;

        output = await mod.bumpJsonVersion(copy, SemverPart.Major);
        expect(output).toEqual({ major: '1', minor: '0', patch: '0', original: '0.7.10', updated: '1.0.0' });
    });
});

test('getFilenameWithoutExtension-positive', () => {
    const param = __dirname + '/../fakes/package.json';
    const output = mod.getFilenameWithoutExtension(param);
    expect(output).toEqual('package');
});

test('readJson-positive', () => {
    const param = __dirname + '/../fakes/package.json';
    const output = mod.readJson(param);
    expect(output).toEqual({ description: '', name: 'libx.js', version: '0.7.10' });
});

test('readJsonStripComments-positive', () => {
    const param = __dirname + '/../fakes/withComments.json';
    const output = mod.readJsonStripComments(param);
    expect(output).toEqual({ name: 'libx.js', version: '0.7.0' });
});

test('mkdirRecursiveSync-positive', () => {
    const tmp = __dirname + '/../../.tmp/';
    const param = tmp + 'test/a/b';
    expect(fs.existsSync(param)).toEqual(false);
    const output = mod.mkdirRecursiveSync(param);
    expect(fs.existsSync(param)).toEqual(true);
});

test('rmdirRecursiveSync-positive', () => {
    const tmp = __dirname + '/../../.tmp/';
    const param = tmp + 'test';
    const output = mod.rmdirRecursiveSync(param);
    expect(fs.existsSync(param)).toEqual(false);
});

const prepareProjectConfig = ({ sourceFolder, projectFileName, tmp, projectSecretsOpenFileName = null, secret = null }) => {
    fs.copyFileSync(sourceFolder + projectFileName, tmp + projectFileName);
    let projectSecrets = null;
    if (projectSecretsOpenFileName != null) {
        fs.copyFileSync(sourceFolder + projectSecretsOpenFileName, tmp + projectSecretsOpenFileName);
        projectSecrets = Crypto.encrypt(fs.readFileSync(tmp + projectSecretsOpenFileName).toString(), secret);
        fs.writeFileSync(tmp + '/project-secrets.json', projectSecrets);
    }
};

test('getProjectConfig-simple-positive', () => {
    const tmp = __dirname + '/../../.tmp/';
    const secret = 'mySecret';

    // prepare: move working files to '.tmp' folder:
    prepareProjectConfig({
        sourceFolder: __dirname + '/../fakes',
        projectFileName: '/project.json',
        projectSecretsOpenFileName: '/project-secrets-open.json',
        tmp,
        secret,
    });

    const output = mod.getProjectConfig('dev', tmp, secret);
    const expected = {
        projectName: 'libx',
        projectCaption: 'Libx.js',
        version: '0.0.1',
        'formatable-internal': 'version=0.0.1',
        'formatable-secret': 'topLevelSecret=123',
        private: {
            debugPort: 1234,
            'some-token': 'dev-token',
            someUrl: 'http://dev.domain.com',
        },
        env: 'dev',
        someUrl: 'http://dev.domain.com:1234',
        topLevelSecret: '123',
    };
    expect(output).toEqual(expected);
});

test('getProjectConfig-prod-positive', () => {
    const tmp = __dirname + '/../../.tmp/';
    const secret = 'mySecret';

    // prepare: move working files to '.tmp' folder:
    prepareProjectConfig({
        sourceFolder: __dirname + '/../fakes',
        projectFileName: '/project.json',
        projectSecretsOpenFileName: '/project-secrets-open.json',
        tmp,
        secret,
    });

    const output = mod.getProjectConfig('prod', tmp, secret);
    const expected = {
        projectName: 'libx',
        projectCaption: 'Libx.js',
        version: '0.0.1',
        'formatable-internal': 'version=0.0.1',
        'formatable-secret': 'topLevelSecret=123',
        private: {
            debugPort: 1234,
            'some-token': 'prod-token',
            someUrl: 'http://prod.domain.com',
        },
        env: 'prod',
        someUrl: 'http://prod.domain.com',
        topLevelSecret: '123',
    };
    expect(output).toEqual(expected);
});

test('getProjectConfig-noSecrets-positive', () => {
    const tmp = __dirname + '/../../.tmp/';

    // prepare: move working files to '.tmp' folder:
    prepareProjectConfig({
        sourceFolder: __dirname + '/../fakes',
        projectFileName: '/project.json',
        tmp,
    });

    const output = mod.getProjectConfig('dev', tmp);
    const expected = {
        projectName: 'libx',
        projectCaption: 'Libx.js',
        version: '0.0.1',
        'formatable-internal': 'version=0.0.1',
        'formatable-secret': 'topLevelSecret={{topLevelSecret}}',
        private: {
            debugPort: 1234,
            'some-token': '[Will be overriden by project-secrets.json]',
        },
        env: 'dev',
        someUrl: 'http://dev.domain.com:1234',
    };
    expect(output).toEqual(expected);
});
