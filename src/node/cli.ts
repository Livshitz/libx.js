import { log } from '../modules/log';
import { node } from './index';
log.isShowStacktrace = false;

log.verbose('libx.node.cli: Starting...');

if (node.args.bump) {
	var filePath = node.args._[0];
	var releaseType = node.args.bump;
	var res = node.bumpNpmVersion(filePath, releaseType);
	log.info(releaseType, filePath, res)
}

log.info('libx.node.cli: Done');
