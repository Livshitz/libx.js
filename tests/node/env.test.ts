import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { loadEnv } from '../../src/node/env';

const tmpDir = path.join(__dirname, '../../.tmp/dotenv-test');
const envFile = path.join(tmpDir, '.env');
const envProdFile = path.join(tmpDir, '.env.production');
const envLocalFile = path.join(tmpDir, '.env.local');

function write(file: string, content: string) {
	fs.mkdirSync(tmpDir, { recursive: true });
	fs.writeFileSync(file, content);
}
function cleanup() {
	[envFile, envProdFile, envLocalFile].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
	if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir);
}

describe('loadEnv', () => {
	beforeEach(() => {
		cleanup();
		Object.keys(process.env).forEach(k => { if (k.startsWith('DOTENV_')) delete process.env[k]; });
	});
	afterEach(cleanup);

	test('loads .env file', () => {
		write(envFile, 'DOTENV_A=1\nDOTENV_B=2');
		const env = loadEnv({ path: envFile });
		expect(env).toEqual({ DOTENV_A: '1', DOTENV_B: '2' });
		expect(process.env.DOTENV_A).toBe('1');
		expect(process.env.DOTENV_B).toBe('2');
	});

	test('loads .env and .env.<env> and merges', () => {
		write(envFile, 'DOTENV_A=1\nDOTENV_B=2');
		write(envProdFile, 'DOTENV_B=3\nDOTENV_C=4');
		const env = loadEnv({ path: [envFile, envProdFile] });
		expect(env).toEqual({ DOTENV_A: '1', DOTENV_B: '3', DOTENV_C: '4' });
		expect(process.env.DOTENV_B).toBe('3');
		expect(process.env.DOTENV_C).toBe('4');
	});

	test('loads by env arg', () => {
		write(envFile, 'DOTENV_A=1');
		write(envProdFile, 'DOTENV_A=2');
		const env = loadEnv({ env: 'production', cwd: tmpDir });
		expect(env).toEqual({ DOTENV_A: '2' });
		expect(process.env.DOTENV_A).toBe('2');
	});

	test('quoted values and comments', () => {
		write(envFile, 'DOTENV_A="hello world"\n# comment\nDOTENV_B=42');
		const env = loadEnv({ path: envFile });
		expect(env).toEqual({ DOTENV_A: 'hello world', DOTENV_B: '42' });
	});

	test('does not overwrite existing process.env', () => {
		process.env.DOTENV_A = 'existing';
		write(envFile, 'DOTENV_A=1\nDOTENV_B=2');
		const env = loadEnv({ path: envFile });
		expect(process.env.DOTENV_A).toBe('existing');
		expect(process.env.DOTENV_B).toBe('2');
	});

	test('multiline quoted values', () => {
		write(envFile, 'DOTENV_ML="line1\nline2\nline3"');
		const env = loadEnv({ path: envFile });
		expect(env.DOTENV_ML).toBe('line1\nline2\nline3');
	});

	test('multiline quoted values (real multiline)', () => {
		write(envFile, 'DOTENV_ML="line1\nline2\nline3\nlastline"');
		const env = loadEnv({ path: envFile });
		expect(env.DOTENV_ML).toBe('line1\nline2\nline3\nlastline');
	});

	test('escaped characters', () => {
		write(envFile, 'DOTENV_ESC="line1\\nline2\\tTab\\rCR\\\\Backslash\\\"Quote\\\'SQuote"');
		const env = loadEnv({ path: envFile });
		expect(env.DOTENV_ESC).toBe('line1\nline2\tTab\rCR\\Backslash\"Quote\'SQuote');
	});

	test('export keyword', () => {
		write(envFile, 'export DOTENV_EXP=exported');
		const env = loadEnv({ path: envFile });
		expect(env.DOTENV_EXP).toBe('exported');
	});

	test('inline comments', () => {
		write(envFile, 'DOTENV_CMT=foo # this is a comment');
		const env = loadEnv({ path: envFile });
		expect(env.DOTENV_CMT).toBe('foo');
	});

	test('variable expansion: $VAR and ${VAR}', () => {
		write(envFile, 'DOTENV_A=foo\nDOTENV_B=$DOTENV_A\nDOTENV_C=${DOTENV_A}_bar');
		const env = loadEnv({ path: envFile });
		expect(env.DOTENV_B).toBe('foo');
		expect(env.DOTENV_C).toBe('foo_bar');
	});

	test('variable expansion: from process.env', () => {
		process.env.DOTENV_X = 'fromenv';
		write(envFile, 'DOTENV_Y=$DOTENV_X');
		const env = loadEnv({ path: envFile });
		expect(env.DOTENV_Y).toBe('fromenv');
		delete process.env.DOTENV_X;
	});

	test('variable expansion: fallback to empty string', () => {
		write(envFile, 'DOTENV_Z=$NOT_DEFINED');
		const env = loadEnv({ path: envFile });
		expect(env.DOTENV_Z).toBe('');
	});
}); 