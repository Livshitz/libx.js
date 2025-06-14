import fs from 'fs';
import path from 'path';
import { objectHelpers } from '../helpers/ObjectHelpers';

/**
 * Loads environment variables from .env files into process.env, similar to dotenv.
 *
 * @param opts Optional options:
 *   - env: string? (if supplied, loads .env.<env>)
 *   - path: string | string[]? (override .env path(s), merge in order)
 *   - cwd: string? (base directory, default process.cwd())
 * @returns {Record<string, string>} The loaded env variables as an object
 *
 * Usage:
 *   loadEnv();
 *   loadEnv({ env: 'production' });
 *   loadEnv({ path: ['.env', '.env.local'] });
 */
export function loadEnv(opts?: {
	env?: string;
	path?: string | string[];
	cwd?: string;
}): Record<string, string> {
	const cwd = opts?.cwd || process.cwd();
	let paths: string[] = [];

	if (opts?.path) {
		paths = Array.isArray(opts.path) ? opts.path : [opts.path];
	} else {
		paths = [path.join(cwd, '.env')];
		if (opts?.env) {
			paths.push(path.join(cwd, `.env.${opts.env}`));
		}
	}

	const envObj: Record<string, string> = {};

	for (const p of paths) {
		if (!fs.existsSync(p)) continue;
		const content = fs.readFileSync(p, 'utf8');
		const parsed = parseEnv(content);
		objectHelpers.merge(envObj, parsed);
	}

	// Apply to process.env
	for (const k in envObj) {
		if (Object.prototype.hasOwnProperty.call(envObj, k) && (process.env[k] === undefined)) {
			process.env[k] = envObj[k];
		}
	}

	return envObj;
}

/**
 * Parse .env file content into an object.
 * Handles comments, quoted values, multiline values, export keyword, inline comments, escaped characters, and variable expansion.
 */
function parseEnv(src: string): Record<string, string> {
	const out: Record<string, string> = {};
	const lines = src.split(/\r?\n/);
	let i = 0;
	while (i < lines.length) {
		let line = lines[i].trim();
		if (!line || line.startsWith('#')) { i++; continue; }

		// Support export keyword
		if (line.startsWith('export ')) line = line.slice(7).trim();

		const eqIdx = line.indexOf('=');
		if (eqIdx === -1) { i++; continue; }
		let key = line.slice(0, eqIdx).trim();
		let val = line.slice(eqIdx + 1).trim();

		// Handle multiline quoted values
		if ((val.startsWith('"') && !val.endsWith('"')) || (val.startsWith("'") && !val.endsWith("'"))) {
			const quote = val[0];
			val = val.slice(1) + '\n';
			i++;
			while (i < lines.length) {
				let nextLine = lines[i];
				val += nextLine + '\n';
				if (nextLine.trim().endsWith(quote)) {
					val = val.slice(0, -1); // remove last \n
					val = val.slice(0, -(quote.length)); // remove closing quote
					break;
				}
				i++;
			}
			val = val.replace(/\\n/g, '\n');
		} else {
			// Remove surrounding quotes
			if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
				val = val.slice(1, -1);
			}
		}

		// Remove inline comments (only if not quoted)
		if (!(val.startsWith('"') || val.startsWith("'"))) {
			const hashIdx = val.indexOf(' #');
			if (hashIdx !== -1) val = val.slice(0, hashIdx).trim();
			else {
				const hashIdx2 = val.indexOf('#');
				if (hashIdx2 === 0) val = '';
				else if (hashIdx2 > 0 && /\s/.test(val[hashIdx2 - 1])) val = val.slice(0, hashIdx2).trim();
			}
		}

		// Unescape escaped characters
		val = val.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r').replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\');

		// Variable expansion: $VAR or ${VAR}
		val = val.replace(/\$\{?([A-Za-z0-9_]+)\}?/g, (match, varName) => {
			if (Object.prototype.hasOwnProperty.call(out, varName)) return out[varName];
			if (typeof process !== 'undefined' && process.env[varName] !== undefined) return process.env[varName];
			return '';
		});

		out[key] = val;
		i++;
	}
	return out;
}
