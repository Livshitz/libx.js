import { Node, SemverPart } from '../../src/node';
import fs from 'fs';
import { objectHelpers } from '../../src/helpers/ObjectHelpers';

const envKey = 'secretKey';
const fakeProjectSettings = __dirname + '/../fakes/project-settings-open.json';
const encryptedProjectSettings = __dirname + '/../../.tmp/encrypted.json';
const mod = new Node();

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
    expect(output).toEqual({ description: '', name: 'libx.js', version: '0.7.0' });
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

test('bumpJsonVersion-positive', async () => {
    const source = __dirname + '/../fakes/package.json';
    const copy = __dirname + '/../../.tmp/package.json';
    fs.copyFileSync(source, copy);

    let output = null;

    output = await mod.bumpJsonVersion(copy, SemverPart.Replace, '0.0.0');
    expect(output).toEqual({ major: '0', minor: '7', original: '0.7.0', patch: '0', updated: '0.0.0' });

    output = await mod.bumpJsonVersion(copy);
    expect(output).toEqual({ major: '0', minor: '0', original: '0.0.0', patch: 1, updated: '0.0.1' });

    output = await mod.bumpJsonVersion(copy, SemverPart.Patch);
    expect(output).toEqual({ major: '0', minor: '0', original: '0.0.1', patch: 2, updated: '0.0.2' });

    output = await mod.bumpJsonVersion(copy, SemverPart.Minor);
    expect(output).toEqual({ major: '0', minor: 1, original: '0.0.2', patch: '0', updated: '0.1.0' });

    output = await mod.bumpJsonVersion(copy, SemverPart.Major);
    expect(output).toEqual({ major: 1, minor: '0', original: '0.1.0', patch: '0', updated: '1.0.0' });
});

test('getFilenameWithoutExtension-positive', () => {
    const param = __dirname + '/../fakes/package.json';
    const output = mod.getFilenameWithoutExtension(param);
    expect(output).toEqual('package');
});

test('readJson-positive', () => {
    const param = __dirname + '/../fakes/package.json';
    const output = mod.readJson(param);
    expect(output).toEqual({ description: '', name: 'libx.js', version: '0.7.0' });
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
